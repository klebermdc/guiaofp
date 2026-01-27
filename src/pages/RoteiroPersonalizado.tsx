import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Sparkles, Plus, Calendar, Users, Star, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function RoteiroPersonalizado() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch last 3 itineraries
  const { data: itineraries, isLoading } = useQuery({
    queryKey: ["itineraries", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleCreateNew = () => {
    setIsCreating(true);
    navigate("/roteiro-personalizado/criar");
  };

  return (
    <AppLayout>
      <SEO
        title="Roteiro Personalizado | Guia Orlando Fast Pass"
        description="Crie seu roteiro personalizado para Orlando com base nas suas preferências. IA gera um plano dia a dia."
      />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-8 md:p-12"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
              {/* Icon */}
              <div className="shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                  <MapPin className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    Powered by AI
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Roteiro Personalizado
                </h1>
                
                <p className="text-muted-foreground text-lg max-w-xl">
                  Responda algumas perguntas e nossa inteligência artificial criará um 
                  <span className="text-foreground font-medium"> roteiro exclusivo </span> 
                  para sua viagem a Orlando, dia a dia.
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Planejamento dia a dia</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Adaptado ao seu grupo</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="shrink-0">
                <Button
                  size="lg"
                  onClick={handleCreateNew}
                  disabled={isCreating}
                  className="gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  {isCreating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Criar Novo Roteiro
                </Button>
              </div>
            </div>
          </motion.section>

          {/* Recent Itineraries Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Seus Roteiros</h2>
              {itineraries && itineraries.length > 0 && (
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  Ver todos
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-0 shadow-md bg-card/50 backdrop-blur">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : itineraries && itineraries.length > 0 ? (
              <div className="grid gap-4">
                {itineraries.map((itinerary, index) => (
                  <motion.div
                    key={itinerary.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card 
                      className="border-0 shadow-md bg-card/50 backdrop-blur hover:shadow-lg hover:bg-card/80 transition-all cursor-pointer group"
                      onClick={() => navigate(`/roteiro-personalizado/${itinerary.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-primary" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">
                                {itinerary.title || itinerary.destination || "Orlando"}
                              </h3>
                              {itinerary.is_favorite && (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {itinerary.start_date && itinerary.end_date ? (
                                <>
                                  {format(new Date(itinerary.start_date), "dd MMM", { locale: ptBR })}
                                  {" - "}
                                  {format(new Date(itinerary.end_date), "dd MMM yyyy", { locale: ptBR })}
                                  {itinerary.total_days && (
                                    <span className="ml-2">• {itinerary.total_days} dias</span>
                                  )}
                                </>
                              ) : (
                                "Datas não definidas"
                              )}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <Badge 
                            variant={itinerary.generated_itinerary ? "default" : "secondary"}
                            className={itinerary.generated_itinerary 
                              ? "bg-green-500/10 text-green-600 border-green-500/20" 
                              : ""
                            }
                          >
                            {itinerary.generated_itinerary ? "Gerado" : "Rascunho"}
                          </Badge>

                          {/* Arrow */}
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed border-muted-foreground/20 bg-transparent">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Nenhum roteiro criado</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                    Crie seu primeiro roteiro personalizado e deixe a IA planejar sua viagem perfeita para Orlando.
                  </p>
                  <Button onClick={handleCreateNew} disabled={isCreating} className="gap-2">
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Criar Primeiro Roteiro
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.section>

          {/* Features Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid sm:grid-cols-3 gap-4 pt-4"
          >
            {[
              {
                icon: "🎯",
                title: "Personalizado",
                description: "Baseado no seu perfil e preferências",
              },
              {
                icon: "⚡",
                title: "Otimizado",
                description: "Melhor sequência de parques e atividades",
              },
              {
                icon: "💡",
                title: "Dicas Exclusivas",
                description: "Horários, restaurantes e truques",
              },
            ].map((feature, index) => (
              <Card 
                key={index}
                className="border-0 shadow-sm bg-card/30 backdrop-blur hover:bg-card/50 transition-all"
              >
                <CardContent className="p-4 text-center">
                  <span className="text-2xl mb-2 block">{feature.icon}</span>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.section>
        </div>
      </div>
    </AppLayout>
  );
}
