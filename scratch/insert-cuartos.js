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
    id: 97,
    home_team_id: 'MAR',
    away_team_id: 'FRA',
    fecha: '2026-07-09',
    hora_arg: '17:00:00-03:00',
    estadio: 'Boston Stadium',
    ciudad: 'Boston',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Cuartos de Final'
  },
  {
    id: 98,
    home_team_id: 'NOR',
    away_team_id: 'ENG',
    fecha: '2026-07-11',
    hora_arg: '17:00:00-03:00',
    estadio: 'Miami Stadium',
    ciudad: 'Miami',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Cuartos de Final'
  },
  {
    id: 99,
    home_team_id: 'BEL',
    away_team_id: 'ESP',
    fecha: '2026-07-10',
    hora_arg: '21:00:00-03:00',
    estadio: 'Los Angeles Stadium',
    ciudad: 'Los Ángeles',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Cuartos de Final'
  },
  {
    id: 100,
    home_team_id: 'ARG',
    away_team_id: 'SUI',
    fecha: '2026-07-11',
    hora_arg: '21:00:00-03:00',
    estadio: 'Kansas City Stadium',
    ciudad: 'Kansas City',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Cuartos de Final'
  }
];

async function insertMatches() {
  console.log(`Inserting ${matches.length} matches of Cuartos de Final into database...`);
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
}

insertMatches().catch(console.error);
