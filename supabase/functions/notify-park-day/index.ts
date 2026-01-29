import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParkDate {
  park: string;
  date: string;
  time_start?: string;
  time_end?: string;
}

interface ClientProfile {
  user_id: string;
  email: string;
  responsible_name: string;
  whatsapp: string;
  guide_name: string;
  park_dates: ParkDate[];
  plan_tier: string;
  is_access_enabled: boolean;
}

async function sendPushNotification(
  supabaseUrl: string, 
  supabaseKey: string, 
  userIds: string[], 
  payload: { title: string; body: string; tag?: string; data?: Record<string, any> }
): Promise<void> {
  try {
    await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ user_ids: userIds, payload }),
    });
  } catch (error) {
    console.error('Push notification error:', error);
  }
}

async function sendWhatsAppNotification(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string,
  template: string,
  templateData: Record<string, string>
): Promise<void> {
  try {
    await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ user_id: userId, template, template_data: templateData }),
    });
  } catch (error) {
    console.error('WhatsApp notification error:', error);
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long'
  });
}

function getParkEmoji(parkName: string): string {
  const lower = parkName.toLowerCase();
  if (lower.includes('magic kingdom')) return '🏰';
  if (lower.includes('epcot')) return '🌐';
  if (lower.includes('hollywood')) return '🎬';
  if (lower.includes('animal kingdom')) return '🦁';
  if (lower.includes('universal')) return '🎢';
  if (lower.includes('islands')) return '🏝️';
  if (lower.includes('epic')) return '🌟';
  return '🎡';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get tomorrow's date in Orlando timezone (UTC-5/UTC-4)
    const now = new Date();
    const orlandoOffset = -5 * 60; // EST offset in minutes
    const orlandoNow = new Date(now.getTime() + (now.getTimezoneOffset() + orlandoOffset) * 60000);
    
    const tomorrow = new Date(orlandoNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking park reminders for: ${tomorrowStr}`);

    // Fetch all active premium clients
    const { data: clients, error: clientsError } = await supabase
      .from('profiles')
      .select('user_id, email, responsible_name, whatsapp, guide_name, park_dates, plan_tier, is_access_enabled')
      .eq('is_access_enabled', true)
      .not('park_dates', 'is', null);

    if (clientsError) {
      throw new Error(`Error fetching clients: ${clientsError.message}`);
    }

    // Get multipass statuses
    const { data: multipassStatuses } = await supabase
      .from('multipass_status')
      .select('user_id, is_purchased');

    const multipassMap = new Map(multipassStatuses?.map(s => [s.user_id, s.is_purchased]) || []);

    let notificationsSent = 0;
    const notifiedClients: string[] = [];

    for (const client of clients || []) {
      const parkDates = (client.park_dates || []) as ParkDate[];
      
      // Find parks scheduled for tomorrow
      const tomorrowParks = parkDates.filter(pd => pd.date === tomorrowStr);
      
      if (tomorrowParks.length === 0) continue;

      const parkNames = tomorrowParks.map(p => p.park).join(', ');
      const firstPark = tomorrowParks[0];
      const parkEmoji = getParkEmoji(firstPark.park);
      const hasMultipass = multipassMap.get(client.user_id) || false;

      // Check if it's a Disney park (for MultiPass relevance)
      const isDisneyPark = ['magic kingdom', 'epcot', 'hollywood', 'animal kingdom']
        .some(dp => firstPark.park.toLowerCase().includes(dp));

      // Send Push Notification
      await sendPushNotification(supabaseUrl, supabaseServiceKey, [client.user_id], {
        title: `${parkEmoji} Amanhã é dia de parque!`,
        body: `Prepare-se para ${firstPark.park}${firstPark.time_start ? ` às ${firstPark.time_start}` : ''}. ${isDisneyPark && !hasMultipass ? 'Não esqueça do MultiPass!' : 'Bom passeio!'}`,
        tag: 'park-reminder',
        data: { url: '/dashboard', park: firstPark.park },
      });

      // Send WhatsApp for Disney parks (critical reminder)
      if (isDisneyPark && client.whatsapp) {
        await sendWhatsAppNotification(supabaseUrl, supabaseServiceKey, client.user_id, 'park_reminder', {
          name: client.responsible_name || 'Cliente',
          park: firstPark.park,
          multipass_status: hasMultipass ? 'confirmado ✅' : 'pendente ⚠️',
        });
      }

      notificationsSent++;
      notifiedClients.push(client.responsible_name || client.email);
    }

    console.log(`Park day reminders sent: ${notificationsSent}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        date: tomorrowStr,
        notifications_sent: notificationsSent,
        clients: notifiedClients,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in notify-park-day:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
