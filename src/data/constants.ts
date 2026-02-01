// Centralized constants for the application
// This file contains shared configuration used across multiple components

// ============= POI (Points of Interest) Configuration =============
// POI types for content_items table (managed in POI Editor)
export type POIType = 'restroom' | 'shop' | 'firstaid' | 'show';

// Extended POI type that includes 'restaurant' for the map display
// Restaurants are managed separately via the 'restaurants' table and AdminRestaurantsPanel
export type ExtendedPOIType = POIType | 'restaurant';

export interface POIConfig {
  label: string;
  color: string;
  emoji: string;
}

export const POI_CONFIG: Record<ExtendedPOIType, POIConfig> = {
  restroom: { label: 'Banheiros', color: '#0EA5E9', emoji: '🚽' },
  restaurant: { label: 'Restaurantes', color: '#F97316', emoji: '🍔' },
  shop: { label: 'Lojas', color: '#A855F7', emoji: '🛒' },
  firstaid: { label: 'Primeiros Socorros', color: '#EF4444', emoji: '⛑️' },
  show: { label: 'Shows', color: '#EC4899', emoji: '🎪' },
};

// Alternative config for admin (slightly different labels/emojis)
// Does NOT include restaurant since it's managed separately
export const POI_CONFIG_ADMIN: Record<POIType, POIConfig> = {
  restroom: { label: 'Banheiro', color: '#3B82F6', emoji: '🚻' },
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
  { id: '1b7bd1fc-bd26-432e-8afd-620980769928', name: 'Magic Kingdom', center: { lat: 28.4177, lng: -81.5812 }, zoom: 17 },
  { id: 'c5945e0b-056c-4376-9d14-68e9db296ce2', name: 'EPCOT', center: { lat: 28.3747, lng: -81.5494 }, zoom: 16 },
  { id: '69cb145a-d34d-4f7f-9759-a8613325b4e9', name: 'Hollywood Studios', center: { lat: 28.3575, lng: -81.5583 }, zoom: 17 },
  { id: 'd0905179-8ac1-484e-a05e-80e3e25789b8', name: 'Animal Kingdom', center: { lat: 28.3580, lng: -81.5900 }, zoom: 16 },
  { id: '7ca9972a-3bd9-4b9b-81a2-33cec9a7d57c', name: 'Universal Studios', center: { lat: 28.4752, lng: -81.4683 }, zoom: 17 },
  { id: 'cd4ff5ed-0ab7-4cd5-8523-6dde98353ed9', name: 'Islands of Adventure', center: { lat: 28.4711, lng: -81.4710 }, zoom: 17 },
  { id: '2d91ec83-0bfb-4041-84de-5f23179b51c2', name: 'Epic Universe', center: { lat: 28.4720, lng: -81.4450 }, zoom: 16 },
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
