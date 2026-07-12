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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  console.log("Starting DB update script for Semis, 3rd Place, and Final matches...");

  const headers = {
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  };

  // 1. Update Semifinal matches (101: Francia vs España, 102: Argentina vs Inglaterra)
  console.log("Updating Semifinal matches (101, 102)...");
  const semis = [
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
      home_team_id: 'ARG',
      away_team_id: 'ENG',
      fecha: '2026-07-15',
      hora_arg: '21:00:00-03:00',
      estadio: 'Atlanta Stadium',
      ciudad: 'Atlanta',
      pais: 'Estados Unidos',
      status: 'upcoming',
      phase: 'Semifinal'
    }
  ];

  const updateSemisRes = await fetch(`${supabaseUrl}/rest/v1/matches`, {
    method: 'POST',
    headers,
    body: JSON.stringify(semis)
  });

  if (!updateSemisRes.ok) {
    console.error("Failed to update semifinal matches:", updateSemisRes.status, await updateSemisRes.text());
  } else {
    console.log("Semifinal matches updated successfully!");
  }

  // 2. Insert/Upsert Gran Final (id: 103) and 3rd Place Match (id: 104)
  console.log("Upserting Final and 3rd Place Matches (103, 104)...");
  const finalMatches = [
    {
      id: 103,
      home_team_id: null,
      away_team_id: null,
      fecha: '2026-07-19',
      hora_arg: '21:00:00-03:00',
      estadio: 'MetLife Stadium',
      ciudad: 'New York / New Jersey',
      pais: 'Estados Unidos',
      status: 'upcoming',
      phase: 'Gran Final'
    },
    {
      id: 104,
      home_team_id: null,
      away_team_id: null,
      fecha: '2026-07-18',
      hora_arg: '21:00:00-03:00',
      estadio: 'Miami Stadium',
      ciudad: 'Miami',
      pais: 'Estados Unidos',
      status: 'upcoming',
      phase: 'Tercer Puesto'
    }
  ];

  const insertFinalsRes = await fetch(`${supabaseUrl}/rest/v1/matches`, {
    method: 'POST',
    headers,
    body: JSON.stringify(finalMatches)
  });

  if (!insertFinalsRes.ok) {
    console.error("Failed to insert final/3rd place matches:", insertFinalsRes.status, await insertFinalsRes.text());
  } else {
    console.log("Final and 3rd place matches upserted successfully!");
  }

  // 3. Update teams stage_reached to semifinal for FRA, ENG, ESP, ARG
  console.log("Updating stage_reached to semifinal for FRA, ENG, ESP, ARG...");
  const updateTeamsRes = await fetch(`${supabaseUrl}/rest/v1/teams?id=in.("FRA","ENG","ESP","ARG")`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      stage_reached: 'semifinal'
    })
  });

  if (!updateTeamsRes.ok) {
    console.error("Failed to update teams:", updateTeamsRes.status, await updateTeamsRes.text());
  } else {
    console.log("Teams updated successfully!");
  }

  // 4. Update results table: set semifinal points to 30
  console.log("Updating results table (semifinal points to 30)...");
  const updateResultsRes = await fetch(`${supabaseUrl}/rest/v1/results?stage_name=eq.semifinal`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      points: 30
    })
  });

  if (!updateResultsRes.ok) {
    console.error("Failed to update results table:", updateResultsRes.status, await updateResultsRes.text());
  } else {
    console.log("Results table updated successfully!");
  }
}

main().catch(console.error);
