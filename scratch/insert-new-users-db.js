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

async function insertUserIfMissing(profileId, displayName, password, avatarUrlShort, groupId) {
  // Check profile
  console.log(`Checking if profile ${profileId} exists...`);
  const checkProfileUrl = `${supabaseUrl}/rest/v1/profiles?id=eq.${profileId}`;
  const exists = await executeRequest(checkProfileUrl, 'GET');
  
  if (exists && exists.length === 0) {
    console.log(`Inserting profile ${profileId} (${displayName})...`);
    const insertProfileUrl = `${supabaseUrl}/rest/v1/profiles`;
    await executeRequest(insertProfileUrl, 'POST', {
      id: profileId,
      display_name: displayName,
      avatar_url: `__CREDENTIALS__:${displayName}:${password}:${avatarUrlShort}`,
      is_admin: false
    });
  } else {
    console.log(`Profile ${profileId} already exists.`);
  }

  // Check group membership
  console.log(`Checking if membership for ${profileId} in ${groupId} exists...`);
  const checkMemberUrl = `${supabaseUrl}/rest/v1/group_members?group_id=eq.${groupId}&profile_id=eq.${profileId}`;
  const memberExists = await executeRequest(checkMemberUrl, 'GET');
  
  if (memberExists && memberExists.length === 0) {
    console.log(`Inserting group member ${profileId} into group ${groupId}...`);
    const insertMemberUrl = `${supabaseUrl}/rest/v1/group_members`;
    await executeRequest(insertMemberUrl, 'POST', {
      group_id: groupId,
      profile_id: profileId
    });
  } else {
    console.log(`Membership for ${profileId} already exists.`);
  }
}

async function main() {
  const familiaGroupId = 'd0000000-0000-0000-0000-000000000001';
  const mrMartesGroupId = 'd0000000-0000-0000-0000-000000000002';

  // 0. Clean up user-laberto just in case
  console.log("Cleaning up user-laberto...");
  await executeRequest(`${supabaseUrl}/rest/v1/group_members?profile_id=eq.user-laberto`, 'DELETE');
  await executeRequest(`${supabaseUrl}/rest/v1/profiles?id=eq.user-laberto`, 'DELETE');

  // 1. alberto in familia
  await insertUserIfMissing('user-alberto', 'alberto', 'alberto123', 'AB', familiaGroupId);

  // 2. golce in mr martes
  await insertUserIfMissing('user-golce', 'golce', 'golce123', 'GO', mrMartesGroupId);

  console.log("Database insertion completed successfully!");
}

main().catch(console.error);
