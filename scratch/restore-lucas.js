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
  const profileId = 'user-lucas';
  const displayName = 'lucas';
  const avatarUrl = '__CREDENTIALS__:lucas:lucas123:LU';
  const groupId = 'd0000000-0000-0000-0000-000000000001'; // familia

  console.log(`Recreating profile ${profileId}...`);
  await executeRequest(`${supabaseUrl}/rest/v1/profiles`, 'POST', {
    id: profileId,
    display_name: displayName,
    avatar_url: avatarUrl,
    is_admin: false
  });

  console.log(`Adding to group_members...`);
  await executeRequest(`${supabaseUrl}/rest/v1/group_members`, 'POST', {
    group_id: groupId,
    profile_id: profileId
  });

  console.log(`Adding to participants...`);
  await executeRequest(`${supabaseUrl}/rest/v1/participants`, 'POST', {
    profile_id: profileId,
    manual_name: displayName
  });

  console.log(`Adding to standings...`);
  await executeRequest(`${supabaseUrl}/rest/v1/standings`, 'POST', {
    participant_id: profileId,
    points: 0,
    finalists_count: 0
  });

  console.log("✓ Recreated lucas successfully!");
}

main().catch(console.error);
