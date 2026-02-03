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
}

interface CartItem {
  name: string;
  type: 'ticket' | 'hotel' | 'car_rental';
  quantity?: number;
  price_cents?: number;
  date?: string;
  image_url?: string;
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
    tickets: 'Ingressos',
    hotels: 'Hospedagem',
    car_rentals: 'Aluguel de Carro',
    mixed: 'Itens Selecionados',
  };
  return labels[type] || 'Itens';
}

// Generate urgency message based on cart type
function getUrgencyMessage(cartType: string): string {
  const messages: Record<string, string> = {
    tickets: '🎢 Os preços dos parques podem mudar a qualquer momento. Garanta sua entrada agora!',
    hotels: '🏨 Quartos com as melhores tarifas estão acabando. Reserve antes que seja tarde!',
    car_rentals: '🚗 Reservamos seu carro por tempo limitado. Confirme agora e viaje tranquilo!',
    mixed: '✨ Seus itens ainda estão disponíveis, mas não podemos garantir por muito tempo!',
  };
  return messages[cartType] || messages.mixed;
}

// Generate HTML email template
function generateEmailHTML(
  userName: string,
  cart: AbandonedCart,
  recoveryUrl: string
): string {
  const itemsHTML = cart.cart_items.map((item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong>
        ${item.date ? `<br><small style="color: #666;">📅 ${item.date}</small>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.quantity ? `${item.quantity}x` : ''}
        ${item.price_cents ? formatCurrency(item.price_cents) : ''}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Você esqueceu algo mágico! ✨</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🏰 Orlando Fast Pass</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Sua aventura mágica está esperando!</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #333; margin: 0 0 15px 0;">Olá, ${userName}! 👋</h2>
              
              <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">
                Notamos que você deixou alguns itens incríveis no seu carrinho. 
                Sabemos que planejar uma viagem para Orlando é emocionante, e queremos 
                garantir que você não perca nada!
              </p>
              
              <!-- Urgency Message -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-weight: 500;">
                  ${getUrgencyMessage(cart.cart_type)}
                </p>
              </div>
              
              <!-- Cart Items -->
              <h3 style="color: #333; margin: 25px 0 15px 0;">
                📦 ${getCartTypeLabel(cart.cart_type)} no seu carrinho:
              </h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; overflow: hidden;">
                ${itemsHTML}
                <tr style="background-color: #667eea;">
                  <td style="padding: 15px; color: #fff; font-weight: bold;">
                    Total
                  </td>
                  <td style="padding: 15px; color: #fff; font-weight: bold; text-align: right;">
                    ${formatCurrency(cart.total_value_cents)}
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${recoveryUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 50px; 
                          font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  🛒 Finalizar Minha Compra
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
                Precisa de ajuda? Nossa equipe está pronta para tornar sua viagem inesquecível!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #888; font-size: 12px;">
                © ${new Date().getFullYear()} Orlando Fast Pass - Planejando sua magia ✨
              </p>
              <p style="margin: 10px 0 0 0; color: #aaa; font-size: 11px;">
                Você está recebendo este e-mail porque iniciou uma compra em nosso site.
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
        // Fetch user profile to get email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, responsible_name')
          .eq('user_id', cart.user_id)
          .single();

        if (profileError || !profile?.email) {
          console.log(`No email found for user ${cart.user_id}`);
          continue;
        }

        const userProfile = profile as UserProfile;
        const userName = userProfile.responsible_name || 'Viajante';
        
        // Generate recovery URL
        const recoveryUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/checkout?recover=${cart.id}`;

        // Send email
        const emailResponse = await resend.emails.send({
          from: "Orlando Fast Pass <noreply@guiaofp.com.br>",
          to: [userProfile.email!],
          subject: `✨ ${userName}, seus itens mágicos ainda estão esperando!`,
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

        console.log(`Recovery email sent to ${userProfile.email} for cart ${cart.id}`);
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
