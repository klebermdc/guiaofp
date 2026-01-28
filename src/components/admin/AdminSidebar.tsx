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
  Store,
  Map,
  Wrench
} from 'lucide-react';

export type AdminSection = 
  | 'overview'
  | 'clients' 
  | 'transactions' 
  | 'coupons'
  | 'pricing'
  | 'plans'
  | 'payments'
  | 'categories'
  | 'content'
  | 'coordinates'
  | 'pois'
  | 'markers'
  | 'restaurants'
  | 'password';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const menuGroups = [
  {
    title: 'Geral',
    items: [
      { id: 'overview' as AdminSection, icon: LayoutDashboard, label: 'Visão Geral' },
    ]
  },
  {
    title: 'Clientes & Vendas',
    items: [
      { id: 'clients' as AdminSection, icon: Users, label: 'Clientes' },
      { id: 'transactions' as AdminSection, icon: Receipt, label: 'Transações' },
      { id: 'coupons' as AdminSection, icon: Tag, label: 'Cupons' },
    ]
  },
  {
    title: 'Planos & Pagamentos',
    items: [
      { id: 'pricing' as AdminSection, icon: DollarSign, label: 'Preços' },
      { id: 'plans' as AdminSection, icon: Settings, label: 'Acesso aos Planos' },
      { id: 'payments' as AdminSection, icon: CreditCard, label: 'Gateway' },
    ]
  },
  {
    title: 'Conteúdo',
    items: [
      { id: 'categories' as AdminSection, icon: FolderOpen, label: 'Categorias' },
      { id: 'content' as AdminSection, icon: FileVideo, label: 'Conteúdos' },
    ]
  },
  {
    title: 'Mapas & Locais',
    items: [
      { id: 'coordinates' as AdminSection, icon: MapPin, label: 'Coordenadas' },
      { id: 'pois' as AdminSection, icon: Navigation, label: 'POIs' },
      { id: 'markers' as AdminSection, icon: Palette, label: 'Ícones do Mapa' },
    ]
  },
  {
    title: 'Estabelecimentos',
    items: [
      { id: 'restaurants' as AdminSection, icon: UtensilsCrossed, label: 'Restaurantes' },
    ]
  },
  {
    title: 'Ferramentas',
    items: [
      { id: 'password' as AdminSection, icon: KeyRound, label: 'Gerador de Senhas' },
    ]
  },
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-12rem)] rounded-l-xl">
      <div className="p-4">
        <nav className="space-y-6">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onSectionChange(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
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
}
