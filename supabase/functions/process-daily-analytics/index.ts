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

    // Fetch all records in pages of 1000
    const pageSize = 1000;
    const records: any[] = [];
    let page = 0;
    
    while (true) {
      const { data: batch, error: batchErr } = await supabase
        .from('wait_time_records')
        .select('*')
        .eq('date', targetDate)
        .eq('status', 'Operating')
        .order('time')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (batchErr) throw new Error(`Error fetching records batch: ${batchErr.message}`);
      if (!batch || batch.length === 0) break;
      records.push(...batch);
      page++;
      if (batch.length < pageSize) break;
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

// Update optimal windows based on daily_analytics (already aggregated)
async function updateOptimalWindows(supabase: any, upToDate: string) {
  console.log("Updating optimal windows from daily_analytics...");

  const startDate = new Date(upToDate);
  startDate.setDate(startDate.getDate() - 30);
  const startDateStr = startDate.toISOString().split('T')[0];

  // Fetch from daily_analytics (much smaller than raw records)
  const pageSize = 1000;
  const analytics: any[] = [];
  let page = 0;

  while (true) {
    const { data: batch, error } = await supabase
      .from('daily_analytics')
      .select('attraction_name, park_name, day_of_week, best_time, best_wait_time, peak_time, peak_wait_time, avg_wait_time, min_wait_time, max_wait_time, std_deviation, data_points_collected')
      .gte('date', startDateStr)
      .lte('date', upToDate)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching daily_analytics:", error);
      break;
    }
    if (!batch || batch.length === 0) break;
    analytics.push(...batch);
    page++;
    if (batch.length < pageSize) break;
  }

  if (analytics.length < 5) {
    console.log(`Not enough analytics data (${analytics.length} records)`);
    return;
  }

  console.log(`Processing ${analytics.length} daily_analytics records for optimal windows`);

  // Group by attraction + park + day_of_week
  const grouped: Record<string, any[]> = {};
  for (const a of analytics) {
    const key = `${a.attraction_name}|${a.park_name}|${a.day_of_week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  }

  const windowsToUpsert: any[] = [];

  for (const [groupKey, dayRecords] of Object.entries(grouped)) {
    const [attractionName, parkName, dayOfWeek] = groupKey.split('|');

    // Calculate aggregate stats across all days for this attraction/day combo
    const avgWaits = dayRecords.map(d => d.avg_wait_time).filter((v: any) => v != null);
    const bestWaits = dayRecords.map(d => d.best_wait_time).filter((v: any) => v != null);
    const bestTimes = dayRecords.map(d => d.best_time).filter((v: any) => v != null);

    if (avgWaits.length === 0) continue;

    const overallAvg = avgWaits.reduce((a: number, b: number) => a + b, 0) / avgWaits.length;
    const overallMin = bestWaits.length > 0 ? Math.min(...bestWaits) : 0;
    const overallMax = dayRecords.map(d => d.max_wait_time).filter((v: any) => v != null);
    const maxWait = overallMax.length > 0 ? Math.max(...overallMax) : 0;

    // Find the most common best time
    const timeCounts: Record<string, { count: number; totalWait: number }> = {};
    for (const d of dayRecords) {
      if (d.best_time) {
        // Round to 10-min window
        const parts = d.best_time.split(':');
        const mins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        const windowStart = Math.floor(mins / 10) * 10;
        const windowKey = `${String(Math.floor(windowStart / 60)).padStart(2, '0')}:${String(windowStart % 60).padStart(2, '0')}`;
        
        if (!timeCounts[windowKey]) timeCounts[windowKey] = { count: 0, totalWait: 0 };
        timeCounts[windowKey].count++;
        timeCounts[windowKey].totalWait += (d.best_wait_time || d.avg_wait_time || 0);
      }
    }

    // Sort by average wait (lower is better)
    const sortedWindows = Object.entries(timeCounts)
      .map(([timeKey, stats]) => ({
        timeKey,
        avgWait: stats.totalWait / stats.count,
        sampleSize: stats.count,
      }))
      .sort((a, b) => a.avgWait - b.avgWait);

    // Take top 5 windows
    sortedWindows.slice(0, 5).forEach((window, index) => {
      const [hour, minute] = window.timeKey.split(':').map(Number);
      const endMinute = (minute + 10) % 60;
      const endHour = minute >= 50 ? (hour + 1) % 24 : hour;

      const totalSamples = dayRecords.reduce((sum: number, d: any) => sum + (d.data_points_collected || 0), 0);
      const confidence = calculateConfidence(100, 0, totalSamples);

      windowsToUpsert.push({
        attraction_name: attractionName,
        park_name: parkName,
        day_of_week: parseInt(dayOfWeek),
        time_window_start: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
        time_window_end: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`,
        avg_wait_time: Math.round(window.avgWait * 100) / 100,
        min_wait_time: overallMin,
        max_wait_time: maxWait,
        std_deviation: 0,
        confidence_score: confidence,
        sample_size: window.sampleSize,
        ranking: index + 1,
        is_recommended: index < 3,
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
  } else {
    console.log("No optimal windows to upsert");
  }
}
