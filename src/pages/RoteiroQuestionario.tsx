import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { QuestionnaireWizard, QuestionnaireFormData } from "@/components/itinerary/QuestionnaireWizard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function RoteiroQuestionario() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionnaireComplete = async (data: QuestionnaireFormData) => {
    if (!user) {
      toast.error("Você precisa estar logado para criar um roteiro");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      const travelers = {
        adults_count: data.adultsCount,
        children_count: data.childrenCount,
        children_ages: data.childrenAges,
      };

      const questionnaire_answers = {
        budget_level: data.budgetLevel,
        is_first_trip: data.isFirstTrip,
        travel_style: data.travelStyle,
        parks_interest_level: data.parksInterestLevel,
        airport_transfer: data.airportTransfer,
        will_rent_car: data.willRentCar,
        staying_region: data.stayingRegion,
        accommodation_type: data.accommodationType,
        selected_parks: data.selectedParks,
        additional_activities: data.additionalActivities,
      };

      const { data: itinerary, error } = await supabase
        .from("itineraries")
        .insert({
          user_id: user.id,
          title: `Orlando ${data.startDate.getFullYear()}`,
          destination: "Orlando",
          start_date: data.startDate.toISOString().split("T")[0],
          end_date: data.endDate.toISOString().split("T")[0],
          travelers,
          questionnaire_answers,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving itinerary:", error);
        toast.error("Erro ao salvar. Tente novamente.");
        return;
      }

      toast.success("Questionário completo! Gerando seu roteiro...");
      navigate(`/roteiro-personalizado/${itinerary.id}`);
      
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <SEO
        title="Criar Roteiro | Guia Orlando Fast Pass"
        description="Crie seu roteiro personalizado para Orlando."
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/roteiro-personalizado")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-3">
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Criar Roteiro</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Responda algumas perguntas e nossa IA criará um roteiro exclusivo
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Powered by AI</span>
            </div>
          </motion.div>

          {/* Questionnaire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <QuestionnaireWizard
              onComplete={handleQuestionnaireComplete}
              isLoading={isLoading}
            />
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
