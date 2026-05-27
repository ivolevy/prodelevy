import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { matchText } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured.' }, { status: 500 });
    }

    const prompt = `Analizá el siguiente partido del Mundial de la FIFA 2026 y sugerí un marcador predicho con un breve análisis táctico muy minimalista (máximo 40 palabras, en español rioplatense/argentino, sin emojis, estilo serio de revista de deportes de lujo): ${matchText}`;

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
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150
          }
        }),
      }
    );

    const data = await response.json();
    const predictionText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo generar el análisis en este momento.';

    return NextResponse.json({ result: predictionText.trim() });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
