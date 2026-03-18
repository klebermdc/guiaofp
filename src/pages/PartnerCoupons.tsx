import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Ticket, 
  MapPin, 
  ExternalLink, 
  Calendar, 
  Copy, 
  Check,
  Search,
  UtensilsCrossed,
  ShoppingBag,
  Sparkles,
  Car,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface PartnerCoupon {
  id: string;
  title: string;
  description: string | null;
  coupon_code: string | null;
  partner_name: string;
  partner_logo_url: string | null;
  location: string | null;
  address: string | null;
  website_url: string | null;
  discount_value: string;
  category: string | null;
  valid_until: string | null;
}

const CATEGORY_ICONS: Record<string, typeof UtensilsCrossed> = {
  alimentacao: UtensilsCrossed,
  compras: ShoppingBag,
  entretenimento: Sparkles,
  transporte: Car,
  geral: Ticket,
};

const CATEGORY_LABELS: Record<string, string> = {
  alimentacao: 'Alimentação',
  compras: 'Compras',
  entretenimento: 'Entretenimento',
  transporte: 'Transporte',
  geral: 'Geral',
};

export default function PartnerCoupons() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['partner-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_coupons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as PartnerCoupon[];
    },
  });

  const handleCopyCode = (couponId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(couponId);
    toast.success('Código copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCoupons = coupons?.filter((coupon) => {
    const matchesSearch = 
      coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.partner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || coupon.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(coupons?.map(c => c.category).filter(Boolean))];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Cupons de Parceiros</h1>
              <p className="text-sm text-muted-foreground">
                Descontos exclusivos para usar durante sua viagem
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Badge>
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat || 'geral'] || Ticket;
              return (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => setSelectedCategory(cat || null)}
                >
                  <Icon className="h-3 w-3" />
                  {CATEGORY_LABELS[cat || 'geral'] || cat}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!filteredCoupons || filteredCoupons.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-secondary" />
            </div>
            <Badge className="mb-3 bg-secondary/20 text-secondary border-secondary/30">Em breve</Badge>
            <h3 className="text-lg font-medium mb-1">Novos cupons a caminho!</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Estamos fechando parcerias exclusivas para você economizar na sua viagem. Volte em breve!
            </p>
          </div>
        )}

        {/* Coupons Grid */}
        <div className="grid gap-4">
          {filteredCoupons?.map((coupon) => {
            const CategoryIcon = CATEGORY_ICONS[coupon.category || 'geral'] || Ticket;
            const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
            
            return (
              <Card 
                key={coupon.id} 
                className={`overflow-hidden ${isExpired ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {coupon.partner_logo_url ? (
                        <img
                          src={coupon.partner_logo_url}
                          alt={coupon.partner_name}
                          className="w-16 h-16 rounded-lg object-cover bg-muted"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CategoryIcon className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-semibold text-base leading-tight">{coupon.title}</h3>
                          <p className="text-sm text-muted-foreground">{coupon.partner_name}</p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0 text-primary font-bold">
                          {coupon.discount_value}
                        </Badge>
                      </div>

                      {coupon.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {coupon.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                        {coupon.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {coupon.location}
                          </span>
                        )}
                        {coupon.valid_until && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Válido até {format(new Date(coupon.valid_until), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {coupon.coupon_code && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyCode(coupon.id, coupon.coupon_code!)}
                            className="gap-1"
                          >
                            {copiedId === coupon.id ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                {coupon.coupon_code}
                              </>
                            )}
                          </Button>
                        )}
                        {coupon.website_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <a href={coupon.website_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Site
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
