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

async function deleteUser(profileId, displayName) {
  console.log(`\nDeleting user: ${displayName} (${profileId})`);

  // Delete predictions
  console.log(`- Deleting predictions...`);
  await executeRequest(`${supabaseUrl}/rest/v1/predictions?participant_id=eq.${profileId}`, 'DELETE');

  // Delete group memberships
  console.log(`- Deleting group memberships...`);
  await executeRequest(`${supabaseUrl}/rest/v1/group_members?profile_id=eq.${profileId}`, 'DELETE');

  // Delete standings
  console.log(`- Deleting standings...`);
  await executeRequest(`${supabaseUrl}/rest/v1/standings?participant_id=eq.${profileId}`, 'DELETE');

  // Delete profile
  console.log(`- Deleting profile...`);
  await executeRequest(`${supabaseUrl}/rest/v1/profiles?id=eq.${profileId}`, 'DELETE');

  console.log(`✓ Deleted ${displayName}`);
}

async function main() {
  // 1. Fetch all profiles to find matches
  console.log("Fetching all profiles...");
  const profiles = await executeRequest(`${supabaseUrl}/rest/v1/profiles?select=*`, 'GET');
  if (!profiles) return;

  const targets = ['nino', 'luca', 'test profile'];
  
  for (const p of profiles) {
    const nameLower = p.display_name.toLowerCase();
    const idLower = p.id.toLowerCase();
    
    const isTarget = targets.some(target => 
      nameLower.includes(target) || 
      idLower.includes(target)
    );
    
    if (isTarget) {
      await deleteUser(p.id, p.display_name);
    }
  }
  console.log('\nFinished all deletions!');
}

main().catch(console.error);
