import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { matches } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured.' }, { status: 500 });
    }

    const matchesListText = matches
      .map((m: any) => `ID ${m.id}: ${m.home_team_id} vs ${m.away_team_id} (Fecha: ${m.fecha})`)
      .join('\n');

    const prompt = `Buscá en la web los resultados oficiales de la Copa del Mundo de la FIFA 2026 para los siguientes partidos:\n${matchesListText}\n\nDevolvé los puntajes actuales (home_score y away_score si ya jugaron o están jugando) y el estado correcto ('upcoming' si no empezó, 'live' si está en juego, 'finished' si terminó). Si no jugaron, home_score y away_score deben ser null.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "INTEGER" },
                  home_score: { type: "INTEGER", nullable: true },
                  away_score: { type: "INTEGER", nullable: true },
                  status: { type: "STRING", enum: ["upcoming", "live", "finished"] }
                },
                required: ["id", "status"]
              }
            }
          }
        }),
      }
    );

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return NextResponse.json({ error: 'Could not sync scores with AI.' }, { status: 500 });
    }

    const updatedScores = JSON.parse(resultText.trim());
    return NextResponse.json({ results: updatedScores });
  } catch (error: any) {
    console.error('Gemini Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync with Gemini.' }, { status: 500 });
  }
}
