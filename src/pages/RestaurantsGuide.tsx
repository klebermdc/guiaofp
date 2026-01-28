import { useState, useMemo } from 'react';
import { Search, MapPin, Star, UtensilsCrossed, Filter, Loader2 } from 'lucide-react';
import { useRestaurants, type Restaurant } from '@/hooks/useRestaurants';
import { restaurantsData as staticRestaurantsData, type Restaurant as StaticRestaurant } from '@/data/restaurantsData';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SEO } from '@/components/SEO';

// Converter dados do Supabase para o formato esperado pelo RestaurantCard
const convertToCardFormat = (restaurant: Restaurant): StaticRestaurant => ({
  id: restaurant.id,
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
  const [showMichelinOnly, setShowMichelinOnly] = useState(false);
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

  // Lista fixa de parques Disney (não usar áreas internas)
  const disneyParks = [
    'Magic Kingdom',
    'EPCOT', 
    'Hollywood Studios',
    'Animal Kingdom',
    'Disney Springs',
    'Typhoon Lagoon',
    'Blizzard Beach'
  ];

  // Lista fixa de parques Universal
  const universalParks = [
    'Universal Studios Florida',
    'Islands of Adventure',
    'Epic Universe',
    'Volcano Bay',
    'CityWalk'
  ];

  // Regiões de Orlando para restaurantes fora dos parques
  const orlandoRegions = [
    'International Drive',
    'Kissimmee',
    'Lake Buena Vista',
    'Downtown Orlando',
    'Winter Park',
    'Dr. Phillips',
    'Sand Lake Road',
    'Celebration'
  ];

  // Get unique subcategories (tipos de culinária)
  const subcategories = [...new Set(outsideRestaurants.map(r => r.subcategory).filter(Boolean))];

  // Filter restaurants
  const filteredRestaurants = useMemo(() => {
    let filtered = restaurantsData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Park filter - usa o campo park que vem do location do Supabase
    if (selectedPark !== 'all') {
      filtered = filtered.filter(r => r.park === selectedPark);
    }

    // Region filter (para fora dos parques)
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(r => 
        r.address?.toLowerCase().includes(selectedRegion.toLowerCase()) ||
        r.park === selectedRegion
      );
    }

    // Subcategory filter
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(r => r.subcategory === selectedSubcategory);
    }

    // Michelin filter
    if (showMichelinOnly) {
      filtered = filtered.filter(r => r.michelin);
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(r => r.priceRange === priceFilter);
    }

    return filtered;
  }, [restaurantsData, searchTerm, selectedCategory, selectedPark, selectedRegion, selectedSubcategory, showMichelinOnly, priceFilter]);

  // Organize filtered restaurants
  const organizedRestaurants = useMemo(() => {
    const organized: Record<string, StaticRestaurant[]> = {};

    if (selectedCategory === 'disney' || selectedCategory === 'all') {
      disneyParks.forEach(park => {
        const parkRestaurants = filteredRestaurants.filter(
          r => r.category === 'disney' && r.park === park
        );
        if (parkRestaurants.length > 0) {
          organized[park as string] = parkRestaurants;
        }
      });
    }

    if (selectedCategory === 'universal' || selectedCategory === 'all') {
      universalParks.forEach(park => {
        const parkRestaurants = filteredRestaurants.filter(
          r => r.category === 'universal' && r.park === park
        );
        if (parkRestaurants.length > 0) {
          organized[park as string] = parkRestaurants;
        }
      });
    }

    if (selectedCategory === 'fora-parques' || selectedCategory === 'all') {
      subcategories.forEach(subcat => {
        const subcatRestaurants = filteredRestaurants.filter(
          r => r.category === 'fora-parques' && r.subcategory === subcat
        );
        if (subcatRestaurants.length > 0) {
          organized[subcat as string] = subcatRestaurants;
        }
      });
    }

    return organized;
  }, [filteredRestaurants, selectedCategory, disneyParks, universalParks, subcategories]);

  return (
    <AppLayout>
      <SEO 
        title="Guia de Restaurantes Orlando | 100+ Restaurantes Disney, Universal e Orlando"
        description="Descubra os melhores restaurantes de Orlando. Guia completo com 100+ opções nos parques Disney, Universal e fora dos parques."
      />
      
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-12 px-6 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 rounded-b-3xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-12 h-12 mr-3" />
              <h1 className="text-4xl font-bold">Guia de Restaurantes</h1>
            </div>
            <p className="text-xl text-orange-100 mb-2">
              Descubra os melhores restaurantes de Orlando
            </p>
            <p className="text-orange-200">
              {restaurantsData.length} restaurantes •{' '}
              {restaurantsData.filter(r => r.michelin).length} com Estrela Michelin
            </p>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-card rounded-2xl shadow-lg p-6 border">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Buscar restaurantes, culinária, localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedPark('all');
                  setSelectedRegion('all');
                  setSelectedSubcategory('all');
                }}
                className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-primary focus:outline-none"
              >
                <option value="all">Todas</option>
                <option value="disney">🏰 Disney</option>
                <option value="universal">🎬 Universal</option>
                <option value="fora-parques">🍽️ Fora dos Parques</option>
              </select>
            </div>

            {/* Park (Disney) - mostrado quando Disney selecionado */}
            {selectedCategory === 'disney' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Parque Disney
                </label>
                <select
                  value={selectedPark}
                  onChange={(e) => setSelectedPark(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-primary focus:outline-none"
                >
                  <option value="all">Todos os Parques</option>
                  {disneyParks.map(park => (
                    <option key={park} value={park}>{park}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Park (Universal) - mostrado quando Universal selecionado */}
            {selectedCategory === 'universal' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Parque Universal
                </label>
                <select
                  value={selectedPark}
                  onChange={(e) => setSelectedPark(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-primary focus:outline-none"
                >
                  <option value="all">Todos os Parques</option>
                  {universalParks.map(park => (
                    <option key={park} value={park}>{park}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Região Orlando (Fora dos Parques) - mostrado quando fora-parques selecionado */}
            {selectedCategory === 'fora-parques' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Região de Orlando
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-primary focus:outline-none"
                >
                  <option value="all">Todas as Regiões</option>
                  {orlandoRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Cuisine Type (Outside Parks) - apenas quando fora-parques */}
            {selectedCategory === 'fora-parques' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Tipo de Culinária
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-primary focus:outline-none"
                >
                  <option value="all">Todos</option>
                  {subcategories.map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Faixa de Preço
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-primary focus:outline-none"
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
          <div className="mt-4 text-center text-muted-foreground">
            <span className="font-semibold text-orange-600">{filteredRestaurants.length}</span> restaurante(s) encontrado(s)
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Carregando restaurantes...</span>
          </div>
        )}

        {/* Organized Restaurant List */}
        {!isLoading && Object.keys(organizedRestaurants).length === 0 ? (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
              Nenhum restaurante encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar seus filtros de busca
            </p>
          </div>
        ) : (
          Object.entries(organizedRestaurants).map(([section, restaurants]) => (
            <div key={section} className="mb-8">
              <div className="flex items-center mb-6">
                <MapPin className="w-6 h-6 text-orange-600 mr-2" />
                <h2 className="text-2xl font-bold text-foreground">{section}</h2>
                <Badge variant="secondary" className="ml-4">
                  {restaurants.length} restaurante(s)
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map(restaurant => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </div>
          ))
        )}

        {/* Footer with Statistics */}
        <div className="bg-card rounded-2xl p-8 border mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {restaurantsData.length}
              </div>
              <div className="text-muted-foreground text-sm">Total de Restaurantes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {disneyRestaurants.length}
              </div>
              <div className="text-muted-foreground text-sm">Restaurantes Disney</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {universalRestaurants.length}
              </div>
              <div className="text-muted-foreground text-sm">Restaurantes Universal</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {restaurantsData.filter(r => r.michelin).length}
              </div>
              <div className="text-muted-foreground text-sm">Com Estrela Michelin</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RestaurantsGuide;
