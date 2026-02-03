import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ThemeParks.wiki park entity IDs mapped to park names
const PARKS_CONFIG: Record<string, { entityId: string; name: string }> = {
  'magic-kingdom': { entityId: '75ea578a-adc8-4116-a54d-dccb60765ef9', name: 'Magic Kingdom' },
  'epcot': { entityId: '47f90d2c-e191-4239-a466-5892ef59a88b', name: 'EPCOT' },
  'hollywood-studios': { entityId: '288747d1-8b4f-4a64-867e-ea7c9b27bad8', name: 'Hollywood Studios' },
  'animal-kingdom': { entityId: '1c84a229-8862-4648-9c71-378ddd2c7693', name: 'Animal Kingdom' },
  'universal-studios': { entityId: 'eb3f4560-2383-4a36-9152-6b3e5ed6bc57', name: 'Universal Studios Florida' },
  'islands-of-adventure': { entityId: '267615cc-8943-4c2a-ae2c-5da728ca591f', name: 'Islands of Adventure' },
  'epic-universe': { entityId: '12dbb85b-265f-44e6-bccf-f1faa17211fc', name: 'Epic Universe' },
  'seaworld': { entityId: '27d64dee-d85e-48dc-ad6d-8077445cd946', name: 'SeaWorld Orlando' },
  'busch-gardens': { entityId: 'fc40c99a-be0a-42f4-a483-1e939db275c2', name: 'Busch Gardens Tampa' },
};

interface WaitTimeRecord {
  attraction_name: string;
  park_name: string;
  wait_time_minutes: number | null;
  status: string;
  data_source: string;
}

interface CollectionResult {
  park: string;
  attractions_count: number;
  status: 'success' | 'error';
  error?: string;
}

// Fetch live data from ThemeParks.wiki API
async function fetchParkData(entityId: string): Promise<any[]> {
  try {
    const response = await fetch(`https://api.themeparks.wiki/v1/entity/${entityId}/live`, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      console.error(`ThemeParks.wiki API error for ${entityId}:`, response.status);
      return [];
    }
    
    const data = await response.json();
    return data.liveData || [];
  } catch (error) {
    console.error(`Error fetching from ThemeParks.wiki for ${entityId}:`, error);
    return [];
  }
}

// Normalize attraction status
function normalizeStatus(status: string): string {
  const statusMapping: Record<string, string> = {
    'OPERATING': 'Operating',
    'CLOSED': 'Closed',
    'DOWN': 'Temporarily Closed',
    'REFURBISHMENT': 'Refurbishment',
  };
  return statusMapping[status?.toUpperCase()] || 'Unknown';
}

// Collect data from a single park
async function collectParkData(
  supabase: any,
  parkSlug: string,
  parkConfig: { entityId: string; name: string }
): Promise<CollectionResult> {
  try {
    const liveData = await fetchParkData(parkConfig.entityId);
    
    if (liveData.length === 0) {
      return {
        park: parkConfig.name,
        attractions_count: 0,
        status: 'error',
        error: 'No data from API'
      };
    }

    const now = new Date();
    const records: WaitTimeRecord[] = [];

    for (const item of liveData) {
      // Only process attractions (skip shows, characters, etc.)
      if (item.entityType !== 'ATTRACTION') continue;

      const waitTime = item.queue?.STANDBY?.waitTime;
      
      records.push({
        attraction_name: item.name,
        park_name: parkConfig.name,
        wait_time_minutes: waitTime != null ? waitTime : null,
        status: normalizeStatus(item.status),
        data_source: 'themeparks-wiki',
      });
    }

    if (records.length === 0) {
      return {
        park: parkConfig.name,
        attractions_count: 0,
        status: 'success',
      };
    }

    // Bulk insert all records
    const { error: insertError } = await supabase
      .from('wait_time_records')
      .insert(records.map(r => ({
        ...r,
        timestamp: now.toISOString(),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        day_of_week: now.getDay(), // 0 = Sunday
      })));

    if (insertError) {
      console.error(`Error inserting records for ${parkConfig.name}:`, insertError);
      return {
        park: parkConfig.name,
        attractions_count: 0,
        status: 'error',
        error: insertError.message,
      };
    }

    return {
      park: parkConfig.name,
      attractions_count: records.length,
      status: 'success',
    };
  } catch (error) {
    console.error(`Error collecting data for ${parkConfig.name}:`, error);
    return {
      park: parkConfig.name,
      attractions_count: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Collect data from all parks in parallel
    const collectionPromises = Object.entries(PARKS_CONFIG).map(
      ([slug, config]) => collectParkData(supabase, slug, config)
    );

    const results = await Promise.all(collectionPromises);

    // Calculate summary
    const totalAttractions = results.reduce((sum, r) => sum + r.attractions_count, 0);
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const executionTimeMs = Date.now() - startTime;

    // Log health metrics
    const healthLog = {
      component: 'collector',
      status: errorCount === 0 ? 'success' : errorCount < results.length ? 'warning' : 'error',
      message: `Collected ${totalAttractions} attractions from ${successCount}/${results.length} parks`,
      error_details: errorCount > 0 ? { 
        errors: results.filter(r => r.status === 'error').map(r => ({ park: r.park, error: r.error }))
      } : null,
      execution_time_ms: executionTimeMs,
      parks_processed: successCount,
      attractions_updated: totalAttractions,
      records_created: totalAttractions,
    };

    await supabase.from('system_health_logs').insert(healthLog);

    console.log(`Collection complete: ${totalAttractions} attractions from ${successCount} parks in ${executionTimeMs}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        summary: {
          parks_processed: successCount,
          parks_failed: errorCount,
          total_attractions: totalAttractions,
          execution_time_ms: executionTimeMs,
        },
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in collect-wait-times:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
