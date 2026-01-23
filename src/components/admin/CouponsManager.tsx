import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Tag, Percent, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount_cents: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  applicable_plans: string[];
}

const initialFormState = {
  code: '',
  description: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: 10,
  min_amount_cents: 0,
  max_uses: null as number | null,
  valid_from: new Date().toISOString().split('T')[0],
  valid_until: '',
  is_active: true,
  applicable_plans: [] as string[],
};

export function CouponsManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['discount-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        code: data.code.toUpperCase().trim(),
        description: data.description || null,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_amount_cents: data.min_amount_cents,
        max_uses: data.max_uses || null,
        valid_from: data.valid_from ? new Date(data.valid_from).toISOString() : new Date().toISOString(),
        valid_until: data.valid_until ? new Date(data.valid_until).toISOString() : null,
        is_active: data.is_active,
        applicable_plans: data.applicable_plans,
      };

      if (data.id) {
        const { error } = await supabase
          .from('discount_coupons')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('discount_coupons')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-coupons'] });
      toast.success(editingCoupon ? 'Cupom atualizado!' : 'Cupom criado!');
      handleCloseDialog();
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate')) {
        toast.error('Já existe um cupom com este código');
      } else {
        toast.error('Erro ao salvar cupom');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('discount_coupons')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-coupons'] });
      toast.success('Cupom excluído!');
    },
    onError: () => {
      toast.error('Erro ao excluir cupom');
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCoupon(null);
    setFormData(initialFormState);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_amount_cents: coupon.min_amount_cents,
      max_uses: coupon.max_uses,
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until?.split('T')[0] || '',
      is_active: coupon.is_active,
      applicable_plans: coupon.applicable_plans || [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Código do cupom é obrigatório');
      return;
    }
    if (formData.discount_value <= 0) {
      toast.error('Valor do desconto deve ser maior que zero');
      return;
    }
    saveMutation.mutate({ ...formData, id: editingCoupon?.id });
  };

  const formatDiscountValue = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    }
    return `R$ ${(coupon.discount_value / 100).toFixed(2)}`;
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.valid_until) return false;
    return new Date(coupon.valid_until) < new Date();
  };

  const isMaxUsesReached = (coupon: Coupon) => {
    if (!coupon.max_uses) return false;
    return coupon.current_uses >= coupon.max_uses;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Cupons de Desconto</h2>
          <p className="text-sm text-muted-foreground">Gerencie cupons promocionais</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCoupon(null); setFormData(initialFormState); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Editar Cupom' : 'Criar Cupom'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código do Cupom *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="EX: DESCONTO10"
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição interna"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Desconto</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') =>
                      setFormData({ ...formData, discount_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Valor {formData.discount_type === 'percentage' ? '(%)' : '(centavos)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    min="1"
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Válido a partir de</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_until">Válido até (opcional)</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_uses">Limite de usos (opcional)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  value={formData.max_uses || ''}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Ilimitado"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Cupom ativo</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCoupon ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!coupons?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum cupom cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className={!coupon.is_active || isExpired(coupon) || isMaxUsesReached(coupon) ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-mono">{coupon.code}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Excluir este cupom?')) {
                          deleteMutation.mutate(coupon.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {coupon.discount_type === 'percentage' ? (
                    <Percent className="h-5 w-5 text-primary" />
                  ) : (
                    <DollarSign className="h-5 w-5 text-primary" />
                  )}
                  <span className="text-2xl font-bold">{formatDiscountValue(coupon)}</span>
                </div>

                {coupon.description && (
                  <p className="text-sm text-muted-foreground">{coupon.description}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {!coupon.is_active && <Badge variant="secondary">Inativo</Badge>}
                  {isExpired(coupon) && <Badge variant="destructive">Expirado</Badge>}
                  {isMaxUsesReached(coupon) && <Badge variant="destructive">Esgotado</Badge>}
                  {coupon.is_active && !isExpired(coupon) && !isMaxUsesReached(coupon) && (
                    <Badge className="bg-green-500">Ativo</Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Usos: {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ' (ilimitado)'}</p>
                  {coupon.valid_until && (
                    <p>Expira: {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}