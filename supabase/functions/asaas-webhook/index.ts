import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Generate a secure temporary password
function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const specialChars = "!@#$%";
  let password = "";
  
  // 8 alphanumeric chars
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Add 1 special char
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  return password;
}

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

      const planNames: Record<string, string> = {
        basic: "Plano Básico",
        premium: "Plano Premium",
      };
      const productName = planNames[transaction.plan_key] || transaction.plan_key;

      // Helper to send emails via unified function
      const sendEmail = async (type: string, userData: Record<string, unknown>, scheduleDelay?: number) => {
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/send-purchase-emails`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ type, userData, scheduleDelay }),
          });
          
          if (response.ok) {
            console.log(`${type} email sent successfully`);
          } else {
            const errorText = await response.text();
            console.error(`Error sending ${type} email:`, errorText);
          }
        } catch (error) {
          console.error(`Error sending ${type} email:`, error);
        }
      };

      // 1. Send purchase confirmation email immediately
      await sendEmail("purchase-confirmation", {
        email: transaction.email,
        name: transaction.customer_name,
        product: productName,
      });

      // Check if user already exists
      const { data: usersData } = await supabase.auth.admin.listUsers();
      let authUser = usersData?.users?.find(u => u.email === transaction.email);
      let tempPassword: string | null = null;

      // 2. Create user if doesn't exist
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
          console.error("Error creating user:", createError);
        } else {
          authUser = newUser.user;
          console.log("User created successfully:", authUser?.id);

          // Update transaction with user info
          await supabase
            .from("transactions")
            .update({
              user_id: authUser?.id,
              metadata: {
                ...((transaction.metadata as object) || {}),
                userCreatedAt: new Date().toISOString(),
              },
            })
            .eq("id", transaction.id);
        }
      }

      if (authUser?.id) {
        // 3. Enable access and set plan tier
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_access_enabled: true,
            plan_tier: transaction.plan_key,
            responsible_name: transaction.customer_name,
          })
          .eq("user_id", authUser.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        } else {
          console.log("User access enabled for:", transaction.email);
        }

        // 4. Send access-granted email with or without temp password
        await sendEmail("access-granted", {
          email: transaction.email,
          name: transaction.customer_name,
          tempPassword: tempPassword || undefined,
        });

        // 5. Schedule onboarding email for 2 hours later
        const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
        await sendEmail("welcome-onboarding", {
          email: transaction.email,
          name: transaction.customer_name,
        }, TWO_HOURS_MS);

        console.log("Full onboarding flow completed for:", transaction.email);
      } else {
        console.log("Could not process user, storing for manual activation:", transaction.email);
        await supabase
          .from("transactions")
          .update({
            metadata: {
              ...((transaction.metadata as object) || {}),
              pendingActivation: true,
            },
          })
          .eq("id", transaction.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in asaas-webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
