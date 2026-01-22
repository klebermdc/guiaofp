import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string[], subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "OFP Planejador <notificacoes@ofpplanejador.com>",
      to,
      subject,
      html,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
  }
  
  return response.json();
}



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DISNEY_PARKS = [
  "Magic Kingdom",
  "EPCOT",
  "Animal Kingdom",
  "Hollywood Studios"
];

const DISNEY_HOTELS = [
  "disney",
  "grand floridian",
  "contemporary",
  "polynesian",
  "wilderness lodge",
  "boardwalk",
  "yacht club",
  "beach club",
  "swan",
  "dolphin",
  "port orleans",
  "coronado springs",
  "caribbean beach",
  "riviera",
  "art of animation",
  "pop century",
  "all-star",
  "fort wilderness",
  "animal kingdom lodge"
];

interface ParkDate {
  park: string;
  date: string;
  time_start?: string;
  time_end?: string;
  notes?: string;
}

interface ClientData {
  user_id: string;
  email: string;
  responsible_name: string;
  guide_name: string;
  hotel: string;
  hotel_type: string;
  park_dates: ParkDate[];
  plan_tier: string;
  is_access_enabled: boolean;
}

interface NotificationResult {
  user_id: string;
  name: string;
  email: string;
  guide_name: string;
  first_disney_date: string;
  notification_type: 'day_d' | 'reminder' | 'pre_park' | 'urgent';
  is_disney_hotel: boolean;
}

function isDisneyHotel(hotel: string, hotelType: string): boolean {
  const combined = `${hotel} ${hotelType}`.toLowerCase();
  return DISNEY_HOTELS.some(dh => combined.includes(dh));
}

function getFirstDisneyParkDate(parkDates: ParkDate[]): string | null {
  const disneyDates = parkDates
    .filter(pd => DISNEY_PARKS.some(dp => pd.park.toLowerCase().includes(dp.toLowerCase())))
    .map(pd => pd.date)
    .filter(Boolean)
    .sort();
  
  return disneyDates.length > 0 ? disneyDates[0] : null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });
}

function getEmailTemplate(
  name: string,
  firstParkDate: string,
  notificationType: 'day_d' | 'reminder' | 'pre_park' | 'urgent',
  isDisneyHotel: boolean
): { subject: string; html: string } {
  const formattedDate = formatDate(firstParkDate);
  const daysText = isDisneyHotel ? '7 dias' : '3 dias';
  
  const baseStyles = `
    <style>
      .container { max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
      .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f8f9fa; padding: 30px; }
      .highlight { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
      .urgent { background: #f8d7da; border-left: 4px solid #dc3545; }
      .cta-button { display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
      .footer { background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
      .emoji { font-size: 48px; margin-bottom: 10px; }
    </style>
  `;

  if (notificationType === 'day_d') {
    return {
      subject: `🎢 Hora de comprar seu MultiPass da Disney! (${daysText} antes)`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🎢</div>
              <h1>Hora de comprar seu MultiPass!</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${name}</strong>!</p>
              
              <p>Seu primeiro dia de parque Disney está chegando: <strong>${formattedDate}</strong></p>
              
              <div class="highlight">
                <strong>⏰ ${isDisneyHotel ? 'Hóspedes Disney' : 'Visitantes externos'} podem comprar o MultiPass ${daysText} antes!</strong>
                <p>Isso significa que <strong>HOJE</strong> é o dia ideal para garantir seu acesso às atrações mais disputadas.</p>
              </div>
              
              <h3>🎯 O que você precisa fazer:</h3>
              <ol>
                <li>Acesse o app <strong>My Disney Experience</strong></li>
                <li>Vá em <strong>Lightning Lane Multi Pass</strong></li>
                <li>Selecione as atrações desejadas</li>
                <li>Confirme a compra</li>
              </ol>
              
              <p>Após comprar, confirme no app OFP Planejador para que seu guia saiba que está tudo certo! ✅</p>
              
              <a href="https://guiaofp.lovable.app/dashboard" class="cta-button">Acessar meu painel</a>
            </div>
            <div class="footer">
              <p>OFP Planejador - Sua viagem perfeita para Orlando</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
  
  if (notificationType === 'reminder') {
    return {
      subject: `⏰ Lembrete: Você já comprou o MultiPass?`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">⏰</div>
              <h1>Lembrete do MultiPass</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${name}</strong>!</p>
              
              <p>Ontem enviamos um aviso sobre a compra do MultiPass para seu dia de parque em <strong>${formattedDate}</strong>.</p>
              
              <div class="highlight">
                <strong>📋 Você já conseguiu comprar?</strong>
                <p>Se sim, confirme no app para que possamos atualizar seu roteiro!</p>
                <p>Se ainda não, não se preocupe - ainda dá tempo!</p>
              </div>
              
              <p>Lembre-se: o MultiPass garante acesso às filas rápidas das atrações mais concorridas, como:</p>
              <ul>
                <li>🏰 Seven Dwarfs Mine Train</li>
                <li>🚀 Guardians of the Galaxy</li>
                <li>🦁 Avatar Flight of Passage</li>
                <li>⭐ Rise of the Resistance</li>
              </ul>
              
              <a href="https://guiaofp.lovable.app/dashboard" class="cta-button">Confirmar compra</a>
            </div>
            <div class="footer">
              <p>OFP Planejador - Sua viagem perfeita para Orlando</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  if (notificationType === 'pre_park') {
    return {
      subject: `📅 Amanhã é seu dia de parque! Garanta o MultiPass`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
              <div class="emoji">📅</div>
              <h1>Amanhã é seu parque Disney!</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${name}</strong>!</p>
              
              <div class="highlight" style="background: #fef3c7; border-left-color: #f59e0b;">
                <strong>📅 Amanhã é seu dia de parque!</strong>
                <p>Data: <strong>${formattedDate}</strong></p>
              </div>
              
              <p>Este é o momento ideal para garantir seu <strong>MultiPass</strong> e reservar os horários das atrações mais disputadas!</p>
              
              <h3>🎯 Atrações que costumam esgotar rápido:</h3>
              <ul>
                <li>🏰 Seven Dwarfs Mine Train</li>
                <li>🚀 Guardians of the Galaxy</li>
                <li>🦁 Avatar Flight of Passage</li>
                <li>⭐ Rise of the Resistance</li>
              </ul>
              
              <p><strong>Não deixe para a última hora!</strong> Compre agora e confirme no app.</p>
              
              <a href="https://guiaofp.lovable.app/dashboard" class="cta-button" style="background: #f59e0b;">Confirmar compra</a>
            </div>
            <div class="footer">
              <p>OFP Planejador - Sua viagem perfeita para Orlando</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
  
  // urgent
  return {
    subject: `🚨 URGENTE: Amanhã é seu parque Disney!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">
            <div class="emoji">🚨</div>
            <h1>URGENTE: Último aviso!</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${name}</strong>!</p>
            
            <div class="highlight urgent">
              <strong>⚠️ AMANHÃ é seu dia de parque Disney!</strong>
              <p>Data: <strong>${formattedDate}</strong></p>
            </div>
            
            <p>Ainda não recebemos a confirmação de compra do seu MultiPass.</p>
            
            <p><strong>Se você já comprou:</strong> Por favor, confirme no app para tranquilizarmos!</p>
            
            <p><strong>Se ainda não comprou:</strong> Faça AGORA! As melhores atrações podem esgotar os horários disponíveis.</p>
            
            <a href="https://guiaofp.lovable.app/dashboard" class="cta-button" style="background: #dc3545;">Confirmar AGORA</a>
            
            <p style="margin-top: 20px; color: #666;">
              Em caso de dúvidas, entre em contato com seu guia pelo WhatsApp.
            </p>
          </div>
          <div class="footer">
            <p>OFP Planejador - Sua viagem perfeita para Orlando</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

function getGuideEmailTemplate(
  guideName: string,
  pendingClients: NotificationResult[]
): { subject: string; html: string } {
  const baseStyles = `
    <style>
      .container { max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
      .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f8f9fa; padding: 30px; }
      .client-card { background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 10px 0; }
      .urgent { border-left: 4px solid #dc3545; }
      .reminder { border-left: 4px solid #ffc107; }
      .day_d { border-left: 4px solid #28a745; }
      .footer { background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
      .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
      .badge-urgent { background: #dc3545; color: white; }
      .badge-reminder { background: #ffc107; color: black; }
      .badge-new { background: #28a745; color: white; }
    </style>
  `;

  const clientsHtml = pendingClients.map(client => {
    const badgeClass = client.notification_type === 'urgent' ? 'badge-urgent' : 
                       client.notification_type === 'reminder' || client.notification_type === 'pre_park' ? 'badge-reminder' : 'badge-new';
    const badgeText = client.notification_type === 'urgent' ? '🚨 URGENTE' : 
                      client.notification_type === 'pre_park' ? '📅 AMANHÃ' :
                      client.notification_type === 'reminder' ? '⏰ LEMBRETE' : '✉️ NOTIFICADO';
    const cardClass = client.notification_type;
    
    return `
      <div class="client-card ${cardClass}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>${client.name}</strong>
          <span class="badge ${badgeClass}">${badgeText}</span>
        </div>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">
          📧 ${client.email}<br>
          📅 Parque Disney: ${formatDate(client.first_disney_date)}<br>
          🏨 ${client.is_disney_hotel ? 'Hotel Disney' : 'Hotel externo'}
        </p>
      </div>
    `;
  }).join('');

  const urgentCount = pendingClients.filter(c => c.notification_type === 'urgent').length;

  return {
    subject: `📋 MultiPass: ${pendingClients.length} cliente(s) pendente(s)${urgentCount > 0 ? ` (${urgentCount} URGENTE!)` : ''}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Resumo MultiPass</h1>
            <p>Clientes pendentes de confirmação</p>
          </div>
          <div class="content">
            <p>Olá, <strong>${guideName}</strong>!</p>
            
            <p>Aqui está o resumo dos clientes que ainda não confirmaram a compra do MultiPass:</p>
            
            ${clientsHtml}
            
            <p style="margin-top: 20px;">
              <a href="https://guiaofp.lovable.app/guia-dashboard" style="color: #1e3a5f; font-weight: bold;">
                Acessar Painel do Guia →
              </a>
            </p>
          </div>
          <div class="footer">
            <p>OFP Planejador - Painel do Guia</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

const GUIDE_EMAILS: Record<string, string> = {
  'rafael': 'rafael@ofpplanejador.com',
  'kleber': 'kleber@ofpplanejador.com'
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all premium clients with access enabled
    const { data: clients, error: clientsError } = await supabase
      .from('profiles')
      .select('user_id, email, responsible_name, guide_name, hotel, hotel_type, park_dates, plan_tier, is_access_enabled')
      .eq('plan_tier', 'premium')
      .eq('is_access_enabled', true);

    if (clientsError) {
      throw new Error(`Error fetching clients: ${clientsError.message}`);
    }

    // Fetch existing multipass statuses
    const { data: existingStatuses } = await supabase
      .from('multipass_status')
      .select('*');

    const statusMap = new Map(existingStatuses?.map(s => [s.user_id, s]) || []);

    const notificationsToSend: NotificationResult[] = [];
    const guideNotifications: Map<string, NotificationResult[]> = new Map();

    for (const client of clients || []) {
      const parkDates = (client.park_dates || []) as ParkDate[];
      const firstDisneyDate = getFirstDisneyParkDate(parkDates);
      
      if (!firstDisneyDate) continue;

      const firstParkDate = new Date(firstDisneyDate + 'T12:00:00');
      const isDisneyHotelGuest = isDisneyHotel(client.hotel || '', client.hotel_type || '');
      const daysBeforeNotification = isDisneyHotelGuest ? 7 : 3;
      
      const notificationStartDate = new Date(firstParkDate);
      notificationStartDate.setDate(notificationStartDate.getDate() - daysBeforeNotification);
      
      const dayBeforePark = new Date(firstParkDate);
      dayBeforePark.setDate(dayBeforePark.getDate() - 1);

      const existingStatus = statusMap.get(client.user_id);
      
      // Skip if already purchased
      if (existingStatus?.is_purchased) continue;

      // Calculate days until park
      const daysUntilPark = Math.ceil((firstParkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let notificationType: 'day_d' | 'reminder' | 'pre_park' | 'urgent' | null = null;

      // Determine notification type based on timing
      // Priority: urgent (day of) > pre_park (1 day before) > reminder (D+1) > day_d (initial)
      if (daysUntilPark === 0) {
        // Day of park - URGENT (last chance)
        if (existingStatus?.last_notification_sent !== 'urgent') {
          notificationType = 'urgent';
        }
      } else if (daysUntilPark === 1) {
        // 1 day before park - PRE_PARK alert
        if (existingStatus?.last_notification_sent !== 'pre_park' && existingStatus?.last_notification_sent !== 'urgent') {
          notificationType = 'pre_park';
        }
      } else if (daysUntilPark === daysBeforeNotification - 1) {
        // Day after initial notification - REMINDER
        if (existingStatus?.last_notification_sent === 'day_d') {
          notificationType = 'reminder';
        }
      } else if (daysUntilPark === daysBeforeNotification) {
        // Initial notification day
        if (!existingStatus || !existingStatus.last_notification_sent) {
          notificationType = 'day_d';
        }
      }

      if (notificationType) {
        const notification: NotificationResult = {
          user_id: client.user_id,
          name: client.responsible_name || 'Cliente',
          email: client.email,
          guide_name: client.guide_name || '',
          first_disney_date: firstDisneyDate,
          notification_type: notificationType,
          is_disney_hotel: isDisneyHotelGuest
        };

        notificationsToSend.push(notification);

        // Group by guide for summary email
        const guideKey = (client.guide_name || 'sem_guia').toLowerCase().trim();
        if (!guideNotifications.has(guideKey)) {
          guideNotifications.set(guideKey, []);
        }
        guideNotifications.get(guideKey)!.push(notification);
      }
    }

    // Send client notifications
    const emailResults = [];
    for (const notification of notificationsToSend) {
      const template = getEmailTemplate(
        notification.name,
        notification.first_disney_date,
        notification.notification_type,
        notification.is_disney_hotel
      );

      try {
        await sendEmail(
          [notification.email],
          template.subject,
          template.html
        );

        emailResults.push({ 
          user_id: notification.user_id, 
          success: true, 
          type: notification.notification_type 
        });

        // Update or create multipass status
        const { error: upsertError } = await supabase
          .from('multipass_status')
          .upsert({
            user_id: notification.user_id,
            first_disney_park_date: notification.first_disney_date,
            notification_start_date: notification.first_disney_date,
            last_notification_sent: notification.notification_type,
            last_notification_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          console.error(`Error updating status for ${notification.user_id}:`, upsertError);
        }

      } catch (emailError: any) {
        console.error(`Error sending email to ${notification.email}:`, emailError);
        emailResults.push({ 
          user_id: notification.user_id, 
          success: false, 
          error: emailError?.message || 'Unknown error'
        });
      }
    }

    // Send guide summary emails
    for (const [guideKey, clients] of guideNotifications.entries()) {
      const guideEmail = GUIDE_EMAILS[guideKey];
      if (!guideEmail) {
        console.log(`No email configured for guide: ${guideKey}`);
        continue;
      }

      const guideName = guideKey.charAt(0).toUpperCase() + guideKey.slice(1);
      const template = getGuideEmailTemplate(guideName, clients);

      try {
        await sendEmail(
          [guideEmail],
          template.subject,
          template.html
        );

        console.log(`Guide summary sent to ${guideEmail}`);
      } catch (emailError) {
        console.error(`Error sending guide summary to ${guideEmail}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: emailResults.filter(r => r.success).length,
        notifications_failed: emailResults.filter(r => !r.success).length,
        results: emailResults
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-multipass function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
