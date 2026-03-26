import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateTemporaryPassword } from "./utils/hash.ts";
import { sendServerTrackingEvent } from "./utils/tracking.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");

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
    const webhookToken = req.headers.get("asaas-access-token");
    
    if (ASAAS_WEBHOOK_TOKEN && webhookToken !== ASAAS_WEBHOOK_TOKEN) {
      console.error("Invalid webhook token received");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const payload: AsaasWebhookPayload = await req.json();
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

      const sendTracking = async () => {
        try {
          if (paymentMethod !== 'credit_card') {
            await sendServerTrackingEvent(supabase, transaction, paymentMethod);
            console.log('✅ Server tracking sent');
          } else {
            console.log('⏭️ Skipping server tracking for credit card (already tracked client-side)');
          }
        } catch (error) {
          console.error('❌ Server tracking error:', error);
        }
      };

      // ===== PHASE 1: CRITICAL PATH (sequential — must succeed) =====
      // These operations depend on each other and are essential for user access

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
        // 1c. Enable access and set plan tier (CRITICAL — must happen before anything else)
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

        // ===== PHASE 2: PARALLEL — all independent operations at once =====
        // None of these should block each other. If one fails, the others still run.
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

        // Log summary of parallel results
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
