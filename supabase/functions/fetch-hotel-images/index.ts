const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface HotelImageResult {
  hotelId: string;
  imageUrl: string | null;
  source: 'google' | 'firecrawl' | 'none';
}

async function fetchGooglePlacesImage(hotelName: string, apiKey: string): Promise<string | null> {
  try {
    // Step 1: Find the place
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(hotelName + ' Orlando Florida')}&inputtype=textquery&fields=photos,place_id&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.candidates?.[0]?.photos?.[0]?.photo_reference) {
      const photoRef = searchData.candidates[0].photos[0].photo_reference;
      // Step 2: Get the photo URL (max 800px wide)
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${apiKey}`;
      // Google Places Photo API redirects to the actual image URL
      const photoRes = await fetch(photoUrl, { redirect: 'follow' });
      if (photoRes.ok) {
        return photoRes.url;
      }
    }
    return null;
  } catch (error) {
    console.error(`Google Places error for ${hotelName}:`, error);
    return null;
  }
}

async function fetchFirecrawlImage(hotelName: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${hotelName} Orlando hotel official photo`,
        limit: 3,
        scrapeOptions: { formats: ['links'] },
      }),
    });

    const data = await response.json();
    
    // Try to find an image from the search results
    if (data.data) {
      for (const result of data.data) {
        const url = result.url || '';
        // Look for image URLs in results
        if (/\.(jpg|jpeg|png|webp)/i.test(url)) {
          return url;
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Firecrawl error for ${hotelName}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotels } = await req.json() as { hotels: { id: string; name: string }[] };

    if (!hotels?.length) {
      return new Response(
        JSON.stringify({ success: false, error: 'Hotels array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!googleApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Google Maps API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: HotelImageResult[] = [];

    // Process hotels in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < hotels.length; i += batchSize) {
      const batch = hotels.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (hotel) => {
          // Try Google Places first
          let imageUrl = await fetchGooglePlacesImage(hotel.name, googleApiKey);
          if (imageUrl) {
            return { hotelId: hotel.id, imageUrl, source: 'google' as const };
          }

          // Fallback to Firecrawl
          if (firecrawlApiKey) {
            imageUrl = await fetchFirecrawlImage(hotel.name, firecrawlApiKey);
            if (imageUrl) {
              return { hotelId: hotel.id, imageUrl, source: 'firecrawl' as const };
            }
          }

          return { hotelId: hotel.id, imageUrl: null, source: 'none' as const };
        })
      );
      results.push(...batchResults);
    }

    console.log(`Fetched images for ${results.filter(r => r.imageUrl).length}/${hotels.length} hotels`);

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching hotel images:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
