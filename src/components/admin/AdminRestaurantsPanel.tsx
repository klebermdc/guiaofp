import { useState } from 'react';
import { Upload, Trash2, Plus, Save, Search, Image as ImageIcon } from 'lucide-react';
import { restaurantsData, type Restaurant } from '@/data/restaurantsData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const AdminRestaurantsPanel = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Filtrar restaurantes baseado na busca
  const filteredRestaurants = restaurantsData.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSaveImages = () => {
    if (selectedRestaurant && newImages.length > 0) {
      // Aqui você salvaria as imagens no Supabase
      toast.success(`${newImages.length} imagem(ns) adicionada(s) para ${selectedRestaurant.name}!`);
      setNewImages([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Restaurantes</h2>
          <p className="text-muted-foreground">Adicione e gerencie fotos dos restaurantes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Restaurantes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Restaurantes ({restaurantsData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar restaurante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Lista */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 pr-4">
                {filteredRestaurants.map(restaurant => (
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
                    <div className="text-sm text-muted-foreground flex items-center">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      {restaurant.images.length} foto(s)
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Painel de Edição */}
        <div className="lg:col-span-2">
          {selectedRestaurant ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedRestaurant.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedRestaurant.address}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fotos Atuais */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Fotos Atuais ({selectedRestaurant.images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedRestaurant.images.map((image, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-video rounded-xl overflow-hidden border-2 border-border"
                      >
                        <img
                          src={image}
                          alt={`${selectedRestaurant.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adicionar Novas Fotos */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Adicionar Novas Fotos
                  </h3>

                  {/* Input de URL */}
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

                  {/* Upload de Arquivo */}
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
                          toast.info(`${files.length} arquivo(s) selecionado(s). Funcionalidade de upload será implementada.`);
                        }}
                      />
                    </label>
                  </div>

                  {/* Preview de Novas Imagens */}
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

                  {/* Botão Salvar */}
                  {newImages.length > 0 && (
                    <Button
                      onClick={handleSaveImages}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      size="lg"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Salvar {newImages.length} Nova(s) Foto(s)
                    </Button>
                  )}
                </div>

                {/* Instruções */}
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
