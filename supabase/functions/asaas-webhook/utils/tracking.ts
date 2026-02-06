import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hashData } from "./hash.ts";

const PLAN_NAMES: Record<string, string> = {
  basic: 'Plano Básico',
  premium: 'Plano Premium',
};

// Send server-side tracking event (sGTM / Facebook CAPI)
export async function sendServerTrackingEvent(
  supabase: ReturnType<typeof createClient>,
  transaction: Record<string, unknown>,
  paymentMethod: string
): Promise<void> {
  try {
    // Fetch tracking configuration
    const { data: trackingConfigs } = await supabase
      .from('tracking_config')
      .select('config_key, config_value, is_active')
      .in('config_key', ['sgtm_url', 'fb_pixel_id', 'fb_access_token', 'fb_test_event_code']);

    if (!trackingConfigs || trackingConfigs.length === 0) {
      console.log('No tracking config found, skipping server tracking');
      return;
    }

    const configMap: Record<string, string | null> = {};
    trackingConfigs.forEach((c: { config_key: string; config_value: string | null; is_active: boolean }) => {
      if (c.is_active) {
        configMap[c.config_key] = c.config_value;
      }
    });

    const sgtmUrl = configMap['sgtm_url'];
    const fbPixelId = configMap['fb_pixel_id'];
    const fbAccessToken = configMap['fb_access_token'];
    const fbTestEventCode = configMap['fb_test_event_code'];

    const email = transaction.email as string;
    const customerName = transaction.customer_name as string;
    const amountCents = transaction.amount_cents as number;
    const planKey = transaction.plan_key as string;
    const transactionId = transaction.id as string;

    // Hash user data for privacy
    const hashedEmail = email ? await hashData(email) : null;
    const eventTime = Math.floor(Date.now() / 1000);

    // 1. Send to sGTM (if configured)
    if (sgtmUrl) {
      try {
        const sgtmPayload = {
          client_id: transactionId,
          events: [{
            name: 'purchase',
            params: {
              transaction_id: transactionId,
              value: amountCents / 100,
              currency: 'BRL',
              payment_type: paymentMethod,
              items: [{
                item_id: planKey,
                item_name: PLAN_NAMES[planKey] || planKey,
                price: amountCents / 100,
                quantity: 1,
              }],
              user_data: {
                email_address: hashedEmail,
                address: {
                  first_name: customerName?.split(' ')[0] || '',
                },
              },
            },
          }],
          user_properties: {
            customer_name: customerName,
            plan: planKey,
          },
        };

        const sgtmResponse = await fetch(`${sgtmUrl}/g/collect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sgtmPayload),
        });

        console.log(`sGTM tracking sent: ${sgtmResponse.status}`);
      } catch (sgtmError) {
        console.error('Error sending to sGTM:', sgtmError);
      }
    }

    // 2. Send to Facebook CAPI (if configured)
    if (fbPixelId && fbAccessToken) {
      try {
        const fbPayload = {
          data: [{
            event_name: 'Purchase',
            event_time: eventTime,
            action_source: 'website',
            event_source_url: 'https://guiaofp.lovable.app/checkout',
            user_data: {
              em: hashedEmail ? [hashedEmail] : undefined,
              fn: customerName ? [await hashData(customerName.split(' ')[0])] : undefined,
            },
            custom_data: {
              currency: 'BRL',
              value: amountCents / 100,
              content_ids: [planKey],
              content_type: 'product',
              content_name: PLAN_NAMES[planKey] || planKey,
              order_id: transactionId,
              payment_method: paymentMethod,
            },
          }],
          ...(fbTestEventCode ? { test_event_code: fbTestEventCode } : {}),
        };

        const fbResponse = await fetch(
          `https://graph.facebook.com/v18.0/${fbPixelId}/events?access_token=${fbAccessToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fbPayload),
          }
        );

        const fbResult = await fbResponse.json();
        console.log(`Facebook CAPI sent:`, fbResult);
      } catch (fbError) {
        console.error('Error sending to Facebook CAPI:', fbError);
      }
    }

    console.log('Server-side tracking completed for transaction:', transactionId);
  } catch (error) {
    console.error('Error in server tracking:', error);
  }
}
