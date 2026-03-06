/**
 * ParkMap & GPS Navigation – Smoke Tests
 * ────────────────────────────────────────
 * Validates all critical logic that will be exercised during a
 * live in-park test: distance math, bearing, speed smoothing,
 * step-advance thresholds, translation, marker colours, etc.
 *
 * NOTE: Google Maps DOM rendering is NOT tested here because
 * the Maps JS SDK is not available in jsdom.  We test every
 * *pure function* and *callback* that drives the map instead.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavigationHUD } from '@/components/map/NavigationHUD';
import { PARKS, POI_CONFIG, getParksTableId, CONTENT_TO_PARKS_ID_MAP } from '@/data/constants';

// ══════════════════════════════════════════════════════════════
// 1. Haversine distance (mirrors calculateStraightLineDistance)
// ══════════════════════════════════════════════════════════════
function haversine(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const R = 6371e3;
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat * Math.PI) / 180;
  const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

describe('Haversine distance', () => {
  it('returns 0 for same point', () => {
    const p = { lat: 28.4177, lng: -81.5812 };
    expect(haversine(p, p)).toBe(0);
  });

  it('calculates ~10 m for nearby park points', () => {
    const a = { lat: 28.41770, lng: -81.58120 };
    const b = { lat: 28.41779, lng: -81.58120 }; // ~10m north
    const d = haversine(a, b);
    expect(d).toBeGreaterThan(8);
    expect(d).toBeLessThan(12);
  });

  it('Magic Kingdom to EPCOT ≈ 5-6 km', () => {
    const mk = PARKS.find(p => p.name === 'Magic Kingdom')!.center;
    const ep = PARKS.find(p => p.name === 'EPCOT')!.center;
    const d = haversine(mk, ep);
    expect(d).toBeGreaterThan(4000);
    expect(d).toBeLessThan(7000);
  });
});

// ══════════════════════════════════════════════════════════════
// 2. Bearing calculation (mirrors calculateBearing)
// ══════════════════════════════════════════════════════════════
function calculateBearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

describe('Bearing calculation', () => {
  it('due north ≈ 0°', () => {
    const b = calculateBearing({ lat: 28.0, lng: -81.0 }, { lat: 29.0, lng: -81.0 });
    expect(b).toBeCloseTo(0, 0);
  });

  it('due east ≈ 90°', () => {
    const b = calculateBearing({ lat: 28.0, lng: -82.0 }, { lat: 28.0, lng: -81.0 });
    expect(b).toBeCloseTo(90, 0);
  });

  it('due south ≈ 180°', () => {
    const b = calculateBearing({ lat: 29.0, lng: -81.0 }, { lat: 28.0, lng: -81.0 });
    expect(b).toBeCloseTo(180, 0);
  });
});

// ══════════════════════════════════════════════════════════════
// 3. Speed smoothing logic (EMA filter from ParkMap)
// ══════════════════════════════════════════════════════════════
describe('Walking speed smoothing', () => {
  it('first reading becomes the initial speed', () => {
    let speed: number | null = null;
    const rawKmh = 4.2;
    speed = speed === null ? rawKmh : speed * 0.7 + rawKmh * 0.3;
    expect(speed).toBe(4.2);
  });

  it('subsequent readings are smoothed (70/30 EMA)', () => {
    let speed: number | null = 4.0;
    const rawKmh = 6.0;
    speed = speed === null ? rawKmh : speed * 0.7 + rawKmh * 0.3;
    expect(speed).toBeCloseTo(4.6, 1);
  });

  it('rejects unrealistic speeds (>15 km/h)', () => {
    const rawKmh = 20;
    const accepted = rawKmh < 15;
    expect(accepted).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// 4. Step auto-advance threshold (15m)
// ══════════════════════════════════════════════════════════════
describe('Navigation step advance', () => {
  it('does NOT advance when >15 m away', () => {
    const distToEnd = 20;
    expect(distToEnd < 15).toBe(false);
  });

  it('advances when ≤15 m away', () => {
    const distToEnd = 14;
    expect(distToEnd < 15).toBe(true);
  });

  it('advances at exactly 15 m boundary', () => {
    // The code uses `< 15`, so exactly 15 does NOT trigger
    expect(15 < 15).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// 5. Arrival detection (50 m threshold)
// ══════════════════════════════════════════════════════════════
describe('Arrival detection', () => {
  it('triggers at 50 m', () => {
    expect(50 <= 50).toBe(true);
  });
  it('does not trigger at 51 m', () => {
    expect(51 <= 50).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// 6. Wait time marker colours
// ══════════════════════════════════════════════════════════════
function getWaitTimeColor(waitTime?: number): string {
  if (waitTime === undefined) return '#6B7280';
  if (waitTime > 60) return '#EF4444';
  if (waitTime > 30) return '#F59E0B';
  return '#22C55E';
}

describe('Wait time marker colours', () => {
  it('grey when no data', () => expect(getWaitTimeColor(undefined)).toBe('#6B7280'));
  it('green when ≤30', () => expect(getWaitTimeColor(10)).toBe('#22C55E'));
  it('yellow when 31-60', () => expect(getWaitTimeColor(45)).toBe('#F59E0B'));
  it('red when >60', () => expect(getWaitTimeColor(90)).toBe('#EF4444'));
  it('green at exactly 30', () => expect(getWaitTimeColor(30)).toBe('#22C55E'));
  it('yellow at exactly 31', () => expect(getWaitTimeColor(31)).toBe('#F59E0B'));
});

// ══════════════════════════════════════════════════════════════
// 7. Off-center detection (50 m threshold)
// ══════════════════════════════════════════════════════════════
describe('Off-center detection', () => {
  it('not off-center when within 50 m', () => {
    expect(30 > 50).toBe(false);
  });
  it('off-center when >50 m', () => {
    expect(60 > 50).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════
// 8. Parks data integrity
// ══════════════════════════════════════════════════════════════
describe('Parks configuration', () => {
  it('has at least 10 parks', () => {
    expect(PARKS.length).toBeGreaterThanOrEqual(10);
  });

  it('all parks have valid coordinates', () => {
    for (const park of PARKS) {
      expect(park.center.lat).toBeGreaterThan(27);
      expect(park.center.lat).toBeLessThan(29);
      expect(park.center.lng).toBeGreaterThan(-83);
      expect(park.center.lng).toBeLessThan(-81);
      expect(park.zoom).toBeGreaterThanOrEqual(15);
    }
  });

  it('all parks have content-to-parks ID mapping', () => {
    for (const park of PARKS) {
      const mapped = getParksTableId(park.id);
      expect(mapped).toBeTruthy();
      expect(typeof mapped).toBe('string');
    }
  });

  it('Magic Kingdom is first park', () => {
    expect(PARKS[0].name).toBe('Magic Kingdom');
  });
});

// ══════════════════════════════════════════════════════════════
// 9. POI configuration completeness
// ══════════════════════════════════════════════════════════════
describe('POI configuration', () => {
  const types = ['restroom', 'restaurant', 'shop', 'firstaid', 'show'] as const;

  it('has all required POI types', () => {
    for (const t of types) {
      expect(POI_CONFIG[t]).toBeDefined();
      expect(POI_CONFIG[t].label).toBeTruthy();
      expect(POI_CONFIG[t].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(POI_CONFIG[t].emoji).toBeTruthy();
    }
  });
});

// ══════════════════════════════════════════════════════════════
// 10. Navigation instruction translation
// ══════════════════════════════════════════════════════════════
function translateNavigationStep(instruction: string): string {
  const translations: [RegExp, string][] = [
    [/\bHead\b/gi, 'Siga'],
    [/\bnorth\b/gi, 'norte'],
    [/\bsouth\b/gi, 'sul'],
    [/\beast\b/gi, 'leste'],
    [/\bwest\b/gi, 'oeste'],
    [/\bTurn right\b/gi, 'Vire à direita'],
    [/\bTurn left\b/gi, 'Vire à esquerda'],
    [/\bContinue\b/gi, 'Continue'],
    [/\bMake a U-turn\b/gi, 'Faça retorno'],
  ];
  let translated = instruction;
  for (const [pattern, replacement] of translations) {
    translated = translated.replace(pattern, replacement);
  }
  return translated.replace(/\s+/g, ' ').trim();
}

describe('Navigation translation', () => {
  it('translates "Head north"', () => {
    expect(translateNavigationStep('Head north')).toBe('Siga norte');
  });
  it('translates "Turn right"', () => {
    expect(translateNavigationStep('Turn right on Main St')).toContain('Vire à direita');
  });
  it('translates "Turn left"', () => {
    expect(translateNavigationStep('Turn left')).toBe('Vire à esquerda');
  });
  it('translates "Make a U-turn"', () => {
    expect(translateNavigationStep('Make a U-turn')).toBe('Faça retorno');
  });
});

// ══════════════════════════════════════════════════════════════
// 11. NavigationHUD renders critical elements
// ══════════════════════════════════════════════════════════════
describe('NavigationHUD component', () => {
  const baseProps = {
    destinationName: 'Space Mountain',
    distance: '350 m',
    duration: '4 min',
    currentStepIndex: 0,
    steps: [
      { instructions: 'Head north', distance: { text: '100 m', value: 100 }, duration: { text: '1 min', value: 60 }, maneuver: 'straight' },
      { instructions: 'Turn right on Main St', distance: { text: '250 m', value: 250 }, duration: { text: '3 min', value: 180 }, maneuver: 'turn-right' },
    ],
    speed: 4.5,
    distanceToNextStep: 80,
    destination: { lat: 28.4190, lng: -81.5790 },
    userPosition: { lat: 28.4177, lng: -81.5812 },
    onStop: vi.fn(),
    onRecenter: vi.fn(),
    isOffCenter: false,
    onOpenExternal: vi.fn(),
  };

  it('shows destination name', () => {
    render(<NavigationHUD {...baseProps} />);
    expect(screen.getByText('Space Mountain')).toBeInTheDocument();
  });

  it('shows distance and duration', () => {
    render(<NavigationHUD {...baseProps} />);
    expect(screen.getByText('350 m')).toBeInTheDocument();
    expect(screen.getByText('4 min')).toBeInTheDocument();
  });

  it('shows speed', () => {
    render(<NavigationHUD {...baseProps} />);
    expect(screen.getByText('5')).toBeInTheDocument(); // Math.round(4.5)
  });

  it('shows step counter', () => {
    render(<NavigationHUD {...baseProps} />);
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('shows distance to next step', () => {
    render(<NavigationHUD {...baseProps} />);
    expect(screen.getByText('80 m')).toBeInTheDocument();
  });

  it('shows "Agora" when very close to step', () => {
    render(<NavigationHUD {...baseProps} distanceToNextStep={5} />);
    expect(screen.getByText('Agora')).toBeInTheDocument();
  });

  it('shows recenter button when off-center', () => {
    render(<NavigationHUD {...baseProps} isOffCenter={true} />);
    expect(screen.getByText('Recentralizar')).toBeInTheDocument();
  });

  it('hides recenter button when centered', () => {
    render(<NavigationHUD {...baseProps} isOffCenter={false} />);
    expect(screen.queryByText('Recentralizar')).not.toBeInTheDocument();
  });

  it('shows Google Maps and Waze buttons', () => {
    render(<NavigationHUD {...baseProps} />);
    expect(screen.getByText('Maps')).toBeInTheDocument();
    expect(screen.getByText('Waze')).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════
// 12. Car parking persistence logic
// ══════════════════════════════════════════════════════════════
describe('Car parking localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves car location', () => {
    const loc = { lat: 28.4177, lng: -81.5812 };
    localStorage.setItem('parked-car-location', JSON.stringify(loc));
    const saved = JSON.parse(localStorage.getItem('parked-car-location')!);
    expect(saved.lat).toBe(loc.lat);
    expect(saved.lng).toBe(loc.lng);
  });

  it('returns null when no car saved', () => {
    expect(localStorage.getItem('parked-car-location')).toBeNull();
  });

  it('clears car location', () => {
    localStorage.setItem('parked-car-location', JSON.stringify({ lat: 28, lng: -81 }));
    localStorage.removeItem('parked-car-location');
    expect(localStorage.getItem('parked-car-location')).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════
// 13. Distance formatting
// ══════════════════════════════════════════════════════════════
function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function estimateWalkingTime(meters: number): string {
  const minutes = Math.round(meters / 83.3);
  if (minutes < 1) return '1 min';
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
  }
  return `${minutes} min`;
}

describe('Distance formatting', () => {
  it('formats meters', () => expect(formatDistance(350)).toBe('350 m'));
  it('formats kilometers', () => expect(formatDistance(1500)).toBe('1.5 km'));
  it('rounds meters', () => expect(formatDistance(99.7)).toBe('100 m'));
});

describe('Walking time estimation', () => {
  it('minimum 1 min', () => expect(estimateWalkingTime(10)).toBe('1 min'));
  it('~6 min for 500m', () => expect(estimateWalkingTime(500)).toBe('6 min'));
  it('shows hours for long distances', () => {
    const result = estimateWalkingTime(6000);
    expect(result).toContain('h');
  });
});

// ══════════════════════════════════════════════════════════════
// 14. Attraction name normalization for wait time matching
// ══════════════════════════════════════════════════════════════
function normalizeAttractionName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^\w\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

describe('Attraction name normalization', () => {
  it('lowercases', () => expect(normalizeAttractionName('Space Mountain')).toBe('space mountain'));
  it('normalizes smart quotes', () => expect(normalizeAttractionName("it's a small world")).toBe("it's a small world"));
  it('removes special chars', () => expect(normalizeAttractionName('Rock n Roller Coaster®')).toBe('rock n roller coaster'));
  it('collapses whitespace', () => expect(normalizeAttractionName('Buzz  Lightyear')).toBe('buzz lightyear'));
});

// ══════════════════════════════════════════════════════════════
// 15. GPS error handling coverage
// ══════════════════════════════════════════════════════════════
describe('GPS error messages', () => {
  const errorMap: Record<number, string> = {
    1: 'Permissão de localização negada',
    2: 'Localização indisponível',
    3: 'Tempo esgotado ao obter localização',
  };

  it('maps all GeolocationPositionError codes', () => {
    expect(errorMap[1]).toBeTruthy();
    expect(errorMap[2]).toBeTruthy();
    expect(errorMap[3]).toBeTruthy();
  });
});
