import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, Image, Palette, Type, AlertCircle, ExternalLink } from 'lucide-react';

interface MarkerIconConfig {
  id: string;
  poi_type: string;
  icon_url: string | null;
  fallback_emoji: string;
  marker_color: string;
}

const POI_TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurantes',
  shop: 'Lojas',
  restroom: 'Banheiros',
  first_aid: 'Primeiros Socorros',
  show: 'Shows e Entretenimento',
};

export function MarkerIconManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MarkerIconConfig>>({});

  const { data: configs, isLoading } = useQuery({
    queryKey: ['marker-icon-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marker_icon_config')
        .select('*')
        .order('poi_type');

      if (error) throw error;
      return data as MarkerIconConfig[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (config: Partial<MarkerIconConfig> & { id: string }) => {
      const { error } = await supabase
        .from('marker_icon_config')
        .update({
          icon_url: config.icon_url || null,
          fallback_emoji: config.fallback_emoji,
          marker_color: config.marker_color,
        })
        .eq('id', config.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marker-icon-configs'] });
      toast.success('Configuração de ícone atualizada!');
      setEditingId(null);
      setEditForm({});
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  const startEditing = (config: MarkerIconConfig) => {
    setEditingId(config.id);
    setEditForm({
      icon_url: config.icon_url,
      fallback_emoji: config.fallback_emoji,
      marker_color: config.marker_color,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveConfig = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      ...editForm,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Ícones dos Marcadores do Mapa
          </CardTitle>
          <CardDescription>
            Configure os ícones personalizados para cada tipo de ponto de interesse no mapa.
            Você pode usar URLs de imagens (PNG, SVG) ou emojis como fallback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Dicas para ícones:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use imagens PNG ou SVG com fundo transparente</li>
                  <li>Tamanho recomendado: 32x32 ou 48x48 pixels</li>
                  <li>Faça upload das imagens no storage e cole a URL aqui</li>
                  <li>O emoji de fallback será usado se a URL da imagem não carregar</li>
                  <li>A cor do marcador é usada como fundo/destaque</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {configs?.map((config) => (
              <Card key={config.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Preview */}
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 border-2"
                        style={{ 
                          backgroundColor: `${config.marker_color}20`,
                          borderColor: config.marker_color 
                        }}
                      >
                        {config.icon_url ? (
                          <img 
                            src={config.icon_url} 
                            alt={config.poi_type} 
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <span className={config.icon_url ? 'hidden' : ''}>
                          {config.fallback_emoji}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {POI_TYPE_LABELS[config.poi_type] || config.poi_type}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Tipo: <code className="bg-muted px-1 rounded">{config.poi_type}</code>
                        </p>
                      </div>
                    </div>

                    {editingId !== config.id && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => startEditing(config)}
                      >
                        Editar
                      </Button>
                    )}
                  </div>

                  {editingId === config.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            URL da Imagem do Ícone
                          </Label>
                          <Input
                            placeholder="https://exemplo.com/icone.png"
                            value={editForm.icon_url || ''}
                            onChange={(e) => setEditForm({ ...editForm, icon_url: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">
                            Deixe vazio para usar apenas o emoji
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Emoji de Fallback
                          </Label>
                          <Input
                            placeholder="🍽️"
                            value={editForm.fallback_emoji || ''}
                            onChange={(e) => setEditForm({ ...editForm, fallback_emoji: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">
                            Usado se a imagem não carregar
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Cor do Marcador
                        </Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editForm.marker_color || '#6366f1'}
                            onChange={(e) => setEditForm({ ...editForm, marker_color: e.target.value })}
                            className="w-12 h-10 rounded cursor-pointer border"
                          />
                          <Input
                            value={editForm.marker_color || ''}
                            onChange={(e) => setEditForm({ ...editForm, marker_color: e.target.value })}
                            className="flex-1"
                            placeholder="#6366f1"
                          />
                        </div>
                      </div>

                      {/* Live Preview */}
                      {editForm.icon_url && (
                        <div className="space-y-2">
                          <Label>Pré-visualização da Imagem</Label>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center border-2"
                              style={{ 
                                backgroundColor: `${editForm.marker_color}20`,
                                borderColor: editForm.marker_color 
                              }}
                            >
                              <img 
                                src={editForm.icon_url} 
                                alt="Preview" 
                                className="w-7 h-7 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '';
                                }}
                              />
                            </div>
                            <a 
                              href={editForm.icon_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              Abrir imagem <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          onClick={saveConfig}
                          disabled={updateMutation.isPending}
                          size="sm"
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Salvar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEditing}
                          disabled={updateMutation.isPending}
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
