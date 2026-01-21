import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesManager } from './CategoriesManager';
import { Users, FileVideo, FolderOpen, KeyRound, Settings } from 'lucide-react';
import { ContentManager } from './ContentManager';
import { ClientsManager } from './ClientsManager';
import { PasswordGenerator } from './PasswordGenerator';
import { PlanAccessManager } from './PlanAccessManager';

export function AdminTabs() {
  return (
    <Tabs defaultValue="clients" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
        <TabsTrigger value="clients" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Clientes</span>
        </TabsTrigger>
        <TabsTrigger value="plans" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Planos</span>
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
      </TabsList>

      <TabsContent value="clients">
        <ClientsManager />
      </TabsContent>

      <TabsContent value="plans">
        <PlanAccessManager />
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
    </Tabs>
  );
}
