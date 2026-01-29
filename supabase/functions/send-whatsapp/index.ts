import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  from_number?: 'rafael' | 'kleber' | 'default'; // Which guide's number to send from
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

type UtalkResponse = {
  type?: string;
  token?: string;
  status?: string;
  [key: string]: unknown;
};

// Umbler Talk (uTalk) API integration - Using legacy endpoint
async function sendUtalkMessage(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string; provider_response?: UtalkResponse | string }> {
  const UTALK_TOKEN = Deno.env.get("UTALK_TOKEN");

  if (!UTALK_TOKEN) {
    return { success: false, error: 'Umbler Talk token not configured' };
  }

  // Clean phone number (remove non-digits, ensure country code)
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  // Format as WhatsApp JID (phone@c.us)
  const whatsappJid = `${formattedPhone}@c.us`;

  try {
    // Using legacy uTalk API endpoint
    const response = await fetch(
      `https://api.utalk.chat/send/${UTALK_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: UTALK_TOKEN,
          cmd: 'chat',
          to: whatsappJid,
          msg: message,
        }).toString(),
      }
    );

    const responseText = await response.text();

    let providerResponse: UtalkResponse | string = responseText;
    try {
      providerResponse = JSON.parse(responseText) as UtalkResponse;
    } catch {
      // keep raw string
    }
    
    if (!response.ok) {
      console.error('Umbler Talk error:', responseText);
      return {
        success: false,
        provider_response: providerResponse,
        error: `Umbler Talk error: ${response.status} - ${responseText}`,
      };
    }

    console.log('Umbler Talk success:', responseText);
    return { success: true, provider_response: providerResponse };
  } catch (error) {
    console.error('Umbler Talk request failed:', error);
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

    // Send via Umbler Talk
    const result = await sendUtalkMessage(targetPhone, finalMessage);

    // Log the attempt
    const providerStatus =
      typeof result.provider_response === 'object' && result.provider_response
        ? String((result.provider_response as UtalkResponse).status ?? '')
        : '';

    console.log(
      `WhatsApp ${result.success ? 'sent' : 'failed'} to ${targetPhone.substring(0, 8)}...${providerStatus ? ` (provider_status=${providerStatus})` : ''}`
    );

    return new Response(
      JSON.stringify({
        ...result,
        provider_status:
          typeof result.provider_response === 'object' && result.provider_response
            ? (result.provider_response as UtalkResponse).status ?? null
            : null,
        provider_token:
          typeof result.provider_response === 'object' && result.provider_response
            ? (result.provider_response as UtalkResponse).token ?? null
            : null,
        to_phone_masked: targetPhone.substring(0, 8) + '...',
      }),
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
