import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hotels } from '@/data/hotelsData';

const CACHE_KEY = 'hotel-images-cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedImages {
  timestamp: number;
  images: Record<string, string>;
}

export function useHotelImages() {
  const [hotelImages, setHotelImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check localStorage cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedImages = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL && Object.keys(parsed.images).length > 0) {
          setHotelImages(parsed.images);
          return;
        }
      }
    } catch { /* ignore parse errors */ }

    // Fetch from edge function
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const hotelList = hotels.map(h => ({ id: h.id, name: h.name }));
      
      const { data, error } = await supabase.functions.invoke('fetch-hotel-images', {
        body: { hotels: hotelList },
      });

      if (error) {
        console.error('Error fetching hotel images:', error);
        return;
      }

      if (data?.success && data.data) {
        const imageMap: Record<string, string> = {};
        for (const result of data.data) {
          if (result.imageUrl) {
            imageMap[result.hotelId] = result.imageUrl;
          }
        }
        
        setHotelImages(imageMap);
        
        // Cache in localStorage
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          images: imageMap,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch hotel images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (hotelId: string, fallback: string) => {
    return hotelImages[hotelId] || fallback;
  };

  return { hotelImages, isLoading, getImageUrl };
}
