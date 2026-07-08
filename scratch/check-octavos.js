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
  const resMatches = await fetch(`${supabaseUrl}/rest/v1/matches?id=gte.89&order=id.asc`, {
    headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
  });
  const matches = await resMatches.json();
  console.log("Matches gte 89 in DB:");
  matches.forEach(m => {
    console.log(`ID: ${m.id} | ${m.phase} | ${m.home_team_id} vs ${m.away_team_id} | Score: ${m.home_score}-${m.away_score} | Extra: ${m.home_extra_score}-${m.away_extra_score} | Pen: ${m.home_penalty_score}-${m.away_penalty_score} | Status: ${m.status}`);
  });
}

main().catch(console.error);
