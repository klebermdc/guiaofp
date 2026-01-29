import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Z-API or similar WhatsApp service configuration
const ZAPI_INSTANCE_ID = Deno.env.get("ZAPI_INSTANCE_ID");
const ZAPI_TOKEN = Deno.env.get("ZAPI_TOKEN");
const ZAPI_SECURITY_TOKEN = Deno.env.get("ZAPI_SECURITY_TOKEN");

interface WhatsAppMessage {
  phone: string;
  message: string;
}

interface SendWhatsAppRequest {
  user_id?: string;
  phone?: string;
  message: string;
  template?: 'multipass_purchased' | 'park_reminder' | 'custom';
  template_data?: Record<string, string>;
}

// Message templates
const TEMPLATES = {
  multipass_purchased: (data: Record<string, string>) => `
🎢 *Parabéns, ${data.name || 'Cliente'}!*

Confirmamos a compra do seu *Lightning Lane Multi Pass* para o dia *${data.date || 'agendado'}*.

✅ Seu roteiro foi atualizado automaticamente
📱 Acesse o app para ver os horários reservados

Qualquer dúvida, estamos à disposição!
_Equipe OFP Planejador_ 🏰
`.trim(),

  park_reminder: (data: Record<string, string>) => `
📅 *Lembrete de Parque*

Olá, ${data.name || 'Cliente'}!

Amanhã é seu dia no *${data.park || 'parque'}*! 🎉

⏰ Chegue cedo para aproveitar ao máximo
🎢 Seu MultiPass está ${data.multipass_status || 'pendente'}
📱 Confira o roteiro atualizado no app

Boa diversão! 🎢✨
_Equipe OFP Planejador_
`.trim(),

  custom: (data: Record<string, string>) => data.message || '',
};

async function sendZapiMessage(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
    return { success: false, error: 'Z-API credentials not configured' };
  }

  // Clean phone number (remove non-digits, ensure country code)
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  try {
    const response = await fetch(
      `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ZAPI_SECURITY_TOKEN && { 'Client-Token': ZAPI_SECURITY_TOKEN }),
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Z-API error:', errorData);
      return { success: false, error: `Z-API error: ${response.status}` };
    }

    const result = await response.json();
    console.log('Z-API success:', result);
    return { success: true };
  } catch (error) {
    console.error('Z-API request failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: SendWhatsAppRequest = await req.json();
    const { user_id, phone, message, template, template_data } = body;

    let targetPhone = phone;
    let userName = template_data?.name || 'Cliente';

    // If user_id provided, fetch phone from profile
    if (user_id && !phone) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('whatsapp, responsible_name')
        .eq('user_id', user_id)
        .single();

      if (error || !profile?.whatsapp) {
        return new Response(
          JSON.stringify({ success: false, error: 'User phone not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      targetPhone = profile.whatsapp;
      userName = profile.responsible_name || userName;
    }

    if (!targetPhone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate message from template or use custom message
    let finalMessage = message;
    if (template && TEMPLATES[template]) {
      finalMessage = TEMPLATES[template]({ ...template_data, name: userName });
    }

    if (!finalMessage) {
      return new Response(
        JSON.stringify({ success: false, error: 'Message content required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send via Z-API
    const result = await sendZapiMessage(targetPhone, finalMessage);

    // Log the attempt
    console.log(`WhatsApp ${result.success ? 'sent' : 'failed'} to ${targetPhone.substring(0, 8)}...`);

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in send-whatsapp:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
