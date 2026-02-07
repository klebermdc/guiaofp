import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DisneyRestaurant {
  id: string
  name: string
  park: string
}

const RESTAURANTS: DisneyRestaurant[] = [
  { id: '90002606', name: 'Be Our Guest Restaurant', park: 'Magic Kingdom' },
  { id: '90002660', name: "Cinderella's Royal Table", park: 'Magic Kingdom' },
  { id: '16660079', name: 'Ohana', park: 'Polynesian Resort' },
  { id: '90002516', name: 'Space 220', park: 'Epcot' },
]

async function checkDisneyAPI(restaurantId: string, date: string, partySize: number = 4) {
  try {
    const response = await fetch('https://disneyworld.disney.go.com/finder/api/v1/explorer-service/public/finder/dining-availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://disneyworld.disney.go.com/',
        'Origin': 'https://disneyworld.disney.go.com'
      },
      body: JSON.stringify({
        searchDate: date,
        partySize: partySize,
        entityId: restaurantId
      })
    })

    if (!response.ok) {
      console.error(`Erro na API Disney: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Erro ao checar restaurante ${restaurantId}:`, error)
    return null
  }
}

async function sendEmailAlert(alert: any, restaurant: DisneyRestaurant, date: string, times: any[]) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    console.error('RESEND_API_KEY not configured')
    return
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Orlando FastPass <alerts@orlandofastpass.com.br>',
        to: alert.profiles?.email,
        subject: `🎉 Vaga disponível em ${restaurant.name}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">🎉 Encontramos uma vaga para você!</h2>
            <p><strong>Restaurante:</strong> ${restaurant.name}</p>
            <p><strong>Parque:</strong> ${restaurant.park}</p>
            <p><strong>Data:</strong> ${new Date(date).toLocaleDateString('pt-BR')}</p>
            <h3>Horários disponíveis:</h3>
            <ul>
              ${times.map(t => `<li>${t.time || t}</li>`).join('')}
            </ul>
            <div style="margin-top: 20px;">
              <a href="https://disneyworld.disney.go.com/dining/" 
                 style="background: #1a1a2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                Reservar Agora no Site da Disney →
              </a>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              Atenção: As vagas podem esgotar rapidamente. Reserve o quanto antes!
            </p>
          </div>
        `
      })
    })

    await supabase
      .from('notifications_sent')
      .insert({
        alert_id: alert.id,
        method: 'email',
        status: 'sent'
      })

    console.log(`📧 Email enviado para ${alert.profiles?.email}`)
  } catch (error) {
    console.error('Erro ao enviar email:', error)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🚀 Iniciando scraper Disney...')

    // Next 60 days
    const dates: string[] = []
    const today = new Date()
    for (let i = 0; i < 60; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }

    const results: { restaurant: string; date: string; found: boolean }[] = []

    for (const restaurant of RESTAURANTS) {
      for (const date of dates) {
        const availability = await checkDisneyAPI(restaurant.id, date, 4)
        
        if (availability?.availability?.length > 0) {
          console.log(`✅ VAGA ENCONTRADA: ${restaurant.name} - ${date}`)
          
          await supabase
            .from('availability_log')
            .insert({
              restaurant_id: restaurant.id,
              restaurant_name: restaurant.name,
              park: restaurant.park,
              available_date: date,
              party_size: 4,
              is_available: true,
              available_times: availability.availability,
              source: 'automated',
            })

          // Find matching alerts
          const { data: alerts } = await supabase
            .from('dining_alerts')
            .select('*, profiles(*)')
            .eq('restaurant_id', restaurant.id)
            .eq('desired_date', date)
            .eq('status', 'active')

          if (alerts?.length) {
            for (const alert of alerts) {
              await sendEmailAlert(alert, restaurant, date, availability.availability)
            }
          }

          results.push({ restaurant: restaurant.name, date, found: true })
        }

        // Rate limit - 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Scraping completed', results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
