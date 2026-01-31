import { useState, memo, useEffect } from 'react';
import { Pencil, X, Check, Loader2, Palette, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/color-picker';
import { useEditableContent } from '@/hooks/useEditableContent';
import { cn } from '@/lib/utils';

interface EditButtonProps {
  pageKey: string;
  sectionKey: string;
  className?: string;
  /** Force show the button (bypass role check) */
  forceShow?: boolean;
  // Fallback values when no DB content exists
  fallback?: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    badgeText?: string;
  };
}

interface EditFormData {
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  badge_text: string;
  image_url: string;
  text_color: string;
  bg_color: string;
  border_color: string;
  accent_color: string;
  font_size: string;
  font_weight: string;
  custom_classes: string;
}

const fontSizeOptions = [
  { value: '', label: 'Padrão' },
  { value: 'text-xs', label: 'Extra Pequeno' },
  { value: 'text-sm', label: 'Pequeno' },
  { value: 'text-base', label: 'Normal' },
  { value: 'text-lg', label: 'Grande' },
  { value: 'text-xl', label: 'Extra Grande' },
  { value: 'text-2xl', label: '2XL' },
  { value: 'text-3xl', label: '3XL' },
  { value: 'text-4xl', label: '4XL' },
];

const fontWeightOptions = [
  { value: '', label: 'Padrão' },
  { value: 'font-light', label: 'Light' },
  { value: 'font-normal', label: 'Normal' },
  { value: 'font-medium', label: 'Medium' },
  { value: 'font-semibold', label: 'Semibold' },
  { value: 'font-bold', label: 'Bold' },
  { value: 'font-extrabold', label: 'Extra Bold' },
];

const EditButtonComponent = ({
  pageKey,
  sectionKey,
  className,
  fallback,
  forceShow,
}: EditButtonProps) => {
  const { content, canEdit, saveContent, isSaving } = useEditableContent(pageKey, sectionKey);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    title: '',
    subtitle: '',
    description: '',
    button_text: '',
    badge_text: '',
    image_url: '',
    text_color: '',
    bg_color: '',
    border_color: '',
    accent_color: '',
    font_size: '',
    font_weight: '',
    custom_classes: '',
  });

  // Update form when content loads
  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || fallback?.title || '',
        subtitle: content.subtitle || fallback?.subtitle || '',
        description: content.description || fallback?.description || '',
        button_text: content.button_text || fallback?.buttonText || '',
        badge_text: content.badge_text || fallback?.badgeText || '',
        image_url: content.image_url || '',
        text_color: content.text_color || '',
        bg_color: content.bg_color || '',
        border_color: content.border_color || '',
        accent_color: content.accent_color || '',
        font_size: content.font_size || '',
        font_weight: content.font_weight || '',
        custom_classes: content.custom_classes || '',
      });
    }
  }, [content, fallback]);

  const handleOpen = () => {
    // Refresh form data when opening
    setFormData({
      title: content?.title || fallback?.title || '',
      subtitle: content?.subtitle || fallback?.subtitle || '',
      description: content?.description || fallback?.description || '',
      button_text: content?.button_text || fallback?.buttonText || '',
      badge_text: content?.badge_text || fallback?.badgeText || '',
      image_url: content?.image_url || '',
      text_color: content?.text_color || '',
      bg_color: content?.bg_color || '',
      border_color: content?.border_color || '',
      accent_color: content?.accent_color || '',
      font_size: content?.font_size || '',
      font_weight: content?.font_weight || '',
      custom_classes: content?.custom_classes || '',
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    const success = await saveContent({
      title: formData.title || null,
      subtitle: formData.subtitle || null,
      description: formData.description || null,
      button_text: formData.button_text || null,
      badge_text: formData.badge_text || null,
      image_url: formData.image_url || null,
      text_color: formData.text_color || null,
      bg_color: formData.bg_color || null,
      border_color: formData.border_color || null,
      accent_color: formData.accent_color || null,
      font_size: formData.font_size || null,
      font_weight: formData.font_weight || null,
      custom_classes: formData.custom_classes || null,
    });

    if (success) {
      setIsOpen(false);
    }
  };

  const showButton = forceShow || canEdit;

  if (!showButton) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className={cn(
          'z-50 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-110 transform transition-all opacity-70 hover:opacity-100',
          className
        )}
        title={`Editar: ${pageKey}/${sectionKey}`}
      >
        <Pencil className="w-4 h-4" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Editar Conteúdo
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {pageKey} / {sectionKey}
            </p>
          </DialogHeader>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="content" className="gap-2">
                <Type className="w-4 h-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="styles" className="gap-2">
                <Palette className="w-4 h-4" />
                Estilos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div>
                <Label htmlFor="title">Título Principal</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Título principal"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtítulo / Destaque</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Subtítulo ou texto de destaque"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição ou texto de apoio"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="badge_text">Badge/Tag</Label>
                  <Input
                    id="badge_text"
                    value={formData.badge_text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge_text: e.target.value }))}
                    placeholder="Texto da badge"
                  />
                </div>

                <div>
                  <Label htmlFor="button_text">Texto do Botão</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Texto do botão"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </TabsContent>

            <TabsContent value="styles" className="space-y-4">
              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker
                  label="Cor do Texto"
                  value={formData.text_color}
                  onChange={(value) => setFormData((prev) => ({ ...prev, text_color: value }))}
                />
                <ColorPicker
                  label="Cor de Fundo"
                  value={formData.bg_color}
                  onChange={(value) => setFormData((prev) => ({ ...prev, bg_color: value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ColorPicker
                  label="Cor da Borda"
                  value={formData.border_color}
                  onChange={(value) => setFormData((prev) => ({ ...prev, border_color: value }))}
                />
                <ColorPicker
                  label="Cor de Destaque"
                  value={formData.accent_color}
                  onChange={(value) => setFormData((prev) => ({ ...prev, accent_color: value }))}
                />
              </div>

              {/* Typography */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tamanho da Fonte</Label>
                  <Select
                    value={formData.font_size}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, font_size: value === 'default' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizeOptions.map((opt) => (
                        <SelectItem key={opt.value || 'default'} value={opt.value || 'default'}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Peso da Fonte</Label>
                  <Select
                    value={formData.font_weight}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, font_weight: value === 'default' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar peso" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontWeightOptions.map((opt) => (
                        <SelectItem key={opt.value || 'default'} value={opt.value || 'default'}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Classes */}
              <div>
                <Label htmlFor="custom_classes">Classes Tailwind Customizadas</Label>
                <Input
                  id="custom_classes"
                  value={formData.custom_classes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, custom_classes: e.target.value }))}
                  placeholder="Ex: rounded-xl shadow-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione classes Tailwind extras separadas por espaço
                </p>
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 rounded-lg border border-border">
                <Label className="mb-2 block">Prévia</Label>
                <div
                  className={cn('p-4 rounded-lg transition-all', formData.custom_classes)}
                  style={{
                    color: formData.text_color ? `hsl(${formData.text_color})` : undefined,
                    backgroundColor: formData.bg_color ? `hsl(${formData.bg_color})` : undefined,
                    borderColor: formData.border_color ? `hsl(${formData.border_color})` : undefined,
                    borderWidth: formData.border_color ? '2px' : undefined,
                    borderStyle: formData.border_color ? 'solid' : undefined,
                  }}
                >
                  <span className={cn(formData.font_size, formData.font_weight)}>
                    {formData.title || 'Texto de exemplo'}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const EditButton = memo(EditButtonComponent);
