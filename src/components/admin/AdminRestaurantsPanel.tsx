import { useState, useCallback } from 'react';
import { Plus, Star, Image as ImageIcon, Edit2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useRestaurants,
  useRestaurantImages,
  useAddRestaurantImage,
  useDeleteRestaurantImage,
  useUpdateRestaurant,
  useDeleteRestaurant,
  useCreateRestaurant,
  type Restaurant,
} from '@/hooks/useRestaurants';
import { RestaurantList } from './RestaurantList';
import { RestaurantDetailsTab } from './RestaurantDetailsTab';
import { RestaurantLocationTab } from './RestaurantLocationTab';
import { RestaurantPhotosTab } from './RestaurantPhotosTab';
import { CreateRestaurantDialog } from './CreateRestaurantDialog';

const AdminRestaurantsPanel = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editForm, setEditForm] = useState<Partial<Restaurant>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState('');

  const { data: restaurants = [], isLoading: loadingRestaurants } = useRestaurants();
  const { data: currentImages = [], isLoading: loadingImages } = useRestaurantImages(
    selectedRestaurant?.id || null
  );

  const addImageMutation = useAddRestaurantImage();
  const deleteImageMutation = useDeleteRestaurantImage();
  const updateRestaurantMutation = useUpdateRestaurant();
  const deleteRestaurantMutation = useDeleteRestaurant();
  const createRestaurantMutation = useCreateRestaurant();

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setEditForm({
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      phone: restaurant.phone,
      website: restaurant.website,
      menu_url: restaurant.menu_url,
      category: restaurant.category,
      subcategory: restaurant.subcategory,
      location: restaurant.location,
      area: restaurant.area,
      price_range: restaurant.price_range,
      cuisine: restaurant.cuisine,
      tips: restaurant.tips,
      must_try: restaurant.must_try,
      highlights: restaurant.highlights,
      reservation_required: restaurant.reservation_required,
      character_dining: restaurant.character_dining,
      michelin: restaurant.michelin,
      featured: restaurant.featured,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    });
    setNewImages([]);
    setIsEditing(false);
  };

  const handleFormChange = (updates: Partial<Restaurant>) => {
    setEditForm(prev => ({ ...prev, ...updates }));
  };

  const handleHighlightsChange = (value: string) => {
    setEditForm(prev => ({
      ...prev,
      highlights: value.split(',').map(h => h.trim()).filter(Boolean),
    }));
  };

  const handleSaveDetails = async () => {
    if (!selectedRestaurant) return;
    await updateRestaurantMutation.mutateAsync({ id: selectedRestaurant.id, updates: editForm });
    setSelectedRestaurant({ ...selectedRestaurant, ...editForm } as Restaurant);
    setIsEditing(false);
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    await deleteRestaurantMutation.mutateAsync(restaurantId);
    setSelectedRestaurant(null);
    setIsEditing(false);
  };

  const handleCreateRestaurant = async () => {
    if (!newRestaurantName.trim()) return;
    const slug = newRestaurantName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    await createRestaurantMutation.mutateAsync({ name: newRestaurantName.trim(), slug });
    setNewRestaurantName('');
    setIsCreateDialogOpen(false);
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedRestaurant) return;
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${selectedRestaurant.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('admin-content')
          .upload(fileName, file, { contentType: file.type, upsert: false });
        if (uploadError) {
          toast.error(`Erro ao enviar ${file.name}: ${uploadError.message}`);
          continue;
        }
        const { data: publicUrlData } = supabase.storage.from('admin-content').getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) uploadedUrls.push(publicUrlData.publicUrl);
      }
      if (uploadedUrls.length > 0) {
        const maxOrder = currentImages.length > 0
          ? Math.max(...currentImages.map(img => img.display_order)) + 1
          : 0;
        for (let i = 0; i < uploadedUrls.length; i++) {
          await addImageMutation.mutateAsync({
            restaurantId: selectedRestaurant.id,
            imageUrl: uploadedUrls[i],
            displayOrder: maxOrder + i,
          });
        }
        toast.success(`${uploadedUrls.length} foto(s) enviada(s) com sucesso!`);
      }
    } catch (err) {
      console.error('File upload error:', err);
      toast.error('Erro ao fazer upload das fotos');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }, [selectedRestaurant, currentImages, addImageMutation]);

  const handleAddImage = () => {
    if (newImageUrl.trim() && selectedRestaurant) {
      setNewImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
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

  const isSaving = addImageMutation.isPending || updateRestaurantMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gerenciar Restaurantes</h2>
            <p className="text-muted-foreground">Edite informações, fotos e coordenadas do mapa</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Restaurante
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RestaurantList
          restaurants={restaurants}
          filteredRestaurants={filteredRestaurants}
          selectedRestaurant={selectedRestaurant}
          searchTerm={searchTerm}
          isLoading={loadingRestaurants}
          isDeleting={deleteRestaurantMutation.isPending}
          onSearchChange={setSearchTerm}
          onSelect={handleSelectRestaurant}
          onDelete={handleDeleteRestaurant}
        />

        <div className="lg:col-span-2">
          {selectedRestaurant ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedRestaurant.name}
                    {selectedRestaurant.michelin && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedRestaurant.address || 'Endereço não informado'}
                  </p>
                </div>
                <Button
                  variant={isEditing ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <><X className="w-4 h-4 mr-2" />Cancelar</>
                  ) : (
                    <><Edit2 className="w-4 h-4 mr-2" />Editar</>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Informações</TabsTrigger>
                    <TabsTrigger value="location">Localização</TabsTrigger>
                    <TabsTrigger value="photos">Fotos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <RestaurantDetailsTab
                      restaurant={selectedRestaurant}
                      editForm={editForm}
                      isEditing={isEditing}
                      isSaving={isSaving}
                      onFormChange={handleFormChange}
                      onHighlightsChange={handleHighlightsChange}
                      onSave={handleSaveDetails}
                    />
                  </TabsContent>
                  <TabsContent value="location">
                    <RestaurantLocationTab
                      editForm={editForm}
                      isSaving={isSaving}
                      onFormChange={handleFormChange}
                      onSave={handleSaveDetails}
                    />
                  </TabsContent>
                  <TabsContent value="photos">
                    <RestaurantPhotosTab
                      restaurantName={selectedRestaurant.name}
                      currentImages={currentImages}
                      newImages={newImages}
                      newImageUrl={newImageUrl}
                      isLoadingImages={loadingImages}
                      isUploading={isUploading}
                      isSaving={isSaving}
                      isDeletingImage={deleteImageMutation.isPending}
                      onNewImageUrlChange={setNewImageUrl}
                      onAddImage={handleAddImage}
                      onRemoveNewImage={(idx) => setNewImages(prev => prev.filter((_, i) => i !== idx))}
                      onSaveImages={handleSaveImages}
                      onDeleteImage={(imageId) => deleteImageMutation.mutate({ imageId, restaurantId: selectedRestaurant.id })}
                      onFileUpload={handleFileUpload}
                    />
                  </TabsContent>
                </Tabs>
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
                  Escolha um restaurante da lista à esquerda para editar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CreateRestaurantDialog
        open={isCreateDialogOpen}
        name={newRestaurantName}
        isCreating={createRestaurantMutation.isPending}
        onOpenChange={setIsCreateDialogOpen}
        onNameChange={setNewRestaurantName}
        onCreate={handleCreateRestaurant}
      />
    </div>
  );
};

export default AdminRestaurantsPanel;
