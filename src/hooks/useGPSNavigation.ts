/**
 * useGPSNavigation.ts
 * Hook de navegação GPS com rotação automática de mapa.
 *
 * Funcionalidades:
 * - Rastreamento de posição GPS em tempo real
 * - Heading suavizado com interpolação angular (sem tremidos)
 * - map.moveCamera() atômico com heading + tilt + zoom
 * - Tilt 3D de 45° (perspectiva GPS real)
 * - Fallback de heading: sensor → bearing entre posições
 * - Avanço automático de etapa (25m)
 * - Recentralização automática após 8s de pan manual
 *
 * Integração: ver INTEGRATION_GUIDE.md
 */

import { useRef, useCallback, useEffect, useState } from 'react';

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
}

const GPS_ZOOM = 18;
const GPS_TILT = 45;
const HEADING_SMOOTH = 0.15;
const STEP_ADVANCE_M = 25;
const AUTO_RECENTER_MS = 8000;

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

export function useGPSNavigation(_apiKey: string) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const watchRef = useRef<number | null>(null);
  const headRef = useRef(0);
  const lastPosRef = useRef<LatLng | null>(null);
  const draggingRef = useRef(false);
  const recenterRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);
  const destNameRef = useRef('');

  const [state, setState] = useState<GPSState>({
    userPosition: null, heading: 0, speed: null, accuracy: null,
    isNavigating: false, isOffCenter: false, currentStepIndex: 0,
    distanceToNextStep: null, distanceToDestination: '', durationRemaining: '', steps: [],
  });

  /** Registrar a instância do GoogleMap */
  const setMap = useCallback((map: google.maps.Map | null) => {
    mapRef.current = map;
  }, []);

  /** Mover câmera GPS — chamada atômica evita dessincronia */
  const moveCamera = useCallback((pos: LatLng) => {
    if (!mapRef.current || draggingRef.current) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      mapRef.current?.moveCamera({
        center: pos,
        heading: headRef.current, // ROTAÇÃO AUTOMÁTICA
        tilt: GPS_TILT,           // PERSPECTIVA 3D
        zoom: GPS_ZOOM,
      });
    });
  }, []);

  /** Buscar rota via Google Directions */
  const fetchRoute = useCallback(async (origin: LatLng, dest: LatLng) => {
    if (!window.google?.maps) return null;
    return new Promise<{ steps: NavigationStep[]; distance: string; duration: string } | null>(
      (resolve) => {
        new google.maps.DirectionsService().route(
          {
            origin: new google.maps.LatLng(origin.lat, origin.lng),
            destination: new google.maps.LatLng(dest.lat, dest.lng),
            travelMode: google.maps.TravelMode.WALKING,
            language: 'pt-BR',
          },
          (res, st) => {
            if (st !== google.maps.DirectionsStatus.OK || !res) { resolve(null); return; }
            const leg = res.routes[0].legs[0];
            resolve({
              steps: leg.steps.map((s) => ({
                instructions: s.instructions || '',
                distance: { text: s.distance?.text || '', value: s.distance?.value || 0 },
                duration: { text: s.duration?.text || '', value: s.duration?.value || 0 },
                maneuver: s.maneuver || undefined,
                startLocation: { lat: s.start_location.lat(), lng: s.start_location.lng() },
                endLocation: { lat: s.end_location.lat(), lng: s.end_location.lng() },
              })),
              distance: leg.distance?.text || '',
              duration: leg.duration?.text || '',
            });
          },
        );
      },
    );
  }, []);

  /** Callback de atualização de posição GPS */
  const onPosition = useCallback(
    (pos: GeolocationPosition) => {
      const { latitude: lat, longitude: lng, heading: geoH, speed: geoS, accuracy: acc } = pos.coords;
      const cur: LatLng = { lat, lng };

      // Calcular heading: preferir sensor do dispositivo, fallback = bearing
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

  /** Iniciar navegação */
  const startNavigation = useCallback(
    async (destination: LatLng, name: string) => {
      if (!navigator.geolocation) throw new Error('Geolocalização não disponível');
      destNameRef.current = name;
      const raw = await new Promise<GeolocationPosition>((ok, err) =>
        navigator.geolocation.getCurrentPosition(ok, err, { enableHighAccuracy: true, timeout: 10000 }),
      );
      const origin: LatLng = { lat: raw.coords.latitude, lng: raw.coords.longitude };
      const route = await fetchRoute(origin, destination);
      if (!route) throw new Error('Rota não encontrada');
      setState((prev) => ({
        ...prev, isNavigating: true, isOffCenter: false, steps: route.steps,
        currentStepIndex: 0, distanceToDestination: route.distance,
        durationRemaining: route.duration, userPosition: origin,
      }));
      mapRef.current?.moveCamera({ center: origin, heading: 0, tilt: GPS_TILT, zoom: GPS_ZOOM });
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = navigator.geolocation.watchPosition(onPosition, (e) => console.warn('GPS:', e), {
        enableHighAccuracy: true, maximumAge: 500, timeout: 10000,
      });
    },
    [fetchRoute, onPosition],
  );

  /** Parar navegação */
  const stopNavigation = useCallback(() => {
    if (watchRef.current != null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    if (recenterRef.current) clearTimeout(recenterRef.current);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    mapRef.current?.moveCamera({ tilt: 0, heading: 0, zoom: 16 });
    setState((prev) => ({ ...prev, isNavigating: false, isOffCenter: false, heading: 0 }));
  }, []);

  /** Recentralizar no usuário */
  const recenter = useCallback(() => {
    draggingRef.current = false;
    if (recenterRef.current) clearTimeout(recenterRef.current);
    setState((prev) => ({ ...prev, isOffCenter: false }));
    if (mapRef.current && lastPosRef.current)
      mapRef.current.moveCamera({ center: lastPosRef.current, heading: headRef.current, tilt: GPS_TILT, zoom: GPS_ZOOM });
  }, []);

  /** Evento: usuário arrastou o mapa */
  const onMapDrag = useCallback(() => {
    if (!state.isNavigating) return;
    draggingRef.current = true;
    setState((prev) => ({ ...prev, isOffCenter: true }));
    if (recenterRef.current) clearTimeout(recenterRef.current);
  }, [state.isNavigating]);

  /** Evento: usuário soltou o mapa — agenda recentralização */
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
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
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
