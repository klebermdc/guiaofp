import { Search, MapPin, Star, Trash2, Loader2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Restaurant } from '@/hooks/useRestaurants';

interface Props {
  restaurants: Restaurant[];
  filteredRestaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  searchTerm: string;
  isLoading: boolean;
  isDeleting: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (restaurant: Restaurant) => void;
  onDelete: (restaurantId: string) => void;
}

export function RestaurantList({
  restaurants,
  filteredRestaurants,
  selectedRestaurant,
  searchTerm,
  isLoading,
  isDeleting,
  onSearchChange,
  onSelect,
  onDelete,
}: Props) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          Restaurantes ({restaurants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar restaurante..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-2 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum restaurante encontrado
              </p>
            ) : (
              filteredRestaurants.map(restaurant => (
                <div
                  key={restaurant.id}
                  onClick={() => onSelect(restaurant)}
                  className={`relative group p-4 rounded-xl transition-all cursor-pointer ${
                    selectedRestaurant?.id === restaurant.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                  }`}
                >
                  <div className="pr-8">
                    <div className="font-semibold text-foreground mb-1">
                      {restaurant.name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {restaurant.category || 'Sem categoria'}
                      {restaurant.latitude && restaurant.longitude && (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <MapPin className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    {restaurant.michelin && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 inline mt-1" />
                    )}
                  </div>

                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Excluir Restaurante
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir <strong>{restaurant.name}</strong>?
                            <br /><br />
                            Esta ação é irreversível e irá remover:
                            <ul className="list-disc list-inside mt-2 text-sm">
                              <li>Todas as informações do restaurante</li>
                              <li>Todas as fotos associadas</li>
                              <li>Itens do cardápio</li>
                              <li>Marcador no mapa</li>
                            </ul>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => onDelete(restaurant.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Excluindo...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir Permanentemente
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
