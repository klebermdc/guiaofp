import type { LatLng, WaitTimeData } from '@/types/parkMap';

export function normalizeAttractionName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^\w\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findWaitTime(attractionName: string, waitTimes: WaitTimeData[]): WaitTimeData | undefined {
  const normalizedName = normalizeAttractionName(attractionName);
  return waitTimes.find(wt => {
    const normalizedWtName = normalizeAttractionName(wt.name);
    return normalizedName === normalizedWtName ||
           normalizedName.includes(normalizedWtName) ||
           normalizedWtName.includes(normalizedName);
  });
}

export function calculateStraightLineDistance(from: LatLng, to: LatLng): number {
  const R = 6371e3;
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat * Math.PI) / 180;
  const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function estimateWalkingTime(meters: number): string {
  const minutes = Math.round(meters / 83.3);
  if (minutes < 1) return '1 min';
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
  }
  return `${minutes} min`;
}

export function calculateBearing(from: LatLng, to: LatLng): number {
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360;
}

export function getWaitTimeColor(waitTime: number | undefined): string {
  if (waitTime === undefined) return 'bg-muted text-muted-foreground';
  if (waitTime > 60) return 'bg-red-500 text-white';
  if (waitTime > 30) return 'bg-amber-500 text-white';
  return 'bg-green-500 text-white';
}

export function translateNavigationStep(instruction: string): string {
  const translations: [RegExp, string][] = [
    [/\bHead\b/gi, 'Siga'],
    [/\bnorth\b/gi, 'norte'],
    [/\bsouth\b/gi, 'sul'],
    [/\beast\b/gi, 'leste'],
    [/\bwest\b/gi, 'oeste'],
    [/\bnortheast\b/gi, 'nordeste'],
    [/\bnorthwest\b/gi, 'noroeste'],
    [/\bsoutheast\b/gi, 'sudeste'],
    [/\bsouthwest\b/gi, 'sudoeste'],
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
    [/\bon\b/gi, 'na'],
    [/\bonto\b/gi, 'para'],
    [/\btoward\b/gi, 'em direção a'],
    [/\btowards\b/gi, 'em direção a'],
    [/\bafter\b/gi, 'após'],
    [/\bPass by\b/gi, 'Passe por'],
    [/\bat\b/gi, 'em'],
    [/\bthe\b/gi, ''],
    [/\bin (\d+) ft\b/gi, 'em $1 pés'],
    [/\bin (\d+) m\b/gi, 'em $1 m'],
    [/\bft\b/gi, 'pés'],
    [/\(on the right\)/gi, '(à direita)'],
    [/\(on the left\)/gi, '(à esquerda)'],
  ];

  let translated = instruction;
  for (const [pattern, replacement] of translations) {
    translated = translated.replace(pattern, replacement);
  }
  return translated.replace(/\s+/g, ' ').trim();
}
