import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGuideContact } from './useGuideContact';
import { toast } from 'sonner';

interface AttractionInput {
  parkName: string;
  attractionName: string;
  notes?: string;
}

interface ItineraryResult {
  itinerary: string;
  hasGuide: boolean;
  parkName: string;
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
    groupSize?: number
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
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Erro ao gerar roteiro');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
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
