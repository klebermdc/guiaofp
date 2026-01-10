import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Queue-Times.com park IDs
const PARK_IDS: Record<string, number> = {
  'magic-kingdom': 6,
  'epcot': 5,
  'hollywood-studios': 7,
  'animal-kingdom': 8,
  'universal-studios': 10,
  'islands-of-adventure': 9,
  'epic-universe': 334, // May need to verify this ID
};

// Map Queue-Times park IDs to our category IDs
const CATEGORY_TO_QUEUE_TIMES: Record<string, number> = {
  'dd6b79b8-d934-4e15-8967-1f1af1911fef': 6,  // Magic Kingdom
  '03e87b8e-7467-4121-971b-91826dd55bec': 5,  // EPCOT
  'ffdca010-b62c-40cc-98ee-37a853da037d': 7,  // Hollywood Studios
  '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205': 8,  // Animal Kingdom
  'c63c98b3-1cef-4d90-8142-0a68331907e1': 10, // Universal Studios
  '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148': 9,  // Islands of Adventure
  'ba562b14-26bf-4b12-a13d-2aa7df43297e': 334, // Epic Universe
};

interface QueueTimesRide {
  id: number;
  name: string;
  is_open: boolean;
  wait_time: number;
  last_updated: string;
}

interface QueueTimesLand {
  id: number;
  name: string;
  rides: QueueTimesRide[];
}

interface QueueTimesResponse {
  lands: QueueTimesLand[];
  rides: QueueTimesRide[];
}

serve(async (req) => {
  // Handle CORS preflight
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

    // Get Queue-Times park ID from our category ID
    const queueTimesParkId = CATEGORY_TO_QUEUE_TIMES[parkId];
    
    if (!queueTimesParkId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Park not supported', data: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching wait times for park ID: ${queueTimesParkId}`);

    // Fetch from Queue-Times.com API
    const response = await fetch(`https://queue-times.com/parks/${queueTimesParkId}/queue_times.json`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OrlandoFastPass/1.0',
      },
    });

    if (!response.ok) {
      console.error(`Queue-Times API error: ${response.status}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch wait times', data: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: QueueTimesResponse = await response.json();
    
    // Flatten all rides from lands
    const allRides: QueueTimesRide[] = [];
    
    if (data.lands) {
      data.lands.forEach(land => {
        if (land.rides) {
          allRides.push(...land.rides);
        }
      });
    }
    
    if (data.rides) {
      allRides.push(...data.rides);
    }

    // Format response
    const formattedRides = allRides.map(ride => ({
      id: ride.id,
      name: ride.name,
      isOpen: ride.is_open,
      waitTime: ride.wait_time,
      lastUpdated: ride.last_updated,
    }));

    console.log(`Found ${formattedRides.length} rides with wait times`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: formattedRides,
        lastFetched: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching queue times:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', data: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
