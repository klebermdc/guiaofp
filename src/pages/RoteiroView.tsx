import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, Users, MapPin, Clock, Utensils, Lightbulb,
  DollarSign, Loader2, Sparkles, ChevronDown, ChevronUp, Castle,
  Film, Fish, ShoppingBag, Bed, Star, AlertCircle, RefreshCw, Download
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  duration_minutes: number;
  tips?: string;
}

interface Meal {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  time: string;
  restaurant: string;
  location: string;
  tip?: string;
}

interface DayPlan {
  day_number: number;
  date: string;
  title: string;
  theme: "disney" | "universal" | "seaworld" | "shopping" | "rest" | "other";
  activities: Activity[];
  meals: Meal[];
  notes?: string;
}

interface GeneratedItinerary {
  days: DayPlan[];
  general_tips: string[];
  estimated_budget: {
    parks_tickets: number;
    meals: number;
    transportation: number;
    extras: number;
    total: number;
  };
}

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  total_days: number;
  travelers: { adults_count: number; children_count: number; children_ages: number[] };
  generated_itinerary: GeneratedItinerary | null;
}

const themeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  disney: { icon: Castle, color: "bg-blue-500", label: "Disney" },
  universal: { icon: Film, color: "bg-purple-500", label: "Universal" },
  seaworld: { icon: Fish, color: "bg-cyan-500", label: "SeaWorld" },
  shopping: { icon: ShoppingBag, color: "bg-pink-500", label: "Compras" },
  rest: { icon: Bed, color: "bg-green-500", label: "Descanso" },
  other: { icon: Star, color: "bg-amber-500", label: "Outro" },
};

const mealTypeLabels: Record<string, string> = {
  breakfast: "Café da Manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
};

export default function RoteiroView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const { data: itinerary, isLoading, error, refetch } = useQuery({
    queryKey: ["itinerary", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as Itinerary;
    },
    enabled: !!id,
  });

  const handleGenerate = async () => {
    if (!id) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulated progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke("generate-personalized-itinerary", {
        body: { itinerary_id: id },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGenerationProgress(100);
      toast.success("Roteiro gerado com sucesso!");
      refetch();
    } catch (err) {
      console.error("Error generating itinerary:", err);
      toast.error(err instanceof Error ? err.message : "Erro ao gerar roteiro");
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Export itinerary as PDF
  const handleExportPDF = () => {
    if (!itinerary || !generated) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text(itinerary.title || 'Meu Roteiro Orlando', pageWidth / 2, 20, { align: 'center' });

    // Dates
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const dateRange = `${format(new Date(itinerary.start_date), 'dd/MM/yyyy')} - ${format(new Date(itinerary.end_date), 'dd/MM/yyyy')} (${itinerary.total_days} dias)`;
    doc.text(dateRange, pageWidth / 2, 28, { align: 'center' });

    let yPosition = 40;

    generated.days.forEach((day) => {
      // Check page break
      if (yPosition > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Day header
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text(`Dia ${day.day_number} - ${day.title}`, 14, yPosition);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(day.date, 14, yPosition + 6);
      yPosition += 12;

      // Activities table
      const tableData = day.activities.map(act => [
        act.time,
        act.title,
        act.location,
        `${act.duration_minutes}min`,
      ]);

      if (tableData.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Horário', 'Atividade', 'Local', 'Duração']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 9 },
          bodyStyles: { fontSize: 9, cellPadding: 3 },
          margin: { left: 14, right: 14 },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 5;
      }

      // Meals
      if (day.meals && day.meals.length > 0) {
        const mealData = day.meals.map(meal => [
          meal.time,
          mealTypeLabels[meal.type] || meal.type,
          meal.restaurant,
          meal.location,
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Horário', 'Refeição', 'Restaurante', 'Local']],
          body: mealData,
          theme: 'striped',
          headStyles: { fillColor: [234, 88, 12], textColor: 255, fontSize: 9 },
          bodyStyles: { fontSize: 9, cellPadding: 3 },
          margin: { left: 14, right: 14 },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      } else {
        yPosition += 5;
      }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')} | Guia Orlando Mágico`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`roteiro-personalizado-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF do roteiro baixado com sucesso!');
  };

  // Auto-generate if no itinerary exists
  useEffect(() => {
    if (itinerary && !itinerary.generated_itinerary && !isGenerating) {
      handleGenerate();
    }
  }, [itinerary]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error || !itinerary) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Roteiro não encontrado</h2>
              <p className="text-muted-foreground mb-4">
                O roteiro solicitado não existe ou você não tem permissão para visualizá-lo.
              </p>
              <Button onClick={() => navigate("/roteiro-personalizado")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const generated = itinerary.generated_itinerary;

  return (
    <AppLayout>
      <SEO
        title={`${itinerary.title || "Roteiro"} | Guia Orlando Fast Pass`}
        description="Seu roteiro personalizado para Orlando"
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/roteiro-personalizado")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{itinerary.title || "Meu Roteiro"}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(itinerary.start_date), "dd MMM", { locale: ptBR })} - {format(new Date(itinerary.end_date), "dd MMM yyyy", { locale: ptBR })}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {itinerary.travelers.adults_count + itinerary.travelers.children_count} pessoas
                </span>
              </div>
            </div>
            {generated && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className={`w-4 h-4 mr-2`} />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                  Regenerar
                </Button>
              </div>
            )}
          </div>

          {/* Generating State */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary-foreground animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Gerando seu roteiro...</h3>
                      <p className="text-sm text-muted-foreground">
                        Nossa IA está criando um roteiro personalizado para você
                      </p>
                    </div>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Isso pode levar alguns segundos...
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* No Generated Itinerary Yet */}
          {!generated && !isGenerating && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Roteiro ainda não gerado</h3>
                <p className="text-muted-foreground mb-4">
                  Clique abaixo para gerar seu roteiro personalizado com IA
                </p>
                <Button onClick={handleGenerate}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Roteiro
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Generated Itinerary */}
          {generated && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Budget Overview */}
                {generated.estimated_budget && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        Orçamento Estimado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Ingressos</p>
                          <p className="font-semibold">R${generated.estimated_budget.parks_tickets.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Alimentação</p>
                          <p className="font-semibold">R${generated.estimated_budget.meals.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Transporte</p>
                          <p className="font-semibold">${generated.estimated_budget.transportation}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Extras</p>
                          <p className="font-semibold">${generated.estimated_budget.extras}</p>
                        </div>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <p className="text-sm text-muted-foreground">Total Estimado</p>
                        <p className="text-2xl font-bold text-primary">
                          ${generated.estimated_budget.total.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Days */}
                <Accordion type="single" collapsible defaultValue="day-1" className="space-y-4">
                  {generated.days.map((day, index) => {
                    const theme = themeConfig[day.theme] || themeConfig.other;
                    const ThemeIcon = theme.icon;

                    return (
                      <AccordionItem
                        key={day.day_number}
                        value={`day-${day.day_number}`}
                        className="border rounded-lg overflow-hidden bg-card"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-10 h-10 rounded-lg ${theme.color} flex items-center justify-center text-white shrink-0`}>
                              <ThemeIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">Dia {day.day_number}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {day.date}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{day.title}</p>
                            </div>
                            <Badge variant="outline" className="hidden sm:flex">
                              {day.activities.length} atividades
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          {/* Activities Timeline */}
                          <div className="relative pl-6 border-l-2 border-primary/20 space-y-4 mt-4">
                            {day.activities.map((activity, actIndex) => (
                              <motion.div
                                key={actIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: actIndex * 0.1 }}
                                className="relative"
                              >
                                <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-primary border-2 border-background" />
                                <Card className="bg-muted/30">
                                  <CardContent className="p-3">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div>
                                        <Badge variant="outline" className="text-xs mb-1">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {activity.time}
                                        </Badge>
                                        <h4 className="font-medium">{activity.title}</h4>
                                      </div>
                                      <Badge variant="secondary" className="text-xs shrink-0">
                                        {activity.duration_minutes} min
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {activity.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <MapPin className="w-3 h-3" />
                                      {activity.location}
                                    </div>
                                    {activity.tips && (
                                      <div className="mt-2 p-2 bg-amber-500/10 rounded text-xs flex items-start gap-2">
                                        <Lightbulb className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                                        <span>{activity.tips}</span>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* Meals */}
                          {day.meals && day.meals.length > 0 && (
                            <div className="mt-6">
                              <h4 className="font-medium flex items-center gap-2 mb-3">
                                <Utensils className="w-4 h-4 text-orange-500" />
                                Refeições
                              </h4>
                              <div className="grid gap-2">
                                {day.meals.map((meal, mealIndex) => (
                                  <div
                                    key={mealIndex}
                                    className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
                                  >
                                    <Badge variant="secondary" className="text-xs shrink-0">
                                      {meal.time}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {mealTypeLabels[meal.type]}: {meal.restaurant}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {meal.location}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Day Notes */}
                          {day.notes && (
                            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                              <p className="text-sm">{day.notes}</p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>

                {/* General Tips */}
                {generated.general_tips && generated.general_tips.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        Dicas Gerais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {generated.general_tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-primary font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
