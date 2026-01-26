import { useState, useEffect } from 'react';

// Orlando coordinates (central location for Disney/Universal area)
const ORLANDO_LAT = 28.4177;
const ORLANDO_LNG = -81.5812;

interface DayForecast {
  date: string;
  dateFormatted: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  precipitationProb: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  uvIndex: number;
}

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    weatherCode: number;
    weatherDescription: string;
    weatherIcon: string;
    uvIndex: number;
  };
  daily: DayForecast[];
  isLoading: boolean;
  error: string | null;
}

// WMO Weather interpretation codes
const getWeatherInfo = (code: number): { description: string; icon: string } => {
  const weatherCodes: Record<number, { description: string; icon: string }> = {
    0: { description: 'Céu limpo', icon: '☀️' },
    1: { description: 'Pouco nublado', icon: '🌤️' },
    2: { description: 'Parcialmente nublado', icon: '⛅' },
    3: { description: 'Nublado', icon: '☁️' },
    45: { description: 'Neblina', icon: '🌫️' },
    48: { description: 'Neblina com geada', icon: '🌫️' },
    51: { description: 'Garoa leve', icon: '🌦️' },
    53: { description: 'Garoa moderada', icon: '🌦️' },
    55: { description: 'Garoa intensa', icon: '🌧️' },
    61: { description: 'Chuva leve', icon: '🌧️' },
    63: { description: 'Chuva moderada', icon: '🌧️' },
    65: { description: 'Chuva forte', icon: '🌧️' },
    71: { description: 'Neve leve', icon: '🌨️' },
    73: { description: 'Neve moderada', icon: '🌨️' },
    75: { description: 'Neve forte', icon: '❄️' },
    80: { description: 'Pancadas leves', icon: '🌦️' },
    81: { description: 'Pancadas moderadas', icon: '🌧️' },
    82: { description: 'Pancadas fortes', icon: '⛈️' },
    95: { description: 'Trovoadas', icon: '⛈️' },
    96: { description: 'Trovoadas com granizo', icon: '⛈️' },
    99: { description: 'Trovoadas com granizo forte', icon: '⛈️' },
  };
  
  return weatherCodes[code] || { description: 'Não disponível', icon: '❓' };
};

const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return 'Hoje';
  if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
  
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
};

export const useWeatherForecast = (daysAhead: number = 7) => {
  const [data, setData] = useState<WeatherData>({
    current: {
      temp: 0,
      humidity: 0,
      weatherCode: 0,
      weatherDescription: '',
      weatherIcon: '',
      uvIndex: 0,
    },
    daily: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Open-Meteo API (free, no API key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${ORLANDO_LAT}&longitude=${ORLANDO_LNG}&current=temperature_2m,relative_humidity_2m,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=America/New_York&forecast_days=${daysAhead}`
        );

        if (!response.ok) {
          throw new Error('Falha ao carregar previsão do tempo');
        }

        const result = await response.json();
        
        const currentWeatherInfo = getWeatherInfo(result.current.weather_code);
        
        const dailyForecasts: DayForecast[] = result.daily.time.map((date: string, index: number) => {
          const weatherInfo = getWeatherInfo(result.daily.weather_code[index]);
          return {
            date,
            dateFormatted: formatDate(date),
            dayName: getDayName(date),
            tempMax: Math.round(result.daily.temperature_2m_max[index]),
            tempMin: Math.round(result.daily.temperature_2m_min[index]),
            precipitationProb: result.daily.precipitation_probability_max[index] || 0,
            weatherCode: result.daily.weather_code[index],
            weatherDescription: weatherInfo.description,
            weatherIcon: weatherInfo.icon,
            uvIndex: result.daily.uv_index_max[index] || 0,
          };
        });

        setData({
          current: {
            temp: Math.round(result.current.temperature_2m),
            humidity: result.current.relative_humidity_2m,
            weatherCode: result.current.weather_code,
            weatherDescription: currentWeatherInfo.description,
            weatherIcon: currentWeatherInfo.icon,
            uvIndex: Math.round(result.current.uv_index || 0),
          },
          daily: dailyForecasts,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Weather fetch error:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Não foi possível carregar a previsão',
        }));
      }
    };

    fetchWeather();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [daysAhead]);

  return data;
};
