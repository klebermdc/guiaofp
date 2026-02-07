import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { ExternalLink, Search, Loader2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface Restaurant {
  id: string
  name: string
  slug?: string
  park?: string | null
  location?: string | null
  disney_url?: string | null
}

interface TimeSlot {
  time: string
  available: boolean
}

export function RestaurantAvailabilityCalendar({ restaurant }: { restaurant: Restaurant }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [partySize, setPartySize] = useState(4)
  const [isChecking, setIsChecking] = useState(false)
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[] | null>(null)
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  const getDisneyBookingUrl = () => {
    const base = restaurant.disney_url || `https://disneyworld.disney.go.com/dining/`
    if (!selectedDate) return base
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return `${base}?date=${dateStr}&partySize=${partySize}`
  }

  const checkAvailability = async () => {
    if (!selectedDate) return

    setIsChecking(true)
    setAvailableTimes(null)

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const slug = restaurant.slug || restaurant.id

      const { data, error } = await supabase.functions.invoke('check-availability-proxy', {
        body: { restaurantSlug: slug, date: dateStr, partySize }
      })

      if (error) throw error

      if (data?.success) {
        setAvailableTimes(data.times || [])
        setLastChecked(data.checkedAt)
        if (data.times?.length > 0) {
          toast.success(`${data.times.length} horário(s) encontrado(s)!`)
        } else {
          toast.info('Nenhum horário disponível para esta data.')
        }
      } else {
        throw new Error(data?.error || 'Falha ao verificar disponibilidade')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('Availability check error:', message)
      toast.error('Não foi possível verificar. Tente pelo site da Disney.')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">📅 Verificar Disponibilidade</h3>
          <p className="text-sm text-muted-foreground">{restaurant.park || restaurant.location}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Pessoas:</span>
          <select
            value={partySize}
            onChange={(e) => { setPartySize(parseInt(e.target.value)); setAvailableTimes(null) }}
            className="border border-border rounded-md px-3 py-2 bg-background text-foreground text-sm"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => { setSelectedDate(d); setAvailableTimes(null) }}
          disabled={(date) => date < new Date()}
          locale={ptBR}
          className="rounded-md"
        />
      </div>

      {/* Available times results */}
      {availableTimes !== null && (
        <div className="rounded-lg border border-border p-3 space-y-2">
          {availableTimes.length > 0 ? (
            <>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Horários disponíveis:
              </p>
              <div className="flex flex-wrap gap-2">
                {availableTimes.map((slot, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {slot.time}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhum horário disponível para esta data. Tente outra data ou reserve diretamente no site.
            </p>
          )}
          {lastChecked && (
            <p className="text-xs text-muted-foreground">
              Verificado em: {new Date(lastChecked).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      )}

      <div className="rounded-lg bg-accent/50 p-4 space-y-3">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            {selectedDate
              ? `Reservar para ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })} — ${partySize} pessoa(s)`
              : 'Selecione uma data acima para reservar'}
          </p>
          <p className="text-xs text-muted-foreground">
            Você será redirecionado ao site oficial da Disney World para verificar horários e finalizar a reserva.
          </p>
          <p className="text-xs text-muted-foreground italic">
            💡 Dica: Tenha sua conta Disney já logada para agilizar
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={checkAvailability}
            variant="outline"
            size="lg"
            disabled={!selectedDate || isChecking}
            className="flex-1"
          >
            {isChecking ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verificando...</>
            ) : (
              <><Search className="h-4 w-4 mr-2" />Buscar Horários</>
            )}
          </Button>

          <Button
            onClick={() => window.open(getDisneyBookingUrl(), '_blank')}
            size="lg"
            disabled={!selectedDate}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Reservar na Disney
          </Button>
        </div>
      </div>
    </div>
  )
}
