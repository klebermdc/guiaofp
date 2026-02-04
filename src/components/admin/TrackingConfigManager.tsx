import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, BarChart3, Facebook, Code } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TrackingConfig {
  id: string;
  config_key: string;
  config_value: string | null;
  description: string | null;
  is_active: boolean;
}

const configLabels: Record<string, { label: string; icon: React.ReactNode; placeholder: string }> = {
  ga4_measurement_id: {
    label: 'Google Analytics 4',
    icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
    placeholder: 'G-XXXXXXXXXX',
  },
  fb_pixel_id: {
    label: 'Facebook Pixel',
    icon: <Facebook className="h-5 w-5 text-blue-600" />,
    placeholder: '1234567890123456',
  },
  gtm_container_id: {
    label: 'Google Tag Manager',
    icon: <Code className="h-5 w-5 text-orange-500" />,
    placeholder: 'GTM-XXXXXXX',
  },
};

export function TrackingConfigManager() {
  const [configs, setConfigs] = useState<TrackingConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [editedActive, setEditedActive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('tracking_config')
        .select('*')
        .order('config_key');

      if (error) throw error;

      setConfigs(data || []);
      
      // Initialize edited values
      const values: Record<string, string> = {};
      const active: Record<string, boolean> = {};
      data?.forEach((config) => {
        values[config.config_key] = config.config_value || '';
        active[config.config_key] = config.is_active ?? true;
      });
      setEditedValues(values);
      setEditedActive(active);
    } catch (err) {
      console.error('Error fetching tracking config:', err);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const config of configs) {
        const newValue = editedValues[config.config_key];
        const newActive = editedActive[config.config_key];
        
        if (newValue !== config.config_value || newActive !== config.is_active) {
          const { error } = await supabase
            .from('tracking_config')
            .update({ 
              config_value: newValue || null,
              is_active: newActive,
            })
            .eq('id', config.id);

          if (error) throw error;
        }
      }

      toast.success('Configurações salvas com sucesso!');
      fetchConfigs();
    } catch (err) {
      console.error('Error saving tracking config:', err);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Códigos de Rastreamento
          </CardTitle>
          <CardDescription>
            Configure os IDs de tracking para Google Analytics, Facebook Pixel e GTM.
            Os scripts só serão carregados se os IDs estiverem preenchidos e ativos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {configs.map((config) => {
            const meta = configLabels[config.config_key];
            if (!meta) return null;

            const hasValue = !!editedValues[config.config_key];
            const isActive = editedActive[config.config_key];

            return (
              <div 
                key={config.id} 
                className="flex flex-col gap-3 p-4 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {meta.icon}
                    <div>
                      <Label className="text-base font-semibold">{meta.label}</Label>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={hasValue && isActive ? 'default' : 'secondary'}>
                      {hasValue && isActive ? 'Ativo' : hasValue ? 'Inativo' : 'Não configurado'}
                    </Badge>
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) => 
                        setEditedActive((prev) => ({ ...prev, [config.config_key]: checked }))
                      }
                    />
                  </div>
                </div>
                <Input
                  value={editedValues[config.config_key] || ''}
                  onChange={(e) => 
                    setEditedValues((prev) => ({ ...prev, [config.config_key]: e.target.value }))
                  }
                  placeholder={meta.placeholder}
                  className="font-mono"
                />
              </div>
            );
          })}

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Os scripts de tracking são carregados automaticamente quando os IDs estão configurados e ativos.</p>
          <p>• Eventos rastreados: PageView, Scroll Depth, Cliques em CTAs, Início de Checkout, Compra.</p>
          <p>• Os dados são enviados para GA4, Facebook Pixel e GTM simultaneamente.</p>
          <p>• Desative um tracker para parar de enviar dados sem remover o ID.</p>
        </CardContent>
      </Card>
    </div>
  );
}
