import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
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
  ChevronRight,
  BookOpen,
  ShoppingCart,
  Timer,
  type LucideIcon
} from 'lucide-react';

export type AdminSection = 
  | 'overview'
  | 'clients' 
  | 'transactions' 
  | 'coupons'
  | 'abandoned_carts'
  | 'pricing'
  | 'plans'
  | 'menu_order'
  | 'payments'
  | 'categories'
  | 'content'
  | 'coordinates'
  | 'markers'
  | 'restaurants'
  | 'wait_times'
  | 'tracking'
  | 'password'
  | 'documentation';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

interface MenuItem {
  id: AdminSection;
  icon: LucideIcon;
  label: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Geral',
    items: [
      { id: 'overview', icon: LayoutDashboard, label: 'Visão Geral' },
    ]
  },
  {
    title: 'Clientes & Vendas',
    items: [
      { id: 'clients', icon: Users, label: 'Clientes' },
      { id: 'transactions', icon: Receipt, label: 'Transações' },
      { id: 'coupons', icon: Tag, label: 'Cupons' },
      { id: 'abandoned_carts', icon: ShoppingCart, label: 'Carrinhos Abandonados' },
    ]
  },
  {
    title: 'Planos & Pagamentos',
    items: [
      { id: 'pricing', icon: DollarSign, label: 'Preços' },
      { id: 'plans', icon: Settings, label: 'Acesso aos Planos' },
      { id: 'menu_order', icon: Navigation, label: 'Ordem do Menu' },
      { id: 'payments', icon: CreditCard, label: 'Gateway' },
    ]
  },
  {
    title: 'Conteúdo',
    items: [
      { id: 'categories', icon: FolderOpen, label: 'Categorias' },
      { id: 'content', icon: FileVideo, label: 'Conteúdos' },
    ]
  },
  {
    title: 'Mapas & Locais',
    items: [
      { id: 'coordinates', icon: MapPin, label: 'Editor de Mapa' },
      { id: 'markers', icon: Palette, label: 'Ícones do Mapa' },
    ]
  },
  {
    title: 'Dados & Analytics',
    items: [
      { id: 'wait_times', icon: Timer, label: 'Filas (Analytics)' },
      { id: 'tracking', icon: LayoutDashboard, label: 'Tracking (LP)' },
    ]
  },
  {
    title: 'Estabelecimentos',
    items: [
      { id: 'restaurants', icon: UtensilsCrossed, label: 'Restaurantes' },
    ]
  },
  {
    title: 'Ferramentas',
    items: [
      { id: 'password', icon: KeyRound, label: 'Gerador de Senhas' },
      { id: 'documentation', icon: BookOpen, label: 'Documentação' },
    ]
  },
];

const AdminSidebarComponent = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  const handleClick = useCallback((id: AdminSection) => {
    onSectionChange(id);
  }, [onSectionChange]);

  return (
    <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-12rem)] rounded-l-xl flex-shrink-0">
      <div className="p-4 h-full overflow-y-auto">
        <nav className="space-y-6">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  const IconComponent = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleClick(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export const AdminSidebar = memo(AdminSidebarComponent);
