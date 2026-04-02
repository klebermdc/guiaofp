import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function buildMenuSearchQuery(name: string, category: string | null, location: string | null): string {
  switch (category) {
    case 'disney':
      return `${name} Walt Disney World menu dining site:disneyworld.disney.go.com`
    case 'universal':
      return `${name} Universal Orlando dining menu site:universalorlando.com`
    case 'seaworld':
      return `${name} SeaWorld Orlando menu`
    case 'busch-gardens':
      return `${name} Busch Gardens Tampa menu`
    case 'fora-parques':
      return `${name} Orlando restaurant menu`
    default:
      return `${name} Orlando restaurant menu`
  }
}

function extractMenuUrl(results: any[], name: string, category: string | null): string | null {
  if (!results?.length) return null

  for (const result of results) {
    const url = result?.url || result?.metadata?.sourceURL
    if (!url) continue

    const lower = url.toLowerCase()

    // Prefer official sites
    if (category === 'disney' && lower.includes('disneyworld.disney.go.com/dining/')) {
      // Return the menu page if available, otherwise the dining page
      if (lower.includes('/menus')) return url
      return url.replace(/\/?$/, '/menus/')
    }

    if (category === 'universal' && lower.includes('universalorlando.com')) {
      if (lower.includes('/dining/') || lower.includes('/things-to-do/dining/')) {
        return url
      }
    }

    if (category === 'seaworld' && lower.includes('seaworld.com')) {
      return url
    }

    if (category === 'busch-gardens' && lower.includes('buschgardens.com')) {
      return url
    }
  }

  // Fallback: first result URL that looks like a restaurant page
  for (const result of results) {
    const url = result?.url || result?.metadata?.sourceURL
    if (!url) continue
    const lower = url.toLowerCase()
    if (lower.includes('menu') || lower.includes('dining') || lower.includes('restaurant')) {
      return url
    }
  }

  // Last fallback: first result URL
  const firstUrl = results[0]?.url || results[0]?.metadata?.sourceURL
  return firstUrl || null
}

async function findMenuUrl(name: string, category: string | null, location: string | null, apiKey: string): Promise<string | null> {
  try {
    const query = buildMenuSearchQuery(name, category, location)
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 3,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`Search API error (${response.status}): ${text}`)
      return null
    }

    const data = await response.json()
    const results = data?.data || []

    return extractMenuUrl(results, name, category)
  } catch (err) {
    console.error(`Search error for "${name}":`, err)
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!firecrawlApiKey) {
      return new Response(JSON.stringify({
        success: false, error: 'FIRECRAWL_API_KEY not configured',
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { batch_size = 3, offset = 0, category = null } = await req.json().catch(() => ({}))

    let query = supabase
      .from('restaurants')
      .select('id, name, slug, category, location')
      .or('menu_url.is.null,menu_url.eq.')
      .order('name')
      .range(offset, offset + batch_size - 1)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: restaurants, error } = await query

    if (error) throw error
    if (!restaurants?.length) {
      return new Response(JSON.stringify({
        success: true, message: 'No more restaurants to process',
        processed: 0, updated: 0,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    console.log(`Processing ${restaurants.length} restaurants from offset ${offset}`)

    const results: { name: string; status: string; menu_url?: string }[] = []
    let updated = 0

    for (const r of restaurants) {
      console.log(`🔍 ${r.name} (${r.category})`)

      const menuUrl = await findMenuUrl(r.name, r.category, r.location, firecrawlApiKey)

      if (menuUrl) {
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({ menu_url: menuUrl })
          .eq('id', r.id)

        if (!updateError) {
          updated++
          results.push({ name: r.name, status: 'updated', menu_url: menuUrl })
          console.log(`✅ ${r.name}: ${menuUrl}`)
        } else {
          results.push({ name: r.name, status: 'db_error' })
          console.error(`❌ DB error for ${r.name}:`, updateError)
        }
      } else {
        results.push({ name: r.name, status: 'not_found' })
        console.log(`⚠️ No menu URL: ${r.name}`)
      }

      // delay between searches
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    return new Response(JSON.stringify({
      success: true, processed: restaurants.length, updated,
      next_offset: offset + batch_size, results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      success: false, error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
