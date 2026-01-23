import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendRequest {
  transactionId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { transactionId }: ResendRequest = await req.json();

    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }

    // Fetch transaction data
    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (txError || !txData) {
      throw new Error("Transaction not found");
    }

    console.log("Resending admin notification for transaction:", txData.id);

    const planNames: Record<string, string> = {
      basic: "Planejador",
      premium: "Com Guia",
    };

    const paymentMethods: Record<string, string> = {
      pix: "PIX",
      boleto: "Boleto",
      credit_card: "Cartão de Crédito",
    };

    const planName = planNames[txData.plan_key] || txData.plan_key;
    const paymentMethod = paymentMethods[txData.payment_method] || txData.payment_method;
    const amountFormatted = (txData.amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const discountFormatted = txData.discount_amount_cents 
      ? (txData.discount_amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : null;
    const createdAt = new Date(txData.created_at).toLocaleString('pt-BR', { 
      dateStyle: 'short', 
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo'
    });

    const statusLabels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      received: "Recebido",
      refunded: "Reembolsado",
      cancelled: "Cancelado",
    };
    const statusLabel = statusLabels[txData.status] || txData.status;

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
      <h1 style="color: white; margin: 0; font-size: 24px;">Notificacao de Venda (Reenvio)</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Status: ${statusLabel} | ${paymentMethod}</p>
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
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Status:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${statusLabel}</td>
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
          <td style="padding: 8px 0; color: #6b7280;">ID Transacao:</td>
          <td style="padding: 8px 0; color: #6b7280; font-family: monospace; font-size: 12px;">${txData.id}</td>
        </tr>
      </table>
      
      <div style="margin-top: 25px; padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          Este email foi reenviado manualmente pelo painel administrativo.
        </p>
      </div>
      
      <div style="margin-top: 25px; text-align: center;">
        <a href="https://guiaofp.lovable.app/admin" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #9333ea); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
          Ver no Painel Admin
        </a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; padding: 15px; color: #6b7280; font-size: 12px;">
      <p style="margin: 0;">Este e um email automatico do sistema OFP Planejador.</p>
      <p style="margin: 5px 0 0 0;">ID do Pagamento: ${txData.asaas_payment_id || 'N/A'}</p>
    </div>
  </div>
</body>
</html>`;

    const plainText = `
NOTIFICACAO DE VENDA (REENVIO)
Status: ${statusLabel} | ${paymentMethod}

DADOS DO CLIENTE:
- Nome: ${txData.customer_name}
- Email: ${txData.email}

DADOS DO PEDIDO:
- Plano: ${planName}
- Pagamento: ${paymentMethod}
- Status: ${statusLabel}
${txData.coupon_code ? `- Cupom: ${txData.coupon_code}\n- Desconto: -${discountFormatted}` : ''}
- Valor: ${amountFormatted}
- Data: ${createdAt}
- ID Transacao: ${txData.id}

Este email foi reenviado manualmente pelo painel administrativo.

Ver no Painel Admin: https://guiaofp.lovable.app/admin

---
Este e um email automatico do sistema OFP Planejador.
ID do Pagamento: ${txData.asaas_payment_id || 'N/A'}
    `.trim();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "OFP Planejador <contato@ofpplanejador.com>",
        to: ["contato@ofpplanejador.com"],
        reply_to: "contato@ofpplanejador.com",
        subject: `[Reenvio] Venda: ${txData.customer_name} - ${planName}`,
        html: emailHtml,
        text: plainText,
        headers: {
          "X-Entity-Ref-ID": `admin-resend-${Date.now()}`,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error sending email:", errorText);
      throw new Error("Failed to send email");
    }

    console.log("Admin notification resent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Email reenviado com sucesso" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in resend-admin-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
