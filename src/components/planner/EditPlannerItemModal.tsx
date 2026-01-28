import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Clock, FileText, Timer, CalendarCheck } from 'lucide-react';
import type { PlannerItem } from './PlannerCalendar';

interface EditPlannerItemModalProps {
  item: PlannerItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (itemId: string, updates: Partial<PlannerItem>) => Promise<void>;
}

const TIME_SLOTS = [
  { id: 'morning', label: 'Manhã (6h - 12h)', icon: '☀️' },
  { id: 'afternoon', label: 'Tarde (12h - 18h)', icon: '🌤️' },
  { id: 'evening', label: 'Noite (18h - 00h)', icon: '🌙' },
  { id: 'night', label: 'Madrugada (00h - 6h)', icon: '🌃' },
];

export const EditPlannerItemModal = ({
  item,
  open,
  onOpenChange,
  onSave,
}: EditPlannerItemModalProps) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reservationConfirmed, setReservationConfirmed] = useState(false);
  const [reservationTime, setReservationTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync form state with item when modal opens
  useEffect(() => {
    if (item && open) {
      setStartTime(item.start_time || '');
      setEndTime(item.end_time || '');
      setDuration(item.duration?.toString() || '');
      setNotes(item.notes || '');
      setTimeSlot(item.time_slot || 'morning');
      setReservationConfirmed(item.reservation_confirmed || false);
      setReservationTime(item.reservation_time || '');
    }
  }, [item, open]);

  const handleSave = async () => {
    if (!item) return;

    setIsSaving(true);
    try {
      await onSave(item.id, {
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        duration: duration ? parseInt(duration, 10) : undefined,
        notes: notes || undefined,
        time_slot: timeSlot as PlannerItem['time_slot'],
        reservation_confirmed: reservationConfirmed,
        reservation_time: reservationTime || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{item.icon}</span>
            Editar: {item.item_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Time Slot */}
          <div className="space-y-2">
            <Label htmlFor="timeSlot" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Período do dia
            </Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger id="timeSlot">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    <span className="flex items-center gap-2">
                      <span>{slot.icon}</span>
                      {slot.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start/End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário início</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="08:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário fim</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="10:00"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              Duração (minutos)
            </Label>
            <Input
              id="duration"
              type="number"
              min="0"
              max="480"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
            />
          </div>

          {/* Reservation */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="reservation" className="cursor-pointer">
                Reserva confirmada
              </Label>
            </div>
            <Switch
              id="reservation"
              checked={reservationConfirmed}
              onCheckedChange={setReservationConfirmed}
            />
          </div>

          {/* Reservation Time (shown when confirmed) */}
          {reservationConfirmed && (
            <div className="space-y-2">
              <Label htmlFor="reservationTime">Horário da reserva</Label>
              <Input
                id="reservationTime"
                type="time"
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
                placeholder="19:00"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Observações
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotações, lembretes, dicas..."
              rows={3}
              maxLength={500}
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {notes.length}/500
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlannerItemModal;
