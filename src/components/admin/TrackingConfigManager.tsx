import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Save, 
  BarChart3, 
  Facebook, 
  Code, 
  Server, 
  Shield, 
  Zap,
  Link,
  Key,
  TestTube,
  CheckCircle,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TrackingGuide } from './tracking/TrackingGuide';

interface TrackingConfig {
  id: string;
  config_key: string;
  config_value: string | null;
  description: string | null;
  is_active: boolean;
}

interface ConfigMeta {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  helpText?: string;
  isSecret?: boolean;
}

// Basic tracking configs
const basicConfigLabels: Record<string, ConfigMeta> = {
  ga4_measurement_id: {
    label: 'Google Analytics 4',
    icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
    placeholder: 'G-XXXXXXXXXX',
    helpText: 'ID de medição do GA4 (encontrado em Admin > Fluxos de dados)',
  },
  fb_pixel_id: {
    label: 'Facebook Pixel',
    icon: <Facebook className="h-5 w-5 text-blue-600" />,
    placeholder: '1234567890123456',
    helpText: 'ID do Pixel (encontrado em Gerenciador de Eventos)',
  },
  gtm_container_id: {
    label: 'Google Tag Manager (Web)',
    icon: <Code className="h-5 w-5 text-orange-500" />,
    placeholder: 'GTM-XXXXXXX',
    helpText: 'Container ID do GTM Web (usado como ponte para sGTM)',
  },
};

// Server-side tracking configs
const serverConfigLabels: Record<string, ConfigMeta> = {
  sgtm_url: {
    label: 'URL do Server GTM (Stape)',
    icon: <Server className="h-5 w-5 text-purple-500" />,
    placeholder: 'https://sgtm.seudominio.com',
    helpText: 'URL completa do seu servidor sGTM (Stape/Cloudflare)',
  },
  sgtm_container_id: {
    label: 'Container ID do sGTM',
    icon: <Code className="h-5 w-5 text-purple-500" />,
    placeholder: 'GTM-XXXXXXX',
    helpText: 'ID do container server-side (diferente do Web GTM)',
  },
};

// Facebook CAPI configs
const capiConfigLabels: Record<string, ConfigMeta> = {
  fb_access_token: {
    label: 'Facebook CAPI Access Token',
    icon: <Key className="h-5 w-5 text-blue-600" />,
    placeholder: 'EAAG...',
    helpText: 'Token de acesso para Conversions API (Events Manager > Configurações)',
    isSecret: true,
  },
  fb_test_event_code: {
    label: 'Código de Teste CAPI',
    icon: <TestTube className="h-5 w-5 text-amber-500" />,
    placeholder: 'TEST12345',
    helpText: 'Código para testar eventos no modo de teste (opcional)',
  },
};

// Advanced configs
const advancedConfigLabels: Record<string, ConfigMeta> = {
  enhanced_conversions: {
    label: 'Enhanced Conversions (GA4)',
    icon: <Zap className="h-5 w-5 text-green-500" />,
    placeholder: 'true',
    helpText: 'Enviar dados de usuário hasheados para melhorar atribuição',
  },
  first_party_collection: {
    label: 'First-Party Collection',
    icon: <Shield className="h-5 w-5 text-emerald-500" />,
    placeholder: 'true',
    helpText: 'Coleta first-party via sGTM (requer sGTM configurado)',
  },
};

// Combine all config labels
const allConfigLabels: Record<string, ConfigMeta> = {
  ...basicConfigLabels,
  ...serverConfigLabels,
  ...capiConfigLabels,
  ...advancedConfigLabels,
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

  const renderConfigItem = (config: TrackingConfig, meta: ConfigMeta) => {
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
              {meta.helpText && (
                <p className="text-xs text-muted-foreground">{meta.helpText}</p>
              )}
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
          type={meta.isSecret ? 'password' : 'text'}
          value={editedValues[config.config_key] || ''}
          onChange={(e) => 
            setEditedValues((prev) => ({ ...prev, [config.config_key]: e.target.value }))
          }
          placeholder={meta.placeholder}
          className="font-mono"
        />
      </div>
    );
  };

  const getConfigsForKeys = (keys: string[]) => {
    return configs.filter(c => keys.includes(c.config_key));
  };

  // Check if sGTM is configured
  const isSgtmConfigured = Boolean(
    editedValues['sgtm_url'] && 
    editedActive['sgtm_url'] &&
    editedValues['sgtm_container_id'] &&
    editedActive['sgtm_container_id']
  );

  // Check if CAPI is configured
  const isCapiConfigured = Boolean(
    editedValues['fb_access_token'] && 
    editedActive['fb_access_token']
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Status do Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {editedValues['ga4_measurement_id'] && editedActive['ga4_measurement_id'] ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">GA4</span>
            </div>
            <div className="flex items-center gap-2">
              {editedValues['fb_pixel_id'] && editedActive['fb_pixel_id'] ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">FB Pixel</span>
            </div>
            <div className="flex items-center gap-2">
              {isSgtmConfigured ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">sGTM (Stape)</span>
            </div>
            <div className="flex items-center gap-2">
              {isCapiConfigured ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">FB CAPI</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="guide" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="guide" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Guia</span>
          </TabsTrigger>
          <TabsTrigger value="basic" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Básico</span>
          </TabsTrigger>
          <TabsTrigger value="server" className="gap-2">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">sGTM</span>
          </TabsTrigger>
          <TabsTrigger value="capi" className="gap-2">
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">CAPI</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Avançado</span>
          </TabsTrigger>
        </TabsList>

        {/* Guide Tab - Step by Step */}
        <TabsContent value="guide">
          <TrackingGuide />
        </TabsContent>

        {/* Basic Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Básico (Client-Side)</CardTitle>
              <CardDescription>
                Configure os IDs de tracking para GA4, Facebook Pixel e GTM Web.
                Estes scripts são carregados no navegador do usuário.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getConfigsForKeys(Object.keys(basicConfigLabels)).map((config) => {
                const meta = basicConfigLabels[config.config_key];
                if (!meta) return null;
                return renderConfigItem(config, meta);
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Server GTM Tab */}
        <TabsContent value="server">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-purple-500" />
                Server-Side GTM (Stape/Cloudflare)
              </CardTitle>
              <CardDescription>
                Configure o tracking server-side via sGTM. Isso permite:
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Bypass de bloqueadores de anúncios</li>
                  <li>• Cookies first-party (melhor tracking)</li>
                  <li>• Maior controle sobre os dados enviados</li>
                  <li>• Integração com Stape e Cloudflare</li>
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getConfigsForKeys(Object.keys(serverConfigLabels)).map((config) => {
                const meta = serverConfigLabels[config.config_key];
                if (!meta) return null;
                return renderConfigItem(config, meta);
              })}

              <Separator className="my-4" />

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Como configurar o sGTM
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Crie uma conta no <a href="https://stape.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stape.io</a></li>
                  <li>2. Configure um subdomínio (ex: sgtm.seudominio.com)</li>
                  <li>3. Aponte o DNS para o Cloudflare/Stape</li>
                  <li>4. Copie a URL e o Container ID aqui</li>
                  <li>5. Configure as tags no GTM Server</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facebook CAPI Tab */}
        <TabsContent value="capi">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                Facebook Conversions API (CAPI)
              </CardTitle>
              <CardDescription>
                Configure o tracking server-side do Facebook para:
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Melhor atribuição de conversões</li>
                  <li>• Eventos não bloqueados por ad blockers</li>
                  <li>• Dados mais precisos para otimização de anúncios</li>
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getConfigsForKeys(Object.keys(capiConfigLabels)).map((config) => {
                const meta = capiConfigLabels[config.config_key];
                if (!meta) return null;
                return renderConfigItem(config, meta);
              })}

              <Separator className="my-4" />

              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-amber-700">
                  <Shield className="h-4 w-4" />
                  Importante sobre CAPI
                </h4>
                <p className="text-sm text-muted-foreground">
                  O Access Token é sensível. Idealmente, configure-o no sGTM Server 
                  em vez de aqui para maior segurança. Se configurado aqui, os eventos 
                  serão enviados via dataLayer para o GTM processar.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>
                Recursos avançados para melhorar a qualidade do tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getConfigsForKeys(Object.keys(advancedConfigLabels)).map((config) => {
                const meta = advancedConfigLabels[config.config_key];
                if (!meta) return null;
                return renderConfigItem(config, meta);
              })}

              <Separator className="my-4" />

              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium">Enhanced Conversions</h4>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, dados do usuário (email, telefone, nome) são hasheados 
                  e enviados junto com eventos de conversão para melhorar a atribuição.
                </p>
                
                <h4 className="font-medium mt-4">First-Party Collection</h4>
                <p className="text-sm text-muted-foreground">
                  Com sGTM configurado, os cookies são definidos como first-party 
                  (no seu domínio), evitando bloqueios e aumentando a precisão.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="w-full"
        size="lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Salvar Todas as Configurações
          </>
        )}
      </Button>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Eventos Rastreados Automaticamente</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-medium text-foreground mb-1">Engajamento</p>
              <ul className="space-y-0.5">
                <li>• page_view (navegação)</li>
                <li>• scroll_depth (25%, 50%, 75%, 100%)</li>
                <li>• cta_click (botões de ação)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">E-commerce</p>
              <ul className="space-y-0.5">
                <li>• view_item (visualização de plano)</li>
                <li>• begin_checkout (início do checkout)</li>
                <li>• add_payment_info (método de pagamento)</li>
                <li>• purchase (compra finalizada)</li>
              </ul>
            </div>
          </div>
          <Separator className="my-3" />
          <p>
            <strong>Fluxo de dados:</strong> Navegador → GTM Web → sGTM (Stape) → GA4/Facebook
          </p>
        </CardContent>
      </Card>
    </div>
  );
}