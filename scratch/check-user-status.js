const fs = require('fs');
const path = require('path');

// Parse .env.local manually
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

async function executeSql(query) {
  // We don't have a direct SQL execution endpoint unless we use RPC or something.
  // Wait, let's check if there is a way to query Postgres system tables via REST API or RPC.
  // Actually, Supabase PostgREST exposes tables, but system tables are usually not exposed unless we have an RPC function or admin key.
  // Let's see if we can query them via PostgREST /rest/v1/ ... wait, no, PostgREST doesn't expose pg_catalog by default.
  // But wait, the supabase tool failed with connection timeout. Let's see if we can check it via some other way.
  // Can we fetch from /rest/v1/participants? Let's check why participants was empty.
  // Wait, in PostgREST, did we get any errors when fetching? No, it returned empty array `[]`.
}

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
  const participants = await queryTable('participants');
  console.log("Participants quantity:", participants.length);
  if (participants.length > 0) {
    console.log("First participant:", participants[0]);
  }
  
  const standings = await queryTable('standings');
  console.log("Standings quantity:", standings.length);
  if (standings.length > 0) {
    console.log("First standing:", standings[0]);
  }
}

main().catch(console.error);
