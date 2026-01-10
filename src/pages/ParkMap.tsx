import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { MapPin, Navigation, Loader2, AlertCircle, Star, Route, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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

// Parks data with coordinates
const PARKS = [
  {
    id: 'magic-kingdom',
    name: 'Magic Kingdom',
    center: [28.4177, -81.5812] as LatLngTuple,
    zoom: 16,
    color: '#1E40AF',
  },
  {
    id: 'epcot',
    name: 'EPCOT',
    center: [28.3747, -81.5494] as LatLngTuple,
    zoom: 16,
    color: '#7C3AED',
  },
  {
    id: 'hollywood-studios',
    name: 'Hollywood Studios',
    center: [28.3575, -81.5583] as LatLngTuple,
    zoom: 16,
    color: '#DC2626',
  },
  {
    id: 'animal-kingdom',
    name: 'Animal Kingdom',
    center: [28.3553, -81.5901] as LatLngTuple,
    zoom: 15,
    color: '#059669',
  },
  {
    id: 'universal-studios',
    name: 'Universal Studios',
    center: [28.4753, -81.4682] as LatLngTuple,
    zoom: 16,
    color: '#F59E0B',
  },
  {
    id: 'islands-of-adventure',
    name: 'Islands of Adventure',
    center: [28.4722, -81.4710] as LatLngTuple,
    zoom: 16,
    color: '#0891B2',
  },
  {
    id: 'epic-universe',
    name: 'Epic Universe',
    center: [28.4726, -81.5358] as LatLngTuple,
    zoom: 16,
    color: '#8B5CF6',
  },
];

// Sample attractions with coordinates
const ATTRACTIONS: Record<string, Array<{
  id: string;
  name: string;
  position: LatLngTuple;
  description: string;
  waitTime?: number;
  isNextInAgenda?: boolean;
}>> = {
  'magic-kingdom': [
    { id: '1', name: 'Space Mountain', position: [28.4192, -81.5783], description: 'Montanha-russa no escuro pelo espaço', waitTime: 45 },
    { id: '2', name: 'Big Thunder Mountain', position: [28.4197, -81.5844], description: 'Trem descontrolado por minas de ouro', waitTime: 35 },
    { id: '3', name: 'Pirates of the Caribbean', position: [28.4181, -81.5842], description: 'Navegue com os piratas do Caribe', waitTime: 20 },
    { id: '4', name: 'Haunted Mansion', position: [28.4205, -81.5830], description: 'Tour pela mansão mal-assombrada', waitTime: 25 },
    { id: '5', name: 'Seven Dwarfs Mine Train', position: [28.4203, -81.5802], description: 'Montanha-russa dos Sete Anões', waitTime: 75, isNextInAgenda: true },
  ],
  'universal-studios': [
    { id: '1', name: 'Hollywood Rip Ride Rockit', position: [28.4748, -81.4677], description: 'Montanha-russa com sua trilha sonora', waitTime: 60 },
    { id: '2', name: 'Revenge of the Mummy', position: [28.4755, -81.4693], description: 'Montanha-russa indoor no escuro', waitTime: 40, isNextInAgenda: true },
    { id: '3', name: 'E.T. Adventure', position: [28.4760, -81.4710], description: 'Voe com E.T. para seu planeta', waitTime: 25 },
    { id: '4', name: 'Men in Black', position: [28.4738, -81.4668], description: 'Atire em alienígenas nessa aventura', waitTime: 30 },
  ],
  'islands-of-adventure': [
    { id: '1', name: 'Hagrid\'s Magical Creatures', position: [28.4725, -81.4735], description: 'Moto-coaster pelo mundo mágico', waitTime: 90 },
    { id: '2', name: 'VelociCoaster', position: [28.4712, -81.4695], description: 'Montanha-russa de velociraptores', waitTime: 75 },
    { id: '3', name: 'Incredible Hulk Coaster', position: [28.4718, -81.4680], description: 'Seja lançado como o Hulk', waitTime: 45, isNextInAgenda: true },
  ],
  'epic-universe': [
    { id: '1', name: 'Stardust Racers', position: [28.4730, -81.5355], description: 'Duelo de montanhas-russas', waitTime: 60, isNextInAgenda: true },
    { id: '2', name: 'Mario Kart: Bowser\'s Challenge', position: [28.4722, -81.5362], description: 'Corrida interativa do Mario Kart', waitTime: 90 },
    { id: '3', name: 'Harry Potter and the Battle at the Ministry', position: [28.4728, -81.5348], description: 'Batalha épica no Ministério da Magia', waitTime: 75 },
  ],
};

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

export default function ParkMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  const [selectedPark, setSelectedPark] = useState(PARKS[0]);
  const [userPosition, setUserPosition] = useState<LatLngTuple | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const attractions = ATTRACTIONS[selectedPark.id] || [];
  const nextAttraction = attractions.find(a => a.isNextInAgenda);

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

  // Update map view when park changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(selectedPark.center, selectedPark.zoom);
    clearRoute();
  }, [selectedPark]);

  // Update markers when attractions or park changes
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;

    markersRef.current.clearLayers();

    attractions.forEach((attraction) => {
      const icon = attraction.isNextInAgenda ? nextAttractionIcon : new L.Icon.Default();
      
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${attraction.name}</h3>
          <p style="color: #666; font-size: 13px; margin-bottom: 8px;">${attraction.description}</p>
          ${attraction.waitTime ? `<span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Espera: ~${attraction.waitTime} min</span>` : ''}
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
  }, [attractions, selectedPark, userPosition]);

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

  const handleNavigateToAttraction = (position: LatLngTuple, name: string) => {
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
            <p className="text-muted-foreground text-sm">Localize-se e encontre as atrações</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
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
                    onClick={() => handleNavigateToAttraction(nextAttraction.position, nextAttraction.name)}
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
          className="h-[calc(100vh-320px)] min-h-[400px] rounded-xl overflow-hidden border shadow-lg z-0"
        />

        {/* Attractions List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attractions.map((attraction) => (
            <Card
              key={attraction.id}
              className={`transition-all hover:shadow-md ${
                attraction.isNextInAgenda ? 'ring-2 ring-amber-400' : ''
              }`}
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
                    <p className="text-xs text-muted-foreground truncate">{attraction.description}</p>
                  </div>
                  {attraction.waitTime && (
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {attraction.waitTime}min
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => handleNavigateToAttraction(attraction.position, attraction.name)}
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
      </div>
    </AppLayout>
  );
}
