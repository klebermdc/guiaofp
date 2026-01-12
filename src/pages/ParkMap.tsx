import { MapPin, Construction } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';

export default function ParkMap() {
  return (
    <AppLayout>
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <MapPin className="w-16 h-16 text-muted-foreground/50" />
                <Construction className="w-8 h-8 text-amber-500 absolute -bottom-1 -right-1" />
              </div>
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Mapa em Desenvolvimento
            </h2>
            <p className="text-muted-foreground text-sm">
              Esta funcionalidade está sendo aprimorada para oferecer uma melhor experiência.
              Em breve você poderá visualizar o mapa interativo dos parques.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
