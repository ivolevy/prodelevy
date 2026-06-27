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
              cache: 'no-store'
            });

            if (response.ok) {
              const data = await response.json();
              if (data.matches && Array.isArray(data.matches)) {
                syncedResults = dbMatches.map((m: any) => {
                  let apiMatch = data.matches.find((apiM: any) => 
                    apiM.homeTeam?.tla === m.home_team_id && 
                    apiM.awayTeam?.tla === m.away_team_id
                  );
                  let isSwapped = false;

                  if (!apiMatch) {
                    apiMatch = data.matches.find((apiM: any) => 
                      apiM.homeTeam?.tla === m.away_team_id && 
                      apiM.awayTeam?.tla === m.home_team_id
                    );
                    if (apiMatch) {
                      isSwapped = true;
                    }
                  }

                  if (apiMatch) {
                    let status: 'upcoming' | 'live' | 'finished' = 'upcoming';
                    if (['IN_PLAY', 'PAUSED'].includes(apiMatch.status)) {
                      status = 'live';
                    } else if (apiMatch.status === 'FINISHED') {
                      status = 'finished';
                    }

                    let home_score = null;
                    let away_score = null;
                    let home_extra_score = null;
                    let away_extra_score = null;
                    let home_penalty_score = null;
                    let away_penalty_score = null;

                    const score = apiMatch.score;
                    const duration = score?.duration; // 'REGULAR', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'

                    if (duration === 'REGULAR') {
                      if (isSwapped) {
                        home_score = score?.fullTime?.away !== undefined ? score.fullTime.away : null;
                        away_score = score?.fullTime?.home !== undefined ? score.fullTime.home : null;
                      } else {
                        home_score = score?.fullTime?.home !== undefined ? score.fullTime.home : null;
                        away_score = score?.fullTime?.away !== undefined ? score.fullTime.away : null;
                      }
                    } else if (duration === 'EXTRA_TIME') {
                      if (isSwapped) {
                        home_score = score?.regularTime?.away !== undefined ? score.regularTime.away : (score?.fullTime?.away !== undefined ? score.fullTime.away : null);
                        away_score = score?.regularTime?.home !== undefined ? score.regularTime.home : (score?.fullTime?.home !== undefined ? score.fullTime.home : null);
                        home_extra_score = score?.fullTime?.away !== undefined ? score.fullTime.away : null;
                        away_extra_score = score?.fullTime?.home !== undefined ? score.fullTime.home : null;
                      } else {
                        home_score = score?.regularTime?.home !== undefined ? score.regularTime.home : (score?.fullTime?.home !== undefined ? score.fullTime.home : null);
                        away_score = score?.regularTime?.away !== undefined ? score.regularTime.away : (score?.fullTime?.away !== undefined ? score.fullTime.away : null);
                        home_extra_score = score?.fullTime?.home !== undefined ? score.fullTime.home : null;
                        away_extra_score = score?.fullTime?.away !== undefined ? score.fullTime.away : null;
                      }
                    } else if (duration === 'PENALTY_SHOOTOUT') {
                      if (isSwapped) {
                        home_score = score?.regularTime?.away !== undefined ? score.regularTime.away : null;
                        away_score = score?.regularTime?.home !== undefined ? score.regularTime.home : null;
                        home_extra_score = score?.extraTime?.away !== undefined ? score.extraTime.away : null;
                        away_extra_score = score?.extraTime?.home !== undefined ? score.extraTime.home : null;
                        home_penalty_score = score?.penalties?.away !== undefined ? score.penalties.away : null;
                        away_penalty_score = score?.penalties?.home !== undefined ? score.penalties.home : null;
                      } else {
                        home_score = score?.regularTime?.home !== undefined ? score.regularTime.home : null;
                        away_score = score?.regularTime?.away !== undefined ? score.regularTime.away : null;
                        home_extra_score = score?.extraTime?.home !== undefined ? score.extraTime.home : null;
                        away_extra_score = score?.extraTime?.away !== undefined ? score.extraTime.away : null;
                        home_penalty_score = score?.penalties?.home !== undefined ? score.penalties.home : null;
                        away_penalty_score = score?.penalties?.away !== undefined ? score.penalties.away : null;
                      }
                    } else {
                      // Fallback
                      if (isSwapped) {
                        home_score = score?.fullTime?.away !== undefined ? score.fullTime.away : null;
                        away_score = score?.fullTime?.home !== undefined ? score.fullTime.home : null;
                      } else {
                        home_score = score?.fullTime?.home !== undefined ? score.fullTime.home : null;
                        away_score = score?.fullTime?.away !== undefined ? score.fullTime.away : null;
                      }
                    }

                    return {
                      id: m.id,
                      home_team_id: isSwapped ? (apiMatch.awayTeam?.tla || null) : (apiMatch.homeTeam?.tla || null),
                      away_team_id: isSwapped ? (apiMatch.homeTeam?.tla || null) : (apiMatch.awayTeam?.tla || null),
                      home_score,
                      away_score,
                      home_extra_score,
                      away_extra_score,
                      home_penalty_score,
                      away_penalty_score,
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

        // 2. Try Gemini for any matches that should be finished but don't have results in syncedResults, or if Football-Data failed
        const nowMs = Date.now();
        const pendingOrMissingResults = dbMatches.filter((m: any) => {
          let timeStr = m.hora_arg || '';
          if (!timeStr.includes('-') && !timeStr.includes('+') && !timeStr.includes('Z')) {
            timeStr = timeStr + '-03:00';
          }
          const matchStart = new Date(`${m.fecha}T${timeStr}`).getTime();
          const shouldBePlayed = (nowMs - matchStart) > 2 * 60 * 60 * 1000; // 2 hours since start

          if (!shouldBePlayed) return false;

          const syncResult = syncedResults.find((sr: any) => sr.id === m.id);
          const hasScore = syncResult 
            ? (syncResult.home_score !== null && syncResult.away_score !== null)
            : (m.home_score !== null && m.away_score !== null);
          const isFinished = syncResult
            ? syncResult.status === 'finished'
            : m.status === 'finished';

          return !hasScore || !isFinished;
        });

        if (pendingOrMissingResults.length > 0 && geminiApiKey) {
          try {
            console.log(`Using Gemini to sync ${pendingOrMissingResults.length} missing matches...`);
            const matchesListText = pendingOrMissingResults
              .map((m: any) => `ID ${m.id}: ${m.home_team_id || 'TBD'} vs ${m.away_team_id || 'TBD'} (Fecha: ${m.fecha})`)
              .join('\n');

            const prompt = `Buscá en la web los resultados oficiales de la Copa del Mundo de la FIFA 2026 para los siguientes partidos:\n${matchesListText}

Si el partido es de eliminación directa (16avos, octavos, etc.) y terminó empatado en los 90 minutos, devolvé el puntaje a los 90 minutos en home_score y away_score. Además, indicá el resultado del tiempo suplementario (goles de cada equipo al final de los 120 minutos en home_extra_score y away_extra_score) y, si fue a penales, los goles convertidos en la tanda en home_penalty_score y away_penalty_score.
Si se definieron los equipos clasificados que antes estaban vacíos o null, indicá los códigos de 3 letras de los equipos en home_team_id y away_team_id.

Devolvé el resultado ÚNICAMENTE como una lista/array JSON válido sin comentarios ni código de formato. No agregues nada más que el JSON válido de la forma:
[{"id": 73, "home_team_id": "RSA", "away_team_id": "CAN", "home_score": 1, "away_score": 1, "home_extra_score": 1, "away_extra_score": 1, "home_penalty_score": 4, "away_penalty_score": 3, "status": "finished"}]`;

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
                const geminiResults = JSON.parse(cleaned);

                for (const geminiRes of geminiResults) {
                  const idx = syncedResults.findIndex((sr: any) => sr.id === geminiRes.id);
                  const newFields = {
                    home_team_id: geminiRes.home_team_id || null,
                    away_team_id: geminiRes.away_team_id || null,
                    home_score: geminiRes.home_score !== undefined ? geminiRes.home_score : null,
                    away_score: geminiRes.away_score !== undefined ? geminiRes.away_score : null,
                    home_extra_score: geminiRes.home_extra_score !== undefined ? geminiRes.home_extra_score : null,
                    away_extra_score: geminiRes.away_extra_score !== undefined ? geminiRes.away_extra_score : null,
                    home_penalty_score: geminiRes.home_penalty_score !== undefined ? geminiRes.home_penalty_score : null,
                    away_penalty_score: geminiRes.away_penalty_score !== undefined ? geminiRes.away_penalty_score : null,
                    status: geminiRes.status || 'upcoming'
                  };
                  if (idx > -1) {
                    syncedResults[idx] = {
                      ...syncedResults[idx],
                      ...newFields
                    };
                  } else {
                    syncedResults.push({
                      id: geminiRes.id,
                      ...newFields
                    });
                  }
                }
                syncSource = syncSource ? `${syncSource} + gemini` : 'gemini';
              }
            } else {
              console.warn('Gemini API failed, status:', response.status);
            }
          } catch (err) {
            console.error('Error fetching from Gemini for missing matches:', err);
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
            const extraChanged = 
              dbMatch.home_extra_score !== item.home_extra_score ||
              dbMatch.away_extra_score !== item.away_extra_score ||
              dbMatch.home_penalty_score !== item.home_penalty_score ||
              dbMatch.away_penalty_score !== item.away_penalty_score;
            const teamsChanged = 
              (item.home_team_id && dbMatch.home_team_id !== item.home_team_id) || 
              (item.away_team_id && dbMatch.away_team_id !== item.away_team_id);

            if (scoreChanged || statusChanged || extraChanged || teamsChanged) {
              const updateData: any = {
                home_score: item.home_score,
                away_score: item.away_score,
                home_extra_score: item.home_extra_score,
                away_extra_score: item.away_extra_score,
                home_penalty_score: item.home_penalty_score,
                away_penalty_score: item.away_penalty_score,
                status: item.status
              };

              if (item.home_team_id) updateData.home_team_id = item.home_team_id;
              if (item.away_team_id) updateData.away_team_id = item.away_team_id;

              const { error: updateError } = await supabaseAdmin
                .from('matches')
                .update(updateData)
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
      .select('id, home_team_id, away_team_id, home_score, away_score, home_extra_score, away_extra_score, home_penalty_score, away_penalty_score, status')
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

