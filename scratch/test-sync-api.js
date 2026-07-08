const fs = require('fs');
const path = require('path');

// Parse .env.local without dotenv dependency
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
    process.env[key] = value;
  }
});

async function testSync() {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  console.log('Testing Gemini API with Search (No JSON Schema in config)...');
  if (geminiApiKey) {
    try {
      // In the prompt, we instruct the model to return JSON strictly.
      const prompt = `Buscá en la web los resultados oficiales de la Copa del Mundo de la FIFA 2026 para los siguientes partidos:
ID 1: MEX vs RSA (Fecha: 2026-06-11)
ID 2: KOR vs CZE (Fecha: 2026-06-11)

Devolvé los puntajes actuales (home_score y away_score si ya jugaron o están jugando) y el estado correcto ('upcoming' si no empezó, 'live' si está en juego, 'finished' si terminó). Si no jugaron, home_score y away_score deben ser null.

Devolvé el resultado ÚNICAMENTE como una lista/array JSON válido sin comentarios ni código markdown de formato. No agregues nada más que el JSON válido.
Formato esperado:
[{"id": 1, "home_score": null, "away_score": null, "status": "upcoming"}]`;

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
            // We removed generationConfig with responseMimeType: "application/json"
          }),
        }
      );

      console.log('Gemini Status:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('Gemini Output Raw:\n', text);
        try {
          // Clean JSON in case it returns markdown blocks
          let cleaned = text.trim();
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '').trim();
          }
          const parsed = JSON.parse(cleaned);
          console.log('Successfully parsed JSON:', parsed);
        } catch (parseErr) {
          console.error('Failed to parse Gemini output:', parseErr);
        }
      } else {
        const errText = await response.text();
        console.log('Gemini Error Output:', errText);
      }
    } catch (e) {
      console.error('Gemini error:', e);
    }
  }
}

testSync();
