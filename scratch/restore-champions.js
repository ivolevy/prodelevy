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

function encodeProfileAvatar(username, password, avatarUrl, championPrediction) {
  const u = username || '';
  const p = password || '';
  const av = avatarUrl || '';
  const cp = championPrediction || '';
  return `__CREDENTIALS__:${u}:${p}:${av}:${cp}`;
}

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

// EDIT THIS OBJECT WITH THE RESTORED PREDICTIONS:
// Format: { "display_name": "TEAM_ID" }
// E.g., { "gafas": "BRA", "walo": "FRA", "alfie": "GER", "luca": "URU", "nino": "ARG" }
const RESTORED_PREDICTIONS = {
  // Add values here once retrieved
};

async function main() {
  if (Object.keys(RESTORED_PREDICTIONS).length === 0) {
    console.log("Error: RESTORED_PREDICTIONS is empty. Please edit the script to add the selections.");
    return;
  }

  console.log("Fetching all profiles...");
  const profilesUrl = `${supabaseUrl}/rest/v1/profiles?select=*`;
  const profiles = await executeRequest(profilesUrl, 'GET');
  
  if (!profiles || profiles.length === 0) {
    console.error("No profiles found in Supabase.");
    return;
  }

  console.log("Starting restore process...");
  for (const p of profiles) {
    const displayNameClean = p.display_name.trim().toLowerCase();
    
    // Find matching restore key
    const matchKey = Object.keys(RESTORED_PREDICTIONS).find(k => k.trim().toLowerCase() === displayNameClean);
    
    if (matchKey) {
      const teamId = RESTORED_PREDICTIONS[matchKey].toUpperCase();
      const decoded = decodeProfileAvatar(p.avatar_url);
      
      const newEncodedAvatar = encodeProfileAvatar(
        decoded.username || p.display_name.toLowerCase(),
        decoded.password || '1234',
        decoded.avatar_url || p.display_name.substring(0, 2).toUpperCase(),
        teamId
      );

      console.log(`Updating ${p.display_name} (ID: ${p.id}): Set champion to ${teamId}`);
      
      const updateUrl = `${supabaseUrl}/rest/v1/profiles?id=eq.${p.id}`;
      await executeRequest(updateUrl, 'PATCH', {
        champion_prediction: teamId,
        avatar_url: newEncodedAvatar
      });
    }
  }

  console.log("Restore complete! Please refresh the admin panel or store data to verify.");
}

main().catch(console.error);
