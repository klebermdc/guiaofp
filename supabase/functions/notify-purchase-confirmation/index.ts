import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "OFP Planejador <contato@ofpplanejador.com>";
const REPLY_TO_EMAIL = "contato@ofpplanejador.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseConfirmationRequest {
  email: string;
  customerName: string;
  productName: string;
}

// Generate plain text version from HTML
const htmlToPlainText = (html: string): string => {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, customerName, productName }: PurchaseConfirmationRequest = await req.json();
    
    console.log("Sending purchase confirmation to:", email);

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Compra Confirmada - OFP Planejador</title>
      </head>
      <body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 40px 0;">
        <table role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px; width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td>
              <h1 style="color: #333; font-size: 28px; font-weight: bold; margin: 40px 0 20px; padding: 0; text-align: center;">
                Compra Confirmada!
              </h1>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Ola ${customerName},
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Recebemos sua compra de <strong style="color: #6366f1;">${productName}</strong> com sucesso!
              </p>
              
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="background-color: #f0f7ff; border-radius: 12px; padding: 24px; text-align: center; border-left: 4px solid #0066cc;">
                      <p style="color: #0066cc; font-size: 18px; font-weight: bold; margin: 0;">
                        Seu acesso sera liberado em ate 5 minutos
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Voce recebera um novo email com suas credenciais de acesso em breve.
              </p>
              
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://guiaofp.lovable.app/login" 
                       style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Acessar a Plataforma
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 40px; text-align: center;">
                Qualquer duvida, estamos a disposicao!
              </p>
              
              <div style="color: #8898aa; font-size: 14px; line-height: 24px; padding: 30px 40px 0; text-align: center; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="margin: 0;">Prepare-se para a magia!</p>
                <p style="margin: 10px 0 0 0; color: #aaa;">OFP Planejador - Sua viagem para Orlando comeca aqui</p>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const plainText = htmlToPlainText(emailHtml);
    const subject = "Sua compra foi confirmada! - OFP Planejador";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        reply_to: REPLY_TO_EMAIL,
        subject,
        html: emailHtml,
        text: plainText,
        headers: {
          "X-Entity-Ref-ID": `purchase-confirmation-${Date.now()}`,
          "List-Unsubscribe": `<mailto:${REPLY_TO_EMAIL}?subject=Unsubscribe>`,
        },
        tags: [
          { name: "type", value: "purchase-confirmation" },
          { name: "source", value: "ofp-planejador" },
        ],
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
