import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ThemeParks.wiki park slugs
const THEMEPARKS_SLUGS: Record<string, string> = {
  'dd6b79b8-d934-4e15-8967-1f1af1911fef': 'WaltDisneyWorldMagicKingdom',
  '03e87b8e-7467-4121-971b-91826dd55bec': 'WaltDisneyWorldEpcot',
  'ffdca010-b62c-40cc-98ee-37a853da037d': 'WaltDisneyWorldHollywoodStudios',
  '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205': 'WaltDisneyWorldAnimalKingdom',
  'c63c98b3-1cef-4d90-8142-0a68331907e1': 'UniversalStudiosFloridaDestination',
  '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148': 'UniversalIslandsOfAdventure',
  'ba562b14-26bf-4b12-a13d-2aa7df43297e': 'UniversalEpicUniverse',
};

// Queue-Times.com park IDs (fallback)
const QUEUE_TIMES_IDS: Record<string, number> = {
  'dd6b79b8-d934-4e15-8967-1f1af1911fef': 6,  // Magic Kingdom
  '03e87b8e-7467-4121-971b-91826dd55bec': 5,  // EPCOT
  'ffdca010-b62c-40cc-98ee-37a853da037d': 7,  // Hollywood Studios
  '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205': 8,  // Animal Kingdom
  'c63c98b3-1cef-4d90-8142-0a68331907e1': 65, // Universal Studios Florida
  '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148': 64, // Islands of Adventure
  'ba562b14-26bf-4b12-a13d-2aa7df43297e': 334, // Epic Universe
};

interface FormattedRide {
  id: number | string;
  name: string;
  isOpen: boolean;
  waitTime: number;
  lastUpdated: string;
  source: 'themeparks' | 'queuetimes';
}

interface FormattedShow {
  id: string;
  name: string;
  entityType: 'SHOW' | 'CHARACTER';
  status: string;
  showtimes: string[];
  nextShowtime?: string;
  lastUpdated: string;
}

// Fetch from ThemeParks.wiki API
async function fetchFromThemeParks(parkSlug: string): Promise<{ rides: FormattedRide[]; shows: FormattedShow[] } | null> {
  try {
    console.log(`Trying ThemeParks.wiki for: ${parkSlug}`);
    
    // First get the entity ID
    const destinationsRes = await fetch('https://api.themeparks.wiki/v1/destinations', {
      headers: { 'Accept': 'application/json' },
    });
    
    if (!destinationsRes.ok) {
      console.error('ThemeParks.wiki destinations API error:', destinationsRes.status);
      return null;
    }
    
    const destinations = await destinationsRes.json();
    
    // Find the park
    let parkId: string | null = null;
    for (const dest of destinations.destinations) {
      if (dest.parks) {
        for (const park of dest.parks) {
          if (park.slug === parkSlug || park.id?.includes(parkSlug)) {
            parkId = park.id;
            break;
          }
        }
      }
      if (parkId) break;
    }
    
    if (!parkId) {
      console.log(`Park not found in ThemeParks.wiki: ${parkSlug}`);
      return null;
    }
    
    // Get live data
    const liveRes = await fetch(`https://api.themeparks.wiki/v1/entity/${parkId}/live`, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (!liveRes.ok) {
      console.error('ThemeParks.wiki live API error:', liveRes.status);
      return null;
    }
    
    const liveData = await liveRes.json();
    
    const rides: FormattedRide[] = [];
    const shows: FormattedShow[] = [];
    
    if (liveData.liveData) {
      for (const item of liveData.liveData) {
        if (item.entityType === 'ATTRACTION') {
          rides.push({
            id: item.id,
            name: item.name,
            isOpen: item.status === 'OPERATING',
            waitTime: item.queue?.STANDBY?.waitTime || 0,
            lastUpdated: item.lastUpdated || new Date().toISOString(),
            source: 'themeparks',
          });
        } else if (item.entityType === 'SHOW' || item.entityType === 'CHARACTER') {
          // Extract showtimes from the API response
          const showtimes: string[] = [];
          
          if (item.showtimes && Array.isArray(item.showtimes)) {
            for (const showtime of item.showtimes) {
              if (showtime.startTime) {
                // Convert to local time string (HH:MM format)
                const date = new Date(showtime.startTime);
                const timeStr = date.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'America/New_York' // Orlando timezone
                });
                showtimes.push(timeStr);
              }
            }
          }
          
          // Find next showtime
          let nextShowtime: string | undefined;
          const now = new Date();
          if (item.showtimes && Array.isArray(item.showtimes)) {
            for (const showtime of item.showtimes) {
              if (showtime.startTime) {
                const showDate = new Date(showtime.startTime);
                if (showDate > now) {
                  nextShowtime = showDate.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'America/New_York'
                  });
                  break;
                }
              }
            }
          }
          
          shows.push({
            id: item.id,
            name: item.name,
            entityType: item.entityType,
            status: item.status || 'UNKNOWN',
            showtimes: showtimes,
            nextShowtime: nextShowtime,
            lastUpdated: item.lastUpdated || new Date().toISOString(),
          });
        }
      }
    }
    
    console.log(`ThemeParks.wiki returned ${rides.length} rides and ${shows.length} shows/characters`);
    return { rides, shows };
    
  } catch (error) {
    console.error('ThemeParks.wiki error:', error);
    return null;
  }
}

// Fetch from Queue-Times.com API (fallback - rides only)
async function fetchFromQueueTimes(queueTimesParkId: number): Promise<FormattedRide[] | null> {
  try {
    console.log(`Trying Queue-Times.com for park ID: ${queueTimesParkId}`);
    
    const response = await fetch(`https://queue-times.com/parks/${queueTimesParkId}/queue_times.json`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OrlandoFastPass/1.0',
      },
    });

    if (!response.ok) {
      console.error(`Queue-Times API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    const allRides: any[] = [];
    
    if (data.lands) {
      data.lands.forEach((land: any) => {
        if (land.rides) {
          allRides.push(...land.rides);
        }
      });
    }
    
    if (data.rides) {
      allRides.push(...data.rides);
    }

    const rides: FormattedRide[] = allRides.map(ride => ({
      id: ride.id,
      name: ride.name,
      isOpen: ride.is_open,
      waitTime: ride.wait_time,
      lastUpdated: ride.last_updated || new Date().toISOString(),
      source: 'queuetimes',
    }));

    console.log(`Queue-Times.com returned ${rides.length} rides`);
    return rides;
    
  } catch (error) {
    console.error('Queue-Times error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { parkId } = await req.json();
    
    if (!parkId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Park ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const themeParksSlug = THEMEPARKS_SLUGS[parkId];
    const queueTimesParkId = QUEUE_TIMES_IDS[parkId];
    
    if (!themeParksSlug && !queueTimesParkId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Park not supported', data: [], shows: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let rides: FormattedRide[] | null = null;
    let shows: FormattedShow[] = [];
    let source = 'unknown';

    // Try ThemeParks.wiki first (more real-time, has shows/characters)
    if (themeParksSlug) {
      const result = await fetchFromThemeParks(themeParksSlug);
      if (result) {
        rides = result.rides;
        shows = result.shows;
        source = 'themeparks.wiki';
      }
    }

    // Fallback to Queue-Times.com for rides only
    if (!rides && queueTimesParkId) {
      rides = await fetchFromQueueTimes(queueTimesParkId);
      if (rides) source = 'queue-times.com';
    }

    if (!rides || rides.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No wait time data available', data: [], shows: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully fetched ${rides.length} rides and ${shows.length} shows from ${source}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: rides,
        shows: shows,
        source,
        lastFetched: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching queue times:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', data: [], shows: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
