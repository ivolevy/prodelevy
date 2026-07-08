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

async function executeRequest(url, method, body) {
  const options = {
    method,
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    console.error(`HTTP error on ${method} ${url}:`, res.status, await res.text());
    return null;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function main() {
  const profileId = 'user-luca';
  console.log("Checking tables for user-luca...");
  
  const profile = await executeRequest(`${supabaseUrl}/rest/v1/profiles?id=eq.${profileId}`, 'GET');
  console.log("Profile:", profile);
  
  const participant = await executeRequest(`${supabaseUrl}/rest/v1/participants?profile_id=eq.${profileId}`, 'GET');
  console.log("Participant:", participant);
  
  const standing = await executeRequest(`${supabaseUrl}/rest/v1/standings?participant_id=eq.${profileId}`, 'GET');
  console.log("Standing:", standing);
  
  const member = await executeRequest(`${supabaseUrl}/rest/v1/group_members?profile_id=eq.${profileId}`, 'GET');
  console.log("Group Member:", member);
}

main().catch(console.error);
