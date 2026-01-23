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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook token if configured
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

    // Only process payment events
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

    // Map Asaas status to our status
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

    // Find and update the transaction
    const { data: transaction, error: findError } = await supabase
      .from("transactions")
      .select("*")
      .eq("asaas_payment_id", paymentId)
      .single();

    if (findError) {
      console.error("Transaction not found:", findError);
      // Transaction might not exist yet, that's okay
      return new Response(
        JSON.stringify({ success: true, message: "Transaction not found, might be processing" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update transaction status
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

    // If payment is confirmed, enable user access and send emails
    if (newStatus === "confirmed" && transaction.status !== "confirmed") {
      console.log("Payment confirmed! Enabling user access...");

      // Send purchase confirmation email immediately
      try {
        const planNames: Record<string, string> = {
          basic: "Plano Básico",
          premium: "Plano Premium",
        };
        
        const confirmationResponse = await fetch(`${supabaseUrl}/functions/v1/notify-purchase-confirmation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            email: transaction.email,
            customerName: transaction.customer_name,
            productName: planNames[transaction.plan_key] || transaction.plan_key,
          }),
        });

        if (confirmationResponse.ok) {
          console.log("Purchase confirmation email sent to:", transaction.email);
        } else {
          const errorText = await confirmationResponse.text();
          console.error("Error sending purchase confirmation:", errorText);
        }
      } catch (confirmError) {
        console.error("Error sending purchase confirmation:", confirmError);
      }

      // Find user by email - list users and filter
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const authUser = usersData?.users?.find(u => u.email === transaction.email);

      if (authUser?.id) {
        // Update profile to enable access and set plan
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_access_enabled: true,
            plan_tier: transaction.plan_key,
          })
          .eq("user_id", authUser.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        } else {
          console.log("User access enabled for:", transaction.email);
        }

        // Get user profile for name
        const { data: profile } = await supabase
          .from("profiles")
          .select("responsible_name")
          .eq("user_id", authUser.id)
          .single();

        // Send welcome/access enabled email
        try {
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/notify-access-enabled`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              email: transaction.email,
              nome_completo: profile?.responsible_name || transaction.customer_name,
            }),
          });

          if (emailResponse.ok) {
            console.log("Welcome email sent successfully to:", transaction.email);
          } else {
            const errorText = await emailResponse.text();
            console.error("Error sending welcome email:", errorText);
          }
        } catch (emailError) {
          console.error("Error sending welcome email:", emailError);
        }
      } else {
        console.log("User not found by email, storing for later activation:", transaction.email);
        // Store in metadata for later activation when user registers
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
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in asaas-webhook:", error);
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
