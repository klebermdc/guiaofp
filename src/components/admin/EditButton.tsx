import { useState, memo } from 'react';
import { Pencil, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
}

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
    title: content?.title || fallback?.title || '',
    subtitle: content?.subtitle || fallback?.subtitle || '',
    description: content?.description || fallback?.description || '',
    button_text: content?.button_text || fallback?.buttonText || '',
    badge_text: content?.badge_text || fallback?.badgeText || '',
    image_url: content?.image_url || '',
  });

  // Update form when content loads
  useState(() => {
    if (content) {
      setFormData({
        title: content.title || fallback?.title || '',
        subtitle: content.subtitle || fallback?.subtitle || '',
        description: content.description || fallback?.description || '',
        button_text: content.button_text || fallback?.buttonText || '',
        badge_text: content.badge_text || fallback?.badgeText || '',
        image_url: content.image_url || '',
      });
    }
  });

  const handleOpen = () => {
    // Refresh form data when opening
    setFormData({
      title: content?.title || fallback?.title || '',
      subtitle: content?.subtitle || fallback?.subtitle || '',
      description: content?.description || fallback?.description || '',
      button_text: content?.button_text || fallback?.buttonText || '',
      badge_text: content?.badge_text || fallback?.badgeText || '',
      image_url: content?.image_url || '',
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Editar Conteúdo
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {pageKey} / {sectionKey}
            </p>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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
          </div>

          <div className="flex justify-end gap-2">
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
