const fs = require('fs');
const path = require('path');

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
  const headers = { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` };

  console.log("Verifying matches 101, 102, 103, 104 in DB...");
  const resMatches = await fetch(`${supabaseUrl}/rest/v1/matches?id=in.(101,102,103,104)&select=*`, { headers });
  const matches = await resMatches.json();
  matches.sort((a, b) => a.id - b.id).forEach(m => {
    console.log(`Match ${m.id} | Phase: ${m.phase} | ${m.home_team_id} vs ${m.away_team_id} | Status: ${m.status}`);
  });

  console.log("\nVerifying teams stage_reached in DB...");
  const resTeams = await fetch(`${supabaseUrl}/rest/v1/teams?id=in.("FRA","ENG","ESP","ARG")&select=id,name,stage_reached`, { headers });
  const teams = await resTeams.json();
  teams.forEach(t => {
    console.log(`Team ${t.id} (${t.name}) | Stage Reached: ${t.stage_reached}`);
  });

  console.log("\nVerifying results points in DB...");
  const resResults = await fetch(`${supabaseUrl}/rest/v1/results?stage_name=eq.semifinal&select=*`, { headers });
  const results = await resResults.json();
  console.log("Semifinal points in DB results table:", results[0]?.points);
}

main().catch(console.error);
