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
  const mrMartesId = 'd0000000-0000-0000-0000-000000000002';
  
  // Delete user-ivan from mr martes
  console.log("Deleting user-ivan from mr martes group...");
  const deleteUrl = `${supabaseUrl}/rest/v1/group_members?group_id=eq.${mrMartesId}&profile_id=eq.user-ivan`;
  await executeRequest(deleteUrl, 'DELETE');

  // Insert user-ivo into mr martes if not exists
  console.log("Checking user-ivo in mr martes group...");
  const checkUrl = `${supabaseUrl}/rest/v1/group_members?group_id=eq.${mrMartesId}&profile_id=eq.user-ivo`;
  const exists = await executeRequest(checkUrl, 'GET');
  
  if (exists && exists.length === 0) {
    console.log("Inserting user-ivo into mr martes group...");
    const insertUrl = `${supabaseUrl}/rest/v1/group_members`;
    await executeRequest(insertUrl, 'POST', {
      group_id: mrMartesId,
      profile_id: 'user-ivo',
      joined_at: new Date().toISOString()
    });
  } else {
    console.log("user-ivo is already in mr martes group.");
  }

  console.log("Done database corrections.");
}

main().catch(console.error);
