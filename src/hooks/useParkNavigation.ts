/**
 * useParkNavigation Hook
 * 
 * Manages GPS location tracking, route calculation, navigation modes,
 * and audio notifications for the park map.
 * Extracted from ParkMap.tsx for reusability and maintainability.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export type LatLng = { lat: number; lng: number };
export type NavigationMode = 'preview' | 'guided';

export interface RouteInfo {
  distance: string;
  duration: string;
  destinationName: string;
  destination?: LatLng;
}

interface UseParkNavigationOptions {
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  onNavigationStart?: () => void;
  onNavigationEnd?: () => void;
}

interface UseParkNavigationReturn {
  // User location state
  userPosition: LatLng | null;
  userHeading: number;
  isLoadingLocation: boolean;
  locationError: string | null;
  setLocationError: (error: string | null) => void;
  
  // Navigation state
  directions: google.maps.DirectionsResult | null;
  routeInfo: RouteInfo | null;
  routeSteps: google.maps.DirectionsStep[];
  isNavigating: boolean;
  navigationMode: NavigationMode;
  isCalculatingRoute: boolean;
  
  // Car parking
  carLocation: LatLng | null;
  saveCarLocation: () => void;
  clearCarLocation: () => void;
  navigateToCar: () => void;
  
  // Actions
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  handleGetLocation: () => void;
  calculateRoute: (destination: LatLng, destinationName: string) => void;
  clearRoute: () => void;
  startGuidedNavigation: () => void;
  setNavigationMode: (mode: NavigationMode) => void;
  
  // Utilities
  calculateBearing: (from: LatLng, to: LatLng) => number;
  calculateStraightLineDistance: (from: LatLng, to: LatLng) => number;
  formatDistance: (meters: number) => string;
  estimateWalkingTime: (meters: number) => string;
  translateNavigationStep: (instruction: string) => string;
}

export function useParkNavigation({ mapRef, onNavigationStart, onNavigationEnd }: UseParkNavigationOptions): UseParkNavigationReturn {
  const watchIdRef = useRef<number | null>(null);
  const headingWatchIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastHeadingRef = useRef<number>(0);
  
  // Location state
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Navigation state
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeSteps, setRouteSteps] = useState<google.maps.DirectionsStep[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('preview');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [hasPlayedArrivalSound, setHasPlayedArrivalSound] = useState(false);
  
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

  // Calculate straight-line distance between two points (Haversine formula)
  const calculateStraightLineDistance = useCallback((from: LatLng, to: LatLng): number => {
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
  }, []);

  // Format distance for display
  const formatDistance = useCallback((meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }, []);

  // Estimate walking time (average walking speed ~5 km/h = 83.3 m/min)
  const estimateWalkingTime = useCallback((meters: number): string => {
    const minutes = Math.round(meters / 83.3);
    if (minutes < 1) return '1 min';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
    }
    return `${minutes} min`;
  }, []);

  // Calculate bearing (angle) from one point to another
  const calculateBearing = useCallback((from: LatLng, to: LatLng): number => {
    const φ1 = (from.lat * Math.PI) / 180;
    const φ2 = (to.lat * Math.PI) / 180;
    const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    
    return ((θ * 180) / Math.PI + 360) % 360; // Bearing in degrees (0-360)
  }, []);

  // Translate navigation instructions from English to Portuguese
  const translateNavigationStep = useCallback((instruction: string): string => {
    const translations: [RegExp, string][] = [
      // Directions
      [/\\bHead\\b/gi, 'Siga'],
      [/\\bnorth\\b/gi, 'norte'],
      [/\\bsouth\\b/gi, 'sul'],
      [/\\beast\\b/gi, 'leste'],
      [/\\bwest\\b/gi, 'oeste'],
      [/\\bnortheast\\b/gi, 'nordeste'],
      [/\\bnorthwest\\b/gi, 'noroeste'],
      [/\\bsoutheast\\b/gi, 'sudeste'],
      [/\\bsouthwest\\b/gi, 'sudoeste'],
      // Actions
      [/\\bTurn right\\b/gi, 'Vire à direita'],
      [/\\bTurn left\\b/gi, 'Vire à esquerda'],
      [/\\bContinue\\b/gi, 'Continue'],
      [/\\bKeep right\\b/gi, 'Mantenha-se à direita'],
      [/\\bKeep left\\b/gi, 'Mantenha-se à esquerda'],
      [/\\bSlightly right\\b/gi, 'Levemente à direita'],
      [/\\bSlightly left\\b/gi, 'Levemente à esquerda'],
      [/\\bSharp right\\b/gi, 'Curva acentuada à direita'],
      [/\\bSharp left\\b/gi, 'Curva acentuada à esquerda'],
      [/\\bMake a U-turn\\b/gi, 'Faça retorno'],
      // Prepositions
      [/\\bon\\b/gi, 'na'],
      [/\\bonto\\b/gi, 'para'],
      [/\\btoward\\b/gi, 'em direção a'],
      [/\\btowards\\b/gi, 'em direção a'],
      [/\\bafter\\b/gi, 'após'],
      [/\\bPass by\\b/gi, 'Passe por'],
      [/\\bat\\b/gi, 'em'],
      [/\\bthe\\b/gi, ''],
      // Distance
      [/\\bin (\\d+) ft\\b/gi, 'em $1 pés'],
      [/\\bin (\\d+) m\\b/gi, 'em $1 m'],
      [/\\bft\\b/gi, 'pés'],
      // Location hints
      [/\\(on the right\\)/gi, '(à direita)'],
      [/\\(on the left\\)/gi, '(à esquerda)'],
    ];

    let translated = instruction;
    for (const [pattern, replacement] of translations) {
      translated = translated.replace(pattern, replacement);
    }
    // Clean up double spaces
    return translated.replace(/\\s+/g, ' ').trim();
  }, []);

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
  }, [userPosition, routeInfo?.destination, isNavigating, hasPlayedArrivalSound, playArrivalSound, calculateStraightLineDistance]);

  // Reset arrival sound flag when starting a new navigation
  useEffect(() => {
    if (!isNavigating) {
      setHasPlayedArrivalSound(false);
    }
  }, [isNavigating]);

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

  // Calculate route using Google Directions API
  const calculateRoute = useCallback((destination: LatLng, destinationName: string) => {
    if (!userPosition) {
      setLocationError('Ative sua localização primeiro para calcular a rota');
      return;
    }

    setIsCalculatingRoute(true);
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
          onNavigationStart?.();
          
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
          onNavigationStart?.();
          
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
  }, [userPosition, mapRef, onNavigationStart, calculateStraightLineDistance, formatDistance, estimateWalkingTime]);

  // Clear route and stop navigation
  const clearRoute = useCallback(() => {
    setDirections(null);
    setRouteInfo(null);
    setRouteSteps([]);
    setIsNavigating(false);
    setNavigationMode('preview');
    onNavigationEnd?.();
    // Reset map rotation
    if (mapRef.current) {
      mapRef.current.setHeading(0);
      mapRef.current.setTilt(0);
    }
  }, [mapRef, onNavigationEnd]);

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
  }, [userPosition, userHeading, mapRef]);

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
  }, [userHeading, userPosition, navigationMode, isNavigating, mapRef]);

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

  // Get current position with map centering
  const handleGetLocation = useCallback(() => {
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
  }, [startLocationTracking, mapRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, [stopLocationTracking]);

  return {
    // User location state
    userPosition,
    userHeading,
    isLoadingLocation,
    locationError,
    setLocationError,
    
    // Navigation state
    directions,
    routeInfo,
    routeSteps,
    isNavigating,
    navigationMode,
    isCalculatingRoute,
    
    // Car parking
    carLocation,
    saveCarLocation,
    clearCarLocation,
    navigateToCar,
    
    // Actions
    startLocationTracking,
    stopLocationTracking,
    handleGetLocation,
    calculateRoute,
    clearRoute,
    startGuidedNavigation,
    setNavigationMode,
    
    // Utilities
    calculateBearing,
    calculateStraightLineDistance,
    formatDistance,
    estimateWalkingTime,
    translateNavigationStep,
  };
}
