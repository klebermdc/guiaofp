import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DailyStats {
  attraction_name: string;
  park_name: string;
  date: string;
  day_of_week: number;
  avg_wait_time: number;
  median_wait_time: number;
  min_wait_time: number;
  max_wait_time: number;
  std_deviation: number;
  peak_time: string;
  peak_wait_time: number;
  best_time: string;
  best_wait_time: number;
  data_points_collected: number;
  data_completeness_percent: number;
  confidence_score: number;
}

// Calculate median of an array
function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Calculate standard deviation
function stdDev(arr: number[]): number {
  if (arr.length === 0) return 0;
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / arr.length);
}

// Calculate confidence score (0.00 to 1.00)
function calculateConfidence(
  dataCompleteness: number,
  stdDeviation: number,
  sampleSize: number
): number {
  // Normalize completeness (0-100 → 0-1)
  const completenessScore = Math.min(dataCompleteness / 100, 1.0);
  
  // Normalize consistency (lower std dev is better, assuming 50+ is poor)
  const consistencyScore = Math.max(0, 1.0 - (stdDeviation / 50));
  
  // Normalize sample size (saturate at 500 minutes)
  const sampleScore = Math.min(sampleSize / 500, 1.0);
  
  // Weighted average
  const confidence = (0.3 * completenessScore) + (0.3 * consistencyScore) + (0.4 * sampleScore);
  
  return Math.round(confidence * 100) / 100;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { target_date } = await req.json().catch(() => ({}));
    
    // Default to yesterday if no date provided
    const targetDate = target_date || (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    })();

    console.log(`Processing daily analytics for ${targetDate}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Count total records for the target date
    const { count: totalRecords } = await supabase
      .from('wait_time_records')
      .select('id', { count: 'exact', head: true })
      .eq('date', targetDate)
      .eq('status', 'Operating');

    if (!totalRecords || totalRecords === 0) {
      console.log(`No records found for ${targetDate}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `No records found for ${targetDate}`,
          attractions_processed: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all records in batches of 5000
    const batchSize = 5000;
    const records: any[] = [];
    
    for (let offset = 0; offset < totalRecords; offset += batchSize) {
      const { data: batch, error: batchErr } = await supabase
        .from('wait_time_records')
        .select('*')
        .eq('date', targetDate)
        .eq('status', 'Operating')
        .order('time')
        .range(offset, offset + batchSize - 1);

      if (batchErr) throw new Error(`Error fetching records batch: ${batchErr.message}`);
      if (batch) records.push(...batch);
      if (!batch || batch.length < batchSize) break;
    }

    console.log(`Fetched ${records.length} records for ${targetDate}`);

    // Group records by attraction + park
    const groupedRecords: Record<string, typeof records> = {};
    for (const record of records) {
      const key = `${record.attraction_name}|${record.park_name}`;
      if (!groupedRecords[key]) {
        groupedRecords[key] = [];
      }
      groupedRecords[key].push(record);
    }

    const analyticsToUpsert: DailyStats[] = [];

    for (const [key, attractionRecords] of Object.entries(groupedRecords)) {
      const [attractionName, parkName] = key.split('|');
      
      // Get wait times (filter out nulls)
      const waitTimes = attractionRecords
        .map(r => r.wait_time_minutes)
        .filter((w): w is number => w !== null && w !== undefined);

      if (waitTimes.length === 0) continue;

      // Calculate statistics
      const avgWaitTime = waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;
      const medianWaitTime = median(waitTimes);
      const minWaitTime = Math.min(...waitTimes);
      const maxWaitTime = Math.max(...waitTimes);
      const stdDeviation = stdDev(waitTimes);

      // Find peak and best times
      const peakRecord = attractionRecords.reduce((peak, r) => 
        (r.wait_time_minutes || 0) > (peak.wait_time_minutes || 0) ? r : peak
      );
      const bestRecord = attractionRecords.reduce((best, r) => 
        (r.wait_time_minutes || Infinity) < (best.wait_time_minutes || Infinity) ? r : best
      );

      // Calculate data completeness (assuming 12 hour operation = 720 minutes)
      const dataCompleteness = (waitTimes.length / 720) * 100;

      // Calculate confidence score
      const confidence = calculateConfidence(dataCompleteness, stdDeviation, waitTimes.length);

      analyticsToUpsert.push({
        attraction_name: attractionName,
        park_name: parkName,
        date: targetDate,
        day_of_week: attractionRecords[0].day_of_week,
        avg_wait_time: Math.round(avgWaitTime * 100) / 100,
        median_wait_time: Math.round(medianWaitTime * 100) / 100,
        min_wait_time: minWaitTime,
        max_wait_time: maxWaitTime,
        std_deviation: Math.round(stdDeviation * 100) / 100,
        peak_time: peakRecord.time,
        peak_wait_time: peakRecord.wait_time_minutes || 0,
        best_time: bestRecord.time,
        best_wait_time: bestRecord.wait_time_minutes || 0,
        data_points_collected: waitTimes.length,
        data_completeness_percent: Math.round(dataCompleteness * 100) / 100,
        confidence_score: confidence,
      });
    }

    // Upsert analytics (ON CONFLICT UPDATE)
    if (analyticsToUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('daily_analytics')
        .upsert(analyticsToUpsert, {
          onConflict: 'attraction_name,park_name,date',
        });

      if (upsertError) {
        throw new Error(`Error upserting analytics: ${upsertError.message}`);
      }
    }

    // Update optimal windows based on accumulated data
    await updateOptimalWindows(supabase, targetDate);

    const executionTimeMs = Date.now() - startTime;

    // Log health metrics
    await supabase.from('system_health_logs').insert({
      component: 'daily-processor',
      status: 'success',
      message: `Processed ${analyticsToUpsert.length} attractions for ${targetDate}`,
      execution_time_ms: executionTimeMs,
      attractions_updated: analyticsToUpsert.length,
    });

    console.log(`Daily processing complete: ${analyticsToUpsert.length} attractions in ${executionTimeMs}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        date: targetDate,
        attractions_processed: analyticsToUpsert.length,
        execution_time_ms: executionTimeMs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in process-daily-analytics:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Update optimal windows based on historical data
async function updateOptimalWindows(supabase: any, upToDate: string) {
  console.log("Updating optimal windows...");

  // Get last 90 days of data
  const startDate = new Date(upToDate);
  startDate.setDate(startDate.getDate() - 90);
  const startDateStr = startDate.toISOString().split('T')[0];

  // Count total records first
  const { count: totalCount } = await supabase
    .from('wait_time_records')
    .select('id', { count: 'exact', head: true })
    .gte('date', startDateStr)
    .lte('date', upToDate)
    .eq('status', 'Operating')
    .not('wait_time_minutes', 'is', null);

  if (!totalCount || totalCount < 100) {
    console.log(`Not enough data for optimal windows calculation (${totalCount || 0} records)`);
    return;
  }

  console.log(`Fetching ${totalCount} records for optimal windows...`);

  // Fetch in pages of 1000 (Supabase client default) using proper pagination
  const pageSize = 1000;
  const records: any[] = [];
  let page = 0;
  const maxRecords = 50000; // Cap to prevent timeout
  
  while (records.length < Math.min(totalCount, maxRecords)) {
    const { data: batch, error: batchErr } = await supabase
      .from('wait_time_records')
      .select('attraction_name, park_name, day_of_week, time, wait_time_minutes')
      .gte('date', startDateStr)
      .lte('date', upToDate)
      .eq('status', 'Operating')
      .not('wait_time_minutes', 'is', null)
      .order('id')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (batchErr) {
      console.error(`Error fetching batch page ${page}:`, batchErr);
      break;
    }
    if (!batch || batch.length === 0) break;
    records.push(...batch);
    page++;
    if (batch.length < pageSize) break;
  }

  console.log(`Fetched ${records.length} records for optimal windows calculation (capped at ${maxRecords})`);

  // Group by attraction + park + day_of_week
  const grouped: Record<string, Record<string, number[]>> = {};

  for (const record of records) {
    const key = `${record.attraction_name}|${record.park_name}|${record.day_of_week}`;
    
    if (!grouped[key]) {
      grouped[key] = {};
    }

    // Round time to 10-minute window
    const timeParts = record.time.split(':');
    const minutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
    const windowStart = Math.floor(minutes / 10) * 10;
    const windowKey = `${String(Math.floor(windowStart / 60)).padStart(2, '0')}:${String(windowStart % 60).padStart(2, '0')}`;

    if (!grouped[key][windowKey]) {
      grouped[key][windowKey] = [];
    }
    grouped[key][windowKey].push(record.wait_time_minutes);
  }

  // Calculate optimal windows for each attraction/day combination
  const windowsToUpsert: any[] = [];

  for (const [groupKey, windows] of Object.entries(grouped)) {
    const [attractionName, parkName, dayOfWeek] = groupKey.split('|');

    // Calculate stats for each window
    const windowStats = Object.entries(windows)
      .filter(([_, times]) => times.length >= 5) // Minimum samples
      .map(([windowKey, times]) => {
        const [hour, minute] = windowKey.split(':').map(Number);
        const avgWait = times.reduce((a, b) => a + b, 0) / times.length;
        const stdDev = Math.sqrt(times.reduce((sum, t) => sum + Math.pow(t - avgWait, 2), 0) / times.length);
        
        return {
          windowKey,
          avgWait,
          minWait: Math.min(...times),
          maxWait: Math.max(...times),
          stdDev,
          sampleSize: times.length,
          hour,
          minute,
        };
      })
      .sort((a, b) => a.avgWait - b.avgWait);

    // Take top 10 windows
    windowStats.slice(0, 10).forEach((window, index) => {
      const confidence = calculateConfidence(100, window.stdDev, window.sampleSize);
      
      const endMinute = (window.minute + 10) % 60;
      const endHour = window.minute >= 50 ? (window.hour + 1) % 24 : window.hour;

      windowsToUpsert.push({
        attraction_name: attractionName,
        park_name: parkName,
        day_of_week: parseInt(dayOfWeek),
        time_window_start: `${String(window.hour).padStart(2, '0')}:${String(window.minute).padStart(2, '0')}:00`,
        time_window_end: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`,
        avg_wait_time: Math.round(window.avgWait * 100) / 100,
        min_wait_time: window.minWait,
        max_wait_time: window.maxWait,
        std_deviation: Math.round(window.stdDev * 100) / 100,
        confidence_score: confidence,
        sample_size: window.sampleSize,
        ranking: index + 1,
        is_recommended: index < 3, // Top 3 are recommended
        last_updated: new Date().toISOString(),
      });
    });
  }

  // Upsert windows
  if (windowsToUpsert.length > 0) {
    const { error: upsertError } = await supabase
      .from('optimal_windows')
      .upsert(windowsToUpsert, {
        onConflict: 'attraction_name,park_name,day_of_week,time_window_start',
      });

    if (upsertError) {
      console.error("Error upserting optimal windows:", upsertError);
    } else {
      console.log(`Updated ${windowsToUpsert.length} optimal windows`);
    }
  }
}
