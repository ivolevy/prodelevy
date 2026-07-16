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

const matchesToUpdate = [
  {
    id: 103,
    home_team_id: 'ESP',
    away_team_id: 'ARG',
    status: 'upcoming'
  },
  {
    id: 104,
    home_team_id: 'FRA',
    away_team_id: 'ENG',
    status: 'upcoming'
  }
];

async function updateFinals() {
  console.log(`Updating matches 103 (Gran Final) and 104 (Tercer Puesto) in DB...`);
  
  const headers = {
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json'
  };

  for (const m of matchesToUpdate) {
    const res = await fetch(`${supabaseUrl}/rest/v1/matches?id=eq.${m.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        home_team_id: m.home_team_id,
        away_team_id: m.away_team_id,
        status: m.status
      })
    });
    if (!res.ok) {
      console.error(`Failed to update match ${m.id}:`, res.status, await res.text());
    } else {
      console.log(`Match ${m.id} updated successfully!`);
    }
  }

  // Update stage_reached to finalist for ESP and ARG
  console.log("Updating stage_reached to finalist for ESP and ARG...");
  const updateTeamsRes = await fetch(`${supabaseUrl}/rest/v1/teams?id=in.("ESP","ARG")`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      stage_reached: 'finalist'
    })
  });

  if (!updateTeamsRes.ok) {
    console.error("Failed to update teams:", updateTeamsRes.status, await updateTeamsRes.text());
  } else {
    console.log("Teams updated successfully!");
  }
}

updateFinals().catch(console.error);
