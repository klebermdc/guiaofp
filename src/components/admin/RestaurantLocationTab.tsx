import { Navigation, MapPin, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Restaurant } from '@/hooks/useRestaurants';

interface Props {
  editForm: Partial<Restaurant>;
  isSaving: boolean;
  onFormChange: (updates: Partial<Restaurant>) => void;
  onSave: () => void;
}

export function RestaurantLocationTab({ editForm, isSaving, onFormChange, onSave }: Props) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/50 rounded-xl border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Coordenadas do Mapa</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Defina as coordenadas para que o restaurante apareça no mapa interativo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={editForm.latitude ?? ''}
              onChange={(e) => onFormChange({
                latitude: e.target.value ? parseFloat(e.target.value) : null,
              })}
              placeholder="Ex: 28.418889"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={editForm.longitude ?? ''}
              onChange={(e) => onFormChange({
                longitude: e.target.value ? parseFloat(e.target.value) : null,
              })}
              placeholder="Ex: -81.581389"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="address">Endereço Completo</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Textarea
              id="address"
              value={editForm.address || ''}
              onChange={(e) => onFormChange({ address: e.target.value })}
              className="pl-10"
              rows={2}
              placeholder="Endereço completo..."
            />
          </div>
        </div>

        <div
          className="mt-4 p-3 rounded-lg flex items-center gap-2 text-sm"
          style={{
            backgroundColor: (editForm.latitude && editForm.longitude)
              ? 'hsl(var(--success) / 0.1)'
              : 'hsl(var(--destructive) / 0.1)',
            color: (editForm.latitude && editForm.longitude)
              ? 'hsl(142 76% 36%)'
              : 'hsl(var(--destructive))',
          }}
        >
          <MapPin className="w-4 h-4" />
          {editForm.latitude && editForm.longitude ? (
            <span>✓ Coordenadas configuradas - aparece no mapa</span>
          ) : (
            <span>⚠ Sem coordenadas - não aparece no mapa</span>
          )}
        </div>

        <Button onClick={onSave} className="w-full mt-4" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Localização
        </Button>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Como obter coordenadas</h4>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Abra o Google Maps e pesquise o restaurante</li>
          <li>Clique com o botão direito no local exato</li>
          <li>Copie as coordenadas que aparecem (ex: 28.418889, -81.581389)</li>
          <li>Cole a primeira número em Latitude e o segundo em Longitude</li>
        </ol>
      </div>
    </div>
  );
}
