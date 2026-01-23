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

      // Helper to send admin notification email
      const sendAdminOrderNotification = async (txData: Record<string, unknown>) => {
        try {
          const resendApiKey = Deno.env.get("RESEND_API_KEY");
          if (!resendApiKey) {
            console.error("RESEND_API_KEY not configured");
            return;
          }

          const planNames: Record<string, string> = {
            basic: "Planejador",
            premium: "Com Guia",
          };

          const paymentMethods: Record<string, string> = {
            pix: "PIX",
            boleto: "Boleto",
            credit_card: "Cartão de Crédito",
          };

          const planName = planNames[txData.plan_key as string] || txData.plan_key;
          const paymentMethod = paymentMethods[txData.payment_method as string] || txData.payment_method;
          const amountFormatted = ((txData.amount_cents as number) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          const discountFormatted = txData.discount_amount_cents 
            ? ((txData.discount_amount_cents as number) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : null;
          const createdAt = new Date(txData.created_at as string).toLocaleString('pt-BR', { 
            dateStyle: 'short', 
            timeStyle: 'short',
            timeZone: 'America/Sao_Paulo'
          });

          const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #7c3aed, #9333ea); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">💰 Nova Venda Realizada!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Pagamento confirmado via ${paymentMethod}</p>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
      <h2 style="color: #7c3aed; margin-top: 0; font-size: 18px; border-bottom: 2px solid #f4f4f5; padding-bottom: 10px;">Dados do Cliente</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 35%;">Nome:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${txData.customer_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${txData.email}" style="color: #7c3aed;">${txData.email}</a></td>
        </tr>
      </table>
      
      <h2 style="color: #7c3aed; margin-top: 25px; font-size: 18px; border-bottom: 2px solid #f4f4f5; padding-bottom: 10px;">Dados do Pedido</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 35%;">Plano:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Pagamento:</td>
          <td style="padding: 8px 0; color: #1f2937;">${paymentMethod}</td>
        </tr>
        ${txData.coupon_code ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Cupom:</td>
          <td style="padding: 8px 0; color: #16a34a; font-weight: 500;">${txData.coupon_code}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Desconto:</td>
          <td style="padding: 8px 0; color: #16a34a;">-${discountFormatted}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Valor:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 700; font-size: 18px;">${amountFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Data:</td>
          <td style="padding: 8px 0; color: #1f2937;">${createdAt}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">ID Transação:</td>
          <td style="padding: 8px 0; color: #6b7280; font-family: monospace; font-size: 12px;">${txData.id}</td>
        </tr>
      </table>
      
      <div style="margin-top: 25px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          ⚡ O acesso do cliente já foi liberado automaticamente pelo sistema.
        </p>
      </div>
      
      <div style="margin-top: 25px; text-align: center;">
        <a href="https://guiaofp.lovable.app/admin" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #9333ea); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
          Ver no Painel Admin
        </a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; padding: 15px; color: #6b7280; font-size: 12px;">
      <p style="margin: 0;">Este é um email automático do sistema OFP Planejador.</p>
      <p style="margin: 5px 0 0 0;">ID do Pagamento: ${txData.asaas_payment_id}</p>
    </div>
  </div>
</body>
</html>`;

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "OFP Planejador <noreply@ofpplanejador.com>",
              to: ["contato@ofpplanejador.com"],
              subject: `💰 Nova Venda: ${txData.customer_name} - ${planName}`,
              html: emailHtml,
            }),
          });

          if (response.ok) {
            console.log("Admin order notification email sent successfully");
          } else {
            const errorText = await response.text();
            console.error("Error sending admin notification:", errorText);
          }
        } catch (error) {
          console.error("Error sending admin order notification:", error);
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
              payload: {
                title,
                body,
                tag: "access-enabled",
                data: { url: "/dashboard", ...data },
              },
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`Push notification sent successfully:`, result);
          } else {
            const errorText = await response.text();
            console.error(`Error sending push notification:`, errorText);
          }
        } catch (error) {
          console.error(`Error sending push notification:`, error);
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

        // 5. Send push notification to inform access is enabled
        await sendPushNotification(
          authUser.id,
          "🎉 Acesso Liberado!",
          `Olá ${transaction.customer_name.split(' ')[0]}! Seu acesso ao OFP Planejador foi ativado. Toque para começar a planejar sua viagem!`,
          { plan: transaction.plan_key }
        );

        // 6. Send onboarding email (sent immediately - Resend scheduling requires paid plan)
        await sendEmail("welcome-onboarding", {
          email: transaction.email,
          name: transaction.customer_name,
        });

        // 7. Send admin notification email with order details
        await sendAdminOrderNotification(transaction);

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
