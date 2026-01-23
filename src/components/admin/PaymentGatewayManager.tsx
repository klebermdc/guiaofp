import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Check, 
  Settings2, 
  AlertCircle, 
  Plug, 
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  logo: string;
  isActive: boolean;
  isConfigured: boolean;
  features: string[];
  requiredFields: {
    key: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
  }[];
}

const availableGateways: PaymentGateway[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Plataforma completa de pagamentos online com suporte a cartões, boletos e PIX.',
    logo: '💳',
    isActive: false,
    isConfigured: false,
    features: ['Cartão de Crédito', 'Assinaturas', 'Checkout Integrado', 'Webhooks'],
    requiredFields: [
      { key: 'publishable_key', label: 'Chave Publicável', type: 'text', placeholder: 'pk_live_...' },
      { key: 'secret_key', label: 'Chave Secreta', type: 'password', placeholder: 'sk_live_...' },
      { key: 'webhook_secret', label: 'Segredo do Webhook', type: 'password', placeholder: 'whsec_...' },
    ],
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    description: 'Gateway brasileiro com PIX, boleto e cartões. Ideal para o mercado nacional.',
    logo: '🟦',
    isActive: false,
    isConfigured: false,
    features: ['PIX', 'Boleto', 'Cartão de Crédito', 'Parcelamento'],
    requiredFields: [
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' },
      { key: 'public_key', label: 'Public Key', type: 'text', placeholder: 'APP_USR-...' },
    ],
  },
  {
    id: 'pagarme',
    name: 'Pagar.me',
    description: 'Solução flexível de pagamentos com split de pagamentos e marketplace.',
    logo: '🟢',
    isActive: false,
    isConfigured: false,
    features: ['Split de Pagamento', 'Marketplace', 'Antifraude', 'Recorrência'],
    requiredFields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'ak_live_...' },
      { key: 'encryption_key', label: 'Encryption Key', type: 'password', placeholder: 'ek_live_...' },
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Gateway internacional para pagamentos globais e proteção ao comprador.',
    logo: '🅿️',
    isActive: false,
    isConfigured: false,
    features: ['Pagamentos Internacionais', 'Proteção ao Comprador', 'Express Checkout'],
    requiredFields: [
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Client ID do PayPal' },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret' },
    ],
  },
];

export function PaymentGatewayManager() {
  const [gateways, setGateways] = useState<PaymentGateway[]>(availableGateways);
  const [activeGateway, setActiveGateway] = useState<string | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isTestMode, setIsTestMode] = useState(true);

  const handleConfigureGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setConfigValues({});
    setShowSecrets({});
    setConfigModalOpen(true);
  };

  const handleSaveConfiguration = () => {
    if (!selectedGateway) return;

    // Validate required fields
    const missingFields = selectedGateway.requiredFields.filter(
      field => !configValues[field.key]?.trim()
    );

    if (missingFields.length > 0) {
      toast.error(`Preencha todos os campos obrigatórios: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    // Update gateway as configured
    setGateways(prev => prev.map(g => 
      g.id === selectedGateway.id 
        ? { ...g, isConfigured: true }
        : g
    ));

    toast.success(`${selectedGateway.name} configurado com sucesso!`);
    setConfigModalOpen(false);
    setSelectedGateway(null);
    setConfigValues({});
  };

  const handleActivateGateway = (gatewayId: string) => {
    const gateway = gateways.find(g => g.id === gatewayId);
    
    if (!gateway?.isConfigured) {
      toast.error('Configure o gateway antes de ativá-lo');
      return;
    }

    // Deactivate current active gateway
    setGateways(prev => prev.map(g => ({
      ...g,
      isActive: g.id === gatewayId
    })));
    
    setActiveGateway(gatewayId);
    toast.success(`${gateway.name} ativado como gateway principal`);
  };

  const handleDeactivateGateway = (gatewayId: string) => {
    setGateways(prev => prev.map(g => 
      g.id === gatewayId ? { ...g, isActive: false } : g
    ));
    
    if (activeGateway === gatewayId) {
      setActiveGateway(null);
    }
    
    toast.info('Gateway desativado');
  };

  const toggleSecretVisibility = (fieldKey: string) => {
    setShowSecrets(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const currentActiveGateway = gateways.find(g => g.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Gateway de Pagamento</CardTitle>
                <CardDescription>
                  Configure e gerencie os métodos de pagamento da plataforma
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="test-mode" className="text-sm text-muted-foreground">
                  Modo Teste
                </Label>
                <Switch
                  id="test-mode"
                  checked={isTestMode}
                  onCheckedChange={setIsTestMode}
                />
              </div>
              <Badge variant={isTestMode ? 'secondary' : 'default'}>
                {isTestMode ? 'Ambiente de Teste' : 'Produção'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Active Gateway Status */}
      <Card className={currentActiveGateway ? 'border-primary/50 bg-primary/5' : 'border-dashed'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentActiveGateway ? (
                <>
                  <div className="w-14 h-14 rounded-xl bg-background flex items-center justify-center text-3xl shadow-sm">
                    {currentActiveGateway.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{currentActiveGateway.name}</h3>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        <Check className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Gateway principal para processamento de pagamentos
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-muted-foreground">
                      Nenhum Gateway Ativo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configure e ative um gateway para processar pagamentos
                    </p>
                  </div>
                </>
              )}
            </div>
            {currentActiveGateway && (
              <Button variant="outline" size="sm" onClick={() => handleConfigureGateway(currentActiveGateway)}>
                <Settings2 className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Gateways */}
      <div className="grid gap-4 md:grid-cols-2">
        {gateways.map((gateway) => (
          <Card 
            key={gateway.id} 
            className={gateway.isActive ? 'ring-2 ring-primary' : ''}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    {gateway.logo}
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {gateway.name}
                      {gateway.isConfigured && (
                        <Badge variant="outline" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Configurado
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {gateway.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div className="flex flex-wrap gap-1.5">
                {gateway.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleConfigureGateway(gateway)}
                >
                  <Plug className="h-4 w-4 mr-2" />
                  {gateway.isConfigured ? 'Reconfigurar' : 'Configurar'}
                </Button>
                
                {gateway.isConfigured && (
                  gateway.isActive ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeactivateGateway(gateway.id)}
                    >
                      Desativar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleActivateGateway(gateway.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Ativar
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Modal */}
      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">{selectedGateway?.logo}</span>
              Configurar {selectedGateway?.name}
            </DialogTitle>
            <DialogDescription>
              Insira as credenciais do {isTestMode ? 'ambiente de teste' : 'ambiente de produção'} para configurar o gateway.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Environment Warning */}
            <div className={`p-3 rounded-lg ${isTestMode ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <p className={`text-sm ${isTestMode ? 'text-amber-600' : 'text-red-600'}`}>
                {isTestMode 
                  ? '⚠️ Você está configurando o ambiente de teste. Use chaves de teste.'
                  : '🔴 Você está configurando o ambiente de produção. Use chaves de produção.'}
              </p>
            </div>

            {/* Configuration Fields */}
            {selectedGateway?.requiredFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <div className="relative">
                  <Input
                    id={field.key}
                    type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    value={configValues[field.key] || ''}
                    onChange={(e) => setConfigValues(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))}
                    className="pr-10"
                  />
                  {field.type === 'password' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility(field.key)}
                    >
                      {showSecrets[field.key] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Documentation Link */}
            <div className="pt-2">
              <a
                href="#"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                onClick={(e) => e.preventDefault()}
              >
                <ExternalLink className="h-3 w-3" />
                Ver documentação do {selectedGateway?.name}
              </a>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConfiguration}>
              <Check className="h-4 w-4 mr-2" />
              Salvar Configuração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
