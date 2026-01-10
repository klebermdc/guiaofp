import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation, Loader2, AlertCircle, Star, Route, X, Clock, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCib6OEwxnVUEan4mgc3YlITa4LMwahmbo';

type LatLng = { lat: number; lng: number };

interface Park {
  id: string;
  name: string;
  center: LatLng;
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
  position: LatLng;
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
  { id: 'dd6b79b8-d934-4e15-8967-1f1af1911fef', name: 'Magic Kingdom', center: { lat: 28.4177, lng: -81.5812 }, zoom: 17 },
  { id: '03e87b8e-7467-4121-971b-91826dd55bec', name: 'EPCOT', center: { lat: 28.3747, lng: -81.5494 }, zoom: 17 },
  { id: 'ffdca010-b62c-40cc-98ee-37a853da037d', name: 'Hollywood Studios', center: { lat: 28.3575, lng: -81.5583 }, zoom: 17 },
  { id: '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205', name: 'Animal Kingdom', center: { lat: 28.3553, lng: -81.5901 }, zoom: 16 },
  { id: 'c63c98b3-1cef-4d90-8142-0a68331907e1', name: 'Universal Studios', center: { lat: 28.4780, lng: -81.4690 }, zoom: 17 },
  { id: '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148', name: 'Island of Adventure', center: { lat: 28.4710, lng: -81.4720 }, zoom: 17 },
  { id: 'ba562b14-26bf-4b12-a13d-2aa7df43297e', name: 'Epic Universe', center: { lat: 28.4400, lng: -81.4485 }, zoom: 17 },
];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  mapTypeId: 'satellite',
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
};

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
    return normalizedName === normalizedWtName || 
           normalizedName.includes(normalizedWtName) || 
           normalizedWtName.includes(normalizedName);
  });
};

interface RouteInfo {
  distance: string;
  duration: string;
  destinationName: string;
}

export default function ParkMap() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedPark, setSelectedPark] = useState(PARKS[0]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [waitTimes, setWaitTimes] = useState<WaitTimeData[]>([]);
  const [isLoadingAttractions, setIsLoadingAttractions] = useState(false);
  const [isLoadingWaitTimes, setIsLoadingWaitTimes] = useState(false);
  const [lastWaitTimeUpdate, setLastWaitTimeUpdate] = useState<Date | null>(null);
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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
        position: { lat: Number(item.latitude), lng: Number(item.longitude) },
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

  // Fetch data when park changes
  useEffect(() => {
    fetchAttractions(selectedPark.id);
    fetchWaitTimes(selectedPark.id);
    setDirections(null);
    setRouteInfo(null);
    setSelectedAttraction(null);
  }, [selectedPark.id, fetchWaitTimes]);

  // Auto-refresh wait times every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWaitTimes(selectedPark.id);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedPark.id, fetchWaitTimes]);

  const calculateRoute = useCallback((destination: LatLng, destinationName: string) => {
    if (!userPosition) {
      setLocationError('Ative sua localização primeiro para calcular a rota');
      return;
    }

    setIsCalculatingRoute(true);
    setSelectedAttraction(null);

    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: userPosition,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        setIsCalculatingRoute(false);
        
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const leg = result.routes[0].legs[0];
          setRouteInfo({
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || '',
            destinationName,
          });
        } else {
          setLocationError('Não foi possível calcular a rota. Tente novamente.');
        }
      }
    );
  }, [userPosition]);

  const clearRoute = () => {
    setDirections(null);
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
        const pos: LatLng = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserPosition(pos);
        if (mapRef.current) {
          mapRef.current.panTo(pos);
          mapRef.current.setZoom(18);
        }
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

  const handleNavigateToAttraction = (position: LatLng) => {
    if (mapRef.current) {
      mapRef.current.panTo(position);
      mapRef.current.setZoom(19);
    }
  };

  const handleRouteToAttraction = (position: LatLng, name: string) => {
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

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
  };

  const getMarkerIcon = (attraction: Attraction): google.maps.Symbol | google.maps.Icon => {
    const waitTimeColor = attraction.waitTime !== undefined 
      ? attraction.waitTime > 60 ? '#EF4444' 
        : attraction.waitTime > 30 ? '#F59E0B' 
        : '#22C55E'
      : '#6B7280';

    if (attraction.isNextInAgenda) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#F59E0B',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
        scale: 14,
      };
    }

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: waitTimeColor,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 10,
    };
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
                    <p className="font-bold text-lg">{routeInfo.distance}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Tempo estimado</p>
                    <p className="font-bold text-lg">{routeInfo.duration}</p>
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
        <div className="h-[calc(100vh-380px)] min-h-[350px] rounded-xl overflow-hidden border shadow-lg">
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={selectedPark.center}
              zoom={selectedPark.zoom}
              options={mapOptions}
              onLoad={onMapLoad}
            >
              {/* User Position Marker */}
              {userPosition && (
                <Marker
                  position={userPosition}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#3B82F6',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3,
                    scale: 10,
                  }}
                  title="Você está aqui"
                />
              )}

              {/* Attraction Markers */}
              {isMapLoaded && attractionsWithWaitTimes.map((attraction) => (
                <Marker
                  key={attraction.id}
                  position={attraction.position}
                  icon={getMarkerIcon(attraction)}
                  onClick={() => setSelectedAttraction(attraction)}
                  title={attraction.name}
                />
              ))}

              {/* Info Window for selected attraction */}
              {selectedAttraction && (
                <InfoWindow
                  position={selectedAttraction.position}
                  onCloseClick={() => setSelectedAttraction(null)}
                >
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-base mb-1">{selectedAttraction.name}</h3>
                    {selectedAttraction.description && (
                      <p className="text-sm text-gray-600 mb-2">{selectedAttraction.description}</p>
                    )}
                    
                    {selectedAttraction.waitTime !== undefined && (
                      <div 
                        className="text-center p-2 rounded mb-2 text-white"
                        style={{ 
                          backgroundColor: selectedAttraction.waitTime > 60 ? '#EF4444' 
                            : selectedAttraction.waitTime > 30 ? '#F59E0B' 
                            : '#22C55E' 
                        }}
                      >
                        <div className="text-xs opacity-90">Tempo de espera</div>
                        <div className="text-xl font-bold">{selectedAttraction.waitTime} min</div>
                      </div>
                    )}
                    
                    {selectedAttraction.isOpen === false && (
                      <div className="bg-red-500 text-white text-center p-1 rounded text-xs mb-2">
                        ❌ Fechada no momento
                      </div>
                    )}
                    
                    <div className="flex gap-1 flex-wrap mb-2">
                      {selectedAttraction.thrillLevel && (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">
                          Nível {selectedAttraction.thrillLevel}/5
                        </span>
                      )}
                      {selectedAttraction.minHeight && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                          {selectedAttraction.minHeight}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        calculateRoute(selectedAttraction.position, selectedAttraction.name);
                        setSelectedAttraction(null);
                      }}
                      className="w-full bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                    >
                      🚶 Como Chegar
                    </button>
                  </div>
                </InfoWindow>
              )}

              {/* Directions */}
              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    polylineOptions: {
                      strokeColor: '#3B82F6',
                      strokeWeight: 5,
                      strokeOpacity: 0.8,
                    },
                    suppressMarkers: true,
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>
        </div>

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
