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

const resendApiKey = env.RESEND_API_KEY;

async function executeGet(url) {
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'User-Agent': 'prode-backup-retriever/1.0'
    }
  });
  if (!res.ok) {
    console.error(`HTTP error on GET ${url}:`, res.status, await res.text());
    return null;
  }
  return await res.json();
}

async function main() {
  if (!resendApiKey) {
    console.error("Missing RESEND_API_KEY in .env.local");
    return;
  }

  console.log("Listing sent emails from Resend...");
  const listUrl = "https://api.resend.com/emails";
  const emailList = await executeGet(listUrl);

  if (!emailList || !emailList.data || emailList.data.length === 0) {
    console.log("No sent emails found or API returned empty list:", emailList);
    return;
  }

  console.log(`Found ${emailList.data.length} emails. Details:`);
  emailList.data.forEach(e => {
    console.log(`ID: ${e.id} | Subject: ${e.subject} | Created At: ${e.created_at} | To: ${e.to}`);
  });

  // Let's retrieve the content of the most recent backup email
  const backupEmail = emailList.data.find(e => e.subject.includes("Respaldo"));
  if (!backupEmail) {
    console.log("No email with subject including 'Respaldo' found.");
    return;
  }

  console.log(`\nRetrieving content for email ID: ${backupEmail.id} ("${backupEmail.subject}")...`);
  const detailsUrl = `https://api.resend.com/emails/${backupEmail.id}`;
  const emailDetails = await executeGet(detailsUrl);

  if (emailDetails) {
    console.log("\n--- HTML CONTENT ---");
    console.log(emailDetails.html);
    console.log("\n--- END OF HTML CONTENT ---");
    
    // Save to a file for easy viewing
    const outputPath = path.join(__dirname, 'recovered_email_body.html');
    fs.writeFileSync(outputPath, emailDetails.html || '');
    console.log(`Saved HTML body to ${outputPath}`);
  } else {
    console.error("Failed to fetch email details.");
  }
}

main().catch(console.error);
