import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewUserNotification {
  email: string;
  nome_completo: string;
  telefone: string;
  contract_id: string;
  nome_guia: string;
  start_date: string;
  end_date: string;
  parks_count: number;
  user_id: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NewUserNotification = await req.json();
    
    console.log("Sending notification for new user:", data.email);

    const formatDate = (dateStr: string) => {
      if (!dateStr) return "Não informado";
      const date = new Date(dateStr);
      return date.toLocaleDateString("pt-BR");
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background: #1f2937; color: #9ca3af; padding: 15px; border-radius: 0 0 10px 10px; font-size: 12px; }
          .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #6b7280; width: 140px; }
          .value { color: #111827; }
          .cta-button { 
            display: inline-block; 
            background: #6366f1; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin-top: 15px;
          }
          .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎢 Novo Cliente Cadastrado!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Um novo usuário se registrou na plataforma</p>
          </div>
          
          <div class="content">
            <h2 style="color: #6366f1; margin-top: 0;">Dados do Cliente</h2>
            
            <div class="info-row">
              <span class="label">Nome:</span>
              <span class="value">${data.nome_completo}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${data.email}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Telefone:</span>
              <span class="value">${data.telefone || "Não informado"}</span>
            </div>
            
            <div class="info-row">
              <span class="label">ID do Contrato:</span>
              <span class="value">${data.contract_id || "Não informado"}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Guia:</span>
              <span class="value">${data.nome_guia || "Não atribuído"}</span>
            </div>
            
            <h2 style="color: #6366f1;">Dados da Viagem</h2>
            
            <div class="info-row">
              <span class="label">Data de Início:</span>
              <span class="value">${formatDate(data.start_date)}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Data de Término:</span>
              <span class="value">${formatDate(data.end_date)}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Parques:</span>
              <span class="value">${data.parks_count} parque(s) agendado(s)</span>
            </div>
            
            <div class="alert">
              ⚠️ <strong>Ação Necessária:</strong> Este cliente precisa ter o acesso liberado manualmente no painel administrativo conforme o plano contratado.
            </div>
            
            <a href="https://guiaofp.lovable.app/admin" class="cta-button">
              Acessar Painel Admin
            </a>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">Este é um email automático do sistema OFP Planejador.</p>
            <p style="margin: 5px 0 0 0;">ID do usuário: ${data.user_id}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "OFP Planejador <noreply@ofpplanejador.com>",
        to: ["contato@ofpplanejador.com"],
        subject: `🎢 Novo Cliente Cadastrado: ${data.nome_completo}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Failed to send email:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
