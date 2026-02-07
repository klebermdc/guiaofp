import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

async function scrapeWithScrapingBee(restaurantSlug: string, date: string, partySize: number) {
  const apiKey = Deno.env.get('SCRAPINGBEE_API_KEY')
  if (!apiKey) {
    throw new Error('SCRAPINGBEE_API_KEY not configured')
  }

  const url = `https://disneyworld.disney.go.com/dining/${restaurantSlug}/`

  const params = new URLSearchParams({
    api_key: apiKey,
    url: url,
    render_js: 'true',
    wait: '5000',
    premium_proxy: 'true',
    country_code: 'us',
    js_scenario: JSON.stringify({
      instructions: [
        { click: 'button[aria-label*="Check"], button[data-testid*="availability"]' },
        { wait: 2000 },
        { fill: ['input[type="date"], input[name="searchDate"]', date] },
        { select: ['select[name="partySize"]', partySize.toString()] },
        { click: 'button[type="submit"]' },
        { wait: 5000 }
      ]
    })
  })

  const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?${params.toString()}`

  console.log(`Scraping Disney availability for ${restaurantSlug} on ${date} with ${partySize} people...`)

  const response = await fetch(scrapingBeeUrl)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`ScrapingBee error [${response.status}]:`, errorText)
    throw new Error(`ScrapingBee request failed with status ${response.status}`)
  }

  const html = await response.text()

  // Extract available times from the HTML response
  const timeRegex = /(\d{1,2}:\d{2}\s*(?:AM|PM))/gi
  const rawTimes = html.match(timeRegex) || []

  // Deduplicate times
  const uniqueTimes = [...new Set(rawTimes)]

  console.log(`Found ${uniqueTimes.length} available time slots`)

  return {
    available: uniqueTimes.length > 0,
    times: uniqueTimes.map(time => ({ time, available: true })),
    checkedAt: new Date().toISOString()
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { restaurantSlug, date, partySize = 4 } = await req.json()

    if (!restaurantSlug || !date) {
      return new Response(
        JSON.stringify({ error: 'restaurantSlug and date are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const result = await scrapeWithScrapingBee(restaurantSlug, date, partySize)

    // Cache result in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase.from('availability_cache').upsert({
      restaurant_id: restaurantSlug,
      date: date,
      party_size: partySize,
      is_available: result.available,
      available_times: result.times,
      last_checked: result.checkedAt
    }, {
      onConflict: 'restaurant_id,date,party_size,meal_time'
    }).then(({ error }) => {
      if (error) console.error('Cache upsert error (non-critical):', error.message)
    })

    return new Response(
      JSON.stringify({
        success: true,
        available: result.available,
        times: result.times,
        checkedAt: result.checkedAt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('check-availability-proxy error:', message)
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
