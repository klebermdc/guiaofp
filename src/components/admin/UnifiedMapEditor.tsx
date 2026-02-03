import { useState, useRef, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { 
  MapPin, Save, X, Search, Plus, Trash2, Loader2, 
  CheckCircle2, AlertCircle, Clock, ExternalLink,
  Star, UtensilsCrossed, Navigation as NavIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PARKS, POI_CONFIG_ADMIN, GOOGLE_MAPS_API_KEY, getParksTableId, type POIType } from '@/data/constants';

type LatLng = { lat: number; lng: number };

type ItemType = 'attraction' | 'restaurant' | 'poi';

interface MapItem {
  id: string;
  title: string;
  category_id?: string;
  park_id?: string;
  latitude: number | null;
  longitude: number | null;
  itemType: ItemType;
  poiType?: string; // for POIs: restroom, shop, firstaid, show
  schedule?: string | null;
}

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

const ITEM_TYPE_CONFIG = {
  attraction: { label: 'Atrações', icon: Star, color: '#F59E0B' },
  restaurant: { label: 'Restaurantes', icon: UtensilsCrossed, color: '#F97316' },
  poi: { label: 'POIs', icon: NavIcon, color: '#6366F1' },
};

export function UnifiedMapEditor() {
  const queryClient = useQueryClient();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedPark, setSelectedPark] = useState(PARKS[0]);
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [pendingCoords, setPendingCoords] = useState<LatLng | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ItemType | 'all'>('all');
  const [poiFilter, setPoiFilter] = useState<POIType | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPOI, setNewPOI] = useState({ name: '', type: 'restroom' as POIType });
  const [editingSchedule, setEditingSchedule] = useState<{ id: string; schedule: string } | null>(null);

  // Fetch attractions for selected park
  const { data: attractions = [], isLoading: loadingAttractions } = useQuery({
    queryKey: ['unified-attractions', selectedPark.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, category_id, latitude, longitude, type, icon')
        .eq('category_id', selectedPark.id)
        .neq('type', 'poi')
        .order('title');

      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        category_id: item.category_id,
        latitude: item.latitude,
        longitude: item.longitude,
        itemType: 'attraction' as ItemType,
      }));
    },
  });

  // Fetch restaurants for selected park
  const { data: restaurants = [], isLoading: loadingRestaurants } = useQuery({
    queryKey: ['unified-restaurants', selectedPark.id],
    queryFn: async () => {
      const parksTableId = getParksTableId(selectedPark.id);
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, park_id, latitude, longitude')
        .eq('park_id', parksTableId)
        .order('name');

      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        title: item.name,
        park_id: item.park_id,
        latitude: item.latitude,
        longitude: item.longitude,
        itemType: 'restaurant' as ItemType,
      }));
    },
  });

  // Fetch POIs for selected park
  const { data: pois = [], isLoading: loadingPOIs } = useQuery({
    queryKey: ['unified-pois', selectedPark.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, category_id, latitude, longitude, icon, schedule')
        .eq('category_id', selectedPark.id)
        .eq('type', 'poi')
        .order('title');

      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        category_id: item.category_id,
        latitude: item.latitude,
        longitude: item.longitude,
        itemType: 'poi' as ItemType,
        poiType: item.icon,
        schedule: item.schedule,
      }));
    },
  });

  const isLoading = loadingAttractions || loadingRestaurants || loadingPOIs;

  // Combine all items
  const allItems: MapItem[] = [...attractions, ...restaurants, ...pois];

  // Filter items
  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || item.itemType === activeTab;
    const matchesPOIFilter = item.itemType !== 'poi' || poiFilter === 'all' || item.poiType === poiFilter;
    return matchesSearch && matchesTab && matchesPOIFilter;
  });

  // Stats
  const stats = {
    total: allItems.length,
    withCoords: allItems.filter(i => i.latitude && i.longitude).length,
    attractions: attractions.length,
    restaurants: restaurants.length,
    pois: pois.length,
  };

  // Save coordinates mutation
  const saveMutation = useMutation({
    mutationFn: async ({ id, lat, lng, itemType }: { id: string; lat: number; lng: number; itemType: ItemType }) => {
      if (itemType === 'restaurant') {
        const { error } = await supabase
          .from('restaurants')
          .update({ latitude: lat, longitude: lng })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('content_items')
          .update({ latitude: lat, longitude: lng })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-attractions'] });
      queryClient.invalidateQueries({ queryKey: ['unified-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['unified-pois'] });
      queryClient.invalidateQueries({ queryKey: ['park-attractions'] });
      queryClient.invalidateQueries({ queryKey: ['park-pois'] });
      queryClient.invalidateQueries({ queryKey: ['park-restaurants'] });
      toast.success('Coordenadas salvas!');
      setPendingCoords(null);
      setSelectedItem(null);
    },
    onError: (error) => {
      console.error('Error saving coordinates:', error);
      toast.error('Erro ao salvar coordenadas');
    },
  });

  // Create POI mutation
  const createPOIMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['unified-pois'] });
      toast.success('POI criado com sucesso!');
      setIsAddDialogOpen(false);
      setNewPOI({ name: '', type: 'restroom' });
    },
    onError: (error) => {
      console.error('Error creating POI:', error);
      toast.error('Erro ao criar POI');
    },
  });

  // Delete POI mutation
  const deletePOIMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-pois'] });
      toast.success('POI excluído!');
      setSelectedItem(null);
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
      queryClient.invalidateQueries({ queryKey: ['unified-pois'] });
      toast.success('Horário salvo!');
      setEditingSchedule(null);
    },
    onError: (error) => {
      console.error('Error saving schedule:', error);
      toast.error('Erro ao salvar horário');
    },
  });

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!selectedItem) {
      toast.error('Selecione um item primeiro');
      return;
    }
    if (e.latLng) {
      setPendingCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, [selectedItem]);

  const handleMarkerDragEnd = useCallback((item: MapItem, e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      saveMutation.mutate({
        id: item.id,
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        itemType: item.itemType,
      });
    }
  }, [saveMutation]);

  const handleSaveCoords = () => {
    if (!selectedItem || !pendingCoords) return;
    saveMutation.mutate({
      id: selectedItem.id,
      lat: pendingCoords.lat,
      lng: pendingCoords.lng,
      itemType: selectedItem.itemType,
    });
  };

  const handleSelectItem = (item: MapItem) => {
    setSelectedItem(item);
    setPendingCoords(null);
    if (item.latitude && item.longitude && mapRef.current) {
      mapRef.current.panTo({ lat: Number(item.latitude), lng: Number(item.longitude) });
      mapRef.current.setZoom(19);
    }
  };

  const handleParkChange = (parkId: string) => {
    const park = PARKS.find(p => p.id === parkId);
    if (park) {
      setSelectedPark(park);
      setSelectedItem(null);
      setPendingCoords(null);
      setSearchTerm('');
    }
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
  };

  const getMarkerIcon = (item: MapItem, isSelected: boolean, isPending: boolean): google.maps.Symbol | undefined => {
    if (typeof google === 'undefined' || !google.maps?.SymbolPath) return undefined;

    let color = '#6366F1';
    if (item.itemType === 'attraction') color = '#F59E0B';
    else if (item.itemType === 'restaurant') color = '#F97316';
    else if (item.poiType && POI_CONFIG_ADMIN[item.poiType as POIType]) {
      color = POI_CONFIG_ADMIN[item.poiType as POIType].color;
    }

    const hasCoords = item.latitude && item.longitude;

    if (isPending) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 4,
        scale: 16,
      };
    }

    if (isSelected) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 4,
        scale: 14,
      };
    }

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: hasCoords ? color : '#EF4444',
      fillOpacity: hasCoords ? 0.9 : 0.5,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 10,
    };
  };

  const getItemIcon = (item: MapItem) => {
    if (item.itemType === 'attraction') return '⭐';
    if (item.itemType === 'restaurant') return '🍔';
    if (item.poiType && POI_CONFIG_ADMIN[item.poiType as POIType]) {
      return POI_CONFIG_ADMIN[item.poiType as POIType].emoji;
    }
    return '📍';
  };

  const getItemLabel = (item: MapItem) => {
    if (item.itemType === 'attraction') return 'Atração';
    if (item.itemType === 'restaurant') return 'Restaurante';
    if (item.poiType && POI_CONFIG_ADMIN[item.poiType as POIType]) {
      return POI_CONFIG_ADMIN[item.poiType as POIType].label;
    }
    return 'POI';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Editor de Coordenadas
          </h2>
          <p className="text-sm text-muted-foreground">
            Posicione atrações, restaurantes e POIs no mapa
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
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
              <Button size="sm" variant="outline">
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
                      {(Object.keys(POI_CONFIG_ADMIN) as POIType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {POI_CONFIG_ADMIN[type].emoji} {POI_CONFIG_ADMIN[type].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createPOIMutation.mutate({ name: newPOI.name, type: newPOI.type, parkId: selectedPark.id })}
                  disabled={!newPOI.name || createPOIMutation.isPending}
                >
                  {createPOIMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Criar POI
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="text-sm">
          Total: {stats.total}
        </Badge>
        <Badge className="bg-green-500 text-white text-sm">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {stats.withCoords} com coordenadas
        </Badge>
        <Badge className="bg-red-500 text-white text-sm">
          <AlertCircle className="w-3 h-3 mr-1" />
          {stats.total - stats.withCoords} sem coordenadas
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ItemType | 'all')}>
          <TabsList>
            <TabsTrigger value="all">
              Todos ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="attraction">
              ⭐ Atrações ({stats.attractions})
            </TabsTrigger>
            <TabsTrigger value="restaurant">
              🍔 Restaurantes ({stats.restaurants})
            </TabsTrigger>
            <TabsTrigger value="poi">
              📍 POIs ({stats.pois})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'poi' && (
          <Select value={poiFilter} onValueChange={(v) => setPoiFilter(v as POIType | 'all')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filtrar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos POIs</SelectItem>
              {(Object.keys(POI_CONFIG_ADMIN) as POIType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {POI_CONFIG_ADMIN[type].emoji} {POI_CONFIG_ADMIN[type].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Selected item info */}
      {selectedItem && (
        <Card className="border-2 border-primary/50 bg-primary/5">
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-lg">{getItemIcon(selectedItem)}</span>
                <div>
                  <p className="font-medium">{selectedItem.title}</p>
                  <p className="text-xs text-muted-foreground font-normal">{getItemLabel(selectedItem)}</p>
                </div>
              </span>
              <div className="flex gap-1">
                {selectedItem.itemType === 'poi' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm('Deseja excluir este POI?')) {
                        deletePOIMutation.mutate(selectedItem.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-sm">
                {pendingCoords ? (
                  <p className="text-blue-600 font-medium">
                    Nova posição: {pendingCoords.lat.toFixed(5)}, {pendingCoords.lng.toFixed(5)}
                  </p>
                ) : selectedItem.latitude && selectedItem.longitude ? (
                  <p className="text-green-600">
                    Atual: {Number(selectedItem.latitude).toFixed(5)}, {Number(selectedItem.longitude).toFixed(5)}
                  </p>
                ) : (
                  <p className="text-red-500">Sem coordenadas - clique no mapa para definir</p>
                )}
              </div>
              
              {pendingCoords && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPendingCoords(null)}>
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveCoords}
                    disabled={saveMutation.isPending}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Salvar
                  </Button>
                </div>
              )}
            </div>

            {/* Schedule editor for shows */}
            {selectedItem.itemType === 'poi' && selectedItem.poiType === 'show' && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Horários:</span>
                  {editingSchedule?.id === selectedItem.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <Input
                        placeholder="Ex: 10:00, 14:00, 18:00"
                        className="h-8 text-sm flex-1"
                        value={editingSchedule.schedule}
                        onChange={(e) => setEditingSchedule({ ...editingSchedule, schedule: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateScheduleMutation.mutate({ id: selectedItem.id, schedule: editingSchedule.schedule });
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateScheduleMutation.mutate({ id: selectedItem.id, schedule: editingSchedule.schedule })}
                        disabled={updateScheduleMutation.isPending}
                      >
                        {updateScheduleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingSchedule(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setEditingSchedule({ id: selectedItem.id, schedule: selectedItem.schedule || '' })}
                    >
                      {selectedItem.schedule || 'Clique para definir'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden border shadow-lg">
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={selectedPark.center}
              zoom={selectedPark.zoom}
              options={mapOptions}
              onLoad={onMapLoad}
              onClick={handleMapClick}
            >
              {isMapLoaded && filteredItems.map((item) => {
                if (!item.latitude || !item.longitude) return null;
                const isSelected = selectedItem?.id === item.id;
                
                return (
                  <Marker
                    key={item.id}
                    position={{ lat: Number(item.latitude), lng: Number(item.longitude) }}
                    icon={getMarkerIcon(item, isSelected, false)}
                    title={item.title}
                    draggable={true}
                    onClick={() => handleSelectItem(item)}
                    onDragEnd={(e) => handleMarkerDragEnd(item, e)}
                  />
                );
              })}

              {isMapLoaded && pendingCoords && (
                <Marker
                  position={pendingCoords}
                  icon={getMarkerIcon({ id: '', title: '', latitude: null, longitude: null, itemType: 'poi' }, false, true)}
                  title="Nova posição"
                />
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        {/* Items List */}
        <Card>
          <CardHeader className="py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum item encontrado</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredItems.map((item) => {
                    const hasCoords = item.latitude && item.longitude;
                    const isSelected = selectedItem?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleSelectItem(item)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-lg shrink-0">{getItemIcon(item)}</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{getItemLabel(item)}</p>
                            </div>
                          </div>
                          {hasCoords ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Legenda:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Atração</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Restaurante</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span>POI</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Sem coordenadas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Nova posição</span>
        </div>
      </div>
    </div>
  );
}
