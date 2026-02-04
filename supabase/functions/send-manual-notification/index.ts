import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManualNotificationRequest {
  emails: string[];
  subject: string;
  message: string;
  planType?: string; // Optional: 'basic' or 'premium' for recovery emails
}

async function sendEmail(to: string[], subject: string, html: string) {
  const payload = {
    from: "Orlando FastPass <contato@ofpplanejador.com>",
    to,
    subject,
    html,
  };
  
  console.log("=== RESEND REQUEST ===");
  console.log("Sending to:", to);
  console.log("Subject:", subject);
  console.log("API Key exists:", !!RESEND_API_KEY);
  console.log("API Key prefix:", RESEND_API_KEY?.substring(0, 10) + "...");
  
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  
  const responseText = await response.text();
  console.log("=== RESEND RESPONSE ===");
  console.log("Status:", response.status);
  console.log("Status Text:", response.statusText);
  console.log("Response Body:", responseText);
  
  if (!response.ok) {
    throw new Error(`Failed to send email: ${responseText}`);
  }
  
  return JSON.parse(responseText);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails, subject, message, planType }: ManualNotificationRequest = await req.json();

    // Determine checkout URL based on plan type
    const checkoutPlan = planType || 'basic';
    const checkoutUrl = `https://guiaofp.lovable.app/login?redirect=/checkout/${checkoutPlan}&recovery=true`;
    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ error: "No email recipients provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subject || !message) {
      return new Response(
        JSON.stringify({ error: "Subject and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a2e;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #16213e; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                
                <!-- Header with gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                      ✨ Orlando Fast Pass Planejador
                    </h1>
                    <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 14px;">
                      Sua viagem mágica está a um clique de distância!
                    </p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #ffffff; margin: 0 0 25px 0; font-size: 22px;">
                      ${subject}
                    </h2>
                    
                    <div style="color: #cbd5e1; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
${message}
                    </div>
                    
                    <!-- Benefits Box -->
                    <div style="background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1)); border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
                      <p style="margin: 0; color: #fbbf24; font-weight: 600; font-size: 14px;">
                        🎯 Por que escolher o Orlando Fast Pass?
                      </p>
                      <ul style="margin: 15px 0 0 0; padding-left: 20px; color: #cbd5e1; font-size: 13px;">
                        <li style="margin-bottom: 8px;">Roteiros personalizados para sua família</li>
                        <li style="margin-bottom: 8px;">Dicas exclusivas para evitar filas</li>
                        <li style="margin-bottom: 8px;">Suporte via WhatsApp durante a viagem</li>
                        <li style="margin-bottom: 0;">Economize tempo e dinheiro</li>
                      </ul>
                    </div>
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <a href="${checkoutUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                              color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; 
                              font-weight: bold; font-size: 16px; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);">
                      🚀 Finalizar Minha Compra
                    </a>
                  </td>
                </tr>
                
                <!-- Trust Badges -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="text-align: center; padding: 10px;">
                          <span style="color: #f59e0b; font-size: 20px;">🛡️</span>
                          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 11px;">Pagamento<br>Seguro</p>
                        </td>
                        <td style="text-align: center; padding: 10px;">
                          <span style="color: #f59e0b; font-size: 20px;">⭐</span>
                          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 11px;">+500 Famílias<br>Atendidas</p>
                        </td>
                        <td style="text-align: center; padding: 10px;">
                          <span style="color: #f59e0b; font-size: 20px;">💬</span>
                          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 11px;">Suporte<br>WhatsApp</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 25px; text-align: center; border-top: 1px solid #1e293b;">
                    <p style="margin: 0; color: #64748b; font-size: 12px;">
                      © ${new Date().getFullYear()} Orlando Fast Pass Planejador
                    </p>
                    <p style="margin: 10px 0 0 0; color: #475569; font-size: 11px;">
                      Dúvidas? Responda este e-mail ou entre em contato pelo WhatsApp
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    let successCount = 0;
    let failCount = 0;

    // Send emails individually to track success/failure
    for (const email of emails) {
      try {
        await sendEmail([email], subject, htmlContent);
        successCount++;
      } catch (emailError) {
        console.error(`Error sending to ${email}:`, emailError);
        failCount++;
      }
    }

    console.log(`Manual notification sent: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        failed: failCount 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error: any) {
    console.error("Error in send-manual-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

serve(handler);
