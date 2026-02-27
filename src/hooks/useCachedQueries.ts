import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches parks, restaurants, shopping, and activities in parallel.
 * Used by ActivityLibrary and other components that need the full library data.
 */
export async function fetchLibraryDataParallel() {
  const [parksResult, restaurantsResult, shoppingResult, activitiesResult] = await Promise.all([
    supabase
      .from('parks')
      .select('id, name, slug, color, typical_visit_duration')
      .order('name'),
    supabase
      .from('restaurants')
      .select('id, name, color, area, park_id, cuisine, description, menu_url, must_try, tips, type, parks(name, slug, color)')
      .order('name'),
    supabase
      .from('shopping')
      .select('id, name, color, category, average_visit_duration')
      .order('name'),
    supabase
      .from('activities')
      .select('id, name, color, category, duration')
      .order('name'),
  ]);

  if (parksResult.error) throw parksResult.error;
  if (restaurantsResult.error) throw restaurantsResult.error;
  if (shoppingResult.error) throw shoppingResult.error;
  if (activitiesResult.error) throw activitiesResult.error;

  return {
    parks: parksResult.data || [],
    restaurants: restaurantsResult.data || [],
    shopping: shoppingResult.data || [],
    activities: activitiesResult.data || [],
  };
}

/** Cache TTLs in minutes */
export const CACHE_TTL = {
  /** Static data: parks, attractions, restaurants, activities, shopping */
  STATIC: 24 * 60, // 24 hours
  /** Dynamic data: wait times, availability */
  DYNAMIC: 5, // 5 minutes
  /** User data: planners, preferences */
  USER: 15, // 15 minutes
} as const;
