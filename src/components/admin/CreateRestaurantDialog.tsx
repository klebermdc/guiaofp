import { Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  name: string;
  isCreating: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (name: string) => void;
  onCreate: () => void;
}

export function CreateRestaurantDialog({
  open,
  name,
  isCreating,
  onOpenChange,
  onNameChange,
  onCreate,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Restaurante</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-restaurant-name">Nome do Restaurante</Label>
            <Input
              id="new-restaurant-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ex: Cinderella's Royal Table"
              onKeyPress={(e) => e.key === 'Enter' && onCreate()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onCreate} disabled={!name.trim() || isCreating}>
            {isCreating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Criar Restaurante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
