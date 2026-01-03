import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Play, CheckSquare, Smartphone, Wifi, Sparkles, FileText, Image as ImageIcon, FileVideo, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  icon: string;
  color: string;
  is_published: boolean;
}

const ICON_MAP: Record<string, any> = {
  video: Play,
  pdf: FileText,
  image: ImageIcon,
  checklist: CheckSquare,
  tutorial: Smartphone,
  guide: BookOpen,
  other: FileText,
};

const TYPE_LABELS: Record<string, string> = {
  video: 'Vídeo',
  pdf: 'PDF',
  image: 'Imagem',
  checklist: 'Checklist',
  tutorial: 'Tutorial',
  guide: 'Guia',
  other: 'Arquivo',
};

const Content = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setContents(data);
    }
    setIsLoading(false);
  };

  const handleOpenContent = (content: ContentItem) => {
    if (content.file_url) {
      // For videos, open in dialog
      if (content.type === 'video') {
        setSelectedContent(content);
        setIsDialogOpen(true);
      } else {
        // For other files, open in new tab
        window.open(content.file_url, '_blank');
      }
    } else {
      setSelectedContent(content);
      setIsDialogOpen(true);
    }
  };

  const getIcon = (type: string) => {
    return ICON_MAP[type] || FileText;
  };

  const isVideoUrl = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || 
           url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl gradient-gold p-8 text-secondary-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Exclusivo para membros</span>
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">
              📚 Preparação para sua Viagem
            </h1>
            <p className="text-secondary-foreground/80">
              Conteúdos exclusivos para tornar sua experiência ainda mais mágica
            </p>
          </div>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : contents.length === 0 ? (
          <Card className="text-center p-8 border-dashed border-2">
            <Sparkles className="w-12 h-12 mx-auto text-accent mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Conteúdos em breve!
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Estamos preparando materiais exclusivos para tornar sua viagem ainda mais especial.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contents.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleOpenContent(item)}
                >
                  {item.thumbnail_url && (
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={item.thumbnail_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                            <Play className="h-8 w-8 text-primary ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {!item.thumbnail_url && (
                        <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-primary-foreground flex-shrink-0`}>
                          <Icon size={24} />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                            {TYPE_LABELS[item.type] || item.type}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {item.description}
                          </p>
                        )}
                        <Button variant="outline" size="sm">
                          Acessar conteúdo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Coming Soon */}
        {contents.length > 0 && (
          <Card className="text-center p-8 border-dashed border-2">
            <Sparkles className="w-12 h-12 mx-auto text-accent mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Mais conteúdos em breve!
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Estamos sempre preparando novos materiais exclusivos para tornar sua viagem ainda mais especial.
            </p>
          </Card>
        )}
      </div>

      {/* Content Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              {selectedContent.description && (
                <p className="text-muted-foreground">{selectedContent.description}</p>
              )}
              
              {selectedContent.file_url && selectedContent.type === 'video' && (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  {selectedContent.file_url.includes('youtube') || selectedContent.file_url.includes('youtu.be') ? (
                    <iframe
                      src={getYoutubeEmbedUrl(selectedContent.file_url)}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video 
                      src={selectedContent.file_url} 
                      controls 
                      className="w-full h-full"
                    />
                  )}
                </div>
              )}

              {selectedContent.file_url && selectedContent.type === 'image' && (
                <img 
                  src={selectedContent.file_url} 
                  alt={selectedContent.title}
                  className="w-full rounded-lg"
                />
              )}

              {selectedContent.file_url && !['video', 'image'].includes(selectedContent.type) && (
                <Button asChild>
                  <a href={selectedContent.file_url} target="_blank" rel="noopener noreferrer">
                    Baixar arquivo
                  </a>
                </Button>
              )}

              {!selectedContent.file_url && (
                <p className="text-center text-muted-foreground py-8">
                  Este conteúdo ainda não possui um arquivo associado.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Content;
