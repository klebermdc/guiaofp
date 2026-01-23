import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = "https://guiaofp.lovable.app";
const FROM_EMAIL = "OFP Planejador <noreply@ofpplanejador.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserData {
  email: string;
  name: string;
  product?: string;
  tempPassword?: string;
  resetUrl?: string;
  confirmUrl?: string;
  expiresIn?: string;
}

interface EmailRequest {
  type: "purchase-confirmation" | "access-granted" | "welcome-onboarding" | "password-reset" | "email-confirmation";
  userData: UserData;
  scheduleDelay?: number; // delay in milliseconds
}

// Email Templates
const getPurchaseConfirmationHtml = (customerName: string, productName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 0;">
  <table role="presentation" style="background-color: #ffffff; margin: 0 auto; max-width: 600px; width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <h1 style="color: #333; font-size: 28px; text-align: center; margin: 0 0 20px;">🎉 Compra Confirmada!</h1>
        <p style="color: #333; font-size: 16px; text-align: center;">Olá <strong>${customerName}</strong>,</p>
        <p style="color: #333; font-size: 16px; text-align: center;">Recebemos sua compra de <strong style="color: #6366f1;">${productName}</strong> com sucesso!</p>
        <div style="background-color: #f0f7ff; border-radius: 12px; padding: 24px; text-align: center; border-left: 4px solid #0066cc; margin: 30px 0;">
          <p style="color: #0066cc; font-size: 18px; font-weight: bold; margin: 0;">⏱️ Seu acesso será liberado em até 5 minutos</p>
        </div>
        <p style="color: #333; font-size: 16px; text-align: center;">Você receberá um novo email com suas credenciais de acesso em breve.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">🎢 Acessar a Plataforma</a>
        </div>
        <div style="color: #8898aa; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
          <p>OFP Planejador - Sua viagem para Orlando começa aqui 🏰✨</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getAccessGrantedHtml = (customerName: string, email: string, tempPassword?: string) => {
  if (tempPassword) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 0;">
  <table role="presentation" style="background-color: #ffffff; margin: 0 auto; max-width: 600px; width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <h1 style="color: #333; font-size: 28px; text-align: center; margin: 0 0 20px;">🎉 Bem-vindo!</h1>
        <p style="color: #333; font-size: 16px; text-align: center;">Olá <strong>${customerName}</strong>,</p>
        <p style="color: #333; font-size: 16px; text-align: center;">Seu acesso está 100% liberado! Use as credenciais abaixo:</p>
        <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin: 30px 0;">
          <p style="color: #666; font-size: 14px; font-weight: bold; margin: 0 0 8px;">📧 Email:</p>
          <div style="background-color: #fff; border: 1px solid #e1e4e8; border-radius: 6px; color: #0366d6; font-size: 16px; font-family: monospace; padding: 12px; margin: 0 0 16px;">${email}</div>
          <p style="color: #666; font-size: 14px; font-weight: bold; margin: 0 0 8px;">🔑 Senha temporária:</p>
          <div style="background-color: #fff; border: 1px solid #e1e4e8; border-radius: 6px; color: #0366d6; font-size: 18px; font-family: monospace; padding: 12px; font-weight: bold; letter-spacing: 1px;">${tempPassword}</div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #0066cc, #0052a3); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">🚀 Acessar Agora</a>
        </div>
        <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; color: #856404; font-size: 14px; padding: 16px; text-align: center;">⚠️ <strong>Importante:</strong> Troque sua senha no primeiro acesso!</div>
        <div style="color: #8898aa; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
          <p>Problemas para acessar? Responda este email.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;
  }

  // Version without temp password (manual activation)
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 0;">
  <table role="presentation" style="background-color: #ffffff; margin: 0 auto; max-width: 600px; width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <h1 style="color: #333; font-size: 28px; text-align: center; margin: 0 0 10px;">✅ Seu Acesso Foi Liberado!</h1>
        <p style="color: #6366f1; font-size: 16px; text-align: center; margin: 0 0 30px;">Bem-vindo(a) ao OFP Planejador</p>
        <p style="color: #333; font-size: 18px;">Olá, <strong>${customerName}</strong>!</p>
        <p style="color: #333; font-size: 16px; line-height: 26px;">Seu acesso à plataforma foi liberado e agora você pode aproveitar todas as funcionalidades do seu plano.</p>
        <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; border-left: 4px solid #6366f1; margin: 30px 0;">
          <h3 style="margin: 0 0 16px; color: #6366f1; font-size: 16px;">O que você pode fazer agora:</h3>
          <p style="margin: 8px 0; color: #333;"><span style="color: #10b981;">✓</span> Acessar seu roteiro personalizado de parques</p>
          <p style="margin: 8px 0; color: #333;"><span style="color: #10b981;">✓</span> Consultar dicas e informações sobre atrações</p>
          <p style="margin: 8px 0; color: #333;"><span style="color: #10b981;">✓</span> Utilizar a assistente virtual Joy</p>
          <p style="margin: 8px 0; color: #333;"><span style="color: #10b981;">✓</span> Acompanhar seu checklist de viagem</p>
          <p style="margin: 8px 0; color: #333;"><span style="color: #10b981;">✓</span> Receber guiamento remoto durante sua viagem</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">🎢 Acessar a Plataforma</a>
        </div>
        <div style="color: #8898aa; font-size: 14px; text-align: center; background: #1f2937; border-radius: 0 0 12px 12px; padding: 20px; margin: 20px -40px -40px -40px;">
          <p style="margin: 0; color: #fff;">Prepare-se para a magia! 🏰✨</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

const getWelcomeOnboardingHtml = (customerName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 0;">
  <table role="presentation" style="background-color: #ffffff; margin: 0 auto; max-width: 600px; width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <h1 style="color: #333; font-size: 28px; text-align: center; margin: 0 0 20px;">🚀 Vamos começar?</h1>
        <p style="color: #333; font-size: 16px; text-align: center;">Olá <strong>${customerName}</strong>,</p>
        <p style="color: #333; font-size: 16px; text-align: center;">Queremos que você aproveite ao máximo! Aqui vão algumas dicas:</p>
        
        <div style="padding: 20px; border-left: 4px solid #6366f1; background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%); border-radius: 0 8px 8px 0; margin: 24px 0;">
          <p style="font-size: 28px; margin: 0 0 8px;">1️⃣</p>
          <p style="color: #333; font-size: 18px; font-weight: bold; margin: 8px 0;">Complete seu perfil</p>
          <p style="color: #666; font-size: 14px; margin: 8px 0 0;">Adicione suas informações de viagem para personalizar seus roteiros.</p>
        </div>
        
        <div style="padding: 20px; border-left: 4px solid #10b981; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 0 8px 8px 0; margin: 24px 0;">
          <p style="font-size: 28px; margin: 0 0 8px;">2️⃣</p>
          <p style="color: #333; font-size: 18px; font-weight: bold; margin: 8px 0;">Explore as funcionalidades</p>
          <p style="color: #666; font-size: 14px; margin: 8px 0 0;">Conheça a Joy, o checklist de viagem e os roteiros de parques!</p>
        </div>
        
        <div style="padding: 20px; border-left: 4px solid #f59e0b; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 0 8px 8px 0; margin: 24px 0;">
          <p style="font-size: 28px; margin: 0 0 8px;">3️⃣</p>
          <p style="color: #333; font-size: 18px; font-weight: bold; margin: 8px 0;">Precisa de ajuda?</p>
          <p style="color: #666; font-size: 14px; margin: 8px 0 0;">Responda este email ou use o chat na plataforma.</p>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0066cc, #0052a3); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">🎯 Começar Agora</a>
        </div>
        
        <div style="color: #8898aa; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          <p>Responda este email com qualquer dúvida! 😊</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getPasswordResetHtml = (customerName: string, resetUrl: string, expiresIn: string = "1 hora") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 0;">
  <table role="presentation" style="background-color: #ffffff; margin: 0 auto; max-width: 600px; width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <h1 style="color: #333; font-size: 28px; text-align: center; margin: 0 0 20px;">🔐 Redefinir Senha</h1>
        
        <p style="color: #333; font-size: 16px; text-align: center;">Olá <strong>${customerName}</strong>,</p>
        
        <p style="color: #333; font-size: 16px; line-height: 26px; text-align: center;">
          Recebemos uma solicitação para redefinir a senha da sua conta.
        </p>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #0066cc, #0052a3); color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            🔑 Redefinir Senha
          </a>
        </div>
        
        <!-- Link fallback -->
        <p style="color: #666; font-size: 14px; text-align: center; margin: 16px 0 8px;">
          Ou copie e cole este link no seu navegador:
        </p>
        <p style="color: #0066cc; font-size: 12px; text-align: center; word-break: break-all; font-family: monospace; background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 0 0 20px;">
          ${resetUrl}
        </p>
        
        <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 0;" />
        
        <!-- Expiration warning -->
        <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <p style="color: #856404; font-size: 14px; margin: 0;">
            ⏰ Este link expira em <strong>${expiresIn}</strong>
          </p>
        </div>
        
        <!-- Security note -->
        <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="color: #666; font-size: 14px; line-height: 22px; margin: 0;">
            🛡️ Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá inalterada.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="color: #8898aa; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
          <p style="margin: 0;">Problemas? Entre em contato com nosso suporte.</p>
          <p style="margin: 10px 0 0; color: #aaa;">OFP Planejador - Sua viagem para Orlando começa aqui 🏰✨</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getEmailConfirmationHtml = (customerName: string, confirmUrl: string, expiresIn: string = "24 horas") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 0;">
  <table role="presentation" style="background-color: #ffffff; margin: 0 auto; max-width: 600px; width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px;">
        <h1 style="color: #333; font-size: 28px; text-align: center; margin: 0 0 20px;">📧 Confirme seu Email</h1>
        
        <p style="color: #333; font-size: 16px; text-align: center;">Olá <strong>${customerName}</strong>,</p>
        
        <p style="color: #333; font-size: 16px; line-height: 26px; text-align: center;">
          Estamos quase lá! Clique no botão abaixo para confirmar seu email e ativar sua conta.
        </p>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${confirmUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            ✅ Confirmar Email
          </a>
        </div>
        
        <!-- Link fallback -->
        <p style="color: #666; font-size: 14px; text-align: center; margin: 16px 0 8px;">
          Ou copie e cole este link no seu navegador:
        </p>
        <p style="color: #10b981; font-size: 12px; text-align: center; word-break: break-all; font-family: monospace; background: #f0fdf4; padding: 12px; border-radius: 6px; margin: 0 0 20px;">
          ${confirmUrl}
        </p>
        
        <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 0;" />
        
        <!-- Expiration warning -->
        <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <p style="color: #856404; font-size: 14px; margin: 0;">
            ⏰ Este link expira em <strong>${expiresIn}</strong>
          </p>
        </div>
        
        <!-- Benefits preview -->
        <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #6366f1; font-size: 14px; text-align: center;">Após confirmar, você terá acesso a:</h3>
          <p style="margin: 6px 0; color: #333; font-size: 14px; text-align: center;"><span style="color: #10b981;">✓</span> Roteiros personalizados de parques</p>
          <p style="margin: 6px 0; color: #333; font-size: 14px; text-align: center;"><span style="color: #10b981;">✓</span> Assistente virtual Joy</p>
          <p style="margin: 6px 0; color: #333; font-size: 14px; text-align: center;"><span style="color: #10b981;">✓</span> Checklist de viagem</p>
        </div>
        
        <!-- Footer -->
        <div style="color: #8898aa; font-size: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
          <p style="margin: 0;">Se você não criou esta conta, ignore este email.</p>
          <p style="margin: 10px 0 0; color: #aaa;">OFP Planejador - Sua viagem para Orlando começa aqui 🏰✨</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userData, scheduleDelay }: EmailRequest = await req.json();
    
    console.log(`Processing ${type} email for:`, userData.email);

    let emailHtml: string;
    let subject: string;

    switch (type) {
      case "purchase-confirmation":
        emailHtml = getPurchaseConfirmationHtml(userData.name, userData.product || "Plano");
        subject = "🎉 Compra confirmada - Seu acesso está sendo preparado";
        break;

      case "access-granted":
        emailHtml = getAccessGrantedHtml(userData.name, userData.email, userData.tempPassword);
        subject = userData.tempPassword 
          ? "🎉 Bem-vindo! Seu acesso está liberado"
          : "✅ Seu acesso ao OFP Planejador foi liberado!";
        break;

      case "welcome-onboarding":
        emailHtml = getWelcomeOnboardingHtml(userData.name);
        subject = "🚀 Como começar com o OFP Planejador";
        break;

      case "password-reset":
        if (!userData.resetUrl) {
          throw new Error("resetUrl is required for password-reset emails");
        }
        emailHtml = getPasswordResetHtml(userData.name, userData.resetUrl, userData.expiresIn);
        subject = "🔐 Redefinir sua senha - OFP Planejador";
        break;

      case "email-confirmation":
        if (!userData.confirmUrl) {
          throw new Error("confirmUrl is required for email-confirmation emails");
        }
        emailHtml = getEmailConfirmationHtml(userData.name, userData.confirmUrl, userData.expiresIn);
        subject = "📧 Confirme seu email - OFP Planejador";
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Build email payload
    const emailPayload: Record<string, unknown> = {
      from: FROM_EMAIL,
      to: [userData.email],
      subject,
      html: emailHtml,
    };

    // Add scheduling if delay is provided (Resend scheduled emails)
    if (scheduleDelay && scheduleDelay > 0) {
      const scheduledAt = new Date(Date.now() + scheduleDelay).toISOString();
      emailPayload.scheduled_at = scheduledAt;
      console.log(`Email scheduled for: ${scheduledAt}`);
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Failed to send email:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log(`${type} email sent successfully:`, emailResult);

    return new Response(
      JSON.stringify({ success: true, type, emailResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
