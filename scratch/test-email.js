const { Resend } = require('resend');
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

const resendApiKey = env.RESEND_API_KEY;

async function main() {
  if (!resendApiKey) {
    console.error("No RESEND_API_KEY found in .env.local");
    return;
  }

  const resend = new Resend(resendApiKey);

  console.log("Sending test email via Resend...");
  const result = await resend.emails.send({
    from: 'Prode Mundial <onboarding@resend.dev>',
    to: 'ivo.levy03@gmail.com',
    subject: 'Prode - Test de Envío de Email',
    html: '<p>Este es un email de prueba para verificar que la integración con Resend funciona correctamente.</p>'
  });

  if (result.error) {
    console.error("Resend Error:", result.error);
  } else {
    console.log("Success! Message ID:", result.data.id);
  }
}

main().catch(console.error);
