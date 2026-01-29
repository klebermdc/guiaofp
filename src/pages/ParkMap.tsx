/**
 * ParkMap Page
 * 
 * Interactive park map with attractions, POIs, wait times, and GPS navigation.
 * Refactored to use modular hooks and components for maintainability.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import { AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Loader2, AlertCircle, X, Clock, RefreshCw, List, Map, Satellite, LocateFixed, Car, ParkingCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Layout components
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TravelModeIndicator } from '@/components/travel-mode/TravelModeIndicator';

// UI components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Map components
import { AttractionPopup } from '@/components/map/AttractionPopup';
import { POIPopup } from '@/components/map/POIPopup';
import { MenuModal } from '@/components/map/MenuModal';
import { ParkMapSidebar } from '@/components/map/ParkMapSidebar';
import { NavigationPanel } from '@/components/map/NavigationPanel';

// Hooks
import { useIsMobile } from '@/hooks/use-mobile';
import { useLiveShows } from '@/hooks/useLiveShows';
import { useWaitTimes, findWaitTime, getWaitTimeColor } from '@/hooks/useWaitTimes';
import { useParkNavigation, type LatLng } from '@/hooks/useParkNavigation';
import { useParkMarkers, type MapAttraction, type MapPOI } from '@/hooks/useParkMarkers';

// Constants
import { 
  PARKS, 
  POI_CONFIG, 
  GOOGLE_MAPS_API_KEY,
  type POIType,
  type Park 
} from '@/data/constants';

type SidebarTab = 'attractions' | 'live-shows' | POIType;
type AttractionFilter = 'all' | 'open' | 'low-wait';

export default function ParkMap() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Park selection
  const [selectedPark, setSelectedPark] = useState<Park>(PARKS[0]);
  
  // Map state
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>('satellite');
  
  // Selection state
  const [selectedAttraction, setSelectedAttraction] = useState<MapAttraction | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<MapPOI | null>(null);
  const [menuModalData, setMenuModalData] = useState<{ url: string; name: string } | null>(null);
  
  // UI state
  const [showAttractionsList, setShowAttractionsList] = useState(false);
  const [isNavPanelExpanded, setIsNavPanelExpanded] = useState(true);
  const [attractionFilter, setAttractionFilter] = useState<AttractionFilter>('all');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('attractions');
  
  // POI visibility toggles
  const [visiblePOIs, setVisiblePOIs] = useState<Set<POIType>>(new Set(['restroom', 'restaurant', 'shop', 'firstaid', 'show']));
  const [showAttractionMarkers, setShowAttractionMarkers] = useState(true);

  // ===== Custom Hooks =====
  
  // Wait times with auto-refresh
  const { 
    waitTimes, 
    isLoading: isLoadingWaitTimes, 
    lastUpdate: lastWaitTimeUpdate,
    refresh: refreshWaitTimes 
  } = useWaitTimes({ 
    parkId: selectedPark.id, 
    isMobile 
  });

  // Navigation and GPS
  const navigation = useParkNavigation({ 
    mapRef,
    onNavigationStart: () => setSelectedAttraction(null),
  });

  // Marker icons
  const markers = useParkMarkers({ 
    navigationMode: navigation.navigationMode, 
    userHeading: navigation.userHeading 
  });

  // Live shows and characters
  const { 
    shows: liveShows, 
    isLoading: isLoadingLiveShows, 
    lastUpdate: lastShowsUpdate 
  } = useLiveShows(selectedPark.id, 60000);

  // ===== Data Fetching =====

  // Fetch attractions from database
  const { data: dbAttractions = [], isLoading: isLoadingAttractions } = useQuery({
    queryKey: ['park-attractions', selectedPark.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, description, latitude, longitude, thrill_level, min_height, pass_type, type')
        .eq('category_id', selectedPark.id)
        .neq('type', 'poi')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching attractions:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        name: item.title,
        position: {
          lat: Number(item.latitude),
          lng: Number(item.longitude),
        },
        description: item.description || '',
        thrillLevel: item.thrill_level,
        minHeight: item.min_height,
        passType: item.pass_type,
      })) as MapAttraction[];
    },
  });

  // Fetch POIs from database
  const { data: dbPOIs = [], isLoading: isLoadingPOIs } = useQuery({
    queryKey: ['park-pois', selectedPark.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, latitude, longitude, icon, schedule, description, attraction_description, menu_url, cuisine_type, requires_reservation, has_warning, warning_text')
        .eq('category_id', selectedPark.id)
        .eq('type', 'poi')
        .eq('is_published', true);

      if (error) throw error;
      return data;
    },
  });

  // ===== Memoized Data =====

  // Transform POIs to expected format
  const currentParkPOIs: MapPOI[] = useMemo(() => 
    dbPOIs
      .filter(poi => poi.latitude && poi.longitude)
      .map(poi => ({
        id: poi.id,
        type: (poi.icon as POIType) || 'restroom',
        name: poi.title,
        position: { lat: Number(poi.latitude), lng: Number(poi.longitude) },
        schedule: poi.schedule,
        description: poi.description || poi.attraction_description || null,
        menuUrl: poi.menu_url,
        cuisineType: poi.cuisine_type,
        requiresReservation: poi.requires_reservation,
        hasWarning: poi.has_warning,
        warningText: poi.warning_text,
      })),
    [dbPOIs]
  );

  // Merge attractions with wait times
  const attractionsWithWaitTimes: MapAttraction[] = useMemo(() => 
    dbAttractions.map(attraction => {
      const waitTimeData = findWaitTime(attraction.name, waitTimes);
      return {
        ...attraction,
        waitTime: waitTimeData?.waitTime,
        isOpen: waitTimeData?.isOpen,
      };
    }),
    [dbAttractions, waitTimes]
  );

  // Sort attractions by open status and wait time
  const sortedAttractions = useMemo(() => 
    [...attractionsWithWaitTimes].sort((a, b) => {
      if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
      if (a.waitTime !== undefined && b.waitTime !== undefined) return a.waitTime - b.waitTime;
      if (a.waitTime !== undefined) return -1;
      if (b.waitTime !== undefined) return 1;
      return a.name.localeCompare(b.name);
    }),
    [attractionsWithWaitTimes]
  );

  // Bearing to destination for compass
  const bearingToDestination = useMemo(() => 
    navigation.userPosition && navigation.routeInfo?.destination 
      ? navigation.calculateBearing(navigation.userPosition, navigation.routeInfo.destination)
      : 0,
    [navigation.userPosition, navigation.routeInfo?.destination, navigation.calculateBearing]
  );

  // ===== Event Handlers =====

  const handleParkChange = useCallback((parkId: string) => {
    const park = PARKS.find(p => p.id === parkId);
    if (park) {
      setSelectedPark(park);
      navigation.clearRoute();
    }
  }, [navigation]);

  const handleNavigateToAttraction = useCallback((position: LatLng) => {
    if (mapRef.current) {
      mapRef.current.panTo(position);
      mapRef.current.setZoom(19);
    }
  }, []);

  const handleRouteToAttraction = useCallback((position: LatLng, name: string) => {
    if (!navigation.userPosition) {
      navigation.startLocationTracking();
      const checkPosition = setInterval(() => {
        if (navigation.userPosition) {
          clearInterval(checkPosition);
          navigation.calculateRoute(position, name);
        }
      }, 500);
      setTimeout(() => clearInterval(checkPosition), 10000);
    } else {
      navigation.calculateRoute(position, name);
    }
  }, [navigation]);

  const handleAttractionSelect = useCallback((attraction: MapAttraction) => {
    setSelectedAttraction(attraction);
    handleNavigateToAttraction(attraction.position);
  }, [handleNavigateToAttraction]);

  const handlePOISelect = useCallback((poi: MapPOI) => {
    setSelectedPOI(poi);
    handleNavigateToAttraction(poi.position);
  }, [handleNavigateToAttraction]);

  const togglePOIType = useCallback((type: POIType) => {
    setVisiblePOIs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
  }, []);

  // Center map when park changes
  useEffect(() => {
    if (mapRef.current && isMapLoaded) {
      mapRef.current.panTo(selectedPark.center);
      mapRef.current.setZoom(selectedPark.zoom);
    }
  }, [selectedPark, isMapLoaded]);

  // ===== Render =====

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* App Sidebar - Navigation Menu (left) - Desktop Only */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex lg:ml-72 min-h-0 overflow-hidden">
        {/* Map + Controls Column */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          
          {/* Mobile Header */}
          {isMobile && (
            <div className="bg-background/95 backdrop-blur-sm border-b z-20 p-2 sm:p-3 safe-area-top">
              <div className="flex items-center gap-2">
                <Select value={selectedPark.id} onValueChange={handleParkChange}>
                  <SelectTrigger className="flex-1 h-9 text-sm">
                    <SelectValue placeholder="Parque" />
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
                  onClick={refreshWaitTimes}
                  disabled={isLoadingWaitTimes}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingWaitTimes ? 'animate-spin' : ''}`} />
                </Button>

                <Button
                  onClick={navigation.handleGetLocation}
                  disabled={navigation.isLoadingLocation}
                  variant={navigation.userPosition ? 'default' : 'outline'}
                  size="icon"
                  className="h-12 w-12 shrink-0 rounded-full"
                >
                  {navigation.isLoadingLocation ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : navigation.userPosition ? (
                    <LocateFixed className="w-5 h-5" />
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                </Button>

                {/* Mobile Attractions List */}
                <Sheet open={showAttractionsList} onOpenChange={setShowAttractionsList}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                      <List className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[70vh]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center justify-between">
                        <span>Atrações - {selectedPark.name}</span>
                        {waitTimes.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {waitTimes.filter(w => w.isOpen).length} abertas
                          </Badge>
                        )}
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="overflow-auto h-full pb-20 -mx-4 px-4">
                      {isLoadingAttractions ? (
                        <div className="p-8 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : sortedAttractions.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma atração cadastrada</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {sortedAttractions.map((attraction) => (
                            <div
                              key={attraction.id}
                              className="py-3 flex items-center justify-between gap-3 active:bg-muted/50"
                              onClick={() => {
                                handleAttractionSelect(attraction);
                                setShowAttractionsList(false);
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{attraction.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {attraction.isOpen !== undefined && (
                                    <span className={`text-xs ${attraction.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                                      {attraction.isOpen ? '● Aberto' : '● Fechado'}
                                    </span>
                                  )}
                                  {attraction.passType && (
                                    <span className="text-xs text-muted-foreground truncate">
                                      {attraction.passType}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <Badge className={`${getWaitTimeColor(attraction.waitTime)} shrink-0`}>
                                {attraction.waitTime !== undefined ? `${attraction.waitTime} min` : '—'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* GPS Status Indicator */}
              {navigation.userPosition && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>GPS Ativo</span>
                  {lastWaitTimeUpdate && (
                    <>
                      <span className="mx-1">•</span>
                      <Clock className="w-3 h-3" />
                      <span>Atualizado {lastWaitTimeUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Desktop Header */}
          {!isMobile && (
            <div className="bg-background/95 backdrop-blur-sm border-b z-20 p-2 flex items-center justify-end gap-2">
              <Button
                onClick={navigation.handleGetLocation}
                disabled={navigation.isLoadingLocation}
                variant={navigation.userPosition ? 'default' : 'outline'}
                size="sm"
              >
                {navigation.isLoadingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                Minha localização
              </Button>
            </div>
          )}

          {/* Location Error Banner */}
          {navigation.locationError && (
            <div className="absolute top-[60px] left-2 right-2 z-30 flex items-center gap-2 p-2 bg-destructive/90 text-destructive-foreground rounded-lg text-sm safe-area-top">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-xs">{navigation.locationError}</span>
              <button onClick={() => navigation.setLocationError(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Map Container */}
          <div className="flex-1 min-h-0 relative">
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={selectedPark.center}
                zoom={selectedPark.zoom}
                options={{
                  mapTypeId: mapType,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                  zoomControl: false,
                  gestureHandling: 'greedy',
                }}
                onLoad={onMapLoad}
                onClick={(e) => {
                  const target = (e as any)?.domEvent?.target as HTMLElement | null;
                  if (target?.closest?.('[data-attraction-popup="true"], [data-poi-popup="true"]')) return;
                  setSelectedAttraction(null);
                  setSelectedPOI(null);
                }}
              >
                {/* User location marker */}
                {navigation.userPosition && isMapLoaded && (
                  <Marker
                    position={navigation.userPosition}
                    icon={markers.getUserMarkerIcon()}
                    title="Sua localização"
                    zIndex={1000}
                  />
                )}

                {/* Attraction markers */}
                {isMapLoaded && showAttractionMarkers && attractionsWithWaitTimes.map((attraction) => (
                  <Marker
                    key={attraction.id}
                    position={attraction.position}
                    icon={markers.getMarkerIcon(attraction)}
                    title={`${attraction.name}${attraction.waitTime !== undefined ? ` - ${attraction.waitTime} min` : ''}`}
                    onClick={() => {
                      setSelectedAttraction(attraction);
                      setSelectedPOI(null);
                    }}
                  />
                ))}

                {/* POI markers */}
                {isMapLoaded && currentParkPOIs
                  .filter(poi => visiblePOIs.has(poi.type))
                  .map((poi) => (
                    <Marker
                      key={poi.id}
                      position={poi.position}
                      icon={markers.getPOIMarkerIcon(poi.type)}
                      title={`${POI_CONFIG[poi.type].emoji} ${poi.name}`}
                      onClick={() => {
                        setSelectedPOI(poi);
                        setSelectedAttraction(null);
                      }}
                      zIndex={500}
                    />
                  ))
                }

                {/* Car parking marker */}
                {navigation.carLocation && isMapLoaded && (
                  <Marker
                    position={navigation.carLocation}
                    icon={markers.getCarMarkerIcon()}
                    title="🚗 Meu Carro"
                    zIndex={900}
                    onClick={() => {
                      if (mapRef.current) {
                        mapRef.current.panTo(navigation.carLocation!);
                        mapRef.current.setZoom(18);
                      }
                    }}
                  />
                )}

                {/* Attraction Popup */}
                <AnimatePresence>
                  {selectedAttraction && !navigation.isNavigating && (
                    <AttractionPopup
                      attraction={selectedAttraction}
                      parkName={selectedPark.name}
                      onClose={() => setSelectedAttraction(null)}
                      onNavigate={(pos, name) => {
                        setSelectedAttraction(null);
                        handleRouteToAttraction(pos, name);
                      }}
                      isCalculatingRoute={navigation.isCalculatingRoute}
                    />
                  )}
                </AnimatePresence>

                {/* POI Popup */}
                <AnimatePresence>
                  {selectedPOI && (
                    <POIPopup
                      poi={{
                        id: selectedPOI.id,
                        name: selectedPOI.name,
                        type: selectedPOI.type,
                        position: selectedPOI.position,
                        description: selectedPOI.description || undefined,
                        schedule: selectedPOI.schedule || undefined,
                        menuUrl: selectedPOI.menuUrl || undefined,
                      }}
                      poiConfig={POI_CONFIG[selectedPOI.type]}
                      onClose={() => setSelectedPOI(null)}
                      onNavigate={handleRouteToAttraction}
                      onOpenMenu={(url, name) => setMenuModalData({ url, name })}
                    />
                  )}
                </AnimatePresence>

                {/* Directions renderer */}
                {navigation.directions && (
                  <DirectionsRenderer
                    directions={navigation.directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#3B82F6',
                        strokeWeight: 6,
                        strokeOpacity: 0.9,
                      },
                    }}
                  />
                )}

                {/* Fallback line when Directions API fails */}
                {!navigation.directions && navigation.isNavigating && navigation.userPosition && navigation.routeInfo?.destination && (
                  <Polyline
                    path={[navigation.userPosition, navigation.routeInfo.destination]}
                    options={{
                      strokeColor: '#8B5CF6',
                      strokeWeight: 4,
                      strokeOpacity: 0.8,
                      geodesic: true,
                      icons: [
                        {
                          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                          offset: '0',
                          repeat: '20px',
                        },
                      ],
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>

            {/* Guided Navigation Arrow Overlay */}
            {navigation.navigationMode === 'guided' && navigation.isNavigating && navigation.userPosition && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-blue-400/20 blur-xl animate-pulse" />
                  <div 
                    className="absolute w-0 h-0 left-1/2 -translate-x-1/2"
                    style={{
                      bottom: '50%',
                      borderLeft: '40px solid transparent',
                      borderRight: '40px solid transparent',
                      borderBottom: '80px solid rgba(59, 130, 246, 0.25)',
                    }}
                  />
                  <svg width="60" height="60" viewBox="0 0 60 60" style={{ filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.5))' }}>
                    <defs>
                      <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#2563EB" />
                      </linearGradient>
                    </defs>
                    <polygon points="30,5 50,50 30,40 10,50" fill="white" />
                    <polygon points="30,8 47,47 30,38 13,47" fill="url(#arrowGradient)" />
                    <polygon points="30,8 30,38 13,47" fill="rgba(255,255,255,0.15)" />
                  </svg>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-600 shadow-lg" />
                </div>
              </div>
            )}

            {/* POI Filter Buttons */}
            {navigation.navigationMode !== 'guided' && (
              <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                <Button
                  variant={showAttractionMarkers ? 'default' : 'secondary'}
                  size="sm"
                  className={`h-8 px-2 shadow-lg text-xs gap-1 ${showAttractionMarkers ? 'bg-gradient-to-r from-green-500 to-amber-500' : 'opacity-70'}`}
                  onClick={() => setShowAttractionMarkers(!showAttractionMarkers)}
                  title="Atrações"
                >
                  <span>⭐</span>
                  <span className="hidden sm:inline">{attractionsWithWaitTimes.length}</span>
                </Button>
                {(Object.keys(POI_CONFIG) as POIType[]).map((type) => {
                  const config = POI_CONFIG[type];
                  const isActive = visiblePOIs.has(type);
                  const count = currentParkPOIs.filter(p => p.type === type).length;
                  return (
                    <Button
                      key={type}
                      variant={isActive ? 'default' : 'secondary'}
                      size="sm"
                      className={`h-8 px-2 shadow-lg text-xs gap-1 ${isActive ? '' : 'opacity-50'}`}
                      onClick={() => togglePOIType(type)}
                      title={config.label}
                      style={isActive ? { backgroundColor: config.color } : {}}
                    >
                      <span>{config.emoji}</span>
                      <span className="hidden sm:inline">{count}</span>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Travel Mode Indicator */}
            <TravelModeIndicator />

            {/* Map Legend */}
            <div className="absolute top-16 left-2 bg-background/95 backdrop-blur-sm rounded-xl p-2.5 shadow-lg z-10 border border-border/50">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-xs text-foreground">Tempo de Espera</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">&lt;30</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">30-60</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">&gt;60</span>
                </div>
              </div>
            </div>

            {/* Zoom & Map Type Controls */}
            <div className="absolute bottom-24 lg:bottom-4 right-2 flex flex-col gap-1 z-10">
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 shadow-lg"
                onClick={() => setMapType(mapType === 'satellite' ? 'roadmap' : 'satellite')}
                title={mapType === 'satellite' ? 'Mudar para mapa normal' : 'Mudar para satélite'}
              >
                {mapType === 'satellite' ? <Map className="w-5 h-5" /> : <Satellite className="w-5 h-5" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 shadow-lg"
                onClick={() => mapRef.current?.setZoom((mapRef.current?.getZoom() || 16) + 1)}
              >
                +
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 shadow-lg"
                onClick={() => mapRef.current?.setZoom((mapRef.current?.getZoom() || 16) - 1)}
              >
                −
              </Button>
            </div>

            {/* Car Parking Controls */}
            <div className="absolute bottom-24 lg:bottom-4 left-2 flex flex-col gap-1 z-10">
              {!navigation.carLocation ? (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 shadow-lg"
                  onClick={navigation.saveCarLocation}
                  title="Marcar localização do carro"
                  disabled={!navigation.userPosition}
                >
                  <ParkingCircle className="w-5 h-5" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-10 w-10 shadow-lg bg-amber-500 hover:bg-amber-600"
                    onClick={navigation.navigateToCar}
                    title="Ir para o carro"
                  >
                    <Car className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 shadow-lg"
                    onClick={navigation.clearCarLocation}
                    title="Remover marcação"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Navigation Panel */}
            {navigation.isNavigating && navigation.routeInfo && (
              <NavigationPanel
                routeInfo={navigation.routeInfo}
                routeSteps={navigation.routeSteps}
                navigationMode={navigation.navigationMode}
                userPosition={navigation.userPosition}
                isExpanded={isNavPanelExpanded}
                bearingToDestination={bearingToDestination}
                mapRef={mapRef}
                onToggleExpanded={() => setIsNavPanelExpanded(!isNavPanelExpanded)}
                onStopNavigation={navigation.clearRoute}
                onStartGuidedNavigation={navigation.startGuidedNavigation}
                onSetNavigationMode={navigation.setNavigationMode}
                translateNavigationStep={navigation.translateNavigationStep}
              />
            )}
          </div>

          {/* Desktop Sidebar */}
          {!isMobile && (
            <ParkMapSidebar
              selectedPark={selectedPark}
              onParkChange={handleParkChange}
              sidebarTab={sidebarTab}
              onTabChange={setSidebarTab}
              attractions={sortedAttractions}
              selectedAttraction={selectedAttraction}
              attractionFilter={attractionFilter}
              onAttractionFilterChange={setAttractionFilter}
              onAttractionSelect={handleAttractionSelect}
              isLoadingAttractions={isLoadingAttractions}
              waitTimesCount={waitTimes.length}
              openAttractionsCount={waitTimes.filter(w => w.isOpen).length}
              lastWaitTimeUpdate={lastWaitTimeUpdate}
              isLoadingWaitTimes={isLoadingWaitTimes}
              onRefreshWaitTimes={refreshWaitTimes}
              pois={currentParkPOIs}
              selectedPOI={selectedPOI}
              onPOISelect={handlePOISelect}
              isLoadingPOIs={isLoadingPOIs}
              onCalculateRoute={navigation.calculateRoute}
              onOpenMenu={(url, name) => setMenuModalData({ url, name })}
              liveShows={liveShows}
              isLoadingLiveShows={isLoadingLiveShows}
              lastShowsUpdate={lastShowsUpdate}
              userPosition={navigation.userPosition}
              isLoadingLocation={navigation.isLoadingLocation}
              onGetLocation={navigation.handleGetLocation}
            />
          )}
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Menu Modal */}
      <AnimatePresence>
        {menuModalData && (
          <MenuModal
            menuUrl={menuModalData.url}
            restaurantName={menuModalData.name}
            onClose={() => setMenuModalData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
