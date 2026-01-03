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
  Folder,
  Loader2,
  FolderOpen,
  Star,
  Map,
  Camera,
  Utensils,
  Hotel,
  Plane,
  ShoppingBag,
  Ticket,
  Heart,
  Info
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const ICON_OPTIONS = [
  { value: 'folder', label: 'Pasta', icon: Folder },
  { value: 'star', label: 'Estrela', icon: Star },
  { value: 'map', label: 'Mapa', icon: Map },
  { value: 'camera', label: 'Câmera', icon: Camera },
  { value: 'utensils', label: 'Alimentação', icon: Utensils },
  { value: 'hotel', label: 'Hospedagem', icon: Hotel },
  { value: 'plane', label: 'Viagem', icon: Plane },
  { value: 'shopping-bag', label: 'Compras', icon: ShoppingBag },
  { value: 'ticket', label: 'Ingressos', icon: Ticket },
  { value: 'heart', label: 'Favoritos', icon: Heart },
  { value: 'info', label: 'Informações', icon: Info },
];

const COLOR_OPTIONS = [
  { value: 'gradient-primary', label: 'Azul' },
  { value: 'gradient-magic', label: 'Roxo' },
  { value: 'gradient-gold', label: 'Dourado' },
  { value: 'bg-emerald-500', label: 'Verde' },
  { value: 'bg-rose-500', label: 'Rosa' },
  { value: 'bg-orange-500', label: 'Laranja' },
];

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'folder',
    color: 'gradient-primary',
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('content_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar categorias');
      console.error(error);
    } else {
      setCategories(data || []);
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || null,
      icon: formData.icon,
      color: formData.color,
      is_active: formData.is_active,
      sort_order: editingCategory ? editingCategory.sort_order : categories.length,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('content_categories')
        .update(payload)
        .eq('id', editingCategory.id);

      if (error) {
        toast.error('Erro ao atualizar categoria');
        console.error(error);
        return;
      }
      toast.success('Categoria atualizada!');
    } else {
      const { error } = await supabase
        .from('content_categories')
        .insert(payload);

      if (error) {
        toast.error('Erro ao criar categoria');
        console.error(error);
        return;
      }
      toast.success('Categoria criada!');
    }

    setIsDialogOpen(false);
    resetForm();
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Os conteúdos associados ficarão sem categoria.')) return;

    const { error } = await supabase
      .from('content_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir categoria');
      console.error(error);
      return;
    }

    toast.success('Categoria excluída!');
    fetchCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (category: Category) => {
    const { error } = await supabase
      .from('content_categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id);

    if (error) {
      toast.error('Erro ao atualizar status');
      return;
    }

    fetchCategories();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'folder',
      color: 'gradient-primary',
      is_active: true,
    });
    setEditingCategory(null);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find(i => i.value === iconName);
    return iconOption?.icon || Folder;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Gerenciar Categorias
        </CardTitle>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma categoria cadastrada ainda.</p>
            <Button variant="outline" className="mt-4" onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar primeira categoria
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-primary-foreground`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {category.description || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={() => handleToggleActive(category)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Guias de Parques"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva a categoria..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center gap-2">
                          <icon.icon className="h-4 w-4" />
                          {icon.label}
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

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Categoria ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingCategory ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
