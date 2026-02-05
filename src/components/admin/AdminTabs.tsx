import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesManager } from './CategoriesManager';
import { Users, FileVideo, FolderOpen, KeyRound, Settings, CreditCard, DollarSign, Receipt, Tag, MapPin, Palette, UtensilsCrossed, Timer, ShoppingCart, Clock, Brain } from 'lucide-react';
import { ContentManager } from './ContentManager';
import { ClientsManager } from './ClientsManager';
import { PasswordGenerator } from './PasswordGenerator';
import { PlanAccessManager } from './PlanAccessManager';
import { PaymentGatewayManager } from './PaymentGatewayManager';
import { PlanPricingManager } from './PlanPricingManager';
import { TransactionsManager } from './TransactionsManager';
import { CouponsManager } from './CouponsManager';
import { UnifiedMapEditor } from './UnifiedMapEditor';
import { MarkerIconManager } from './MarkerIconManager';
import AdminRestaurantsPanel from './AdminRestaurantsPanel';
import { WaitTimeAnalytics } from './WaitTimeAnalytics';
import { AbandonedCartsManager } from './AbandonedCartsManager';
import { PendingPaymentsManager } from './PendingPaymentsManager';
import { AIKnowledgeBaseManager } from './AIKnowledgeBaseManager';

export function AdminTabs() {
  return (
    <Tabs defaultValue="clients" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex lg:grid-cols-12">
        <TabsTrigger value="clients" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Clientes</span>
        </TabsTrigger>
        <TabsTrigger value="transactions" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Transações</span>
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Pendentes</span>
        </TabsTrigger>
        <TabsTrigger value="abandoned" className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Abandonados</span>
        </TabsTrigger>
        <TabsTrigger value="coupons" className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <span className="hidden sm:inline">Cupons</span>
        </TabsTrigger>
        <TabsTrigger value="pricing" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Preços</span>
        </TabsTrigger>
        <TabsTrigger value="plans" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Planos</span>
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">Gateway</span>
        </TabsTrigger>
        <TabsTrigger value="categories" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Categorias</span>
        </TabsTrigger>
        <TabsTrigger value="content" className="flex items-center gap-2">
          <FileVideo className="h-4 w-4" />
          <span className="hidden sm:inline">Conteúdos</span>
        </TabsTrigger>
        <TabsTrigger value="password" className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          <span className="hidden sm:inline">Senhas</span>
        </TabsTrigger>
        <TabsTrigger value="map-editor" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Editor de Mapa</span>
        </TabsTrigger>
        <TabsTrigger value="markers" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Ícones</span>
        </TabsTrigger>
        <TabsTrigger value="restaurants" className="flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4" />
          <span className="hidden sm:inline">Restaurantes</span>
        </TabsTrigger>
        <TabsTrigger value="wait-times" className="flex items-center gap-2">
          <Timer className="h-4 w-4" />
          <span className="hidden sm:inline">Filas</span>
        </TabsTrigger>
        <TabsTrigger value="ai-knowledge" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span className="hidden sm:inline">IA Joy</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="clients">
        <ClientsManager />
      </TabsContent>

      <TabsContent value="transactions">
        <TransactionsManager />
      </TabsContent>

      <TabsContent value="pending">
        <PendingPaymentsManager />
      </TabsContent>

      <TabsContent value="abandoned">
        <AbandonedCartsManager />
      </TabsContent>

      <TabsContent value="coupons">
        <CouponsManager />
      </TabsContent>

      <TabsContent value="pricing">
        <PlanPricingManager />
      </TabsContent>

      <TabsContent value="plans">
        <PlanAccessManager />
      </TabsContent>

      <TabsContent value="payments">
        <PaymentGatewayManager />
      </TabsContent>

      <TabsContent value="categories">
        <CategoriesManager />
      </TabsContent>

      <TabsContent value="content">
        <ContentManager />
      </TabsContent>

      <TabsContent value="password">
        <PasswordGenerator />
      </TabsContent>

      <TabsContent value="map-editor">
        <UnifiedMapEditor />
      </TabsContent>

      <TabsContent value="markers">
        <MarkerIconManager />
      </TabsContent>

      <TabsContent value="restaurants">
        <AdminRestaurantsPanel />
      </TabsContent>

      <TabsContent value="wait-times">
        <WaitTimeAnalytics />
      </TabsContent>

      <TabsContent value="ai-knowledge">
        <AIKnowledgeBaseManager />
      </TabsContent>
    </Tabs>
  );
}
