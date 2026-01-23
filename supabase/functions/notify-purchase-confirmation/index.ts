import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseConfirmationRequest {
  email: string;
  customerName: string;
  productName: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, customerName, productName }: PurchaseConfirmationRequest = await req.json();
    
    console.log("Sending purchase confirmation to:", email);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Compra Confirmada</title>
      </head>
      <body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 40px 0;">
        <table role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px; width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td>
              <!-- Header with emoji and title -->
              <h1 style="color: #333; font-size: 28px; font-weight: bold; margin: 40px 0 20px; padding: 0; text-align: center;">
                🎉 Compra Confirmada!
              </h1>
              
              <!-- Greeting -->
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Olá <strong>${customerName}</strong>,
              </p>
              
              <!-- Success message -->
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Recebemos sua compra de <strong style="color: #6366f1;">${productName}</strong> com sucesso!
              </p>
              
              <!-- Highlight box -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="background-color: #f0f7ff; border-radius: 12px; padding: 24px; text-align: center; border-left: 4px solid #0066cc;">
                      <p style="color: #0066cc; font-size: 18px; font-weight: bold; margin: 0;">
                        ⏱️ Seu acesso será liberado em até 5 minutos
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Additional info -->
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Você receberá um novo email com suas credenciais de acesso em breve.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://guiaofp.lovable.app/login" 
                       style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      🎢 Acessar a Plataforma
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer message -->
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Qualquer dúvida, estamos à disposição!
              </p>
              
              <!-- Footer -->
              <div style="color: #8898aa; font-size: 14px; line-height: 24px; padding: 30px 40px 0; text-align: center; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="margin: 0;">Prepare-se para a magia! 🏰✨</p>
                <p style="margin: 10px 0 0 0; color: #aaa;">OFP Planejador - Sua viagem para Orlando começa aqui</p>
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
        subject: "🎉 Sua compra foi confirmada! - OFP Planejador",
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Failed to send email:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Purchase confirmation email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending purchase confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
