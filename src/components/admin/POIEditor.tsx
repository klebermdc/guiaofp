import { useState, useRef, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { MapPin, Save, X, Search, Plus, Trash2, Loader2, Clock, UtensilsCrossed, AlertTriangle, CalendarClock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCib6OEwxnVUEan4mgc3YlITa4LMwahmbo';

type LatLng = { lat: number; lng: number };
type POIType = 'restroom' | 'restaurant' | 'shop' | 'firstaid' | 'show';

interface Park {
  id: string;
  name: string;
  center: LatLng;
  zoom: number;
}

interface POIItem {
  id: string;
  title: string;
  category_id: string;
  latitude: number | null;
  longitude: number | null;
  icon: string; // stores POI type
  schedule: string | null;
  cuisine_type: string | null;
  requires_reservation: boolean | null;
  has_warning: boolean | null;
  warning_text: string | null;
  menu_url: string | null;
}

const PARKS: Park[] = [
  { id: 'dd6b79b8-d934-4e15-8967-1f1af1911fef', name: 'Magic Kingdom', center: { lat: 28.4177, lng: -81.5812 }, zoom: 17 },
  { id: '03e87b8e-7467-4121-971b-91826dd55bec', name: 'EPCOT', center: { lat: 28.3747, lng: -81.5494 }, zoom: 16 },
  { id: 'ffdca010-b62c-40cc-98ee-37a853da037d', name: 'Hollywood Studios', center: { lat: 28.3575, lng: -81.5583 }, zoom: 17 },
  { id: '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205', name: 'Animal Kingdom', center: { lat: 28.3580, lng: -81.5900 }, zoom: 16 },
  { id: 'c63c98b3-1cef-4d90-8142-0a68331907e1', name: 'Universal Studios', center: { lat: 28.4752, lng: -81.4683 }, zoom: 17 },
  { id: '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148', name: 'Islands of Adventure', center: { lat: 28.4711, lng: -81.4710 }, zoom: 17 },
  { id: 'ba562b14-26bf-4b12-a13d-2aa7df43297e', name: 'Epic Universe', center: { lat: 28.4720, lng: -81.4450 }, zoom: 16 },
];

const POI_CONFIG: Record<POIType, { label: string; color: string; emoji: string }> = {
  restroom: { label: 'Banheiro', color: '#3B82F6', emoji: '🚻' },
  restaurant: { label: 'Restaurante', color: '#F97316', emoji: '🍽️' },
  shop: { label: 'Loja', color: '#A855F7', emoji: '🛍️' },
  firstaid: { label: 'Primeiros Socorros', color: '#EF4444', emoji: '🏥' },
  show: { label: 'Show', color: '#EC4899', emoji: '🎭' },
};

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const mapOptions: google.maps.MapOptions = {
  mapTypeId: 'satellite',
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
};

export function POIEditor() {
  const queryClient = useQueryClient();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedPark, setSelectedPark] = useState(PARKS[0]);
  const [selectedPOI, setSelectedPOI] = useState<POIItem | null>(null);
  const [pendingCoords, setPendingCoords] = useState<LatLng | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [filterType, setFilterType] = useState<POIType | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPOI, setNewPOI] = useState({ name: '', type: 'restroom' as POIType });
  const [editingSchedule, setEditingSchedule] = useState<{ id: string; schedule: string } | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<{
    id: string;
    cuisineType: string;
    requiresReservation: boolean;
    hasWarning: boolean;
    warningText: string;
    menuUrl: string;
  } | null>(null);

  // Fetch all POIs for selected park
  const { data: pois = [], isLoading } = useQuery({
    queryKey: ['admin-pois', selectedPark.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, category_id, latitude, longitude, icon, schedule, cuisine_type, requires_reservation, has_warning, warning_text, menu_url')
        .eq('category_id', selectedPark.id)
        .eq('type', 'poi')
        .order('title');

      if (error) throw error;
      return data as POIItem[];
    },
  });

  // Create POI mutation
  const createMutation = useMutation({
    mutationFn: async ({ name, type, parkId }: { name: string; type: POIType; parkId: string }) => {
      const { error } = await supabase
        .from('content_items')
        .insert({
          title: name,
          type: 'poi',
          icon: type,
          category_id: parkId,
          is_published: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pois'] });
      toast.success('POI criado com sucesso!');
      setIsAddDialogOpen(false);
      setNewPOI({ name: '', type: 'restroom' });
    },
    onError: (error) => {
      console.error('Error creating POI:', error);
      toast.error('Erro ao criar POI');
    },
  });

  // Save coordinates mutation
  const saveMutation = useMutation({
    mutationFn: async ({ id, lat, lng }: { id: string; lat: number; lng: number }) => {
      const { error } = await supabase
        .from('content_items')
        .update({ latitude: lat, longitude: lng })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pois'] });
      queryClient.invalidateQueries({ queryKey: ['park-pois'] });
      toast.success('Coordenadas salvas!');
      setPendingCoords(null);
      setSelectedPOI(null);
    },
    onError: (error) => {
      console.error('Error saving coordinates:', error);
      toast.error('Erro ao salvar coordenadas');
    },
  });

  // Delete POI mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pois'] });
      toast.success('POI excluído!');
      setSelectedPOI(null);
    },
    onError: (error) => {
      console.error('Error deleting POI:', error);
      toast.error('Erro ao excluir POI');
    },
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, schedule }: { id: string; schedule: string }) => {
      const { error } = await supabase
        .from('content_items')
        .update({ schedule: schedule || null })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pois'] });
      queryClient.invalidateQueries({ queryKey: ['park-pois'] });
      toast.success('Horário salvo!');
      setEditingSchedule(null);
    },
    onError: (error) => {
      console.error('Error saving schedule:', error);
      toast.error('Erro ao salvar horário');
    },
  });

  // Update restaurant metadata mutation
  const updateRestaurantMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      cuisineType: string;
      requiresReservation: boolean;
      hasWarning: boolean;
      warningText: string;
      menuUrl: string;
    }) => {
      const { error } = await supabase
        .from('content_items')
        .update({
          cuisine_type: data.cuisineType || null,
          requires_reservation: data.requiresReservation,
          has_warning: data.hasWarning,
          warning_text: data.warningText || null,
          menu_url: data.menuUrl || null,
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pois'] });
      queryClient.invalidateQueries({ queryKey: ['park-pois'] });
      toast.success('Restaurante atualizado!');
      setEditingRestaurant(null);
    },
    onError: (error) => {
      console.error('Error saving restaurant data:', error);
      toast.error('Erro ao salvar dados do restaurante');
    },
  });

  // Filter POIs
  const filteredPOIs = pois.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || p.icon === filterType;
    return matchesSearch && matchesType;
  });

  // Count by type
  const countByType = (type: POIType) => pois.filter(p => p.icon === type).length;

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!selectedPOI) {
      toast.error('Selecione um POI primeiro');
      return;
    }
    
    if (e.latLng) {
      const coords = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setPendingCoords(coords);
    }
  }, [selectedPOI]);

  const handleMarkerDragEnd = useCallback((poi: POIItem, e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      saveMutation.mutate({
        id: poi.id,
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, [saveMutation]);

  const handleSaveCoords = () => {
    if (!selectedPOI || !pendingCoords) return;
    
    saveMutation.mutate({
      id: selectedPOI.id,
      lat: pendingCoords.lat,
      lng: pendingCoords.lng,
    });
  };

  const handleSelectPOI = (poi: POIItem) => {
    setSelectedPOI(poi);
    setPendingCoords(null);
    
    if (poi.latitude && poi.longitude && mapRef.current) {
      mapRef.current.panTo({ lat: Number(poi.latitude), lng: Number(poi.longitude) });
      mapRef.current.setZoom(19);
    }
  };

  const handleParkChange = (parkId: string) => {
    const park = PARKS.find(p => p.id === parkId);
    if (park) {
      setSelectedPark(park);
      setSelectedPOI(null);
      setPendingCoords(null);
      setSearchTerm('');
    }
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
  };

  const getMarkerIcon = (poi: POIItem, isSelected: boolean, isPending: boolean): google.maps.Symbol | undefined => {
    if (typeof google === 'undefined' || !google.maps?.SymbolPath) return undefined;

    const poiType = poi.icon as POIType;
    const config = POI_CONFIG[poiType] || POI_CONFIG.restroom;

    if (isPending) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: config.color,
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 4,
        scale: 16,
      };
    }

    if (isSelected) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: config.color,
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
        scale: 14,
      };
    }

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: config.color,
      fillOpacity: poi.latitude && poi.longitude ? 0.9 : 0.4,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 10,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Editor de POIs
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie banheiros, restaurantes, lojas e primeiros socorros
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedPark.id} onValueChange={handleParkChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o parque" />
            </SelectTrigger>
            <SelectContent>
              {PARKS.map((park) => (
                <SelectItem key={park.id} value={park.id}>
                  {park.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Novo POI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar POI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Ex: Banheiro - Main Street"
                    value={newPOI.name}
                    onChange={(e) => setNewPOI({ ...newPOI, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={newPOI.type} onValueChange={(v) => setNewPOI({ ...newPOI, type: v as POIType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(POI_CONFIG) as POIType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {POI_CONFIG[type].emoji} {POI_CONFIG[type].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate({ name: newPOI.name, type: newPOI.type, parkId: selectedPark.id })}
                  disabled={!newPOI.name || createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Criar POI
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats by type */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(POI_CONFIG) as POIType[]).map((type) => {
          const config = POI_CONFIG[type];
          const count = countByType(type);
          return (
            <Badge
              key={type}
              variant={filterType === type ? 'default' : 'secondary'}
              className="cursor-pointer text-sm"
              style={filterType === type ? { backgroundColor: config.color } : {}}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
            >
              {config.emoji} {count}
            </Badge>
          );
        })}
        <Badge
          variant={filterType === 'all' ? 'default' : 'outline'}
          className="cursor-pointer text-sm"
          onClick={() => setFilterType('all')}
        >
          Todos: {pois.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* POI List */}
        <Card className="lg:col-span-1">
          <CardHeader className="py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar POI..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredPOIs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum POI encontrado</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredPOIs.map((poi) => {
                    const poiType = poi.icon as POIType;
                    const config = POI_CONFIG[poiType] || POI_CONFIG.restroom;
                    const hasCoords = poi.latitude && poi.longitude;
                    const isSelected = selectedPOI?.id === poi.id;
                    const isShowType = poiType === 'show';
                    const isEditingThisSchedule = editingSchedule?.id === poi.id;

                    return (
                      <div
                        key={poi.id}
                        className={`p-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleSelectPOI(poi)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-lg">{config.emoji}</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{poi.title}</p>
                              <p className="text-xs text-muted-foreground">{config.label}</p>
                              {isShowType && (
                                <div className="mt-1">
                                  {isEditingThisSchedule ? (
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <Input
                                        placeholder="Ex: 10:00, 14:00, 18:00"
                                        className="h-6 text-xs"
                                        value={editingSchedule.schedule}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, schedule: e.target.value })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            updateScheduleMutation.mutate({ id: poi.id, schedule: editingSchedule.schedule });
                                          }
                                          if (e.key === 'Escape') {
                                            setEditingSchedule(null);
                                          }
                                        }}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => updateScheduleMutation.mutate({ id: poi.id, schedule: editingSchedule.schedule })}
                                        disabled={updateScheduleMutation.isPending}
                                      >
                                        {updateScheduleMutation.isPending ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <Save className="w-3 h-3" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => setEditingSchedule(null)}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div
                                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSchedule({ id: poi.id, schedule: poi.schedule || '' });
                                      }}
                                    >
                                      <Clock className="w-3 h-3" />
                                      {poi.schedule ? (
                                        <span>{poi.schedule}</span>
                                      ) : (
                                        <span className="italic opacity-60">+ Adicionar horário</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Restaurant metadata */}
                              {poiType === 'restaurant' && (
                                <div className="mt-1.5 space-y-1">
                                  {editingRestaurant?.id === poi.id ? (
                                    <div className="space-y-2 p-2 bg-muted/30 rounded" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center gap-2">
                                        <UtensilsCrossed className="w-3 h-3 text-muted-foreground" />
                                        <Input
                                          placeholder="Estilo (ex: Americana, Italiana)"
                                          className="h-6 text-xs flex-1"
                                          value={editingRestaurant.cuisineType}
                                          onChange={(e) => setEditingRestaurant({ ...editingRestaurant, cuisineType: e.target.value })}
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                        <Input
                                          placeholder="URL do cardápio"
                                          className="h-6 text-xs flex-1"
                                          value={editingRestaurant.menuUrl}
                                          onChange={(e) => setEditingRestaurant({ ...editingRestaurant, menuUrl: e.target.value })}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <CalendarClock className="w-3 h-3 text-amber-500" />
                                          <span className="text-xs">Precisa reserva</span>
                                        </div>
                                        <Switch
                                          checked={editingRestaurant.requiresReservation}
                                          onCheckedChange={(v) => setEditingRestaurant({ ...editingRestaurant, requiresReservation: v })}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <AlertTriangle className="w-3 h-3 text-red-500" />
                                          <span className="text-xs">Atenção especial</span>
                                        </div>
                                        <Switch
                                          checked={editingRestaurant.hasWarning}
                                          onCheckedChange={(v) => setEditingRestaurant({ ...editingRestaurant, hasWarning: v })}
                                        />
                                      </div>
                                      {editingRestaurant.hasWarning && (
                                        <Input
                                          placeholder="Texto do aviso"
                                          className="h-6 text-xs"
                                          value={editingRestaurant.warningText}
                                          onChange={(e) => setEditingRestaurant({ ...editingRestaurant, warningText: e.target.value })}
                                        />
                                      )}
                                      <div className="flex justify-end gap-1 pt-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-xs"
                                          onClick={() => setEditingRestaurant(null)}
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="h-6 text-xs"
                                          onClick={() => updateRestaurantMutation.mutate(editingRestaurant)}
                                          disabled={updateRestaurantMutation.isPending}
                                        >
                                          {updateRestaurantMutation.isPending ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                          ) : (
                                            'Salvar'
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      className="flex flex-wrap items-center gap-1 text-[10px] cursor-pointer hover:opacity-80"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingRestaurant({
                                          id: poi.id,
                                          cuisineType: poi.cuisine_type || '',
                                          requiresReservation: poi.requires_reservation || false,
                                          hasWarning: poi.has_warning || false,
                                          warningText: poi.warning_text || '',
                                          menuUrl: poi.menu_url || '',
                                        });
                                      }}
                                    >
                                      {poi.cuisine_type && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                          {poi.cuisine_type}
                                        </Badge>
                                      )}
                                      {poi.requires_reservation && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-500/50 text-amber-500">
                                          <CalendarClock className="w-2.5 h-2.5 mr-0.5" />
                                          Reserva
                                        </Badge>
                                      )}
                                      {poi.has_warning && (
                                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                                          ⚠️
                                        </Badge>
                                      )}
                                      {!poi.cuisine_type && !poi.requires_reservation && !poi.has_warning && (
                                        <span className="text-muted-foreground italic opacity-60">+ Editar detalhes</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${hasCoords ? 'bg-green-500' : 'bg-red-500'}`}
                              title={hasCoords ? 'Com coordenadas' : 'Sem coordenadas'}
                            />
                            {isSelected && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Excluir este POI?')) {
                                    deleteMutation.mutate(poi.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0 relative">
            {/* Pending coords action bar */}
            {pendingCoords && selectedPOI && (
              <div className="absolute top-2 left-2 right-2 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center justify-between gap-2">
                <div className="text-sm">
                  <p className="font-medium">{selectedPOI.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {pendingCoords.lat.toFixed(6)}, {pendingCoords.lng.toFixed(6)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPendingCoords(null)}>
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveCoords} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    Salvar
                  </Button>
                </div>
              </div>
            )}

            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={selectedPark.center}
                zoom={selectedPark.zoom}
                options={mapOptions}
                onLoad={onMapLoad}
                onClick={handleMapClick}
              >
                {isMapLoaded && pois.map((poi) => {
                  if (!poi.latitude || !poi.longitude) return null;

                  const isSelected = selectedPOI?.id === poi.id;
                  const isPending = isSelected && pendingCoords !== null;

                  return (
                    <Marker
                      key={poi.id}
                      position={isPending && pendingCoords ? pendingCoords : { lat: Number(poi.latitude), lng: Number(poi.longitude) }}
                      icon={getMarkerIcon(poi, isSelected, isPending)}
                      draggable={isSelected}
                      onClick={() => handleSelectPOI(poi)}
                      onDragEnd={(e) => handleMarkerDragEnd(poi, e)}
                      title={poi.title}
                    />
                  );
                })}

                {/* Show pending marker for POI without coords */}
                {isMapLoaded && selectedPOI && (!selectedPOI.latitude || !selectedPOI.longitude) && pendingCoords && (
                  <Marker
                    position={pendingCoords}
                    icon={getMarkerIcon(selectedPOI, true, true)}
                    title={selectedPOI.title}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardContent className="py-3">
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Como usar:</p>
              <ul className="text-muted-foreground text-xs mt-1 space-y-1">
                <li>• Clique em "Novo POI" para criar um ponto de interesse</li>
                <li>• Selecione um POI na lista e clique no mapa para definir sua localização</li>
                <li>• Arraste marcadores existentes para ajustar a posição</li>
                <li>• POIs com coordenadas aparecem com indicador verde</li>
                <li>• Para shows: clique no ícone <Clock className="w-3 h-3 inline" /> para adicionar horários (ex: "10:00, 14:00, 18:00")</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
