// Centralized constants for the application
// This file contains shared configuration used across multiple components

// ============= POI (Points of Interest) Configuration =============
export type POIType = 'restroom' | 'restaurant' | 'shop' | 'firstaid' | 'show';

export interface POIConfig {
  label: string;
  color: string;
  emoji: string;
}

export const POI_CONFIG: Record<POIType, POIConfig> = {
  restroom: { label: 'Banheiros', color: '#0EA5E9', emoji: '🚽' },
  restaurant: { label: 'Restaurantes', color: '#F97316', emoji: '🍔' },
  shop: { label: 'Lojas', color: '#A855F7', emoji: '🛒' },
  firstaid: { label: 'Primeiros Socorros', color: '#EF4444', emoji: '⛑️' },
  show: { label: 'Shows', color: '#EC4899', emoji: '🎪' },
};

// Alternative config for admin (slightly different labels/emojis)
export const POI_CONFIG_ADMIN: Record<POIType, POIConfig> = {
  restroom: { label: 'Banheiro', color: '#3B82F6', emoji: '🚻' },
  restaurant: { label: 'Restaurante', color: '#F97316', emoji: '🍽️' },
  shop: { label: 'Loja', color: '#A855F7', emoji: '🛍️' },
  firstaid: { label: 'Primeiros Socorros', color: '#EF4444', emoji: '🏥' },
  show: { label: 'Show', color: '#EC4899', emoji: '🎭' },
};

// ============= Parks Configuration =============
export interface Park {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  zoom: number;
}

export const PARKS: Park[] = [
  { id: 'dd6b79b8-d934-4e15-8967-1f1af1911fef', name: 'Magic Kingdom', center: { lat: 28.4177, lng: -81.5812 }, zoom: 17 },
  { id: '03e87b8e-7467-4121-971b-91826dd55bec', name: 'EPCOT', center: { lat: 28.3747, lng: -81.5494 }, zoom: 16 },
  { id: 'ffdca010-b62c-40cc-98ee-37a853da037d', name: 'Hollywood Studios', center: { lat: 28.3575, lng: -81.5583 }, zoom: 17 },
  { id: '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205', name: 'Animal Kingdom', center: { lat: 28.3580, lng: -81.5900 }, zoom: 16 },
  { id: 'c63c98b3-1cef-4d90-8142-0a68331907e1', name: 'Universal Studios', center: { lat: 28.4752, lng: -81.4683 }, zoom: 17 },
  { id: '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148', name: 'Islands of Adventure', center: { lat: 28.4711, lng: -81.4710 }, zoom: 17 },
  { id: 'ba562b14-26bf-4b12-a13d-2aa7df43297e', name: 'Epic Universe', center: { lat: 28.4720, lng: -81.4450 }, zoom: 16 },
];

// Helper to get park by ID
export const getParkById = (id: string): Park | undefined => {
  return PARKS.find(park => park.id === id);
};

// Helper to get park by name
export const getParkByName = (name: string): Park | undefined => {
  return PARKS.find(park => park.name.toLowerCase() === name.toLowerCase());
};

// Park names only (for simpler lists)
export const PARK_NAMES = PARKS.map(p => p.name);

// ============= Wait Time Thresholds =============
export const WAIT_TIME_THRESHOLDS = {
  low: 20,      // 0-20 min = green
  medium: 45,   // 21-45 min = yellow
  high: 60,     // 46-60 min = orange
  // > 60 min = red
} as const;

export const getWaitTimeColor = (waitTime: number | undefined): string => {
  if (waitTime === undefined || waitTime === 0) return 'bg-muted text-muted-foreground';
  if (waitTime <= WAIT_TIME_THRESHOLDS.low) return 'bg-success/20 text-success';
  if (waitTime <= WAIT_TIME_THRESHOLDS.medium) return 'bg-warning/20 text-warning';
  if (waitTime <= WAIT_TIME_THRESHOLDS.high) return 'bg-orange-500/20 text-orange-500';
  return 'bg-destructive/20 text-destructive';
};

// ============= Google Maps Configuration =============
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCib6OEwxnVUEan4mgc3YlITa4LMwahmbo';

export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: 'greedy',
};

// ============= Refresh Intervals =============
export const REFRESH_INTERVALS = {
  waitTimes: {
    desktop: 15000,  // 15 seconds
    mobile: 30000,   // 30 seconds
  },
  dashboard: 60000,  // 1 minute
} as const;

// ============= API Endpoints =============
export const QUEUE_TIMES_API = {
  baseUrl: 'https://queue-times.com/parks',
  parks: {
    'Magic Kingdom': '6',
    'EPCOT': '5',
    'Hollywood Studios': '7',
    'Animal Kingdom': '8',
    'Universal Studios': '64',
    'Islands of Adventure': '65',
    'Epic Universe': '334',
  },
} as const;

// ============= Thrill Levels =============
export const THRILL_LEVELS = {
  1: { label: 'Família', color: 'bg-success/20 text-success' },
  2: { label: 'Moderado', color: 'bg-warning/20 text-warning' },
  3: { label: 'Intenso', color: 'bg-orange-500/20 text-orange-500' },
  4: { label: 'Radical', color: 'bg-destructive/20 text-destructive' },
  5: { label: 'Extremo', color: 'bg-purple-500/20 text-purple-500' },
} as const;

// ============= WhatsApp Links =============
export const WHATSAPP_LINKS = {
  premium: 'https://wa.me/message/2US6I4NWQWLDD1',
  support: 'https://wa.me/message/2US6I4NWQWLDD1',
} as const;
