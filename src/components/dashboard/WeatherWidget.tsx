import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Droplets, Sun, Thermometer, Wind } from 'lucide-react';
import { useWeatherForecast } from '@/hooks/useWeatherForecast';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  arrivalDate?: string;
  departureDate?: string;
  className?: string;
}

const WeatherWidgetComponent = ({ arrivalDate, departureDate, className }: WeatherWidgetProps) => {
  const { current, daily, isLoading, error } = useWeatherForecast(7);

  // Filter forecasts for trip dates if provided
  const getRelevantForecasts = () => {
    if (!arrivalDate || !departureDate) return daily.slice(0, 5);
    
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    
    return daily.filter(day => {
      const date = new Date(day.date);
      return date >= arrival && date <= departure;
    }).slice(0, 5);
  };

  const forecasts = getRelevantForecasts();
  const showTripForecasts = arrivalDate && departureDate && forecasts.length > 0;

  const getUVLevel = (uv: number): { label: string; color: string } => {
    if (uv <= 2) return { label: 'Baixo', color: 'text-success' };
    if (uv <= 5) return { label: 'Moderado', color: 'text-warning' };
    if (uv <= 7) return { label: 'Alto', color: 'text-orange-500' };
    if (uv <= 10) return { label: 'Muito Alto', color: 'text-destructive' };
    return { label: 'Extremo', color: 'text-purple-500' };
  };

  const getPrecipColor = (prob: number): string => {
    if (prob < 20) return 'text-success';
    if (prob < 50) return 'text-warning';
    return 'text-blue-500';
  };

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-16 flex-shrink-0 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Cloud className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const uvInfo = getUVLevel(current.uvIndex);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <Sun className="w-5 h-5 text-yellow-500" />
          </motion.div>
          Clima em Orlando
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl" role="img" aria-label={current.weatherDescription}>
              {current.weatherIcon}
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{current.temp}</span>
                <span className="text-lg text-muted-foreground">°C</span>
              </div>
              <p className="text-sm text-muted-foreground">{current.weatherDescription}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Droplets className="w-4 h-4" />
              <span>{current.humidity}%</span>
            </div>
            <div className={cn("flex items-center gap-2", uvInfo.color)}>
              <Sun className="w-4 h-4" />
              <span>UV {uvInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="space-y-2">
          {showTripForecasts && (
            <p className="text-xs text-muted-foreground">Previsão para sua viagem:</p>
          )}
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(showTripForecasts ? forecasts : daily.slice(0, 5)).map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center p-2 min-w-[60px] bg-muted/50 rounded-lg text-center flex-shrink-0"
              >
                <span className="text-xs font-medium text-muted-foreground mb-1">
                  {day.dayName}
                </span>
                <span className="text-lg mb-1" role="img" aria-label={day.weatherDescription}>
                  {day.weatherIcon}
                </span>
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-medium">{day.tempMax}°</span>
                  <span className="text-muted-foreground">{day.tempMin}°</span>
                </div>
                {day.precipitationProb > 0 && (
                  <span className={cn("text-[10px] flex items-center gap-0.5 mt-1", getPrecipColor(day.precipitationProb))}>
                    <Droplets className="w-2.5 h-2.5" />
                    {day.precipitationProb}%
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tips based on weather */}
        {(current.uvIndex >= 6 || daily.some(d => d.precipitationProb >= 50)) && (
          <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
            <p className="font-medium text-foreground">💡 Dica do dia:</p>
            {current.uvIndex >= 6 && (
              <p className="text-muted-foreground">• UV alto! Use protetor solar e chapéu</p>
            )}
            {daily.slice(0, 2).some(d => d.precipitationProb >= 50) && (
              <p className="text-muted-foreground">• Leve uma capa de chuva leve</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const WeatherWidget = memo(WeatherWidgetComponent);
