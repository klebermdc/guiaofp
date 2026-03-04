import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Save, RotateCcw, Info } from "lucide-react";

export function AIItineraryPromptManager() {
  const [prompt, setPrompt] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompt();
  }, []);

  async function fetchPrompt() {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_itinerary_prompt")
      .select("*")
      .eq("prompt_key", "park_itinerary_system")
      .single();

    if (error) {
      console.error("Error fetching prompt:", error);
      toast.error("Erro ao carregar prompt");
    } else if (data) {
      setPrompt(data.system_prompt);
      setOriginalPrompt(data.system_prompt);
      setRecordId(data.id);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!recordId) return;
    setSaving(true);

    const { error } = await supabase
      .from("ai_itinerary_prompt")
      .update({
        system_prompt: prompt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recordId);

    if (error) {
      console.error("Error saving prompt:", error);
      toast.error("Erro ao salvar prompt");
    } else {
      setOriginalPrompt(prompt);
      toast.success("Prompt salvo com sucesso!");
    }
    setSaving(false);
  }

  const hasChanges = prompt !== originalPrompt;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Prompt do Roteiro Inteligente
          </CardTitle>
          <CardDescription>
            Configure o prompt que a IA utiliza para gerar roteiros personalizados no Guia dos Parques.
            Use <code className="bg-muted px-1 rounded text-xs">{"{parkName}"}</code> para inserir o nome do parque dinamicamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              A IA recebe automaticamente: lista de atrações abertas com filas ao vivo, shows com horários, 
              atrações fechadas, histórico de 30 dias de tempo de fila e perfil do grupo do usuário. 
              O prompt abaixo define <strong>como</strong> a IA deve processar esses dados e gerar o roteiro.
            </p>
          </div>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
            placeholder="Escreva o prompt do sistema aqui..."
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {prompt.length} caracteres
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt(originalPrompt)}
                disabled={!hasChanges || saving}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Desfazer
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Salvando..." : "Salvar Prompt"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
