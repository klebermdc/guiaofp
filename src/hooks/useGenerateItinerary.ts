import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGuideContact } from './useGuideContact';
import { toast } from 'sonner';

interface AttractionInput {
  parkName: string;
  attractionName: string;
  notes?: string;
}

interface WaitTimeDataItem {
  name: string;
  currentWait: number;
  status: string;
  avgHistorical: number | null;
  optimalWindows: Array<{
    start: string;
    end: string;
    avgWait: number;
    ranking: number;
    confidence: number;
  }>;
}

interface ItineraryResult {
  itinerary: string;
  hasGuide: boolean;
  parkName: string;
  waitTimeData?: WaitTimeDataItem[];
  dataSource?: 'real-time' | 'none';
}

export const useGenerateItinerary = () => {
  const { hasGuide } = useGuideContact();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ItineraryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateItinerary = async (
    attractions: AttractionInput[],
    parkName: string,
    parkDate?: string,
    groupSize?: number,
    useRealTimeData: boolean = true
  ) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-itinerary', {
        body: {
          attractions,
          parkName,
          parkDate,
          groupSize,
          hasGuide,
          useRealTimeData,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Erro ao gerar roteiro');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
      // Show success toast with data source info
      if (data.dataSource === 'real-time' && data.waitTimeData?.length > 0) {
        toast.success(`Roteiro gerado com dados de ${data.waitTimeData.length} atrações em tempo real! 🎢`);
      } else {
        toast.success('Roteiro gerado com sucesso!');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    generateItinerary,
    isGenerating,
    result,
    error,
    hasGuide,
    clearResult,
  };
};
