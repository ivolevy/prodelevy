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

const matches = [
  // June 24: Groups A, B, C
  {
    id: 49,
    group_letter: 'A',
    home_team_id: 'MEX',
    away_team_id: 'CZE',
    fecha: '2026-06-24',
    hora_arg: '22:00:00-03:00',
    estadio: 'Mexico City Stadium',
    ciudad: 'Ciudad de México',
    pais: 'México',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 50,
    group_letter: 'A',
    home_team_id: 'RSA',
    away_team_id: 'KOR',
    fecha: '2026-06-24',
    hora_arg: '22:00:00-03:00',
    estadio: 'Estadio Monterrey',
    ciudad: 'Monterrey',
    pais: 'México',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 51,
    group_letter: 'B',
    home_team_id: 'CAN',
    away_team_id: 'SUI',
    fecha: '2026-06-24',
    hora_arg: '17:00:00-03:00',
    estadio: 'BC Place',
    ciudad: 'Vancouver',
    pais: 'Canadá',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 52,
    group_letter: 'B',
    home_team_id: 'BIH',
    away_team_id: 'QAT',
    fecha: '2026-06-24',
    hora_arg: '17:00:00-03:00',
    estadio: 'Seattle Stadium',
    ciudad: 'Seattle',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 53,
    group_letter: 'C',
    home_team_id: 'BRA',
    away_team_id: 'SCO',
    fecha: '2026-06-24',
    hora_arg: '20:00:00-03:00',
    estadio: 'Miami Stadium',
    ciudad: 'Miami',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 54,
    group_letter: 'C',
    home_team_id: 'MAR',
    away_team_id: 'HAI',
    fecha: '2026-06-24',
    hora_arg: '20:00:00-03:00',
    estadio: 'Atlanta Stadium',
    ciudad: 'Atlanta',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },

  // June 25: Groups D, E, F
  {
    id: 55,
    group_letter: 'D',
    home_team_id: 'USA',
    away_team_id: 'TUR',
    fecha: '2026-06-25',
    hora_arg: '23:00:00-03:00',
    estadio: 'Los Angeles Stadium',
    ciudad: 'Los Ángeles',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 56,
    group_letter: 'D',
    home_team_id: 'PAR',
    away_team_id: 'AUS',
    fecha: '2026-06-25',
    hora_arg: '23:00:00-03:00',
    estadio: "Levi's Stadium",
    ciudad: 'San Francisco',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 57,
    group_letter: 'E',
    home_team_id: 'GER',
    away_team_id: 'ECU',
    fecha: '2026-06-25',
    hora_arg: '17:00:00-03:00',
    estadio: 'Houston Stadium',
    ciudad: 'Houston',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 58,
    group_letter: 'E',
    home_team_id: 'CUW',
    away_team_id: 'CIV',
    fecha: '2026-06-25',
    hora_arg: '17:00:00-03:00',
    estadio: 'Lincoln Financial Field',
    ciudad: 'Philadelphia',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 59,
    group_letter: 'F',
    home_team_id: 'NED',
    away_team_id: 'TUN',
    fecha: '2026-06-25',
    hora_arg: '20:00:00-03:00',
    estadio: 'Arrowhead Stadium',
    ciudad: 'Kansas City',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 60,
    group_letter: 'F',
    home_team_id: 'JPN',
    away_team_id: 'SWE',
    fecha: '2026-06-25',
    hora_arg: '20:00:00-03:00',
    estadio: 'AT&T Stadium',
    ciudad: 'Dallas',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },

  // June 26: Groups G, H, I
  {
    id: 61,
    group_letter: 'G',
    home_team_id: 'BEL',
    away_team_id: 'NZL',
    fecha: '2026-06-26',
    hora_arg: '17:00:00-03:00',
    estadio: 'BC Place',
    ciudad: 'Vancouver',
    pais: 'Canadá',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 62,
    group_letter: 'G',
    home_team_id: 'EGY',
    away_team_id: 'IRN',
    fecha: '2026-06-26',
    hora_arg: '17:00:00-03:00',
    estadio: 'Seattle Stadium',
    ciudad: 'Seattle',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 63,
    group_letter: 'H',
    home_team_id: 'ESP',
    away_team_id: 'URU',
    fecha: '2026-06-26',
    hora_arg: '23:00:00-03:00',
    estadio: 'Estadio Akron',
    ciudad: 'Guadalajara',
    pais: 'México',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 64,
    group_letter: 'H',
    home_team_id: 'CPV',
    away_team_id: 'KSA',
    fecha: '2026-06-26',
    hora_arg: '23:00:00-03:00',
    estadio: 'NRG Stadium',
    ciudad: 'Houston',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 65,
    group_letter: 'I',
    home_team_id: 'FRA',
    away_team_id: 'NOR',
    fecha: '2026-06-26',
    hora_arg: '20:00:00-03:00',
    estadio: 'Gillette Stadium',
    ciudad: 'Boston',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 66,
    group_letter: 'I',
    home_team_id: 'SEN',
    away_team_id: 'IRQ',
    fecha: '2026-06-26',
    hora_arg: '20:00:00-03:00',
    estadio: 'BMO Field',
    ciudad: 'Toronto',
    pais: 'Canadá',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },

  // June 27: Groups J, K, L
  {
    id: 67,
    group_letter: 'J',
    home_team_id: 'ARG',
    away_team_id: 'JOR',
    fecha: '2026-06-27',
    hora_arg: '23:00:00-03:00',
    estadio: 'AT&T Stadium',
    ciudad: 'Dallas',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 68,
    group_letter: 'J',
    home_team_id: 'ALG',
    away_team_id: 'AUT',
    fecha: '2026-06-27',
    hora_arg: '23:00:00-03:00',
    estadio: 'Arrowhead Stadium',
    ciudad: 'Kansas City',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 69,
    group_letter: 'K',
    home_team_id: 'POR',
    away_team_id: 'COL',
    fecha: '2026-06-27',
    hora_arg: '17:00:00-03:00',
    estadio: 'Hard Rock Stadium',
    ciudad: 'Miami',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 70,
    group_letter: 'K',
    home_team_id: 'COD',
    away_team_id: 'UZB',
    fecha: '2026-06-27',
    hora_arg: '17:00:00-03:00',
    estadio: 'Mercedes-Benz Stadium',
    ciudad: 'Atlanta',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 71,
    group_letter: 'L',
    home_team_id: 'ENG',
    away_team_id: 'PAN',
    fecha: '2026-06-27',
    hora_arg: '20:00:00-03:00',
    estadio: 'MetLife Stadium',
    ciudad: 'New York / New Jersey',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  },
  {
    id: 72,
    group_letter: 'L',
    home_team_id: 'CRO',
    away_team_id: 'GHA',
    fecha: '2026-06-27',
    hora_arg: '20:00:00-03:00',
    estadio: 'Lincoln Financial Field',
    ciudad: 'Philadelphia',
    pais: 'Estados Unidos',
    status: 'upcoming',
    phase: 'Fase de Grupos'
  }
];

async function insertMatches() {
  console.log(`Inserting ${matches.length} matches of Fecha 3 into database...`);
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
