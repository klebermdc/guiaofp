import { Phone, Globe, DollarSign, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Restaurant } from '@/hooks/useRestaurants';

interface Props {
  restaurant: Restaurant;
  editForm: Partial<Restaurant>;
  isEditing: boolean;
  isSaving: boolean;
  onFormChange: (updates: Partial<Restaurant>) => void;
  onHighlightsChange: (value: string) => void;
  onSave: () => void;
}

export function RestaurantDetailsTab({
  restaurant,
  editForm,
  isEditing,
  isSaving,
  onFormChange,
  onHighlightsChange,
  onSave,
}: Props) {
  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Descrição</h4>
          <p className="text-foreground">{restaurant.description || 'Sem descrição'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">Telefone</span>
            </div>
            <p className="text-foreground font-medium">{restaurant.phone || 'Não informado'}</p>
          </div>
          <div className="p-4 bg-muted rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">Website</span>
            </div>
            {restaurant.website ? (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium truncate block"
              >
                {restaurant.website}
              </a>
            ) : (
              <p className="text-foreground font-medium">Não informado</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted rounded-lg text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold text-foreground">{restaurant.price_range || '$$'}</p>
            <p className="text-xs text-muted-foreground">Preço</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-lg font-bold text-foreground">{restaurant.cuisine || '-'}</p>
            <p className="text-xs text-muted-foreground">Culinária</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-lg font-bold text-foreground">{restaurant.reservation_required ? 'Sim' : 'Não'}</p>
            <p className="text-xs text-muted-foreground">Reserva</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-lg font-bold text-foreground">{restaurant.character_dining ? 'Sim' : 'Não'}</p>
            <p className="text-xs text-muted-foreground">Personagens</p>
          </div>
        </div>

        {restaurant.highlights && restaurant.highlights.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Destaques</h4>
            <div className="flex flex-wrap gap-2">
              {restaurant.highlights.map((h, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {restaurant.tips && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
            <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">💡 Dicas</h4>
            <p className="text-amber-800 dark:text-amber-300 text-sm">{restaurant.tips}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={editForm.name || ''}
            onChange={(e) => onFormChange({ name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <select
            id="category"
            value={editForm.category || ''}
            onChange={(e) => onFormChange({ category: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-background"
          >
            <option value="">Selecione</option>
            <option value="disney">Disney</option>
            <option value="universal">Universal</option>
            <option value="fora-parques">Fora dos Parques</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={editForm.description || ''}
          onChange={(e) => onFormChange({ description: e.target.value })}
          rows={4}
          placeholder="Descreva o restaurante..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              value={editForm.phone || ''}
              onChange={(e) => onFormChange({ phone: e.target.value })}
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
              onChange={(e) => onFormChange({ website: e.target.value })}
              className="pl-10"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Parque/Local</Label>
          <Input
            id="location"
            value={editForm.location || ''}
            onChange={(e) => onFormChange({ location: e.target.value })}
            placeholder="Ex: Magic Kingdom"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Área</Label>
          <Input
            id="area"
            value={editForm.area || ''}
            onChange={(e) => onFormChange({ area: e.target.value })}
            placeholder="Ex: Fantasyland"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategoria</Label>
          <Input
            id="subcategory"
            value={editForm.subcategory || ''}
            onChange={(e) => onFormChange({ subcategory: e.target.value })}
            placeholder="Ex: Churrascaria"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price_range">Faixa de Preço</Label>
          <select
            id="price_range"
            value={editForm.price_range || ''}
            onChange={(e) => onFormChange({ price_range: e.target.value })}
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
            onChange={(e) => onFormChange({ cuisine: e.target.value })}
            placeholder="Ex: Italiana, Brasileira..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="menu_url">Link do Menu</Label>
          <Input
            id="menu_url"
            value={editForm.menu_url || ''}
            onChange={(e) => onFormChange({ menu_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="must_try">Prato Imperdível</Label>
          <Input
            id="must_try"
            value={editForm.must_try || ''}
            onChange={(e) => onFormChange({ must_try: e.target.value })}
            placeholder="Ex: Picanha na brasa"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tips">Dicas</Label>
        <Textarea
          id="tips"
          value={editForm.tips || ''}
          onChange={(e) => onFormChange({ tips: e.target.value })}
          rows={3}
          placeholder="Dicas para os visitantes..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="highlights">Destaques (separados por vírgula)</Label>
        <Input
          id="highlights"
          value={(editForm.highlights || []).join(', ')}
          onChange={(e) => onHighlightsChange(e.target.value)}
          placeholder="Ex: Vista incrível, Jantar romântico, Personagens"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="reservation_required"
            checked={editForm.reservation_required || false}
            onCheckedChange={(checked) => onFormChange({ reservation_required: checked })}
          />
          <Label htmlFor="reservation_required" className="text-sm">Reserva Obrigatória</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="character_dining"
            checked={editForm.character_dining || false}
            onCheckedChange={(checked) => onFormChange({ character_dining: checked })}
          />
          <Label htmlFor="character_dining" className="text-sm">Com Personagens</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="michelin"
            checked={editForm.michelin || false}
            onCheckedChange={(checked) => onFormChange({ michelin: checked })}
          />
          <Label htmlFor="michelin" className="text-sm">Estrela Michelin</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={editForm.featured || false}
            onCheckedChange={(checked) => onFormChange({ featured: checked })}
          />
          <Label htmlFor="featured" className="text-sm">Destaque</Label>
        </div>
      </div>

      <Button onClick={onSave} className="w-full" size="lg" disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Save className="w-5 h-5 mr-2" />
        )}
        Salvar Alterações
      </Button>
    </div>
  );
}
