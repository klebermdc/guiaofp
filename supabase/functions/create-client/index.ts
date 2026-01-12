import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParkDate {
  date: string;
  park: string;
  time_start?: string;
  time_end?: string;
  notes?: string;
}

interface CreateClientRequest {
  email: string;
  password: string;
  nome_completo: string;
  cpf: string;
  telefone: string;
  contract_id: string;
  parks?: ParkDate[];
  start_date?: string;
  end_date?: string;
  guide_name?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      password, 
      nome_completo, 
      cpf, 
      telefone, 
      contract_id,
      parks = [],
      start_date,
      end_date,
      guide_name
    }: CreateClientRequest = await req.json();

    console.log("Recebendo credenciais:", { email, nome_completo, contract_id });

    // Criar cliente Supabase com service role (para criar usuários)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome_completo, cpf, telefone, contract_id }
    });

    if (authError) {
      console.error("Erro ao criar usuário:", authError);
      throw authError;
    }

    const userId = authData.user?.id;
    console.log("Usuário criado:", userId);

    // Criar contrato vinculado ao usuário
    if (userId) {
      const { error: contractError } = await supabase
        .from("contracts")
        .insert({
          user_id: userId,
          external_contract_id: contract_id,
          parks: parks,
          start_date: start_date || null,
          end_date: end_date || null,
          status: "active",
          guide_name: guide_name || null
        });

      if (contractError) {
        console.error("Erro ao criar contrato:", contractError);
        // Não falha a criação do usuário se o contrato falhar
      } else {
        console.log("Contrato criado para usuário:", userId);
      }

      // Atualizar profile com dados adicionais
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          responsible_name: nome_completo,
          whatsapp: telefone
        })
        .eq("user_id", userId);

      if (profileError) {
        console.error("Erro ao atualizar profile:", profileError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, user_id: userId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
