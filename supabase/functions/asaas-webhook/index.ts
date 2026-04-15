import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateTemporaryPassword } from "./utils/hash.ts";
import { sendServerTrackingEvent } from "./utils/tracking.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");

// HMAC signature verification
const verifyAsaasSignature = async (
  payload: string,
  signature: string | null
): Promise<boolean> => {
  const secret = Deno.env.get("ASAAS_WEBHOOK_SECRET");
  if (!secret || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const computed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );

  const computedHex = Array.from(new Uint8Array(computed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHex === signature;
};

interface AsaasWebhookPayload {
  event: string;
  payment?: {
    id: string;
    customer: string;
    value: number;
    status: string;
    billingType: string;
    confirmedDate?: string;
    paymentDate?: string;
  };
}

const statusMap: Record<string, string> = {
  PENDING: "pending",
  RECEIVED: "confirmed",
  CONFIRMED: "confirmed",
  RECEIVED_IN_CASH: "confirmed",
  OVERDUE: "pending",
  REFUNDED: "refunded",
  REFUND_REQUESTED: "refunded",
  CHARGEBACK_REQUESTED: "cancelled",
  CHARGEBACK_DISPUTE: "cancelled",
  AWAITING_CHARGEBACK_REVERSAL: "cancelled",
  DUNNING_REQUESTED: "pending",
  DUNNING_RECEIVED: "confirmed",
  AWAITING_RISK_ANALYSIS: "pending",
};

const planNames: Record<string, string> = {
  basic: "OFP Planejador",
  premium: "Plano Premium",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Read body as text for signature verification, then parse
    const rawBody = await req.text();

    // Auth: verify HMAC signature if ASAAS_WEBHOOK_SECRET is configured
    const hmacSignature = req.headers.get("asaas-signature");
    const hasHmacSecret = !!Deno.env.get("ASAAS_WEBHOOK_SECRET");

    if (hasHmacSecret) {
      const isValid = await verifyAsaasSignature(rawBody, hmacSignature);
      if (!isValid) {
        console.error("Invalid HMAC signature on webhook");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      // Fallback: token-based auth
      const webhookToken = req.headers.get("asaas-access-token");
      if (ASAAS_WEBHOOK_TOKEN && webhookToken !== ASAAS_WEBHOOK_TOKEN) {
        console.error("Invalid webhook token received");
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    const payload: AsaasWebhookPayload = JSON.parse(rawBody);
    console.log("Received Asaas webhook:", JSON.stringify(payload, null, 2));

    if (!payload.event.startsWith("PAYMENT_")) {
      console.log("Ignoring non-payment event:", payload.event);
      return new Response(
        JSON.stringify({ success: true, message: "Event ignored" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const paymentId = payload.payment?.id;
    
    if (!paymentId) {
      console.error("No payment ID in webhook payload");
      return new Response(
        JSON.stringify({ error: "Missing payment ID" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Idempotency check — prevent duplicate processing
    const idempotencyKey = `asaas_${paymentId}_${payload.event}`;
    const { data: existingWebhook } = await supabase
      .from("webhook_idempotency")
      .select("id")
      .eq("webhook_key", idempotencyKey)
      .maybeSingle();

    if (existingWebhook) {
      console.log("Webhook already processed:", idempotencyKey);
      return new Response(
        JSON.stringify({ success: true, message: "Already processed" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const newStatus = statusMap[payload.payment?.status || ""] || "pending";
    console.log(`Updating payment ${paymentId} to status: ${newStatus}`);

    const { data: transaction, error: findError } = await supabase
      .from("transactions")
      .select("*")
      .eq("asaas_payment_id", paymentId)
      .single();

    if (findError) {
      console.error("Transaction not found:", findError);
      return new Response(
        JSON.stringify({ success: true, message: "Transaction not found, might be processing" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: newStatus,
        metadata: {
          ...((transaction.metadata as object) || {}),
          lastWebhookEvent: payload.event,
          lastWebhookAt: new Date().toISOString(),
          confirmedDate: payload.payment?.confirmedDate,
        },
      })
      .eq("asaas_payment_id", paymentId);

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      throw updateError;
    }

    // If payment is confirmed, handle the full onboarding flow
    if (newStatus === "confirmed" && transaction.status !== "confirmed") {
      console.log("Payment confirmed! Starting onboarding flow...");
      const startTime = Date.now();

      const paymentMethod = payload.payment?.billingType === 'PIX' ? 'pix' : 
                           payload.payment?.billingType === 'BOLETO' ? 'boleto' : 'credit_card';
      
      const productName = planNames[transaction.plan_key] || transaction.plan_key;

      // ===== Helper functions (with individual try/catch) =====
      
      const sendEmail = async (type: string, userData: Record<string, unknown>) => {
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/send-purchase-emails`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ type, userData }),
          });
          const text = await response.text();
          if (response.ok) {
            console.log(`✅ ${type} email sent`);
          } else {
            console.error(`❌ ${type} email failed:`, text);
          }
        } catch (error) {
          console.error(`❌ ${type} email error:`, error);
        }
      };

      const sendPushNotification = async (userId: string, title: string, body: string, data?: Record<string, unknown>) => {
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              user_ids: [userId],
              payload: { title, body, tag: "access-enabled", data: { url: "/dashboard", ...data } },
            }),
          });
          const text = await response.text();
          if (response.ok) {
            console.log(`✅ Push notification sent`);
          } else {
            console.error(`❌ Push notification failed:`, text);
          }
        } catch (error) {
          console.error(`❌ Push notification error:`, error);
        }
      };

      const sendAdminNotification = async () => {
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/resend-admin-notification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ transactionId: transaction.id }),
          });
          const text = await response.text();
          if (response.ok) {
            console.log("✅ Admin notification sent");
          } else {
            console.error("❌ Admin notification failed:", text);
          }
        } catch (error) {
          console.error("❌ Admin notification error:", error);
        }
      };

      // Server-side purchase → send to sGTM Data Client at /ofp/ endpoint
      // sGTM uses Stape Store Reader to merge with begin_checkout data (fbp, fbc, etc)
      const sendTracking = async () => {
        try {
          const sgtmUrl = 'https://stape.ofpplanejador.com/ofp/';
          const metadata = (transaction.metadata as Record<string, unknown>) || {};
          const trackingCtx = (metadata.tracking_context as Record<string, string | null>) || {};
          const amountCents = transaction.amount_cents as number;
          const planKey = transaction.plan_key as string;
          const email = transaction.email as string;
          const customerName = transaction.customer_name as string;
          const phone = (metadata.phone as string) || null;
          const couponCode = (transaction.coupon_code as string) || undefined;
          const discountCents = (transaction.discount_amount_cents as number) || 0;
          const transactionId = transaction.id as string;

          const planNames: Record<string, string> = { basic: 'Plano Básico', premium: 'Plano Premium' };
          const eventId = trackingCtx?.event_id || crypto.randomUUID();

          const payload = {
            client_id: trackingCtx?.client_id || transactionId,
            events: [{
              name: 'purchase',
              params: {
                transaction_id: transactionId,
                value: amountCents / 100,
                currency: 'BRL',
                payment_type: paymentMethod,
                coupon: couponCode || undefined,
                event_id: eventId,
                items: [{
                  item_id: planKey,
                  item_name: planNames[planKey] || planKey,
                  item_category: 'Plano de Viagem',
                  item_brand: 'Orlando Fast Pass',
                  price: amountCents / 100,
                  quantity: 1,
                  ...(couponCode ? { coupon: couponCode } : {}),
                  ...(discountCents > 0 ? { discount: discountCents / 100 } : {}),
                }],
                // User data for Enhanced Conversions
                user_data: {
                  email_address: email,
                  phone_number: phone || undefined,
                  address: {
                    first_name: customerName?.split(' ')[0] || '',
                    last_name: customerName?.split(' ').slice(1).join(' ') || '',
                    country: 'BR',
                  },
                },
              },
            }],
            // Browser context from begin_checkout (for attribution)
            ...(trackingCtx?.user_agent ? { user_agent: trackingCtx.user_agent } : {}),
            ...(trackingCtx?.page_location ? { page_location: trackingCtx.page_location } : {}),
            ...(trackingCtx?.fbp ? { fbp: trackingCtx.fbp } : {}),
            ...(trackingCtx?.fbc ? { fbc: trackingCtx.fbc } : {}),
          };

          const response = await fetch(sgtmUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          console.log(`✅ sGTM purchase sent to /ofp/: ${response.status}`);
        } catch (error) {
          console.error('❌ sGTM tracking error:', error);
        }
      };

      // ===== PHASE 1: CRITICAL PATH (sequential — must succeed) =====

      // 1a. Check if user already exists
      const { data: usersData } = await supabase.auth.admin.listUsers();
      let authUser = usersData?.users?.find(u => u.email === transaction.email);
      let tempPassword: string | null = null;

      // 1b. Create user if doesn't exist
      if (!authUser) {
        console.log("Creating new user account for:", transaction.email);
        tempPassword = generateTemporaryPassword();

        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: transaction.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            name: transaction.customer_name,
            product: productName,
            plan_tier: transaction.plan_key,
          },
        });

        if (createError) {
          console.error("❌ Error creating user:", createError);
        } else {
          authUser = newUser.user;
          console.log("✅ User created:", authUser?.id);
        }
      }

      if (authUser?.id) {
        // 1c. Enable access and set plan tier
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_access_enabled: true,
            plan_tier: transaction.plan_key,
            responsible_name: transaction.customer_name,
          })
          .eq("user_id", authUser.id);

        if (profileError) {
          console.error("❌ Error updating profile:", profileError);
        } else {
          console.log("✅ User access enabled for:", transaction.email);
        }

        // 1d. Update transaction with user info
        try {
          await supabase
            .from("transactions")
            .update({
              user_id: authUser.id,
              metadata: {
                ...((transaction.metadata as object) || {}),
                userCreatedAt: new Date().toISOString(),
              },
            })
            .eq("id", transaction.id);
        } catch (err) {
          console.error("❌ Error updating transaction with user ID:", err);
        }

        // ===== PHASE 2: PARALLEL =====
        console.log("Starting parallel operations...");
        
        const parallelResults = await Promise.allSettled([
          sendEmail("purchase-confirmation", {
            email: transaction.email,
            name: transaction.customer_name,
            product: productName,
          }),
          sendEmail("access-granted", {
            email: transaction.email,
            name: transaction.customer_name,
            tempPassword: tempPassword || undefined,
          }),
          sendPushNotification(
            authUser.id,
            "🎉 Acesso Liberado!",
            `Olá ${transaction.customer_name.split(' ')[0]}! Seu acesso ao OFP Planejador foi ativado.`,
            { plan: transaction.plan_key }
          ),
          sendAdminNotification(),
          sendTracking(),
        ]);

        const labels = ['purchase-email', 'access-email', 'push', 'admin-notif', 'tracking'];
        parallelResults.forEach((result, i) => {
          if (result.status === 'rejected') {
            console.error(`❌ ${labels[i]} rejected:`, result.reason);
          }
        });

        const elapsed = Date.now() - startTime;
        console.log(`✅ Full onboarding completed for ${transaction.email} in ${elapsed}ms`);
      } else {
        console.log("Could not process user, storing for manual activation:", transaction.email);
        try {
          await supabase
            .from("transactions")
            .update({
              metadata: {
                ...((transaction.metadata as object) || {}),
                pendingActivation: true,
              },
            })
            .eq("id", transaction.id);
        } catch (err) {
          console.error("❌ Error marking pending activation:", err);
        }
      }
    }

    // Mark webhook as processed (idempotency)
    await supabase
      .from("webhook_idempotency")
      .insert({ webhook_key: idempotencyKey });

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in asaas-webhook:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
