import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccessEnabledNotification {
  email: string;
  nome_completo: string;
  temporary_password?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: AccessEnabledNotification = await req.json();
    
    console.log("Sending access enabled notification to:", data.email);

    const loginUrl = "https://guiaofp.lovable.app/login";
    const customerName = data.nome_completo || "Cliente";
    const temporaryPassword = data.temporary_password;

    // Use credentials template if temporary password is provided
    const emailHtml = temporaryPassword ? `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acesso Liberado</title>
      </head>
      <body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 40px 0;">
        <table role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px; width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td>
              <!-- Header -->
              <h1 style="color: #333; font-size: 28px; font-weight: bold; margin: 40px 0 20px; padding: 0; text-align: center;">
                🎉 Bem-vindo!
              </h1>
              
              <!-- Greeting -->
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Olá <strong>${customerName}</strong>,
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Seu acesso está 100% liberado! Use as credenciais abaixo para fazer login:
              </p>
              
              <!-- Credentials Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px;">
                      <p style="color: #666; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">📧 Email:</p>
                      <div style="background-color: #fff; border: 1px solid #e1e4e8; border-radius: 6px; color: #0366d6; font-size: 16px; font-family: monospace; padding: 12px; margin: 0 0 16px 0;">
                        ${data.email}
                      </div>
                      
                      <p style="color: #666; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">🔑 Senha temporária:</p>
                      <div style="background-color: #fff; border: 1px solid #e1e4e8; border-radius: 6px; color: #0366d6; font-size: 18px; font-family: monospace; padding: 12px; margin: 0; font-weight: bold; letter-spacing: 1px;">
                        ${temporaryPassword}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${loginUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #0066cc, #0052a3); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      🚀 Acessar Agora
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 40px;" />
              
              <!-- Important warning -->
              <table role="presentation" style="width: 100%; margin: 20px 0;">
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; color: #856404; font-size: 14px; padding: 16px; text-align: center;">
                      ⚠️ <strong>Importante:</strong> Troque sua senha no primeiro acesso!
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <div style="color: #8898aa; font-size: 14px; line-height: 24px; padding: 30px 40px 0; text-align: center; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="margin: 0;">Problemas para acessar? Responda este email.</p>
                <p style="margin: 10px 0 0 0; color: #aaa;">OFP Planejador - Sua viagem para Orlando começa aqui 🏰✨</p>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acesso Liberado</title>
      </head>
      <body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 40px 0;">
        <table role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px; width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td>
              <!-- Header -->
              <h1 style="color: #333; font-size: 28px; font-weight: bold; margin: 40px 0 20px; padding: 0; text-align: center;">
                ✅ Seu Acesso Foi Liberado!
              </h1>
              
              <p style="color: #6366f1; font-size: 16px; text-align: center; margin: 0 0 30px 0;">
                Bem-vindo(a) ao OFP Planejador
              </p>
              
              <!-- Greeting -->
              <p style="color: #333; font-size: 18px; line-height: 26px; padding: 0 40px;">
                Olá, <strong>${customerName}</strong>!
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px;">
                Temos uma ótima notícia! Seu acesso à plataforma OFP Planejador foi liberado e agora você pode aproveitar todas as funcionalidades disponíveis no seu plano.
              </p>
              
              <!-- Features Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; border-left: 4px solid #6366f1;">
                      <h3 style="margin: 0 0 16px 0; color: #6366f1; font-size: 16px;">O que você pode fazer agora:</h3>
                      
                      <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center;">
                        <span style="color: #10b981; margin-right: 10px; font-size: 16px;">✓</span>
                        <span style="color: #333; font-size: 14px;">Acessar seu roteiro personalizado de parques</span>
                      </div>
                      
                      <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center;">
                        <span style="color: #10b981; margin-right: 10px; font-size: 16px;">✓</span>
                        <span style="color: #333; font-size: 14px;">Consultar dicas e informações sobre atrações</span>
                      </div>
                      
                      <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center;">
                        <span style="color: #10b981; margin-right: 10px; font-size: 16px;">✓</span>
                        <span style="color: #333; font-size: 14px;">Utilizar a assistente virtual Joy para tirar dúvidas</span>
                      </div>
                      
                      <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center;">
                        <span style="color: #10b981; margin-right: 10px; font-size: 16px;">✓</span>
                        <span style="color: #333; font-size: 14px;">Acompanhar seu checklist de viagem</span>
                      </div>
                      
                      <div style="padding: 10px 0; display: flex; align-items: center;">
                        <span style="color: #10b981; margin-right: 10px; font-size: 16px;">✓</span>
                        <span style="color: #333; font-size: 14px;">Receber guiamento remoto durante sua viagem</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${loginUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      🎢 Acessar a Plataforma
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Contact info -->
              <p style="color: #6b7280; font-size: 14px; line-height: 24px; padding: 0 40px; text-align: center;">
                Se você tiver qualquer dúvida, não hesite em entrar em contato conosco pelo email 
                <a href="mailto:contato@ofpplanejador.com" style="color: #6366f1;">contato@ofpplanejador.com</a>.
              </p>
              
              <!-- Footer -->
              <div style="color: #8898aa; font-size: 14px; line-height: 24px; padding: 30px 40px 0; text-align: center; background: #1f2937; border-radius: 0 0 12px 12px; margin-top: 30px;">
                <p style="margin: 0; color: #fff;">Prepare-se para a magia! 🏰✨</p>
                <p style="margin: 10px 0 0 0; color: #9ca3af;">OFP Planejador - Sua viagem para Orlando começa aqui</p>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const subject = temporaryPassword 
      ? `🎉 Seu acesso está liberado! - OFP Planejador`
      : `✅ Seu acesso ao OFP Planejador foi liberado!`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "OFP Planejador <noreply@ofpplanejador.com>",
        to: [data.email],
        subject,
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
