import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function errorResponse(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // ============ METRICS ============
    if (path === "/metrics" && method === "GET") {
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

    // ============ 404 ============
    return errorResponse(`Endpoint not found: ${method} ${path}`, 404);

  } catch (err) {
    console.error("API Error:", err);
    return errorResponse("Internal server error", 500);
  }
});
