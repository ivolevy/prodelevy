const fs = require('fs');
const path = require('path');

// Parse .env.local manually
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

async function queryTable(tableName) {
  const url = `${supabaseUrl}/rest/v1/${tableName}?select=*`;
  const res = await fetch(url, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  });
  if (!res.ok) {
    console.error(`Error querying ${tableName}:`, res.status, await res.text());
    return [];
  }
  return await res.json();
}

async function main() {
  const groups = await queryTable('groups');
  const groupMembers = await queryTable('group_members');
  const profiles = await queryTable('profiles');

  console.log("Groups in DB:");
  console.log(groups.map(g => ({ id: g.id, name: g.name, code: g.invite_code })));

  console.log("\nGroup Members in DB:");
  console.log(groupMembers.map(gm => {
    const p = profiles.find(prof => prof.id === gm.profile_id);
    const g = groups.find(gr => gr.id === gm.group_id);
    return {
      group_name: g ? g.name : gm.group_id,
      profile_name: p ? p.display_name : gm.profile_id
    };
  }));
}

main().catch(console.error);
