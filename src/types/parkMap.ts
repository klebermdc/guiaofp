import type { ExtendedPOIType } from '@/data/constants';

export type LatLng = { lat: number; lng: number };

export interface WaitTimeData {
  id: number | string;
  name: string;
  isOpen: boolean;
  waitTime: number;
  lastUpdated: string;
}

export interface Attraction {
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

export interface POI {
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

export interface RouteInfo {
  distance: string;
  duration: string;
  destinationName: string;
  destination?: LatLng;
}

export type NavigationMode = 'preview' | 'guided';
