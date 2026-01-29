import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TravelProfile {
  hotel?: string;
  hotelAddress?: string;
  arrivalDate?: string;
  departureDate?: string;
  parkDates?: Array<{ park: string; date: string; time_start?: string; time_end?: string; notes?: string }>;
}

interface AutoPopulateOptions {
  plannerId: string;
  travelProfile: TravelProfile | null;
}

// Map park names to categories and icons
const getParkInfo = (parkName: string): { category: string; color: string; icon: string } => {
  const parkLower = parkName.toLowerCase();
  
  if (parkLower.includes('magic kingdom')) {
    return { category: 'disney', color: '#1E40AF', icon: '🏰' };
  }
  if (parkLower.includes('epcot')) {
    return { category: 'disney', color: '#1E40AF', icon: '🌐' };
  }
  if (parkLower.includes('hollywood studios')) {
    return { category: 'disney', color: '#1E40AF', icon: '🎬' };
  }
  if (parkLower.includes('animal kingdom')) {
    return { category: 'disney', color: '#1E40AF', icon: '🦁' };
  }
  if (parkLower.includes('typhoon lagoon') || parkLower.includes('blizzard beach')) {
    return { category: 'disney', color: '#1E40AF', icon: '💦' };
  }
  if (parkLower.includes('universal studios')) {
    return { category: 'universal', color: '#7C3AED', icon: '🎥' };
  }
  if (parkLower.includes('islands of adventure')) {
    return { category: 'universal', color: '#7C3AED', icon: '🏝️' };
  }
  if (parkLower.includes('epic universe')) {
    return { category: 'universal', color: '#7C3AED', icon: '🌌' };
  }
  if (parkLower.includes('volcano bay')) {
    return { category: 'universal', color: '#7C3AED', icon: '🌋' };
  }
  if (parkLower.includes('seaworld')) {
    return { category: 'seaworld', color: '#0891B2', icon: '🐬' };
  }
  if (parkLower.includes('busch gardens')) {
    return { category: 'seaworld', color: '#0891B2', icon: '🎢' };
  }
  if (parkLower.includes('aquatica')) {
    return { category: 'seaworld', color: '#0891B2', icon: '🌊' };
  }
  if (parkLower.includes('discovery cove')) {
    return { category: 'seaworld', color: '#0891B2', icon: '🐠' };
  }
  if (parkLower.includes('legoland')) {
    return { category: 'other', color: '#EAB308', icon: '🧱' };
  }
  
  // Default for unknown parks
  return { category: 'other', color: '#6B7280', icon: '🎢' };
};

export const usePlannerAutoPopulate = () => {
  /**
   * Check if items already exist for a planner to avoid duplicates
   */
  const checkExistingItems = useCallback(async (plannerId: string): Promise<{
    hasHotelItems: boolean;
    parkDatesWithItems: Set<string>;
  }> => {
    const { data: existingItems } = await supabase
      .from('planner_items')
      .select('item_type, item_name, date')
      .eq('planner_id', plannerId);

    const hasHotelItems = existingItems?.some(item => item.item_type === 'hotel') || false;
    const parkDatesWithItems = new Set<string>(
      existingItems
        ?.filter(item => item.item_type === 'park')
        .map(item => `${item.item_name}-${item.date}`) || []
    );

    return { hasHotelItems, parkDatesWithItems };
  }, []);

  /**
   * Auto-populate planner with hotel check-in/check-out and park items
   */
  const autoPopulatePlanner = useCallback(async (options: AutoPopulateOptions): Promise<{
    hotelItemsAdded: number;
    parkItemsAdded: number;
  }> => {
    const { plannerId, travelProfile } = options;
    
    if (!plannerId || !travelProfile) {
      return { hotelItemsAdded: 0, parkItemsAdded: 0 };
    }

    // Check what already exists
    const { hasHotelItems, parkDatesWithItems } = await checkExistingItems(plannerId);

    const itemsToInsert: any[] = [];

    // === Hotel Check-in/Check-out ===
    if (!hasHotelItems && travelProfile.hotel && travelProfile.arrivalDate && travelProfile.departureDate) {
      const hotelName = travelProfile.hotel;
      const hotelAddress = travelProfile.hotelAddress || '';
      const displayName = hotelAddress 
        ? `${hotelName}\n📍 ${hotelAddress}`
        : hotelName;

      // Check-in item (arrival date, morning slot)
      itemsToInsert.push({
        planner_id: plannerId,
        date: travelProfile.arrivalDate,
        time_slot: 'morning',
        item_type: 'hotel',
        item_name: `🛬 Check-in: ${hotelName}`,
        category: 'hotel',
        color: '#4F46E5',
        icon: '🏨',
        notes: hotelAddress ? `Endereço: ${hotelAddress}` : null,
        order_index: 0,
        completed: false,
        reservation_confirmed: false,
      });

      // Check-out item (departure date, morning slot)
      itemsToInsert.push({
        planner_id: plannerId,
        date: travelProfile.departureDate,
        time_slot: 'morning',
        item_type: 'hotel',
        item_name: `🛫 Check-out: ${hotelName}`,
        category: 'hotel',
        color: '#4F46E5',
        icon: '🏨',
        notes: hotelAddress ? `Endereço: ${hotelAddress}` : null,
        order_index: 0,
        completed: false,
        reservation_confirmed: false,
      });
    }

    // === Park dates ===
    if (travelProfile.parkDates && travelProfile.parkDates.length > 0) {
      for (const parkDate of travelProfile.parkDates) {
        if (!parkDate.park || !parkDate.date) continue;
        
        // Check if this park+date combo already exists
        const key = `${parkDate.park}-${parkDate.date}`;
        if (parkDatesWithItems.has(key)) continue;

        const parkInfo = getParkInfo(parkDate.park);

        itemsToInsert.push({
          planner_id: plannerId,
          date: parkDate.date,
          time_slot: 'morning', // Parks go in the morning slot
          item_type: 'park',
          item_name: parkDate.park,
          category: parkInfo.category,
          color: parkInfo.color,
          icon: parkInfo.icon,
          notes: parkDate.notes || null,
          order_index: 0,
          completed: false,
          reservation_confirmed: false,
        });
      }
    }

    if (itemsToInsert.length === 0) {
      return { hotelItemsAdded: 0, parkItemsAdded: 0 };
    }

    // Insert all items
    const { error } = await supabase
      .from('planner_items')
      .insert(itemsToInsert);

    if (error) {
      console.error('Error auto-populating planner:', error);
      return { hotelItemsAdded: 0, parkItemsAdded: 0 };
    }

    const hotelItemsAdded = itemsToInsert.filter(i => i.item_type === 'hotel').length;
    const parkItemsAdded = itemsToInsert.filter(i => i.item_type === 'park').length;

    return { hotelItemsAdded, parkItemsAdded };
  }, [checkExistingItems]);

  return { autoPopulatePlanner };
};

export default usePlannerAutoPopulate;
