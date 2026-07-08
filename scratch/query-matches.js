const fs = require('fs');
const path = require('path');

// Parse .env.local manually
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
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  const resMatches = await fetch(`${supabaseUrl}/rest/v1/matches?select=*`, {
    headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
  });
  const matches = await resMatches.json();
  console.log(`Total matches in DB: ${matches.length}`);
  if (matches.length > 0) {
    console.log("Sample match:", matches[0]);
  }

  const resPredictions = await fetch(`${supabaseUrl}/rest/v1/predictions?select=*`, {
    headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
  });
  const predictions = await resPredictions.json();
  console.log(`Total predictions in DB: ${predictions.length}`);
  if (predictions.length > 0) {
    console.log("Sample prediction:", predictions[0]);
  }
}

main().catch(console.error);
