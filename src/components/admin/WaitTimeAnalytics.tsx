import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, TrendingDown, Activity, Database, Calendar, AlertCircle } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export function WaitTimeAnalytics() {
  const [selectedPark, setSelectedPark] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');

  // Fetch parks for filter
  const { data: parks } = useQuery({
    queryKey: ['parks-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parks')
        .select('name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch total count of wait time records
  const { data: totalCount } = useQuery({
    queryKey: ['wait-time-count', selectedPark, dateRange],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
      
      let query = supabase
        .from('wait_time_records')
        .select('id', { count: 'exact', head: true })
        .gte('date', startDate);
      
      if (selectedPark !== 'all') {
        query = query.eq('park_name', selectedPark);
      }
      
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch wait time records summary
  const { data: recordsSummary, isLoading: loadingRecords } = useQuery({
    queryKey: ['wait-time-summary', selectedPark, dateRange],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
      
      let query = supabase
        .from('wait_time_records')
        .select('id, attraction_name, park_name, wait_time_minutes, date, timestamp, status')
        .gte('date', startDate)
        .order('timestamp', { ascending: false });
      
      if (selectedPark !== 'all') {
        query = query.eq('park_name', selectedPark);
      }
      
      // Fetch up to 5000 records for charts/stats
      const { data, error } = await query.limit(5000);
      if (error) throw error;
      return data;
    }
  });

  // Fetch daily analytics
  const { data: dailyAnalytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['daily-analytics', selectedPark, dateRange],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
      
      let query = supabase
        .from('daily_analytics')
        .select('*')
        .gte('date', startDate)
        .order('date', { ascending: false });
      
      if (selectedPark !== 'all') {
        query = query.eq('park_name', selectedPark);
      }
      
      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data;
    }
  });

  // Calculate stats
  const stats = {
    totalRecords: totalCount || recordsSummary?.length || 0,
    uniqueAttractions: new Set(recordsSummary?.map(r => r.attraction_name) || []).size,
    uniqueParks: new Set(recordsSummary?.map(r => r.park_name) || []).size,
    avgWaitTime: recordsSummary?.length 
      ? Math.round(recordsSummary.reduce((sum, r) => sum + (r.wait_time_minutes || 0), 0) / recordsSummary.filter(r => r.wait_time_minutes).length)
      : 0,
    maxWaitTime: recordsSummary?.length 
      ? Math.max(...recordsSummary.map(r => r.wait_time_minutes || 0))
      : 0,
    analyticsRecords: dailyAnalytics?.length || 0
  };

  // Prepare chart data - records by day
  const recordsByDay = recordsSummary?.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = { date, count: 0, avgWait: 0, totalWait: 0 };
    }
    acc[date].count++;
    acc[date].totalWait += record.wait_time_minutes || 0;
    acc[date].avgWait = Math.round(acc[date].totalWait / acc[date].count);
    return acc;
  }, {} as Record<string, { date: string; count: number; avgWait: number; totalWait: number }>);

  const chartData = Object.values(recordsByDay || {}).sort((a, b) => a.date.localeCompare(b.date));

  // Records by park
  const recordsByPark = recordsSummary?.reduce((acc, record) => {
    if (!acc[record.park_name]) {
      acc[record.park_name] = { park: record.park_name, count: 0, avgWait: 0, totalWait: 0 };
    }
    acc[record.park_name].count++;
    acc[record.park_name].totalWait += record.wait_time_minutes || 0;
    acc[record.park_name].avgWait = Math.round(acc[record.park_name].totalWait / acc[record.park_name].count);
    return acc;
  }, {} as Record<string, { park: string; count: number; avgWait: number; totalWait: number }>);

  const parkChartData = Object.values(recordsByPark || {}).sort((a, b) => b.count - a.count);

  // Top attractions by wait time
  const attractionStats = recordsSummary?.reduce((acc, record) => {
    const key = `${record.park_name}|${record.attraction_name}`;
    if (!acc[key]) {
      acc[key] = { 
        attraction: record.attraction_name, 
        park: record.park_name, 
        count: 0, 
        avgWait: 0, 
        maxWait: 0,
        totalWait: 0 
      };
    }
    acc[key].count++;
    acc[key].totalWait += record.wait_time_minutes || 0;
    acc[key].avgWait = Math.round(acc[key].totalWait / acc[key].count);
    acc[key].maxWait = Math.max(acc[key].maxWait, record.wait_time_minutes || 0);
    return acc;
  }, {} as Record<string, { attraction: string; park: string; count: number; avgWait: number; maxWait: number; totalWait: number }>);

  const topAttractions = Object.values(attractionStats || {})
    .sort((a, b) => b.avgWait - a.avgWait)
    .slice(0, 10);

  const chartConfig = {
    count: { label: 'Registros', color: 'hsl(var(--primary))' },
    avgWait: { label: 'Média (min)', color: 'hsl(var(--secondary))' }
  };

  const isLoading = loadingRecords || loadingAnalytics;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedPark} onValueChange={setSelectedPark}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por parque" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os parques</SelectItem>
            {parks?.map(park => (
              <SelectItem key={park.name} value={park.name}>{park.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Último dia</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="14">Últimos 14 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.uniqueAttractions} atrações • {stats.uniqueParks} parques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Espera</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgWaitTime} min</div>
            <p className="text-xs text-muted-foreground">
              Máximo: {stats.maxWaitTime} min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics Processados</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analyticsRecords}</div>
            <p className="text-xs text-muted-foreground">
              Relatórios diários gerados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {stats.totalRecords > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRecords > 0 ? (
                <Badge variant="default" className="bg-green-500">Coletando</Badge>
              ) : (
                <Badge variant="secondary">Sem dados</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Último período: {dateRange} dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Records by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Registros por Dia
            </CardTitle>
            <CardDescription>Quantidade de coletas diárias</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average Wait by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Média de Espera por Dia
            </CardTitle>
            <CardDescription>Tempo médio de fila em minutos</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="avgWait" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--secondary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Records by Park */}
      <Card>
        <CardHeader>
          <CardTitle>Registros por Parque</CardTitle>
          <CardDescription>Distribuição de coletas por parque</CardDescription>
        </CardHeader>
        <CardContent>
          {parkChartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={parkChartData} layout="vertical">
                  <XAxis type="number" fontSize={12} />
                  <YAxis 
                    dataKey="park" 
                    type="category" 
                    width={150} 
                    fontSize={11}
                    tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Attractions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Atrações por Tempo de Espera</CardTitle>
          <CardDescription>Atrações com maior média de espera</CardDescription>
        </CardHeader>
        <CardContent>
          {topAttractions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atração</TableHead>
                  <TableHead>Parque</TableHead>
                  <TableHead className="text-right">Registros</TableHead>
                  <TableHead className="text-right">Média</TableHead>
                  <TableHead className="text-right">Máximo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAttractions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.attraction}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.park}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={item.avgWait > 60 ? 'destructive' : item.avgWait > 30 ? 'secondary' : 'default'}>
                        {item.avgWait} min
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.maxWait} min</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Registros</CardTitle>
          <CardDescription>Últimas 20 coletas de tempo de fila</CardDescription>
        </CardHeader>
        <CardContent>
          {recordsSummary && recordsSummary.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Atração</TableHead>
                  <TableHead>Parque</TableHead>
                  <TableHead className="text-right">Espera</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordsSummary.slice(0, 20).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-sm">
                      {format(new Date(record.timestamp), "dd/MM HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{record.attraction_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{record.park_name}</TableCell>
                    <TableCell className="text-right">
                      {record.wait_time_minutes !== null ? (
                        <Badge variant={record.wait_time_minutes > 60 ? 'destructive' : record.wait_time_minutes > 30 ? 'secondary' : 'default'}>
                          {record.wait_time_minutes} min
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {record.status || 'Operating'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Nenhum registro encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
