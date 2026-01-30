import { useState, useMemo, useCallback, memo } from 'react';
import { AdminSidebar, type AdminSection } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { CategoriesManager } from './CategoriesManager';
import { ContentManager } from './ContentManager';
import { ClientsManager } from './ClientsManager';
import { PasswordGenerator } from './PasswordGenerator';
import { PlanAccessManager } from './PlanAccessManager';
import { PaymentGatewayManager } from './PaymentGatewayManager';
import { PlanPricingManager } from './PlanPricingManager';
import { TransactionsManager } from './TransactionsManager';
import { CouponsManager } from './CouponsManager';
import { AttractionCoordinatesEditor } from './AttractionCoordinatesEditor';
import { POIEditor } from './POIEditor';
import { MarkerIconManager } from './MarkerIconManager';
import AdminRestaurantsPanel from './AdminRestaurantsPanel';
import { ProjectDocumentation } from './ProjectDocumentation';
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
  Navigation, 
  Palette, 
  UtensilsCrossed,
  LayoutDashboard,
  BookOpen,
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
  pricing: { title: 'Preços dos Planos', description: 'Configurar valores e features', icon: DollarSign },
  plans: { title: 'Acesso aos Planos', description: 'Controlar visibilidade de páginas', icon: Settings },
  payments: { title: 'Gateway de Pagamento', description: 'Configurar integrações de pagamento', icon: CreditCard },
  categories: { title: 'Categorias', description: 'Organizar conteúdos por categoria', icon: FolderOpen },
  content: { title: 'Conteúdos', description: 'Gerenciar vídeos e materiais', icon: FileVideo },
  coordinates: { title: 'Coordenadas', description: 'Posicionar atrações no mapa', icon: MapPin },
  pois: { title: 'Pontos de Interesse', description: 'Gerenciar locais no mapa', icon: Navigation },
  markers: { title: 'Ícones do Mapa', description: 'Personalizar marcadores', icon: Palette },
  restaurants: { title: 'Restaurantes', description: 'Gerenciar informações de restaurantes', icon: UtensilsCrossed },
  password: { title: 'Gerador de Senhas', description: 'Criar senhas seguras', icon: KeyRound },
  documentation: { title: 'Documentação', description: 'Documentação técnica do projeto', icon: BookOpen },
};

const AdminPanelComponent = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  
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
      case 'pricing':
        return <PlanPricingManager />;
      case 'plans':
        return <PlanAccessManager />;
      case 'payments':
        return <PaymentGatewayManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'content':
        return <ContentManager />;
      case 'coordinates':
        return <AttractionCoordinatesEditor />;
      case 'pois':
        return <POIEditor />;
      case 'markers':
        return <MarkerIconManager />;
      case 'restaurants':
        return <AdminRestaurantsPanel />;
      case 'password':
        return <PasswordGenerator />;
      case 'documentation':
        return <ProjectDocumentation />;
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
