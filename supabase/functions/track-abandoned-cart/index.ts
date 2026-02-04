import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartTrackingRequest {
  visitor_id: string;
  cart_type: string;
  cart_items: {
    name: string;
    type: string;
    plan_key: string;
    price_cents: number;
    features?: string[];
  }[];
  total_value_cents: number;
  metadata: {
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    is_anonymous?: boolean;
  };
  action: 'create_or_update' | 'update_metadata';
  cart_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CartTrackingRequest = await req.json();
    const { visitor_id, cart_type, cart_items, total_value_cents, metadata, action, cart_id } = body;

    if (!visitor_id) {
      throw new Error("visitor_id is required");
    }

    // Action: Update metadata only (when user fills form fields)
    if (action === 'update_metadata' && cart_id) {
      const { error } = await supabase
        .from('abandoned_carts')
        .update({
          last_activity_at: new Date().toISOString(),
          metadata: {
            contact_name: metadata.contact_name || null,
            contact_email: metadata.contact_email || null,
            contact_phone: metadata.contact_phone || null,
            is_anonymous: metadata.is_anonymous,
          },
        })
        .eq('id', cart_id);

      if (error) {
        console.error("Error updating cart metadata:", error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, cart_id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Create or update cart
    if (action === 'create_or_update') {
      if (!cart_type || !cart_items || !total_value_cents) {
        throw new Error("cart_type, cart_items, and total_value_cents are required");
      }

      // Check for existing active cart
      const { data: existingCart } = await supabase
        .from('abandoned_carts')
        .select('id')
        .eq('user_id', visitor_id)
        .eq('cart_type', cart_type)
        .eq('status', 'active')
        .single();

      if (existingCart) {
        // Update existing cart
        const { error } = await supabase
          .from('abandoned_carts')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', existingCart.id);

        if (error) {
          console.error("Error updating existing cart:", error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true, cart_id: existingCart.id, action: 'updated' }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Create new cart
        const { data: newCart, error } = await supabase
          .from('abandoned_carts')
          .insert({
            user_id: visitor_id,
            cart_type,
            cart_items,
            total_value_cents,
            status: 'active',
            last_activity_at: new Date().toISOString(),
            metadata: {
              contact_name: metadata.contact_name || null,
              contact_email: metadata.contact_email || null,
              contact_phone: metadata.contact_phone || null,
              is_anonymous: metadata.is_anonymous ?? true,
            },
          })
          .select('id')
          .single();

        if (error) {
          console.error("Error creating cart:", error);
          throw error;
        }

        console.log(`Created new abandoned cart: ${newCart?.id} for visitor: ${visitor_id}`);

        return new Response(
          JSON.stringify({ success: true, cart_id: newCart?.id, action: 'created' }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    throw new Error("Invalid action");

  } catch (error) {
    console.error("Error in track-abandoned-cart:", error);
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
