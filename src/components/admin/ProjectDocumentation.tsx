import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Server, 
  Shield, 
  Users, 
  Map, 
  Calendar, 
  MessageSquare,
  CreditCard,
  Bell,
  FileText,
  Layers,
  GitBranch,
  Folder,
  Code,
  Workflow,
  Globe
} from 'lucide-react';

const ProjectDocumentationComponent = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <FileText className="h-7 w-7 text-primary" />
            Documentação Técnica - Orlando Fast Pass
          </CardTitle>
          <p className="text-muted-foreground">
            Guia completo da arquitetura, fluxos e integrações do sistema
          </p>
        </CardHeader>
      </Card>

      <Accordion type="multiple" defaultValue={["overview", "architecture"]} className="space-y-4">
        {/* 1. Visão Geral */}
        <AccordionItem value="overview" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <span className="font-semibold">1. Visão Geral do Projeto</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
              <p>
                <strong>Orlando Fast Pass</strong> é uma plataforma SaaS para planejamento de viagens a Orlando,
                oferecendo guiamento profissional, roteiros personalizados e ferramentas de organização.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 not-prose">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">🎯 Público-Alvo</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Famílias brasileiras planejando viagem a Orlando</li>
                    <li>• Guias de viagem profissionais</li>
                    <li>• Administradores do sistema</li>
                  </ul>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">💼 Modelo de Negócio</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Plano Básico: Acesso limitado</li>
                    <li>• Plano Premium: Acesso completo + guiamento</li>
                    <li>• Pagamento via Asaas (PIX/Boleto)</li>
                  </ul>
                </Card>
              </div>

              <h4 className="font-semibold mt-4">Stack Tecnológica</h4>
              <div className="flex flex-wrap gap-2 not-prose">
                <Badge variant="secondary">React 18</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">Vite</Badge>
                <Badge variant="secondary">Tailwind CSS</Badge>
                <Badge variant="secondary">shadcn/ui</Badge>
                <Badge variant="secondary">Supabase</Badge>
                <Badge variant="secondary">Deno Edge Functions</Badge>
                <Badge variant="secondary">TanStack Query</Badge>
                <Badge variant="secondary">React Router</Badge>
                <Badge variant="secondary">Framer Motion</Badge>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Arquitetura */}
        <AccordionItem value="architecture" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-primary" />
              <span className="font-semibold">2. Arquitetura do Sistema</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{`
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React SPA)                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │ Landing │  │Dashboard│  │  Admin  │  │ Guide Dashboard │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘ │
│       └────────────┴────────────┴────────────────┘          │
│                           │                                  │
│              ┌────────────┴────────────┐                    │
│              │   Supabase JS Client    │                    │
│              └────────────┬────────────┘                    │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                    LOVABLE CLOUD (Backend)                   │
│  ┌────────────────────────┴────────────────────────┐        │
│  │                   Supabase                       │        │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │        │
│  │  │PostgreSQL│  │   Auth   │  │    Storage    │  │        │
│  │  │  + RLS   │  │          │  │   (Buckets)   │  │        │
│  │  └──────────┘  └──────────┘  └───────────────┘  │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
│  ┌─────────────────── Edge Functions ──────────────────────┐│
│  │ • orlando-assistant    • send-whatsapp                  ││
│  │ • create-asaas-payment • asaas-webhook                  ││
│  │ • utalk-webhook        • notify-multipass               ││
│  │ • generate-itinerary   • send-push-notification         ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                   INTEGRAÇÕES EXTERNAS                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Asaas   │  │  uTalk   │  │  Resend  │  │Google AI │    │
│  │(Pagamento│  │(WhatsApp)│  │ (Email)  │  │ (Gemini) │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└──────────────────────────────────────────────────────────────┘
                `}</pre>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Segurança
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Row Level Security (RLS) em todas as tabelas</li>
                    <li>• Roles separados: admin, guide, client</li>
                    <li>• JWT validation nas Edge Functions</li>
                    <li>• Secrets gerenciados pelo Supabase Vault</li>
                  </ul>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Server className="h-4 w-4" /> Infraestrutura
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Deploy automático via Lovable</li>
                    <li>• CDN global para assets</li>
                    <li>• Edge Functions em Deno</li>
                    <li>• Storage com buckets públicos/privados</li>
                  </ul>
                </Card>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Estrutura de Pastas */}
        <AccordionItem value="folders" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Folder className="h-5 w-5 text-primary" />
              <span className="font-semibold">3. Estrutura de Pastas</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`
src/
├── assets/                 # Imagens e recursos estáticos
│   ├── attractions/        # Fotos de atrações
│   ├── parks/              # Logos dos parques
│   └── tutorials/          # Imagens de tutoriais
│
├── components/
│   ├── admin/              # Componentes do painel admin
│   │   ├── AdminPanel.tsx  # Hub principal
│   │   ├── AdminSidebar.tsx # Navegação lateral
│   │   ├── ClientsManager.tsx
│   │   ├── TransactionsManager.tsx
│   │   └── ...
│   │
│   ├── chat/               # Assistente Orlando
│   ├── dashboard/          # Widgets do dashboard
│   ├── guide/              # Componentes do guia
│   ├── itinerary/          # Gerador de roteiros
│   ├── layout/             # AppLayout, Sidebar, Nav
│   ├── map/                # Mapa interativo
│   ├── planner/            # Planejador de viagem
│   ├── restaurants/        # Cards de restaurantes
│   └── ui/                 # shadcn/ui components
│
├── contexts/
│   ├── AuthContext.tsx     # Estado de autenticação
│   ├── LanguageContext.tsx # i18n (pt/en/es)
│   └── TravelModeContext.tsx # Modo viagem ativo
│
├── data/
│   ├── constants.ts        # POI_CONFIG, PARKS
│   ├── parkInfo.ts         # Info dos parques
│   └── restaurantsData.ts  # Dados de restaurantes
│
├── hooks/
│   ├── useUserRole.ts      # Verificação de roles
│   ├── useMultipassStatus.ts
│   ├── usePushNotifications.ts
│   └── ...
│
├── i18n/
│   └── translations/       # en.ts, es.ts, pt.ts
│
├── integrations/
│   └── supabase/
│       ├── client.ts       # ⚠️ NÃO EDITAR (auto-gerado)
│       └── types.ts        # ⚠️ NÃO EDITAR (auto-gerado)
│
├── lib/
│   ├── error-handler.ts    # Tratamento de erros
│   └── utils.ts            # cn() e helpers
│
├── pages/
│   ├── Landing.tsx         # Página inicial pública
│   ├── Login.tsx           # Autenticação
│   ├── Dashboard.tsx       # Dashboard do cliente
│   ├── GuideDashboard.tsx  # Dashboard do guia
│   ├── Admin.tsx           # Painel administrativo
│   └── ...
│
├── types/
│   └── shared.ts           # Interfaces compartilhadas
│
└── main.tsx                # Entry point

supabase/
├── config.toml             # ⚠️ NÃO EDITAR (auto-gerado)
└── functions/
    ├── orlando-assistant/  # Chat com IA
    ├── create-asaas-payment/
    ├── asaas-webhook/
    ├── send-whatsapp/
    ├── utalk-webhook/
    ├── send-push-notification/
    └── ...
              `}</pre>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Banco de Dados */}
        <AccordionItem value="database" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <span className="font-semibold">4. Banco de Dados (PostgreSQL)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Todas as tabelas possuem RLS habilitado. O schema completo está em <code>src/integrations/supabase/types.ts</code>
              </p>

              <div className="grid gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-primary">Tabelas Principais</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">profiles</p>
                      <p className="text-muted-foreground text-xs">Dados do usuário, datas de viagem, hotel, grupo</p>
                    </div>
                    <div>
                      <p className="font-medium">user_roles</p>
                      <p className="text-muted-foreground text-xs">Roles: admin, guide, client</p>
                    </div>
                    <div>
                      <p className="font-medium">transactions</p>
                      <p className="text-muted-foreground text-xs">Pagamentos, status, cupons aplicados</p>
                    </div>
                    <div>
                      <p className="font-medium">discount_coupons</p>
                      <p className="text-muted-foreground text-xs">Cupons de desconto ativos</p>
                    </div>
                    <div>
                      <p className="font-medium">plan_pricing</p>
                      <p className="text-muted-foreground text-xs">Preços e features dos planos</p>
                    </div>
                    <div>
                      <p className="font-medium">plan_page_access</p>
                      <p className="text-muted-foreground text-xs">Controle de acesso por plano</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-primary">Tabelas de Conteúdo</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">parks</p>
                      <p className="text-muted-foreground text-xs">Disney, Universal, SeaWorld, etc.</p>
                    </div>
                    <div>
                      <p className="font-medium">attractions</p>
                      <p className="text-muted-foreground text-xs">Atrações com coordenadas e wait times</p>
                    </div>
                    <div>
                      <p className="font-medium">restaurants</p>
                      <p className="text-muted-foreground text-xs">Restaurantes com menus e reviews</p>
                    </div>
                    <div>
                      <p className="font-medium">content_items</p>
                      <p className="text-muted-foreground text-xs">Vídeos e materiais por categoria</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-primary">Tabelas de Planejamento</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">user_planners</p>
                      <p className="text-muted-foreground text-xs">Roteiros salvos pelo usuário</p>
                    </div>
                    <div>
                      <p className="font-medium">planner_items</p>
                      <p className="text-muted-foreground text-xs">Itens do roteiro por data</p>
                    </div>
                    <div>
                      <p className="font-medium">itineraries</p>
                      <p className="text-muted-foreground text-xs">Roteiros gerados por IA</p>
                    </div>
                    <div>
                      <p className="font-medium">multipass_status</p>
                      <p className="text-muted-foreground text-xs">Status do Lightning Lane</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">⚠️ Importante sobre RLS</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Funções como <code>has_role()</code> e <code>is_guide_or_admin()</code> são usadas nas policies
                  para evitar recursão. Nunca use referências diretas à tabela user_roles dentro de policies.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Fluxo de Autenticação */}
        <AccordionItem value="auth" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">5. Fluxo de Autenticação</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
                <pre>{`
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Landing    │────▶│    Login     │────▶│  Dashboard   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
                     ┌─────┴─────┐
                     │ Supabase  │
                     │   Auth    │
                     └─────┬─────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌──────────────┐          ┌──────────────┐
      │   profiles   │          │  user_roles  │
      │ (auto-criado)│          │ (manual/API) │
      └──────────────┘          └──────────────┘
                `}</pre>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Tipos de Usuário</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline">client</Badge>
                      <span className="text-muted-foreground">Usuário padrão</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">guide</Badge>
                      <span className="text-muted-foreground">Guia profissional</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge>admin</Badge>
                      <span className="text-muted-foreground">Administrador total</span>
                    </li>
                  </ul>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Verificação de Role</h4>
                  <div className="bg-muted p-3 rounded text-xs font-mono">
                    {`// Hook useUserRole
const { isGuide, isAdmin } = useUserRole();

// Função SQL
has_role(auth.uid(), 'admin')`}
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <h4 className="font-semibold mb-2">Fluxo de Novo Usuário</h4>
                <ol className="text-sm space-y-2 text-muted-foreground">
                  <li>1. Usuário faz cadastro em <code>/login</code></li>
                  <li>2. Trigger <code>handle_new_user()</code> cria registro em <code>profiles</code></li>
                  <li>3. Edge Function <code>notify-new-user</code> envia email ao admin</li>
                  <li>4. Admin habilita acesso via painel (<code>is_access_enabled = true</code>)</li>
                  <li>5. Edge Function <code>notify-access-enabled</code> notifica o usuário</li>
                </ol>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 6. Edge Functions */}
        <AccordionItem value="edge-functions" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-primary" />
              <span className="font-semibold">6. Edge Functions (Deno)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Funções serverless em <code>supabase/functions/</code>. Deploy automático pelo Lovable.
              </p>

              <div className="grid gap-3">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Comunicação
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">orlando-assistant</p>
                      <p className="text-xs text-muted-foreground">Chat com IA (Gemini) sobre Orlando</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">send-whatsapp</p>
                      <p className="text-xs text-muted-foreground">Envio de mensagens via uTalk</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">utalk-webhook</p>
                      <p className="text-xs text-muted-foreground">Recebe mensagens do WhatsApp</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">send-push-notification</p>
                      <p className="text-xs text-muted-foreground">Push notifications (Web Push)</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Pagamentos
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">create-asaas-payment</p>
                      <p className="text-xs text-muted-foreground">Cria cobrança PIX/Boleto</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">asaas-webhook</p>
                      <p className="text-xs text-muted-foreground">Recebe confirmação de pagamento</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Notificações
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">notify-multipass</p>
                      <p className="text-xs text-muted-foreground">Lembra de comprar Lightning Lane</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">notify-park-day</p>
                      <p className="text-xs text-muted-foreground">Notifica no dia do parque</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">notify-new-user</p>
                      <p className="text-xs text-muted-foreground">Avisa admin de novo cadastro</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">notify-access-enabled</p>
                      <p className="text-xs text-muted-foreground">Avisa usuário que foi aprovado</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Roteiros
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">generate-itinerary</p>
                      <p className="text-xs text-muted-foreground">Gera roteiro via IA</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">suggest-hotels</p>
                      <p className="text-xs text-muted-foreground">Sugere hotéis baseado no perfil</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">suggest-restaurants</p>
                      <p className="text-xs text-muted-foreground">Recomenda restaurantes</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium">suggest-tickets</p>
                      <p className="text-xs text-muted-foreground">Sugere tipos de ingresso</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Secrets Configurados</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">ASAAS_API_KEY</Badge>
                  <Badge variant="outline">UTALK_TOKEN</Badge>
                  <Badge variant="outline">UTALK_ORG_ID</Badge>
                  <Badge variant="outline">RESEND_API_KEY</Badge>
                  <Badge variant="outline">VAPID_PUBLIC_KEY</Badge>
                  <Badge variant="outline">VAPID_PRIVATE_KEY</Badge>
                  <Badge variant="outline">GOOGLE_MAPS_API_KEY</Badge>
                  <Badge variant="outline">LOVABLE_API_KEY</Badge>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 7. Integrações */}
        <AccordionItem value="integrations" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-primary" />
              <span className="font-semibold">7. Integrações Externas</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="grid gap-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">💳 Asaas (Pagamentos)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Endpoint: <code>https://api.asaas.com/v3/</code></li>
                  <li>• Métodos: PIX e Boleto</li>
                  <li>• Webhook: <code>/functions/v1/asaas-webhook</code></li>
                  <li>• Fluxo: Cria cobrança → Aguarda pagamento → Webhook confirma → Atualiza profile</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-2">📱 uTalk / Umbler Talk (WhatsApp)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• API: <code>https://api.utalk.chat/send/</code></li>
                  <li>• Envio: Edge function <code>send-whatsapp</code></li>
                  <li>• Recebimento: Webhook <code>utalk-webhook</code></li>
                  <li>• Comandos: text, image, document, video</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-2">✉️ Resend (Email)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Usado para notificações de admin</li>
                  <li>• Templates em HTML inline nas edge functions</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-2">🤖 Lovable AI (Gemini)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Modelo: google/gemini-2.5-flash</li>
                  <li>• Usado no: orlando-assistant, generate-itinerary</li>
                  <li>• Não requer API key (integrado via LOVABLE_API_KEY)</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-2">🔔 Web Push Notifications</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• VAPID keys configuradas</li>
                  <li>• Service Worker: <code>public/sw.js</code></li>
                  <li>• Tabela: <code>push_subscriptions</code></li>
                </ul>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 8. Fluxos Principais */}
        <AccordionItem value="flows" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Workflow className="h-5 w-5 text-primary" />
              <span className="font-semibold">8. Fluxos Principais</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-6">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">🛒 Fluxo de Compra</h4>
                <div className="bg-muted/50 p-3 rounded text-sm font-mono">
                  <pre>{`
1. Usuário acessa /checkout/:planId
2. Preenche dados e aplica cupom (opcional)
3. Escolhe PIX ou Boleto
4. create-asaas-payment cria cobrança
5. Exibe QR Code/Boleto
6. Usuário paga
7. asaas-webhook recebe confirmação
8. Atualiza transactions.status = 'CONFIRMED'
9. Atualiza profiles.plan_tier e is_access_enabled
10. send-push-notification notifica usuário
                  `}</pre>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">📅 Fluxo do Planner</h4>
                <div className="bg-muted/50 p-3 rounded text-sm font-mono">
                  <pre>{`
1. Usuário acessa /planner-manual
2. Cria novo planner com datas da viagem
3. Arrasta atividades para os dias (drag & drop)
4. Edita horários, notas e reservas
5. Salva automaticamente no Supabase
6. Pode exportar para PDF
                  `}</pre>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">🎢 Fluxo do Mapa</h4>
                <div className="bg-muted/50 p-3 rounded text-sm font-mono">
                  <pre>{`
1. Usuário acessa /mapa
2. Seleciona parque no dropdown
3. Leaflet carrega markers das atrações
4. Clica em atração → abre sheet com detalhes
5. Pode ver tempo de fila (queue-times API)
6. Pode traçar rota até a atração
                  `}</pre>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">👨‍✈️ Fluxo do Guia</h4>
                <div className="bg-muted/50 p-3 rounded text-sm font-mono">
                  <pre>{`
1. Guia acessa /guia-dashboard
2. Vê calendário com clientes por data de chegada
3. Filtra por guia (Rafael/Kleber)
4. Clica em cliente → vê "prontuário" completo
5. Pode enviar WhatsApp direto
6. Pode enviar push notification
7. Pode atualizar status do Multipass
                  `}</pre>
                </div>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 9. Páginas e Rotas */}
        <AccordionItem value="routes" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Map className="h-5 w-5 text-primary" />
              <span className="font-semibold">9. Páginas e Rotas</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Públicas</h4>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div><code>/</code> - Landing Page</div>
                  <div><code>/login</code> - Autenticação</div>
                  <div><code>/recuperar-senha</code> - Reset de senha</div>
                  <div><code>/nova-senha</code> - Nova senha (link do email)</div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Cliente Autenticado</h4>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div><code>/dashboard</code> - Painel principal</div>
                  <div><code>/perfil</code> - Dados da viagem</div>
                  <div><code>/agenda</code> - Calendário</div>
                  <div><code>/mapa</code> - Mapa interativo</div>
                  <div><code>/atracoes</code> - Lista de atrações</div>
                  <div><code>/restaurantes</code> - Restaurantes</div>
                  <div><code>/guia</code> - Guia de viagem</div>
                  <div><code>/conteudos</code> - Vídeos e materiais</div>
                  <div><code>/multipass</code> - Tutorial Lightning Lane</div>
                  <div><code>/planner-manual</code> - Planejador</div>
                  <div><code>/roteiro-personalizado</code> - Roteiro IA</div>
                  <div><code>/favoritos</code> - Itens salvos</div>
                  <div><code>/carteira</code> - Documentos</div>
                  <div><code>/contato</code> - Falar com guia</div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Guia / Admin</h4>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div><code>/guia-dashboard</code> - Dashboard do guia</div>
                  <div><code>/admin</code> - Painel administrativo</div>
                  <div><code>/admin/cliente/:id</code> - Detalhes do cliente</div>
                </div>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 10. Convenções de Código */}
        <AccordionItem value="conventions" className="border rounded-xl px-4 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-primary" />
              <span className="font-semibold">10. Convenções de Código</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Nomenclatura</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Componentes: PascalCase (<code>ClientsManager.tsx</code>)</li>
                  <li>• Hooks: camelCase com prefixo use (<code>useUserRole.ts</code>)</li>
                  <li>• Utilitários: camelCase (<code>error-handler.ts</code>)</li>
                  <li>• Constantes: SCREAMING_SNAKE_CASE (<code>POI_CONFIG</code>)</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-2">Estilização</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Tailwind CSS com tokens semânticos</li>
                  <li>• Cores via CSS variables (<code>--primary</code>, <code>--muted</code>)</li>
                  <li>• Nunca usar cores hardcoded em componentes</li>
                  <li>• shadcn/ui para componentes base</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-2">Padrões</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• React Query para fetching e cache</li>
                  <li>• Context para estado global (Auth, Language, TravelMode)</li>
                  <li>• Componentes memoizados com <code>memo()</code></li>
                  <li>• Error Boundary global</li>
                  <li>• Lazy loading para páginas pesadas</li>
                </ul>
              </Card>

              <Card className="p-4 border-red-500/20 bg-red-500/5">
                <h4 className="font-semibold mb-2 text-red-500">⛔ Arquivos Proibidos de Editar</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <code>src/integrations/supabase/client.ts</code></li>
                  <li>• <code>src/integrations/supabase/types.ts</code></li>
                  <li>• <code>supabase/config.toml</code></li>
                  <li>• <code>.env</code></li>
                </ul>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Footer */}
      <Card className="p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground text-center">
          Documentação gerada automaticamente • Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </Card>
    </div>
  );
};

export const ProjectDocumentation = memo(ProjectDocumentationComponent);
