import { useState } from 'react';
import { Upload, Trash2, Plus, Save, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  useRestaurants, 
  useRestaurantImages, 
  useAddRestaurantImage, 
  useDeleteRestaurantImage,
  type Restaurant 
} from '@/hooks/useRestaurants';

const AdminRestaurantsPanel = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Queries
  const { data: restaurants = [], isLoading: loadingRestaurants } = useRestaurants();
  const { data: currentImages = [], isLoading: loadingImages } = useRestaurantImages(
    selectedRestaurant?.id || null
  );

  // Mutations
  const addImageMutation = useAddRestaurantImage();
  const deleteImageMutation = useDeleteRestaurantImage();

  // Filter restaurants based on search
  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleAddImage = () => {
    if (newImageUrl.trim() && selectedRestaurant) {
      setNewImages([...newImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleSaveImages = async () => {
    if (!selectedRestaurant || newImages.length === 0) return;

    const maxOrder = currentImages.length > 0 
      ? Math.max(...currentImages.map(img => img.display_order)) + 1 
      : 0;

    for (let i = 0; i < newImages.length; i++) {
      await addImageMutation.mutateAsync({
        restaurantId: selectedRestaurant.id,
        imageUrl: newImages[i],
        displayOrder: maxOrder + i,
      });
    }

    setNewImages([]);
  };

  const handleDeleteImage = (imageId: string) => {
    if (!selectedRestaurant) return;
    
    deleteImageMutation.mutate({
      imageId,
      restaurantId: selectedRestaurant.id,
    });
  };

  const isSaving = addImageMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Restaurantes</h2>
          <p className="text-muted-foreground">Adicione e gerencie fotos dos restaurantes no banco de dados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Restaurant List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Restaurantes ({restaurants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar restaurante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* List */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 pr-4">
                {loadingRestaurants ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredRestaurants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum restaurante encontrado
                  </p>
                ) : (
                  filteredRestaurants.map(restaurant => (
                    <button
                      key={restaurant.id}
                      onClick={() => {
                        setSelectedRestaurant(restaurant);
                        setNewImages([]);
                      }}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        selectedRestaurant?.id === restaurant.id
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-semibold text-foreground mb-1">
                        {restaurant.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {restaurant.category || 'Sem categoria'}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Edit Panel */}
        <div className="lg:col-span-2">
          {selectedRestaurant ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedRestaurant.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedRestaurant.address || 'Endereço não informado'}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Photos */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Fotos Atuais ({currentImages.length})
                  </h3>
                  {loadingImages ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : currentImages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma foto cadastrada
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {currentImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative group aspect-video rounded-xl overflow-hidden border-2 border-border"
                        >
                          <img
                            src={image.image_url}
                            alt={`${selectedRestaurant.name}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                            <Button
                              size="icon"
                              variant="destructive"
                              className="opacity-0 group-hover:opacity-100 transition-all"
                              onClick={() => handleDeleteImage(image.id)}
                              disabled={deleteImageMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Photos */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Adicionar Novas Fotos
                  </h3>

                  {/* URL Input */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      type="url"
                      placeholder="Cole a URL da imagem..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddImage}
                      disabled={!newImageUrl.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>

                  {/* File Upload */}
                  <div className="mb-6">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          // TODO: Implement file upload to Supabase Storage
                          console.log('Files selected:', files.length);
                        }}
                      />
                    </label>
                  </div>

                  {/* New Images Preview */}
                  {newImages.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-foreground mb-3">
                        Novas Fotos ({newImages.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {newImages.map((image, idx) => (
                          <div
                            key={idx}
                            className="relative group aspect-video rounded-xl overflow-hidden border-2 border-primary/50"
                          >
                            <img
                              src={image}
                              alt={`Nova ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                              <Button
                                size="icon"
                                variant="destructive"
                                className="opacity-0 group-hover:opacity-100 transition-all"
                                onClick={() => handleRemoveNewImage(idx)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Novo
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  {newImages.length > 0 && (
                    <Button
                      onClick={handleSaveImages}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      size="lg"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5 mr-2" />
                      )}
                      Salvar {newImages.length} Nova(s) Foto(s)
                    </Button>
                  )}
                </div>

                {/* Tips */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Dicas:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Use imagens de alta qualidade (mínimo 800x600px)</li>
                    <li>• Formatos recomendados: JPG, PNG ou WEBP</li>
                    <li>• Tire fotos dos pratos, ambiente e fachada</li>
                    <li>• Evite fotos com marca d'água</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center">
                <ImageIcon className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
                  Selecione um Restaurante
                </h3>
                <p className="text-muted-foreground">
                  Escolha um restaurante da lista à esquerda para gerenciar suas fotos
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurantsPanel;
