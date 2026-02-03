import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Castle, Globe, Film, TreePine, Rocket, Waves, Sparkles, Building, Fish, Anchor, Blocks } from 'lucide-react';

// Types
export interface DBAttraction {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  thrill_level: string | null;
  park_id: string | null;
  slug: string;
  area: string | null;
  height_requirement: number | null;
  lightning_lane: boolean | null;
  tips: string | null;
  image_url: string | null;
}

export interface Attraction {
  name: string;
  description: string;
  type: 'ride' | 'show' | 'character' | 'experience';
  thrillLevel?: number;
  mustDo?: boolean;
}

export interface Park {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  attractions: Attraction[];
}

interface DBPark {
  id: string;
  name: string;
  slug: string;
  color: string;
}

// Map thrill_level string to numeric value
const thrillLevelMap: Record<string, number> = {
  'kid_friendly': 1,
  'mild': 1,
  'moderate': 2,
  'intense': 3,
  'extreme': 4,
};

// Map park slugs to icons
const parkIconMap: Record<string, React.ElementType> = {
  'magic-kingdom': Castle,
  'epcot': Globe,
  'hollywood-studios': Film,
  'animal-kingdom': TreePine,
  'universal-studios': Rocket,
  'islands-of-adventure': Waves,
  'epic-universe': Sparkles,
  'seaworld': Fish,
  'busch-gardens': Anchor,
  'volcano-bay': Waves,
  'legoland': Blocks,
  'discovery-cove': Fish,
  'disney-springs': Building,
};

// Map park slugs to gradient colors
const parkColorMap: Record<string, string> = {
  'magic-kingdom': 'from-blue-500 to-purple-500',
  'epcot': 'from-teal-500 to-cyan-500',
  'hollywood-studios': 'from-red-500 to-pink-500',
  'animal-kingdom': 'from-green-500 to-emerald-500',
  'universal-studios': 'from-yellow-500 to-orange-500',
  'islands-of-adventure': 'from-indigo-500 to-violet-500',
  'epic-universe': 'from-purple-500 to-pink-500',
  'seaworld': 'from-blue-400 to-cyan-500',
  'busch-gardens': 'from-emerald-500 to-green-600',
  'volcano-bay': 'from-orange-500 to-red-500',
  'legoland': 'from-yellow-400 to-red-500',
  'discovery-cove': 'from-cyan-400 to-blue-500',
  'disney-springs': 'from-gray-500 to-slate-600',
};

// Must-do attractions (curated list)
const mustDoAttractions = new Set([
  'Seven Dwarfs Mine Train',
  'TRON Lightcycle Run',
  'Happily Ever After',
  'Guardians of the Galaxy: Cosmic Rewind',
  'Frozen Ever After',
  "Remy's Ratatouille Adventure",
  "Soarin' Around the World",
  'Star Wars: Rise of the Resistance',
  'Slinky Dog Dash',
  "Mickey & Minnie's Runaway Railway",
  'Avatar Flight of Passage',
  'Expedition Everest',
  'Kilimanjaro Safaris',
  'Festival of the Lion King',
  "Hagrid's Magical Creatures Motorbike Adventure",
  'Harry Potter and the Forbidden Journey',
  'Jurassic World VelociCoaster',
  'Harry Potter and the Escape from Gringotts',
  'Hogwarts Express',
  'Stardust Racers',
  'Harry Potter and the Battle at the Ministry',
  "Mario Kart: Bowser's Challenge",
  'Mine-Cart Madness',
]);

// Cache for attractions data
let attractionsCache: { data: Park[]; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function useAttractions() {
  const [parks, setParks] = useState<Park[]>(() => {
    if (attractionsCache && Date.now() - attractionsCache.timestamp < CACHE_TTL) {
      return attractionsCache.data;
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    return !attractionsCache || Date.now() - attractionsCache.timestamp >= CACHE_TTL;
  });
  const [error, setError] = useState<string | null>(null);
  const isFetched = useRef(false);

  const fetchAttractions = useCallback(async (force = false) => {
    // Use cache if valid
    if (!force && attractionsCache && Date.now() - attractionsCache.timestamp < CACHE_TTL) {
      if (isFetched.current) return;
      setParks(attractionsCache.data);
      setIsLoading(false);
      isFetched.current = true;
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch parks and attractions in parallel
      const [parksResult, attractionsResult] = await Promise.all([
        supabase
          .from('parks')
          .select('id, name, slug, color')
          .order('name'),
        supabase
          .from('attractions')
          .select('id, name, description, type, thrill_level, park_id, slug, area, height_requirement, lightning_lane, tips, image_url')
          .order('name'),
      ]);

      if (parksResult.error) throw parksResult.error;
      if (attractionsResult.error) throw attractionsResult.error;

      const dbParks = (parksResult.data || []) as DBPark[];
      const dbAttractions = (attractionsResult.data || []) as DBAttraction[];

      // Group attractions by park
      const attractionsByPark = dbAttractions.reduce((acc, attr) => {
        if (attr.park_id) {
          if (!acc[attr.park_id]) acc[attr.park_id] = [];
          acc[attr.park_id].push(attr);
        }
        return acc;
      }, {} as Record<string, DBAttraction[]>);

      // Build parks with attractions
      const parksWithAttractions: Park[] = dbParks
        .filter(park => attractionsByPark[park.id]?.length > 0)
        .map(park => ({
          id: park.slug,
          name: park.name,
          icon: parkIconMap[park.slug] || Building,
          color: parkColorMap[park.slug] || 'from-gray-500 to-slate-500',
          attractions: (attractionsByPark[park.id] || []).map(attr => ({
            name: attr.name,
            description: attr.description || '',
            type: (attr.type as Attraction['type']) || 'ride',
            thrillLevel: thrillLevelMap[attr.thrill_level || 'mild'] || 1,
            mustDo: mustDoAttractions.has(attr.name),
          })),
        }));

      setParks(parksWithAttractions);
      
      // Update cache
      attractionsCache = { data: parksWithAttractions, timestamp: Date.now() };
      isFetched.current = true;
    } catch (err) {
      console.error('Error fetching attractions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load attractions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isFetched.current) {
      fetchAttractions();
    }
  }, [fetchAttractions]);

  // Get all attraction names for validation
  const allAttractionNames = useMemo(() => {
    return parks.flatMap(park => park.attractions.map(a => a.name));
  }, [parks]);

  // Get attractions by park ID/slug
  const getAttractionsByPark = useCallback((parkIdOrSlug: string) => {
    const park = parks.find(p => p.id === parkIdOrSlug || p.name === parkIdOrSlug);
    return park?.attractions || [];
  }, [parks]);

  // Force refresh
  const refresh = useCallback(() => {
    attractionsCache = null;
    isFetched.current = false;
    return fetchAttractions(true);
  }, [fetchAttractions]);

  return {
    parks,
    isLoading,
    error,
    allAttractionNames,
    getAttractionsByPark,
    refresh,
  };
}
