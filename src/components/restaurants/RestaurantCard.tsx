import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Star, 
  ExternalLink, 
  Clock, 
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Award,
  ChevronLeft,
  ChevronRight,
  Navigation
} from 'lucide-react';
import { type Restaurant } from '@/data/restaurantsData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getPriceColor = (price: string) => {
    switch (price) {
      case '$': return 'text-green-600 bg-green-100';
      case '$$': return 'text-blue-600 bg-blue-100';
      case '$$$': return 'text-purple-600 bg-purple-100';
      case '$$$$': return 'text-red-600 bg-red-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'disney':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">🏰 Disney</Badge>;
      case 'universal':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">🎬 Universal</Badge>;
      case 'fora-parques':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">🍽️ Fora dos Parques</Badge>;
      default:
        return null;
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === restaurant.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? restaurant.images.length - 1 : prev - 1
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Imagem do Restaurante */}
      <div className="relative h-56 overflow-hidden group">
        <img 
          src={restaurant.images[currentImageIndex]} 
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges sobre a imagem */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {getCategoryBadge(restaurant.category)}
          {restaurant.featured && (
            <Badge className="bg-orange-500 text-white hover:bg-orange-500">
              <Star className="w-3 h-3 mr-1 fill-white" />
              Destaque
            </Badge>
          )}
          {restaurant.michelin && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-400">
              <Award className="w-3 h-3 mr-1" />
              Michelin
            </Badge>
          )}
        </div>

        {/* Navegação de imagens */}
        {restaurant.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {restaurant.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Conteúdo do Card */}
      <CardContent className="p-6">
        {/* Título e Preço */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-foreground flex-1 leading-tight">
            {restaurant.name}
          </h3>
          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${getPriceColor(restaurant.priceRange)}`}>
            {restaurant.priceRange}
          </span>
        </div>

        {/* Localização com GPS */}
        {restaurant.address && (
          <div className="mb-3">
            <div className="flex items-start text-muted-foreground text-sm mb-2">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-orange-500" />
              <span className="line-clamp-2">{restaurant.address}</span>
            </div>
            {/* Botões de Navegação GPS */}
            <div className="flex gap-2 ml-6">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors text-xs font-medium border border-blue-500/30"
              >
                <Navigation className="w-3 h-3" />
                Google Maps
              </a>
              <a
                href={`https://waze.com/ul?q=${encodeURIComponent(restaurant.address)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 transition-colors text-xs font-medium border border-cyan-500/30"
              >
                <Navigation className="w-3 h-3" />
                Waze
              </a>
            </div>
          </div>
        )}

        {/* Telefone */}
        {restaurant.phone && (
          <div className="flex items-center text-muted-foreground mb-3 text-sm">
            <Phone className="w-4 h-4 mr-2 text-orange-500" />
            <a href={`tel:${restaurant.phone}`} className="hover:text-orange-600">
              {restaurant.phone}
            </a>
          </div>
        )}

        {/* Descrição */}
        <p className={`text-muted-foreground mb-4 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
          {restaurant.description}
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.highlights.slice(0, isExpanded ? undefined : 3).map((highlight, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200"
            >
              {highlight}
            </Badge>
          ))}
        </div>

        {/* Menu Expandido */}
        {isExpanded && restaurant.menu && (
          <div className="mt-4 p-4 bg-muted rounded-xl">
            <div className="flex items-center mb-3">
              <UtensilsCrossed className="w-5 h-5 text-orange-600 mr-2" />
              <h4 className="font-bold text-foreground">Menu Highlights</h4>
            </div>
            
            {restaurant.menu.appetizers && restaurant.menu.appetizers.length > 0 && (
              <div className="mb-3">
                <h5 className="font-semibold text-sm text-foreground mb-1">Entradas:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {restaurant.menu.appetizers.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {restaurant.menu.mainCourses && restaurant.menu.mainCourses.length > 0 && (
              <div className="mb-3">
                <h5 className="font-semibold text-sm text-foreground mb-1">Pratos Principais:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {restaurant.menu.mainCourses.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {restaurant.menu.desserts && restaurant.menu.desserts.length > 0 && (
              <div className="mb-3">
                <h5 className="font-semibold text-sm text-foreground mb-1">Sobremesas:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {restaurant.menu.desserts.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {restaurant.menu.drinks && restaurant.menu.drinks.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm text-foreground mb-1">Bebidas:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {restaurant.menu.drinks.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Ver Menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Ver Mais
              </>
            )}
          </Button>

          {restaurant.website && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(restaurant.website!, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Indicadores de Reserva */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          {restaurant.reservations ? (
            <span className="flex items-center text-green-600">
              <Clock className="w-3 h-3 mr-1" />
              Aceita reservas
            </span>
          ) : (
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Sem reservas (ordem de chegada)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
