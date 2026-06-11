import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { matches } = await req.json();
    const footballDataApiKey = process.env.FOOTBALL_DATA_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 1. Try Football-Data.org API if key is present
    if (footballDataApiKey) {
      try {
        const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
          headers: {
            'X-Auth-Token': footballDataApiKey,
          },
          next: { revalidate: 60 } // Cache for 1 minute
        });

        if (response.ok) {
          const data = await response.json();
          if (data.matches && Array.isArray(data.matches)) {
            const results = matches.map((m: any) => {
              // Find matching match in football-data by team codes (TLA)
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
              return { id: m.id, status: m.status, home_score: m.home_score, away_score: m.away_score };
            });

            return NextResponse.json({ results, source: 'football-data' });
          }
        } else {
          console.warn('Football-Data.org response was not OK, status:', response.status);
        }
      } catch (err) {
        console.error('Error fetching from Football-Data.org:', err);
      }
    }

    // 2. Fallback to Gemini AI search
    if (geminiApiKey) {
      const matchesListText = matches
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

      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (resultText) {
        let cleaned = resultText.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }
        const updatedScores = JSON.parse(cleaned);
        return NextResponse.json({ results: updatedScores, source: 'gemini' });
      }
    }

    return NextResponse.json({ error: 'No configuration found or API call failed.' }, { status: 500 });
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync matches.' }, { status: 500 });
  }
}
