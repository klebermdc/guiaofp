import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Brain, Save, Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface KnowledgeSection {
  id: string;
  section_key: string;
  section_title: string;
  content: string;
  is_active: boolean;
  sort_order: number;
}

export const AIKnowledgeBaseManager = () => {
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<KnowledgeSection | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSection, setNewSection] = useState({ section_key: '', section_title: '', content: '' });

  const { data: sections, isLoading } = useQuery({
    queryKey: ['ai-knowledge-base'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_knowledge_base')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as KnowledgeSection[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (section: Partial<KnowledgeSection> & { id: string }) => {
      const { error } = await supabase
        .from('ai_knowledge_base')
        .update({
          section_title: section.section_title,
          content: section.content,
          is_active: section.is_active,
        })
        .eq('id', section.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-knowledge-base'] });
      toast.success('Seção atualizada com sucesso!');
      setEditingSection(null);
    },
    onError: () => toast.error('Erro ao atualizar seção'),
  });

  const createMutation = useMutation({
    mutationFn: async (section: { section_key: string; section_title: string; content: string }) => {
      const maxOrder = sections?.reduce((max, s) => Math.max(max, s.sort_order), 0) || 0;
      const { error } = await supabase
        .from('ai_knowledge_base')
        .insert({ ...section, sort_order: maxOrder + 1 });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-knowledge-base'] });
      toast.success('Seção criada com sucesso!');
      setIsAddDialogOpen(false);
      setNewSection({ section_key: '', section_title: '', content: '' });
    },
    onError: () => toast.error('Erro ao criar seção'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_knowledge_base')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-knowledge-base'] });
      toast.success('Seção removida!');
    },
    onError: () => toast.error('Erro ao remover seção'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Base de Conhecimento da IA</h2>
            <p className="text-sm text-muted-foreground">
              Edite o conhecimento que a Joy usa para responder os clientes
            </p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Seção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Seção</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chave (identificador único)</Label>
                  <Input
                    value={newSection.section_key}
                    onChange={(e) => setNewSection({ ...newSection, section_key: e.target.value })}
                    placeholder="ex: dicas_alimentacao"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título da Seção</Label>
                  <Input
                    value={newSection.section_title}
                    onChange={(e) => setNewSection({ ...newSection, section_title: e.target.value })}
                    placeholder="ex: Dicas de Alimentação"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <Textarea
                  value={newSection.content}
                  onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                  placeholder="Digite todo o conhecimento que a IA deve usar sobre este tema..."
                  className="min-h-[300px]"
                />
              </div>
              <Button
                onClick={() => createMutation.mutate(newSection)}
                disabled={!newSection.section_key || !newSection.section_title || !newSection.content || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Criar Seção
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sections?.map((section) => (
          <Card key={section.id} className={!section.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <div>
                    <CardTitle className="text-lg">{section.section_title}</CardTitle>
                    <CardDescription className="font-mono text-xs">{section.section_key}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={section.is_active}
                      onCheckedChange={(checked) => updateMutation.mutate({ id: section.id, ...section, is_active: checked })}
                    />
                    <Label className="text-sm">{section.is_active ? 'Ativo' : 'Inativo'}</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja remover esta seção?')) {
                        deleteMutation.mutate(section.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingSection?.id === section.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={editingSection.section_title}
                      onChange={(e) => setEditingSection({ ...editingSection, section_title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conteúdo</Label>
                    <Textarea
                      value={editingSection.content}
                      onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateMutation.mutate(editingSection)}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => setEditingSection(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{section.content}</p>
                  <Button variant="outline" size="sm" onClick={() => setEditingSection(section)}>
                    Editar Conteúdo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
