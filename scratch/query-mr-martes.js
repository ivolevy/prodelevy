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

function decodeProfileAvatar(avatarUrl) {
  if (avatarUrl && avatarUrl.startsWith('__CREDENTIALS__:')) {
    const parts = avatarUrl.split(':');
    const username = parts[1];
    const password = parts[2];
    const originalAvatar = parts[3];
    const championPrediction = parts[4] || undefined;
    return { username, password, avatar_url: originalAvatar, champion_prediction: championPrediction };
  }
  return { avatar_url: avatarUrl || undefined };
}

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
  const mrMartesId = 'd0000000-0000-0000-0000-000000000002';
  
  // Get members
  console.log("Fetching group members...");
  const membersUrl = `${supabaseUrl}/rest/v1/group_members?group_id=eq.${mrMartesId}`;
  const members = await executeRequest(membersUrl, 'GET');
  console.log("Members found:", members);

  if (!members || members.length === 0) {
    console.log("No members found for group mr martes.");
    return;
  }

  // Get profiles
  const profileIds = members.map(m => m.profile_id);
  const profilesUrl = `${supabaseUrl}/rest/v1/profiles?id=in.(${profileIds.map(id => `"${id}"`).join(',')})`;
  const profiles = await executeRequest(profilesUrl, 'GET');

  console.log("\nProfiles in group mr martes:");
  profiles.forEach(p => {
    const decoded = decodeProfileAvatar(p.avatar_url);
    console.log({
      id: p.id,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      decoded_avatar: decoded.avatar_url,
      decoded_champion: decoded.champion_prediction,
      champion_prediction: p.champion_prediction
    });
  });
}

main().catch(console.error);
