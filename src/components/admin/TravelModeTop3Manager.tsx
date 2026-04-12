// LEGACY: Uses Google Maps API. Migration to Mapbox pending.
import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Pencil, Trash2, Image, Sparkles, MapPin, Check, ChevronsUpDown, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { GOOGLE_MAPS_API_KEY } from '@/data/constants';

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
  restaurant_id: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  park_id: string | null;
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

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: 'hybrid',
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};

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
  restaurant_id: null as string | null,
};

// ─── Location Tab Component ───────────────────────────────────────────────────
function LocationTab({
  restaurantId,
  onRestaurantChange,
  restaurants,
}: {
  restaurantId: string | null;
  onRestaurantChange: (id: string | null) => void;
  restaurants: Restaurant[];
}) {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const [open, setOpen] = useState(false);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [isSavingCoords, setIsSavingCoords] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const selectedRestaurant = restaurants.find(r => r.id === restaurantId) ?? null;

  // When restaurant changes, center map on it
  const handleSelectRestaurant = useCallback((id: string) => {
    onRestaurantChange(id);
    setOpen(false);
    const r = restaurants.find(x => x.id === id);
    if (r?.latitude && r?.longitude) {
      const pos = { lat: r.latitude, lng: r.longitude };
      setMarkerPos(pos);
      mapRef.current?.panTo(pos);
      mapRef.current?.setZoom(18);
    } else {
      setMarkerPos(null);
    }
  }, [restaurants, onRestaurantChange]);

  // Initialize marker position from selected restaurant
  const initMarker = useCallback(() => {
    if (selectedRestaurant?.latitude && selectedRestaurant?.longitude && !markerPos) {
      setMarkerPos({ lat: selectedRestaurant.latitude, lng: selectedRestaurant.longitude });
    }
  }, [selectedRestaurant, markerPos]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    initMarker();
  }, [initMarker]);

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, []);

  const handleSaveCoords = async () => {
    if (!restaurantId || !markerPos) return;
    setIsSavingCoords(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ latitude: markerPos.lat, longitude: markerPos.lng })
        .eq('id', restaurantId);
      if (error) throw error;
      toast.success('Coordenadas salvas!');
    } catch (err) {
      toast.error('Erro: ' + (err as Error).message);
    } finally {
      setIsSavingCoords(false);
    }
  };

  const mapCenter = markerPos
    ?? (selectedRestaurant?.latitude && selectedRestaurant?.longitude
      ? { lat: selectedRestaurant.latitude, lng: selectedRestaurant.longitude }
      : { lat: 28.419, lng: -81.581 });

  return (
    <div className="space-y-4">
      {/* Restaurant picker */}
      <div className="space-y-1.5">
        <Label>Restaurante vinculado</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            >
              {selectedRestaurant ? selectedRestaurant.name : 'Selecionar restaurante...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar restaurante..." />
              <CommandList className="max-h-48">
                <CommandEmpty>Nenhum restaurante encontrado.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="none" onSelect={() => { onRestaurantChange(null); setOpen(false); setMarkerPos(null); }}>
                    <Check className={`mr-2 h-4 w-4 ${!restaurantId ? 'opacity-100' : 'opacity-0'}`} />
                    <span className="text-muted-foreground italic">Sem vínculo</span>
                  </CommandItem>
                  {restaurants.map(r => (
                    <CommandItem key={r.id} value={r.name} onSelect={() => handleSelectRestaurant(r.id)}>
                      <Check className={`mr-2 h-4 w-4 ${restaurantId === r.id ? 'opacity-100' : 'opacity-0'}`} />
                      <div className="flex items-center justify-between w-full">
                        <span>{r.name}</span>
                        {r.latitude && r.longitude
                          ? <MapPin className="h-3 w-3 text-green-500" />
                          : <MapPin className="h-3 w-3 text-red-400 opacity-50" />
                        }
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedRestaurant && !selectedRestaurant.latitude && (
          <p className="text-xs text-amber-600">⚠ Este restaurante não tem coordenadas. Clique no mapa para definir.</p>
        )}
      </div>

      {/* Map */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>
            {markerPos
              ? `Pin: ${markerPos.lat.toFixed(6)}, ${markerPos.lng.toFixed(6)}`
              : 'Arraste o pin para a posição correta'}
          </Label>
          {markerPos && restaurantId && (
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={handleSaveCoords} disabled={isSavingCoords}>
              <Navigation className="w-3 h-3" />
              {isSavingCoords ? 'Salvando...' : 'Salvar coords'}
            </Button>
          )}
        </div>

        {!isLoaded ? (
          <div className="h-64 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
            Carregando mapa...
          </div>
        ) : (
          <div className="h-64 rounded-lg overflow-hidden border">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={18}
              options={MAP_OPTIONS}
              onLoad={handleMapLoad}
              onClick={(e) => {
                if (!restaurantId) return;
                if (e.latLng) setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
              }}
            >
              {markerPos && (
                <Marker
                  position={markerPos}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                  title={selectedRestaurant?.name ?? 'Restaurante'}
                />
              )}
            </GoogleMap>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Arraste o pin ou clique no mapa para reposicionar. Clique em "Salvar coords" para aplicar.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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

  const { data: restaurants = [] } = useQuery({
    queryKey: ['admin-restaurants-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, latitude, longitude, park_id')
        .order('name');
      if (error) throw error;
      return data as Restaurant[];
    },
    staleTime: 60_000,
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
        restaurant_id: data.restaurant_id || null,
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
      restaurant_id: item.restaurant_id,
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

  const linkedRestaurant = (item: Top3Item) =>
    item.restaurant_id ? restaurants.find(r => r.id === item.restaurant_id) : null;

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
            <Tabs defaultValue="info" className="pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
                <TabsTrigger value="location" className="flex-1 gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Localização
                  {!form.restaurant_id && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── Info Tab ── */}
              <TabsContent value="info" className="space-y-4 mt-4">
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

                <div className="space-y-1.5">
                  <Label>Foto</Label>
                  <div className="flex items-center gap-3">
                    {form.image_url && (
                      <img src={form.image_url} alt="" className="w-14 h-14 rounded-lg object-cover border" />
                    )}
                    <div className="flex-1">
                      <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="URL ou envie abaixo" className="mb-2" />
                      <label className="cursor-pointer">
                        <Button variant="outline" size="sm" className="gap-1" asChild disabled={isUploading}>
                          <span><Image className="w-3 h-3" />{isUploading ? 'Enviando...' : 'Upload'}</span>
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
              </TabsContent>

              {/* ── Location Tab ── */}
              <TabsContent value="location" className="mt-4">
                <LocationTab
                  restaurantId={form.restaurant_id}
                  onRestaurantChange={(id) => setForm(f => ({ ...f, restaurant_id: id }))}
                  restaurants={restaurants}
                />
                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
                  <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
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
          {filtered.map(item => {
            const linked = linkedRestaurant(item);
            const hasCoords = linked?.latitude && linked?.longitude;
            return (
              <Card key={item.id} className={`relative ${!item.is_active ? 'opacity-50' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      ) : item.emoji}
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
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.park_name} • #{item.sort_order}</p>

                      {/* Location status */}
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className={`w-3 h-3 ${hasCoords ? 'text-green-500' : item.restaurant_id ? 'text-amber-500' : 'text-red-400'}`} />
                        <span className="text-[10px] text-muted-foreground truncate">
                          {hasCoords
                            ? linked?.name
                            : item.restaurant_id
                              ? 'Vinculado, sem coords'
                              : 'Sem localização'}
                        </span>
                      </div>

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
                          onClick={() => { if (confirm('Remover este item?')) deleteMutation.mutate(item.id); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
