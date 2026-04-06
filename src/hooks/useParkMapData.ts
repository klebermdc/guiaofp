import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getParksTableId } from '@/data/constants';
import type { ExtendedPOIType } from '@/data/constants';
import type { Attraction, POI, WaitTimeData } from '@/types/parkMap';
import { findWaitTime } from '@/utils/parkMapUtils';

export function useParkMapData(parkId: string, waitTimes: WaitTimeData[]) {
  const { data: dbAttractions = [], isLoading: isLoadingAttractions } = useQuery({
    queryKey: ['park-attractions', parkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, description, latitude, longitude, thrill_level, min_height, pass_type, type')
        .eq('category_id', parkId)
        .neq('type', 'poi')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching attractions:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        name: item.title,
        position: { lat: Number(item.latitude), lng: Number(item.longitude) },
        description: item.description || '',
        thrillLevel: item.thrill_level,
        minHeight: item.min_height,
        passType: item.pass_type,
      })) as Attraction[];
    },
  });

  const { data: dbPOIs = [], isLoading: isLoadingPOIs } = useQuery({
    queryKey: ['park-pois', parkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, latitude, longitude, icon, schedule, description, attraction_description, menu_url, cuisine_type, requires_reservation, has_warning, warning_text')
        .eq('category_id', parkId)
        .eq('type', 'poi')
        .eq('is_published', true);

      if (error) throw error;
      return data;
    },
  });

  const parksTableId = getParksTableId(parkId);
  const { data: dbRestaurants = [] } = useQuery({
    queryKey: ['map-restaurants', parkId, parksTableId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, latitude, longitude, description, menu_url, cuisine, reservation_required, tips, must_try, price_range, type')
        .eq('park_id', parksTableId);

      if (error) throw error;
      return data;
    },
  });

  const attractionsWithWaitTimes: Attraction[] = dbAttractions.map(attraction => {
    const waitTimeData = findWaitTime(attraction.name, waitTimes);
    return { ...attraction, waitTime: waitTimeData?.waitTime, isOpen: waitTimeData?.isOpen };
  });

  const contentItemPOIs: POI[] = dbPOIs
    .filter(poi => poi.latitude && poi.longitude)
    .map(poi => ({
      id: poi.id,
      type: (poi.icon as ExtendedPOIType) || 'restroom',
      name: poi.title,
      position: { lat: Number(poi.latitude), lng: Number(poi.longitude) },
      schedule: poi.schedule,
      description:
        (typeof poi.description === 'string' && poi.description.trim())
          ? poi.description
          : (typeof (poi as any).attraction_description === 'string' && (poi as any).attraction_description.trim())
            ? (poi as any).attraction_description
            : null,
      menuUrl: poi.menu_url,
      cuisineType: poi.cuisine_type,
      requiresReservation: poi.requires_reservation,
      hasWarning: poi.has_warning,
      warningText: poi.warning_text,
    }));

  const restaurantPOIs: POI[] = dbRestaurants
    .filter(r => r.latitude && r.longitude)
    .map(r => ({
      id: `restaurant-${r.id}`,
      type: 'restaurant' as ExtendedPOIType,
      name: r.name,
      position: { lat: Number(r.latitude), lng: Number(r.longitude) },
      schedule: null,
      description: r.description,
      menuUrl: r.menu_url,
      cuisineType: r.cuisine,
      requiresReservation: r.reservation_required,
      hasWarning: false,
      warningText: null,
      priceRange: r.price_range,
      serviceType: r.type,
      mustTry: r.must_try,
      tips: r.tips,
    }));

  const nonRestaurantPOIs = contentItemPOIs.filter(poi => poi.type !== 'restaurant');
  const currentParkPOIs: POI[] = [...nonRestaurantPOIs, ...restaurantPOIs];

  return { attractionsWithWaitTimes, currentParkPOIs, isLoadingAttractions, isLoadingPOIs };
}
