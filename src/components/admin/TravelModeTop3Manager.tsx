import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Image, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Top3Item {
  id: string;
  park_id: string;
  park_name: string;
  category: string;
  item_name: string;
  location: string;
  area: string;
  price: string | null;
  description: string;
  emoji: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const PARKS = [
  { id: 'dd6b79b8-d934-4e15-8967-1f1af1911fef', name: 'Magic Kingdom' },
  { id: '03e87b8e-7467-4121-971b-91826dd55bec', name: 'EPCOT' },
  { id: 'ffdca010-b62c-40cc-98ee-37a853da037d', name: 'Hollywood Studios' },
  { id: '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205', name: 'Animal Kingdom' },
  { id: 'c63c98b3-1cef-4d90-8142-0a68331907e1', name: 'Universal Studios' },
  { id: '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148', name: 'Islands of Adventure' },
];

const CATEGORIES = [
  { value: 'doces', label: '🍰 Doces' },
  { value: 'restaurantes', label: '🍽️ Restaurantes' },
  { value: 'snacks', label: '🧂 Snacks' },
];

const emptyForm = {
  park_id: '',
  park_name: '',
  category: 'doces',
  item_name: '',
  location: '',
  area: '',
  price: '',
  description: '',
  emoji: '🍽️',
  image_url: '',
  sort_order: 1,
  is_active: true,
};

export function TravelModeTop3Manager() {
  const queryClient = useQueryClient();
  const [filterPark, setFilterPark] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Top3Item | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isUploading, setIsUploading] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-travel-mode-top3'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_mode_top3')
        .select('*')
        .order('park_name')
        .order('category')
        .order('sort_order');
      if (error) throw error;
      return data as Top3Item[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form & { id?: string }) => {
      const payload = {
        park_id: data.park_id,
        park_name: data.park_name,
        category: data.category,
        item_name: data.item_name,
        location: data.location,
        area: data.area,
        price: data.price || null,
        description: data.description,
        emoji: data.emoji,
        image_url: data.image_url || null,
        sort_order: data.sort_order,
        is_active: data.is_active,
      };

      if (data.id) {
        const { error } = await supabase.from('travel_mode_top3').update(payload).eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('travel_mode_top3').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-travel-mode-top3'] });
      queryClient.invalidateQueries({ queryKey: ['travel-mode-top3'] });
      toast.success(editingItem ? 'Item atualizado!' : 'Item criado!');
      closeDialog();
    },
    onError: (err: Error) => {
      toast.error('Erro ao salvar: ' + err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('travel_mode_top3').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-travel-mode-top3'] });
      queryClient.invalidateQueries({ queryKey: ['travel-mode-top3'] });
      toast.success('Item removido!');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('travel_mode_top3').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-travel-mode-top3'] });
      queryClient.invalidateQueries({ queryKey: ['travel-mode-top3'] });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const openEdit = (item: Top3Item) => {
    setEditingItem(item);
    setForm({
      park_id: item.park_id,
      park_name: item.park_name,
      category: item.category,
      item_name: item.item_name,
      location: item.location,
      area: item.area,
      price: item.price || '',
      description: item.description,
      emoji: item.emoji,
      image_url: item.image_url || '',
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `top3/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('admin-content').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('admin-content').getPublicUrl(path);
      setForm(f => ({ ...f, image_url: urlData.publicUrl }));
      toast.success('Imagem enviada!');
    } catch (err) {
      toast.error('Erro no upload: ' + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.park_id || !form.item_name || !form.location || !form.description) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    saveMutation.mutate(editingItem ? { ...form, id: editingItem.id } : form);
  };

  const handleParkChange = (parkId: string) => {
    const park = PARKS.find(p => p.id === parkId);
    setForm(f => ({ ...f, park_id: parkId, park_name: park?.name || '' }));
  };

  const filtered = items.filter(i => {
    if (filterPark !== 'all' && i.park_id !== filterPark) return false;
    if (filterCategory !== 'all' && i.category !== filterCategory) return false;
    return true;
  });

  const getCategoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      doces: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
      restaurantes: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      snacks: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    };
    return colors[cat] || '';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Top 3 Modo Viagem
          </h2>
          <p className="text-sm text-muted-foreground">Gerencie as recomendações exibidas no mapa durante o Modo Viagem</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1" onClick={() => { setEditingItem(null); setForm(emptyForm); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Parque *</Label>
                  <Select value={form.park_id} onValueChange={handleParkChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {PARKS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Categoria *</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Nome do Item *</Label>
                <Input value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} placeholder="Ex: Dole Whip" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Local / Restaurante *</Label>
                  <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Ex: Aloha Isle" />
                </div>
                <div className="space-y-1.5">
                  <Label>Área *</Label>
                  <Input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Ex: Adventureland" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Emoji</Label>
                  <Input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🍦" />
                </div>
                <div className="space-y-1.5">
                  <Label>Preço</Label>
                  <Input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="US$ 7,29" />
                </div>
                <div className="space-y-1.5">
                  <Label>Ordem</Label>
                  <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Descrição *</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Breve descrição do item..." />
              </div>

              {/* Image upload */}
              <div className="space-y-1.5">
                <Label>Foto</Label>
                <div className="flex items-center gap-3">
                  {form.image_url && (
                    <img src={form.image_url} alt="" className="w-14 h-14 rounded-lg object-cover border" />
                  )}
                  <div className="flex-1">
                    <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="URL da imagem ou envie abaixo" className="mb-2" />
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" className="gap-1" asChild disabled={isUploading}>
                        <span>
                          <Image className="w-3 h-3" />
                          {isUploading ? 'Enviando...' : 'Upload'}
                        </span>
                      </Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>Ativo</Label>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
                <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterPark} onValueChange={setFilterPark}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar parque" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Parques</SelectItem>
            {PARKS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filtrar categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="self-center">{filtered.length} itens</Badge>
      </div>

      {/* Items grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(item => (
            <Card key={item.id} className={`relative ${!item.is_active ? 'opacity-50' : ''}`}>
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      item.emoji
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <p className="text-sm font-semibold truncate">{item.item_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.location} • {item.area}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${getCategoryBadge(item.category)}`}>
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{item.park_name} • #{item.sort_order}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={(v) => toggleActiveMutation.mutate({ id: item.id, is_active: v })}
                        className="scale-75"
                      />
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(item)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('Remover este item?')) deleteMutation.mutate(item.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
