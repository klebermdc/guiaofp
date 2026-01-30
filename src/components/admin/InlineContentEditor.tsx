import { useState, useEffect, memo } from 'react';
import { Pencil, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useEditableContent, EditableContent } from '@/hooks/useEditableContent';
import { cn } from '@/lib/utils';

interface InlineContentEditorProps {
  pageKey: string;
  sectionKey: string;
  children: React.ReactNode;
  className?: string;
  // Fallback values when no DB content exists
  fallback?: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    badgeText?: string;
  };
  // Callback to get current values from the rendered content
  onContentReady?: (content: EditableContent | null) => void;
}

interface EditFormData {
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  badge_text: string;
  image_url: string;
}

const InlineContentEditorComponent = ({
  pageKey,
  sectionKey,
  children,
  className,
  fallback,
  onContentReady,
}: InlineContentEditorProps) => {
  const { content, canEdit, saveContent, isSaving } = useEditableContent(pageKey, sectionKey);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    title: '',
    subtitle: '',
    description: '',
    button_text: '',
    badge_text: '',
    image_url: '',
  });

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || fallback?.title || '',
        subtitle: content.subtitle || fallback?.subtitle || '',
        description: content.description || fallback?.description || '',
        button_text: content.button_text || fallback?.buttonText || '',
        badge_text: content.badge_text || fallback?.badgeText || '',
        image_url: content.image_url || '',
      });
    } else if (fallback) {
      setFormData({
        title: fallback.title || '',
        subtitle: fallback.subtitle || '',
        description: fallback.description || '',
        button_text: fallback.buttonText || '',
        badge_text: fallback.badgeText || '',
        image_url: '',
      });
    }
    onContentReady?.(content);
  }, [content, fallback, onContentReady]);

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
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original content
    if (content) {
      setFormData({
        title: content.title || '',
        subtitle: content.subtitle || '',
        description: content.description || '',
        button_text: content.button_text || '',
        badge_text: content.badge_text || '',
        image_url: content.image_url || '',
      });
    }
    setIsEditing(false);
  };

  if (!canEdit) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative group', className)}>
      {/* Edit Button - visible on hover for admins */}
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-110 transform transition-transform"
          title="Editar conteúdo"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {/* Edit Mode Overlay */}
      {isEditing && (
        <div className="absolute inset-0 z-40 bg-background/95 backdrop-blur-sm rounded-xl border-2 border-primary p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              Editar: {pageKey} / {sectionKey}
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Salvar
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Título principal"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Subtítulo ou destaque"
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
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Original Content */}
      {children}
    </div>
  );
};

export const InlineContentEditor = memo(InlineContentEditorComponent);
