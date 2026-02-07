import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink, Check, X } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Restaurant {
  id: string
  name: string
  park?: string | null
  location?: string | null
  disney_url?: string | null
}

interface TimeSlot {
  time: string
  mealPeriod: string
}

export function RestaurantAvailabilityCalendar({ restaurant }: { restaurant: Restaurant }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [partySize, setPartySize] = useState(4)
  const [availabilityData, setAvailabilityData] = useState<Map<string, boolean>>(new Map())
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([])
  const [checkingDate, setCheckingDate] = useState<string | null>(null)

  useEffect(() => {
    loadCachedAvailability()
  }, [restaurant.id, partySize])

  const loadCachedAvailability = async () => {
    const today = new Date()
    const dates: string[] = []

    for (let i = 0; i < 60; i++) {
      dates.push(format(addDays(today, i), 'yyyy-MM-dd'))
    }

    const { data } = await supabase
      .from('availability_cache')
      .select('date, is_available')
      .eq('restaurant_id', restaurant.id)
      .eq('party_size', partySize)
      .in('date', dates)

    const availMap = new Map<string, boolean>()
    data?.forEach(item => {
      if (item.is_available !== null) {
        availMap.set(item.date, item.is_available)
      }
    })
    setAvailabilityData(availMap)
  }

  const checkAvailability = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    setCheckingDate(dateStr)
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('check-availability', {
        body: {
          restaurantId: restaurant.id,
          date: dateStr,
          partySize,
        }
      })

      if (error) throw error

      if (data.available && data.times) {
        setAvailableTimes(data.times)
        toast({
          title: '✅ Vagas encontradas!',
          description: `Encontramos ${data.times.length} horários disponíveis`,
        })
      } else {
        setAvailableTimes([])
        toast({
          title: 'Sem vagas',
          description: 'Não há horários disponíveis nesta data',
          variant: 'destructive',
        })
      }

      setAvailabilityData(prev => new Map(prev).set(dateStr, data.available))
    } catch (error: unknown) {
      toast({
        title: 'Erro ao verificar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setCheckingDate(null)
    }
  }

  const modifiers = {
    available: (date: Date) => availabilityData.get(format(date, 'yyyy-MM-dd')) === true,
    unavailable: (date: Date) => availabilityData.get(format(date, 'yyyy-MM-dd')) === false,
  }

  const modifiersStyles = {
    available: {
      backgroundColor: 'hsl(var(--success))',
      color: 'hsl(var(--success-foreground, 0 0% 100%))',
      fontWeight: 'bold' as const,
    },
    unavailable: {
      backgroundColor: 'hsl(var(--destructive))',
      color: 'hsl(var(--destructive-foreground))',
      opacity: 0.5,
    },
  }

  const getDisneyBookingUrl = () => {
    const base = restaurant.disney_url || `https://disneyworld.disney.go.com/dining/${restaurant.id}/`
    if (!selectedDate) return base
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return `${base}?date=${dateStr}&partySize=${partySize}`
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground">{restaurant.park || restaurant.location}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Pessoas:</span>
          <select
            value={partySize}
            onChange={(e) => setPartySize(parseInt(e.target.value))}
            className="border border-border rounded-md px-3 py-2 bg-background text-foreground text-sm"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-success" />
          Disponível
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-destructive opacity-50" />
          Sem vagas
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-muted" />
          Não verificado
        </span>
      </div>

      {/* Calendar */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date)
            if (date) checkAvailability(date)
          }}
          disabled={(date) => date < new Date()}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          locale={ptBR}
          className="rounded-md"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Verificando disponibilidade...
        </div>
      )}

      {/* Available Times */}
      {!loading && availableTimes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">
            Horários disponíveis para{' '}
            {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h4>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {availableTimes.map((slot, idx) => (
              <div key={idx} className="bg-success/10 border border-success/30 rounded-lg p-2 text-center">
                <p className="font-bold text-success text-sm">{slot.time}</p>
                <p className="text-xs text-muted-foreground">{slot.mealPeriod}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-lg bg-accent/50 p-4 space-y-3">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Reserve agora!</p>
              <p className="text-xs text-muted-foreground">
                Clique no botão abaixo para ser redirecionado ao site oficial da Disney World.
                As vagas podem esgotar rapidamente!
              </p>
              <p className="text-xs text-muted-foreground italic">
                💡 Dica: Tenha sua conta Disney já logada para agilizar
              </p>
            </div>

            <Button
              onClick={() => window.open(getDisneyBookingUrl(), '_blank')}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Reservar no Site da Disney
            </Button>
          </div>
        </div>
      )}

      {/* No availability */}
      {!loading && selectedDate && availableTimes.length === 0 && !checkingDate && (
        <div className="text-center space-y-3 py-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <X className="h-5 w-5 text-destructive" />
            <p className="text-sm">Não há vagas disponíveis para esta data</p>
          </div>

          <Button
            onClick={() => {
              toast({
                title: 'Alerta configurado!',
                description: 'Te avisaremos quando uma vaga aparecer',
              })
            }}
            variant="outline"
          >
            🔔 Criar Alerta para Esta Data
          </Button>
        </div>
      )}
    </div>
  )
}
