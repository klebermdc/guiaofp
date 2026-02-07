import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Utensils } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const DISNEY_RESTAURANTS = [
  { id: '90002606', name: 'Be Our Guest Restaurant', park: 'Magic Kingdom' },
  { id: '90002660', name: "Cinderella's Royal Table", park: 'Magic Kingdom' },
  { id: '16660079', name: 'Ohana', park: 'Polynesian Resort' },
  { id: '90002516', name: 'Space 220', park: 'Epcot' },
]

export function DiningAlertCreator() {
  const [loading, setLoading] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [partySize, setPartySize] = useState('4')
  const [mealTime, setMealTime] = useState('any')

  const createAlert = async () => {
    if (!selectedRestaurant || !selectedDate) {
      toast.error('Selecione um restaurante e uma data')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Faça login para criar alertas')
        return
      }

      const restaurant = DISNEY_RESTAURANTS.find(r => r.id === selectedRestaurant)

      const { error } = await supabase
        .from('dining_alerts')
        .insert({
          user_id: user.id,
          restaurant_id: selectedRestaurant,
          restaurant_name: restaurant?.name ?? '',
          desired_date: selectedDate.toISOString().split('T')[0],
          meal_time: mealTime,
          party_size: parseInt(partySize),
          status: 'active'
        })

      if (error) throw error

      toast.success('Alerta criado! Você receberá um email quando encontrarmos uma vaga.')

      setSelectedRestaurant('')
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Criar Alerta de Reserva
        </CardTitle>
        <CardDescription>
          Te avisamos por email quando uma vaga aparecer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Restaurant Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Restaurante</label>
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha o restaurante" />
            </SelectTrigger>
            <SelectContent>
              {DISNEY_RESTAURANTS.map(r => (
                <SelectItem key={r.id} value={r.id}>
                  <span className="flex items-center gap-2">
                    <Utensils className="h-3 w-3" />
                    {r.name} — {r.park}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Calendar */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Data desejada</label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
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
          O sistema checa a cada 5 minutos. Quando encontrar uma vaga, você receberá um email imediatamente.
        </p>
      </CardContent>
    </Card>
  )
}
