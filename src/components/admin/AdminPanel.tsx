import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { AdminSidebar, type AdminSection } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { CategoriesManager } from './CategoriesManager';
import { ContentManager } from './ContentManager';
import { ClientsManager } from './ClientsManager';
import { PasswordGenerator } from './PasswordGenerator';
import { PlanAccessManager } from './PlanAccessManager';
import { MenuOrderManager } from './MenuOrderManager';
import { PaymentGatewayManager } from './PaymentGatewayManager';
import { PlanPricingManager } from './PlanPricingManager';
import { TransactionsManager } from './TransactionsManager';
import { CouponsManager } from './CouponsManager';
import { CartRecoveryManager } from './CartRecoveryManager';
import { UnifiedMapEditor } from './UnifiedMapEditor';
import { MarkerIconManager } from './MarkerIconManager';
import AdminRestaurantsPanel from './AdminRestaurantsPanel';
import { ProjectDocumentation } from './ProjectDocumentation';
import { WaitTimeAnalytics } from './WaitTimeAnalytics';
import { TrackingConfigManager } from './TrackingConfigManager';
import { AIKnowledgeBaseManager } from './AIKnowledgeBaseManager';
import { PartnerCouponsManager } from './PartnerCouponsManager';
import { 
  Users, 
  Receipt, 
  Tag, 
  DollarSign, 
  Settings, 
  CreditCard, 
  FolderOpen, 
  FileVideo, 
  KeyRound, 
  MapPin, 
  Palette, 
  UtensilsCrossed,
  LayoutDashboard,
  BookOpen,
  Menu,
  ShoppingCart,
  Timer,
  Mail,
  Brain,
  type LucideIcon
} from 'lucide-react';

interface SectionConfig {
  title: string;
  description: string;
  icon: LucideIcon;
}

const sectionConfig: Record<AdminSection, SectionConfig> = {
  overview: { title: 'Visão Geral', description: 'Resumo das métricas do sistema', icon: LayoutDashboard },
  clients: { title: 'Clientes', description: 'Gerenciar usuários e perfis', icon: Users },
  transactions: { title: 'Transações', description: 'Acompanhar pagamentos e receitas', icon: Receipt },
  coupons: { title: 'Cupons de Desconto', description: 'Criar e gerenciar promoções', icon: Tag },
  cart_recovery: { title: 'Carrinhos Abandonados', description: 'Gerenciar leads e enviar e-mails de recuperação', icon: ShoppingCart },
  pricing: { title: 'Preços dos Planos', description: 'Configurar valores e features', icon: DollarSign },
  plans: { title: 'Acesso aos Planos', description: 'Controlar visibilidade de páginas', icon: Settings },
  menu_order: { title: 'Ordem do Menu', description: 'Reordenar itens por contexto', icon: Menu },
  payments: { title: 'Gateway de Pagamento', description: 'Configurar integrações de pagamento', icon: CreditCard },
  categories: { title: 'Categorias', description: 'Organizar conteúdos por categoria', icon: FolderOpen },
  content: { title: 'Conteúdos', description: 'Gerenciar vídeos e materiais', icon: FileVideo },
  coordinates: { title: 'Editor de Mapa', description: 'Posicionar atrações, restaurantes e POIs', icon: MapPin },
  markers: { title: 'Ícones do Mapa', description: 'Personalizar marcadores', icon: Palette },
  restaurants: { title: 'Restaurantes', description: 'Gerenciar informações de restaurantes', icon: UtensilsCrossed },
  wait_times: { title: 'Filas (Analytics)', description: 'Monitorar coleta de tempos de espera', icon: Timer },
  tracking: { title: 'Tracking (LP)', description: 'Configurar Google Analytics, Facebook Pixel e GTM', icon: LayoutDashboard },
  password: { title: 'Gerador de Senhas', description: 'Criar senhas seguras', icon: KeyRound },
  documentation: { title: 'Documentação', description: 'Documentação técnica do projeto', icon: BookOpen },
  ai_knowledge: { title: 'Base da Joy (IA)', description: 'Gerenciar conhecimento da assistente virtual', icon: Brain },
  partner_coupons: { title: 'Cupons de Parceiros', description: 'Gerenciar cupons de desconto para viagem', icon: Tag },
};

const ADMIN_SECTION_KEY = 'admin_active_section';

const AdminPanelComponent = () => {
  // Persist active section in sessionStorage to survive tab switches
  const [activeSection, setActiveSection] = useState<AdminSection>(() => {
    const saved = sessionStorage.getItem(ADMIN_SECTION_KEY);
    if (saved && saved in sectionConfig) {
      return saved as AdminSection;
    }
    return 'overview';
  });
  
  // Save to sessionStorage whenever section changes
  useEffect(() => {
    sessionStorage.setItem(ADMIN_SECTION_KEY, activeSection);
  }, [activeSection]);
  
  const currentConfig = useMemo(() => sectionConfig[activeSection], [activeSection]);
  const IconComponent = currentConfig.icon;

  const handleSectionChange = useCallback((section: AdminSection) => {
    setActiveSection(section);
  }, []);

  const renderContent = useMemo(() => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'clients':
        return <ClientsManager />;
      case 'transactions':
        return <TransactionsManager />;
      case 'coupons':
        return <CouponsManager />;
      case 'cart_recovery':
        return <CartRecoveryManager />;
      case 'pricing':
        return <PlanPricingManager />;
      case 'plans':
        return <PlanAccessManager />;
      case 'menu_order':
        return <MenuOrderManager />;
      case 'payments':
        return <PaymentGatewayManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'content':
        return <ContentManager />;
      case 'coordinates':
        return <UnifiedMapEditor />;
      case 'markers':
        return <MarkerIconManager />;
      case 'restaurants':
        return <AdminRestaurantsPanel />;
      case 'wait_times':
        return <WaitTimeAnalytics />;
      case 'tracking':
        return <TrackingConfigManager />;
      case 'password':
        return <PasswordGenerator />;
      case 'documentation':
        return <ProjectDocumentation />;
      case 'ai_knowledge':
        return <AIKnowledgeBaseManager />;
      case 'partner_coupons':
        return <PartnerCouponsManager />;
      default:
        return <AdminOverview />;
    }
  }, [activeSection]);

  return (
    <div className="flex gap-0 min-h-[calc(100vh-12rem)]">
      {/* Sidebar */}
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange} 
      />
      
      {/* Main Content */}
      <div className="flex-1 bg-card border-t border-r border-b border-border rounded-r-xl overflow-hidden">
        <div className="p-6 h-full overflow-y-auto">
          {activeSection !== 'overview' && (
            <div className="mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{currentConfig.title}</h2>
                  <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="min-h-[500px]">
            {renderContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminPanel = memo(AdminPanelComponent);
