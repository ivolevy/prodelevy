const fs = require('fs');
const path = require('path');

// Parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const predictions = [
    {
      participant_id: 'user-walo',
      match_id: 25,
      home_score: 1, // México
      away_score: 2  // Corea del Sur
    },
    {
      participant_id: 'user-walo',
      match_id: 26,
      home_score: 0, // Sudáfrica
      away_score: 2  // República Checa
    }
  ];

  console.log("Insertando/Actualizando predicciones para walo (user-walo)...");

  const res = await fetch(`${supabaseUrl}/rest/v1/predictions`, {
    method: 'POST',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(predictions)
  });

  if (!res.ok) {
    console.error("Error al guardar las predicciones:", res.status, await res.text());
    return;
  }

  const result = await res.json();
  console.log("Predicciones guardadas exitosamente:", result);
}

main().catch(console.error);
