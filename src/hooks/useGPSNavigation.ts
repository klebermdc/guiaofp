/**
 * useGPSNavigation.ts
 * Hook de navegacao GPS com rotacao automatica de mapa — Mapbox GL JS.
 *
 * Funcionalidades:
 * - Rastreamento de posicao GPS em tempo real
 * - Heading suavizado com interpolacao angular (sem tremidos)
 * - map.easeTo({bearing, pitch, center}) para rotacao nativa e suave
 * - Pitch 3D de 60 graus (perspectiva GPS real tipo Waze)
 * - Fallback de heading: sensor > GPS heading > bearing entre posicoes
 * - Avanco automatico de etapa (25m)
 * - Recentralizacao automatica apos 8s de pan manual
 * - Rota via Mapbox Directions API (walking, pt)
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import type mapboxgl from 'mapbox-gl';

export interface LatLng { lat: number; lng: number; }

export interface NavigationStep {
  instructions: string;
  distance?: { text: string; value: number };
  duration?: { text: string; value: number };
  maneuver?: string;
  startLocation: LatLng;
  endLocation: LatLng;
}

export interface GPSState {
  userPosition: LatLng | null;
  heading: number;
  speed: number | null;
  accuracy: number | null;
  isNavigating: boolean;
  isOffCenter: boolean;
  currentStepIndex: number;
  distanceToNextStep: number | null;
  distanceToDestination: string;
  durationRemaining: string;
  steps: NavigationStep[];
  /** GeoJSON LineString of the full route for rendering on map */
  routeGeometry: GeoJSON.LineString | null;
}

const GPS_ZOOM = 18;
const GPS_PITCH = 60;
const HEADING_SMOOTH = 0.15;
const STEP_ADVANCE_M = 25;
const AUTO_RECENTER_MS = 8000;
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const p1 = (a.lat * Math.PI) / 180, p2 = (b.lat * Math.PI) / 180;
  const dp = ((b.lat - a.lat) * Math.PI) / 180;
  const dl = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function calcBearing(from: LatLng, to: LatLng): number {
  const p1 = (from.lat * Math.PI) / 180, p2 = (to.lat * Math.PI) / 180;
  const dl = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function lerpAngle(cur: number, tgt: number, f: number): number {
  let d = tgt - cur;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return (cur + d * f + 360) % 360;
}

const fmtDist = (m: number) =>
  m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;

const fmtTime = (s: number) => {
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}min`;
};

export function useGPSNavigation(_apiKey?: string) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const watchRef = useRef<number | null>(null);
  const headRef = useRef(0);
  const lastPosRef = useRef<LatLng | null>(null);
  const draggingRef = useRef(false);
  const recenterRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destNameRef = useRef('');

  const [state, setState] = useState<GPSState>({
    userPosition: null, heading: 0, speed: null, accuracy: null,
    isNavigating: false, isOffCenter: false, currentStepIndex: 0,
    distanceToNextStep: null, distanceToDestination: '', durationRemaining: '', steps: [],
    routeGeometry: null,
  });

  /** Register the Mapbox map instance */
  const setMap = useCallback((map: mapboxgl.Map | null) => {
    mapRef.current = map;
  }, []);

  /** Smooth camera transition — Mapbox easeTo handles interpolation natively */
  const moveCamera = useCallback((pos: LatLng) => {
    if (!mapRef.current || draggingRef.current) return;
    mapRef.current.easeTo({
      center: [pos.lng, pos.lat],
      bearing: headRef.current,
      pitch: GPS_PITCH,
      zoom: GPS_ZOOM,
      duration: 300, // smooth 300ms transition like Waze
    });
  }, []);

  /** Fetch route via Mapbox Directions API */
  const fetchRoute = useCallback(async (origin: LatLng, dest: LatLng) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?geometries=geojson&steps=true&language=pt&access_token=${MAPBOX_TOKEN}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      if (!json.routes?.length) return null;

      const route = json.routes[0];
      const leg = route.legs[0];
      const geometry: GeoJSON.LineString = route.geometry;

      const steps: NavigationStep[] = leg.steps.map((s: {
        maneuver: { instruction: string; type?: string; location: [number, number] };
        distance: number;
        duration: number;
        geometry: { coordinates: [number, number][] };
      }) => {
        const lastCoord = s.geometry.coordinates[s.geometry.coordinates.length - 1];
        return {
          instructions: s.maneuver.instruction || '',
          distance: { text: fmtDist(s.distance), value: s.distance },
          duration: { text: fmtTime(s.duration), value: s.duration },
          maneuver: s.maneuver.type || undefined,
          startLocation: { lat: s.maneuver.location[1], lng: s.maneuver.location[0] },
          endLocation: { lat: lastCoord[1], lng: lastCoord[0] },
        };
      });

      return {
        steps,
        distance: fmtDist(route.distance),
        duration: fmtTime(route.duration),
        geometry,
      };
    } catch (err) {
      console.error('Mapbox Directions error:', err);
      return null;
    }
  }, []);

  /** GPS position update callback */
  const onPosition = useCallback(
    (pos: GeolocationPosition) => {
      const { latitude: lat, longitude: lng, heading: geoH, speed: geoS, accuracy: acc } = pos.coords;
      const cur: LatLng = { lat, lng };

      // Compute heading: prefer GPS heading when moving, fallback = bearing
      let rawH = 0;
      if (geoH != null && !isNaN(geoH) && geoS && geoS > 0.5) {
        rawH = geoH;
      } else if (lastPosRef.current) {
        const d = haversineMeters(lastPosRef.current, cur);
        rawH = d > 1 ? calcBearing(lastPosRef.current, cur) : headRef.current;
      }
      headRef.current = lerpAngle(headRef.current, rawH, HEADING_SMOOTH);
      lastPosRef.current = cur;

      setState((prev) => {
        let { currentStepIndex: idx } = prev;
        const { steps } = prev;
        const step = steps[idx];
        let dNext: number | null = null;
        if (step) {
          dNext = haversineMeters(cur, step.endLocation);
          if (dNext < STEP_ADVANCE_M && idx < steps.length - 1) idx++;
        }
        let dist = 0, secs = 0;
        for (let i = idx; i < steps.length; i++) {
          dist += steps[i].distance?.value || 0;
          secs += steps[i].duration?.value || 0;
        }
        return {
          ...prev, userPosition: cur, heading: headRef.current,
          speed: geoS != null ? geoS * 3.6 : null, accuracy: acc || null,
          currentStepIndex: idx, distanceToNextStep: dNext,
          distanceToDestination: fmtDist(dist), durationRemaining: fmtTime(secs),
        };
      });

      moveCamera(cur);
    },
    [moveCamera],
  );

  /** Start navigation — accepts known position to avoid redundant GPS request */
  const startNavigation = useCallback(
    async (destination: LatLng, name: string, knownOrigin?: LatLng) => {
      destNameRef.current = name;
      let origin: LatLng;
      if (knownOrigin) {
        origin = knownOrigin;
      } else {
        if (!navigator.geolocation) throw new Error('Geolocalização não disponível');
        const raw = await new Promise<GeolocationPosition>((ok, err) =>
          navigator.geolocation.getCurrentPosition(ok, err, { enableHighAccuracy: true, timeout: 15000 }),
        );
        origin = { lat: raw.coords.latitude, lng: raw.coords.longitude };
      }
      const route = await fetchRoute(origin, destination);
      if (!route) throw new Error('Rota não encontrada');
      setState((prev) => ({
        ...prev, isNavigating: true, isOffCenter: false, steps: route.steps,
        currentStepIndex: 0, distanceToDestination: route.distance,
        durationRemaining: route.duration, userPosition: origin,
        routeGeometry: route.geometry,
      }));
      if (mapRef.current) {
        mapRef.current.easeTo({
          center: [origin.lng, origin.lat],
          bearing: 0,
          pitch: GPS_PITCH,
          zoom: GPS_ZOOM,
          duration: 500,
        });
      }
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = navigator.geolocation.watchPosition(onPosition, (e) => console.warn('GPS:', e), {
        enableHighAccuracy: true, maximumAge: 500, timeout: 10000,
      });
    },
    [fetchRoute, onPosition],
  );

  /** Stop navigation */
  const stopNavigation = useCallback(() => {
    if (watchRef.current != null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    if (recenterRef.current) clearTimeout(recenterRef.current);
    if (mapRef.current) {
      mapRef.current.easeTo({ pitch: 0, bearing: 0, zoom: 16, duration: 500 });
    }
    setState((prev) => ({ ...prev, isNavigating: false, isOffCenter: false, heading: 0, routeGeometry: null }));
  }, []);

  /** Recenter on user */
  const recenter = useCallback(() => {
    draggingRef.current = false;
    if (recenterRef.current) clearTimeout(recenterRef.current);
    setState((prev) => ({ ...prev, isOffCenter: false }));
    if (mapRef.current && lastPosRef.current) {
      mapRef.current.easeTo({
        center: [lastPosRef.current.lng, lastPosRef.current.lat],
        bearing: headRef.current,
        pitch: GPS_PITCH,
        zoom: GPS_ZOOM,
        duration: 300,
      });
    }
  }, []);

  /** User started dragging map */
  const onMapDrag = useCallback(() => {
    if (!state.isNavigating) return;
    draggingRef.current = true;
    setState((prev) => ({ ...prev, isOffCenter: true }));
    if (recenterRef.current) clearTimeout(recenterRef.current);
  }, [state.isNavigating]);

  /** User released map — schedule recenter */
  const onMapDragEnd = useCallback(() => {
    if (!state.isNavigating) return;
    recenterRef.current = setTimeout(() => {
      draggingRef.current = false;
      recenter();
    }, AUTO_RECENTER_MS);
  }, [state.isNavigating, recenter]);

  useEffect(
    () => () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      if (recenterRef.current) clearTimeout(recenterRef.current);
    },
    [],
  );

  return {
    state,
    setMap,
    startNavigation,
    stopNavigation,
    recenter,
    onMapDrag,
    onMapDragEnd,
    destinationName: destNameRef.current,
  };
}
