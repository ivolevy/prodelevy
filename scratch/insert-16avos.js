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
    id: 73,
    home_team_id: 'RSA',
    away_team_id: 'CAN',
    fecha: '2026-06-28',
    hora_arg: '16:00:00-03:00',
    estadio: 'Los Angeles Stadium',
    ciudad: 'Los Ángeles',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 74,
    home_team_id: 'BRA',
    away_team_id: 'JPN',
    fecha: '2026-06-29',
    hora_arg: '14:00:00-03:00',
    estadio: 'Houston Stadium',
    ciudad: 'Houston',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 75,
    home_team_id: 'GER',
    away_team_id: null,
    fecha: '2026-06-29',
    hora_arg: '17:30:00-03:00',
    estadio: 'Boston Stadium',
    ciudad: 'Boston',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 76,
    home_team_id: 'NED',
    away_team_id: 'MAR',
    fecha: '2026-06-30',
    hora_arg: '22:00:00-03:00',
    estadio: 'Estadio Monterrey',
    ciudad: 'Monterrey',
    pais: 'México',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 77,
    home_team_id: 'CIV',
    away_team_id: null,
    fecha: '2026-06-30',
    hora_arg: '14:00:00-03:00',
    estadio: 'Atlanta Stadium',
    ciudad: 'Atlanta',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 78,
    home_team_id: null,
    away_team_id: null,
    fecha: '2026-06-30',
    hora_arg: '18:00:00-03:00',
    estadio: 'Philadelphia Stadium',
    ciudad: 'Philadelphia',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 79,
    home_team_id: 'MEX',
    away_team_id: null,
    fecha: '2026-07-01',
    hora_arg: '22:00:00-03:00',
    estadio: 'Mexico City Stadium',
    ciudad: 'Ciudad de México',
    pais: 'México',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 80,
    home_team_id: null,
    away_team_id: null,
    fecha: '2026-07-01',
    hora_arg: '13:00:00-03:00',
    estadio: 'Toronto Stadium',
    ciudad: 'Toronto',
    pais: 'Canadá',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 81,
    home_team_id: null,
    away_team_id: null,
    fecha: '2026-07-01',
    hora_arg: '17:00:00-03:00',
    estadio: 'San Francisco Bay Area Stadium',
    ciudad: 'San Francisco',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 82,
    home_team_id: 'USA',
    away_team_id: 'BIH',
    fecha: '2026-07-02',
    hora_arg: '21:00:00-03:00',
    estadio: 'Seattle Stadium',
    ciudad: 'Seattle',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 83,
    home_team_id: null,
    away_team_id: null,
    fecha: '2026-07-02',
    hora_arg: '16:00:00-03:00',
    estadio: 'Dallas Stadium',
    ciudad: 'Dallas',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 84,
    home_team_id: null,
    away_team_id: null,
    fecha: '2026-07-02',
    hora_arg: '20:00:00-03:00',
    estadio: 'Kansas City Stadium',
    ciudad: 'Kansas City',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 85,
    home_team_id: 'SUI',
    away_team_id: null,
    fecha: '2026-07-03',
    hora_arg: '23:00:00-03:00',
    estadio: 'Vancouver Stadium',
    ciudad: 'Vancouver',
    pais: 'Canadá',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 86,
    home_team_id: 'AUS',
    away_team_id: null,
    fecha: '2026-07-03',
    hora_arg: '15:00:00-03:00',
    estadio: 'Estadio Guadalajara',
    ciudad: 'Guadalajara',
    pais: 'México',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 87,
    home_team_id: 'ARG',
    away_team_id: null,
    fecha: '2026-07-03',
    hora_arg: '19:00:00-03:00',
    estadio: 'Miami Stadium',
    ciudad: 'Miami',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: '16avos de Final'
  },
  {
    id: 88,
    home_team_id: null,
    away_team_id: null,
    fecha: '2026-07-04',
    hora_arg: '22:30:00-03:00',
    estadio: 'New York New Jersey Stadium',
    ciudad: 'New York / New Jersey',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: '16avos de Final'
  }
];

async function insertMatches() {
  console.log(`Inserting ${matches.length} matches of 16avos de Final into database...`);
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
