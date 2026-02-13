import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import { AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Loader2, AlertCircle, Star, X, Clock, RefreshCw, ChevronUp, ChevronDown, List, Filter, ArrowUp, Volume2, Home, Map, Satellite, Play, Pause, LocateFixed, Car, ParkingCircle, Users, Sparkles } from 'lucide-react';
import { NavigationHUD } from '@/components/map/NavigationHUD';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TravelModeIndicator } from '@/components/travel-mode/TravelModeIndicator';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { AttractionPopup } from '@/components/map/AttractionPopup';
import { POIPopup } from '@/components/map/POIPopup';
import { MenuModal } from '@/components/map/MenuModal';
import { RestaurantSidebarCard } from '@/components/map/RestaurantSidebarCard';
import { LiveShowCard } from '@/components/map/LiveShowCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useLiveShows, type LiveShow } from '@/hooks/useLiveShows';
import { 
  PARKS, 
  POI_CONFIG, 
  GOOGLE_MAPS_API_KEY,
  REFRESH_INTERVALS,
  getParksTableId,
  type ExtendedPOIType,
  type Park 
} from '@/data/constants';

type LatLng = { lat: number; lng: number };

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

interface POI {
  id: string;
  type: ExtendedPOIType;
  name: string;
  position: LatLng;
  schedule?: string | null;
  description?: string | null;
  menuUrl?: string | null;
  cuisineType?: string | null;
  requiresReservation?: boolean | null;
  hasWarning?: boolean | null;
  warningText?: string | null;
  // Additional restaurant fields from restaurants table
  priceRange?: string | null;
  serviceType?: string | null;
  mustTry?: string | null;
  tips?: string | null;
}

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

// Navigation modes: 'preview' shows full route, 'guided' is turn-by-turn with auto-rotation
type NavigationMode = 'preview' | 'guided';

export default function ParkMap() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const headingWatchIdRef = useRef<number | null>(null);
  const [selectedPark, setSelectedPark] = useState(PARKS[0]);
  const [waitTimes, setWaitTimes] = useState<WaitTimeData[]>([]);
  const [dataSource, setDataSource] = useState<string>('');
  const [isLoadingWaitTimes, setIsLoadingWaitTimes] = useState(false);
  const [lastWaitTimeUpdate, setLastWaitTimeUpdate] = useState<Date | null>(null);
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeSteps, setRouteSteps] = useState<google.maps.DirectionsStep[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('preview');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showAttractionsList, setShowAttractionsList] = useState(false);
  const [isNavPanelExpanded, setIsNavPanelExpanded] = useState(true);
  const [attractionFilter, setAttractionFilter] = useState<'all' | 'open' | 'low-wait'>('all');
  const [sidebarTab, setSidebarTab] = useState<'attractions' | 'shows' | 'characters' | ExtendedPOIType>('attractions');
  const [hasPlayedArrivalSound, setHasPlayedArrivalSound] = useState(false);
  const [mapType, setMapType] = useState<'satellite' | 'roadmap'>('satellite');
  const [visiblePOIs, setVisiblePOIs] = useState<Set<ExtendedPOIType>>(new Set(['restroom', 'restaurant', 'shop', 'firstaid', 'show']));
  const [showAttractionMarkers, setShowAttractionMarkers] = useState(true);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [menuModalData, setMenuModalData] = useState<{ url: string; name: string } | null>(null);
  
  // Waze-like navigation enhancements
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [walkingSpeed, setWalkingSpeed] = useState<number | null>(null);
  const [isOffCenter, setIsOffCenter] = useState(false);
  const lastPositionRef = useRef<{ pos: LatLng; time: number } | null>(null);
  
  // Live shows and characters from API
  const { shows: liveShows, isLoading: isLoadingLiveShows, lastUpdate: lastShowsUpdate } = useLiveShows(selectedPark.id, 60000);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastHeadingRef = useRef<number>(0);
  
  // Car parking location - persisted in localStorage
  const [carLocation, setCarLocation] = useState<LatLng | null>(() => {
    const saved = localStorage.getItem('parked-car-location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Save car location to localStorage whenever it changes
  useEffect(() => {
    if (carLocation) {
      localStorage.setItem('parked-car-location', JSON.stringify(carLocation));
    } else {
      localStorage.removeItem('parked-car-location');
    }
  }, [carLocation]);

  // Save car location at current position
  const saveCarLocation = useCallback(() => {
    if (!userPosition) {
      toast.error('Ative sua localização primeiro', {
        description: 'Precisamos saber onde você está para marcar o carro'
      });
      return;
    }
    setCarLocation(userPosition);
    toast.success('🚗 Localização do carro salva!', {
      description: 'Toque no botão do carro para navegar de volta'
    });
  }, [userPosition]);

  // Clear car location
  const clearCarLocation = useCallback(() => {
    setCarLocation(null);
    toast.info('Localização do carro removida');
  }, []);

  // Fetch POIs for current park from database (content_items)
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

  // Fetch restaurants from the restaurants table (managed via Admin Panel)
  // Use getParksTableId to convert content_categories ID to parks table ID
  const parksTableId = getParksTableId(selectedPark.id);
  const { data: dbRestaurants = [] } = useQuery({
    queryKey: ['map-restaurants', selectedPark.id, parksTableId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, latitude, longitude, description, menu_url, cuisine, reservation_required, tips, must_try, price_range, type')
        .eq('park_id', parksTableId);

      if (error) throw error;
      return data;
    },
  });


  // Transform database POIs to the expected format
  const contentItemPOIs: POI[] = dbPOIs
    .filter(poi => poi.latitude && poi.longitude)
    .map(poi => ({
      id: poi.id,
      type: (poi.icon as ExtendedPOIType) || 'restroom',
      name: poi.title,
      position: { lat: Number(poi.latitude), lng: Number(poi.longitude) },
      schedule: poi.schedule,
      description:
        (typeof poi.description === 'string' && poi.description.trim())
          ? poi.description
          : (typeof (poi as any).attraction_description === 'string' && (poi as any).attraction_description.trim())
            ? (poi as any).attraction_description
            : null,
      menuUrl: poi.menu_url,
      cuisineType: poi.cuisine_type,
      requiresReservation: poi.requires_reservation,
      hasWarning: poi.has_warning,
      warningText: poi.warning_text,
    }));

  // Transform restaurants table data to POI format with all fields
  const restaurantPOIs: POI[] = dbRestaurants
    .filter(r => r.latitude && r.longitude)
    .map(r => ({
      id: `restaurant-${r.id}`,
      type: 'restaurant' as ExtendedPOIType,
      name: r.name,
      position: { lat: Number(r.latitude), lng: Number(r.longitude) },
      schedule: null,
      description: r.description,
      menuUrl: r.menu_url,
      cuisineType: r.cuisine,
      requiresReservation: r.reservation_required,
      hasWarning: false,
      warningText: null,
      // Additional restaurant-specific fields
      priceRange: r.price_range,
      serviceType: r.type,
      mustTry: r.must_try,
      tips: r.tips,
    }));

  // Merge POIs: restaurants from restaurants table + other POIs from content_items
  // Avoid duplicates by filtering out content_items restaurants that might overlap
  const nonRestaurantPOIs = contentItemPOIs.filter(poi => poi.type !== 'restaurant');
  const currentParkPOIs: POI[] = [...nonRestaurantPOIs, ...restaurantPOIs];

  // Toggle POI visibility
  const togglePOIType = (type: ExtendedPOIType) => {
    setVisiblePOIs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  // Get POI marker icon with unique, visually distinct SVG paths
  const getPOIMarkerIcon = (type: ExtendedPOIType): google.maps.Icon | google.maps.Symbol | undefined => {
    if (typeof google === 'undefined') {
      return undefined;
    }
    const config = POI_CONFIG[type];
    
    // Beautiful modern markers with emoji in the center - clean pill/badge shape
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
      <!-- Drop shadow -->
      <ellipse cx="22" cy="48" rx="8" ry="3" fill="rgba(0,0,0,0.25)"/>
      <!-- Pin body - rounded balloon shape -->
      <path d="M22 47 C22 47 40 30 40 20 C40 9 32 2 22 2 C12 2 4 9 4 20 C4 30 22 47 22 47Z" 
            fill="${config.color}" stroke="white" stroke-width="2.5"/>
      <!-- Inner white circle for emoji -->
      <circle cx="22" cy="19" r="13" fill="white"/>
      <!-- Emoji text -->
      <text x="22" y="25" text-anchor="middle" font-size="16" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${config.emoji}</text>
    </svg>`;
    
    const svgUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    
    return {
      url: svgUrl,
      scaledSize: new google.maps.Size(44, 52),
      anchor: new google.maps.Point(22, 48),
    };
  };

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
    } catch {
      // Silent fail - audio is not critical
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

  // Reset navigation state when starting/stopping
  useEffect(() => {
    if (!isNavigating) {
      setHasPlayedArrivalSound(false);
      setCurrentStepIndex(0);
      setWalkingSpeed(null);
      setIsOffCenter(false);
      lastPositionRef.current = null;
    }
  }, [isNavigating]);

  // Calculate walking speed from GPS position changes
  useEffect(() => {
    if (!userPosition || !isNavigating) return;
    
    const now = Date.now();
    const prev = lastPositionRef.current;
    
    if (prev) {
      const dt = (now - prev.time) / 1000; // seconds
      if (dt > 1 && dt < 30) { // Ignore stale or too-frequent updates
        const dist = calculateStraightLineDistance(prev.pos, userPosition);
        const speedKmh = (dist / dt) * 3.6;
        // Filter out unrealistic speeds (> 15 km/h walking)
        if (speedKmh < 15) {
          setWalkingSpeed(s => s === null ? speedKmh : s * 0.7 + speedKmh * 0.3); // Smoothing
        }
      }
    }
    
    lastPositionRef.current = { pos: userPosition, time: now };
  }, [userPosition, isNavigating]);

  // Auto-advance navigation steps based on proximity to step endpoints
  useEffect(() => {
    if (!isNavigating || !userPosition || routeSteps.length === 0 || navigationMode !== 'guided') return;
    
    const step = routeSteps[currentStepIndex] as any;
    if (!step?.end_location) return;
    
    const endLat = typeof step.end_location.lat === 'function' ? step.end_location.lat() : step.end_location.lat;
    const endLng = typeof step.end_location.lng === 'function' ? step.end_location.lng() : step.end_location.lng;
    
    const distToEnd = calculateStraightLineDistance(userPosition, { lat: endLat, lng: endLng });
    
    // Advance to next step when within 15m of step endpoint
    if (distToEnd < 15 && currentStepIndex < routeSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [userPosition, isNavigating, currentStepIndex, routeSteps, navigationMode]);

  // Detect when user pans away from their position (off-center)
  useEffect(() => {
    if (!mapRef.current || navigationMode !== 'guided' || !userPosition) {
      setIsOffCenter(false);
      return;
    }
    
    const listener = mapRef.current.addListener('center_changed', () => {
      const center = mapRef.current?.getCenter();
      if (!center || !userPosition) return;
      const dist = calculateStraightLineDistance(
        { lat: center.lat(), lng: center.lng() },
        userPosition
      );
      setIsOffCenter(dist > 50); // More than 50m from user
    });
    
    return () => google.maps.event.removeListener(listener);
  }, [navigationMode, userPosition]);

  // Open navigation in external app (Google Maps or Waze)
  const openExternalNav = useCallback((app: 'google' | 'waze') => {
    if (!routeInfo?.destination) return;
    const { lat, lng } = routeInfo.destination;
    
    let url: string;
    if (app === 'waze') {
      url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    }
    
    window.open(url, '_blank');
  }, [routeInfo?.destination]);

  // Re-center on user position
  const recenterOnUser = useCallback(() => {
    if (mapRef.current && userPosition) {
      mapRef.current.panTo(userPosition);
      mapRef.current.setZoom(19);
      setIsOffCenter(false);
    }
  }, [userPosition]);

  // Fetch attractions from database with real coordinates
  const { data: dbAttractions = [], isLoading: isLoadingAttractions } = useQuery({
    queryKey: ['park-attractions', selectedPark.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, description, latitude, longitude, thrill_level, min_height, pass_type, type')
        .eq('category_id', selectedPark.id)
        .neq('type', 'poi') // Exclude POIs - only attractions get star markers
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

  // Ref to track if a fetch is in progress (prevents overlapping requests)
  const isFetchingRef = useRef(false);
  
  // Fetch wait times from API - optimized for frequent updates
  const fetchWaitTimes = useCallback(async (parkId: string, isBackground = false) => {
    // Prevent overlapping requests
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    // Only show loading indicator on initial load, not background updates
    if (!isBackground) {
      setIsLoadingWaitTimes(true);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('queue-times', {
        body: { parkId },
      });

      if (error) {
        console.error('Error fetching wait times:', error);
        // Don't clear wait times on error - keep showing last known data
      } else if (Array.isArray((data as any)?.data)) {
        // Some deployments return { data: Ride[] } without a success flag.
        setWaitTimes((data as any).data);
        setDataSource((data as any)?.source || 'unknown');
        setLastWaitTimeUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch wait times:', err);
      // Don't clear wait times on error - keep showing last known data
    }
    
    if (!isBackground) {
      setIsLoadingWaitTimes(false);
    }
    isFetchingRef.current = false;
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

  // Auto-refresh wait times - 15 seconds for desktop (planning mode), 30 seconds for mobile (battery saving)
  useEffect(() => {
    // Fetch immediately on park change so the UI doesn't stay with "—" until the first interval tick
    fetchWaitTimes(selectedPark.id, false);

    const refreshInterval = isMobile ? 30000 : 15000;
    const interval = setInterval(() => {
      fetchWaitTimes(selectedPark.id, true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [selectedPark.id, fetchWaitTimes, isMobile]);

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
            destination,
          });
          setRouteSteps(leg.steps || []);
          setIsNavigating(true);
          setNavigationMode('preview'); // Start in preview mode - show full route
          setIsNavPanelExpanded(true);
          
          // Fit the entire route in view for preview mode
          if (mapRef.current) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(userPosition);
            bounds.extend(destination);
            mapRef.current.fitBounds(bounds, { top: 100, bottom: 250, left: 50, right: 50 });
            // Reset rotation for preview
            mapRef.current.setHeading(0);
            mapRef.current.setTilt(0);
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
          setNavigationMode('preview');
          setIsNavPanelExpanded(true);
          
          // Fit both points in view
          if (mapRef.current) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(userPosition);
            bounds.extend(destination);
            mapRef.current.fitBounds(bounds, { top: 100, bottom: 200, left: 50, right: 50 });
            mapRef.current.setHeading(0);
            mapRef.current.setTilt(0);
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
    setNavigationMode('preview');
    // Reset map rotation
    if (mapRef.current) {
      mapRef.current.setHeading(0);
      mapRef.current.setTilt(0);
    }
  }, []);

  // Navigate to parked car
  const navigateToCar = useCallback(() => {
    if (!carLocation) {
      toast.error('Nenhum carro marcado', {
        description: 'Primeiro estacione e marque a localização'
      });
      return;
    }
    if (!userPosition) {
      toast.info('Ativando localização...', {
        description: 'Tente novamente em alguns segundos'
      });
      return;
    }
    calculateRoute(carLocation, '🚗 Meu Carro');
  }, [carLocation, userPosition, calculateRoute]);

  // Start guided navigation mode with auto-rotation
  const startGuidedNavigation = useCallback(() => {
    setNavigationMode('guided');
    
    // Center on user and zoom in for guided mode
    if (mapRef.current && userPosition) {
      mapRef.current.panTo(userPosition);
      mapRef.current.setZoom(19);
      mapRef.current.setTilt(45); // Add 3D perspective
      mapRef.current.setHeading(userHeading); // Rotate to user heading
    }
  }, [userPosition, userHeading]);

  // Update map rotation when in guided mode
  useEffect(() => {
    if (navigationMode === 'guided' && mapRef.current && isNavigating) {
      // Smooth rotation - only rotate if heading changed significantly (>5 degrees)
      const headingDiff = Math.abs(userHeading - lastHeadingRef.current);
      if (headingDiff > 5 || headingDiff > 355) {
        mapRef.current.setHeading(userHeading);
        lastHeadingRef.current = userHeading;
      }
      // Keep user centered
      if (userPosition) {
        mapRef.current.panTo(userPosition);
      }
    }
  }, [userHeading, userPosition, navigationMode, isNavigating]);

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
        
        // Update heading from GPS if available
        if (position.coords.heading !== null && !isNaN(position.coords.heading)) {
          setUserHeading(position.coords.heading);
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
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 1000
      }
    );

    // Also use device orientation for more accurate heading on mobile
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null && navigationMode === 'guided') {
        // Convert device orientation to compass heading
        // alpha is 0-360 where 0 = north
        let heading = event.alpha;
        if ((event as any).webkitCompassHeading !== undefined) {
          heading = (event as any).webkitCompassHeading;
        } else if (event.alpha !== null) {
          heading = 360 - event.alpha;
        }
        setUserHeading(heading);
      }
    };

    // Request permission for device orientation on iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    // Store cleanup function reference
    headingWatchIdRef.current = 1; // Flag that orientation listener is active
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [navigationMode]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    headingWatchIdRef.current = null;
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

  // Mickey head SVG for attraction markers with wait time colors
  const getMarkerIcon = (attraction: Attraction): google.maps.Icon | undefined => {
    if (typeof google === 'undefined') {
      return undefined;
    }
    
    const waitTimeColor = attraction.waitTime !== undefined 
      ? attraction.waitTime > 60 ? '#EF4444' 
        : attraction.waitTime > 30 ? '#F59E0B' 
        : '#22C55E'
      : '#6B7280';

    // Attraction marker: Star/burst shape with wait time - 64px size (reduced 20% from 80px)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 80 80">
      <!-- Outer glow -->
      <circle cx="40" cy="40" r="36" fill="${waitTimeColor}" opacity="0.3"/>
      <!-- Main star shape -->
      <path d="M40 4 L46 28 L70 28 L50 44 L58 70 L40 54 L22 70 L30 44 L10 28 L34 28 Z" 
            fill="${waitTimeColor}" stroke="white" stroke-width="3" stroke-linejoin="round"/>
      ${attraction.waitTime !== undefined ? `
        <circle cx="40" cy="40" r="16" fill="white" opacity="0.95"/>
        <text x="40" y="46" text-anchor="middle" fill="${waitTimeColor}" font-size="18" font-weight="bold" font-family="Arial, sans-serif">${attraction.waitTime}</text>
      ` : ''}
    </svg>`;
    
    const svgUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    
    return {
      url: svgUrl,
      scaledSize: new google.maps.Size(64, 64),
      anchor: new google.maps.Point(32, 32),
    };
  };

  const getUserMarkerIcon = (): google.maps.Symbol | undefined => {
    if (typeof google === 'undefined' || !google.maps?.SymbolPath) {
      return undefined;
    }
    
    // In guided mode, we don't rotate the marker since the map rotates instead
    // The arrow always points "forward" (up) relative to the map
    return {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: '#3B82F6',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3,
      scale: navigationMode === 'guided' ? 10 : 8,
      rotation: navigationMode === 'guided' ? 0 : (userHeading || 0),
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* App Sidebar - Navigation Menu (left) - Desktop Only */}
      <AppSidebar />

      {/* Main Content Area - flex layout with proper desktop sidebar spacing */}
      <div className="flex-1 flex lg:ml-72 min-h-0 overflow-hidden">
        {/* Map + Controls Column - Takes remaining space */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Compact Mobile Header - Only on mobile */}
          {isMobile && (
          <div className="bg-background/95 backdrop-blur-sm border-b z-20 safe-area-top">
            {/* Top row: Park selector + action buttons */}
            <div className="flex items-center gap-2 p-2">
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

            {/* Horizontal Filter Pills - Scrollable on mobile */}
            <div className="overflow-x-auto scrollbar-hide -mx-2 px-2 pb-2">
              <div className="flex gap-1.5 min-w-max">
                {/* Attractions toggle pill */}
                <button
                  onClick={() => setShowAttractionMarkers(!showAttractionMarkers)}
                  className={`filter-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 touch-manipulation ${
                    showAttractionMarkers 
                      ? 'bg-gradient-to-r from-green-500 to-amber-500 text-white shadow-md' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span>⭐</span>
                  <span>Atrações</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                    {attractionsWithWaitTimes.length}
                  </span>
                </button>
                
                {/* POI type toggle pills */}
                {(Object.keys(POI_CONFIG) as ExtendedPOIType[]).map((type) => {
                  const config = POI_CONFIG[type];
                  const isActive = visiblePOIs.has(type);
                  const count = currentParkPOIs.filter(p => p.type === type).length;
                  return (
                    <button
                      key={type}
                      onClick={() => togglePOIType(type)}
                      className={`filter-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 touch-manipulation ${
                        isActive 
                          ? 'text-white shadow-md' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                      style={isActive ? { backgroundColor: config.color } : {}}
                    >
                      <span>{config.emoji}</span>
                      <span>{config.label}</span>
                      {count > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20' : 'bg-background'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
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

      {/* Full Screen Map - flex-1 and min-h-0 to fill remaining space */}
      <div className="flex-1 min-h-0 relative">
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={selectedPark.center}
            zoom={selectedPark.zoom}
            options={{
              mapTypeId: mapType === 'satellite' ? 'hybrid' : 'roadmap',
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              zoomControl: false,
              gestureHandling: 'greedy',
              tilt: mapType === 'satellite' ? 45 : 0,
              heading: 0,
            }}
            onLoad={onMapLoad}
            onClick={(e) => {
              const target = (e as any)?.domEvent?.target as HTMLElement | null;
              // Don't close the popup when interacting with it (e.g., tapping the video thumbnail).
              if (target?.closest?.('[data-attraction-popup="true"], [data-poi-popup="true"]')) return;
              setSelectedAttraction(null);
              setSelectedPOI(null);
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
            {isMapLoaded && showAttractionMarkers && attractionsWithWaitTimes.map((attraction) => (
              <Marker
                key={attraction.id}
                position={attraction.position}
                icon={getMarkerIcon(attraction)}
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
                  icon={getPOIMarkerIcon(poi.type)}
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
            {carLocation && isMapLoaded && (
              <Marker
                position={carLocation}
                icon={{
                  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="11" fill="#F59E0B" stroke="white" stroke-width="2"/>
                    <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" stroke="white" stroke-width="1.5" fill="none" transform="translate(0, 1)"/>
                    <rect x="4" y="11" width="16" height="6" rx="2" fill="white" transform="translate(0, 1)"/>
                    <circle cx="7" cy="16" r="1.5" fill="#F59E0B" transform="translate(0, 1)"/>
                    <circle cx="17" cy="16" r="1.5" fill="#F59E0B" transform="translate(0, 1)"/>
                  </svg>`)}`,
                  scaledSize: new google.maps.Size(36, 36),
                  anchor: new google.maps.Point(18, 18),
                }}
                title="🚗 Meu Carro"
                zIndex={900}
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.panTo(carLocation);
                    mapRef.current.setZoom(18);
                  }
                }}
              />
            )}

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

            {/* POI Popup over marker - INSIDE GoogleMap for OverlayView to work */}
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
                  onOpenMenu={(url, name) => {
                    setMenuModalData({ url, name });
                  }}
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

        {/* Centered GPS Navigation Arrow - Waze Style */}
        {navigationMode === 'guided' && isNavigating && userPosition && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            {/* GPS Navigation Cone/Arrow - Waze style */}
            <div className="relative">
              {/* Outer glow pulse */}
              <div className="absolute -inset-4 rounded-full bg-blue-400/20 blur-xl animate-pulse" />
              
              {/* Direction cone/beam (the "vision" area) */}
              <div 
                className="absolute w-0 h-0 left-1/2 -translate-x-1/2"
                style={{
                  bottom: '50%',
                  borderLeft: '40px solid transparent',
                  borderRight: '40px solid transparent',
                  borderBottom: '80px solid rgba(59, 130, 246, 0.25)',
                }}
              />
              
              {/* Main navigation arrow - Waze style triangle */}
              <svg 
                width="60" 
                height="60" 
                viewBox="0 0 60 60" 
                className="drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.5))',
                }}
              >
                {/* Outer glow layer */}
                <defs>
                  <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                  <filter id="arrowShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1E40AF" floodOpacity="0.5"/>
                  </filter>
                </defs>
                
                {/* White outline */}
                <polygon 
                  points="30,5 50,50 30,40 10,50" 
                  fill="white"
                  filter="url(#arrowShadow)"
                />
                
                {/* Blue fill with gradient */}
                <polygon 
                  points="30,8 47,47 30,38 13,47" 
                  fill="url(#arrowGradient)"
                />
                
                {/* Highlight on left side */}
                <polygon 
                  points="30,8 30,38 13,47" 
                  fill="rgba(255,255,255,0.15)"
                />
              </svg>
              
              {/* Center dot */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-600 shadow-lg" />
            </div>
          </div>
        )}

        {/* POI Filters - Floating buttons (Desktop only - mobile uses horizontal pills in header) */}
        {!isMobile && navigationMode !== 'guided' && (
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          {/* Attractions toggle */}
          <Button
            variant={showAttractionMarkers ? 'default' : 'secondary'}
            size="sm"
            className={`h-8 px-2 shadow-lg text-xs gap-1 ${showAttractionMarkers ? 'bg-gradient-to-r from-green-500 to-amber-500' : 'opacity-70'}`}
            onClick={() => setShowAttractionMarkers(!showAttractionMarkers)}
            title="Atrações"
          >
            <span>⭐</span>
            <span>{attractionsWithWaitTimes.length}</span>
          </Button>
          {/* POI type toggles */}
          {(Object.keys(POI_CONFIG) as ExtendedPOIType[]).map((type) => {
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
                <span>{count}</span>
              </Button>
            );
          })}
        </div>
        )}

        {/* Travel Mode Indicator */}
        <TravelModeIndicator />

        {/* Map Legend - Desktop only (mobile has limited space) */}
        {!isMobile && (
        <div className="absolute top-16 left-2 bg-background/95 backdrop-blur-sm rounded-xl p-2.5 shadow-lg z-10 border border-border/50">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-xs text-foreground">Tempo de Espera</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">&lt;30</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <span className="text-muted-foreground">30-60</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="text-muted-foreground">&gt;60</span>
            </div>
          </div>
        </div>
        )}

        {/* Zoom Controls - Mobile friendly - adjusted for mobile nav */}
        <div className="absolute bottom-24 lg:bottom-4 right-2 flex flex-col gap-1 z-10">
          {/* Map Type Toggle */}
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 shadow-lg"
            onClick={() => setMapType(mapType === 'satellite' ? 'roadmap' : 'satellite')}
            title={mapType === 'satellite' ? 'Mudar para mapa normal' : 'Mudar para satélite'}
          >
            {mapType === 'satellite' ? (
              <Map className="w-5 h-5" />
            ) : (
              <Satellite className="w-5 h-5" />
            )}
          </Button>
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

        {/* "Onde Estou" Button - GPS Location with prominent styling */}
        <Button
          variant={userPosition ? 'default' : 'secondary'}
          size="icon"
          className={`absolute bottom-44 lg:bottom-36 right-2 h-12 w-12 shadow-lg z-10 transition-all duration-300 ${
            userPosition 
              ? 'bg-blue-500 hover:bg-blue-600 ring-4 ring-blue-500/30' 
              : 'hover:bg-muted'
          } ${isLoadingLocation ? 'animate-pulse' : ''}`}
          onClick={() => {
            if (userPosition && mapRef.current) {
              // If already have position, just center on it
              mapRef.current.panTo(userPosition);
              mapRef.current.setZoom(19);
              toast.success('📍 Localização centralizada', {
                description: 'Mapa focado na sua posição atual',
                duration: 2000,
              });
            } else {
              // Request location for the first time
              handleGetLocation();
              toast.info('🔄 Obtendo localização...', {
                description: 'Aguarde enquanto localizamos você',
                duration: 3000,
              });
            }
          }}
          disabled={isLoadingLocation}
          title={userPosition ? 'Centralizar na minha localização' : 'Ativar GPS - Onde Estou'}
        >
          {isLoadingLocation ? (
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          ) : (
            <LocateFixed className={`w-6 h-6 ${userPosition ? 'text-white' : 'text-blue-500'}`} />
          )}
        </Button>
        
        {/* GPS Status Indicator - Shows when location is active */}
        {userPosition && !isNavigating && (
          <div className="absolute bottom-[220px] lg:bottom-[180px] right-2 bg-background/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg z-10 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">GPS Ativo</span>
          </div>
        )}

        {/* Car Parking Controls - Floating on left side - adjusted for mobile nav */}
        <div className="absolute bottom-36 lg:bottom-16 left-2 flex flex-col gap-1 z-10">
          {/* Save Car Location Button */}
          <Button
            variant={carLocation ? 'default' : 'secondary'}
            size="icon"
            className={`h-10 w-10 shadow-lg ${carLocation ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
            onClick={carLocation ? navigateToCar : saveCarLocation}
            title={carLocation ? 'Ir para o carro' : 'Marcar onde estacionei'}
          >
            <Car className={`w-5 h-5 ${carLocation ? 'text-white' : ''}`} />
          </Button>
          
          {/* Clear Car Location (only show if car is saved) */}
          {carLocation && (
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 shadow-lg"
              onClick={clearCarLocation}
              title="Remover marcação do carro"
            >
              <X className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>

      {/* Waze-like HUD - Mobile Guided Mode */}
      {isMobile && isNavigating && routeInfo && navigationMode === 'guided' && (
        <NavigationHUD
          destinationName={routeInfo.destinationName}
          distance={routeInfo.distance}
          duration={routeInfo.duration}
          currentStepIndex={currentStepIndex}
          steps={routeSteps.map(s => ({
            instructions: s.instructions,
            distance: s.distance ? { text: s.distance.text, value: s.distance.value } : undefined,
            duration: s.duration ? { text: s.duration.text, value: s.duration.value } : undefined,
            maneuver: (s as any).maneuver,
          }))}
          speed={walkingSpeed}
          distanceToNextStep={(() => {
            if (!userPosition || routeSteps.length === 0) return null;
            const step = routeSteps[currentStepIndex] as any;
            if (!step?.end_location) return null;
            const endLat = typeof step.end_location.lat === 'function' ? step.end_location.lat() : step.end_location.lat;
            const endLng = typeof step.end_location.lng === 'function' ? step.end_location.lng() : step.end_location.lng;
            return calculateStraightLineDistance(userPosition, { lat: endLat, lng: endLng });
          })()}
          destination={routeInfo.destination || null}
          userPosition={userPosition}
          onStop={handleStopNavigation}
          onRecenter={recenterOnUser}
          isOffCenter={isOffCenter}
          onOpenExternal={openExternalNav}
        />
      )}

      {/* Navigation Panel - Preview mode OR Desktop guided mode */}
      {isNavigating && routeInfo && !(isMobile && navigationMode === 'guided') && (
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
                  <Navigation className={`w-4 h-4 shrink-0 ${navigationMode === 'guided' ? 'animate-pulse' : ''}`} />
                  <span className="truncate">{routeInfo.destinationName}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-xs">{routeInfo.distance}</span>
                  <span className="text-blue-200 text-xs">|</span>
                  <span className="font-bold text-xs">{routeInfo.duration}</span>
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
            
            {isNavPanelExpanded && (
              <CardContent className="py-3 pb-5">
                {/* Mode indicator and controls */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={navigationMode === 'guided' ? 'default' : 'secondary'}
                      className={navigationMode === 'guided' ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}
                    >
                      {navigationMode === 'guided' ? '🧭 Navegando' : '👁️ Visualizando rota'}
                    </Badge>
                  </div>
                  
                  {/* Play/Pause Navigation Button */}
                  <Button
                    size="sm"
                    onClick={() => {
                      if (navigationMode === 'preview') {
                        startGuidedNavigation();
                      } else {
                        setNavigationMode('preview');
                        if (mapRef.current && userPosition && routeInfo.destination) {
                          const bounds = new google.maps.LatLngBounds();
                          bounds.extend(userPosition);
                          bounds.extend(routeInfo.destination);
                          mapRef.current.fitBounds(bounds, { top: 100, bottom: 250, left: 50, right: 50 });
                          mapRef.current.setHeading(0);
                          mapRef.current.setTilt(0);
                        }
                      }
                    }}
                    className={`gap-2 ${
                      navigationMode === 'guided' 
                        ? 'bg-amber-500 hover:bg-amber-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {navigationMode === 'guided' ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Ver Rota
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Iniciar Navegação
                      </>
                    )}
                  </Button>
                </div>

                {/* Preview Mode: Show route steps */}
                {navigationMode === 'preview' && routeSteps.length > 0 && (
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-blue-200 mb-2 font-medium">📋 Instruções da rota:</p>
                    <div className="space-y-2 max-h-32 overflow-auto">
                      {routeSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                            {index + 1}
                          </span>
                          <span 
                            className="text-white/90 leading-tight"
                            dangerouslySetInnerHTML={{ __html: translateNavigationStep(step.instructions) }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-200 mt-3 text-center">
                      Toque em "Iniciar Navegação" para ser guiado em tempo real
                    </p>
                  </div>
                )}

                {/* Guided Mode info (desktop only - mobile uses HUD) */}
                {navigationMode === 'guided' && !isMobile && routeInfo?.destination && userPosition && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-6 w-full">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{routeInfo.distance}</p>
                        <p className="text-xs text-blue-200">Distância</p>
                      </div>
                      <div className="w-px h-10 bg-white/30" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{routeInfo.duration}</p>
                        <p className="text-xs text-blue-200">Tempo estimado</p>
                      </div>
                    </div>
                    {routeSteps.length > 0 && (
                      <div className="bg-white/10 rounded-lg p-3 w-full">
                        <p className="text-xs text-blue-200 mb-1 flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          Próxima instrução:
                        </p>
                        <p 
                          className="text-sm text-white font-medium"
                          dangerouslySetInnerHTML={{ __html: translateNavigationStep(routeSteps[currentStepIndex]?.instructions || '') }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-blue-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      GPS ativo • Mapa gira automaticamente
                    </p>
                  </div>
                )}

                {/* Fallback: When no route steps available */}
                {navigationMode === 'preview' && routeSteps.length === 0 && routeInfo?.destination && (
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <div className="absolute inset-0 rounded-full bg-white/10 border-2 border-white/40" />
                      <div 
                        className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
                        style={{ transform: `rotate(${bearingToDestination}deg)` }}
                      >
                        <ArrowUp className="w-10 h-10 text-white" strokeWidth={3} />
                      </div>
                    </div>
                    <p className="text-sm text-white/90">
                      Siga na direção indicada
                    </p>
                    <p className="text-xs text-blue-200 mt-1">
                      Distância aproximada: {routeInfo.distance}
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}
        </div>

        {/* Right Sidebar - Park Info (Desktop Only) - Fixed height with overflow */}
        {!isMobile && (
          <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-l bg-background shrink-0 h-full overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-3 border-b space-y-2">
              {/* Park Selector */}
              <div className="flex items-center gap-2">
                <Select value={selectedPark.id} onValueChange={handleParkChange}>
                  <SelectTrigger className="flex-1 h-9">
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
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingWaitTimes ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
                <Button
                  variant={sidebarTab === 'attractions' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs shrink-0 gap-1"
                  onClick={() => setSidebarTab('attractions')}
                >
                  ⭐ Atrações
                  <Badge variant="secondary" className="text-[10px] px-1 h-4 ml-0.5">
                    {attractionsWithWaitTimes.length}
                  </Badge>
                </Button>
                {/* Shows Tab */}
                <Button
                  variant={sidebarTab === 'shows' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs shrink-0 gap-1"
                  onClick={() => setSidebarTab('shows')}
                  style={sidebarTab === 'shows' ? { backgroundColor: '#EC4899' } : {}}
                >
                  🎭 Shows
                  <Badge variant="secondary" className="text-[10px] px-1 h-4 ml-0.5">
                    {liveShows.filter(s => s.entityType === 'SHOW').length}
                  </Badge>
                </Button>
                {/* Characters Tab */}
                <Button
                  variant={sidebarTab === 'characters' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs shrink-0 gap-1"
                  onClick={() => setSidebarTab('characters')}
                  style={sidebarTab === 'characters' ? { backgroundColor: '#8B5CF6' } : {}}
                >
                  🤗 Personagens
                  <Badge variant="secondary" className="text-[10px] px-1 h-4 ml-0.5">
                    {liveShows.filter(s => s.entityType === 'CHARACTER').length}
                  </Badge>
                </Button>
                {(Object.keys(POI_CONFIG) as ExtendedPOIType[]).map((type) => {
                  const config = POI_CONFIG[type];
                  const count = currentParkPOIs.filter(p => p.type === type).length;
                  return (
                    <Button
                      key={type}
                      variant={sidebarTab === type ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 px-2 text-xs shrink-0 gap-1"
                      onClick={() => setSidebarTab(type)}
                      style={sidebarTab === type ? { backgroundColor: config.color } : {}}
                    >
                      {config.emoji}
                      <Badge variant="secondary" className="text-[10px] px-1 h-4 ml-0.5">
                        {count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>

              {/* Attraction Filters */}
              {sidebarTab === 'attractions' && (
                <>
                  <div className="flex gap-1">
                    <Button
                      variant={attractionFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs h-7"
                      onClick={() => setAttractionFilter('all')}
                    >
                      Todas
                    </Button>
                    <Button
                      variant={attractionFilter === 'open' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs h-7"
                      onClick={() => setAttractionFilter('open')}
                    >
                      Abertas
                    </Button>
                    <Button
                      variant={attractionFilter === 'low-wait' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs h-7"
                      onClick={() => setAttractionFilter('low-wait')}
                    >
                      &lt;30 min
                    </Button>
                  </div>

                  {lastWaitTimeUpdate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="relative">
                        <Clock className="w-3 h-3" />
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      </div>
                      <span>Ao vivo • {lastWaitTimeUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      {waitTimes.length > 0 && (
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {waitTimes.filter(w => w.isOpen).length} abertas
                        </Badge>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Shows Header */}
              {sidebarTab === 'shows' && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: '#EC4899' }}>
                    🎭
                  </div>
                  <span className="font-medium text-sm">Shows ao Vivo</span>
                  <Badge variant="secondary" className="text-xs ml-auto bg-pink-500/20 text-pink-600 dark:text-pink-400">
                    {liveShows.filter(s => s.entityType === 'SHOW').length} shows
                  </Badge>
                </div>
              )}

              {/* Characters Header */}
              {sidebarTab === 'characters' && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: '#8B5CF6' }}>
                    🤗
                  </div>
                  <span className="font-medium text-sm">Encontro com Personagens</span>
                  <Badge variant="secondary" className="text-xs ml-auto bg-purple-500/20 text-purple-600 dark:text-purple-400">
                    {liveShows.filter(s => s.entityType === 'CHARACTER').length} personagens
                  </Badge>
                </div>
              )}

              {sidebarTab !== 'attractions' && sidebarTab !== 'shows' && sidebarTab !== 'characters' && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: POI_CONFIG[sidebarTab].color }}
                  >
                    {POI_CONFIG[sidebarTab].emoji}
                  </div>
                  <span className="font-medium text-sm">{POI_CONFIG[sidebarTab].label}</span>
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {currentParkPOIs.filter(p => p.type === sidebarTab).length} locais
                  </Badge>
                </div>
              )}
            </div>

            {/* Content List */}
            <ScrollArea className="flex-1">
              {sidebarTab === 'attractions' && (
                <>
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
                          className={`p-2.5 flex items-start gap-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedAttraction?.id === attraction.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                          }`}
                          onClick={() => {
                            setSelectedAttraction(attraction);
                            handleNavigateToAttraction(attraction.position);
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-tight line-clamp-2">{attraction.name}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {attraction.isOpen !== undefined && (
                                <span className={`text-[11px] ${attraction.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                                  ● {attraction.isOpen ? 'Aberto' : 'Fechado'}
                                </span>
                              )}
                              {attraction.passType && (
                                <span className="text-[11px] text-muted-foreground">
                                  {attraction.passType}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge className={`${getWaitTimeColor(attraction.waitTime)} shrink-0 text-[11px] px-1.5`}>
                            {attraction.waitTime !== undefined ? `${attraction.waitTime}m` : '—'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Shows Tab Content */}
              {sidebarTab === 'shows' && (
                <>
                  {isLoadingLiveShows ? (
                    <div className="p-8 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : liveShows.filter(s => s.entityType === 'SHOW').length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum show disponível</p>
                      <p className="text-xs mt-1">Os dados são atualizados em tempo real</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {liveShows
                        .filter(s => s.entityType === 'SHOW')
                        .sort((a, b) => {
                          if (a.status !== b.status) {
                            return a.status === 'OPERATING' ? -1 : 1;
                          }
                          return a.name.localeCompare(b.name);
                        })
                        .map((show) => (
                          <LiveShowCard 
                            key={show.id} 
                            show={show} 
                            onNavigate={() => {
                              toast.info(`🎭 ${show.name}`, {
                                description: show.nextShowtime 
                                  ? `Próximo: ${show.nextShowtime}` 
                                  : 'Horários na tela',
                              });
                            }}
                          />
                        ))}
                    </div>
                  )}
                  {lastShowsUpdate && (
                    <div className="p-2 border-t text-center">
                      <p className="text-[10px] text-muted-foreground">
                        Atualizado: {lastShowsUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Characters Tab Content */}
              {sidebarTab === 'characters' && (
                <>
                  {isLoadingLiveShows ? (
                    <div className="p-8 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : liveShows.filter(s => s.entityType === 'CHARACTER').length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum personagem disponível</p>
                      <p className="text-xs mt-1">Os dados são atualizados em tempo real</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {liveShows
                        .filter(s => s.entityType === 'CHARACTER')
                        .sort((a, b) => {
                          if (a.status !== b.status) {
                            return a.status === 'OPERATING' ? -1 : 1;
                          }
                          return a.name.localeCompare(b.name);
                        })
                        .map((show) => (
                          <LiveShowCard 
                            key={show.id} 
                            show={show}
                            onNavigate={() => {
                              toast.info(`🤗 ${show.name}`, {
                                description: show.nextShowtime 
                                  ? `Próximo: ${show.nextShowtime}` 
                                  : 'Disponível agora',
                              });
                            }}
                          />
                        ))}
                    </div>
                  )}
                  {lastShowsUpdate && (
                    <div className="p-2 border-t text-center">
                      <p className="text-[10px] text-muted-foreground">
                        Atualizado: {lastShowsUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </>
              )}

              {sidebarTab !== 'attractions' && sidebarTab !== 'shows' && sidebarTab !== 'characters' && (
                <>
                  {isLoadingPOIs ? (
                    <div className="p-8 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : currentParkPOIs.filter(p => p.type === sidebarTab).length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum local encontrado</p>
                    </div>
                  ) : sidebarTab === 'restaurant' ? (
                    // Special styling for restaurants - similar to Restaurants page
                    <div className="p-2 space-y-2">
                      {currentParkPOIs
                        .filter(p => p.type === 'restaurant')
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((poi) => (
                          <RestaurantSidebarCard
                            key={poi.id}
                            poi={poi}
                            isSelected={selectedPOI?.id === poi.id}
                            onSelect={() => {
                              setSelectedPOI(poi);
                              handleNavigateToAttraction(poi.position);
                            }}
                            onNavigate={() => calculateRoute(poi.position, poi.name)}
                            onOpenMenu={(url, name) => setMenuModalData({ url, name })}
                          />
                        ))}
                    </div>
                  ) : (
                    // Default styling for other POIs
                    <div className="divide-y">
                      {currentParkPOIs
                        .filter(p => p.type === sidebarTab)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((poi) => (
                          <div
                            key={poi.id}
                            className={`p-2.5 flex items-start gap-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedPOI?.id === poi.id ? 'bg-primary/10 border-l-4' : ''
                            }`}
                            style={selectedPOI?.id === poi.id ? { borderLeftColor: POI_CONFIG[poi.type].color } : {}}
                            onClick={() => {
                              setSelectedPOI(poi);
                              handleNavigateToAttraction(poi.position);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm leading-tight line-clamp-2">{poi.name}</p>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                {poi.type === 'show' && poi.schedule && (
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    {poi.schedule}
                                  </span>
                                )}
                                {poi.hasWarning && (
                                  <Badge variant="destructive" className="text-[10px] px-1 h-4">
                                    ⚠️
                                  </Badge>
                                )}
                              </div>
                              {poi.description && (
                                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                                  {poi.description}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                calculateRoute(poi.position, poi.name);
                              }}
                            >
                              <Navigation className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </ScrollArea>

            {/* Sidebar Footer */}
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
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Menu Modal - Rendered at root level for proper z-index */}
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
