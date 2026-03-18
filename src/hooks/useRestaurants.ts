import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface RestaurantImage {
  id: string;
  restaurant_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface RestaurantMenuItem {
  id: string;
  restaurant_id: string;
  category: 'appetizers' | 'mainCourses' | 'desserts' | 'drinks';
  item_name: string;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  subcategory: string | null;
  park_id: string | null;
  location: string | null;
  area: string | null;
  address: string | null;
  phone: string | null;
  description: string | null;
  price_range: string | null;
  highlights: string[] | null;
  website: string | null;
  menu_url: string | null;
  image_url: string | null;
  reservation_required: boolean | null;
  character_dining: boolean | null;
  michelin: boolean | null;
  featured: boolean | null;
  cuisine: string | null;
  tips: string | null;
  must_try: string | null;
  latitude: number | null;
  longitude: number | null;
  average_cost_per_person: number | null;
  operating_hours: Json | null;
  created_at: string | null;
  color: string | null;
  type: string | null;
  // Relations
  images?: RestaurantImage[];
  menu_items?: RestaurantMenuItem[];
}

// Fetch all restaurants with their first image
export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      console.log('[useRestaurants] Fetching all restaurants from database...');
      const { data, error } = await supabase
        .from('restaurants')
        .select('*, restaurant_images(id, image_url, display_order)')
        .order('featured', { ascending: false })
        .order('name');

      if (error) {
        console.error('[useRestaurants] Query error:', error);
        throw error;
      }
      console.log(`[useRestaurants] Fetched ${data.length} restaurants`);
      return data.map((r: any) => ({
        ...r,
        images: (r.restaurant_images || []).map((img: any) => ({
          id: img.id,
          restaurant_id: r.id,
          image_url: img.image_url,
          display_order: img.display_order,
          created_at: '',
        })),
        restaurant_images: undefined,
      })) as Restaurant[];
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch restaurant with images and menu
export function useRestaurantWithDetails(restaurantId: string | null) {
  return useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;

      const [restaurantRes, imagesRes, menuRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', restaurantId).single(),
        supabase
          .from('restaurant_images')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('display_order'),
        supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId),
      ]);

      if (restaurantRes.error) throw restaurantRes.error;

      return {
        ...restaurantRes.data,
        images: imagesRes.data || [],
        menu_items: menuRes.data || [],
      } as Restaurant;
    },
    enabled: !!restaurantId,
  });
}

// Fetch restaurant images
export function useRestaurantImages(restaurantId: string | null) {
  return useQuery({
    queryKey: ['restaurant-images', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];

      const { data, error } = await supabase
        .from('restaurant_images')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order');

      if (error) throw error;
      return data as RestaurantImage[];
    },
    enabled: !!restaurantId,
  });
}

// Add restaurant image
export function useAddRestaurantImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      imageUrl,
      displayOrder = 0,
    }: {
      restaurantId: string;
      imageUrl: string;
      displayOrder?: number;
    }) => {
      const { data, error } = await supabase
        .from('restaurant_images')
        .insert({
          restaurant_id: restaurantId,
          image_url: imageUrl,
          display_order: displayOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['restaurant-images', variables.restaurantId],
      });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-page'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-guide'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['map-restaurants'] });
      toast.success('Imagem adicionada com sucesso!');
    },
    onError: (error) => {
      console.error('Error adding image:', error);
      toast.error('Erro ao adicionar imagem');
    },
  });
}

// Delete restaurant image
export function useDeleteRestaurantImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageId,
      restaurantId,
    }: {
      imageId: string;
      restaurantId: string;
    }) => {
      const { error } = await supabase
        .from('restaurant_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['restaurant-images', variables.restaurantId],
      });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-page'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-guide'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['map-restaurants'] });
      toast.success('Imagem removida com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
      toast.error('Erro ao remover imagem');
    },
  });
}

// Update restaurant
export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate all restaurant-related queries to ensure sync across all pages
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-page'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-guide'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['map-restaurants'] });
      toast.success('Restaurante atualizado!');
    },
    onError: (error) => {
      console.error('Error updating restaurant:', error);
      toast.error('Erro ao atualizar restaurante');
    },
  });
}

// Create restaurant
export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurant: { name: string; slug: string } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('restaurants')
        .insert(restaurant)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-page'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-guide'] });
      queryClient.invalidateQueries({ queryKey: ['map-restaurants'] });
      toast.success('Restaurante criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating restaurant:', error);
      toast.error('Erro ao criar restaurante');
    },
  });
}

// Delete restaurant
export function useDeleteRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('restaurants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-page'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants-guide'] });
      queryClient.invalidateQueries({ queryKey: ['map-restaurants'] });
      toast.success('Restaurante removido!');
    },
    onError: (error) => {
      console.error('Error deleting restaurant:', error);
      toast.error('Erro ao remover restaurante');
    },
  });
}
