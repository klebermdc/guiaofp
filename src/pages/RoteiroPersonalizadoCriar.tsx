import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { QuestionnaireWizard, QuestionnaireFormData } from "@/components/itinerary/QuestionnaireWizard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function RoteiroPersonalizadoCriar() {
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
      // Build the travelers and questionnaire_answers objects
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

      // Save questionnaire data to database
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
        toast.error("Erro ao salvar questionário. Tente novamente.");
        return;
      }

      toast.success("Questionário completo! Gerando seu roteiro...");
      
      // Navigate to the itinerary page
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
        description="Crie seu roteiro personalizado para Orlando com base nas suas preferências."
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-4">
              <MapPin className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Criar Roteiro
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Responda algumas perguntas e nossa IA criará um roteiro exclusivo para sua viagem
            </p>

            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">
                Gerado por Inteligência Artificial
              </span>
            </div>
          </motion.div>

          {/* Questionnaire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
