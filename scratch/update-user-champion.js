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

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage: node update-user-champion.js <username_or_display_name> <team_id>");
    return;
  }

  const username = args[0];
  const teamId = args[1].toUpperCase();

  // Validate team exists in INITIAL_TEAMS or in DB
  const validTeams = ['MEX', 'RSA', 'KOR', 'CZE', 'CAN', 'BIH', 'QAT', 'SUI', 'BRA', 'MAR', 'HAI', 'SCO',
                      'USA', 'PAR', 'AUS', 'TUR', 'GER', 'CUW', 'CIV', 'ECU', 'NED', 'JPN', 'SWE', 'TUN',
                      'BEL', 'EGY', 'IRN', 'NZL', 'ESP', 'CPV', 'KSA', 'URU', 'FRA', 'SEN', 'IRQ', 'NOR',
                      'ARG', 'ALG', 'AUT', 'JOR', 'POR', 'COD', 'UZB', 'COL', 'ENG', 'CRO', 'GHA', 'PAN'];
  
  if (!validTeams.includes(teamId)) {
    console.error(`Error: Invalid team ID '${teamId}'.`);
    return;
  }

  console.log("Fetching all profiles...");
  const profilesUrl = `${supabaseUrl}/rest/v1/profiles?select=*`;
  const profiles = await executeRequest(profilesUrl, 'GET');
  if (!profiles) return;

  const profile = profiles.find(p => {
    const name = p.display_name.trim().toLowerCase();
    const decoded = decodeProfileAvatar(p.avatar_url);
    const uname = (decoded.username || '').trim().toLowerCase();
    return name === username.toLowerCase() || uname === username.toLowerCase();
  });

  if (!profile) {
    console.error(`Error: User '${username}' not found in profiles database.`);
    return;
  }

  const decoded = decodeProfileAvatar(profile.avatar_url);
  const newEncodedAvatar = encodeProfileAvatar(
    decoded.username || profile.display_name.toLowerCase(),
    decoded.password || '1234',
    decoded.avatar_url || profile.display_name.substring(0, 2).toUpperCase(),
    teamId
  );

  console.log(`Updating '${profile.display_name}' (ID: ${profile.id}) prediction to '${teamId}'...`);
  const updateUrl = `${supabaseUrl}/rest/v1/profiles?id=eq.${profile.id}`;
  const response = await executeRequest(updateUrl, 'PATCH', {
    avatar_url: newEncodedAvatar
  });

  if (response) {
    console.log(`Successfully updated ${profile.display_name}'s champion prediction to ${teamId}!`);
  } else {
    console.error("Failed to perform the update.");
  }
}

main().catch(console.error);
