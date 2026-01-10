import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { MapPin, Navigation, Loader2, AlertCircle, Star, Route, X, Clock, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

type LatLngTuple = [number, number];

interface Park {
  id: string;
  name: string;
  center: LatLngTuple;
  zoom: number;
}

interface WaitTimeData {
  id: number;
  name: string;
  isOpen: boolean;
  waitTime: number;
  lastUpdated: string;
}

interface Attraction {
  id: string;
  name: string;
  position: LatLngTuple;
  description: string;
  waitTime?: number;
  isOpen?: boolean;
  isNextInAgenda?: boolean;
  thrillLevel?: number;
  minHeight?: string;
  passType?: string;
}

// Parks data with coordinates (category IDs from database)
const PARKS: Park[] = [
  { id: 'dd6b79b8-d934-4e15-8967-1f1af1911fef', name: 'Magic Kingdom', center: [28.4177, -81.5812], zoom: 16 },
  { id: '03e87b8e-7467-4121-971b-91826dd55bec', name: 'EPCOT', center: [28.3747, -81.5494], zoom: 16 },
  { id: 'ffdca010-b62c-40cc-98ee-37a853da037d', name: 'Hollywood Studios', center: [28.3575, -81.5583], zoom: 16 },
  { id: '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205', name: 'Animal Kingdom', center: [28.3553, -81.5901], zoom: 15 },
  { id: 'c63c98b3-1cef-4d90-8142-0a68331907e1', name: 'Universal Studios', center: [28.4753, -81.4682], zoom: 16 },
  { id: '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148', name: 'Islands of Adventure', center: [28.4722, -81.4710], zoom: 16 },
  { id: 'ba562b14-26bf-4b12-a13d-2aa7df43297e', name: 'Epic Universe', center: [28.4726, -81.5358], zoom: 16 },
];

// Custom marker icons
const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="width: 24px; height: 24px; background: #3B82F6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const nextAttractionIcon = L.divIcon({
  className: 'next-attraction-marker',
  html: `<div style="width: 32px; height: 32px; background: #F59E0B; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface RouteInfo {
  distance: number;
  time: number;
  destinationName: string;
}

// Helper to normalize attraction names for matching
const normalizeAttractionName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^\w\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Find matching wait time for an attraction
const findWaitTime = (attractionName: string, waitTimes: WaitTimeData[]): WaitTimeData | undefined => {
  const normalizedName = normalizeAttractionName(attractionName);
  
  return waitTimes.find(wt => {
    const normalizedWtName = normalizeAttractionName(wt.name);
    // Check if names match or one contains the other
    return normalizedName === normalizedWtName || 
           normalizedName.includes(normalizedWtName) || 
           normalizedWtName.includes(normalizedName);
  });
};

export default function ParkMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routingControlRef = useRef<any>(null);

  const [selectedPark, setSelectedPark] = useState(PARKS[0]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [waitTimes, setWaitTimes] = useState<WaitTimeData[]>([]);
  const [isLoadingAttractions, setIsLoadingAttractions] = useState(false);
  const [isLoadingWaitTimes, setIsLoadingWaitTimes] = useState(false);
  const [lastWaitTimeUpdate, setLastWaitTimeUpdate] = useState<Date | null>(null);
  const [userPosition, setUserPosition] = useState<LatLngTuple | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const nextAttraction = attractions.find(a => a.isNextInAgenda);

  // Fetch wait times from Queue-Times API
  const fetchWaitTimes = useCallback(async (parkId: string) => {
    setIsLoadingWaitTimes(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('queue-times', {
        body: { parkId },
      });

      if (error) {
        console.error('Error fetching wait times:', error);
        setWaitTimes([]);
      } else if (data?.success && data?.data) {
        setWaitTimes(data.data);
        setLastWaitTimeUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch wait times:', err);
      setWaitTimes([]);
    }
    
    setIsLoadingWaitTimes(false);
  }, []);

  // Fetch attractions from database
  const fetchAttractions = async (parkId: string) => {
    setIsLoadingAttractions(true);
    
    const { data, error } = await supabase
      .from('content_items')
      .select('id, title, description, latitude, longitude, thrill_level, min_height, pass_type')
      .eq('category_id', parkId)
      .eq('is_published', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) {
      console.error('Error fetching attractions:', error);
      setAttractions([]);
    } else if (data) {
      const mappedAttractions: Attraction[] = data.map((item) => ({
        id: item.id,
        name: item.title,
        position: [Number(item.latitude), Number(item.longitude)] as LatLngTuple,
        description: item.description || '',
        thrillLevel: item.thrill_level || undefined,
        minHeight: item.min_height || undefined,
        passType: item.pass_type || undefined,
      }));
      setAttractions(mappedAttractions);
    }
    
    setIsLoadingAttractions(false);
  };

  // Merge wait times with attractions
  const attractionsWithWaitTimes = attractions.map(attraction => {
    const waitTimeData = findWaitTime(attraction.name, waitTimes);
    return {
      ...attraction,
      waitTime: waitTimeData?.waitTime,
      isOpen: waitTimeData?.isOpen,
    };
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(selectedPark.center, selectedPark.zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Fetch data when park changes
  useEffect(() => {
    fetchAttractions(selectedPark.id);
    fetchWaitTimes(selectedPark.id);
  }, [selectedPark.id, fetchWaitTimes]);

  // Auto-refresh wait times every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWaitTimes(selectedPark.id);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedPark.id, fetchWaitTimes]);

  // Update map view when park changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(selectedPark.center, selectedPark.zoom);
    clearRoute();
  }, [selectedPark]);

  // Update markers when attractions change
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;

    markersRef.current.clearLayers();

    attractionsWithWaitTimes.forEach((attraction) => {
      const icon = attraction.isNextInAgenda ? nextAttractionIcon : new L.Icon.Default();
      
      const waitTimeColor = attraction.waitTime !== undefined 
        ? attraction.waitTime > 60 ? '#EF4444' 
          : attraction.waitTime > 30 ? '#F59E0B' 
          : '#22C55E'
        : '#6B7280';

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${attraction.name}</h3>
          ${attraction.description ? `<p style="color: #666; font-size: 13px; margin-bottom: 8px;">${attraction.description}</p>` : ''}
          
          ${attraction.waitTime !== undefined ? `
            <div style="background: ${waitTimeColor}; color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; text-align: center;">
              <div style="font-size: 11px; opacity: 0.9;">Tempo de espera</div>
              <div style="font-size: 20px; font-weight: bold;">${attraction.waitTime} min</div>
            </div>
          ` : ''}
          
          ${attraction.isOpen === false ? `
            <div style="background: #DC2626; color: white; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px; text-align: center; font-size: 12px;">
              ❌ Fechada no momento
            </div>
          ` : ''}
          
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
            ${attraction.thrillLevel ? `<span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Nível ${attraction.thrillLevel}/5</span>` : ''}
            ${attraction.minHeight ? `<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${attraction.minHeight}</span>` : ''}
          </div>
          ${attraction.passType ? `<span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${attraction.passType}</span>` : ''}
          ${attraction.isNextInAgenda ? `<div style="background: #F59E0B; color: white; padding: 4px 8px; border-radius: 4px; margin-top: 8px; text-align: center; font-size: 12px;">⭐ Próxima na Agenda</div>` : ''}
          <button id="route-btn-${attraction.id}" style="margin-top: 10px; width: 100%; background: #3B82F6; color: white; padding: 8px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px;">
            🚶 Como Chegar
          </button>
        </div>
      `;

      const marker = L.marker(attraction.position, { icon })
        .bindPopup(popupContent);
      
      marker.on('popupopen', () => {
        const btn = document.getElementById(`route-btn-${attraction.id}`);
        if (btn) {
          btn.onclick = () => {
            calculateRoute(attraction.position, attraction.name);
            marker.closePopup();
          };
        }
      });
      
      markersRef.current?.addLayer(marker);
    });
  }, [attractionsWithWaitTimes, userPosition]);

  // Update user marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userPosition) {
      userMarkerRef.current = L.marker(userPosition, { icon: userIcon })
        .bindPopup('<strong>Você está aqui</strong>')
        .addTo(mapRef.current);
    }
  }, [userPosition]);

  const calculateRoute = (destination: LatLngTuple, destinationName: string) => {
    if (!mapRef.current) return;

    if (!userPosition) {
      setLocationError('Ative sua localização primeiro para calcular a rota');
      return;
    }

    setIsCalculatingRoute(true);
    clearRoute();

    const routingControl = (L.Routing as any).control({
      waypoints: [
        L.latLng(userPosition[0], userPosition[1]),
        L.latLng(destination[0], destination[1])
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#3B82F6', weight: 6, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      router: (L.Routing as any).osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'foot'
      }),
      createMarker: () => null,
    }).addTo(mapRef.current);

    routingControl.on('routesfound', (e: any) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        setRouteInfo({
          distance: route.summary.totalDistance,
          time: route.summary.totalTime,
          destinationName
        });
      }
      setIsCalculatingRoute(false);
    });

    routingControl.on('routingerror', () => {
      setLocationError('Não foi possível calcular a rota. Tente novamente.');
      setIsCalculatingRoute(false);
    });

    routingControlRef.current = routingControl;
  };

  const clearRoute = () => {
    if (routingControlRef.current && mapRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    setRouteInfo(null);
  };

  const handleGetLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocalização não suportada pelo navegador');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos: LatLngTuple = [position.coords.latitude, position.coords.longitude];
        setUserPosition(pos);
        mapRef.current?.flyTo(pos, 18, { duration: 1.5 });
        setIsLoadingLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Permissão de localização negada');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Localização indisponível');
            break;
          case error.TIMEOUT:
            setLocationError('Tempo esgotado ao obter localização');
            break;
          default:
            setLocationError('Erro ao obter localização');
        }
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleNavigateToAttraction = (position: LatLngTuple) => {
    mapRef.current?.flyTo(position, 18, { duration: 1.5 });
  };

  const handleRouteToAttraction = (position: LatLngTuple, name: string) => {
    if (!userPosition) {
      handleGetLocation();
      setTimeout(() => {
        if (userPosition) {
          calculateRoute(position, name);
        }
      }, 2000);
    } else {
      calculateRoute(position, name);
    }
  };

  const handleParkChange = (parkId: string) => {
    const park = PARKS.find(p => p.id === parkId);
    if (park) {
      setSelectedPark(park);
    }
  };

  const handleRefreshWaitTimes = () => {
    fetchWaitTimes(selectedPark.id);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}min`;
  };

  const getWaitTimeColor = (waitTime: number | undefined) => {
    if (waitTime === undefined) return 'bg-muted text-muted-foreground';
    if (waitTime > 60) return 'bg-red-500 text-white';
    if (waitTime > 30) return 'bg-amber-500 text-white';
    return 'bg-green-500 text-white';
  };

  return (
    <AppLayout>
      <div className="space-y-4 h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Mapa do Parque
            </h1>
            <p className="text-muted-foreground text-sm">Localize-se e veja tempos de fila em tempo real</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <Select value={selectedPark.id} onValueChange={handleParkChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
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

            <Button
              onClick={handleRefreshWaitTimes}
              disabled={isLoadingWaitTimes}
              variant="outline"
              size="icon"
              title="Atualizar tempos de fila"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingWaitTimes ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              onClick={handleGetLocation}
              disabled={isLoadingLocation}
              variant="outline"
              className="shrink-0"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              <span className="hidden sm:inline ml-2">Minha Localização</span>
            </Button>
          </div>
        </div>

        {/* Wait Time Status */}
        {lastWaitTimeUpdate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Tempos de fila atualizados às {lastWaitTimeUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            {waitTimes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {waitTimes.filter(w => w.isOpen).length} atrações abertas
              </Badge>
            )}
          </div>
        )}

        {/* Location Error */}
        {locationError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {locationError}
            <button onClick={() => setLocationError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Route Info Card */}
        {routeInfo && (
          <Card className="border-2 border-blue-400 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Route className="w-5 h-5 text-blue-500" />
                  Rota para {routeInfo.destinationName}
                </span>
                <Button variant="ghost" size="sm" onClick={clearRoute}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚶</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Distância</p>
                    <p className="font-bold text-lg">{formatDistance(routeInfo.distance)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Tempo estimado</p>
                    <p className="font-bold text-lg">{formatTime(routeInfo.time)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Attraction Card */}
        {nextAttraction && !routeInfo && (
          <Card className="border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Próxima Atração na Agenda
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold">{nextAttraction.name}</p>
                  <p className="text-sm text-muted-foreground">{nextAttraction.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleNavigateToAttraction(nextAttraction.position)}
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleRouteToAttraction(nextAttraction.position, nextAttraction.name)}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    disabled={isCalculatingRoute}
                  >
                    {isCalculatingRoute ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Route className="w-4 h-4 mr-1" />
                    )}
                    Como Chegar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map Container */}
        <div 
          ref={mapContainerRef}
          className="h-[calc(100vh-380px)] min-h-[350px] rounded-xl overflow-hidden border shadow-lg z-0"
        />

        {/* Attractions List */}
        {isLoadingAttractions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : attractionsWithWaitTimes.length === 0 ? (
          <Card className="p-6 text-center">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma atração com coordenadas cadastradas para este parque.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Adicione coordenadas GPS nas atrações pelo painel de administração.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {attractionsWithWaitTimes.map((attraction) => (
              <Card
                key={attraction.id}
                className={`transition-all hover:shadow-md ${
                  attraction.isNextInAgenda ? 'ring-2 ring-amber-400' : ''
                } ${attraction.isOpen === false ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate flex items-center gap-1">
                        {attraction.isNextInAgenda && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                        {attraction.name}
                      </h3>
                      {attraction.isOpen === false && (
                        <p className="text-xs text-red-500 font-medium">Fechada</p>
                      )}
                    </div>
                    <Badge className={`shrink-0 text-xs ${getWaitTimeColor(attraction.waitTime)}`}>
                      {attraction.waitTime !== undefined ? `${attraction.waitTime} min` : 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleNavigateToAttraction(attraction.position)}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleRouteToAttraction(attraction.position, attraction.name)}
                      disabled={isCalculatingRoute}
                    >
                      <Route className="w-3 h-3 mr-1" />
                      Rota
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
