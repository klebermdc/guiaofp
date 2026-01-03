import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileVideo, Settings } from 'lucide-react';
import { ContentManager } from './ContentManager';
import { ClientsManager } from './ClientsManager';

export function AdminTabs() {
  return (
    <Tabs defaultValue="clients" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
        <TabsTrigger value="clients" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Clientes</span>
        </TabsTrigger>
        <TabsTrigger value="content" className="flex items-center gap-2">
          <FileVideo className="h-4 w-4" />
          <span className="hidden sm:inline">Conteúdos</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="clients">
        <ClientsManager />
      </TabsContent>

      <TabsContent value="content">
        <ContentManager />
      </TabsContent>
    </Tabs>
  );
}
