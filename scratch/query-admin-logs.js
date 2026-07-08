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
  console.log("Fetching admin logs...");
  const logsUrl = `${supabaseUrl}/rest/v1/admin_logs?select=*&order=created_at.desc`;
  const logs = await executeRequest(logsUrl, 'GET');
  console.log(`Found ${logs ? logs.length : 0} logs.`);
  
  if (logs) {
    logs.slice(0, 30).forEach(log => {
      console.log(`[${log.created_at}] Action: ${log.action}`);
      console.log("Details:", JSON.stringify(log.details, null, 2));
      console.log("-".repeat(50));
    });
  }
}

main().catch(console.error);
