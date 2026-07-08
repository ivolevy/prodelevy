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
  return res.status === 204 ? {} : await res.json();
}

async function main() {
  const profileId = 'user-laberto';
  const groupId = 'd0000000-0000-0000-0000-000000000001'; // familia
  
  // Insert profile user-laberto
  console.log("Inserting user-laberto profile...");
  const insertProfileUrl = `${supabaseUrl}/rest/v1/profiles`;
  await executeRequest(insertProfileUrl, 'POST', {
    id: profileId,
    display_name: 'laberto',
    avatar_url: '__CREDENTIALS__:laberto:laberto123:LA',
    is_admin: false
  });

  // Insert group member user-laberto
  console.log("Inserting user-laberto into group_members...");
  const insertMemberUrl = `${supabaseUrl}/rest/v1/group_members`;
  await executeRequest(insertMemberUrl, 'POST', {
    group_id: groupId,
    profile_id: profileId
  });

  console.log("Done inserting laberto!");
}

main().catch(console.error);
