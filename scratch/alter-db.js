const { Client } = require('pg');
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

const password = process.env.DB_PASSWORD;
if (!password) {
  console.error('ERROR: Debes proporcionar la contraseña de la base de datos de Supabase en la variable de entorno DB_PASSWORD.');
  console.error('Ejemplo de uso:');
  console.error('  DB_PASSWORD=tu_contraseña node scratch/alter-db.js');
  process.exit(1);
}

// Project ref is extracted from Supabase URL: https://[ref].supabase.co
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const matchRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase/);
if (!matchRef) {
  console.error('ERROR: No se pudo extraer la referencia del proyecto de NEXT_PUBLIC_SUPABASE_URL.');
  process.exit(1);
}
const projectRef = matchRef[1];
const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Conectando a la base de datos de Supabase...');
  await client.connect();
  console.log('Conexión establecida.');

  console.log('Agregando columnas de tiempo extra y penales a la tabla "matches"...');
  await client.query(`
    ALTER TABLE public.matches 
    ADD COLUMN IF NOT EXISTS home_extra_score INTEGER,
    ADD COLUMN IF NOT EXISTS away_extra_score INTEGER,
    ADD COLUMN IF NOT EXISTS home_penalty_score INTEGER,
    ADD COLUMN IF NOT EXISTS away_penalty_score INTEGER;
  `);
  console.log('Columnas en "matches" creadas/verificadas.');

  console.log('Agregando columnas de tiempo extra y penales a la tabla "predictions"...');
  await client.query(`
    ALTER TABLE public.predictions 
    ADD COLUMN IF NOT EXISTS home_extra_score INTEGER,
    ADD COLUMN IF NOT EXISTS away_extra_score INTEGER,
    ADD COLUMN IF NOT EXISTS home_penalty_score INTEGER,
    ADD COLUMN IF NOT EXISTS away_penalty_score INTEGER;
  `);
  console.log('Columnas en "predictions" creadas/verificadas.');

  await client.end();
  console.log('¡Migración de base de datos completada con éxito!');
}

run().catch(err => {
  console.error('Error durante la migración:', err);
  process.exit(1);
});
