import { useState, useMemo } from 'react';
import { Search, MapPin, Star, UtensilsCrossed, Filter, Loader2, Sparkles, ChefHat, Wine, Utensils } from 'lucide-react';
import { useRestaurants, type Restaurant } from '@/hooks/useRestaurants';
import { restaurantsData as staticRestaurantsData, type Restaurant as StaticRestaurant } from '@/data/restaurantsData';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { motion } from 'framer-motion';

// Converter dados do Supabase para o formato esperado pelo RestaurantCard
const convertToCardFormat = (restaurant: Restaurant): StaticRestaurant => ({
  id: restaurant.slug, // Use slug as ID for navigation
  name: restaurant.name,
  category: (restaurant.category as 'disney' | 'universal' | 'fora-parques') || 'fora-parques',
  subcategory: restaurant.subcategory || undefined,
  park: restaurant.location || restaurant.area || undefined,
  address: restaurant.address || '',
  phone: restaurant.phone || undefined,
  description: restaurant.description || '',
  priceRange: (restaurant.price_range as '$' | '$$' | '$$$' | '$$$$') || '$$',
  highlights: restaurant.highlights || [],
  website: restaurant.website || undefined,
  reservations: restaurant.reservation_required || false,
  michelin: restaurant.michelin || false,
  featured: restaurant.featured || false,
  images: restaurant.image_url ? [restaurant.image_url] : [],
  menu: {
    appetizers: [],
    mainCourses: restaurant.must_try ? [restaurant.must_try] : [],
    desserts: [],
    drinks: [],
  },
});

const RestaurantsGuide = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedPark, setSelectedPark] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');

  // Fetch restaurants from Supabase
  const { data: supabaseRestaurants = [], isLoading } = useRestaurants();

  // Use Supabase data if available, otherwise fallback to static data
  const restaurantsData: StaticRestaurant[] = useMemo(() => {
    if (supabaseRestaurants.length > 0) {
      return supabaseRestaurants.map(convertToCardFormat);
    }
    return staticRestaurantsData;
  }, [supabaseRestaurants]);

  // Organize restaurants by category
  const disneyRestaurants = restaurantsData.filter(r => r.category === 'disney');
  const universalRestaurants = restaurantsData.filter(r => r.category === 'universal');
  const outsideRestaurants = restaurantsData.filter(r => r.category === 'fora-parques');

  // Lista fixa de parques Disney
  const disneyParks = [
    'Magic Kingdom',
    'EPCOT', 
    'Hollywood Studios',
    'Animal Kingdom',
    'Disney Springs',
    'Grand Floridian Resort',
    'Contemporary Resort',
    'Animal Kingdom Lodge',
    'Polynesian Village Resort'
  ];

  // Lista fixa de parques Universal
  const universalParks = [
    'Universal Studios Florida',
    'Islands of Adventure',
    'Epic Universe',
    'Volcano Bay',
    'CityWalk'
  ];

  // Regiões de Orlando para restaurantes fora dos parques - atualizado
  const orlandoRegions = [
    'Restaurant Row',
    'International Drive',
    'Winter Park',
    'Mills 50',
    'Kissimmee',
    'Lake Buena Vista',
    'Downtown Orlando',
    'Dr. Phillips',
    'Sand Lake Road',
    'Celebration',
    'Golden Oak',
    'Edgewater',
    'Orlando',
    'Tampa'
  ];

  // Get unique subcategories (tipos de culinária)
  const subcategories = [...new Set(outsideRestaurants.map(r => r.subcategory).filter(Boolean))].sort();

  // Filter restaurants
  const filteredRestaurants = useMemo(() => {
    let filtered = restaurantsData;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.address.toLowerCase().includes(searchLower) ||
        r.subcategory?.toLowerCase().includes(searchLower) ||
        r.park?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Park filter - para Disney e Universal
    if (selectedPark !== 'all') {
      filtered = filtered.filter(r => r.park === selectedPark);
    }

    // Region filter (para fora dos parques) - Corrigido!
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(r => r.park === selectedRegion);
    }

    // Subcategory filter
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(r => r.subcategory === selectedSubcategory);
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(r => r.priceRange === priceFilter);
    }

    return filtered;
  }, [restaurantsData, searchTerm, selectedCategory, selectedPark, selectedRegion, selectedSubcategory, priceFilter]);

  // Stats cards data
  const statsCards = [
    { 
      icon: UtensilsCrossed, 
      value: restaurantsData.length, 
      label: 'Restaurantes', 
      color: 'from-orange-500 to-red-500' 
    },
    { 
      icon: ChefHat, 
      value: disneyRestaurants.length, 
      label: 'Disney', 
      color: 'from-blue-500 to-indigo-500' 
    },
    { 
      icon: Utensils, 
      value: universalRestaurants.length, 
      label: 'Universal', 
      color: 'from-purple-500 to-pink-500' 
    },
    { 
      icon: Sparkles, 
      value: restaurantsData.filter(r => r.michelin).length, 
      label: 'Michelin', 
      color: 'from-yellow-500 to-amber-500' 
    },
  ];

  return (
    <AppLayout>
      <SEO 
        title="Guia de Restaurantes Orlando | 100+ Restaurantes Disney, Universal e Orlando"
        description="Descubra os melhores restaurantes de Orlando. Guia completo com 100+ opções nos parques Disney, Universal e fora dos parques."
      />
      
      <div className="space-y-8">
        {/* Hero Header - Redesigned */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 text-white py-16 px-8 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 rounded-b-[3rem]"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-white rounded-full" />
            <div className="absolute top-1/2 left-1/3 w-24 h-24 border-4 border-white rounded-full" />
          </div>
          
          <div className="relative max-w-5xl mx-auto text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6"
            >
              <UtensilsCrossed className="w-10 h-10" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Guia de Restaurantes
            </h1>
            <p className="text-xl text-white/90 mb-2 max-w-2xl mx-auto">
              Descubra experiências gastronômicas incríveis em Orlando
            </p>
            <p className="text-white/70">
              De comida de parque a fine dining com estrela Michelin
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 relative z-10 px-4"
        >
          {statsCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-br ${stat.color} p-4 text-white`}>
                  <stat.icon className="w-6 h-6 mb-2 opacity-80" />
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Search and Filters - Redesigned */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Buscar por nome, culinária, localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-xl border-2 border-border/50 focus:border-primary bg-background/50"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { value: 'all', label: '🍽️ Todos', count: restaurantsData.length },
                  { value: 'disney', label: '🏰 Disney', count: disneyRestaurants.length },
                  { value: 'universal', label: '🎬 Universal', count: universalRestaurants.length },
                  { value: 'fora-parques', label: '🌴 Fora dos Parques', count: outsideRestaurants.length },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setSelectedPark('all');
                      setSelectedRegion('all');
                      setSelectedSubcategory('all');
                    }}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === cat.value
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    {cat.label} <span className="opacity-70">({cat.count})</span>
                  </button>
                ))}
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Park (Disney) */}
                {selectedCategory === 'disney' && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Parque Disney
                    </label>
                    <select
                      value={selectedPark}
                      onChange={(e) => setSelectedPark(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-border/50 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="all">Todos os Parques</option>
                      {disneyParks.map(park => (
                        <option key={park} value={park}>{park}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Park (Universal) */}
                {selectedCategory === 'universal' && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Parque Universal
                    </label>
                    <select
                      value={selectedPark}
                      onChange={(e) => setSelectedPark(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-border/50 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="all">Todos os Parques</option>
                      {universalParks.map(park => (
                        <option key={park} value={park}>{park}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Região Orlando (Fora dos Parques) */}
                {selectedCategory === 'fora-parques' && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Região
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-border/50 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="all">Todas as Regiões</option>
                      {orlandoRegions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Cuisine Type (Outside Parks) */}
                {selectedCategory === 'fora-parques' && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Tipo de Culinária
                    </label>
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-border/50 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="all">Todos os Tipos</option>
                      {subcategories.map(subcat => (
                        <option key={subcat} value={subcat}>{subcat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Faixa de Preço
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-border/50 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="all">Todas</option>
                    <option value="$">$ - Econômico</option>
                    <option value="$$">$$ - Moderado</option>
                    <option value="$$$">$$$ - Alto</option>
                    <option value="$$$$">$$$$ - Premium</option>
                  </select>
                </div>
              </div>

              {/* Results Counter */}
              <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
                <Wine className="w-4 h-4" />
                <span>
                  <span className="font-bold text-foreground">{filteredRestaurants.length}</span> restaurante(s) encontrado(s)
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
            <span className="text-muted-foreground text-lg">Carregando restaurantes...</span>
          </div>
        )}

        {/* Restaurant Grid */}
        {!isLoading && filteredRestaurants.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-6">
              <Filter className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Nenhum restaurante encontrado
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Tente ajustar seus filtros de busca para encontrar mais opções
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * Math.min(index, 6) }}
              >
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Footer with CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/20">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-10 h-10 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Dica de Especialista
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Reserve restaurantes populares como Victoria & Albert's, Space 220 e Cinderella's Royal Table com 60+ dias de antecedência. 
                Para Disney Springs e CityWalk, reserve pelo menos 2 semanas antes da sua visita.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default RestaurantsGuide;