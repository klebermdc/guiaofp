import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Todos os campos são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Orlando Fast Pass <contato@orlandofastpass.com.br>",
        to: ["contato@ofpplanejador.com"],
        reply_to: email,
        subject: `Novo contato via site: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 20px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 22px;">📩 Novo Contato pelo Site</h1>
            </div>
            <div style="background: #1a1a2e; padding: 24px; border-radius: 0 0 12px 12px; color: #e2e8f0;">
              <p style="margin: 0 0 16px 0;"><strong style="color: #a78bfa;">Nome:</strong> ${name}</p>
              <p style="margin: 0 0 16px 0;"><strong style="color: #a78bfa;">Email:</strong> <a href="mailto:${email}" style="color: #60a5fa;">${email}</a></p>
              <div style="background: #16213e; border-radius: 8px; padding: 16px; margin-top: 8px;">
                <p style="margin: 0 0 8px 0;"><strong style="color: #a78bfa;">Mensagem:</strong></p>
                <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!sendResponse.ok) {
      const errorBody = await sendResponse.text();
      throw new Error(`Failed to send email: ${errorBody}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending contact email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao enviar email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
