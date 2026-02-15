import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Sparkles, ArrowLeft, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { QuestionnaireWizard, QuestionnaireFormData } from "@/components/itinerary/QuestionnaireWizard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Floating particle component
function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 3,
      emoji: ["✨", "⭐", "🌟", "💫", "🏰", "🎢", "🎆"][Math.floor(Math.random() * 7)],
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map(p => (
        <motion.span
          key={p.id}
          className="absolute text-xs opacity-20"
          style={{ left: p.left, top: p.top, fontSize: p.size + 8 }}
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.3, 0.1], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

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
        // New fields
        dietary_restrictions: data.dietaryRestrictions,
        dietary_other: data.dietaryOther,
        physical_limitations: data.physicalLimitations,
        fears: data.fears,
        special_occasions: data.specialOccasions,
        birthday_date: data.birthdayDate,
        birthday_person: data.birthdayPerson,
        occasion_other: data.occasionOther,
        heat_preference: data.heatPreference,
        rain_preference: data.rainPreference,
        group_energy: data.groupEnergy,
        sleep_preference: data.sleepPreference,
        attraction_priorities: data.attractionPriorities,
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

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative">
        {/* Floating particles */}
        <FloatingParticles />

        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-60 right-1/4 w-56 h-56 bg-accent/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-secondary/6 rounded-full blur-[90px] pointer-events-none" />

        <div className="container max-w-2xl mx-auto px-4 py-6 relative z-10">
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

          {/* Grand Header */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8"
          >
            {/* Animated icon */}
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-magic mb-4 shadow-glow"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Wand2 className="w-10 h-10 text-primary-foreground" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
              <span className="text-gradient">Vamos criar</span>{" "}
              <span className="text-gradient-gold">algo mágico</span>
            </h1>

            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Responda as perguntas e nossa IA criará um roteiro{" "}
              <span className="text-foreground font-medium">exclusivo e personalizado</span>{" "}
              para sua viagem dos sonhos ✨
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 mt-4"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Powered by AI</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
                <MapPin className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-medium text-secondary">Orlando Expert</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Questionnaire */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
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
