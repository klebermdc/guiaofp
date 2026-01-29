/**
 * useParkMarkers Hook
 * 
 * Manages marker icon generation for attractions and POIs on the park map.
 * Extracted from ParkMap.tsx for reusability and maintainability.
 */

import { useCallback } from 'react';
import { POI_CONFIG, type POIType } from '@/data/constants';
import type { LatLng, NavigationMode } from './useParkNavigation';

export interface MapAttraction {
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

export interface MapPOI {
  id: string;
  type: POIType;
  name: string;
  position: LatLng;
  schedule?: string | null;
  description?: string | null;
  menuUrl?: string | null;
  cuisineType?: string | null;
  requiresReservation?: boolean | null;
  hasWarning?: boolean | null;
  warningText?: string | null;
}

interface UseParkMarkersOptions {
  navigationMode: NavigationMode;
  userHeading: number;
}

interface UseParkMarkersReturn {
  getMarkerIcon: (attraction: MapAttraction) => google.maps.Icon | undefined;
  getPOIMarkerIcon: (type: POIType) => google.maps.Icon | google.maps.Symbol | undefined;
  getUserMarkerIcon: () => google.maps.Symbol | undefined;
  getCarMarkerIcon: () => google.maps.Icon | undefined;
}

export function useParkMarkers({ navigationMode, userHeading }: UseParkMarkersOptions): UseParkMarkersReturn {
  
  // Attraction marker with wait time colors - Star/burst shape
  const getMarkerIcon = useCallback((attraction: MapAttraction): google.maps.Icon | undefined => {
    if (typeof google === 'undefined') {
      return undefined;
    }
    
    const waitTimeColor = attraction.waitTime !== undefined 
      ? attraction.waitTime > 60 ? '#EF4444' 
        : attraction.waitTime > 30 ? '#F59E0B' 
        : '#22C55E'
      : '#6B7280';

    // Attraction marker: Star/burst shape with wait time - 64px size
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
  }, []);

  // POI marker with emoji - Modern balloon shape
  const getPOIMarkerIcon = useCallback((type: POIType): google.maps.Icon | google.maps.Symbol | undefined => {
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
  }, []);

  // User location marker - Arrow pointing in direction of travel
  const getUserMarkerIcon = useCallback((): google.maps.Symbol | undefined => {
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
  }, [navigationMode, userHeading]);

  // Car parking marker
  const getCarMarkerIcon = useCallback((): google.maps.Icon | undefined => {
    if (typeof google === 'undefined') {
      return undefined;
    }
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill="#F59E0B" stroke="white" stroke-width="2"/>
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" stroke="white" stroke-width="1.5" fill="none" transform="translate(0, 1)"/>
      <rect x="4" y="11" width="16" height="6" rx="2" fill="white" transform="translate(0, 1)"/>
      <circle cx="7" cy="16" r="1.5" fill="#F59E0B" transform="translate(0, 1)"/>
      <circle cx="17" cy="16" r="1.5" fill="#F59E0B" transform="translate(0, 1)"/>
    </svg>`;
    
    const svgUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    
    return {
      url: svgUrl,
      scaledSize: new google.maps.Size(36, 36),
      anchor: new google.maps.Point(18, 18),
    };
  }, []);

  return {
    getMarkerIcon,
    getPOIMarkerIcon,
    getUserMarkerIcon,
    getCarMarkerIcon,
  };
}
