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

async function deleteUser(profileId) {
  console.log(`\nStarting deletion for user: ${profileId}`);

  // Delete predictions
  console.log(`Deleting predictions for ${profileId}...`);
  await executeRequest(`${supabaseUrl}/rest/v1/predictions?participant_id=eq.${profileId}`, 'DELETE');

  // Delete group memberships
  console.log(`Deleting group memberships for ${profileId}...`);
  await executeRequest(`${supabaseUrl}/rest/v1/group_members?profile_id=eq.${profileId}`, 'DELETE');

  // Delete standings
  console.log(`Deleting standings for ${profileId}...`);
  await executeRequest(`${supabaseUrl}/rest/v1/standings?participant_id=eq.${profileId}`, 'DELETE');

  // Delete profile
  console.log(`Deleting profile for ${profileId}...`);
  await executeRequest(`${supabaseUrl}/rest/v1/profiles?id=eq.${profileId}`, 'DELETE');

  console.log(`Deletion finished for ${profileId}`);
}

async function main() {
  await deleteUser('user-luca');
  await deleteUser('user-nino');
  console.log('\nAll done!');
}

main().catch(console.error);
