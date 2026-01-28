import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  FileVideo, 
  FileText, 
  Image as ImageIcon,
  CheckSquare,
  BookOpen,
  Smartphone,
  Loader2,
  ExternalLink,
  GripVertical,
  MapPin,
  Filter,
  X
} from 'lucide-react';

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
  sort_order: number;
  created_at: string;
  category_id: string | null;
  attraction_name: string | null;
  attraction_description: string | null;
  min_height: string | null;
  thrill_level: number | null;
  pass_type: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Park category names for showing attraction fields
const PARK_CATEGORY_NAMES = [
  'Magic Kingdom',
  'EPCOT',
  'Hollywood Studios',
  'Animal Kingdom',
  'Universal Studios',
  'Islands of Adventure',
  'Epic Universe',
  'Volcano Bay',
  'SeaWorld',
  'Busch Gardens',
  'Aquatica',
  'Discovery Cove',
  'LEGOLAND',
  'Typhoon Lagoon',
  'Blizzard Beach',
];

const CONTENT_TYPES = [
  { value: 'video', label: 'Vídeo', icon: FileVideo },
  { value: 'poi', label: 'POI', icon: MapPin },
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'image', label: 'Imagem', icon: ImageIcon },
  { value: 'checklist', label: 'Checklist', icon: CheckSquare },
  { value: 'tutorial', label: 'Tutorial', icon: Smartphone },
  { value: 'guide', label: 'Guia', icon: BookOpen },
  { value: 'other', label: 'Outro', icon: FileText },
];

const COLOR_OPTIONS = [
  { value: 'gradient-primary', label: 'Azul' },
  { value: 'gradient-magic', label: 'Roxo' },
  { value: 'gradient-gold', label: 'Dourado' },
];

export function ContentManager() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    file_url: '',
    thumbnail_url: '',
    color: 'gradient-primary',
    is_published: false,
    category_id: '',
    attraction_name: '',
    attraction_description: '',
    min_height: '',
    thrill_level: 0,
    pass_type: '',
    latitude: '',
    longitude: '',
  });

  // Check if selected category is a park
  const isParkCategory = () => {
    const selectedCategory = categories.find(c => c.id === formData.category_id);
    return selectedCategory ? PARK_CATEGORY_NAMES.includes(selectedCategory.name) : false;
  };

  // Filter contents
  const filteredContents = contents.filter(content => {
    const matchesCategory = filterCategory === 'all' || content.category_id === filterCategory;
    const matchesType = filterType === 'all' || content.type === filterType;
    return matchesCategory && matchesType;
  });

  const hasActiveFilters = filterCategory !== 'all' || filterType !== 'all';

  const clearFilters = () => {
    setFilterCategory('all');
    setFilterType('all');
  };

  useEffect(() => {
    fetchContents();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('content_categories')
      .select('id, name, icon, color')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchContents = async () => {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar conteúdos');
      console.error(error);
    } else {
      setContents(data || []);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'file_url' | 'thumbnail_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${field === 'thumbnail_url' ? 'thumbnails' : 'files'}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('admin-content')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Erro ao fazer upload do arquivo');
      console.error(uploadError);
      setIsUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(filePath);

    setFormData(prev => ({ ...prev, [field]: urlData.publicUrl }));
    setIsUploading(false);
    toast.success('Arquivo enviado com sucesso!');
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description || null,
      type: formData.type,
      file_url: formData.file_url || null,
      thumbnail_url: formData.thumbnail_url || null,
      color: formData.color,
      is_published: formData.is_published,
      category_id: formData.category_id || null,
      sort_order: editingContent ? editingContent.sort_order : contents.length,
      attraction_name: formData.attraction_name || null,
      attraction_description: formData.attraction_description || null,
      min_height: formData.min_height || null,
      thrill_level: formData.thrill_level > 0 ? formData.thrill_level : null,
      pass_type: formData.pass_type || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };

    if (editingContent) {
      const { error } = await supabase
        .from('content_items')
        .update(payload)
        .eq('id', editingContent.id);

      if (error) {
        toast.error('Erro ao atualizar conteúdo');
        console.error(error);
        return;
      }
      toast.success('Conteúdo atualizado!');
    } else {
      const { error } = await supabase
        .from('content_items')
        .insert(payload);

      if (error) {
        toast.error('Erro ao criar conteúdo');
        console.error(error);
        return;
      }
      toast.success('Conteúdo criado!');
    }

    setIsDialogOpen(false);
    resetForm();
    fetchContents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return;

    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir conteúdo');
      console.error(error);
      return;
    }

    toast.success('Conteúdo excluído!');
    fetchContents();
  };

  const handleEdit = (content: ContentItem) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description || '',
      type: content.type,
      file_url: content.file_url || '',
      thumbnail_url: content.thumbnail_url || '',
      color: content.color,
      is_published: content.is_published,
      category_id: content.category_id || '',
      attraction_name: content.attraction_name || '',
      attraction_description: content.attraction_description || '',
      min_height: content.min_height || '',
      thrill_level: content.thrill_level || 0,
      pass_type: content.pass_type || '',
      latitude: content.latitude?.toString() || '',
      longitude: content.longitude?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleTogglePublish = async (content: ContentItem) => {
    const { error } = await supabase
      .from('content_items')
      .update({ is_published: !content.is_published })
      .eq('id', content.id);

    if (error) {
      toast.error('Erro ao atualizar status');
      return;
    }

    fetchContents();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'video',
      file_url: '',
      thumbnail_url: '',
      color: 'gradient-primary',
      is_published: false,
      category_id: '',
      attraction_name: '',
      attraction_description: '',
      min_height: '',
      thrill_level: 0,
      pass_type: '',
      latitude: '',
      longitude: '',
    });
    setEditingContent(null);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = CONTENT_TYPES.find(t => t.value === type);
    return typeConfig?.icon || FileText;
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = CONTENT_TYPES.find(t => t.value === type);
    return typeConfig?.label || type;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileVideo className="h-5 w-5" />
          Gerenciar Conteúdos
        </CardTitle>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filtros:</span>
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Parque/Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Parques</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {CONTENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}

          <div className="ml-auto text-sm text-muted-foreground">
            {filteredContents.length} de {contents.length} itens
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileVideo className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{contents.length === 0 ? 'Nenhum conteúdo cadastrado ainda.' : 'Nenhum conteúdo encontrado com os filtros atuais.'}</p>
            {contents.length === 0 && (
              <Button variant="outline" className="mt-4" onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro conteúdo
              </Button>
            )}
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Arquivo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContents.map((content) => {
                const TypeIcon = getTypeIcon(content.type);
                return (
                  <TableRow key={content.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${content.color} rounded-lg flex items-center justify-center text-primary-foreground`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{content.title}</p>
                          {content.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {content.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {content.category_id ? (
                        <Badge variant="outline">
                          {categories.find(c => c.id === content.category_id)?.name || 'Categoria'}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getTypeLabel(content.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={content.is_published}
                        onCheckedChange={() => handleTogglePublish(content)}
                      />
                    </TableCell>
                    <TableCell>
                      {content.file_url ? (
                        <a 
                          href={content.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver arquivo
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(content)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(content.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Guia de Preparação"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o conteúdo..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.value}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category_id || "none"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value === "none" ? "" : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Attraction Technical Sheet - Only shown for park categories */}
            {isParkCategory() && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                  🎢 Ficha Técnica da Atração
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_height">Altura Mínima</Label>
                    <Input
                      id="min_height"
                      value={formData.min_height}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_height: e.target.value }))}
                      placeholder="Ex: 102 cm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Passe</Label>
                    <Select
                      value={formData.pass_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, pass_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single Pass">Single Pass</SelectItem>
                        <SelectItem value="Multi Pass (Grupo 1)">Multi Pass (Grupo 1)</SelectItem>
                        <SelectItem value="Multi Pass (Grupo 2)">Multi Pass (Grupo 2)</SelectItem>
                        <SelectItem value="Multi Pass">Multi Pass</SelectItem>
                        <SelectItem value="Standby (Fila Comum)">Standby (Fila Comum)</SelectItem>
                        <SelectItem value="Standby (Trilha)">Standby (Trilha)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nível de Radicalidade</Label>
                  <Select
                    value={formData.thrill_level.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, thrill_level: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Não definido</SelectItem>
                      <SelectItem value="1">1 - Muito Leve</SelectItem>
                      <SelectItem value="2">2 - Leve</SelectItem>
                      <SelectItem value="3">3 - Moderado</SelectItem>
                      <SelectItem value="4">4 - Intenso</SelectItem>
                      <SelectItem value="5">5 - Extremo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <Label className="flex items-center gap-2">
                    📍 Coordenadas GPS (para o mapa)
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                        placeholder="Ex: 28.4177"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="longitude" className="text-xs text-muted-foreground">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                        placeholder="Ex: -81.5812"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Dica: Busque no Google Maps, clique com botão direito na atração e copie as coordenadas.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Arquivo Principal</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.file_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                  placeholder="URL do arquivo ou faça upload"
                  className="flex-1"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'file_url')}
                    accept="video/*,application/pdf,image/*"
                  />
                  <Button type="button" variant="outline" size="icon" disabled={isUploading} asChild>
                    <span>
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Thumbnail (opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  placeholder="URL da thumbnail"
                  className="flex-1"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'thumbnail_url')}
                    accept="image/*"
                  />
                  <Button type="button" variant="outline" size="icon" disabled={isUploading} asChild>
                    <span>
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                    </span>
                  </Button>
                </label>
              </div>
              {formData.thumbnail_url && (
                <img 
                  src={formData.thumbnail_url} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-lg mt-2"
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="published">Publicar imediatamente</Label>
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading}>
              {editingContent ? 'Salvar Alterações' : 'Criar Conteúdo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
