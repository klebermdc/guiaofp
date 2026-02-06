import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  BarChart3,
  Facebook,
  Server,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
};

const StepCard = ({ 
  number, 
  title, 
  description, 
  duration,
  children 
}: { 
  number: number;
  title: string;
  description: string;
  duration: string;
  children: React.ReactNode;
}) => (
  <Card className="border-l-4 border-l-primary">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            {number}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {duration}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="pl-14">
      {children}
    </CardContent>
  </Card>
);

export function TrackingGuide() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Guia Completo de Configuração de Tracking
          </CardTitle>
          <CardDescription className="text-base">
            Siga este passo a passo para configurar um tracking profissional igual ao WordPress,
            com sGTM (Stape), Facebook CAPI e Enhanced Conversions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Tempo total: ~45 min
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Nível: Intermediário
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Pré-requisitos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Conta no Google Analytics 4 (GA4)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Conta no Facebook Business Manager
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Conta no Google Tag Manager (GTM)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Conta no Stape.io (para sGTM)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Acesso ao DNS do domínio (Cloudflare, Registro.br, etc.)
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        {/* Step 1 - GA4 */}
        <StepCard
          number={1}
          title="Configurar Google Analytics 4"
          description="Obter o ID de medição do GA4"
          duration="5 min"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ga4" className="border-none">
              <AccordionTrigger className="text-sm py-2">Ver instruções detalhadas</AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.1</span>
                    <div>
                      Acesse <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                        analytics.google.com <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.2</span>
                    <span>Clique em <strong>Administrador</strong> (ícone de engrenagem no canto inferior esquerdo)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.3</span>
                    <span>Em "Propriedade", clique em <strong>Fluxos de dados</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.4</span>
                    <span>Clique no fluxo da web (ou crie um novo)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.5</span>
                    <div className="space-y-1">
                      <span>Copie o <strong>ID de medição</strong> (formato: G-XXXXXXXXXX)</span>
                      <div className="bg-muted p-2 rounded font-mono text-xs flex items-center justify-between">
                        G-XXXXXXXXXX
                        <CopyButton text="G-XXXXXXXXXX" />
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.6</span>
                    <span>Cole na aba <strong>"Básico"</strong> no campo <strong>"Google Analytics 4"</strong></span>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </StepCard>

        {/* Step 2 - Facebook Pixel */}
        <StepCard
          number={2}
          title="Configurar Facebook Pixel"
          description="Obter o ID do Pixel do Facebook"
          duration="5 min"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="fbpixel" className="border-none">
              <AccordionTrigger className="text-sm py-2">Ver instruções detalhadas</AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.1</span>
                    <div>
                      Acesse <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                        Gerenciador de Eventos <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.2</span>
                    <span>Selecione seu Pixel no menu lateral</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.3</span>
                    <span>Clique em <strong>Configurações</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.4</span>
                    <div className="space-y-1">
                      <span>Copie o <strong>ID do Pixel</strong> (número de 15-16 dígitos)</span>
                      <div className="bg-muted p-2 rounded font-mono text-xs flex items-center justify-between">
                        1234567890123456
                        <CopyButton text="1234567890123456" />
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.5</span>
                    <span>Cole na aba <strong>"Básico"</strong> no campo <strong>"Facebook Pixel"</strong></span>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </StepCard>

        {/* Step 3 - GTM Web */}
        <StepCard
          number={3}
          title="Configurar Google Tag Manager (Web)"
          description="Criar container GTM e obter ID"
          duration="10 min"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="gtm" className="border-none">
              <AccordionTrigger className="text-sm py-2">Ver instruções detalhadas</AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.1</span>
                    <div>
                      Acesse <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                        tagmanager.google.com <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.2</span>
                    <span>Crie uma <strong>nova conta</strong> ou selecione uma existente</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.3</span>
                    <span>Crie um container do tipo <strong>"Web"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.4</span>
                    <div className="space-y-1">
                      <span>Copie o <strong>Container ID</strong> (formato: GTM-XXXXXXX)</span>
                      <div className="bg-muted p-2 rounded font-mono text-xs flex items-center justify-between">
                        GTM-XXXXXXX
                        <CopyButton text="GTM-XXXXXXX" />
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.5</span>
                    <span>Cole na aba <strong>"Básico"</strong> no campo <strong>"Google Tag Manager (Web)"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.6</span>
                    <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded">
                      <strong className="text-amber-700">Importante:</strong> O GTM Web serve como "ponte" para o sGTM. Você vai configurar as tags para enviar dados para o servidor.
                    </div>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </StepCard>

        {/* Step 4 - Stape sGTM */}
        <StepCard
          number={4}
          title="Configurar Server GTM (Stape)"
          description="Criar servidor sGTM no Stape.io"
          duration="15 min"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="stape" className="border-none">
              <AccordionTrigger className="text-sm py-2">Ver instruções detalhadas</AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.1</span>
                    <div>
                      Acesse <a href="https://stape.io" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                        stape.io <ExternalLink className="h-3 w-3" />
                      </a> e crie uma conta
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.2</span>
                    <span>Clique em <strong>"Create sGTM container"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.3</span>
                    <span>Escolha a região mais próxima (geralmente <strong>South America</strong>)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.4</span>
                    <div className="space-y-1">
                      <span>Configure um <strong>subdomínio customizado</strong>:</span>
                      <div className="bg-muted p-2 rounded font-mono text-xs flex items-center justify-between">
                        sgtm.seudominio.com
                        <CopyButton text="sgtm.seudominio.com" />
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.5</span>
                    <div className="space-y-2">
                      <span>Configure o DNS no Cloudflare/Registro.br:</span>
                      <div className="bg-muted p-3 rounded space-y-2 text-xs">
                        <div className="grid grid-cols-3 gap-2 font-bold">
                          <span>Tipo</span>
                          <span>Nome</span>
                          <span>Valor</span>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-3 gap-2">
                          <span>CNAME</span>
                          <span>sgtm</span>
                          <span className="break-all">[valor fornecido pelo Stape]</span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.6</span>
                    <span>Aguarde a propagação do DNS (pode levar até 24h)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.7</span>
                    <div className="space-y-1">
                      <span>Copie a <strong>URL do sGTM</strong>:</span>
                      <div className="bg-muted p-2 rounded font-mono text-xs flex items-center justify-between">
                        https://sgtm.seudominio.com
                        <CopyButton text="https://sgtm.seudominio.com" />
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.8</span>
                    <span>Cole na aba <strong>"sGTM"</strong> no campo <strong>"URL do Server GTM"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.9</span>
                    <span>Copie também o <strong>Container ID do sGTM</strong> (GTM-YYYYYY) e cole no campo correspondente</span>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </StepCard>

        {/* Step 5 - Facebook CAPI */}
        <StepCard
          number={5}
          title="Configurar Facebook CAPI"
          description="Obter Access Token para Conversions API"
          duration="10 min"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="capi" className="border-none">
              <AccordionTrigger className="text-sm py-2">Ver instruções detalhadas</AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">5.1</span>
                    <div>
                      Acesse <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                        Gerenciador de Eventos <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">5.2</span>
                    <span>Selecione seu Pixel → <strong>Configurações</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">5.3</span>
                    <span>Role até <strong>"Conversions API"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">5.4</span>
                    <span>Clique em <strong>"Gerar token de acesso"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">5.5</span>
                    <div className="space-y-1">
                      <span>Copie o <strong>Access Token</strong> (começa com EAAG...)</span>
                      <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded text-xs">
                        <strong>⚠️ Importante:</strong> Este token é sensível! Não compartilhe.
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">5.6</span>
                    <span>Cole na aba <strong>"CAPI"</strong> no campo <strong>"Facebook CAPI Access Token"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">5.7</span>
                    <div className="space-y-1">
                      <span><strong>(Opcional)</strong> Para testar, copie o código de teste do Events Manager:</span>
                      <div className="bg-muted p-2 rounded font-mono text-xs">
                        TEST12345
                      </div>
                      <span className="text-muted-foreground">Cole no campo "Código de Teste CAPI"</span>
                    </div>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </StepCard>

        {/* Step 6 - GTM Tags */}
        <StepCard
          number={6}
          title="Configurar Tags no GTM (Web e Server)"
          description="Criar tags para enviar dados ao sGTM"
          duration="15 min"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="tags" className="border-none">
              <AccordionTrigger className="text-sm py-2">Ver instruções detalhadas</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-3 rounded space-y-2">
                    <h4 className="font-bold flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      No GTM Web (Container Cliente)
                    </h4>
                    <ol className="space-y-2 text-sm pl-6">
                      <li>1. Crie uma tag <strong>"Google Analytics: GA4 Configuration"</strong></li>
                      <li>2. Em "Server Container URL", coloque a URL do sGTM</li>
                      <li>3. Marque <strong>"Send to server container"</strong></li>
                      <li>4. Adicione trigger <strong>"All Pages"</strong></li>
                      <li>5. Publique o container</li>
                    </ol>
                  </div>

                  <div className="bg-muted/50 p-3 rounded space-y-2">
                    <h4 className="font-bold flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      No GTM Server (sGTM no Stape)
                    </h4>
                    <ol className="space-y-2 text-sm pl-6">
                      <li>1. Acesse o container Server no GTM</li>
                      <li>2. Crie um <strong>Client</strong> tipo "GA4"</li>
                      <li>3. Crie uma tag <strong>"Google Analytics: GA4"</strong></li>
                      <li>4. Configure o Measurement ID</li>
                      <li>5. Crie uma tag <strong>"Facebook Conversions API"</strong></li>
                      <li>6. Configure o Pixel ID e Access Token</li>
                      <li>7. Publique o container</li>
                    </ol>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 p-3 rounded">
                    <p className="text-sm">
                      <strong className="text-green-700">💡 Dica:</strong> O Stape tem templates prontos para GA4 e Facebook CAPI. 
                      Use a galeria de templates para facilitar a configuração.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </StepCard>

        {/* Step 7 - Advanced */}
        <StepCard
          number={7}
          title="Ativar Enhanced Conversions"
          description="Melhorar atribuição com dados hasheados"
          duration="5 min"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="enhanced" className="border-none">
              <AccordionTrigger className="text-sm py-2">Ver instruções detalhadas</AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">7.1</span>
                    <span>Vá para a aba <strong>"Avançado"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">7.2</span>
                    <span>Ative <strong>"Enhanced Conversions (GA4)"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">7.3</span>
                    <span>Ative <strong>"First-Party Collection"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">7.4</span>
                    <div className="bg-muted p-2 rounded text-xs">
                      <strong>O que isso faz:</strong> Quando um usuário preenche dados (email, telefone) no checkout, 
                      esses dados são hasheados (criptografados) e enviados junto com eventos de conversão para 
                      melhorar a atribuição de anúncios.
                    </div>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </StepCard>

        {/* Step 8 - Test */}
        <StepCard
          number={8}
          title="Testar a Configuração"
          description="Verificar se tudo está funcionando"
          duration="10 min"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="test" className="border-none">
              <AccordionTrigger className="text-sm py-2">Ver instruções detalhadas</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-bold">Testar GA4:</h4>
                    <ol className="pl-4 space-y-1">
                      <li>1. Abra o <strong>GA4 Debugger</strong> (extensão do Chrome)</li>
                      <li>2. Acesse seu site e navegue pelas páginas</li>
                      <li>3. Verifique se os eventos aparecem no Realtime do GA4</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold">Testar Facebook Pixel:</h4>
                    <ol className="pl-4 space-y-1">
                      <li>1. Instale a extensão <strong>Facebook Pixel Helper</strong></li>
                      <li>2. Acesse seu site</li>
                      <li>3. Verifique se o Pixel está disparando</li>
                      <li>4. No Events Manager, verifique os eventos em "Test Events"</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold">Testar sGTM:</h4>
                    <ol className="pl-4 space-y-1">
                      <li>1. No GTM Web, use o modo <strong>Preview</strong></li>
                      <li>2. Verifique se os eventos estão sendo enviados para o Server Container</li>
                      <li>3. No sGTM, use o modo Preview para ver os eventos chegando</li>
                    </ol>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 p-3 rounded">
                    <p>
                      <strong className="text-green-700">✅ Sucesso!</strong> Se você chegou até aqui e os testes passaram, 
                      seu tracking está configurado igual a uma estrutura profissional de WordPress!
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </StepCard>

        {/* Step 9 - Asaas Integration */}
        <StepCard
          number={9}
          title="Integração Automática com Asaas (Gateway)"
          description="Tracking server-side de compras PIX e Boleto"
          duration="Automático"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="asaas" className="border-none">
              <AccordionTrigger className="text-sm py-2">Ver como funciona</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div className="bg-green-500/10 border border-green-500/30 p-3 rounded">
                    <p>
                      <strong className="text-green-700">✅ Já está configurado!</strong> O sistema envia 
                      automaticamente eventos de <strong>Purchase</strong> quando o pagamento é confirmado via Asaas.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold">Como funciona:</h4>
                    <ol className="pl-4 space-y-2">
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">1.</span>
                        <span>Cliente faz pagamento via <strong>PIX ou Boleto</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">2.</span>
                        <span>Asaas envia webhook quando o pagamento é <strong>confirmado</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">3.</span>
                        <span>O sistema lê as configurações de tracking (sGTM URL, Facebook CAPI)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">4.</span>
                        <span>Envia evento <strong>Purchase</strong> diretamente para:</span>
                      </li>
                    </ol>
                    <div className="pl-8 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">sGTM (Stape)</Badge>
                        <span className="text-xs text-muted-foreground">→ GA4 Enhanced Conversions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600">Facebook CAPI</Badge>
                        <span className="text-xs text-muted-foreground">→ Conversions API direta</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded space-y-2">
                    <h4 className="font-bold">Dados enviados:</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• <code>transaction_id</code> - ID único da transação</li>
                      <li>• <code>value</code> - Valor pago (em R$)</li>
                      <li>• <code>currency</code> - BRL</li>
                      <li>• <code>payment_method</code> - pix, boleto ou credit_card</li>
                      <li>• <code>item_id / item_name</code> - Plano comprado</li>
                      <li>• <code>email (hashed)</code> - Email do cliente (SHA-256)</li>
                      <li>• <code>first_name (hashed)</code> - Primeiro nome (SHA-256)</li>
                    </ul>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded">
                    <p className="text-sm">
                      <strong className="text-amber-700">⚠️ Pré-requisitos:</strong> Para que o tracking funcione, 
                      certifique-se de ter configurado pelo menos uma das opções:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• <strong>sGTM:</strong> URL do Server GTM (aba "sGTM")</li>
                      <li>• <strong>Facebook CAPI:</strong> Pixel ID + Access Token (abas "Básico" e "CAPI")</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold">Diferença entre PIX/Boleto e Cartão:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted p-2 rounded">
                        <p className="font-medium text-xs">💳 Cartão de Crédito</p>
                        <p className="text-xs text-muted-foreground">
                          Tracking client-side (navegador) + server-side (webhook)
                        </p>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <p className="font-medium text-xs">📱 PIX / 📄 Boleto</p>
                        <p className="text-xs text-muted-foreground">
                          Tracking 100% server-side (webhook do Asaas)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </StepCard>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo do Fluxo de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client-side flow */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Navegação e Cartão de Crédito (client-side):</p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline">Navegador</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">GTM Web</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">sGTM (Stape)</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1">
                <Badge className="bg-blue-500">GA4</Badge>
                <Badge className="bg-blue-600">FB CAPI</Badge>
              </div>
            </div>
          </div>

          {/* Server-side flow */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">PIX e Boleto (server-side via Asaas):</p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline">Asaas Webhook</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">Edge Function</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1">
                <Badge variant="secondary">sGTM</Badge>
                <Badge className="bg-blue-600">FB CAPI</Badge>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1">
                <Badge className="bg-blue-500">GA4</Badge>
                <Badge className="bg-blue-600">Facebook</Badge>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Este fluxo garante: cookies first-party, bypass de ad blockers, dados mais precisos, 
            melhor atribuição e <strong>tracking de PIX/Boleto</strong> via servidor.
          </p>
        </CardContent>
      </Card>

      {/* Stape Compatibility Info */}
      <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/20 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="h-5 w-5 text-purple-500" />
            Compatibilidade com Plugin Stape (Automático)
          </CardTitle>
          <CardDescription>
            O sistema já envia automaticamente todos os dados que o plugin do Stape/GTM4WP enviaria no WordPress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-background border">
              <p className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> event_id (deduplicação)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                UUID único por evento para deduplicação entre Pixel client-side e CAPI server-side
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background border">
              <p className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> _fbp / _fbc (cookies)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Cookies do Facebook capturados e enviados no dataLayer para atribuição CAPI
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background border">
              <p className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> client_id (GA)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ID do cookie _ga extraído e enviado para matching no sGTM
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background border">
              <p className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> user_agent + context
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                User agent, referrer, screen resolution e language enviados para qualidade do sinal
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-sm font-semibold mb-2">Variáveis disponíveis no dataLayer para configurar no sGTM:</p>
            <div className="bg-background p-3 rounded-lg border font-mono text-xs space-y-1">
              <p><span className="text-purple-600">event_id</span> → Use como Event ID nas tags do sGTM</p>
              <p><span className="text-purple-600">fbp</span> → Mapear para fb_browser_id no Facebook CAPI tag</p>
              <p><span className="text-purple-600">fbc</span> → Mapear para fb_click_id no Facebook CAPI tag</p>
              <p><span className="text-purple-600">client_id</span> → Use como Client ID na tag GA4 do sGTM</p>
              <p><span className="text-purple-600">user_data.email</span> → User data para Enhanced Conversions</p>
              <p><span className="text-purple-600">user_agent</span> → User agent para Facebook CAPI</p>
              <p><span className="text-purple-600">page_location</span> → URL completa da página</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>✅ Nenhum plugin adicional necessário!</strong> Todos os dados que o plugin Stape para WordPress enviaria 
              já são enviados automaticamente pelo nosso sistema. Basta configurar as variáveis acima no container sGTM.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
