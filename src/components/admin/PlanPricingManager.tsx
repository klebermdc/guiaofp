import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { DollarSign, Save, Loader2 } from 'lucide-react';

interface PlanPricing {
  id: string;
  plan_key: string;
  plan_name: string;
  subtitle: string | null;
  price_cents: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export function PlanPricingManager() {
  const queryClient = useQueryClient();
  const [editingPlans, setEditingPlans] = useState<Record<string, PlanPricing>>({});

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plan-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_pricing')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as PlanPricing[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (plan: PlanPricing) => {
      const { error } = await supabase
        .from('plan_pricing')
        .update({
          plan_name: plan.plan_name,
          subtitle: plan.subtitle,
          price_cents: plan.price_cents,
          features: plan.features,
          is_active: plan.is_active,
        })
        .eq('id', plan.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-pricing'] });
      toast.success('Plano atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar plano');
    },
  });

  const handleEdit = (plan: PlanPricing) => {
    setEditingPlans(prev => ({
      ...prev,
      [plan.id]: { ...plan }
    }));
  };

  const handleChange = (planId: string, field: keyof PlanPricing, value: unknown) => {
    setEditingPlans(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [field]: value
      }
    }));
  };

  const handleFeaturesChange = (planId: string, featuresText: string) => {
    const features = featuresText.split('\n').filter(f => f.trim());
    handleChange(planId, 'features', features);
  };

  const handleSave = (planId: string) => {
    const plan = editingPlans[planId];
    if (plan) {
      updateMutation.mutate(plan);
      setEditingPlans(prev => {
        const newState = { ...prev };
        delete newState[planId];
        return newState;
      });
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Preços dos Planos</h3>
          <p className="text-sm text-muted-foreground">Configure os valores e benefícios de cada plano</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans?.map((plan) => {
          const isEditing = !!editingPlans[plan.id];
          const currentPlan = isEditing ? editingPlans[plan.id] : plan;

          return (
            <Card key={plan.id} className={plan.plan_key === 'premium' ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {plan.plan_key === 'premium' && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          POPULAR
                        </span>
                      )}
                      {currentPlan.plan_name}
                    </CardTitle>
                    <CardDescription>{currentPlan.subtitle}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(currentPlan.price_cents)}
                    </div>
                    <div className="text-xs text-muted-foreground">único</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>Nome do Plano</Label>
                      <Input
                        value={currentPlan.plan_name}
                        onChange={(e) => handleChange(plan.id, 'plan_name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Subtítulo</Label>
                      <Input
                        value={currentPlan.subtitle || ''}
                        onChange={(e) => handleChange(plan.id, 'subtitle', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço (em centavos)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={currentPlan.price_cents}
                          onChange={(e) => handleChange(plan.id, 'price_cents', parseInt(e.target.value) || 0)}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          = {formatPrice(currentPlan.price_cents)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Benefícios (um por linha)</Label>
                      <Textarea
                        rows={6}
                        value={currentPlan.features.join('\n')}
                        onChange={(e) => handleFeaturesChange(plan.id, e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={currentPlan.is_active}
                          onCheckedChange={(checked) => handleChange(plan.id, 'is_active', checked)}
                        />
                        <Label>Ativo</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPlans(prev => {
                              const newState = { ...prev };
                              delete newState[plan.id];
                              return newState;
                            });
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(plan.id)}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-1" />
                          )}
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Benefícios</Label>
                      <ul className="text-sm space-y-1">
                        {currentPlan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${plan.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-sm text-muted-foreground">
                          {plan.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                        Editar
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
