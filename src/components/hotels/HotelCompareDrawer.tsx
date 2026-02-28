import { Hotel, categoryLabels } from '@/data/hotelsData';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Star, Bus, Car, Waves, UtensilsCrossed, PawPrint, Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotels: Hotel[];
  onRemove: (id: string) => void;
}

const YesNo = ({ value }: { value: boolean }) => (
  value ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
);

export function HotelCompareDrawer({ open, onOpenChange, hotels, onRemove }: Props) {
  const cheapest = hotels.length > 0
    ? hotels.reduce((a, b) => a.priceEstimate.avg < b.priceEstimate.avg ? a : b).id
    : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-lg">Comparar Hotéis</DrawerTitle>
          <DrawerDescription className="text-xs">Comparação lado a lado</DrawerDescription>
        </DrawerHeader>

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-xs min-w-[500px]">
            <thead>
              <tr>
                <th className="text-left p-2 text-muted-foreground font-medium w-32"></th>
                {hotels.map((h) => (
                  <th key={h.id} className={cn("p-2 text-center", h.id === cheapest && "bg-green-50 dark:bg-green-950/20 rounded-t-lg")}>
                    <div className="space-y-1">
                      <img src={h.imageUrl} alt={h.name} className="w-full h-20 object-cover rounded-lg" />
                      <p className="font-bold text-foreground text-[11px] leading-tight">{h.name}</p>
                      <Button size="icon-sm" variant="ghost" onClick={() => onRemove(h.id)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <Row label="Categoria">{hotels.map(h => <td key={h.id} className={cn("p-2 text-center", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}>{categoryLabels[h.category]}</td>)}</Row>
              <Row label="Estrelas">{hotels.map(h => <td key={h.id} className={cn("p-2 text-center", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}>{'⭐'.repeat(Math.floor(h.stars))}</td>)}</Row>
              <Row label="Disney">{hotels.map(h => <td key={h.id} className={cn("p-2 text-center", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}>{h.distanceToDisney}</td>)}</Row>
              <Row label="Universal">{hotels.map(h => <td key={h.id} className={cn("p-2 text-center", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}>{h.distanceToUniversal}</td>)}</Row>
              <Row label="Preço médio">{hotels.map(h => <td key={h.id} className={cn("p-2 text-center font-bold", h.id === cheapest ? "text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400" : "text-foreground")}>US$ {h.priceEstimate.avg}</td>)}</Row>
              <Row label="Faixa">{hotels.map(h => <td key={h.id} className={cn("p-2 text-center text-muted-foreground", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}>${h.priceEstimate.min}–${h.priceEstimate.max}</td>)}</Row>
              <Row label="On-Site">{hotels.map(h => <td key={h.id} className={cn("p-2", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}><YesNo value={h.isOnSite} /></td>)}</Row>
              <Row label="Shuttle">{hotels.map(h => <td key={h.id} className={cn("p-2", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}><YesNo value={h.amenities.shuttle} /></td>)}</Row>
              <Row label="Estac. grátis">{hotels.map(h => <td key={h.id} className={cn("p-2", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}><YesNo value={h.amenities.freeParking} /></td>)}</Row>
              <Row label="Piscina">{hotels.map(h => <td key={h.id} className={cn("p-2", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}><YesNo value={h.amenities.pool} /></td>)}</Row>
              <Row label="Restaurante">{hotels.map(h => <td key={h.id} className={cn("p-2", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}><YesNo value={h.amenities.restaurant} /></td>)}</Row>
              <Row label="Pet Friendly">{hotels.map(h => <td key={h.id} className={cn("p-2", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}><YesNo value={h.amenities.petFriendly} /></td>)}</Row>
              <Row label="Spa">{hotels.map(h => <td key={h.id} className={cn("p-2", h.id === cheapest && "bg-green-50 dark:bg-green-950/20")}><YesNo value={h.amenities.spa} /></td>)}</Row>
            </tbody>
          </table>
        </div>

        <div className="px-4 pb-4 flex items-center gap-2 text-[10px] text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Estimativas baseadas em pesquisa de mercado 2024/2025. Confirme o preço real antes de reservar.</span>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="p-2 text-muted-foreground font-medium whitespace-nowrap">{label}</td>
      {children}
    </tr>
  );
}
