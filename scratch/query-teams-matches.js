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

async function queryTable(tableName) {
  const url = `${supabaseUrl}/rest/v1/${tableName}?select=*`;
  const res = await fetch(url, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  });
  if (!res.ok) {
    console.error(`Error querying ${tableName}:`, res.status, await res.text());
    return [];
  }
  return await res.json();
}

async function main() {
  const teams = await queryTable('teams');
  const matches = await queryTable('matches');

  console.log("Teams count:", teams.length);
  // Group teams by group_letter
  const teamsByGroup = {};
  teams.forEach(t => {
    if (!teamsByGroup[t.group_letter]) teamsByGroup[t.group_letter] = [];
    teamsByGroup[t.group_letter].push(t);
  });
  console.log("\nTeams by Group:");
  Object.keys(teamsByGroup).sort().forEach(g => {
    console.log(`Group ${g}:`, teamsByGroup[g].map(t => `${t.id} (${t.name})` || t.id).join(', '));
  });

  console.log("\nMatches in DB:");
  matches.forEach(m => {
    console.log(`Match ${m.id} (Group ${m.group_letter}): ${m.home_team_id} vs ${m.away_team_id} | Fecha: ${m.fecha} | Phase: ${m.phase}`);
  });
}

main().catch(console.error);
