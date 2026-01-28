import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  Award,
  Users,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Navigation,
  ExternalLink,
  Sparkles,
  DollarSign,
  Calendar,
  Info,
  Heart,
  Share2,
  Bookmark,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurantWithDetails } from '@/hooks/useRestaurants';
import { useFavoriteSlugs, useToggleFavorite } from '@/hooks/useRestaurantFavorites';
import { useRestaurantAverageRating } from '@/hooks/useRestaurantReviews';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ReviewSection } from '@/components/restaurants/ReviewSection';

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  subcategory: string | null;
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
  images?: { id: string; image_url: string; display_order: number }[];
  menu_items?: { id: string; category: string; item_name: string }[];
}

const RestaurantDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: favoriteSlugs } = useFavoriteSlugs();
  const toggleFavorite = useToggleFavorite();
  const { data: avgRating } = useRestaurantAverageRating(restaurant?.id || null);
  
  const isFavorite = slug ? (favoriteSlugs?.has(slug) || false) : false;

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;

        // Fetch images
        const { data: images } = await supabase
          .from('restaurant_images')
          .select('*')
          .eq('restaurant_id', data.id)
          .order('display_order');

        // Fetch menu items
        const { data: menuItems } = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', data.id);

        setRestaurant({
          ...data,
          images: images || [],
          menu_items: menuItems || []
        });
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [slug]);

  const allImages = restaurant?.images?.length 
    ? restaurant.images.map(img => img.image_url)
    : restaurant?.image_url 
      ? [restaurant.image_url]
      : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const getPriceColor = (price: string | null) => {
    switch (price) {
      case '$': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case '$$': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case '$$$': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case '$$$$': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getCategoryInfo = (category: string | null) => {
    switch (category) {
      case 'disney':
        return { label: 'Disney', icon: '🏰', color: 'bg-blue-500' };
      case 'universal':
        return { label: 'Universal', icon: '🎬', color: 'bg-purple-500' };
      case 'fora-parques':
        return { label: 'Fora dos Parques', icon: '🍽️', color: 'bg-green-500' };
      default:
        return { label: 'Restaurante', icon: '🍴', color: 'bg-gray-500' };
    }
  };

  const groupedMenuItems = restaurant?.menu_items?.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item.item_name);
    return acc;
  }, {} as Record<string, string[]>) || {};

  const categoryLabels: Record<string, string> = {
    appetizers: '🥗 Entradas',
    mainCourses: '🍽️ Pratos Principais',
    desserts: '🍰 Sobremesas',
    drinks: '🍹 Bebidas'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[50vh] bg-muted animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurante não encontrado</h1>
          <Button onClick={() => navigate('/guia-restaurantes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Guia
          </Button>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(restaurant.category);

  return (
    <>
      <SEO 
        title={`${restaurant.name} - Guia de Restaurantes Orlando`}
        description={restaurant.description || `Descubra ${restaurant.name}, um dos melhores restaurantes de Orlando.`}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Image Section */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={allImages[currentImageIndex]}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
            onClick={() => navigate('/guia-restaurantes')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`backdrop-blur-sm ${
                isFavorite 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-black/30 hover:bg-black/50 text-white'
              }`}
              disabled={toggleFavorite.isPending}
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                if (restaurant) {
                  toggleFavorite.mutate({
                    restaurantId: restaurant.id,
                    restaurantSlug: restaurant.slug,
                    isFavorite,
                  });
                }
              }}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm"
              onClick={() => {
                navigator.share?.({
                  title: restaurant.name,
                  text: restaurant.description || '',
                  url: window.location.href
                });
              }}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Image Navigation */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={`${categoryInfo.color} text-white`}>
                  {categoryInfo.icon} {categoryInfo.label}
                </Badge>
                {restaurant.michelin && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
                    <Award className="w-3 h-3 mr-1" />
                    Michelin
                  </Badge>
                )}
                {restaurant.featured && (
                  <Badge className="bg-orange-500 text-white">
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    Destaque
                  </Badge>
                )}
                {restaurant.character_dining && (
                  <Badge className="bg-pink-500 text-white">
                    <Users className="w-3 h-3 mr-1" />
                    Character Dining
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-4">
                {restaurant.location && (
                  <p className="text-white/80 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {restaurant.location}
                    {restaurant.area && ` • ${restaurant.area}`}
                  </p>
                )}
                {avgRating && avgRating.count > 0 && (
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{avgRating.average.toFixed(1)}</span>
                    <span className="text-white/70 text-sm">({avgRating.count})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Faixa de Preço</p>
                <p className={`text-lg font-bold ${getPriceColor(restaurant.price_range)?.split(' ')[0]}`}>
                  {restaurant.price_range || '$$'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-muted-foreground">Reserva</p>
                <p className="text-lg font-bold text-green-600">
                  {restaurant.reservation_required ? 'Necessária' : 'Não necessária'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-4 text-center">
                <UtensilsCrossed className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">Culinária</p>
                <p className="text-lg font-bold text-blue-600">
                  {restaurant.cuisine || 'Variada'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="p-4 text-center">
                <Info className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="text-lg font-bold text-purple-600">
                  {restaurant.subcategory || 'Restaurante'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {restaurant.description && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Sobre o Restaurante
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {restaurant.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Highlights */}
          {restaurant.highlights && restaurant.highlights.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Destaques
                </h2>
                <div className="flex flex-wrap gap-2">
                  {restaurant.highlights.map((highlight, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700 px-3 py-1"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Must Try */}
          {restaurant.must_try && (
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600">
                  <Star className="w-5 h-5 fill-orange-500" />
                  Não Deixe de Provar
                </h2>
                <p className="text-foreground font-medium">
                  {restaurant.must_try}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Menu */}
          {Object.keys(groupedMenuItems).length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-primary" />
                  Menu Highlights
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(groupedMenuItems).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-lg mb-2">
                        {categoryLabels[category] || category}
                      </h3>
                      <ul className="space-y-1">
                        {items.map((item, idx) => (
                          <li key={idx} className="text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {restaurant.tips && (
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-600">
                  <Sparkles className="w-5 h-5" />
                  Dicas de Especialista
                </h2>
                <p className="text-foreground">
                  {restaurant.tips}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contact & Location */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Localização e Contato
              </h2>
              
              <div className="space-y-4">
                {restaurant.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-muted-foreground">{restaurant.address}</p>
                      <div className="flex gap-2 mt-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors text-sm font-medium"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Google Maps
                        </a>
                        <a
                          href={`https://waze.com/ul?q=${encodeURIComponent(restaurant.address)}&navigate=yes`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Waze
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {restaurant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <a href={`tel:${restaurant.phone}`} className="text-primary hover:underline">
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>
                )}

                {restaurant.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a 
                        href={restaurant.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Visitar site <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {restaurant.menu_url && (
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Menu</p>
                      <a 
                        href={restaurant.menu_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Ver menu completo <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <ReviewSection 
            restaurantId={restaurant.id} 
            restaurantName={restaurant.name} 
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {restaurant.website && (
              <Button 
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                onClick={() => window.open(restaurant.website!, '_blank')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Fazer Reserva
              </Button>
            )}
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/guia-restaurantes')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Guia
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantDetails;
