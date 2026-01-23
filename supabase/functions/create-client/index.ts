import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParkData {
  date: string;
  park: string;
  time_start: string;
  time_end: string;
  notes?: string;
}

interface CreateClientRequest {
  // Legacy fields (from external integration)
  email: string;
  password: string;
  nome_completo?: string;
  cpf?: string;
  telefone?: string;
  contract_id?: string;
  nome_guia?: string;
  start_date?: string;
  end_date?: string;
  parks?: ParkData[];
  
  // New simplified fields (from guide dashboard)
  name?: string;
  whatsapp?: string;
  guideName?: string;
  planTier?: string;
  sendWelcomeEmail?: boolean;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller is guide or admin (for dashboard calls)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      
      if (userData?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .in("role", ["guide", "admin"]);

        if (!roleData || roleData.length === 0) {
          return new Response(
            JSON.stringify({ error: "Permissão negada" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    const data: CreateClientRequest = await req.json();
    
    // Normalize field names (support both old and new format)
    const clientName = data.name || data.nome_completo || "";
    const clientWhatsapp = data.whatsapp || data.telefone || "";
    const clientGuideName = data.guideName || data.nome_guia || "";
    const planTier = data.planTier || "premium";
    const sendWelcomeEmail = data.sendWelcomeEmail !== false;

    if (!data.email || !data.password || !clientName) {
      return new Response(
        JSON.stringify({ error: "Email, senha e nome são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating client:", { email: data.email, name: clientName, guide: clientGuideName });

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        name: clientName,
        nome_completo: clientName,
        cpf: data.cpf || "",
        telefone: clientWhatsapp,
        plan_tier: planTier,
      }
    });

    if (authError) {
      console.error("Auth error:", authError);
      
      if (authError.message?.includes("already been registered")) {
        return new Response(
          JSON.stringify({ error: "Este email já está cadastrado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw authError;
    }

    const userId = authData.user?.id;
    console.log("User created:", userId);

    if (userId) {
      // Create contract if legacy data provided
      if (data.contract_id || data.start_date) {
        const { error: contractError } = await supabase
          .from("contracts")
          .insert({
            user_id: userId,
            external_contract_id: data.contract_id || "",
            guide_name: clientGuideName,
            start_date: data.start_date,
            end_date: data.end_date,
            parks: data.parks || [],
            status: "active"
          });

        if (contractError) {
          console.error("Contract error:", contractError);
        } else {
          console.log("Contract created for user:", userId);
        }
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          responsible_name: clientName,
          email: data.email,
          whatsapp: clientWhatsapp,
          guide_name: clientGuideName,
          plan_tier: planTier,
          is_access_enabled: true,
        })
        .eq("user_id", userId);

      if (profileError) {
        console.error("Profile error:", profileError);
      }

      // Send welcome email with credentials
      if (sendWelcomeEmail) {
        try {
          // Send access-granted email
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-purchase-emails`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              type: "access-granted",
              userData: {
                email: data.email,
                name: clientName,
                tempPassword: data.password,
              },
            }),
          });

          if (emailResponse.ok) {
            console.log("Welcome email sent to:", data.email);
          } else {
            const errorText = await emailResponse.text();
            console.error("Error sending welcome email:", errorText);
          }

          // Schedule onboarding email for 2 hours later
          const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
          await fetch(`${supabaseUrl}/functions/v1/send-purchase-emails`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              type: "welcome-onboarding",
              userData: {
                email: data.email,
                name: clientName,
              },
              scheduleDelay: TWO_HOURS_MS,
            }),
          });

          console.log("Onboarding email scheduled for:", data.email);
        } catch (emailError) {
          console.error("Error sending emails:", emailError);
        }
      } else {
        // Legacy notification flow
        try {
          const notifyResponse = await fetch(
            `${supabaseUrl}/functions/v1/notify-new-user`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                email: data.email,
                nome_completo: clientName,
                telefone: clientWhatsapp,
                contract_id: data.contract_id,
                nome_guia: clientGuideName,
                start_date: data.start_date,
                end_date: data.end_date,
                parks_count: data.parks?.length || 0,
                user_id: userId,
              }),
            }
          );
          
          if (!notifyResponse.ok) {
            console.error("Failed to send notification:", await notifyResponse.text());
          } else {
            console.log("Notification email sent successfully");
          }
        } catch (notifyError) {
          console.error("Error sending notification:", notifyError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Cliente criado com sucesso",
        userId,
        data: {
          email: data.email,
          name: clientName,
          guideName: clientGuideName,
          planTier,
        }
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
