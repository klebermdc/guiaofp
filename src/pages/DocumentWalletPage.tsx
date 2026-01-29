import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentWallet } from '@/components/dashboard/DocumentWallet';
import { SEO } from '@/components/SEO';

const DocumentWalletPage = () => {
  return (
    <AppLayout>
      <SEO 
        title="Carteira de Documentos | Orlando Fast Pass"
        description="Sua carteira virtual de documentos de viagem. Gerencie vouchers, passagens e ingressos em um só lugar."
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Carteira de Documentos
          </h1>
          <p className="text-muted-foreground">
            Organize todos os seus documentos de viagem em um só lugar. Adicione vouchers de hotel, passagens aéreas, ingressos de parques e muito mais.
          </p>
        </div>
        
        <DocumentWallet />
      </div>
    </AppLayout>
  );
};

export default DocumentWalletPage;
