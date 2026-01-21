import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccessEnabledNotification {
  email: string;
  nome_completo: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: AccessEnabledNotification = await req.json();
    
    console.log("Sending access enabled notification to:", data.email);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px 20px; border: 1px solid #e5e7eb; }
          .footer { background: #1f2937; color: #9ca3af; padding: 20px; border-radius: 0 0 10px 10px; font-size: 12px; text-align: center; }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #6366f1, #8b5cf6); 
            color: white; 
            padding: 14px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin-top: 20px;
            font-weight: bold;
            font-size: 16px;
          }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; }
          .feature-item:last-child { border-bottom: none; }
          .check-icon { color: #10b981; margin-right: 10px; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1 style="margin: 0;">Seu Acesso Foi Liberado!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Bem-vindo(a) ao OFP Planejador</p>
          </div>
          
          <div class="content">
            <p style="font-size: 18px;">Olá, <strong>${data.nome_completo || "Cliente"}</strong>!</p>
            
            <p>Temos uma ótima notícia! Seu acesso à plataforma OFP Planejador foi liberado e agora você pode aproveitar todas as funcionalidades disponíveis no seu plano.</p>
            
            <div class="feature-list">
              <h3 style="margin-top: 0; color: #6366f1;">O que você pode fazer agora:</h3>
              
              <div class="feature-item">
                <span class="check-icon">✓</span>
                <span>Acessar seu roteiro personalizado de parques</span>
              </div>
              
              <div class="feature-item">
                <span class="check-icon">✓</span>
                <span>Consultar dicas e informações sobre atrações</span>
              </div>
              
              <div class="feature-item">
                <span class="check-icon">✓</span>
                <span>Utilizar a assistente virtual Joy para tirar dúvidas</span>
              </div>
              
              <div class="feature-item">
                <span class="check-icon">✓</span>
                <span>Acompanhar seu checklist de viagem</span>
              </div>
              
              <div class="feature-item">
                <span class="check-icon">✓</span>
                <span>Receber guiamento remoto durante sua viagem</span>
              </div>
            </div>
            
            <p style="text-align: center;">
              <a href="https://guiaofp.lovable.app/login" class="cta-button">
                🎢 Acessar a Plataforma
              </a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
              Se você tiver qualquer dúvida, não hesite em entrar em contato conosco pelo email 
              <a href="mailto:contato@ofpplanejador.com" style="color: #6366f1;">contato@ofpplanejador.com</a>.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">Prepare-se para a magia! 🏰✨</p>
            <p style="margin: 10px 0 0 0;">OFP Planejador - Sua viagem para Orlando começa aqui</p>
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
        to: [data.email],
        subject: `✅ Seu acesso ao OFP Planejador foi liberado!`,
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
