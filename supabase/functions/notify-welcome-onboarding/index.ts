import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeOnboardingRequest {
  email: string;
  customerName: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, customerName }: WelcomeOnboardingRequest = await req.json();
    
    console.log("Sending welcome onboarding email to:", email);

    const appUrl = "https://guiaofp.lovable.app";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo ao OFP Planejador</title>
      </head>
      <body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 40px 0;">
        <table role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px; width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td>
              <!-- Header -->
              <h1 style="color: #333; font-size: 28px; font-weight: bold; margin: 40px 0 20px; padding: 0; text-align: center;">
                🚀 Vamos começar?
              </h1>
              
              <!-- Greeting -->
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Olá <strong>${customerName}</strong>,
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Queremos que você aproveite ao máximo! Aqui vão algumas dicas para começar:
              </p>
              
              <!-- Tip 1 -->
              <table role="presentation" style="width: 100%; margin: 24px 0;">
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="padding: 20px; border-left: 4px solid #6366f1; background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%); border-radius: 0 8px 8px 0;">
                      <p style="font-size: 28px; margin: 0 0 8px 0;">1️⃣</p>
                      <p style="color: #333; font-size: 18px; font-weight: bold; margin: 8px 0;">Complete seu perfil</p>
                      <p style="color: #666; font-size: 14px; line-height: 22px; margin: 8px 0 0 0;">
                        Adicione suas informações de viagem para personalizar seus roteiros e receber dicas específicas para sua família.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Tip 2 -->
              <table role="presentation" style="width: 100%; margin: 24px 0;">
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="padding: 20px; border-left: 4px solid #10b981; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 0 8px 8px 0;">
                      <p style="font-size: 28px; margin: 0 0 8px 0;">2️⃣</p>
                      <p style="color: #333; font-size: 18px; font-weight: bold; margin: 8px 0;">Explore as funcionalidades</p>
                      <p style="color: #666; font-size: 14px; line-height: 22px; margin: 8px 0 0 0;">
                        Conheça a Joy (sua assistente virtual), o checklist de viagem, os roteiros de parques e muito mais!
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Tip 3 -->
              <table role="presentation" style="width: 100%; margin: 24px 0;">
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="padding: 20px; border-left: 4px solid #f59e0b; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 0 8px 8px 0;">
                      <p style="font-size: 28px; margin: 0 0 8px 0;">3️⃣</p>
                      <p style="color: #333; font-size: 18px; font-weight: bold; margin: 8px 0;">Precisa de ajuda?</p>
                      <p style="color: #666; font-size: 14px; line-height: 22px; margin: 8px 0 0 0;">
                        Nossa equipe está pronta para te ajudar! Responda este email ou use o chat na plataforma.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${appUrl}/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #0066cc, #0052a3); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      🎯 Começar Agora
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <div style="color: #8898aa; font-size: 14px; line-height: 24px; padding: 30px 40px 0; text-align: center; border-top: 1px solid #eee; margin-top: 20px;">
                <p style="margin: 0;">Responda este email com qualquer dúvida! 😊</p>
                <p style="margin: 15px 0 0 0; color: #aaa;">OFP Planejador - Sua viagem para Orlando começa aqui 🏰✨</p>
              </div>
            </td>
          </tr>
        </table>
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
        to: [email],
        subject: "🚀 Como começar com o OFP Planejador",
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Failed to send email:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Welcome onboarding email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending welcome onboarding email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
