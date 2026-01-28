import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RestaurantReview {
  id: string;
  restaurant_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  visit_date: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

export function useRestaurantReviews(restaurantId: string | null) {
  return useQuery({
    queryKey: ['restaurant-reviews', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];

      const { data, error } = await supabase
        .from('restaurant_reviews')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RestaurantReview[];
    },
    enabled: !!restaurantId,
  });
}

export function useUserReview(restaurantId: string | null, userId: string | null) {
  return useQuery({
    queryKey: ['user-review', restaurantId, userId],
    queryFn: async () => {
      if (!restaurantId || !userId) return null;

      const { data, error } = await supabase
        .from('restaurant_reviews')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as RestaurantReview | null;
    },
    enabled: !!restaurantId && !!userId,
  });
}

export function useRestaurantAverageRating(restaurantId: string | null) {
  return useQuery({
    queryKey: ['restaurant-avg-rating', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return { average: 0, count: 0 };

      const { data, error } = await supabase
        .from('restaurant_reviews')
        .select('rating')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { average: 0, count: 0 };
      }

      const sum = data.reduce((acc, r) => acc + r.rating, 0);
      return {
        average: sum / data.length,
        count: data.length,
      };
    },
    enabled: !!restaurantId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      userId,
      rating,
      comment,
      visitDate,
    }: {
      restaurantId: string;
      userId: string;
      rating: number;
      comment?: string;
      visitDate?: string;
    }) => {
      const { data, error } = await supabase
        .from('restaurant_reviews')
        .insert({
          restaurant_id: restaurantId,
          user_id: userId,
          rating,
          comment: comment || null,
          visit_date: visitDate || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-reviews', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-avg-rating', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', variables.restaurantId, variables.userId] });
      toast.success('Avaliação enviada com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Error creating review:', error);
      if (error.message.includes('duplicate')) {
        toast.error('Você já avaliou este restaurante');
      } else {
        toast.error('Erro ao enviar avaliação');
      }
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      restaurantId,
      userId,
      rating,
      comment,
      visitDate,
    }: {
      reviewId: string;
      restaurantId: string;
      userId: string;
      rating: number;
      comment?: string;
      visitDate?: string;
    }) => {
      const { data, error } = await supabase
        .from('restaurant_reviews')
        .update({
          rating,
          comment: comment || null,
          visit_date: visitDate || null,
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-reviews', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-avg-rating', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', variables.restaurantId, variables.userId] });
      toast.success('Avaliação atualizada!');
    },
    onError: (error) => {
      console.error('Error updating review:', error);
      toast.error('Erro ao atualizar avaliação');
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      restaurantId,
      userId,
    }: {
      reviewId: string;
      restaurantId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from('restaurant_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-reviews', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-avg-rating', variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', variables.restaurantId, variables.userId] });
      toast.success('Avaliação removida!');
    },
    onError: (error) => {
      console.error('Error deleting review:', error);
      toast.error('Erro ao remover avaliação');
    },
  });
}
