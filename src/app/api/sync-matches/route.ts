import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Simple in-memory cache for API rate limiting
let lastSyncTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not configured.' }, { status: 500 });
    }

    const { matches: clientMatches } = await req.json();
    const now = Date.now();
    const shouldSync = (now - lastSyncTime) >= CACHE_TTL;

    if (shouldSync) {
      // Fetch latest matches from DB to compare
      const { data: dbMatches, error: dbError } = await supabaseAdmin
        .from('matches')
        .select('*')
        .order('id', { ascending: true });

      if (dbError) {
        console.error('Error fetching matches from DB for sync:', dbError);
      } else if (dbMatches && dbMatches.length > 0) {
        const footballDataApiKey = process.env.FOOTBALL_DATA_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;
        let syncedResults: any[] = [];
        let syncSource = '';

        // 1. Try Football-Data.org API
        if (footballDataApiKey) {
          try {
            const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
              headers: {
                'X-Auth-Token': footballDataApiKey,
              },
              next: { revalidate: 300 } // Cache for 5 minutes
            });

            if (response.ok) {
              const data = await response.json();
              if (data.matches && Array.isArray(data.matches)) {
                syncedResults = dbMatches.map((m: any) => {
                  const apiMatch = data.matches.find((apiM: any) => 
                    apiM.homeTeam?.tla === m.home_team_id && 
                    apiM.awayTeam?.tla === m.away_team_id
                  );

                  if (apiMatch) {
                    let status: 'upcoming' | 'live' | 'finished' = 'upcoming';
                    if (['IN_PLAY', 'PAUSED'].includes(apiMatch.status)) {
                      status = 'live';
                    } else if (apiMatch.status === 'FINISHED') {
                      status = 'finished';
                    }

                    const home_score = apiMatch.score?.fullTime?.home !== undefined ? apiMatch.score.fullTime.home : null;
                    const away_score = apiMatch.score?.fullTime?.away !== undefined ? apiMatch.score.fullTime.away : null;

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
            const matchesListText = dbMatches
              .map((m: any) => `ID ${m.id}: ${m.home_team_id} vs ${m.away_team_id} (Fecha: ${m.fecha})`)
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

        // 3. Update database with differences
        if (syncedResults.length > 0) {
          let updatedCount = 0;
          for (const item of syncedResults) {
            const dbMatch = dbMatches.find((m: any) => m.id === item.id);
            if (!dbMatch) continue;

            const scoreChanged = dbMatch.home_score !== item.home_score || dbMatch.away_score !== item.away_score;
            const statusChanged = dbMatch.status !== item.status;

            if (scoreChanged || statusChanged) {
              const { error: updateError } = await supabaseAdmin
                .from('matches')
                .update({
                  home_score: item.home_score,
                  away_score: item.away_score,
                  status: item.status
                })
                .eq('id', item.id);

              if (updateError) {
                console.error(`Failed to update match ${item.id} in DB:`, updateError);
              } else {
                updatedCount++;
              }
            }
          }
          console.log(`Sync completed successfully. Source: ${syncSource}. Updated ${updatedCount} matches.`);
          lastSyncTime = now;
        }
      }
    }

    // Always return the latest matches from the database
    const { data: latestMatches, error: fetchError } = await supabaseAdmin
      .from('matches')
      .select('id, home_score, away_score, status')
      .order('id', { ascending: true });

    if (fetchError) {
      console.error('Error fetching latest matches from DB:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch matches from DB.' }, { status: 500 });
    }

    return NextResponse.json({ results: latestMatches, source: shouldSync ? 'api-sync' : 'cache' });
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync matches.' }, { status: 500 });
  }
}

