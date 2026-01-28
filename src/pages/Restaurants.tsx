import { useState, useMemo } from 'react';
import { Search, MapPin, Star, UtensilsCrossed, Filter, Award } from 'lucide-react';
import { restaurantsData, type Restaurant } from '@/data/restaurantsFullData';
import { RestaurantCard } from '@/components/restaurants/RestaurantCard';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEO } from '@/components/SEO';

const Restaurants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPark, setSelectedPark] = useState<string>('all');
  const [showMichelinOnly, setShowMichelinOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string>('all');

  const disneyRestaurants = restaurantsData.filter(r => r.category === 'disney');
  const universalRestaurants = restaurantsData.filter(r => r.category === 'universal');
  const outsideRestaurants = restaurantsData.filter(r => r.category === 'fora-parques');

  const disneyParks = [...new Set(disneyRestaurants.map(r => r.park).filter(Boolean))] as string[];
  const universalParks = [...new Set(universalRestaurants.map(r => r.park).filter(Boolean))] as string[];
  const subcategories = [...new Set(outsideRestaurants.map(r => r.subcategory).filter(Boolean))] as string[];

  const filteredRestaurants = useMemo(() => {
    let filtered = restaurantsData;
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') filtered = filtered.filter(r => r.category === selectedCategory);
    if (selectedPark !== 'all') filtered = filtered.filter(r => r.park === selectedPark || r.subcategory === selectedPark);
    if (showMichelinOnly) filtered = filtered.filter(r => r.michelin);
    if (priceFilter !== 'all') filtered = filtered.filter(r => r.priceRange === priceFilter);
    return filtered;
  }, [searchTerm, selectedCategory, selectedPark, showMichelinOnly, priceFilter]);

  const organizedRestaurants = useMemo(() => {
    const organized: Record<string, Restaurant[]> = {};
    const parks = selectedCategory === 'disney' ? disneyParks : selectedCategory === 'universal' ? universalParks : selectedCategory === 'fora-parques' ? subcategories : [...disneyParks, ...universalParks, ...subcategories];
    parks.forEach(park => {
      const parkRestaurants = filteredRestaurants.filter(r => r.park === park || r.subcategory === park);
      if (parkRestaurants.length > 0) organized[park] = parkRestaurants;
    });
    return organized;
  }, [filteredRestaurants, selectedCategory, disneyParks, universalParks, subcategories]);

  const parksForFilter = selectedCategory === 'disney' ? disneyParks : selectedCategory === 'universal' ? universalParks : selectedCategory === 'fora-parques' ? subcategories : [];

  return (
    <AppLayout>
      <SEO title="Restaurantes Orlando" description="Guia completo com 100+ restaurantes em Orlando" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Guia de Restaurantes</h1>
            <p className="text-muted-foreground">{restaurantsData.length} restaurantes • {restaurantsData.filter(r => r.michelin).length} com Michelin</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 border space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar restaurantes..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedPark('all'); }}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="disney">🏰 Disney</SelectItem>
                <SelectItem value="universal">🎬 Universal</SelectItem>
                <SelectItem value="fora-parques">🍽️ Fora dos Parques</SelectItem>
              </SelectContent>
            </Select>

            {parksForFilter.length > 0 && (
              <Select value={selectedPark} onValueChange={setSelectedPark}>
                <SelectTrigger><SelectValue placeholder="Local" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {parksForFilter.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger><SelectValue placeholder="Preço" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os preços</SelectItem>
                <SelectItem value="$">$ Econômico</SelectItem>
                <SelectItem value="$$">$$ Moderado</SelectItem>
                <SelectItem value="$$$">$$$ Alto</SelectItem>
                <SelectItem value="$$$$">$$$$ Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="michelin" checked={showMichelinOnly} onCheckedChange={setShowMichelinOnly} />
            <Label htmlFor="michelin" className="flex items-center gap-1 cursor-pointer">
              <Award className="w-4 h-4 text-yellow-500" /> Apenas Michelin
            </Label>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{filteredRestaurants.length}</span> restaurantes encontrados
          </div>
        </div>

        {/* Results */}
        {Object.keys(organizedRestaurants).length === 0 ? (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhum restaurante encontrado</p>
          </div>
        ) : (
          Object.entries(organizedRestaurants).map(([section, restaurants]) => (
            <div key={section} className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">{section}</h2>
                <Badge variant="secondary">{restaurants.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
};

export default Restaurants;
