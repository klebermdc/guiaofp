import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import { AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Loader2, AlertCircle, Star, X, Clock, RefreshCw, ChevronUp, ChevronDown, List, Filter, ArrowUp, Volume2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { AttractionPopup } from '@/components/map/AttractionPopup';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCib6OEwxnVUEan4mgc3YlITa4LMwahmbo';

type LatLng = { lat: number; lng: number };

interface Park {
  id: string;
  name: string;
  center: LatLng;
  zoom: number;
}

interface WaitTimeData {
  id: number | string;
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
  thrillLevel?: number;
  minHeight?: string;
  passType?: string;
}

// Parks with their database IDs and center coordinates
const PARKS: Park[] = [
  { id: 'dd6b79b8-d934-4e15-8967-1f1af1911fef', name: 'Magic Kingdom', center: { lat: 28.4177, lng: -81.5812 }, zoom: 17 },
  { id: '03e87b8e-7467-4121-971b-91826dd55bec', name: 'EPCOT', center: { lat: 28.3747, lng: -81.5494 }, zoom: 16 },
  { id: 'ffdca010-b62c-40cc-98ee-37a853da037d', name: 'Hollywood Studios', center: { lat: 28.3575, lng: -81.5583 }, zoom: 17 },
  { id: '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205', name: 'Animal Kingdom', center: { lat: 28.3580, lng: -81.5900 }, zoom: 16 },
  { id: 'c63c98b3-1cef-4d90-8142-0a68331907e1', name: 'Universal Studios', center: { lat: 28.4752, lng: -81.4683 }, zoom: 17 },
  { id: '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148', name: 'Islands of Adventure', center: { lat: 28.4711, lng: -81.4710 }, zoom: 17 },
  { id: 'ba562b14-26bf-4b12-a13d-2aa7df43297e', name: 'Epic Universe', center: { lat: 28.4720, lng: -81.4450 }, zoom: 16 },
];

// Normalize attraction names for matching with wait times
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
  destination?: LatLng; // Store destination for fallback line
}

export default function ParkMap() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [selectedPark, setSelectedPark] = useState(PARKS[0]);
  const [waitTimes, setWaitTimes] = useState<WaitTimeData[]>([]);
  const [dataSource, setDataSource] = useState<string>('');
  const [isLoadingWaitTimes, setIsLoadingWaitTimes] = useState(false);
  const [lastWaitTimeUpdate, setLastWaitTimeUpdate] = useState<Date | null>(null);
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [userHeading, setUserHeading] = useState<number | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeSteps, setRouteSteps] = useState<google.maps.DirectionsStep[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showAttractionsList, setShowAttractionsList] = useState(false);
  const [isNavPanelExpanded, setIsNavPanelExpanded] = useState(true);
  const [attractionFilter, setAttractionFilter] = useState<'all' | 'open' | 'low-wait'>('all');
  const [hasPlayedArrivalSound, setHasPlayedArrivalSound] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play arrival notification sound using Web Audio API
  const playArrivalSound = useCallback(() => {
    try {
      // Create or reuse AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      // Resume context if suspended (required for some browsers)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      
      // Create a pleasant chime sequence (3 ascending notes)
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)
      
      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now + index * 0.15);
        
        // Envelope: quick attack, sustain, then fade
        gainNode.gain.setValueAtTime(0, now + index * 0.15);
        gainNode.gain.linearRampToValueAtTime(0.3, now + index * 0.15 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.4);
        
        oscillator.start(now + index * 0.15);
        oscillator.stop(now + index * 0.15 + 0.5);
      });
    } catch (error) {
      console.log('Could not play arrival sound:', error);
    }
  }, []);

  // Check proximity to destination and play sound when within 50 meters
  useEffect(() => {
    if (!isNavigating || !userPosition || !routeInfo?.destination || hasPlayedArrivalSound) {
      return;
    }

    const distanceToDestination = calculateStraightLineDistance(userPosition, routeInfo.destination);
    
    if (distanceToDestination <= 50) {
      playArrivalSound();
      setHasPlayedArrivalSound(true);
      toast.success('🎉 Você chegou ao destino!', {
        description: routeInfo.destinationName,
        duration: 5000,
      });
    }
  }, [userPosition, routeInfo?.destination, isNavigating, hasPlayedArrivalSound, playArrivalSound]);

  // Reset arrival sound flag when starting a new navigation
  useEffect(() => {
    if (!isNavigating) {
      setHasPlayedArrivalSound(false);
    }
  }, [isNavigating]);

  // Fetch attractions from database with real coordinates
  const { data: dbAttractions = [], isLoading: isLoadingAttractions } = useQuery({
    queryKey: ['park-attractions', selectedPark.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, description, latitude, longitude, thrill_level, min_height, pass_type')
        .eq('category_id', selectedPark.id)
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
      })) as Attraction[];
    },
  });

  // Fetch wait times from API
  const fetchWaitTimes = useCallback(async (parkId: string) => {
    setIsLoadingWaitTimes(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('queue-times', {
        body: { parkId },
      });

      if (error) {
        console.error('Error fetching wait times:', error);
        setWaitTimes([]);
      } else if (Array.isArray((data as any)?.data)) {
        // Some deployments return { data: Ride[] } without a success flag.
        setWaitTimes((data as any).data);
        setDataSource((data as any)?.source || 'unknown');
        setLastWaitTimeUpdate(new Date());
      } else {
        setWaitTimes([]);
      }
    } catch (err) {
      console.error('Failed to fetch wait times:', err);
      setWaitTimes([]);
    }
    
    setIsLoadingWaitTimes(false);
  }, []);

  // Merge database attractions with wait times
  const attractionsWithWaitTimes: Attraction[] = dbAttractions.map(attraction => {
    const waitTimeData = findWaitTime(attraction.name, waitTimes);
    return {
      ...attraction,
      waitTime: waitTimeData?.waitTime,
      isOpen: waitTimeData?.isOpen,
    };
  });

  // Fetch wait times when park changes
  useEffect(() => {
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

  // Center map when park changes or map loads
  useEffect(() => {
    if (mapRef.current && isMapLoaded) {
      mapRef.current.panTo(selectedPark.center);
      mapRef.current.setZoom(selectedPark.zoom);
    }
  }, [selectedPark, isMapLoaded]);

  // Calculate straight-line distance between two points (Haversine formula)
  const calculateStraightLineDistance = (from: LatLng, to: LatLng): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (from.lat * Math.PI) / 180;
    const φ2 = (to.lat * Math.PI) / 180;
    const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
    const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Estimate walking time (average walking speed ~5 km/h = 83.3 m/min)
  const estimateWalkingTime = (meters: number): string => {
    const minutes = Math.round(meters / 83.3);
    if (minutes < 1) return '1 min';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
    }
    return `${minutes} min`;
  };

  // Calculate bearing (angle) from one point to another
  const calculateBearing = (from: LatLng, to: LatLng): number => {
    const φ1 = (from.lat * Math.PI) / 180;
    const φ2 = (to.lat * Math.PI) / 180;
    const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    
    return ((θ * 180) / Math.PI + 360) % 360; // Bearing in degrees (0-360)
  };

  // Get bearing to destination for the compass arrow
  const bearingToDestination = userPosition && routeInfo?.destination 
    ? calculateBearing(userPosition, routeInfo.destination)
    : 0;

  // Translate navigation instructions from English to Portuguese
  const translateNavigationStep = (instruction: string): string => {
    const translations: [RegExp, string][] = [
      // Directions
      [/\bHead\b/gi, 'Siga'],
      [/\bnorth\b/gi, 'norte'],
      [/\bsouth\b/gi, 'sul'],
      [/\beast\b/gi, 'leste'],
      [/\bwest\b/gi, 'oeste'],
      [/\bnortheast\b/gi, 'nordeste'],
      [/\bnorthwest\b/gi, 'noroeste'],
      [/\bsoutheast\b/gi, 'sudeste'],
      [/\bsouthwest\b/gi, 'sudoeste'],
      // Actions
      [/\bTurn right\b/gi, 'Vire à direita'],
      [/\bTurn left\b/gi, 'Vire à esquerda'],
      [/\bContinue\b/gi, 'Continue'],
      [/\bKeep right\b/gi, 'Mantenha-se à direita'],
      [/\bKeep left\b/gi, 'Mantenha-se à esquerda'],
      [/\bSlightly right\b/gi, 'Levemente à direita'],
      [/\bSlightly left\b/gi, 'Levemente à esquerda'],
      [/\bSharp right\b/gi, 'Curva acentuada à direita'],
      [/\bSharp left\b/gi, 'Curva acentuada à esquerda'],
      [/\bMake a U-turn\b/gi, 'Faça retorno'],
      // Prepositions
      [/\bon\b/gi, 'na'],
      [/\bonto\b/gi, 'para'],
      [/\btoward\b/gi, 'em direção a'],
      [/\btowards\b/gi, 'em direção a'],
      [/\bafter\b/gi, 'após'],
      [/\bPass by\b/gi, 'Passe por'],
      [/\bat\b/gi, 'em'],
      [/\bthe\b/gi, ''],
      // Distance
      [/\bin (\d+) ft\b/gi, 'em $1 pés'],
      [/\bin (\d+) m\b/gi, 'em $1 m'],
      [/\bft\b/gi, 'pés'],
      // Location hints
      [/\(on the right\)/gi, '(à direita)'],
      [/\(on the left\)/gi, '(à esquerda)'],
    ];

    let translated = instruction;
    for (const [pattern, replacement] of translations) {
      translated = translated.replace(pattern, replacement);
    }
    // Clean up double spaces
    return translated.replace(/\s+/g, ' ').trim();
  };

  const calculateRoute = useCallback((destination: LatLng, destinationName: string) => {
    if (!userPosition) {
      setLocationError('Ative sua localização primeiro para calcular a rota');
      return;
    }

    setIsCalculatingRoute(true);
    setSelectedAttraction(null);
    setLocationError(null);

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
          setRouteSteps(leg.steps || []);
          setIsNavigating(true);
          setIsNavPanelExpanded(true);
          
          // Center on user and zoom to show route
          if (mapRef.current && userPosition) {
            mapRef.current.panTo(userPosition);
            mapRef.current.setZoom(19);
          }
        } else {
          // Fallback: Calculate straight-line distance when Directions API fails
          console.log('Directions API failed with status:', status);
          
          const straightLineDistance = calculateStraightLineDistance(userPosition, destination);
          // Walking routes are typically 1.3x longer than straight-line distance
          const estimatedWalkingDistance = straightLineDistance * 1.3;
          
          setDirections(null);
          setRouteInfo({
            distance: `~${formatDistance(estimatedWalkingDistance)}`,
            duration: `~${estimateWalkingTime(estimatedWalkingDistance)}`,
            destinationName,
            destination, // Store destination for fallback line
          });
          setRouteSteps([]);
          setIsNavigating(true);
          setIsNavPanelExpanded(true);
          
          // Pan to destination to help user navigate
          if (mapRef.current) {
            // Fit both points in view
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(userPosition);
            bounds.extend(destination);
            mapRef.current.fitBounds(bounds, { top: 100, bottom: 200, left: 50, right: 50 });
          }
        }
      }
    );
  }, [userPosition]);

  const clearRoute = useCallback(() => {
    setDirections(null);
    setRouteInfo(null);
    setRouteSteps([]);
    setIsNavigating(false);
  }, []);

  // Start continuous location tracking for navigation
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não suportada pelo navegador');
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const pos: LatLng = { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        };
        setUserPosition(pos);
        setUserHeading(position.coords.heading);
        setIsLoadingLocation(false);
        
        // Keep map centered on user during navigation
        if (isNavigating && mapRef.current) {
          mapRef.current.panTo(pos);
        }
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
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 1000
      }
    );
  }, [isNavigating]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, [stopLocationTracking]);

  const handleGetLocation = () => {
    startLocationTracking();
    
    // Initial position fetch to center map
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
      () => {
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
      // Start tracking and wait for position
      startLocationTracking();
      
      // Store destination for when position is available
      const checkPosition = setInterval(() => {
        if (userPosition) {
          clearInterval(checkPosition);
          calculateRoute(position, name);
        }
      }, 500);
      
      // Timeout after 10 seconds
      setTimeout(() => clearInterval(checkPosition), 10000);
    } else {
      calculateRoute(position, name);
    }
  };

  const handleStopNavigation = () => {
    clearRoute();
  };

  const handleParkChange = (parkId: string) => {
    const park = PARKS.find(p => p.id === parkId);
    if (park) {
      setSelectedPark(park);
      clearRoute();
    }
  };

  const handleRefreshWaitTimes = () => {
    fetchWaitTimes(selectedPark.id);
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
  };

  const getMarkerIcon = (attraction: Attraction): google.maps.Symbol | undefined => {
    if (typeof google === 'undefined' || !google.maps?.SymbolPath) {
      return undefined;
    }
    
    const waitTimeColor = attraction.waitTime !== undefined 
      ? attraction.waitTime > 60 ? '#EF4444' 
        : attraction.waitTime > 30 ? '#F59E0B' 
        : '#22C55E'
      : '#6B7280';

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: waitTimeColor,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 12,
    };
  };

  const getUserMarkerIcon = (): google.maps.Symbol | undefined => {
    if (typeof google === 'undefined' || !google.maps?.SymbolPath) {
      return undefined;
    }
    return {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: '#3B82F6',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 8,
      rotation: userHeading || 0,
    };
  };

  const getWaitTimeColor = (waitTime: number | undefined) => {
    if (waitTime === undefined) return 'bg-muted text-muted-foreground';
    if (waitTime > 60) return 'bg-red-500 text-white';
    if (waitTime > 30) return 'bg-amber-500 text-white';
    return 'bg-green-500 text-white';
  };

  const sortedAttractions = attractionsWithWaitTimes.sort((a, b) => {
    if (a.isOpen !== b.isOpen) {
      return a.isOpen ? -1 : 1;
    }
    if (a.waitTime !== undefined && b.waitTime !== undefined) {
      return a.waitTime - b.waitTime;
    }
    if (a.waitTime !== undefined) return -1;
    if (b.waitTime !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });

  // Apply filter to attractions
  const filteredAttractions = sortedAttractions.filter(attraction => {
    if (attractionFilter === 'open') return attraction.isOpen === true;
    if (attractionFilter === 'low-wait') return attraction.waitTime !== undefined && attraction.waitTime <= 30;
    return true;
  });

  return (
    <div className="fixed inset-0 flex bg-background">
      {/* Desktop Sidebar - Attractions List */}
      {!isMobile && (
        <aside className="hidden lg:flex flex-col w-80 border-r bg-background z-20">
          {/* Sidebar Header */}
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Atrações
              </h2>
              <Button
                onClick={handleRefreshWaitTimes}
                disabled={isLoadingWaitTimes}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingWaitTimes ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {/* Park Selector */}
            <Select value={selectedPark.id} onValueChange={handleParkChange}>
              <SelectTrigger className="w-full">
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

            {/* Filter Buttons */}
            <div className="flex gap-1">
              <Button
                variant={attractionFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => setAttractionFilter('all')}
              >
                Todas
              </Button>
              <Button
                variant={attractionFilter === 'open' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => setAttractionFilter('open')}
              >
                Abertas
              </Button>
              <Button
                variant={attractionFilter === 'low-wait' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => setAttractionFilter('low-wait')}
              >
                &lt;30 min
              </Button>
            </div>

            {/* Last Update */}
            {lastWaitTimeUpdate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Atualizado às {lastWaitTimeUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {waitTimes.length > 0 && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {waitTimes.filter(w => w.isOpen).length} abertas
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Attractions List */}
          <ScrollArea className="flex-1">
            {isLoadingAttractions ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredAttractions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma atração encontrada</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredAttractions.map((attraction) => (
                  <div
                    key={attraction.id}
                    className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedAttraction?.id === attraction.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedAttraction(attraction);
                      handleNavigateToAttraction(attraction.position);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{attraction.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {attraction.isOpen !== undefined && (
                          <span className={`text-xs ${attraction.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                            ● {attraction.isOpen ? 'Aberto' : 'Fechado'}
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
          </ScrollArea>

          {/* Sidebar Footer with Location Button */}
          <div className="p-3 border-t">
            <Button
              onClick={handleGetLocation}
              disabled={isLoadingLocation}
              variant={userPosition ? 'default' : 'outline'}
              className="w-full"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Navigation className="w-4 h-4 mr-2" />
              )}
              {userPosition ? 'Localização ativa' : 'Ativar localização'}
            </Button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Compact Mobile Header - Only on mobile */}
        {isMobile && (
        <div className="bg-background/95 backdrop-blur-sm border-b z-20 p-2 sm:p-3 safe-area-top">
        <div className="flex items-center gap-2">
          {/* Park Selector - Compact on mobile */}
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

          {/* Refresh Wait Times */}
          <Button
            onClick={handleRefreshWaitTimes}
            disabled={isLoadingWaitTimes}
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingWaitTimes ? 'animate-spin' : ''}`} />
          </Button>

          {/* My Location Button */}
          <Button
            onClick={handleGetLocation}
            disabled={isLoadingLocation}
            variant={userPosition ? 'default' : 'outline'}
            size="icon"
            className="h-9 w-9 shrink-0"
          >
            {isLoadingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </Button>

          {/* Attractions List - Mobile Sheet */}
          <Sheet open={showAttractionsList} onOpenChange={setShowAttractionsList}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 relative">
                <List className="w-4 h-4" />
                {attractionsWithWaitTimes.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {attractionsWithWaitTimes.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
              <SheetHeader className="pb-2">
                <SheetTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Atrações ({attractionsWithWaitTimes.length})
                </SheetTitle>
              </SheetHeader>
              
              {/* Wait time info */}
              {lastWaitTimeUpdate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2 border-b flex-wrap">
                  <Clock className="w-3 h-3" />
                  Atualizado às {lastWaitTimeUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  {waitTimes.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {waitTimes.filter(w => w.isOpen).length} abertas
                    </Badge>
                  )}
                </div>
              )}
              
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
                          setSelectedAttraction(attraction);
                          handleNavigateToAttraction(attraction.position);
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
      </div>
        )}

        {/* Desktop Header - Minimal */}
        {!isMobile && (
          <div className="bg-background/95 backdrop-blur-sm border-b z-20 p-2 flex items-center justify-end gap-2">
            <Button
              onClick={handleGetLocation}
              disabled={isLoadingLocation}
              variant={userPosition ? 'default' : 'outline'}
              size="sm"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Navigation className="w-4 h-4 mr-2" />
              )}
              Minha localização
            </Button>
          </div>
        )}

        {/* Location Error Banner */}
        {locationError && (
        <div className="absolute top-[60px] left-2 right-2 z-30 flex items-center gap-2 p-2 bg-destructive/90 text-destructive-foreground rounded-lg text-sm safe-area-top">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-xs">{locationError}</span>
          <button onClick={() => setLocationError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Full Screen Map */}
      <div className="flex-1 relative">
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={selectedPark.center}
            zoom={selectedPark.zoom}
            options={{
              mapTypeId: 'satellite',
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              zoomControl: false,
              gestureHandling: 'greedy',
            }}
            onLoad={onMapLoad}
            onClick={(e) => {
              const target = (e as any)?.domEvent?.target as HTMLElement | null;
              // Don't close the popup when interacting with it (e.g., tapping the video thumbnail).
              if (target?.closest?.('[data-attraction-popup="true"]')) return;
              setSelectedAttraction(null);
            }}
          >
            {/* User location marker */}
            {userPosition && isMapLoaded && (
              <Marker
                position={userPosition}
                icon={getUserMarkerIcon()}
                title="Sua localização"
                zIndex={1000}
              />
            )}

            {/* Attraction markers from database */}
            {isMapLoaded && attractionsWithWaitTimes.map((attraction) => (
              <Marker
                key={attraction.id}
                position={attraction.position}
                icon={getMarkerIcon(attraction)}
                title={`${attraction.name}${attraction.waitTime !== undefined ? ` - ${attraction.waitTime} min` : ''}`}
                onClick={() => setSelectedAttraction(attraction)}
              />
            ))}

            {/* Attraction Popup over marker */}
            <AnimatePresence>
              {selectedAttraction && !isNavigating && (
                <AttractionPopup
                  attraction={selectedAttraction}
                  parkName={selectedPark.name}
                  onClose={() => setSelectedAttraction(null)}
                  onNavigate={(pos, name) => {
                    setSelectedAttraction(null);
                    handleRouteToAttraction(pos, name);
                  }}
                  isCalculatingRoute={isCalculatingRoute}
                />
              )}
            </AnimatePresence>

            {/* Directions renderer - when API returns full route */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
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

            {/* Fallback line - when Directions API fails, show straight line to destination */}
            {!directions && isNavigating && userPosition && routeInfo?.destination && (
              <Polyline
                path={[userPosition, routeInfo.destination]}
                options={{
                  strokeColor: '#8B5CF6',
                  strokeWeight: 4,
                  strokeOpacity: 0.8,
                  geodesic: true,
                  icons: [
                    {
                      icon: {
                        path: 'M 0,-1 0,1',
                        strokeOpacity: 1,
                        scale: 4,
                      },
                      offset: '0',
                      repeat: '20px',
                    },
                  ],
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>

        {/* Map Legend - Compact floating */}
        <div className="absolute bottom-20 left-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg z-10 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span>&lt;30</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <span>30-60</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span>&gt;60</span>
            </div>
          </div>
        </div>

        {/* Zoom Controls - Mobile friendly */}
        <div className="absolute bottom-20 right-2 flex flex-col gap-1 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 shadow-lg"
            onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 17) + 1)}
          >
            <span className="text-lg font-bold">+</span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 shadow-lg"
            onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 17) - 1)}
          >
            <span className="text-lg font-bold">−</span>
          </Button>
        </div>

        {/* Center on User Button */}
        {userPosition && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-32 right-2 h-10 w-10 shadow-lg z-10"
            onClick={() => {
              if (mapRef.current && userPosition) {
                mapRef.current.panTo(userPosition);
                mapRef.current.setZoom(19);
              }
            }}
          >
            <Navigation className="w-5 h-5 text-blue-500" />
          </Button>
        )}
      </div>

      {/* Navigation Panel - GPS Style */}
      {isNavigating && routeInfo && (
        <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 safe-area-bottom ${isNavPanelExpanded ? 'h-auto' : 'h-16'}`}>
          <Card className="rounded-t-xl rounded-b-none border-t-2 border-blue-500 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl">
            {/* Collapse Toggle */}
            <button 
              onClick={() => setIsNavPanelExpanded(!isNavPanelExpanded)}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full p-1 shadow-lg"
            >
              {isNavPanelExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>

            <CardHeader className="py-2 pb-1 pt-4">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2 truncate">
                  <Navigation className="w-4 h-4 animate-pulse shrink-0" />
                  <span className="truncate">{routeInfo.destinationName}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-xs">{routeInfo.distance}</span>
                  <span className="text-blue-200 text-xs">|</span>
                  <span className="font-bold text-xs">{routeInfo.duration}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      handleStopNavigation();
                      navigate('/dashboard');
                    }}
                    className="text-white hover:bg-white/20 h-8 px-2 gap-1"
                    title="Voltar ao início"
                  >
                    <Home className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">Início</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleStopNavigation}
                    className="text-white hover:bg-red-500/50 h-8 w-8 p-0"
                    title="Parar navegação"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            
            {isNavPanelExpanded && routeSteps.length > 0 && (
              <CardContent className="py-2 pb-4">
                <div className="bg-white/10 rounded-lg p-2 max-h-28 overflow-auto">
                  <p className="text-xs text-blue-200 mb-1">Próximos passos:</p>
                  <div className="space-y-1.5">
                    {routeSteps.slice(0, 3).map((step, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs">
                        <span className="bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span 
                          className="text-white/90 leading-tight"
                          dangerouslySetInnerHTML={{ __html: translateNavigationStep(step.instructions) }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}

            {/* Fallback: Centered compass when no detailed route */}
            {isNavPanelExpanded && routeSteps.length === 0 && routeInfo?.destination && userPosition && (
              <CardContent className="py-4 pb-6">
                <div className="flex flex-col items-center gap-3">
                  {/* Large centered compass arrow with pulse animation */}
                  <div className="relative w-24 h-24">
                    {/* Outer pulse ring */}
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '2s' }} />
                    {/* Static outer ring */}
                    <div className="absolute inset-0 rounded-full bg-white/10 border-2 border-white/40" />
                    {/* Inner glow */}
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                    {/* Arrow with rotation */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
                      style={{ transform: `rotate(${bearingToDestination}deg)` }}
                    >
                      <ArrowUp className="w-12 h-12 text-white drop-shadow-lg animate-pulse" strokeWidth={3} />
                    </div>
                    {/* Cardinal indicators */}
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/70">N</span>
                    <span className="absolute top-1/2 -right-2 -translate-y-1/2 text-[10px] font-bold text-white/50">L</span>
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/50">S</span>
                    <span className="absolute top-1/2 -left-2 -translate-y-1/2 text-[10px] font-bold text-white/50">O</span>
                  </div>

                  {/* Direction info - centered text */}
                  <div className="text-center">
                    <p className="text-sm text-white/90 mb-1">
                      Siga na direção da seta
                    </p>
                    <p className="text-xs text-blue-200 flex items-center justify-center gap-2">
                      <span>Distância: <strong className="text-white">{routeInfo.distance}</strong></span>
                      <span className="text-blue-300">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <strong className="text-white">{routeInfo.duration}</strong>
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}
