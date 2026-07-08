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

async function runSyncTest() {
  // 1. Fetch matches from DB
  const dbRes = await fetch(`${supabaseUrl}/rest/v1/matches?select=*&order=id.asc`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });
  const dbMatches = await dbRes.json();

  console.log('--- Football-Data API Test ---');
  if (footballDataApiKey) {
    try {
      const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
        headers: {
          'X-Auth-Token': footballDataApiKey,
        }
      });
      console.log('Football-Data response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log(`Found ${data.matches ? data.matches.length : 0} matches in Football-Data API.`);
        
        // Let's search for matches 29, 30, 31, 32
        const targetTeamIds = ['BRA', 'HAI', 'MAR', 'SCO', 'USA', 'AUS', 'PAR', 'TUR'];
        const foundApiMatches = data.matches.filter(apiM => 
          targetTeamIds.includes(apiM.homeTeam?.tla) || targetTeamIds.includes(apiM.awayTeam?.tla)
        );
        console.log('Found targets in Football-Data:', foundApiMatches.map(m => `${m.homeTeam?.tla} vs ${m.awayTeam?.tla} - Status: ${m.status} - Score: ${m.score?.fullTime?.home}-${m.score?.fullTime?.away}`));
      } else {
        console.log('Football-Data failed:', await response.text());
      }
    } catch (e) {
      console.error('Error fetching Football-Data:', e);
    }
  }

  console.log('\n--- Gemini API Test ---');
  if (geminiApiKey) {
    try {
      const matchesListText = dbMatches
        .filter(m => [29, 30, 31, 32].includes(m.id))
        .map(m => `ID ${m.id}: ${m.home_team_id} vs ${m.away_team_id} (Fecha: ${m.fecha})`)
        .join('\n');

      const prompt = `Buscá en la web los resultados oficiales de la Copa del Mundo de la FIFA 2026 para los siguientes partidos:\n${matchesListText}\n\nDevolvé los puntajes actuales (home_score y away_score si ya jugaron o están jugando) y el estado correcto ('upcoming' si no empezó, 'live' si está en juego, 'finished' si terminó). Si no jugaron, home_score y away_score deben ser null.\n\nDevolvé el resultado ÚNICAMENTE como una lista/array JSON válido sin comentarios ni código markdown de formato. No agregues nada más que el JSON válido de la forma: [{"id": 29, "home_score": 3, "away_score": 0, "status": "finished"}]`;

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

      console.log('Gemini response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('Gemini raw output:', resultText);
        if (data.candidates?.[0]?.groundingMetadata) {
          console.log('Gemini grounding info:', JSON.stringify(data.candidates[0].groundingMetadata.groundingChunks));
        }
      } else {
        console.log('Gemini failed:', await response.text());
      }
    } catch (e) {
      console.error('Error fetching Gemini:', e);
    }
  }
}

runSyncTest();
