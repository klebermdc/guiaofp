import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface DiningAlertDialogProps {
  restaurantName: string
  restaurantId: string
  trigger?: React.ReactNode
}

export function DiningAlertDialog({ restaurantName, restaurantId, trigger }: DiningAlertDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [partySize, setPartySize] = useState('4')
  const [mealTime, setMealTime] = useState('any')

  const createAlert = async () => {
    if (!selectedDate) {
      toast.error('Selecione uma data')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Faça login para criar alertas')
        return
      }

      const { error } = await supabase
        .from('dining_alerts')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
          restaurant_name: restaurantName,
          desired_date: selectedDate.toISOString().split('T')[0],
          meal_time: mealTime,
          party_size: parseInt(partySize),
          status: 'active'
        })

      if (error) throw error

      toast.success('Alerta criado! Você será notificado quando uma vaga aparecer.')
      setOpen(false)
      setSelectedDate(undefined)
      setPartySize('4')
      setMealTime('any')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar alerta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Criar Alerta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Alerta de Reserva
          </DialogTitle>
          <DialogDescription>
            Avisamos quando houver vaga em <strong>{restaurantName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Calendar */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data desejada</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border mx-auto"
            />
          </div>

          {/* Party Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Número de pessoas</label>
            <Select value={partySize} onValueChange={setPartySize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} pessoas</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meal Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Horário da refeição</label>
            <Select value={mealTime} onValueChange={setMealTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer horário</SelectItem>
                <SelectItem value="breakfast">Café da Manhã</SelectItem>
                <SelectItem value="lunch">Almoço</SelectItem>
                <SelectItem value="dinner">Jantar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={createAlert} disabled={loading} className="w-full">
            {loading ? 'Criando...' : '🔔 Criar Alerta'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            O sistema checa periodicamente. Você receberá um email quando uma vaga for encontrada.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
