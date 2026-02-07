import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Utensils, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function DiningAlertCreator() {
  const [loading, setLoading] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [partySize, setPartySize] = useState('4')
  const [mealTime, setMealTime] = useState('any')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants-for-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, category, location')
        .order('name')
      if (error) throw error
      return data
    },
  })

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant)

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

      const { error } = await supabase
        .from('dining_alerts')
        .insert({
          user_id: user.id,
          restaurant_id: selectedRestaurant,
          restaurant_name: selectedRestaurantData?.name ?? '',
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
      setSearchTerm('')
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
          Te avisamos por email quando uma vaga aparecer em qualquer um dos {restaurants.length} restaurantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Restaurant Selector with search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Restaurante</label>
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha o restaurante" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="px-2 pb-2 sticky top-0 bg-popover">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar restaurante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              {filteredRestaurants.map(r => (
                <SelectItem key={r.id} value={r.id}>
                  <span className="flex items-center gap-2">
                    <Utensils className="h-3 w-3 shrink-0" />
                    <span className="truncate">{r.name}</span>
                    {r.location && (
                      <span className="text-muted-foreground text-xs truncate">— {r.location}</span>
                    )}
                  </span>
                </SelectItem>
              ))}
              {filteredRestaurants.length === 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Nenhum restaurante encontrado
                </div>
              )}
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
          O sistema checa periodicamente. Quando encontrar uma vaga, você receberá um email imediatamente.
        </p>
      </CardContent>
    </Card>
  )
}
