import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map our park slugs to Disney's URL park slugs
const disneyParkSlugMap: Record<string, string[]> = {
  'magic-kingdom': ['magic-kingdom'],
  'epcot': ['epcot'],
  'hollywood-studios': ['hollywood-studios'],
  'animal-kingdom': ['animal-kingdom'],
  'disney-springs': ['disney-springs'],
  'typhoon-lagoon': ['typhoon-lagoon'],
  'blizzard-beach': ['blizzard-beach'],
}

// Disney resort slugs to try
const disneyResortSlugs = [
  'animal-kingdom-lodge', 'boardwalk', 'contemporary-resort',
  'grand-floridian-resort-and-spa', 'polynesian-village-resort',
  'wilderness-lodge', 'yacht-and-beach-club-resort', 'swan-and-dolphin',
  'coronado-springs-resort', 'caribbean-beach-resort', 'riviera-resort',
  'art-of-animation-resort', 'pop-century-resort', 'all-star-resorts',
  'fort-wilderness-resort', 'saratoga-springs', 'old-key-west',
  'port-orleans-resort', 'disney-springs',
]

function isValidRestaurantImage(url: string): boolean {
  if (!url.startsWith('http')) return false
  const blacklist = [
    '.svg', '/logos/', 'placeholder', 'pandora-floating-mountains',
    'cotton-top-tamarins', 'starlight/Royals', '/entertainment/',
    'disney-animals', 'attractions/', 'park-icon', 'favicon',
    'apple-touch', 'manifest', 'safari-pinned', 'mstile',
  ]
  return !blacklist.some(b => url.includes(b))
}

async function extractOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timeout)
    
    if (!res.ok) return null
    
    const html = await res.text()
    
    // Extract og:image
    const ogMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i)
    
    if (ogMatch?.[1]) {
      const imgUrl = ogMatch[1]
      if (isValidRestaurantImage(imgUrl)) {
        return imgUrl
      }
    }
    
    // Try to find a hero/main image
    const heroMatch = html.match(/<img[^>]+src="(https?:\/\/[^"]*(?:hero|main|banner|header|featured|gallery)[^"]*)"/i)
    if (heroMatch?.[1] && isValidRestaurantImage(heroMatch[1])) return heroMatch[1]
    
    // Try any large image from CDN
    const cdnMatch = html.match(/<img[^>]+src="(https?:\/\/cdn[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i)
    if (cdnMatch?.[1] && isValidRestaurantImage(cdnMatch[1])) return cdnMatch[1]
    
    return null
  } catch {
    return null
  }
}

async function findDisneyImage(slug: string, parkSlug: string | null): Promise<string | null> {
  // Try park-specific URLs first
  const parkSlugs = parkSlug && disneyParkSlugMap[parkSlug] 
    ? disneyParkSlugMap[parkSlug] 
    : Object.values(disneyParkSlugMap).flat()
  
  // If we know the park, just try that
  if (parkSlug && disneyParkSlugMap[parkSlug]) {
    for (const ps of disneyParkSlugMap[parkSlug]) {
      const url = `https://disneyworld.disney.go.com/dining/${ps}/${slug}/`
      const img = await extractOgImage(url)
      if (img) return img
    }
  }
  
  // Try Disney Springs
  const dsImg = await extractOgImage(`https://disneyworld.disney.go.com/dining/disney-springs/${slug}/`)
  if (dsImg) return dsImg
  
  // Try resort dining
  for (const resort of disneyResortSlugs.slice(0, 5)) {
    const img = await extractOgImage(`https://disneyworld.disney.go.com/dining/${resort}/${slug}/`)
    if (img) return img
  }
  
  // If park unknown, try all parks
  if (!parkSlug) {
    for (const ps of ['magic-kingdom', 'epcot', 'hollywood-studios', 'animal-kingdom']) {
      const img = await extractOgImage(`https://disneyworld.disney.go.com/dining/${ps}/${slug}/`)
      if (img) return img
    }
  }
  
  return null
}

async function findUniversalImage(slug: string): Promise<string | null> {
  const urls = [
    `https://www.universalorlando.com/web/en/us/things-to-do/dining/${slug}`,
    `https://www.universalorlando.com/web/en/us/things-to-do/dining/${slug}-restaurant`,
  ]
  
  for (const url of urls) {
    const img = await extractOgImage(url)
    if (img) return img
  }
  
  return null
}

async function findSeaWorldImage(slug: string): Promise<string | null> {
  const urls = [
    `https://seaworld.com/orlando/dining/${slug}/`,
    `https://seaworld.com/orlando/restaurants/${slug}/`,
  ]
  
  for (const url of urls) {
    const img = await extractOgImage(url)
    if (img) return img
  }
  
  return null
}

async function findBuschGardensImage(slug: string): Promise<string | null> {
  const urls = [
    `https://buschgardens.com/tampa/dining/${slug}/`,
    `https://buschgardens.com/tampa/restaurants/${slug}/`,
  ]
  
  for (const url of urls) {
    const img = await extractOgImage(url)
    if (img) return img
  }
  
  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { batch_size = 20, offset = 0, category = null } = await req.json().catch(() => ({}))

    // Get restaurants without images
    let query = supabase
      .from('restaurants')
      .select('id, name, slug, category, park_id, parks(slug)')
      .or('image_url.is.null,image_url.eq.')
      .order('name')
      .range(offset, offset + batch_size - 1)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: restaurants, error } = await query

    if (error) throw error
    if (!restaurants?.length) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No more restaurants to process',
        processed: 0,
        updated: 0 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    console.log(`Processing ${restaurants.length} restaurants from offset ${offset}`)

    const results: { name: string; status: string; image_url?: string }[] = []
    let updated = 0

    for (const r of restaurants) {
      const parkSlug = (r as any).parks?.slug || null
      let imageUrl: string | null = null

      console.log(`Searching image for: ${r.name} (${r.category}, park: ${parkSlug})`)

      switch (r.category) {
        case 'disney':
          imageUrl = await findDisneyImage(r.slug, parkSlug)
          break
        case 'universal':
          imageUrl = await findUniversalImage(r.slug)
          break
        case 'seaworld':
          imageUrl = await findSeaWorldImage(r.slug)
          break
        case 'busch-gardens':
          imageUrl = await findBuschGardensImage(r.slug)
          break
      }

      if (imageUrl) {
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({ image_url: imageUrl })
          .eq('id', r.id)

        if (!updateError) {
          updated++
          results.push({ name: r.name, status: 'updated', image_url: imageUrl })
          console.log(`✅ Updated: ${r.name}`)
        } else {
          results.push({ name: r.name, status: 'error', image_url: imageUrl })
          console.error(`❌ Error updating ${r.name}:`, updateError)
        }
      } else {
        results.push({ name: r.name, status: 'not_found' })
        console.log(`⚠️ No image found for: ${r.name}`)
      }

      // Rate limit - 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return new Response(JSON.stringify({
      success: true,
      processed: restaurants.length,
      updated,
      next_offset: offset + batch_size,
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
