import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Pause, Play, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MyAlertsDashboard() {
  const queryClient = useQueryClient()

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['my-dining-alerts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('dining_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  })

  const toggleAlertMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === 'active' ? 'paused' : 'active'
      const { error } = await supabase
        .from('dining_alerts')
        .update({ status: newStatus })
        .eq('id', id)
      if (error) throw error
      return newStatus
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['my-dining-alerts'] })
      toast.success(newStatus === 'active' ? 'Alerta reativado' : 'Alerta pausado')
    },
    onError: () => toast.error('Erro ao atualizar alerta')
  })

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dining_alerts')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-dining-alerts'] })
      toast.success('Alerta removido')
    },
    onError: () => toast.error('Erro ao remover alerta')
  })

  const getMealTimeLabel = (mealTime: string | null) => {
    switch (mealTime) {
      case 'breakfast': return 'Café da Manhã'
      case 'lunch': return 'Almoço'
      case 'dinner': return 'Jantar'
      default: return 'Qualquer horário'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando alertas...</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Meus Alertas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!alerts?.length && (
          <p className="text-muted-foreground text-center py-6">
            Você ainda não criou nenhum alerta de reserva.
          </p>
        )}

        <div className="space-y-3">
          {alerts?.map(alert => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {alert.restaurant_name || alert.restaurant_id}
                  </span>
                  <Badge variant={alert.status === 'active' ? 'default' : 'secondary'}>
                    {alert.status === 'active' ? 'Ativo' : 'Pausado'}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>📅 {new Date(alert.desired_date).toLocaleDateString('pt-BR')}</span>
                  <span>👥 {alert.party_size} pessoas</span>
                  <span>🍽️ {getMealTimeLabel(alert.meal_time)}</span>
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleAlertMutation.mutate({ id: alert.id, status: alert.status ?? 'active' })}
                  disabled={toggleAlertMutation.isPending}
                >
                  {alert.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteAlertMutation.mutate(alert.id)}
                  disabled={deleteAlertMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
