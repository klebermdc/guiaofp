import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import MapGL, { Marker, Source, Layer } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import type { LngLatBoundsLike } from 'mapbox-gl';
import type mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Loader2, AlertCircle, Star, X, Clock, RefreshCw, ChevronUp, ChevronDown, List, Filter, ArrowUp, Volume2, Home, Map, Satellite, Play, Pause, LocateFixed, Car, ParkingCircle, Users, Sparkles } from 'lucide-react';
import { NavigationHUD } from '@/components/map/NavigationHUD';
import { useGPSNavigation } from '@/hooks/useGPSNavigation';
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
import { RestaurantSidebarCard } from '@/components/map/RestaurantSidebarCard';
import { LiveShowCard } from '@/components/map/LiveShowCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useLiveShows, type LiveShow } from '@/hooks/useLiveShows';
import { openExternalUrl } from '@/lib/open-external-url';
import {
  PARKS,
  POI_CONFIG,
  GOOGLE_MAPS_API_KEY,
  REFRESH_INTERVALS,
  getParksTableId,
  type ExtendedPOIType,
  type Park
} from '@/data/constants';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

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
  priceRange?: string | null;
  serviceType?: string | null;
  mustTry?: string | null;
  tips?: string | null;
}

// Normalize attraction names for matching with wait times
const normalizeAttractionName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Levenshtein distance for fuzzy matching
const levenshtein = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
};

// Find matching wait time
const findWaitTime = (attractionName: string, waitTimes: WaitTimeData[]): WaitTimeData | undefined => {
  const normalizedName = normalizeAttractionName(attractionName);
  const exact = waitTimes.find(wt => normalizeAttractionName(wt.name) === normalizedName);
  if (exact) return exact;
  const contained = waitTimes.find(wt => {
    const n = normalizeAttractionName(wt.name);
    const [shorter, longer] = n.length < normalizedName.length ? [n, normalizedName] : [normalizedName, n];
    return longer.includes(shorter) && shorter.length / longer.length >= 0.6;
  });
  if (contained) return contained;
  let best: WaitTimeData | undefined;
  let bestScore = Infinity;
  for (const wt of waitTimes) {
    const n = normalizeAttractionName(wt.name);
    const maxLen = Math.max(normalizedName.length, n.length);
    const dist = levenshtein(normalizedName, n);
    if (dist < bestScore && dist / maxLen <= 0.2) {
      bestScore = dist;
      best = wt;
    }
  }
  return best;
};

interface RouteInfo {
  distance: string;
  duration: string;
  destinationName: string;
  destination?: LatLng;
}

// Mapbox route GeoJSON for rendering
interface MapboxRoute {
  geometry: GeoJSON.LineString;
  steps: MapboxStep[];
}

interface MapboxStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: { type: string; modifier?: string; location: [number, number] };
}

type NavigationMode = 'preview' | 'guided';

// Build SVG data URL for attraction marker
function buildAttractionSVG(attraction: Attraction): string {
  const waitTimeColor = attraction.waitTime !== undefined
    ? attraction.waitTime > 60 ? '#EF4444'
      : attraction.waitTime > 30 ? '#F59E0B'
      : '#22C55E'
    : '#6B7280';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="36" fill="${waitTimeColor}" opacity="0.3"/>
    <path d="M40 4 L46 28 L70 28 L50 44 L58 70 L40 54 L22 70 L30 44 L10 28 L34 28 Z"
          fill="${waitTimeColor}" stroke="white" stroke-width="3" stroke-linejoin="round"/>
    ${attraction.waitTime !== undefined ? `
      <circle cx="40" cy="40" r="16" fill="white" opacity="0.95"/>
      <text x="40" y="46" text-anchor="middle" fill="${waitTimeColor}" font-size="18" font-weight="bold" font-family="Arial, sans-serif">${attraction.waitTime}</text>
    ` : ''}
  </svg>`;
}

// Build SVG data URL for POI marker
function buildPOISVG(type: ExtendedPOIType, highlighted = false): string {
  const config = POI_CONFIG[type];
  if (highlighted) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="72" viewBox="0 0 64 72">
      <circle cx="32" cy="24" r="22" fill="none" stroke="${config.color}" stroke-width="3" opacity="0.9">
        <animate attributeName="r" values="22;34;22" dur="1.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0;0.9" dur="1.4s" repeatCount="indefinite"/>
      </circle>
      <ellipse cx="32" cy="68" rx="10" ry="4" fill="rgba(0,0,0,0.3)"/>
      <path d="M32 66 C32 66 54 46 54 28 C54 15 44 4 32 4 C20 4 10 15 10 28 C10 46 32 66 32 66Z"
            fill="${config.color}" stroke="white" stroke-width="3"/>
      <circle cx="32" cy="26" r="17" fill="white"/>
      <text x="32" y="33" text-anchor="middle" font-size="20" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${config.emoji}</text>
    </svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
    <ellipse cx="22" cy="48" rx="8" ry="3" fill="rgba(0,0,0,0.25)"/>
    <path d="M22 47 C22 47 40 30 40 20 C40 9 32 2 22 2 C12 2 4 9 4 20 C4 30 22 47 22 47Z"
          fill="${config.color}" stroke="white" stroke-width="2.5"/>
    <circle cx="22" cy="19" r="13" fill="white"/>
    <text x="22" y="25" text-anchor="middle" font-size="16" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${config.emoji}</text>
  </svg>`;
}

// Build car marker SVG
const CAR_MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11" fill="#F59E0B" stroke="white" stroke-width="2"/>
  <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" stroke="white" stroke-width="1.5" fill="none" transform="translate(0, 1)"/>
  <rect x="4" y="11" width="16" height="6" rx="2" fill="white" transform="translate(0, 1)"/>
  <circle cx="7" cy="16" r="1.5" fill="#F59E0B" transform="translate(0, 1)"/>
  <circle cx="17" cy="16" r="1.5" fill="#F59E0B" transform="translate(0, 1)"/>
</svg>`;

export default function ParkMap() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const gps = useGPSNavigation();

  useEffect(() => {
    document.title = "Mapa do Parque | Orlando Fast Pass";
  }, []);

  const mapRef = useRef<MapRef | null>(null);
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
  const [isGPSPaused, setIsGPSPaused] = useState(false);
  const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.LineString | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeSteps, setRouteSteps] = useState<{ instruction: string; distance: string }[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('preview');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isStartingGPSNav, setIsStartingGPSNav] = useState(false);
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
  const [highlightedPOIId, setHighlightedPOIId] = useState<string | null>(null);
  const [pulseExpanded, setPulseExpanded] = useState(false);

  // Waze-like navigation enhancements
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [walkingSpeed, setWalkingSpeed] = useState<number | null>(null);
  const [isOffCenter, setIsOffCenter] = useState(false);
  const lastPositionRef = useRef<{ pos: LatLng; time: number } | null>(null);
  const lastGpsUpdateRef = useRef<number>(0);
  const userPositionRef = useRef<LatLng | null>(null);
  const lastHeadingPositionRef = useRef<LatLng | null>(null);
  const hasHeadingSignalRef = useRef(false);
  const orientationHandlerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);
  const pendingDeepLinkRef = useRef<{ parkId?: string; restaurantId?: string; lat?: number; lng?: number; search?: string; navigate?: boolean } | null>(null);

  // Direct camera control refs
  const targetHeadingRef = useRef<number>(0);
  const currentHeadingRef = useRef<number>(0);
  const navigationModeRef = useRef<NavigationMode>('preview');
  const isNavigatingRef = useRef(false);
  const userPanningRef = useRef(false);
  const lastMarkerClickRef = useRef(0);
  const lastUserInteractionRef = useRef<number>(0);

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

  useEffect(() => {
    if (carLocation) {
      localStorage.setItem('parked-car-location', JSON.stringify(carLocation));
    } else {
      localStorage.removeItem('parked-car-location');
    }
  }, [carLocation]);

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

  const clearCarLocation = useCallback(() => {
    setCarLocation(null);
    toast.info('Localização do carro removida');
  }, []);

  // Fetch POIs for current park from database
  const { data: dbPOIs = [], isLoading: isLoadingPOIs } = useQuery({
    queryKey: ['park-pois', selectedPark.id],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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

  // Fetch restaurants from the restaurants table
  const parksTableId = getParksTableId(selectedPark.id);
  const { data: dbRestaurants = [] } = useQuery({
    queryKey: ['map-restaurants', selectedPark.id, parksTableId],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : (typeof (poi as any).attraction_description === 'string' && (poi as any).attraction_description.trim())
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? (poi as any).attraction_description
            : null,
      menuUrl: poi.menu_url,
      cuisineType: poi.cuisine_type,
      requiresReservation: poi.requires_reservation,
      hasWarning: poi.has_warning,
      warningText: poi.warning_text,
    }));

  // Transform restaurants table data to POI format
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
      priceRange: r.price_range,
      serviceType: r.type,
      mustTry: r.must_try,
      tips: r.tips,
    }));

  // Merge POIs
  const nonRestaurantPOIs = contentItemPOIs.filter(poi => poi.type !== 'restaurant');
  const currentParkPOIs: POI[] = [...nonRestaurantPOIs, ...restaurantPOIs];

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

  // Play arrival notification sound
  const playArrivalSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const frequencies = [523.25, 659.25, 783.99];
      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now + index * 0.15);
        gainNode.gain.setValueAtTime(0, now + index * 0.15);
        gainNode.gain.linearRampToValueAtTime(0.3, now + index * 0.15 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.4);
        oscillator.start(now + index * 0.15);
        oscillator.stop(now + index * 0.15 + 0.5);
      });
    } catch {
      // Silent fail
    }
  }, []);

  // Check proximity to destination
  useEffect(() => {
    if (!isNavigating || !userPosition || !routeInfo?.destination || hasPlayedArrivalSound) return;
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

  // Reset navigation state
  useEffect(() => {
    isNavigatingRef.current = isNavigating;
    if (!isNavigating) {
      setHasPlayedArrivalSound(false);
      setCurrentStepIndex(0);
      setWalkingSpeed(null);
      setIsOffCenter(false);
      lastPositionRef.current = null;
      lastHeadingPositionRef.current = null;
      userPanningRef.current = false;
    }
  }, [isNavigating]);

  useEffect(() => {
    navigationModeRef.current = navigationMode;
  }, [navigationMode]);

  useEffect(() => {
    setCurrentStepIndex(0);
  }, [routeSteps]);

  // Calculate walking speed
  useEffect(() => {
    if (!userPosition || !isNavigating) return;
    const now = Date.now();
    const prev = lastPositionRef.current;
    if (prev) {
      const dt = (now - prev.time) / 1000;
      if (dt > 1 && dt < 30) {
        const dist = calculateStraightLineDistance(prev.pos, userPosition);
        const speedKmh = (dist / dt) * 3.6;
        if (speedKmh < 15) {
          setWalkingSpeed(s => s === null ? speedKmh : s * 0.7 + speedKmh * 0.3);
        }
      }
    }
    lastPositionRef.current = { pos: userPosition, time: now };
  }, [userPosition, isNavigating]);

  // Open navigation in external app
  const openExternalNav = useCallback((app: 'google' | 'waze', destination?: LatLng, forceSameTab = false) => {
    const targetDestination = destination ?? routeInfo?.destination;
    if (!targetDestination) return;
    const { lat, lng } = targetDestination;
    const url = app === 'waze'
      ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [routeInfo?.destination]);

  // Re-center on user position
  const recenterOnUser = useCallback(() => {
    if (mapRef.current && userPosition) {
      userPanningRef.current = false;
      lastUserInteractionRef.current = 0;
      mapRef.current.flyTo({ center: [userPosition.lng, userPosition.lat], zoom: 19, duration: 500 });
      setIsOffCenter(false);
    }
  }, [userPosition]);

  // Fetch attractions from database
  const { data: dbAttractions = [], isLoading: isLoadingAttractions } = useQuery({
    queryKey: ['park-attractions', selectedPark.id],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, description, latitude, longitude, thrill_level, min_height, pass_type, type')
        .eq('category_id', selectedPark.id)
        .neq('type', 'poi')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
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

  const isFetchingRef = useRef(false);

  const fetchWaitTimes = useCallback(async (parkId: string, isBackground = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!isBackground) setIsLoadingWaitTimes(true);
    try {
      const { data, error } = await supabase.functions.invoke('queue-times', {
        body: { parkId },
      });
      if (error) {
        // Wait times unavailable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if (Array.isArray((data as any)?.data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setWaitTimes((data as any).data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setDataSource((data as any)?.source || 'unknown');
        setLastWaitTimeUpdate(new Date());
      }
    } catch (err) {
      // Wait times fetch failed
    }
    if (!isBackground) setIsLoadingWaitTimes(false);
    isFetchingRef.current = false;
  }, []);

  // Merge attractions with wait times
  const attractionsWithWaitTimes: Attraction[] = useMemo(() => dbAttractions.map(attraction => {
    const waitTimeData = findWaitTime(attraction.name, waitTimes);
    return {
      ...attraction,
      waitTime: waitTimeData?.waitTime,
      isOpen: waitTimeData?.isOpen,
    };
  }), [dbAttractions, waitTimes]);

  // Pulse animation for highlighted POI
  useEffect(() => {
    if (!highlightedPOIId) { setPulseExpanded(false); return; }
    const interval = setInterval(() => setPulseExpanded(v => !v), 600);
    const timeout = setTimeout(() => setHighlightedPOIId(null), 8000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [highlightedPOIId]);

  // Auto-refresh wait times
  useEffect(() => {
    fetchWaitTimes(selectedPark.id, false);
    const refreshInterval = isMobile ? 30000 : 15000;
    const interval = setInterval(() => {
      fetchWaitTimes(selectedPark.id, true);
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [selectedPark.id, fetchWaitTimes, isMobile]);

  // Center map when park changes
  useEffect(() => {
    if (mapRef.current && isMapLoaded) {
      mapRef.current.flyTo({
        center: [selectedPark.center.lng, selectedPark.center.lat],
        zoom: selectedPark.zoom,
        duration: 800,
      });
    }
  }, [selectedPark, isMapLoaded]);

  // Haversine distance
  const calculateStraightLineDistance = (from: LatLng, to: LatLng): number => {
    const R = 6371e3;
    const p1 = (from.lat * Math.PI) / 180;
    const p2 = (to.lat * Math.PI) / 180;
    const dp = ((to.lat - from.lat) * Math.PI) / 180;
    const dl = ((to.lng - from.lng) * Math.PI) / 180;
    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

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

  const calculateBearing = (from: LatLng, to: LatLng): number => {
    const p1 = (from.lat * Math.PI) / 180;
    const p2 = (to.lat * Math.PI) / 180;
    const dl = ((to.lng - from.lng) * Math.PI) / 180;
    const y = Math.sin(dl) * Math.cos(p2);
    const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    const t = Math.atan2(y, x);
    return ((t * 180) / Math.PI + 360) % 360;
  };

  // Get bearing to destination for compass arrow
  const bearingToDestination = userPosition && routeInfo?.destination
    ? calculateBearing(userPosition, routeInfo.destination)
    : 0;

  // Translate Mapbox navigation instructions (already in Portuguese from language=pt, but apply cleanup)
  const cleanNavigationStep = (instruction: string): string => {
    return instruction.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  };

  // Calculate route via Mapbox Directions API
  const calculateRoute = useCallback(async (destination: LatLng, destinationName: string) => {
    const currentPos = userPositionRef.current || userPosition;
    if (!currentPos) {
      setLocationError('Ative sua localização primeiro para calcular a rota');
      return;
    }

    setIsCalculatingRoute(true);
    setSelectedAttraction(null);
    setLocationError(null);

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${currentPos.lng},${currentPos.lat};${destination.lng},${destination.lat}?geometries=geojson&steps=true&language=pt&access_token=${MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.routes?.length > 0) {
        const route = json.routes[0];
        const leg = route.legs[0];

        setRouteGeoJSON(route.geometry);
        setRouteInfo({
          distance: formatDistance(route.distance),
          duration: estimateWalkingTime(route.distance),
          destinationName,
          destination,
        });
        setRouteSteps(leg.steps.map((s: { maneuver: { instruction: string }; distance: number }) => ({
          instruction: s.maneuver.instruction || '',
          distance: formatDistance(s.distance),
        })));
        setCurrentStepIndex(0);
        setIsNavigating(true);
        setNavigationMode('preview');
        setIsNavPanelExpanded(true);

        if (!userPositionRef.current) startLocationTracking();

        // Fit the route in view
        if (mapRef.current) {
          const coords = route.geometry.coordinates as [number, number][];
          const lngs = coords.map(c => c[0]);
          const lats = coords.map(c => c[1]);
          const bounds: LngLatBoundsLike = [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)]
          ];
          mapRef.current.fitBounds(bounds, {
            padding: { top: 100, bottom: 250, left: 50, right: 50 },
            duration: 800,
          });
          // Reset rotation for preview
          mapRef.current.easeTo({ bearing: 0, pitch: 0, duration: 300 });
        }
      } else {
        // Fallback: straight-line distance
        const straightLineDistance = calculateStraightLineDistance(currentPos, destination);
        const estimatedWalkingDistance = straightLineDistance * 1.3;

        setRouteGeoJSON(null);
        setRouteInfo({
          distance: `~${formatDistance(estimatedWalkingDistance)}`,
          duration: `~${estimateWalkingTime(estimatedWalkingDistance)}`,
          destinationName,
          destination,
        });
        setRouteSteps([]);
        setCurrentStepIndex(0);
        setIsNavigating(true);
        setNavigationMode('preview');
        setIsNavPanelExpanded(true);

        if (mapRef.current) {
          const bounds: LngLatBoundsLike = [
            [Math.min(currentPos.lng, destination.lng), Math.min(currentPos.lat, destination.lat)],
            [Math.max(currentPos.lng, destination.lng), Math.max(currentPos.lat, destination.lat)]
          ];
          mapRef.current.fitBounds(bounds, {
            padding: { top: 100, bottom: 200, left: 50, right: 50 },
            duration: 800,
          });
          mapRef.current.easeTo({ bearing: 0, pitch: 0, duration: 300 });
        }
      }
    } catch (err) {
      // Fallback
      const straightLineDistance = calculateStraightLineDistance(currentPos, destination);
      const estimatedWalkingDistance = straightLineDistance * 1.3;
      setRouteGeoJSON(null);
      setRouteInfo({
        distance: `~${formatDistance(estimatedWalkingDistance)}`,
        duration: `~${estimateWalkingTime(estimatedWalkingDistance)}`,
        destinationName,
        destination,
      });
      setRouteSteps([]);
      setIsNavigating(true);
      setNavigationMode('preview');
      setIsNavPanelExpanded(true);
    }

    setIsCalculatingRoute(false);
  }, [userPosition]);

  const clearRoute = useCallback(() => {
    setRouteGeoJSON(null);
    setRouteInfo(null);
    setRouteSteps([]);
    setIsNavigating(false);
    isNavigatingRef.current = false;
    setNavigationMode('preview');
    navigationModeRef.current = 'preview';
    userPanningRef.current = false;
    // Reset map rotation
    if (mapRef.current) {
      mapRef.current.easeTo({ bearing: 0, pitch: 0, duration: 500 });
    }
    currentHeadingRef.current = 0;
    targetHeadingRef.current = 0;
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

  // Start continuous location tracking
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não suportada pelo navegador');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    if (orientationHandlerRef.current) {
      window.removeEventListener('deviceorientation', orientationHandlerRef.current, true);
      orientationHandlerRef.current = null;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        const pos: LatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        userPositionRef.current = pos;

        const isGuidedNow = navigationModeRef.current === 'guided' && isNavigatingRef.current;
        const throttleMs = isGuidedNow ? 300 : 1200;
        if (now - lastGpsUpdateRef.current < throttleMs) {
          if (isGuidedNow && mapRef.current && !userPanningRef.current) {
            const timeSinceInteraction = now - lastUserInteractionRef.current;
            if (timeSinceInteraction > 2000) {
              mapRef.current.easeTo({
                center: [pos.lng, pos.lat],
                bearing: currentHeadingRef.current,
                pitch: 60,
                zoom: 18,
                duration: 300,
              });
            }
          }
          return;
        }
        lastGpsUpdateRef.current = now;

        setUserPosition(pos);

        const gpsHeading = position.coords.heading;
        let nextHeading: number | null = null;

        if (gpsHeading !== null && !Number.isNaN(gpsHeading)) {
          nextHeading = gpsHeading;
        } else if (lastHeadingPositionRef.current) {
          const movedMeters = calculateStraightLineDistance(lastHeadingPositionRef.current, pos);
          if (movedMeters >= 2) {
            nextHeading = calculateBearing(lastHeadingPositionRef.current, pos);
          }
        }

        if (nextHeading !== null) {
          hasHeadingSignalRef.current = true;
          targetHeadingRef.current = nextHeading;
          currentHeadingRef.current = nextHeading;
          setUserHeading(nextHeading);
        }

        if (!lastHeadingPositionRef.current || calculateStraightLineDistance(lastHeadingPositionRef.current, pos) >= 2) {
          lastHeadingPositionRef.current = pos;
        }

        // Direct camera update during guided navigation
        if (isGuidedNow && mapRef.current && !userPanningRef.current) {
          const timeSinceInteraction = now - lastUserInteractionRef.current;
          if (timeSinceInteraction > 2000) {
            mapRef.current.easeTo({
              center: [pos.lng, pos.lat],
              bearing: currentHeadingRef.current,
              pitch: 60,
              zoom: 18,
              duration: 300,
            });
          }
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
        maximumAge: 0,
      }
    );

    // Device orientation for compass heading
    let lastOrientationUpdate = 0;
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha === null) return;
      if (navigationModeRef.current !== 'guided' || !isNavigatingRef.current) return;

      const now = Date.now();
      if (now - lastOrientationUpdate < 100) return;
      lastOrientationUpdate = now;

      let heading: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((event as any).webkitCompassHeading !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        heading = (event as any).webkitCompassHeading;
      } else {
        heading = (360 - event.alpha) % 360;
      }

      hasHeadingSignalRef.current = true;
      targetHeadingRef.current = heading;
      currentHeadingRef.current = heading;
      setUserHeading(heading);

      // Smooth camera rotation via easeTo
      if (mapRef.current && !userPanningRef.current && userPositionRef.current) {
        mapRef.current.easeTo({
          center: [userPositionRef.current.lng, userPositionRef.current.lat],
          bearing: heading,
          pitch: 60,
          zoom: 18,
          duration: 300,
        });
      }
    };

    orientationHandlerRef.current = handleOrientation;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted' && orientationHandlerRef.current) {
            window.addEventListener('deviceorientation', orientationHandlerRef.current, true);
          }
        })
        .catch(() => { /* orientation permission denied */ });
    } else if (orientationHandlerRef.current) {
      window.addEventListener('deviceorientation', orientationHandlerRef.current, true);
    }

    headingWatchIdRef.current = 1;
  }, []);

  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (orientationHandlerRef.current) {
      window.removeEventListener('deviceorientation', orientationHandlerRef.current, true);
      orientationHandlerRef.current = null;
    }
    headingWatchIdRef.current = null;
  }, []);

  // Auto-start GPS if permission was previously granted
  useEffect(() => {
    let cancelled = false;
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (!cancelled && result.state === 'granted') {
          startLocationTracking();
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (!cancelled) {
                const pos: LatLng = { lat: position.coords.latitude, lng: position.coords.longitude };
                userPositionRef.current = pos;
                setUserPosition(pos);
                setIsLoadingLocation(false);
              }
            },
            () => { if (!cancelled) setIsLoadingLocation(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        }
      });
    }
    return () => {
      cancelled = true;
      stopLocationTracking();
    };
  }, [stopLocationTracking, startLocationTracking]);

  const handleGetLocation = () => {
    setIsGPSPaused(false);
    startLocationTracking();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos: LatLng = { lat: position.coords.latitude, lng: position.coords.longitude };
        userPositionRef.current = pos;
        setUserPosition(pos);
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [pos.lng, pos.lat], zoom: 18, duration: 800 });
        }
        setIsLoadingLocation(false);
      },
      () => { setIsLoadingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handlePauseGPS = () => {
    stopLocationTracking();
    setUserPosition(null);
    userPositionRef.current = null;
    setIsGPSPaused(true);
  };

  const handleNavigateToAttraction = (position: LatLng) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [position.lng, position.lat], zoom: 19, duration: 800 });
    }
  };

  const handleRouteToAttraction = useCallback((position: LatLng, name: string) => {
    const currentPos = userPositionRef.current || userPosition;
    if (currentPos) {
      calculateRoute(position, name);
      return;
    }
    if (!navigator.geolocation) {
      openExternalNav('google', position, false);
      return;
    }
    setIsLoadingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (geoPosition) => {
        const nextPos: LatLng = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude,
        };
        userPositionRef.current = nextPos;
        setUserPosition(nextPos);
        setIsLoadingLocation(false);
        calculateRoute(position, name);
      },
      () => {
        setIsLoadingLocation(false);
        openExternalNav('google', position, false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [userPosition, calculateRoute, openExternalNav]);

  const handleStopNavigation = () => {
    clearRoute();
  };

  const handleParkChange = (parkId: string) => {
    const park = PARKS.find(p => p.id === parkId);
    if (park) {
      setSelectedPark(park);
      setAttractionFilter('all');
      setHighlightedPOIId(null);
      clearRoute();
    }
  };

  // Handle search param from Top3 page navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;

    const parkParam = params.get('park');
    const restaurantId = params.get('restaurant_id') ?? undefined;
    const latParam = params.get('lat');
    const lngParam = params.get('lng');
    const searchParam = params.get('search') ?? undefined;
    const shouldNavigate = params.get('navigate') === '1';

    if (parkParam) {
      const targetPark = PARKS.find(p => p.id === parkParam);
      if (targetPark) setSelectedPark(targetPark);
    }

    const lat = latParam ? parseFloat(latParam) : undefined;
    const lng = lngParam ? parseFloat(lngParam) : undefined;

    if (restaurantId || (lat && lng) || searchParam) {
      pendingDeepLinkRef.current = {
        parkId: parkParam ?? undefined,
        restaurantId,
        lat: lat && !isNaN(lat) ? lat : undefined,
        lng: lng && !isNaN(lng) ? lng : undefined,
        search: searchParam,
        navigate: shouldNavigate,
      };
    }

    window.history.replaceState({}, '', '/mapa');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 2: resolve pending deep-link
  useEffect(() => {
    if (!pendingDeepLinkRef.current) return;
    const { parkId, restaurantId, lat, lng, search, navigate: shouldNav } = pendingDeepLinkRef.current;

    if (parkId && selectedPark.id !== parkId) return;
    if (currentParkPOIs.length === 0 && !dbAttractions) return;

    const highlightPOI = (poi: POI) => {
      setHighlightedPOIId(poi.id);
      handleNavigateToAttraction(poi.position);
      toast.success(`📍 ${poi.name}`, { description: 'Toque no marcador para ver detalhes!' });
      pendingDeepLinkRef.current = null;
    };

    if (restaurantId && currentParkPOIs.length > 0) {
      const poi = currentParkPOIs.find(p => p.id === `restaurant-${restaurantId}`);
      if (poi) { highlightPOI(poi); return; }
    }

    if (lat && lng) {
      const position: LatLng = { lat, lng };
      const destName = search ?? 'Destino';

      if (search && currentParkPOIs.length > 0) {
        const normalized = search.toLowerCase().trim();
        const poi = currentParkPOIs.find(p =>
          p.name.toLowerCase().includes(normalized) || normalized.includes(p.name.toLowerCase())
        );
        if (poi) {
          setSelectedPOI(poi);
          setHighlightedPOIId(poi.id);
        }
      }

      if (shouldNav) {
        // Auto-start navigation — handles GPS permission + route calculation
        handleRouteToAttraction(position, destName);
        toast.success(`🧭 Navegando até ${destName}`, { description: 'Calculando rota...' });
      } else {
        handleNavigateToAttraction(position);
        toast.success(`📍 ${destName}`, { description: 'Localizado no mapa!' });
      }

      pendingDeepLinkRef.current = null;
      return;
    }

    if (search && currentParkPOIs.length > 0) {
      const normalized = search.toLowerCase().trim();
      const poi = currentParkPOIs.find(p =>
        p.name.toLowerCase().includes(normalized) || normalized.includes(p.name.toLowerCase())
      );
      if (poi) { highlightPOI(poi); return; }

      if (dbAttractions) {
        const attraction = dbAttractions.find(a =>
          a.name.toLowerCase().includes(normalized) || normalized.includes(a.name.toLowerCase())
        );
        if (attraction) {
          handleNavigateToAttraction(attraction.position);
          toast.success(`📍 ${attraction.name}`, { description: 'Localizado no mapa!' });
          pendingDeepLinkRef.current = null;
          return;
        }
      }
    }
  }, [currentParkPOIs, dbAttractions, selectedPark]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefreshWaitTimes = () => {
    fetchWaitTimes(selectedPark.id);
  };

  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap?.();
    if (map) {
      gps.setMap(map as unknown as mapboxgl.Map);
    }
    setIsMapLoaded(true);
  }, [gps]);

  const getWaitTimeColor = (waitTime: number | undefined) => {
    if (waitTime === undefined) return 'bg-muted text-muted-foreground';
    if (waitTime > 60) return 'bg-red-500 text-white';
    if (waitTime > 30) return 'bg-amber-500 text-white';
    return 'bg-green-500 text-white';
  };

  const sortedAttractions = attractionsWithWaitTimes.sort((a, b) => {
    if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
    if (a.waitTime !== undefined && b.waitTime !== undefined) return a.waitTime - b.waitTime;
    if (a.waitTime !== undefined) return -1;
    if (b.waitTime !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });

  const filteredAttractions = sortedAttractions.filter(attraction => {
    if (attractionFilter === 'open') return attraction.isOpen === true;
    if (attractionFilter === 'low-wait') return attraction.waitTime !== undefined && attraction.waitTime <= 30;
    return true;
  });

  // Mapbox map style
  const mapStyle = mapType === 'satellite'
    ? 'mapbox://styles/mapbox/satellite-streets-v12'
    : 'mapbox://styles/mapbox/streets-v12';

  // Route line layer style
  const routeLayerStyle = useMemo(() => ({
    id: 'route-line',
    type: 'line' as const,
    paint: {
      'line-color': '#3B82F6',
      'line-width': 6,
      'line-opacity': 0.9,
    },
    layout: {
      'line-join': 'round' as const,
      'line-cap': 'round' as const,
    },
  }), []);

  // Fallback dashed line layer
  const fallbackLayerStyle = useMemo(() => ({
    id: 'fallback-line',
    type: 'line' as const,
    paint: {
      'line-color': '#8B5CF6',
      'line-width': 4,
      'line-opacity': 0.8,
      'line-dasharray': [2, 2],
    },
  }), []);

  // GPS navigation route from hook
  const gpsRouteGeoJSON = useMemo(() => {
    if (!gps.state.routeGeometry) return null;
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: gps.state.routeGeometry,
    };
  }, [gps.state.routeGeometry]);

  // Route GeoJSON feature for Source
  const routeFeature = useMemo(() => {
    if (!routeGeoJSON) return null;
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: routeGeoJSON,
    };
  }, [routeGeoJSON]);

  // Fallback line feature
  const fallbackFeature = useMemo(() => {
    if (routeGeoJSON || !isNavigating || !userPosition || !routeInfo?.destination) return null;
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [userPosition.lng, userPosition.lat],
          [routeInfo.destination.lng, routeInfo.destination.lat],
        ],
      },
    };
  }, [routeGeoJSON, isNavigating, userPosition, routeInfo?.destination]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* App Sidebar - Navigation Menu (left) - Desktop Only */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex lg:ml-72 min-h-0 overflow-hidden">
        {/* Map + Controls Column */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Compact Mobile Header */}
          {isMobile && (
          <div className="bg-background/95 backdrop-blur-sm border-b z-20 safe-area-top">
            <div className="flex items-center gap-2 p-2">
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
            onClick={handleRefreshWaitTimes}
            disabled={isLoadingWaitTimes}
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingWaitTimes ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={userPosition ? handlePauseGPS : handleGetLocation}
            disabled={isLoadingLocation}
            variant={userPosition ? 'default' : 'outline'}
            size="icon"
            className="h-9 w-9 shrink-0"
            title={userPosition ? 'Pausar GPS' : 'Ativar localização'}
          >
            {isLoadingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </Button>

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

              <div className="overflow-auto h-full pb-4 -mx-4 px-4">
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

            {/* Horizontal Filter Pills */}
            <div className="overflow-x-auto scrollbar-hide -mx-2 px-2 pb-2">
              <div className="flex gap-1.5 min-w-max">
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

        {/* Desktop Header */}
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
      <div className="flex-1 min-h-0 relative">
        <MapGL
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            longitude: selectedPark.center.lng,
            latitude: selectedPark.center.lat,
            zoom: selectedPark.zoom,
            bearing: 0,
            pitch: mapType === 'satellite' ? 45 : 0,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={mapStyle}
          attributionControl={false}
          onLoad={onMapLoad}
          onDragStart={() => {
            gps.onMapDrag();
            lastUserInteractionRef.current = Date.now();
            userPanningRef.current = true;
          }}
          onDragEnd={() => {
            gps.onMapDragEnd();
            userPanningRef.current = false;
          }}
          onClick={(e) => {
            if (Date.now() - lastMarkerClickRef.current < 300) return;
            setSelectedAttraction(null);
            setSelectedPOI(null);
          }}
          touchPitch={true}
          dragRotate={true}
        >
          {/* User location marker - hidden during GPS navigation */}
          {userPosition && isMapLoaded && navigationMode !== 'guided' && !gps.state.isNavigating && (
            <Marker
              longitude={userPosition.lng}
              latitude={userPosition.lat}
              anchor="center"
            >
              <div
                className="relative"
                style={{ transform: `rotate(${userHeading || 0}deg)` }}
              >
                {/* Blue arrow marker */}
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <polygon
                    points="16,2 28,28 16,22 4,28"
                    fill="#3B82F6"
                    stroke="white"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </Marker>
          )}

          {/* Attraction markers */}
          {isMapLoaded && showAttractionMarkers && attractionsWithWaitTimes.map((attraction) => (
            <Marker
              key={attraction.id}
              longitude={attraction.position.lng}
              latitude={attraction.position.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                lastMarkerClickRef.current = Date.now();
                setSelectedAttraction(attraction);
                setSelectedPOI(null);
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: buildAttractionSVG(attraction),
                }}
                style={{ width: 64, height: 64, cursor: 'pointer' }}
                title={`${attraction.name}${attraction.waitTime !== undefined ? ` - ${attraction.waitTime} min` : ''}`}
              />
            </Marker>
          ))}

          {/* POI markers */}
          {isMapLoaded && currentParkPOIs
            .filter(poi => visiblePOIs.has(poi.type))
            .map((poi) => {
              const isHighlighted = poi.id === highlightedPOIId;
              return (
                <Marker
                  key={poi.id}
                  longitude={poi.position.lng}
                  latitude={poi.position.lat}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    lastMarkerClickRef.current = Date.now();
                    setSelectedPOI(poi);
                    setSelectedAttraction(null);
                    setHighlightedPOIId(null);
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: buildPOISVG(poi.type, isHighlighted),
                    }}
                    style={{
                      width: isHighlighted ? 64 : 44,
                      height: isHighlighted ? 72 : 52,
                      cursor: 'pointer',
                    }}
                    title={`${POI_CONFIG[poi.type].emoji} ${poi.name}`}
                  />
                </Marker>
              );
            })
          }

          {/* Car parking marker */}
          {carLocation && isMapLoaded && (
            <Marker
              longitude={carLocation.lng}
              latitude={carLocation.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                if (mapRef.current) {
                  mapRef.current.flyTo({ center: [carLocation.lng, carLocation.lat], zoom: 18, duration: 800 });
                }
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: CAR_MARKER_SVG }}
                style={{ width: 36, height: 36, cursor: 'pointer' }}
                title="🚗 Meu Carro"
              />
            </Marker>
          )}

          {/* Route line from Mapbox Directions */}
          {routeFeature && (
            <Source id="route" type="geojson" data={routeFeature}>
              <Layer {...routeLayerStyle} />
            </Source>
          )}

          {/* Fallback dashed line */}
          {fallbackFeature && (
            <Source id="fallback-route" type="geojson" data={fallbackFeature}>
              <Layer {...fallbackLayerStyle} />
            </Source>
          )}

          {/* GPS Navigation route line */}
          {gpsRouteGeoJSON && (
            <Source id="gps-route" type="geojson" data={gpsRouteGeoJSON}>
              <Layer
                id="gps-route-line"
                type="line"
                paint={{
                  'line-color': '#22C55E',
                  'line-width': 6,
                  'line-opacity': 0.9,
                }}
                layout={{
                  'line-join': 'round',
                  'line-cap': 'round',
                }}
              />
            </Source>
          )}

          {/* GPS user position during guided navigation */}
          {gps.state.isNavigating && gps.state.userPosition && (
            <Marker
              longitude={gps.state.userPosition.lng}
              latitude={gps.state.userPosition.lat}
              anchor="center"
            >
              <div style={{ transform: `rotate(${gps.state.heading}deg)` }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <polygon
                    points="20,2 36,36 20,28 4,36"
                    fill="#3B82F6"
                    stroke="white"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            </Marker>
          )}
        </MapGL>

        {/* Centered GPS Navigation Arrow - Waze Style */}
        {navigationMode === 'guided' && isNavigating && userPosition && (
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

              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                className="drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.5))',
                }}
              >
                <defs>
                  <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                  <filter id="arrowShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1E40AF" floodOpacity="0.5"/>
                  </filter>
                </defs>

                <polygon
                  points="30,5 50,50 30,40 10,50"
                  fill="white"
                  filter="url(#arrowShadow)"
                />

                <polygon
                  points="30,8 47,47 30,38 13,47"
                  fill="url(#arrowGradient)"
                />

                <polygon
                  points="30,8 30,38 13,47"
                  fill="rgba(255,255,255,0.15)"
                />
              </svg>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-600 shadow-lg" />
            </div>
          </div>
        )}

        {/* Attraction Popup */}
        <AnimatePresence>
          {selectedAttraction && !gps.state.isNavigating && (
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
                cuisineType: selectedPOI.cuisineType || undefined,
                requiresReservation: selectedPOI.requiresReservation || undefined,
                hasWarning: selectedPOI.hasWarning || undefined,
                warningText: selectedPOI.warningText || undefined,
              }}
              poiConfig={POI_CONFIG[selectedPOI.type]}
              onClose={() => setSelectedPOI(null)}
              onNavigate={handleRouteToAttraction}
            />
          )}
        </AnimatePresence>

        {/* POI Filters - Floating buttons (Desktop only) */}
        {!isMobile && navigationMode !== 'guided' && (
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
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

        {/* Map Legend - Desktop only */}
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

        {/* Right-side map controls */}
        <div className="absolute bottom-24 lg:bottom-4 right-2 flex flex-col gap-1.5 z-10 items-center">
          {/* GPS Status Indicator */}
          {userPosition && !isNavigating && (
            <div className="bg-background/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">GPS</span>
            </div>
          )}

          {/* GPS Location Button */}
          <Button
            variant={userPosition ? 'default' : 'secondary'}
            size="icon"
            className={`h-10 w-10 shadow-lg transition-all duration-300 ${
              userPosition
                ? 'bg-blue-500 hover:bg-blue-600 ring-2 ring-blue-500/30'
                : 'hover:bg-muted'
            } ${isLoadingLocation ? 'animate-pulse' : ''}`}
            onClick={() => {
              if (userPosition && mapRef.current) {
                mapRef.current.flyTo({ center: [userPosition.lng, userPosition.lat], zoom: 19, duration: 800 });
                toast.success('📍 Localização centralizada', {
                  description: 'Mapa focado na sua posição atual',
                  duration: 2000,
                });
              } else {
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
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            ) : (
              <LocateFixed className={`w-5 h-5 ${userPosition ? 'text-white' : 'text-blue-500'}`} />
            )}
          </Button>

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

          {/* Zoom + */}
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 shadow-lg"
            onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
          >
            <span className="text-lg font-bold">+</span>
          </Button>

          {/* Zoom - */}
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 shadow-lg"
            onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
          >
            <span className="text-lg font-bold">−</span>
          </Button>
        </div>

        {/* Car Parking Controls */}
        <div className="absolute bottom-36 lg:bottom-16 left-2 flex flex-col gap-1 z-10">
          <Button
            variant={carLocation ? 'default' : 'secondary'}
            size="icon"
            className={`h-10 w-10 shadow-lg ${carLocation ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
            onClick={carLocation ? navigateToCar : saveCarLocation}
            title={carLocation ? 'Ir para o carro' : 'Marcar onde estacionei'}
          >
            <Car className={`w-5 h-5 ${carLocation ? 'text-white' : ''}`} />
          </Button>

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

      {/* GPS Navigation HUD */}
      {gps.state.isNavigating && (
        <NavigationHUD
          destinationName={gps.destinationName}
          distance={gps.state.distanceToDestination}
          duration={gps.state.durationRemaining}
          currentStepIndex={gps.state.currentStepIndex}
          steps={gps.state.steps}
          speed={gps.state.speed}
          distanceToNextStep={gps.state.distanceToNextStep}
          destination={gps.state.steps.length > 0 ? gps.state.steps[gps.state.steps.length - 1].endLocation : null}
          userPosition={gps.state.userPosition}
          onStop={() => { gps.stopNavigation(); clearRoute(); }}
          onRecenter={gps.recenter}
          isOffCenter={gps.state.isOffCenter}
          onOpenExternal={(app) => {
            const lastStep = gps.state.steps[gps.state.steps.length - 1];
            if (lastStep) openExternalNav(app, lastStep.endLocation);
          }}
        />
      )}

      {/* Navigation Panel - Preview mode */}
      {isNavigating && routeInfo && !(isMobile && navigationMode === 'guided') && (
        <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 safe-area-bottom`}>
          <button
            onClick={() => setIsNavPanelExpanded(!isNavPanelExpanded)}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 rounded-full px-4 py-1 shadow-lg z-10 flex items-center gap-1"
          >
            {isNavPanelExpanded ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronUp className="w-4 h-4 text-white" />}
            <span className="text-[10px] text-white font-medium">Rota</span>
          </button>

          <div className="bg-gradient-to-b from-blue-700 to-blue-800 text-white shadow-2xl rounded-t-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 pt-5 pb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-300 font-medium mb-0.5">Destino</p>
                <p className="text-sm font-bold text-white truncate">{routeInfo.destinationName}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center">
                  <p className="text-base font-black leading-none">{routeInfo.duration}</p>
                  <p className="text-[10px] text-blue-300">tempo</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-base font-black leading-none">{routeInfo.distance}</p>
                  <p className="text-[10px] text-blue-300">distância</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStopNavigation}
                  className="text-white hover:bg-red-500/60 h-10 w-10 rounded-full shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {isNavPanelExpanded && (
              <div className="px-4 pb-6 space-y-3">
                {/* Route steps */}
                {routeSteps.length > 0 && (
                  <div className="bg-white/10 rounded-xl overflow-hidden">
                    <p className="text-[10px] text-blue-300 font-semibold px-3 pt-2 pb-1 uppercase tracking-wide">Instruções</p>
                    <div className="max-h-36 overflow-auto divide-y divide-white/10">
                      {routeSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-2.5 px-3 py-2 text-xs">
                          <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                            {index + 1}
                          </span>
                          <span className="text-white/90 leading-tight">
                            {cleanNavigationStep(step.instruction)}
                          </span>
                          {step.distance && (
                            <span className="text-blue-300 text-[10px] shrink-0 ml-auto">{step.distance}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback compass */}
                {routeSteps.length === 0 && routeInfo?.destination && (
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <div className="absolute inset-0 rounded-full bg-white/10 border-2 border-white/40" />
                      <div
                        className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
                        style={{ transform: `rotate(${bearingToDestination}deg)` }}
                      >
                        <ArrowUp className="w-8 h-8 text-white" strokeWidth={3} />
                      </div>
                    </div>
                    <p className="text-sm text-white/90 font-medium">Siga na direção indicada</p>
                    <p className="text-xs text-blue-300 mt-0.5">Distância aprox.: {routeInfo.distance}</p>
                  </div>
                )}

                {/* Primary: Native in-app navigation */}
                {routeInfo?.destination && (
                  <Button
                    size="lg"
                    disabled={isStartingGPSNav}
                    onClick={async () => {
                      if (!routeInfo.destination) return;
                      setIsStartingGPSNav(true);
                      try {
                        const knownPos = userPositionRef.current ?? userPosition ?? undefined;
                        await gps.startNavigation(routeInfo.destination, routeInfo.destinationName, knownPos);
                        setIsNavigating(false);
                      } catch (err) {
                        toast.error('Não foi possível iniciar a navegação', {
                          description: 'Tente aproximar-se de uma área com sinal ou aguarde o GPS estabilizar',
                        });
                      } finally {
                        setIsStartingGPSNav(false);
                      }
                    }}
                    className="w-full gap-2 bg-green-500 hover:bg-green-400 text-white font-black text-base h-14 rounded-xl shadow-lg"
                  >
                    {isStartingGPSNav ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Navigation className="w-5 h-5" />
                    )}
                    {isStartingGPSNav ? 'Iniciando GPS...' : 'Iniciar Navegação'}
                  </Button>
                )}

                {/* Fallback: external apps */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={() => openExternalNav('google')}
                    className="gap-2 bg-white/20 text-white hover:bg-white/30 font-semibold h-10"
                  >
                    <Navigation className="w-4 h-4" />
                    Google Maps
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openExternalNav('waze')}
                    className="gap-2 bg-white/20 text-white hover:bg-white/30 font-semibold h-10"
                  >
                    <Navigation className="w-4 h-4" />
                    Waze
                  </Button>
                </div>
                <p className="text-[10px] text-blue-300 text-center">
                  Ou abra em app externo
                </p>
              </div>
            )}
          </div>
        </div>
      )}
        </div>

        {/* Right Sidebar - Park Info (Desktop Only) */}
        {!isMobile && (
          <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-l bg-background shrink-0 h-full overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-3 border-b space-y-2">
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
                          if (a.status !== b.status) return a.status === 'OPERATING' ? -1 : 1;
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
                          if (a.status !== b.status) return a.status === 'OPERATING' ? -1 : 1;
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
                            onNavigate={() => handleRouteToAttraction(poi.position, poi.name)}
                          />
                        ))}
                    </div>
                  ) : (
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
                                handleRouteToAttraction(poi.position, poi.name);
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
                onClick={userPosition ? handlePauseGPS : handleGetLocation}
                disabled={isLoadingLocation}
                variant={userPosition ? 'default' : 'outline'}
                className="w-full"
              >
                {isLoadingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                {userPosition ? 'Pausar GPS' : isGPSPaused ? 'Retomar localização' : 'Ativar localização'}
              </Button>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />


    </div>
  );
}
