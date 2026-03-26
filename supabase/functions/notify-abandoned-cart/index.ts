import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AbandonedCart {
  id: string;
  user_id: string;
  cart_items: CartItem[];
  cart_type: string;
  total_value_cents: number;
  recovery_attempts: number;
  last_recovery_email_at: string | null;
  metadata: {
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
  } | null;
}

interface CartItem {
  name: string;
  type: 'plan';
  plan_key: 'basic' | 'premium';
  price_cents: number;
  features?: string[];
}

interface UserProfile {
  email: string | null;
  responsible_name: string | null;
}

// Format currency in BRL
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

// Get cart type label in Portuguese
function getCartTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    basic: 'OFP Planejador',
    premium: 'Plano Guia Premium',
    plan: 'Plano',
  };
  return labels[type] || 'Plano';
}

// Get plan name for display
function getPlanDisplayName(planKey: string): string {
  return planKey === 'premium' ? 'Guia Premium' : 'OFP Planejador';
}

// Generate urgency message based on plan type
function getUrgencyMessage(cartType: string): string {
  const messages: Record<string, string> = {
    premium: '🌟 Sua viagem dos sonhos merece o melhor planejamento! Garanta suporte exclusivo do seu guia.',
    basic: '✨ Comece agora a planejar sua viagem com nossas ferramentas exclusivas!',
    plan: '🎯 Não deixe para depois! Sua experiência em Orlando começa com o planejamento certo.',
  };
  return messages[cartType] || messages.plan;
}

// Generate HTML email template
function generateEmailHTML(
  userName: string,
  cart: AbandonedCart,
  recoveryUrl: string
): string {
  const planItem = cart.cart_items[0];
  const isPremium = planItem?.plan_key === 'premium';
  
  const featuresHTML = planItem?.features?.map((feature) => `
    <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
      ✓ ${feature}
    </li>
  `).join('') || '';

  const planBadge = isPremium 
    ? '<span style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">PREMIUM</span>'
    : '<span style="background: #6b7280; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">BÁSICO</span>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu plano Orlando Fast Pass está esperando! ✨</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #16213e; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">✨ Orlando Fast Pass</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 16px;">Sua viagem mágica está a um clique de distância!</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 24px;">Olá, ${userName}! 👋</h2>
              
              <p style="color: #a0aec0; line-height: 1.8; margin: 0 0 25px 0; font-size: 16px;">
                Notamos que você estava prestes a garantir seu planejamento perfeito para Orlando! 
                Sua jornada para os parques mais mágicos do mundo merece o melhor suporte.
              </p>
              
              <!-- Urgency Message -->
              <div style="background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1)); border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <p style="margin: 0; color: #fbbf24; font-weight: 600; font-size: 15px;">
                  ${getUrgencyMessage(cart.cart_type)}
                </p>
              </div>
              
              <!-- Plan Card -->
              <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #334155; border-radius: 16px; padding: 30px; margin: 30px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                  <h3 style="color: #ffffff; margin: 0; font-size: 22px;">${planItem?.name || 'Plano'}</h3>
                  ${planBadge}
                </div>
                
                ${featuresHTML ? `
                <ul style="list-style: none; padding: 0; margin: 20px 0; color: #cbd5e1;">
                  ${featuresHTML}
                </ul>
                ` : ''}
                
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 12px; text-align: center; margin-top: 20px;">
                  <p style="margin: 0 0 5px 0; color: rgba(255,255,255,0.8); font-size: 14px;">Investimento único</p>
                  <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">${formatCurrency(cart.total_value_cents)}</p>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${recoveryUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                          color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; 
                          font-weight: bold; font-size: 18px; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
                          transition: transform 0.2s;">
                  🎯 Garantir Meu Plano Agora
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px; line-height: 1.6;">
                Dúvidas? Responda este e-mail ou entre em contato pelo WhatsApp.<br>
                Estamos prontos para ajudar você a viver a magia de Orlando!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 25px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                © ${new Date().getFullYear()} Orlando Fast Pass - Planejando sua magia ✨
              </p>
              <p style="margin: 12px 0 0 0; color: #475569; font-size: 11px;">
                Você está recebendo este e-mail porque iniciou a contratação de um plano em nosso site.
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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // First, mark carts as abandoned after 24 hours
    const { error: markError } = await supabase.rpc('mark_abandoned_carts');
    if (markError) {
      console.error("Error marking abandoned carts:", markError);
    }

    // Fetch abandoned carts that haven't received an email in the last 24 hours
    const { data: abandonedCarts, error: fetchError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'abandoned')
      .lt('recovery_attempts', 3) // Max 3 recovery attempts
      .or(`last_recovery_email_at.is.null,last_recovery_email_at.lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);

    if (fetchError) {
      throw new Error(`Failed to fetch abandoned carts: ${fetchError.message}`);
    }

    if (!abandonedCarts || abandonedCarts.length === 0) {
      console.log("No abandoned carts to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No abandoned carts to process" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${abandonedCarts.length} abandoned carts`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const cart of abandonedCarts as AbandonedCart[]) {
      try {
        // Get contact info from metadata first, then fallback to profile
        let userEmail = cart.metadata?.contact_email;
        let userName = cart.metadata?.contact_name;

        // Fallback to profile if metadata is empty
        if (!userEmail) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, responsible_name')
            .eq('user_id', cart.user_id)
            .single();

          if (profile) {
            userEmail = profile.email;
            userName = userName || profile.responsible_name;
          }
        }

        if (!userEmail) {
          console.log(`No email found for cart ${cart.id}`);
          continue;
        }

        userName = userName || 'Viajante';
        
        // Generate recovery URL
        const recoveryUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/checkout/${cart.cart_type}?recover=${cart.id}`;

        // Send email
        const emailResponse = await resend.emails.send({
          from: "Orlando Fast Pass <noreply@guiaofp.com.br>",
          to: [userEmail],
          subject: `✨ ${userName}, seu plano Orlando Fast Pass está esperando!`,
          html: generateEmailHTML(userName, cart, recoveryUrl),
        });

        if (emailResponse.error) {
          throw new Error(emailResponse.error.message);
        }

        // Update cart with recovery attempt info
        await supabase
          .from('abandoned_carts')
          .update({
            recovery_attempts: cart.recovery_attempts + 1,
            last_recovery_email_at: new Date().toISOString(),
          })
          .eq('id', cart.id);

        console.log(`Recovery email sent to ${userEmail} for cart ${cart.id}`);
        successCount++;

      } catch (cartError) {
        console.error(`Error processing cart ${cart.id}:`, cartError);
        errorCount++;
        errors.push(`Cart ${cart.id}: ${cartError instanceof Error ? cartError.message : 'Unknown error'}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: abandonedCarts.length,
        sent: successCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in notify-abandoned-cart:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
