import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RestaurantFavorite {
  id: string;
  user_id: string;
  restaurant_id: string;
  created_at: string;
}

// Fetch all user favorites
export function useRestaurantFavorites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['restaurant-favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('restaurant_favorites')
        .select('*, restaurants(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

// Fetch favorite slugs for quick lookup
export function useFavoriteSlugs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['restaurant-favorite-slugs', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();

      const { data, error } = await supabase
        .from('restaurant_favorites')
        .select('restaurant_id, restaurants(slug)')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const slugs = new Set<string>();
      data?.forEach((fav: { restaurants?: { slug?: string } }) => {
        if (fav.restaurants?.slug) {
          slugs.add(fav.restaurants.slug);
        }
      });
      return slugs;
    },
    enabled: !!user?.id,
  });
}

// Check if a specific restaurant is favorited
export function useIsFavorite(restaurantSlug: string | null) {
  const { data: favoriteSlugs } = useFavoriteSlugs();
  
  if (!restaurantSlug || !favoriteSlugs) return false;
  return favoriteSlugs.has(restaurantSlug);
}

// Toggle favorite mutation
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      restaurantId, 
      restaurantSlug, 
      isFavorite 
    }: { 
      restaurantId: string; 
      restaurantSlug: string;
      isFavorite: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('restaurant_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId);

        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('restaurant_favorites')
          .insert({
            user_id: user.id,
            restaurant_id: restaurantId,
          });

        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-favorite-slugs'] });
      
      if (result.action === 'added') {
        toast.success('Restaurante adicionado aos favoritos! ❤️');
      } else {
        toast.success('Restaurante removido dos favoritos');
      }
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast.error('Erro ao atualizar favoritos. Faça login para salvar favoritos.');
    },
  });
}

// Get restaurant ID by slug (helper)
export async function getRestaurantIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data.id;
}
