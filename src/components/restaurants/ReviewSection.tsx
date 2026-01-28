import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, User, Calendar, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useRestaurantReviews,
  useUserReview,
  useRestaurantAverageRating,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from '@/hooks/useRestaurantReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ReviewSectionProps {
  restaurantId: string;
  restaurantName: string;
}

const StarRating = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`transition-all ${readonly ? '' : 'cursor-pointer hover:scale-110'}`}
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export const ReviewSection = ({ restaurantId, restaurantName }: ReviewSectionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [visitDate, setVisitDate] = useState('');

  const { data: reviews, isLoading: reviewsLoading } = useRestaurantReviews(restaurantId);
  const { data: userReview } = useUserReview(restaurantId, user?.id || null);
  const { data: avgRating } = useRestaurantAverageRating(restaurantId);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    if (editingReview && userReview) {
      await updateReview.mutateAsync({
        reviewId: userReview.id,
        restaurantId,
        userId: user.id,
        rating,
        comment,
        visitDate: visitDate || undefined,
      });
    } else {
      await createReview.mutateAsync({
        restaurantId,
        userId: user.id,
        rating,
        comment,
        visitDate: visitDate || undefined,
      });
    }

    setShowForm(false);
    setEditingReview(false);
    resetForm();
  };

  const handleEdit = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || '');
      setVisitDate(userReview.visit_date || '');
      setEditingReview(true);
      setShowForm(true);
    }
  };

  const handleDelete = async () => {
    if (userReview && user) {
      await deleteReview.mutateAsync({
        reviewId: userReview.id,
        restaurantId,
        userId: user.id,
      });
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setVisitDate('');
  };

  const handleStartReview = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    resetForm();
    setEditingReview(false);
    setShowForm(true);
  };

  if (reviewsLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Header with Average Rating */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Avaliações
            </h2>
            {avgRating && avgRating.count > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={Math.round(avgRating.average)} readonly size="sm" />
                <span className="text-lg font-semibold">{avgRating.average.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({avgRating.count} {avgRating.count === 1 ? 'avaliação' : 'avaliações'})
                </span>
              </div>
            )}
          </div>

          {!userReview && !showForm && (
            <Button onClick={handleStartReview} className="gap-2">
              <Star className="w-4 h-4" />
              Avaliar Restaurante
            </Button>
          )}
        </div>

        {/* Review Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 border rounded-lg p-4 bg-muted/30"
            >
              <div>
                <Label className="mb-2 block">Sua avaliação *</Label>
                <StarRating rating={rating} onRatingChange={setRating} size="lg" />
              </div>

              <div>
                <Label htmlFor="comment" className="mb-2 block">
                  Comentário (opcional)
                </Label>
                <Textarea
                  id="comment"
                  placeholder={`Conte sua experiência em ${restaurantName}...`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="max-w-xs">
                <Label htmlFor="visitDate" className="mb-2 block">
                  Data da visita (opcional)
                </Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={rating === 0 || createReview.isPending || updateReview.isPending}
                >
                  {editingReview ? 'Atualizar' : 'Enviar'} Avaliação
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingReview(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* User's existing review */}
        {userReview && !showForm && (
          <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Sua avaliação</p>
                <StarRating rating={userReview.rating} readonly size="sm" />
                {userReview.comment && (
                  <p className="mt-2 text-foreground">{userReview.comment}</p>
                )}
                {userReview.visit_date && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Visitado em {format(parseISO(userReview.visit_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={handleEdit}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  disabled={deleteReview.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews && reviews.length > 0 ? (
            reviews
              .filter((r) => r.user_id !== user?.id)
              .map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating rating={review.rating} readonly size="sm" />
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(review.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-foreground">{review.comment}</p>
                      )}
                      {review.visit_date && (
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Visitado em {format(parseISO(review.visit_date), "MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
          ) : !userReview ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Seja o primeiro a avaliar este restaurante!</p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
