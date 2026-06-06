import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Authorization Check for Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return new Response('Unauthorized', { status: 401 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is not configured' }, { status: 500 });
  }

  try {
    // Fetch all relevant data from database
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: predictions } = await supabase.from('predictions').select('*');
    const { data: matches } = await supabase.from('matches').select('*');
    const { data: groups } = await supabase.from('groups').select('*');
    const { data: groupMembers } = await supabase.from('group_members').select('*');
    const { data: teams } = await supabase.from('teams').select('*');

    const backupData = {
      backup_version: "1.0",
      timestamp: new Date().toISOString(),
      profiles: profiles || [],
      predictions: predictions || [],
      matches: matches || [],
      groups: groups || [],
      groupMembers: groupMembers || [],
      teams: teams || []
    };

    // Construct a compact HTML summary
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
        <h2 style="color: #b59469; text-transform: uppercase; border-bottom: 2px solid #b59469; padding-bottom: 10px;">Respaldo Diario - Prode Mundial 2026</h2>
        <p>Hola Ivo,</p>
        <p>Te enviamos el reporte automático de las últimas 24 horas del Prode Mundial.</p>
        
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

        <p style="margin-top: 30px; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 15px;">
          * Este es un envío automatizado generado por Vercel Cron. El archivo JSON adjunto contiene todo el esquema y los datos necesarios para restaurar el estado del Prode ante cualquier falla.
        </p>
      </div>
    `;

    const resend = new Resend(resendApiKey);
    const emailResult = await resend.emails.send({
      from: 'Prode Mundial <onboarding@resend.dev>',
      to: 'ivo.levy03@gmail.com',
      subject: `Respaldo Diario del Prode - ${new Date().toLocaleDateString('es-AR')}`,
      html: htmlContent,
      attachments: [
        {
          filename: `prode_backup_${new Date().toISOString().split('T')[0]}.json`,
          content: Buffer.from(JSON.stringify(backupData, null, 2)).toString('base64'),
        }
      ]
    });

    if (emailResult.error) {
      console.error('Error sending email via Resend:', emailResult.error);
      return NextResponse.json({ error: emailResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: emailResult.data?.id });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
  }
}
