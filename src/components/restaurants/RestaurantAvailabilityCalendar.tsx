import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Restaurant {
  id: string
  name: string
  park?: string | null
  location?: string | null
  disney_url?: string | null
}

export function RestaurantAvailabilityCalendar({ restaurant }: { restaurant: Restaurant }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [partySize, setPartySize] = useState(4)

  const getDisneyBookingUrl = () => {
    const base = restaurant.disney_url || `https://disneyworld.disney.go.com/dining/`
    if (!selectedDate) return base
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return `${base}?date=${dateStr}&partySize=${partySize}`
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
            onChange={(e) => setPartySize(parseInt(e.target.value))}
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
          onSelect={setSelectedDate}
          disabled={(date) => date < new Date()}
          locale={ptBR}
          className="rounded-md"
        />
      </div>

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

        <Button
          onClick={() => window.open(getDisneyBookingUrl(), '_blank')}
          className="w-full"
          size="lg"
          disabled={!selectedDate}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {selectedDate ? 'Verificar Disponibilidade na Disney' : 'Selecione uma data'}
        </Button>
      </div>
    </div>
  )
}
