import { useState, useCallback } from 'react';
import { Upload, Trash2, Plus, Save, Search, Image as ImageIcon, Loader2, Phone, Globe, MapPin, DollarSign, Star, Edit2, X, AlertTriangle, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { 
  useRestaurants, 
  useRestaurantImages, 
  useAddRestaurantImage, 
  useDeleteRestaurantImage,
  useUpdateRestaurant,
  useDeleteRestaurant,
  useCreateRestaurant,
  type Restaurant 
} from '@/hooks/useRestaurants';

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

  // Queries
  const { data: restaurants = [], isLoading: loadingRestaurants } = useRestaurants();
  const { data: currentImages = [], isLoading: loadingImages } = useRestaurantImages(
    selectedRestaurant?.id || null
  );

  // Mutations
  const addImageMutation = useAddRestaurantImage();
  const deleteImageMutation = useDeleteRestaurantImage();
  const updateRestaurantMutation = useUpdateRestaurant();
  const deleteRestaurantMutation = useDeleteRestaurant();
  const createRestaurantMutation = useCreateRestaurant();

  // Filter restaurants based on search
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
          console.error('Upload error:', uploadError);
          toast.error(`Erro ao enviar ${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('admin-content')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl);
        }
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
      // Reset input
      e.target.value = '';
    }
  }, [selectedRestaurant, currentImages, addImageMutation]);

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

  const handleSaveDetails = async () => {
    if (!selectedRestaurant) return;

    await updateRestaurantMutation.mutateAsync({
      id: selectedRestaurant.id,
      updates: editForm,
    });

    setSelectedRestaurant({ ...selectedRestaurant, ...editForm } as Restaurant);
    setIsEditing(false);
  };

  const handleHighlightsChange = (value: string) => {
    const highlightsArray = value.split(',').map(h => h.trim()).filter(Boolean);
    setEditForm({ ...editForm, highlights: highlightsArray });
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

    await createRestaurantMutation.mutateAsync({
      name: newRestaurantName.trim(),
      slug,
    });

    setNewRestaurantName('');
    setIsCreateDialogOpen(false);
  };

  const isSaving = addImageMutation.isPending || updateRestaurantMutation.isPending;
  const isDeleting = deleteRestaurantMutation.isPending;
  const isCreating = createRestaurantMutation.isPending;

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
            <ScrollArea className="h-[600px]">
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
                    <div
                      key={restaurant.id}
                      onClick={() => handleSelectRestaurant(restaurant)}
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
                      
                      {/* Delete Button */}
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
                                onClick={() => handleDeleteRestaurant(restaurant.id)}
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

        {/* Edit Panel */}
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
                  variant={isEditing ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </>
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

                  {/* Details Tab */}
                  <TabsContent value="details" className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                              id="name"
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <select
                              id="category"
                              value={editForm.category || ''}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg bg-background"
                            >
                              <option value="">Selecione</option>
                              <option value="disney">Disney</option>
                              <option value="universal">Universal</option>
                              <option value="fora-parques">Fora dos Parques</option>
                            </select>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea
                            id="description"
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={4}
                            placeholder="Descreva o restaurante..."
                          />
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="phone"
                                value={editForm.phone || ''}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="pl-10"
                                placeholder="(xxx) xxx-xxxx"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="website"
                                value={editForm.website || ''}
                                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                className="pl-10"
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Location Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="location">Parque/Local</Label>
                            <Input
                              id="location"
                              value={editForm.location || ''}
                              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                              placeholder="Ex: Magic Kingdom"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="area">Área</Label>
                            <Input
                              id="area"
                              value={editForm.area || ''}
                              onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                              placeholder="Ex: Fantasyland"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subcategory">Subcategoria</Label>
                            <Input
                              id="subcategory"
                              value={editForm.subcategory || ''}
                              onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
                              placeholder="Ex: Churrascaria"
                            />
                          </div>
                        </div>

                        {/* Price & Cuisine */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price_range">Faixa de Preço</Label>
                            <select
                              id="price_range"
                              value={editForm.price_range || ''}
                              onChange={(e) => setEditForm({ ...editForm, price_range: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg bg-background"
                            >
                              <option value="">Selecione</option>
                              <option value="$">$ - Econômico</option>
                              <option value="$$">$$ - Moderado</option>
                              <option value="$$$">$$$ - Alto</option>
                              <option value="$$$$">$$$$ - Premium</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cuisine">Tipo de Culinária</Label>
                            <Input
                              id="cuisine"
                              value={editForm.cuisine || ''}
                              onChange={(e) => setEditForm({ ...editForm, cuisine: e.target.value })}
                              placeholder="Ex: Italiana, Brasileira..."
                            />
                          </div>
                        </div>

                        {/* Menu & Tips */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="menu_url">Link do Menu</Label>
                            <Input
                              id="menu_url"
                              value={editForm.menu_url || ''}
                              onChange={(e) => setEditForm({ ...editForm, menu_url: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="must_try">Prato Imperdível</Label>
                            <Input
                              id="must_try"
                              value={editForm.must_try || ''}
                              onChange={(e) => setEditForm({ ...editForm, must_try: e.target.value })}
                              placeholder="Ex: Picanha na brasa"
                            />
                          </div>
                        </div>

                        {/* Tips */}
                        <div className="space-y-2">
                          <Label htmlFor="tips">Dicas</Label>
                          <Textarea
                            id="tips"
                            value={editForm.tips || ''}
                            onChange={(e) => setEditForm({ ...editForm, tips: e.target.value })}
                            rows={3}
                            placeholder="Dicas para os visitantes..."
                          />
                        </div>

                        {/* Highlights */}
                        <div className="space-y-2">
                          <Label htmlFor="highlights">Destaques (separados por vírgula)</Label>
                          <Input
                            id="highlights"
                            value={(editForm.highlights || []).join(', ')}
                            onChange={(e) => handleHighlightsChange(e.target.value)}
                            placeholder="Ex: Vista incrível, Jantar romântico, Personagens"
                          />
                        </div>

                        {/* Toggles */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="reservation_required"
                              checked={editForm.reservation_required || false}
                              onCheckedChange={(checked) => setEditForm({ ...editForm, reservation_required: checked })}
                            />
                            <Label htmlFor="reservation_required" className="text-sm">Reserva Obrigatória</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="character_dining"
                              checked={editForm.character_dining || false}
                              onCheckedChange={(checked) => setEditForm({ ...editForm, character_dining: checked })}
                            />
                            <Label htmlFor="character_dining" className="text-sm">Com Personagens</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="michelin"
                              checked={editForm.michelin || false}
                              onCheckedChange={(checked) => setEditForm({ ...editForm, michelin: checked })}
                            />
                            <Label htmlFor="michelin" className="text-sm">Estrela Michelin</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="featured"
                              checked={editForm.featured || false}
                              onCheckedChange={(checked) => setEditForm({ ...editForm, featured: checked })}
                            />
                            <Label htmlFor="featured" className="text-sm">Destaque</Label>
                          </div>
                        </div>

                        {/* Save Button */}
                        <Button
                          onClick={handleSaveDetails}
                          className="w-full"
                          size="lg"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-5 h-5 mr-2" />
                          )}
                          Salvar Alterações
                        </Button>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="space-y-6">
                        {/* Description */}
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Descrição</h4>
                          <p className="text-foreground">
                            {selectedRestaurant.description || 'Sem descrição'}
                          </p>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-muted rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-semibold text-muted-foreground">Telefone</span>
                            </div>
                            <p className="text-foreground font-medium">
                              {selectedRestaurant.phone || 'Não informado'}
                            </p>
                          </div>
                          <div className="p-4 bg-muted rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-semibold text-muted-foreground">Website</span>
                            </div>
                            {selectedRestaurant.website ? (
                              <a
                                href={selectedRestaurant.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium truncate block"
                              >
                                {selectedRestaurant.website}
                              </a>
                            ) : (
                              <p className="text-foreground font-medium">Não informado</p>
                            )}
                          </div>
                        </div>

                        {/* More Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-muted rounded-lg text-center">
                            <DollarSign className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-lg font-bold text-foreground">{selectedRestaurant.price_range || '$$'}</p>
                            <p className="text-xs text-muted-foreground">Preço</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-lg font-bold text-foreground">{selectedRestaurant.cuisine || '-'}</p>
                            <p className="text-xs text-muted-foreground">Culinária</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-lg font-bold text-foreground">{selectedRestaurant.reservation_required ? 'Sim' : 'Não'}</p>
                            <p className="text-xs text-muted-foreground">Reserva</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-lg font-bold text-foreground">{selectedRestaurant.character_dining ? 'Sim' : 'Não'}</p>
                            <p className="text-xs text-muted-foreground">Personagens</p>
                          </div>
                        </div>

                        {/* Highlights */}
                        {selectedRestaurant.highlights && selectedRestaurant.highlights.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Destaques</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedRestaurant.highlights.map((h, i) => (
                                <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tips */}
                        {selectedRestaurant.tips && (
                          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                            <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">💡 Dicas</h4>
                            <p className="text-amber-800 dark:text-amber-300 text-sm">{selectedRestaurant.tips}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* Location Tab */}
                  <TabsContent value="location" className="space-y-6">
                    <div className="p-4 bg-muted/50 rounded-xl border border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <Navigation className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Coordenadas do Mapa</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Defina as coordenadas para que o restaurante apareça no mapa interativo.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="0.000001"
                            value={editForm.latitude ?? ''}
                            onChange={(e) => setEditForm({ 
                              ...editForm, 
                              latitude: e.target.value ? parseFloat(e.target.value) : null 
                            })}
                            placeholder="Ex: 28.418889"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="0.000001"
                            value={editForm.longitude ?? ''}
                            onChange={(e) => setEditForm({ 
                              ...editForm, 
                              longitude: e.target.value ? parseFloat(e.target.value) : null 
                            })}
                            placeholder="Ex: -81.581389"
                          />
                        </div>
                      </div>

                      {/* Address for reference */}
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="address">Endereço Completo</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Textarea
                            id="address"
                            value={editForm.address || ''}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            className="pl-10"
                            rows={2}
                            placeholder="Endereço completo..."
                          />
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="mt-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                        style={{
                          backgroundColor: (editForm.latitude && editForm.longitude) 
                            ? 'hsl(var(--success) / 0.1)' 
                            : 'hsl(var(--destructive) / 0.1)',
                          color: (editForm.latitude && editForm.longitude) 
                            ? 'hsl(142 76% 36%)' 
                            : 'hsl(var(--destructive))'
                        }}
                      >
                        <MapPin className="w-4 h-4" />
                        {editForm.latitude && editForm.longitude ? (
                          <span>✓ Coordenadas configuradas - aparece no mapa</span>
                        ) : (
                          <span>⚠ Sem coordenadas - não aparece no mapa</span>
                        )}
                      </div>

                      {/* Save coordinates */}
                      <Button
                        onClick={handleSaveDetails}
                        className="w-full mt-4"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Salvar Localização
                      </Button>
                    </div>

                    {/* Google Maps Helper */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Como obter coordenadas</h4>
                      <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                        <li>Abra o Google Maps e pesquise o restaurante</li>
                        <li>Clique com o botão direito no local exato</li>
                        <li>Copie as coordenadas que aparecem (ex: 28.418889, -81.581389)</li>
                        <li>Cole a primeira número em Latitude e o segundo em Longitude</li>
                      </ol>
                    </div>
                  </TabsContent>

                  {/* Photos Tab */}
                  <TabsContent value="photos" className="space-y-6">
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
                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploading ? (
                              <>
                                <Loader2 className="w-10 h-10 text-primary mb-2 animate-spin" />
                                <p className="text-sm text-muted-foreground font-semibold">Enviando fotos...</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP</p>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploading}
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

      {/* Create Restaurant Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Restaurante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-restaurant-name">Nome do Restaurante</Label>
              <Input
                id="new-restaurant-name"
                value={newRestaurantName}
                onChange={(e) => setNewRestaurantName(e.target.value)}
                placeholder="Ex: Cinderella's Royal Table"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRestaurant()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateRestaurant} 
              disabled={!newRestaurantName.trim() || isCreating}
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Criar Restaurante
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRestaurantsPanel;
