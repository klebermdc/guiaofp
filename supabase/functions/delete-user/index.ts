import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  user_id: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate caller (must be guide/admin)
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Authorization token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with the user's token to verify identity
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify token using getClaims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(JSON.stringify({ error: "Invalid user token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub as string;
    console.log("Caller ID:", callerId);

    // Check if caller is guide/admin
    const { data: isAllowed, error: roleError } = await supabaseUser.rpc("is_guide_or_admin", {
      _user_id: callerId,
    });

    if (roleError) {
      console.error("Role check error:", roleError);
    }

    if (roleError || !isAllowed) {
      return new Response(JSON.stringify({ error: "Forbidden - not guide or admin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id }: DeleteUserRequest = await req.json();
    
    if (!user_id) {
      throw new Error("user_id is required");
    }

    console.log("Deleting user:", user_id);

    // Create Supabase client with service role (for admin deletes)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Delete attraction preferences
    const { error: prefError } = await supabase
      .from("attraction_preferences")
      .delete()
      .eq("user_id", user_id);
    
    if (prefError) {
      console.error("Error deleting preferences:", prefError);
    }

    // Delete contracts
    const { error: contractError } = await supabase
      .from("contracts")
      .delete()
      .eq("user_id", user_id);
    
    if (contractError) {
      console.error("Error deleting contracts:", contractError);
    }

    // Delete user roles
    const { error: rolesError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", user_id);
    
    if (rolesError) {
      console.error("Error deleting user roles:", rolesError);
    }

    // Delete profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", user_id);
    
    if (profileError) {
      console.error("Error deleting profile:", profileError);
    }

    // Delete user from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(user_id);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      throw authError;
    }

    console.log("User deleted successfully:", user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User deleted successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
