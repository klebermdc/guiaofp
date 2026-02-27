import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlanPricingData {
  id: string;
  plan_key: string;
  plan_name: string;
  subtitle: string | null;
  price_cents: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export function usePlanPricing() {
  return useQuery({
    queryKey: ['plan-pricing-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_pricing')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      const map: Record<string, PlanPricingData> = {};
      (data ?? []).forEach((p: any) => {
        map[p.plan_key] = {
          ...p,
          features: Array.isArray(p.features) ? p.features : [],
        };
      });
      return map;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

/** Helper: format cents to BRL display */
export function formatPriceBRL(cents: number) {
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  return { reais, centavos, formatted: `R$${reais},${centavos.toString().padStart(2, '0')}` };
}
