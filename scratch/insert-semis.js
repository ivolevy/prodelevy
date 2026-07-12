const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = (match[2] || '').replace(/['\"]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const matches = [
  {
    id: 101,
    home_team_id: 'FRA',
    away_team_id: 'ESP',
    fecha: '2026-07-14',
    hora_arg: '21:00:00-03:00',
    estadio: 'Dallas Stadium',
    ciudad: 'Dallas',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Semifinal'
  },
  {
    id: 102,
    home_team_id: null,
    away_team_id: null,
    fecha: '2026-07-15',
    hora_arg: '21:00:00-03:00',
    estadio: 'Atlanta Stadium',
    ciudad: 'Atlanta',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Semifinal'
  }
];

async function insertMatches() {
  console.log(`Inserting ${matches.length} matches of Semifinales into database...`);
  const url = `${supabaseUrl}/rest/v1/matches`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(matches)
  });

  if (!response.ok) {
    console.error("Failed to insert matches:", response.status, await response.text());
  } else {
    console.log("Matches inserted successfully!");
  }

  console.log("Updating stage_reached to semifinal for FRA and ESP...");
  const updateTeamsRes = await fetch(`${supabaseUrl}/rest/v1/teams?id=in.("FRA","ESP")`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      stage_reached: 'semifinal'
    })
  });

  if (!updateTeamsRes.ok) {
    console.error("Failed to update teams:", updateTeamsRes.status, await updateTeamsRes.text());
  } else {
    console.log("Teams updated successfully!");
  }
}

insertMatches().catch(console.error);
