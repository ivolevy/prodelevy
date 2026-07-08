const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';
const footballDataApiKey = env.FOOTBALL_DATA_API_KEY;
const geminiApiKey = env.GEMINI_API_KEY;

async function runSyncDb() {
  // Fetch from DB
  const dbRes = await fetch(`${supabaseUrl}/rest/v1/matches?select=*&order=id.asc`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const dbMatches = await dbRes.json();
  console.log(`Loaded ${dbMatches.length} matches from DB.`);

  let syncedResults = [];
  let syncSource = '';

  // 1. Try Football-Data.org API
  if (footballDataApiKey) {
    try {
      console.log('Fetching from Football-Data.org...');
      const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
        headers: {
          'X-Auth-Token': footballDataApiKey,
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.matches && Array.isArray(data.matches)) {
          syncedResults = dbMatches.map((m) => {
            let apiMatch = data.matches.find((apiM) => 
              apiM.homeTeam?.tla === m.home_team_id && 
              apiM.awayTeam?.tla === m.away_team_id
            );
            let isSwapped = false;

            if (!apiMatch) {
              apiMatch = data.matches.find((apiM) => 
                apiM.homeTeam?.tla === m.away_team_id && 
                apiM.awayTeam?.tla === m.home_team_id
              );
              if (apiMatch) {
                isSwapped = true;
              }
            }

            if (apiMatch) {
              let status = 'upcoming';
              if (['IN_PLAY', 'PAUSED'].includes(apiMatch.status)) {
                status = 'live';
              } else if (apiMatch.status === 'FINISHED') {
                status = 'finished';
              }

              let home_score = null;
              let away_score = null;

              if (isSwapped) {
                home_score = apiMatch.score?.fullTime?.away !== undefined ? apiMatch.score.fullTime.away : null;
                away_score = apiMatch.score?.fullTime?.home !== undefined ? apiMatch.score.fullTime.home : null;
              } else {
                home_score = apiMatch.score?.fullTime?.home !== undefined ? apiMatch.score.fullTime.home : null;
                away_score = apiMatch.score?.fullTime?.away !== undefined ? apiMatch.score.fullTime.away : null;
              }

              return {
                id: m.id,
                home_score,
                away_score,
                status
              };
            }
            return null;
          }).filter(Boolean);
          syncSource = 'football-data';
        }
      } else {
        console.warn('Football-Data.org API failed, status:', response.status);
      }
    } catch (err) {
      console.error('Error fetching from Football-Data.org:', err);
    }
  }

  // 2. Fallback to Gemini if Football-Data failed or wasn't configured
  if (syncedResults.length === 0 && geminiApiKey) {
    try {
      console.log('Fallback to Gemini API...');
      const matchesListText = dbMatches
        .map((m) => `ID ${m.id}: ${m.home_team_id} vs ${m.away_team_id} (Fecha: ${m.fecha})`)
        .join('\n');

      const prompt = `Buscá en la web los resultados oficiales de la Copa del Mundo de la FIFA 2026 para los siguientes partidos:\n${matchesListText}\n\nDevolvé los puntajes actuales (home_score y away_score si ya jugaron o están jugando) y el estado correcto ('upcoming' si no empezó, 'live' si está en juego, 'finished' si terminó). Si no jugaron, home_score y away_score deben ser null.\n\nDevolvé el resultado ÚNICAMENTE como una lista/array JSON válido sin comentarios ni código markdown de formato. No agregues nada más que el JSON válido de la forma: [{"id": 1, "home_score": null, "away_score": null, "status": "upcoming"}]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            tools: [
              {
                googleSearch: {}
              }
            ]
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (resultText) {
          let cleaned = resultText.trim();
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '').trim();
          }
          syncedResults = JSON.parse(cleaned);
          syncSource = 'gemini';
        }
      } else {
        console.warn('Gemini API failed, status:', response.status);
      }
    } catch (err) {
      console.error('Error fetching from Gemini:', err);
    }
  }

  console.log(`Synced results length: ${syncedResults.length} from source: ${syncSource}`);

  // 3. Update database with differences
  if (syncedResults.length > 0) {
    let updatedCount = 0;
    for (const item of syncedResults) {
      const dbMatch = dbMatches.find((m) => m.id === item.id);
      if (!dbMatch) continue;

      const scoreChanged = dbMatch.home_score !== item.home_score || dbMatch.away_score !== item.away_score;
      const statusChanged = dbMatch.status !== item.status;

      if (scoreChanged || statusChanged) {
        console.log(`Updating Match ${item.id} (${dbMatch.home_team_id} vs ${dbMatch.away_team_id}): DB Score ${dbMatch.home_score}-${dbMatch.away_score} (${dbMatch.status}) -> Synced Score ${item.home_score}-${item.away_score} (${item.status})`);
        
        // Let's do the actual update in DB
        const updateRes = await fetch(`${supabaseUrl}/rest/v1/matches?id=eq.${item.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            home_score: item.home_score,
            away_score: item.away_score,
            status: item.status
          })
        });

        if (!updateRes.ok) {
          console.error(`Failed to update match ${item.id} in DB:`, updateRes.status, await updateRes.text());
        } else {
          updatedCount++;
        }
      }
    }
    console.log(`Sync completed. Updated ${updatedCount} matches.`);
  }
}

runSyncDb();
