import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { title, body, adminProfileId } = await req.json();

    if (!title || !body || !adminProfileId) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos.' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 500 });
    }

    const supabaseClient = supabase;

    // 1. Verify the requester is an admin in profiles table
    const { data: adminProfile, error: profileErr } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', adminProfileId)
      .single();

    if (profileErr || !adminProfile || !adminProfile.is_admin) {
      return NextResponse.json({ error: 'No autorizado. Se requieren privilegios de administrador.' }, { status: 403 });
    }

    // 2. Load VAPID credentials
    let vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    let vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: 'Las llaves VAPID no están configuradas en el servidor.' }, { status: 500 });
    }

    // Clean keys from double/single quotes if present in env configuration
    vapidPublicKey = vapidPublicKey.replace(/^"(.*)"$/, '$1').replace(/'/g, '');
    vapidPrivateKey = vapidPrivateKey.replace(/^"(.*)"$/, '$1').replace(/'/g, '');

    webpush.setVapidDetails(
      'mailto:ivo.levy03@gmail.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    // 3. Load all push subscriptions
    const { data: subscriptions, error: subErr } = await supabaseClient
      .from('push_subscriptions')
      .select('*');

    if (subErr || !subscriptions) {
      return NextResponse.json({ error: 'Error al consultar las suscripciones en la base de datos.' }, { status: 500 });
    }

    console.log(`Found ${subscriptions.length} active push subscriptions. Sending notifications...`);

    const payload = JSON.stringify({
      title,
      body,
      url: '/matches'
    });

    let sentCount = 0;
    const sendPromises = subscriptions.map(async (subRecord) => {
      try {
        await webpush.sendNotification(subRecord.subscription, payload);
        sentCount++;
      } catch (err: any) {
        console.error(`Error sending push to subscription ${subRecord.id}:`, err);
        // If subscription is expired or revoked (410 Gone or 404 Not Found), delete it
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Deleting expired push subscription ${subRecord.id} from DB...`);
          await supabaseClient
            .from('push_subscriptions')
            .delete()
            .eq('id', subRecord.id);
        }
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, sentCount });
  } catch (error: any) {
    console.error('API Send Push Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
