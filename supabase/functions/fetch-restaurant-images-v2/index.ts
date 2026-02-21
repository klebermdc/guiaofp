import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function buildSearchQuery(name: string, category: string | null): string {
  switch (category) {
    case 'disney':
      return `${name} Walt Disney World restaurant photo`
    case 'universal':
      return `${name} Universal Orlando restaurant photo`
    case 'seaworld':
      return `${name} SeaWorld Orlando photo`
    case 'busch-gardens':
      return `${name} Busch Gardens Tampa photo`
    case 'fora-parques':
      return `${name} restaurant Orlando FL photo`
    default:
      return `${name} restaurant Orlando photo`
  }
}

function isValidRestaurantImage(url: string): boolean {
  if (!url || !url.startsWith('http')) return false
  const lower = url.toLowerCase()
  const blacklist = [
    '.svg', '/logos/', 'placeholder', 'favicon', 'apple-touch',
    'manifest', 'safari-pinned', 'mstile', 'icon-', '/logo',
    '/entertainment/', 'park-icon', 'cotton-top', 'pandora-floating',
    'disney-animals', 'starlight/royals', 'x-twitter', 'facebook',
    'instagram', 'youtube', 'tiktok', 'google-play', 'app-store',
    'badge', 'sprite', 'pixel', '1x1', 'spacer', 'blank',
    'transparent', 'universal-orlando-resort-color-logo', 'wdw.svg',
    'unsplash', 'pexels', 'shutterstock', 'istock',
    'avatar', 'profile-pic', 'user-icon', 'gravatar',
    'ad-banner', 'advertisement', 'promo-banner',
    'tripadvisor-logo', 'yelp-logo', 'google-logo',
  ]
  if (lower.includes('width=1') || lower.includes('w=1')) return false
  // Must be an image file or image CDN
  const hasImageExt = /\.(jpg|jpeg|png|webp|avif)/i.test(lower)
  const isImageCdn = lower.includes('/resize/') || lower.includes('/dam/') || 
    lower.includes('cloudinary') || lower.includes('imgix') || 
    lower.includes('cdn') || lower.includes('media')
  if (!hasImageExt && !isImageCdn) return false
  return !blacklist.some(b => lower.includes(b))
}

function extractImageFromMarkdown(markdown: string): string | null {
  if (!markdown) return null
  // Match markdown image syntax ![alt](url) and HTML img tags
  const patterns = [
    /!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g,
    /<img[^>]+src=["'](https?:\/\/[^"']+)["']/gi,
  ]
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(markdown)) !== null) {
      if (isValidRestaurantImage(match[1])) {
        return match[1]
      }
    }
  }
  return null
}

async function findImageViaSearch(name: string, category: string | null, apiKey: string): Promise<string | null> {
  try {
    const query = buildSearchQuery(name, category)
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: {
          formats: ['markdown'],
        },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`Search API error (${response.status}): ${text}`)
      return null
    }

    const data = await response.json()
    const results = data?.data || []

    for (const result of results) {
      // 1. Try ogImage from metadata
      const ogImage = result?.metadata?.ogImage
      if (ogImage && isValidRestaurantImage(ogImage)) return ogImage

      const ogImage2 = result?.metadata?.['og:image']
      if (ogImage2 && isValidRestaurantImage(ogImage2)) return ogImage2

      // 2. Try twitter:image
      const twitterImage = result?.metadata?.['twitter:image']
      if (twitterImage && isValidRestaurantImage(twitterImage)) return twitterImage

      // 3. Extract from markdown content
      const mdImage = extractImageFromMarkdown(result?.markdown)
      if (mdImage) return mdImage
    }

    return null
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

    const { batch_size = 5, offset = 0, category = null, include_unsplash = false } = await req.json().catch(() => ({}))

    let query = supabase
      .from('restaurants')
      .select('id, name, slug, category')
      .order('name')
      .range(offset, offset + batch_size - 1)

    if (include_unsplash) {
      query = query.or('image_url.is.null,image_url.eq.,image_url.ilike.%unsplash%')
    } else {
      query = query.or('image_url.is.null,image_url.eq.')
    }

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

    const results: { name: string; status: string; image_url?: string }[] = []
    let updated = 0

    for (const r of restaurants) {
      console.log(`🔍 ${r.name} (${r.category})`)

      const imageUrl = await findImageViaSearch(r.name, r.category, firecrawlApiKey)

      if (imageUrl) {
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({ image_url: imageUrl })
          .eq('id', r.id)

        if (!updateError) {
          updated++
          results.push({ name: r.name, status: 'updated', image_url: imageUrl })
          console.log(`✅ ${r.name}: ${imageUrl}`)
        } else {
          results.push({ name: r.name, status: 'db_error' })
          console.error(`❌ DB error for ${r.name}:`, updateError)
        }
      } else {
        results.push({ name: r.name, status: 'not_found' })
        console.log(`⚠️ No image: ${r.name}`)
      }

      // 1s between searches to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return new Response(JSON.stringify({
      success: true, processed: restaurants.length, updated,
      next_offset: offset + batch_size, results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      success: false, error: error.message,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
