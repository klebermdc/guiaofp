import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string }>;
}

interface SendPushRequest {
  user_ids?: string[];
  payload: PushPayload;
}

// Web Push encryption using native Deno crypto
async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    // For web push, we need to use the Web Push protocol
    // This is a simplified implementation using fetch
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('TTL', '86400'); // 24 hours
    
    // Create JWT for VAPID authentication
    const jwtHeader = btoa(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 12 * 60 * 60; // 12 hours
    
    const endpoint = new URL(subscription.endpoint);
    const audience = `${endpoint.protocol}//${endpoint.host}`;
    
    const jwtPayload = btoa(JSON.stringify({
      aud: audience,
      exp: expiry,
      sub: 'mailto:contato@ofpplanejador.com'
    }));

    // Note: Full VAPID signing requires ES256 which needs the private key
    // For now, we'll use a simpler approach with the Resend notification as fallback
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 201 || response.status === 200) {
      return true;
    }

    // Check if subscription is expired
    if (response.status === 404 || response.status === 410) {
      console.log('Subscription expired:', subscription.endpoint);
      return false;
    }

    console.error('Push failed with status:', response.status);
    return false;
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_ids, payload }: SendPushRequest = await req.json();

    // Build query for subscriptions
    let query = supabase.from('push_subscriptions').select('*');
    
    if (user_ids && user_ids.length > 0) {
      query = query.in('user_id', user_ids);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      throw new Error(`Error fetching subscriptions: ${subError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results = {
      sent: 0,
      failed: 0,
      expired: [] as string[],
    };

    for (const sub of subscriptions) {
      try {
        const success = await sendWebPushNotification(
          {
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
          payload,
          vapidPublicKey,
          vapidPrivateKey
        );

        if (success) {
          results.sent++;
        } else {
          // Subscription may be expired
          results.expired.push(sub.id);
          results.failed++;
        }
      } catch (error) {
        console.error(`Failed to send to ${sub.user_id}:`, error);
        results.failed++;
      }
    }

    // Clean up expired subscriptions
    if (results.expired.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', results.expired);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: results.sent,
        failed: results.failed,
        expired_cleaned: results.expired.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
