import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

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
  email: string;
  password: string;
  nome_completo: string;
  cpf: string;
  telefone: string;
  contract_id: string;
  nome_guia: string;
  start_date: string;
  end_date: string;
  parks: ParkData[];
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: CreateClientRequest = await req.json();
    
    console.log("Received client data:", {
      email: data.email,
      nome_completo: data.nome_completo,
      nome_guia: data.nome_guia,
      start_date: data.start_date,
      end_date: data.end_date,
      parks_count: data.parks?.length || 0,
    });

    // Criar cliente Supabase com service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        nome_completo: data.nome_completo,
        cpf: data.cpf,
        telefone: data.telefone,
      }
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw authError;
    }

    const userId = authData.user?.id;
    console.log("User created:", userId);

    // Salvar contrato com dados do roteiro
    if (userId) {
      const { error: contractError } = await supabase
        .from("contracts")
        .insert({
          user_id: userId,
          external_contract_id: data.contract_id,
          guide_name: data.nome_guia,
          start_date: data.start_date,
          end_date: data.end_date,
          parks: data.parks,
          status: "active"
        });

      if (contractError) {
        console.error("Contract error:", contractError);
      } else {
        console.log("Contract created for user:", userId);
      }

      // Atualizar profile com dados adicionais
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          responsible_name: data.nome_completo,
          whatsapp: data.telefone
        })
        .eq("user_id", userId);

      if (profileError) {
        console.error("Profile error:", profileError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Client created successfully",
        user_id: userId,
        data: {
          email: data.email,
          nome_completo: data.nome_completo,
          nome_guia: data.nome_guia,
          start_date: data.start_date,
          end_date: data.end_date,
          parks: data.parks,
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
