const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Supabase Url or Service Role Key missing in .env.local!");
  process.exit(1);
}

async function main() {
  console.log("Verificando conexión HTTP directa con rol de administrador...");
  
  // 1. Fetch match 1 current state
  const getRes = await fetch(`${supabaseUrl}/rest/v1/matches?id=eq.1`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  });

  if (!getRes.ok) {
    console.error("Error al obtener partido:", getRes.status, await getRes.text());
    return;
  }

  const beforeList = await getRes.json();
  const before = beforeList[0];
  console.log("Partido antes del cambio:", before);

  // 2. Perform admin update on match 1
  console.log("Intentando actualizar puntajes en base de datos como administrador...");
  const updateRes = await fetch(`${supabaseUrl}/rest/v1/matches?id=eq.1`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      home_score: 2,
      away_score: 3,
      status: 'upcoming'
    })
  });

  if (!updateRes.ok) {
    console.error("Error al actualizar partido:", updateRes.status, await updateRes.text());
    return;
  }

  const updated = await updateRes.json();
  console.log("Respuesta de Supabase (Admin):", updated);

  // 3. Reset it back to original state to clean up
  console.log("Restaurando partido a su estado original...");
  const restoreRes = await fetch(`${supabaseUrl}/rest/v1/matches?id=eq.1`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      home_score: before.home_score,
      away_score: before.away_score,
      status: before.status
    })
  });

  if (!restoreRes.ok) {
    console.error("Error al restaurar partido:", restoreRes.status, await restoreRes.text());
    return;
  }

  const restored = await restoreRes.json();
  console.log("Partido restaurado exitosamente:", restored);
}

main().catch(console.error);
