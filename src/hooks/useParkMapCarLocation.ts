import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { LatLng } from '@/types/parkMap';

export function useParkMapCarLocation(userPosition: LatLng | null, calculateRoute: (dest: LatLng, name: string) => void) {
  const [carLocation, setCarLocation] = useState<LatLng | null>(() => {
    const saved = localStorage.getItem('parked-car-location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (carLocation) {
      localStorage.setItem('parked-car-location', JSON.stringify(carLocation));
    } else {
      localStorage.removeItem('parked-car-location');
    }
  }, [carLocation]);

  const saveCarLocation = useCallback(() => {
    if (!userPosition) {
      toast.error('Ative sua localização primeiro', {
        description: 'Precisamos saber onde você está para marcar o carro',
      });
      return;
    }
    setCarLocation(userPosition);
    toast.success('🚗 Localização do carro salva!', {
      description: 'Toque no botão do carro para navegar de volta',
    });
  }, [userPosition]);

  const clearCarLocation = useCallback(() => {
    setCarLocation(null);
    toast.info('Localização do carro removida');
  }, []);

  const navigateToCar = useCallback(() => {
    if (!carLocation) {
      toast.error('Nenhum carro marcado', {
        description: 'Primeiro estacione e marque a localização',
      });
      return;
    }
    if (!userPosition) {
      toast.info('Ativando localização...', {
        description: 'Tente novamente em alguns segundos',
      });
      return;
    }
    calculateRoute(carLocation, '🚗 Meu Carro');
  }, [carLocation, userPosition, calculateRoute]);

  return { carLocation, saveCarLocation, clearCarLocation, navigateToCar };
}
