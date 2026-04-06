import { Upload, Trash2, Plus, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RestaurantImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface Props {
  restaurantName: string;
  currentImages: RestaurantImage[];
  newImages: string[];
  newImageUrl: string;
  isLoadingImages: boolean;
  isUploading: boolean;
  isSaving: boolean;
  isDeletingImage: boolean;
  onNewImageUrlChange: (url: string) => void;
  onAddImage: () => void;
  onRemoveNewImage: (index: number) => void;
  onSaveImages: () => void;
  onDeleteImage: (imageId: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RestaurantPhotosTab({
  restaurantName,
  currentImages,
  newImages,
  newImageUrl,
  isLoadingImages,
  isUploading,
  isSaving,
  isDeletingImage,
  onNewImageUrlChange,
  onAddImage,
  onRemoveNewImage,
  onSaveImages,
  onDeleteImage,
  onFileUpload,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Current Photos */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">
          Fotos Atuais ({currentImages.length})
        </h3>
        {isLoadingImages ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : currentImages.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhuma foto cadastrada</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentImages.map((image) => (
              <div
                key={image.id}
                className="relative group aspect-video rounded-xl overflow-hidden border-2 border-border"
              >
                <img
                  src={image.image_url}
                  alt={restaurantName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => onDeleteImage(image.id)}
                    disabled={isDeletingImage}
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
        <h3 className="text-lg font-bold text-foreground mb-4">Adicionar Novas Fotos</h3>

        {/* URL Input */}
        <div className="flex gap-2 mb-4">
          <Input
            type="url"
            placeholder="Cole a URL da imagem..."
            value={newImageUrl}
            onChange={(e) => onNewImageUrlChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onAddImage()}
            className="flex-1"
          />
          <Button onClick={onAddImage} disabled={!newImageUrl.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
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
              onChange={onFileUpload}
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
                      onClick={() => onRemoveNewImage(idx)}
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

        {newImages.length > 0 && (
          <Button
            onClick={onSaveImages}
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
    </div>
  );
}
