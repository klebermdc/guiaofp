import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UtalkWebhookPayload {
  type?: string;
  event?: string;
  from?: string;
  to?: string;
  message?: string;
  messageId?: string;
  timestamp?: string;
  status?: string;
  [key: string]: unknown;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse incoming webhook data
    let payload: UtalkWebhookPayload;
    
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries()) as UtalkWebhookPayload;
    } else {
      // Try to parse as JSON first, then as form data
      const text = await req.text();
      try {
        payload = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        payload = Object.fromEntries(params.entries()) as UtalkWebhookPayload;
      }
    }

    console.log("uTalk webhook received:", JSON.stringify(payload, null, 2));

    // Extract relevant data
    const eventType = payload.type || payload.event || "unknown";
    const fromPhone = payload.from?.replace("@c.us", "").replace(/\D/g, "") || "";
    const messageText = payload.message || "";

    // Log for debugging
    console.log(`Event: ${eventType}, From: ${fromPhone}, Message: ${messageText}`);

    // You can add custom logic here based on the event type
    // For example, auto-reply, store messages, notify guides, etc.

    // Example: Find user by phone and log the interaction
    if (fromPhone) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, responsible_name, email")
        .eq("whatsapp", fromPhone)
        .maybeSingle();

      if (profile) {
        console.log(`Message from known client: ${profile.responsible_name} (${profile.email})`);
      } else {
        console.log(`Message from unknown number: ${fromPhone}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        received: true,
        event: eventType,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing uTalk webhook:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
