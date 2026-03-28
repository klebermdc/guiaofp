import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimit } from "../_middleware/rate-limit.ts";

// CORS: restrict to explicit origin whitelist
const ALLOWED_ORIGINS = [
  "https://guiaofp.lovable.app",
  "https://ofp.app",
  "https://app.ofp.app",
  "https://planner.ofp.app",
  Deno.env.get("ENVIRONMENT") === "development" ? "http://localhost:3000" : null,
].filter(Boolean) as string[];

const getCorsHeaders = (requestOrigin: string | null) => {
  const allowOrigin =
    requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
      ? requestOrigin
      : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  };
};

// Per-request CORS headers (set in handler)
let _corsHeaders: Record<string, string> = {};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: _corsHeaders });
}

function errorResponse(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

// Admin check via user_roles table
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

Deno.serve(async (req) => {
  // Set CORS headers based on request origin
  _corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: _corsHeaders });
  }

  // Auth: Bearer token
  const authHeader = req.headers.get("Authorization");
  const expectedKey = Deno.env.get("OPENCLAW_API_KEY");
  
  if (!expectedKey) {
    return errorResponse("API key not configured on server", 500);
  }
  
  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return errorResponse("Unauthorized", 401);
  }

  // Rate limiting
  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitKey = `${clientIp}:${authHeader}`;

  // Determine per-endpoint limit
  const urlPath = new URL(req.url).pathname.replace(/^\/openclaw-api\/?/, "/").replace(/\/+$/, "") || "/";
  const sensitiveEndpoints = ["/users", "/transactions", "/metrics"];
  const endpointLimit = sensitiveEndpoints.some(e => urlPath.startsWith(e)) ? 20 : 100;

  const { allowed, remaining } = rateLimit(`${rateLimitKey}:${urlPath}`, endpointLimit, 60000);

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded" }),
      {
        status: 429,
        headers: {
          ..._corsHeaders,
          "Retry-After": "60",
          "X-RateLimit-Limit": endpointLimit.toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Attach rate limit info to all responses
  _corsHeaders["X-RateLimit-Limit"] = endpointLimit.toString();
  _corsHeaders["X-RateLimit-Remaining"] = remaining.toString();

  // Supabase admin client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/openclaw-api\/?/, "/").replace(/\/+$/, "") || "/";
  const method = req.method;

  try {
    // ============ HEALTH ============
    if (path === "/health" && method === "GET") {
      return jsonResponse({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });
    }

    // ============ METRICS (admin only) ============
    if (path === "/metrics" && method === "GET") {
      // Verify admin role via auth token
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader! } } }
      );
      const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(
        authHeader!.replace("Bearer ", "")
      );
      // If token is the API key (not a user JWT), allow (backwards compat)
      // but if it's a user JWT, enforce admin
      if (claimsData?.claims?.sub) {
        const userId = claimsData.claims.sub as string;
        if (!(await isAdmin(supabase, userId))) {
          return errorResponse("Forbidden: Admin access required", 403);
        }
      }
      const [profilesRes, transRes, activeRes, paidRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("transactions").select("id, amount_cents, status, created_at"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_access_enabled", true),
        supabase.from("transactions").select("amount_cents").eq("status", "confirmed"),
      ]);

      const totalUsers = profilesRes.count || 0;
      const activeUsers = activeRes.count || 0;
      const allTransactions = transRes.data || [];
      const paidTransactions = paidRes.data || [];
      
      const totalRevenueCents = paidTransactions.reduce((sum: number, t: any) => sum + (t.amount_cents || 0), 0);
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentTransactions = allTransactions.filter((t: any) => new Date(t.created_at) >= thirtyDaysAgo);
      const confirmedRecent = recentTransactions.filter((t: any) => t.status === "confirmed");
      const conversionRate = recentTransactions.length > 0
        ? ((confirmedRecent.length / recentTransactions.length) * 100).toFixed(1)
        : "0";

      return jsonResponse({
        total_users: totalUsers,
        active_users: activeUsers,
        total_revenue_cents: totalRevenueCents,
        total_revenue_brl: (totalRevenueCents / 100).toFixed(2),
        total_transactions: allTransactions.length,
        confirmed_transactions: paidTransactions.length,
        conversion_rate_30d: `${conversionRate}%`,
        pending_transactions: allTransactions.filter((t: any) => t.status === "pending").length,
      });
    }

    // ============ USERS ============
    if (path === "/users" && method === "GET") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
      const offset = (page - 1) * limit;
      const search = url.searchParams.get("search") || "";
      const plan = url.searchParams.get("plan") || "";
      const access = url.searchParams.get("access") || "";

      let query = supabase
        .from("profiles")
        .select("id, user_id, responsible_name, email, whatsapp, plan_tier, is_access_enabled, arrival_date, departure_date, group_size, hotel, guide_name, completion_percentage, created_at, updated_at", { count: "exact" });

      if (search) {
        query = query.or(`responsible_name.ilike.%${search}%,email.ilike.%${search}%,whatsapp.ilike.%${search}%`);
      }
      if (plan) query = query.eq("plan_tier", plan);
      if (access === "true") query = query.eq("is_access_enabled", true);
      if (access === "false") query = query.eq("is_access_enabled", false);

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message, 500);

      return jsonResponse({
        users: data,
        total: count,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      });
    }

    // ============ USER BY ID ============
    const userMatch = path.match(/^\/users\/([a-f0-9-]+)$/);
    if (userMatch && method === "GET") {
      const userId = userMatch[1];
      
      const [profileRes, transRes, itineraryRes, plannerRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("itineraries").select("id, title, start_date, end_date, created_at").eq("user_id", userId),
        supabase.from("user_planners").select("id, title, start_date, end_date, created_at").eq("user_id", userId),
      ]);

      if (!profileRes.data) return errorResponse("User not found", 404);

      return jsonResponse({
        profile: profileRes.data,
        transactions: transRes.data || [],
        itineraries: itineraryRes.data || [],
        planners: plannerRes.data || [],
      });
    }

    // ============ UPDATE USER ============
    if (userMatch && method === "PATCH") {
      const userId = userMatch[1];
      const body = await req.json();
      
      // Only allow safe fields
      const allowedFields = ["is_access_enabled", "plan_tier", "guide_name"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (body[key] !== undefined) updateData[key] = body[key];
      }

      if (Object.keys(updateData).length === 0) {
        return errorResponse("No valid fields to update. Allowed: " + allowedFields.join(", "), 400);
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ updated: true, profile: data });
    }

    // ============ TRANSACTIONS ============
    if (path === "/transactions" && method === "GET") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
      const offset = (page - 1) * limit;
      const status = url.searchParams.get("status") || "";

      let query = supabase
        .from("transactions")
        .select("*", { count: "exact" });

      if (status) query = query.eq("status", status);

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message, 500);

      return jsonResponse({
        transactions: data,
        total: count,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      });
    }

    // ============ ABANDONED CARTS ============
    if (path === "/abandoned-carts" && method === "GET") {
      const status = url.searchParams.get("status") || "abandoned";
      
      let query = supabase.from("abandoned_carts").select("*", { count: "exact" });
      if (status !== "all") query = query.eq("status", status);

      const { data, count, error } = await query.order("created_at", { ascending: false }).limit(100);
      if (error) return errorResponse(error.message, 500);

      return jsonResponse({ carts: data, total: count });
    }

    // ============ ITINERARIES ============
    if (path === "/itineraries" && method === "GET") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from("itineraries")
        .select("id, user_id, title, destination, start_date, end_date, total_days, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message, 500);

      return jsonResponse({ itineraries: data, total: count, page, limit });
    }

    // ============ WAIT TIME RECORDS ============
    if (path === "/wait-times" && method === "GET") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
      const offset = (page - 1) * limit;
      const park = url.searchParams.get("park") || "";
      const attraction = url.searchParams.get("attraction") || "";
      const date = url.searchParams.get("date") || "";
      const dateFrom = url.searchParams.get("date_from") || "";
      const dateTo = url.searchParams.get("date_to") || "";

      let query = supabase
        .from("wait_time_records")
        .select("id, attraction_name, park_name, wait_time_minutes, status, date, time, day_of_week, timestamp, data_source", { count: "exact" });

      if (park) query = query.ilike("park_name", `%${park}%`);
      if (attraction) query = query.ilike("attraction_name", `%${attraction}%`);
      if (date) query = query.eq("date", date);
      if (dateFrom) query = query.gte("date", dateFrom);
      if (dateTo) query = query.lte("date", dateTo);

      const { data, count, error } = await query
        .order("timestamp", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message, 500);

      return jsonResponse({
        wait_times: data,
        total: count,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      });
    }

    // ============ WAIT TIME STATS (aggregated) ============
    if (path === "/wait-times/stats" && method === "GET") {
      const park = url.searchParams.get("park") || "";
      const dateFrom = url.searchParams.get("date_from") || "";
      const dateTo = url.searchParams.get("date_to") || "";

      // Default to last 30 days if no date filter
      let effectiveDateFrom = dateFrom;
      if (!dateFrom && !dateTo) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        effectiveDateFrom = thirtyDaysAgo.toISOString().split('T')[0];
      }

      // Get total count first
      let countQuery = supabase
        .from("wait_time_records")
        .select("id", { count: "exact", head: true })
        .eq("status", "Operating")
        .not("wait_time_minutes", "is", null);
      if (park) countQuery = countQuery.ilike("park_name", `%${park}%`);
      if (effectiveDateFrom) countQuery = countQuery.gte("date", effectiveDateFrom);
      if (dateTo) countQuery = countQuery.lte("date", dateTo);

      const { count: totalCount } = await countQuery;
      const total = totalCount || 0;

      // Fetch in batches of 5000 to bypass 1000-row limit
      const batchSize = 5000;
      const batches = Math.ceil(total / batchSize);
      const allData: any[] = [];

      for (let i = 0; i < batches; i++) {
        let batchQuery = supabase
          .from("wait_time_records")
          .select("park_name, attraction_name, wait_time_minutes, data_source")
          .eq("status", "Operating")
          .not("wait_time_minutes", "is", null);
        if (park) batchQuery = batchQuery.ilike("park_name", `%${park}%`);
        if (effectiveDateFrom) batchQuery = batchQuery.gte("date", effectiveDateFrom);
        if (dateTo) batchQuery = batchQuery.lte("date", dateTo);

        const { data: batch, error: batchErr } = await batchQuery
          .range(i * batchSize, (i + 1) * batchSize - 1);
        
        if (batchErr) return errorResponse(batchErr.message, 500);
        if (batch) allData.push(...batch);
        if (!batch || batch.length < batchSize) break;
      }

      // Aggregate by park
      const parkStats: Record<string, { total: number; sum: number; max: number; min: number; attractions: Set<string>; sources: Record<string, number> }> = {};
      for (const r of allData) {
        const p = r.park_name;
        if (!parkStats[p]) parkStats[p] = { total: 0, sum: 0, max: 0, min: Infinity, attractions: new Set(), sources: {} };
        parkStats[p].total++;
        parkStats[p].sum += r.wait_time_minutes;
        if (r.wait_time_minutes > parkStats[p].max) parkStats[p].max = r.wait_time_minutes;
        if (r.wait_time_minutes < parkStats[p].min) parkStats[p].min = r.wait_time_minutes;
        parkStats[p].attractions.add(r.attraction_name);
        const src = r.data_source || "unknown";
        parkStats[p].sources[src] = (parkStats[p].sources[src] || 0) + 1;
      }

      const summary = Object.entries(parkStats).map(([parkName, s]) => ({
        park: parkName,
        data_points: s.total,
        avg_wait: s.total > 0 ? Math.round(s.sum / s.total) : 0,
        max_wait: s.max,
        min_wait: s.min === Infinity ? 0 : s.min,
        unique_attractions: s.attractions.size,
        data_sources: s.sources,
      }));

      return jsonResponse({ parks: summary, total_records: allData.length, total_in_db: total });
    }

    // ============ WAIT TIME SOURCES BREAKDOWN ============
    if (path === "/wait-times/sources" && method === "GET") {
      // Count by data_source using paginated fetch
      const { count: totalRecs } = await supabase
        .from("wait_time_records")
        .select("id", { count: "exact", head: true });

      const batchSize = 5000;
      const sources: Record<string, number> = {};
      let fetched = 0;

      while (fetched < (totalRecs || 0)) {
        const { data: batch } = await supabase
          .from("wait_time_records")
          .select("data_source")
          .range(fetched, fetched + batchSize - 1);
        
        if (!batch || batch.length === 0) break;
        for (const r of batch) {
          const src = r.data_source || "unknown";
          sources[src] = (sources[src] || 0) + 1;
        }
        fetched += batch.length;
        if (batch.length < batchSize) break;
      }

      const totalCount = Object.values(sources).reduce((a, b) => a + b, 0);
      const breakdown = Object.entries(sources).map(([source, count]) => ({
        source,
        count,
        percentage: totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) + "%" : "0%",
      }));

      return jsonResponse({ sources: breakdown, total_records: totalCount });
    }

    // ============ DAILY ANALYTICS ============
    if (path === "/daily-analytics" && method === "GET") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
      const offset = (page - 1) * limit;
      const park = url.searchParams.get("park") || "";
      const attraction = url.searchParams.get("attraction") || "";
      const date = url.searchParams.get("date") || "";
      const dateFrom = url.searchParams.get("date_from") || "";
      const dateTo = url.searchParams.get("date_to") || "";

      let query = supabase
        .from("daily_analytics")
        .select("*", { count: "exact" });

      if (park) query = query.ilike("park_name", `%${park}%`);
      if (attraction) query = query.ilike("attraction_name", `%${attraction}%`);
      if (date) query = query.eq("date", date);
      if (dateFrom) query = query.gte("date", dateFrom);
      if (dateTo) query = query.lte("date", dateTo);

      const { data, count, error } = await query
        .order("date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message, 500);

      return jsonResponse({
        analytics: data,
        total: count,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      });
    }

    // ============ OPTIMAL WINDOWS ============
    if (path === "/optimal-windows" && method === "GET") {
      const park = url.searchParams.get("park") || "";
      const attraction = url.searchParams.get("attraction") || "";
      const dayOfWeek = url.searchParams.get("day_of_week");

      let query = supabase
        .from("optimal_windows")
        .select("*");

      if (park) query = query.ilike("park_name", `%${park}%`);
      if (attraction) query = query.ilike("attraction_name", `%${attraction}%`);
      if (dayOfWeek) query = query.eq("day_of_week", parseInt(dayOfWeek));

      const { data, error } = await query.order("ranking", { ascending: true }).limit(500);
      if (error) return errorResponse(error.message, 500);

      return jsonResponse({ windows: data, total: data?.length || 0 });
    }

    // ============ SYSTEM HEALTH ============
    if (path === "/system-health" && method === "GET") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const component = url.searchParams.get("component") || "";

      let query = supabase
        .from("system_health_logs")
        .select("*");

      if (component) query = query.eq("component", component);

      const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
      if (error) return errorResponse(error.message, 500);

      return jsonResponse({ logs: data, total: data?.length || 0 });
    }

    // ============ PARKS ============
    if (path === "/parks" && method === "GET") {
      const { data, error } = await supabase
        .from("parks")
        .select("*")
        .order("name");

      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ parks: data, total: data?.length || 0 });
    }

    // ============ ATTRACTIONS ============
    if (path === "/attractions" && method === "GET") {
      const park = url.searchParams.get("park") || "";
      const parkId = url.searchParams.get("park_id") || "";
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "500"), 1000);
      const offset = (page - 1) * limit;

      let query = supabase
        .from("attractions")
        .select("*, parks!attractions_park_id_fkey(name, slug)", { count: "exact" });

      if (parkId) query = query.eq("park_id", parkId);
      if (park) query = query.ilike("name", `%${park}%`);

      const { data, count, error } = await query
        .order("name")
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ attractions: data, total: count, page, limit, total_pages: Math.ceil((count || 0) / limit) });
    }

    // ============ RESTAURANTS ============
    if (path === "/restaurants" && method === "GET") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from("restaurants")
        .select("id, name, slug, type, cuisine, location, area, category, price_range, reservation_required, character_dining, featured, priority_level", { count: "exact" })
        .order("name")
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ restaurants: data, total: count, page, limit });
    }

    // ============ PROFILES (full) ============
    if (path === "/profiles" && method === "GET") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message, 500);
      return jsonResponse({ profiles: data, total: count, page, limit });
    }

    // ============ 404 ============
    return errorResponse(`Endpoint not found: ${method} ${path}`, 404);

  } catch (err) {
    console.error("API Error:", err);
    return errorResponse("Internal server error", 500);
  }
});
