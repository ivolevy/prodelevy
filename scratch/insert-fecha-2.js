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

const matches = [
  // June 18: Groups A, B
  {
    id: 25,
    group_letter: 'A',
    home_team_id: 'MEX',
    away_team_id: 'KOR',
    fecha: '2026-06-18',
    hora_arg: '16:00:00-03:00',
    estadio: 'Mexico City Stadium',
    ciudad: 'Ciudad de México',
    pais: 'México',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 26,
    group_letter: 'A',
    home_team_id: 'RSA',
    away_team_id: 'CZE',
    fecha: '2026-06-18',
    hora_arg: '19:00:00-03:00',
    estadio: 'Estadio Guadalajara',
    ciudad: 'Guadalajara',
    pais: 'México',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 27,
    group_letter: 'B',
    home_team_id: 'CAN',
    away_team_id: 'QAT',
    fecha: '2026-06-18',
    hora_arg: '20:00:00-03:00',
    estadio: 'Toronto Stadium',
    ciudad: 'Toronto',
    pais: 'Canadá',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 28,
    group_letter: 'B',
    home_team_id: 'BIH',
    away_team_id: 'SUI',
    fecha: '2026-06-18',
    hora_arg: '23:00:00-03:00',
    estadio: 'BC Place',
    ciudad: 'Vancouver',
    pais: 'Canadá',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },

  // June 19: Groups C, D
  {
    id: 29,
    group_letter: 'C',
    home_team_id: 'BRA',
    away_team_id: 'HAI',
    fecha: '2026-06-19',
    hora_arg: '14:00:00-03:00',
    estadio: 'New York New Jersey Stadium',
    ciudad: 'New York / New Jersey',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 30,
    group_letter: 'C',
    home_team_id: 'MAR',
    away_team_id: 'SCO',
    fecha: '2026-06-19',
    hora_arg: '17:00:00-03:00',
    estadio: 'Boston Stadium',
    ciudad: 'Boston',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 31,
    group_letter: 'D',
    home_team_id: 'USA',
    away_team_id: 'AUS',
    fecha: '2026-06-19',
    hora_arg: '20:00:00-03:00',
    estadio: 'Los Angeles Stadium',
    ciudad: 'Los Ángeles',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 32,
    group_letter: 'D',
    home_team_id: 'PAR',
    away_team_id: 'TUR',
    fecha: '2026-06-19',
    hora_arg: '23:00:00-03:00',
    estadio: 'BC Place',
    ciudad: 'Vancouver',
    pais: 'Canadá',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },

  // June 20: Groups E, F
  {
    id: 33,
    group_letter: 'E',
    home_team_id: 'GER',
    away_team_id: 'CIV',
    fecha: '2026-06-20',
    hora_arg: '14:00:00-03:00',
    estadio: 'Houston Stadium',
    ciudad: 'Houston',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 34,
    group_letter: 'E',
    home_team_id: 'CUW',
    away_team_id: 'ECU',
    fecha: '2026-06-20',
    hora_arg: '17:00:00-03:00',
    estadio: 'Philadelphia Stadium',
    ciudad: 'Philadelphia',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 35,
    group_letter: 'F',
    home_team_id: 'NED',
    away_team_id: 'SWE',
    fecha: '2026-06-20',
    hora_arg: '20:00:00-03:00',
    estadio: 'Dallas Stadium',
    ciudad: 'Dallas',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 36,
    group_letter: 'F',
    home_team_id: 'JPN',
    away_team_id: 'TUN',
    fecha: '2026-06-20',
    hora_arg: '23:00:00-03:00',
    estadio: 'Estadio Monterrey',
    ciudad: 'Monterrey',
    pais: 'México',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },

  // June 21: Groups G, H
  {
    id: 37,
    group_letter: 'G',
    home_team_id: 'BEL',
    away_team_id: 'IRN',
    fecha: '2026-06-21',
    hora_arg: '14:00:00-03:00',
    estadio: 'Dallas Stadium',
    ciudad: 'Dallas',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 38,
    group_letter: 'G',
    home_team_id: 'EGY',
    away_team_id: 'NZL',
    fecha: '2026-06-21',
    hora_arg: '17:00:00-03:00',
    estadio: 'Estadio Guadalajara',
    ciudad: 'Guadalajara',
    pais: 'México',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 39,
    group_letter: 'H',
    home_team_id: 'ESP',
    away_team_id: 'KSA',
    fecha: '2026-06-21',
    hora_arg: '20:00:00-03:00',
    estadio: 'Mexico City Stadium',
    ciudad: 'Ciudad de México',
    pais: 'México',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 40,
    group_letter: 'H',
    home_team_id: 'CPV',
    away_team_id: 'URU',
    fecha: '2026-06-21',
    hora_arg: '23:00:00-03:00',
    estadio: 'Los Angeles Stadium',
    ciudad: 'Los Ángeles',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },

  // June 22: Groups I, J
  {
    id: 41,
    group_letter: 'I',
    home_team_id: 'FRA',
    away_team_id: 'IRQ',
    fecha: '2026-06-22',
    hora_arg: '14:00:00-03:00',
    estadio: 'Boston Stadium',
    ciudad: 'Boston',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 42,
    group_letter: 'I',
    home_team_id: 'SEN',
    away_team_id: 'NOR',
    fecha: '2026-06-22',
    hora_arg: '17:00:00-03:00',
    estadio: 'Toronto Stadium',
    ciudad: 'Toronto',
    pais: 'Canadá',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 43,
    group_letter: 'J',
    home_team_id: 'ARG',
    away_team_id: 'AUT',
    fecha: '2026-06-22',
    hora_arg: '20:00:00-03:00',
    estadio: 'New York New Jersey Stadium',
    ciudad: 'New York / New Jersey',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 44,
    group_letter: 'J',
    home_team_id: 'ALG',
    away_team_id: 'JOR',
    fecha: '2026-06-22',
    hora_arg: '23:00:00-03:00',
    estadio: 'Estadio Monterrey',
    ciudad: 'Monterrey',
    pais: 'México',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },

  // June 23: Groups K, L
  {
    id: 45,
    group_letter: 'K',
    home_team_id: 'POR',
    away_team_id: 'UZB',
    fecha: '2026-06-23',
    hora_arg: '14:00:00-03:00',
    estadio: 'San Francisco Bay Area Stadium',
    ciudad: 'San Francisco',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 46,
    group_letter: 'K',
    home_team_id: 'COD',
    away_team_id: 'COL',
    fecha: '2026-06-23',
    hora_arg: '17:00:00-03:00',
    estadio: 'Houston Stadium',
    ciudad: 'Houston',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 47,
    group_letter: 'L',
    home_team_id: 'ENG',
    away_team_id: 'GHA',
    fecha: '2026-06-23',
    hora_arg: '20:00:00-03:00',
    estadio: 'Philadelphia Stadium',
    ciudad: 'Philadelphia',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 48,
    group_letter: 'L',
    home_team_id: 'CRO',
    away_team_id: 'PAN',
    fecha: '2026-06-23',
    hora_arg: '23:00:00-03:00',
    estadio: 'BC Place',
    ciudad: 'Vancouver',
    pais: 'Canadá',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  }
];

async function insertMatches() {
  console.log(`Inserting ${matches.length} matches of Fecha 2 into database...`);
  const url = `${supabaseUrl}/rest/v1/matches`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
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
