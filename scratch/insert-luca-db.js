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
  const mrMartesGroupId = 'd0000000-0000-0000-0000-000000000002'; // mr martes
  
  // Check if profile exists
  console.log(`Checking if profile ${profileId} exists...`);
  const checkProfileUrl = `${supabaseUrl}/rest/v1/profiles?id=eq.${profileId}`;
  const profileExists = await executeRequest(checkProfileUrl, 'GET');
  
  if (profileExists && profileExists.length === 0) {
    console.log("Inserting user-luca profile...");
    const insertProfileUrl = `${supabaseUrl}/rest/v1/profiles`;
    await executeRequest(insertProfileUrl, 'POST', {
      id: profileId,
      display_name: 'luca',
      avatar_url: '__CREDENTIALS__:luca:luca123:LU',
      is_admin: false
    });
  } else {
    console.log("Profile user-luca already exists.");
  }

  // Check if group member exists
  console.log(`Checking if group member ${profileId} in group ${mrMartesGroupId} exists...`);
  const checkMemberUrl = `${supabaseUrl}/rest/v1/group_members?group_id=eq.${mrMartesGroupId}&profile_id=eq.${profileId}`;
  const memberExists = await executeRequest(checkMemberUrl, 'GET');
  
  if (memberExists && memberExists.length === 0) {
    console.log("Inserting user-luca into group_members...");
    const insertMemberUrl = `${supabaseUrl}/rest/v1/group_members`;
    await executeRequest(insertMemberUrl, 'POST', {
      group_id: mrMartesGroupId,
      profile_id: profileId
    });
  } else {
    console.log("Group member already exists.");
  }

  console.log("Done inserting luca!");
}

main().catch(console.error);
