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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendApiKey = env.RESEND_API_KEY;

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
  if (!supabaseUrl || !supabaseAnonKey || !resendApiKey) {
    console.error("Missing environment variables in .env.local");
    return;
  }

  const resend = new Resend(resendApiKey);

  console.log("Fetching latest data from Supabase REST API...");
  const profiles = await queryTable('profiles');
  const predictions = await queryTable('predictions');
  const matches = await queryTable('matches');
  const groups = await queryTable('groups');
  const groupMembers = await queryTable('group_members');
  const teams = await queryTable('teams');

  console.log("Formatting backup data...");
  // Generate structured user predictions summary
  const userPredictionsSummary = (profiles || [])
    .filter(p => !p.is_admin)
    .map(p => {
      const champ = (teams || []).find(t => t.id === p.champion_prediction);
      const champText = champ ? `${champ.name} ${champ.flag_emoji}` : 'No cargó';

      const userPreds = (predictions || [])
        .filter(pr => pr.participant_id === p.id)
        .map(pr => {
          const match = (matches || []).find(m => m.id === pr.match_id);
          if (!match) return null;
          const homeTeam = (teams || []).find(t => t.id === match.home_team_id);
          const awayTeam = (teams || []).find(t => t.id === match.away_team_id);
          
          const homeLabel = homeTeam ? `${homeTeam.name} ${homeTeam.flag_emoji}` : match.home_team_id || 'TBD';
          const awayLabel = awayTeam ? `${awayTeam.name} ${awayTeam.flag_emoji}` : match.away_team_id || 'TBD';
          
          let realResult = 'Pendiente';
          if (match.status === 'finished' || match.home_score !== null) {
            const statusLabel = match.status === 'finished' ? 'Terminado' : 'En vivo';
            realResult = `${match.home_score} - ${match.away_score} (${statusLabel})`;
          }

          return {
            partido_id: match.id,
            fase: match.phase,
            partido: `${homeLabel} vs ${awayLabel}`,
            pronostico: `${pr.home_score} - ${pr.away_score}`,
            resultado_real: realResult
          };
        })
        .filter(Boolean);

      return {
        usuario: p.display_name,
        username: p.username || p.display_name.toLowerCase(),
        campeon_predicho: champText,
        pronosticos: userPreds
      };
    });

  const backupData = {
    backup_version: "1.1",
    timestamp: new Date().toISOString(),
    profiles: profiles || [],
    predictions: predictions || [],
    matches: matches || [],
    groups: groups || [],
    groupMembers: groupMembers || [],
    teams: teams || [],
    user_predictions_summary: userPredictionsSummary
  };

  const totalUsers = profiles ? profiles.filter(p => !p.is_admin).length : 0;
  const totalPreds = predictions ? predictions.length : 0;

  let userSummaryHtml = '';
  if (profiles && teams) {
    userSummaryHtml = profiles
      .filter(p => !p.is_admin)
      .map(p => {
        const userPreds = predictions ? predictions.filter(pr => pr.participant_id === p.id).length : 0;
        const champ = teams.find(t => t.id === p.champion_prediction);
        const champText = champ ? `${champ.flag_emoji} ${champ.name}` : 'No cargó';
        return `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>${p.display_name}</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${p.username || p.display_name.toLowerCase()}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-family: monospace;">${p.password}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${userPreds}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${champText}</td>
          </tr>
        `;
      })
      .join('');
  }

  const htmlContent = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #b59469; text-transform: uppercase; border-bottom: 2px solid #b59469; padding-bottom: 10px;">Respaldo Manual - Prode Mundial 2026</h2>
      <p>Hola Ivo,</p>
      <p>Te enviamos el reporte manual solicitado con los últimos datos registrados en el Prode.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>Participantes Activos:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${totalUsers}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>Pronósticos Cargados:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${totalPreds}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>Fecha del Reporte:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('es-AR')}</td>
        </tr>
      </table>

      <h3 style="color: #222; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Resumen de Participantes</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #f2f2f2; text-align: left;">
            <th style="border: 1px solid #ddd; padding: 8px;">Display Name</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Username</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Contraseña</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Pronósticos</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Campeón</th>
          </tr>
        </thead>
        <tbody>
          ${userSummaryHtml || '<tr><td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: center;">No hay participantes activos</td></tr>'}
        </tbody>
      </table>

      <p style="margin-top: 20px; font-size: 12px; color: #444; background-color: #fcf8e3; border: 1px solid #faebcc; padding: 10px; border-radius: 4px;">
        <strong>Nota:</strong> Se ha adjuntado el archivo <code>pronosticos_usuarios.json</code> que contiene de forma detallada todos los pronósticos y campeón de cada usuario.
      </p>

      <p style="margin-top: 30px; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 15px;">
        * Este es un envío automatizado generado manualmente. Los archivos JSON adjuntos contienen todo el esquema y los datos necesarios para restaurar el estado del Prode ante cualquier falla.
      </p>
    </div>
  `;

  console.log("Sending email via Resend...");
  const result = await resend.emails.send({
    from: 'Prode Mundial <onboarding@resend.dev>',
    to: 'ivo.levy03@gmail.com',
    subject: `Respaldo Manual del Prode - ${new Date().toLocaleDateString('es-AR')}`,
    html: htmlContent,
    attachments: [
      {
        filename: `prode_backup_manual_${new Date().toISOString().split('T')[0]}.json`,
        content: Buffer.from(JSON.stringify(backupData, null, 2)).toString('base64'),
      },
      {
        filename: `pronosticos_usuarios_${new Date().toISOString().split('T')[0]}.json`,
        content: Buffer.from(JSON.stringify(userPredictionsSummary, null, 2)).toString('base64'),
      }
    ]
  });

  if (result.error) {
    console.error("Resend Error:", result.error);
  } else {
    console.log("Success! Message ID:", result.data.id);
  }
}

main().catch(console.error);
