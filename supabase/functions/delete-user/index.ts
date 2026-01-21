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
    const { user_id }: DeleteUserRequest = await req.json();
    
    if (!user_id) {
      throw new Error("user_id is required");
    }

    console.log("Deleting user:", user_id);

    // Create Supabase client with service role
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
