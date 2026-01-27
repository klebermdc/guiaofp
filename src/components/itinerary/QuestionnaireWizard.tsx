import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarIcon, ChevronLeft, ChevronRight, Users, Wallet, Plane, Compass, Sparkles, 
  Plus, Minus, Car, Building, MapPin, Ticket, ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const questionnaireSchema = z.object({
  // Step 1-6
  startDate: z.date({ required_error: "Selecione a data de ida" }),
  endDate: z.date({ required_error: "Selecione a data de volta" }),
  adultsCount: z.number().min(1, "Mínimo 1 adulto").max(20),
  childrenCount: z.number().min(0).max(15),
  childrenAges: z.array(z.number().min(0).max(17)),
  budgetLevel: z.enum(["economico", "moderado", "confortavel", "premium"], {
    required_error: "Selecione o orçamento",
  }),
  isFirstTrip: z.boolean(),
  travelStyle: z.enum(["tranquilo", "equilibrado", "agitado", "focado_parques", "focado_compras"], {
    required_error: "Selecione o estilo de viagem",
  }),
  parksInterestLevel: z.enum(["altissimo", "alto", "moderado", "baixo"], {
    required_error: "Selecione o nível de interesse",
  }),
  // Step 7-12
  airportTransfer: z.enum(["uber_lyft", "aluguel_carro", "transfer_hotel", "transporte_contratado", "nao_definido"], {
    required_error: "Selecione o transporte",
  }),
  willRentCar: z.enum(["sim", "nao", "talvez"], {
    required_error: "Selecione uma opção",
  }),
  stayingRegion: z.enum(["international_drive", "kissimmee", "lake_buena_vista", "orlando_downtown", "universal_area", "outro"], {
    required_error: "Selecione a região",
  }),
  accommodationType: z.enum(["hotel_economico", "hotel_medio", "hotel_luxo", "resort_disney", "resort_universal", "casa_airbnb", "outro"], {
    required_error: "Selecione o tipo",
  }),
  selectedParks: z.array(z.string()).min(1, "Selecione pelo menos um parque"),
  additionalActivities: z.array(z.string()),
});

export type QuestionnaireFormData = z.infer<typeof questionnaireSchema>;

interface QuestionnaireWizardProps {
  onComplete: (data: QuestionnaireFormData) => void;
  isLoading?: boolean;
}

const TOTAL_STEPS = 12;

const budgetOptions = [
  { value: "economico", label: "Econômico", description: "Até $150/dia" },
  { value: "moderado", label: "Moderado", description: "$150-300/dia" },
  { value: "confortavel", label: "Confortável", description: "$300-500/dia" },
  { value: "premium", label: "Premium", description: "$500+/dia" },
];

const travelStyleOptions = [
  { value: "tranquilo", label: "Tranquilo", emoji: "🧘" },
  { value: "equilibrado", label: "Equilibrado", emoji: "⚖️" },
  { value: "agitado", label: "Agitado", emoji: "🏃" },
  { value: "focado_parques", label: "Focado em Parques", emoji: "🎢" },
  { value: "focado_compras", label: "Focado em Compras", emoji: "🛍️" },
];

const parksInterestOptions = [
  { value: "altissimo", label: "Altíssimo", emoji: "🔥", description: "Quero todos os parques!" },
  { value: "alto", label: "Alto", emoji: "⭐", description: "Parques são prioridade" },
  { value: "moderado", label: "Moderado", emoji: "👍", description: "Alguns parques" },
  { value: "baixo", label: "Baixo", emoji: "🌴", description: "Prefiro outras atividades" },
];

const airportTransferOptions = [
  { value: "uber_lyft", label: "Uber / Lyft", emoji: "🚗" },
  { value: "aluguel_carro", label: "Já vou alugar carro", emoji: "🚙" },
  { value: "transfer_hotel", label: "Transfer do hotel", emoji: "🚐" },
  { value: "transporte_contratado", label: "Transporte contratado", emoji: "🚌" },
  { value: "nao_definido", label: "Ainda não decidi", emoji: "🤔" },
];

const rentCarOptions = [
  { value: "sim", label: "Sim, vou alugar", emoji: "✅", description: "Mais liberdade de locomoção" },
  { value: "nao", label: "Não vou alugar", emoji: "❌", description: "Usarei Uber/transporte" },
  { value: "talvez", label: "Ainda pensando", emoji: "🤔", description: "Preciso avaliar" },
];

const stayingRegionOptions = [
  { value: "international_drive", label: "International Drive", description: "Área turística central" },
  { value: "kissimmee", label: "Kissimmee", description: "Próximo à Disney" },
  { value: "lake_buena_vista", label: "Lake Buena Vista", description: "Dentro do complexo Disney" },
  { value: "orlando_downtown", label: "Orlando Downtown", description: "Centro de Orlando" },
  { value: "universal_area", label: "Área Universal", description: "Próximo aos parques Universal" },
  { value: "outro", label: "Outra região", description: "Não está na lista" },
];

const accommodationTypeOptions = [
  { value: "hotel_economico", label: "Hotel Econômico", emoji: "🏨" },
  { value: "hotel_medio", label: "Hotel Médio", emoji: "🏢" },
  { value: "hotel_luxo", label: "Hotel de Luxo", emoji: "✨" },
  { value: "resort_disney", label: "Resort Disney", emoji: "🏰" },
  { value: "resort_universal", label: "Resort Universal", emoji: "🎬" },
  { value: "casa_airbnb", label: "Casa / Airbnb", emoji: "🏠" },
  { value: "outro", label: "Outro", emoji: "📍" },
];

const parksOptions = [
  { value: "magic_kingdom", label: "Magic Kingdom", emoji: "🏰" },
  { value: "epcot", label: "EPCOT", emoji: "🌍" },
  { value: "hollywood_studios", label: "Hollywood Studios", emoji: "🎬" },
  { value: "animal_kingdom", label: "Animal Kingdom", emoji: "🦁" },
  { value: "universal_studios", label: "Universal Studios", emoji: "🎥" },
  { value: "islands_of_adventure", label: "Islands of Adventure", emoji: "🦖" },
  { value: "epic_universe", label: "Epic Universe", emoji: "🌟" },
  { value: "volcano_bay", label: "Volcano Bay", emoji: "🌋" },
  { value: "seaworld", label: "SeaWorld", emoji: "🐬" },
  { value: "busch_gardens", label: "Busch Gardens", emoji: "🎢" },
  { value: "legoland", label: "LEGOLAND", emoji: "🧱" },
  { value: "aquatica", label: "Aquatica", emoji: "💦" },
];

const additionalActivitiesOptions = [
  { value: "compras_outlets", label: "Compras em Outlets", emoji: "🛍️" },
  { value: "compras_shopping", label: "Compras em Shoppings", emoji: "🏬" },
  { value: "restaurantes_finos", label: "Restaurantes Finos", emoji: "🍽️" },
  { value: "kennedy_space", label: "Kennedy Space Center", emoji: "🚀" },
  { value: "airboat", label: "Passeio de Airboat", emoji: "🐊" },
  { value: "golfe", label: "Golfe", emoji: "⛳" },
  { value: "basketball_nba", label: "Jogo da NBA", emoji: "🏀" },
  { value: "disney_springs", label: "Disney Springs", emoji: "🎭" },
  { value: "universal_citywalk", label: "Universal CityWalk", emoji: "🎤" },
  { value: "spa_relaxamento", label: "Spa / Relaxamento", emoji: "💆" },
  { value: "fotos_profissionais", label: "Ensaio Fotográfico", emoji: "📸" },
  { value: "dia_piscina", label: "Dia de Piscina", emoji: "🏊" },
];

export function QuestionnaireWizard({ onComplete, isLoading }: QuestionnaireWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      adultsCount: 2,
      childrenCount: 0,
      childrenAges: [],
      isFirstTrip: true,
      budgetLevel: "moderado",
      travelStyle: "equilibrado",
      parksInterestLevel: "alto",
      airportTransfer: "nao_definido",
      willRentCar: "talvez",
      stayingRegion: "international_drive",
      accommodationType: "hotel_medio",
      selectedParks: [],
      additionalActivities: [],
    },
  });

  const watchedChildrenCount = form.watch("childrenCount");
  const watchedChildrenAges = form.watch("childrenAges");
  const watchedSelectedParks = form.watch("selectedParks");
  const watchedAdditionalActivities = form.watch("additionalActivities");

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await form.trigger(["startDate", "endDate"]);
        break;
      case 2:
        isValid = await form.trigger(["adultsCount", "childrenCount", "childrenAges"]);
        break;
      case 3:
        isValid = await form.trigger("budgetLevel");
        break;
      case 4:
        isValid = await form.trigger("isFirstTrip");
        break;
      case 5:
        isValid = await form.trigger("travelStyle");
        break;
      case 6:
        isValid = await form.trigger("parksInterestLevel");
        break;
      case 7:
        isValid = await form.trigger("airportTransfer");
        break;
      case 8:
        isValid = await form.trigger("willRentCar");
        break;
      case 9:
        isValid = await form.trigger("stayingRegion");
        break;
      case 10:
        isValid = await form.trigger("accommodationType");
        break;
      case 11:
        isValid = await form.trigger("selectedParks");
        break;
      case 12:
        isValid = await form.trigger("additionalActivities");
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      } else {
        form.handleSubmit(onComplete)();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateChildrenAges = (index: number, age: number) => {
    const newAges = [...watchedChildrenAges];
    newAges[index] = age;
    form.setValue("childrenAges", newAges);
  };

  const handleChildrenCountChange = (delta: number) => {
    const newCount = Math.max(0, Math.min(15, watchedChildrenCount + delta));
    form.setValue("childrenCount", newCount);
    
    // Adjust ages array
    const currentAges = [...watchedChildrenAges];
    if (newCount > currentAges.length) {
      // Add new ages with default value
      while (currentAges.length < newCount) {
        currentAges.push(5);
      }
    } else if (newCount < currentAges.length) {
      // Remove extra ages
      currentAges.splice(newCount);
    }
    form.setValue("childrenAges", currentAges);
  };

  const stepVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i + 1 === currentStep
                    ? "w-8 bg-primary"
                    : i + 1 < currentStep
                    ? "w-2 bg-primary/60"
                    : "w-2 bg-muted"
                )}
              />
            ))}
          </div>
          <Badge variant="secondary" className="text-xs">
            {currentStep} de {TOTAL_STEPS}
          </Badge>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Dates */}
            {currentStep === 1 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <CalendarIcon className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Quando será sua viagem?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Selecione as datas de ida e volta
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Ida</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal h-11",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd 'de' MMMM, yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Volta</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal h-11",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd 'de' MMMM, yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => {
                                  const startDate = form.getValues("startDate");
                                  return date < (startDate || new Date());
                                }}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Group Size */}
            {currentStep === 2 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Quantas pessoas vão?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Informe o número de adultos e crianças
                    </p>
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="adultsCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adultos (18+)</FormLabel>
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => field.onChange(Math.max(1, field.value - 1))}
                              disabled={field.value <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-2xl font-semibold w-12 text-center">
                              {field.value}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => field.onChange(Math.min(20, field.value + 1))}
                              disabled={field.value >= 20}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="childrenCount"
                      render={() => (
                        <FormItem>
                          <FormLabel>Crianças (0-17 anos)</FormLabel>
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleChildrenCountChange(-1)}
                              disabled={watchedChildrenCount <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-2xl font-semibold w-12 text-center">
                              {watchedChildrenCount}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleChildrenCountChange(1)}
                              disabled={watchedChildrenCount >= 15}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchedChildrenCount > 0 && (
                      <div className="space-y-3">
                        <FormLabel>Idade das crianças</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Array.from({ length: watchedChildrenCount }).map((_, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                Criança {index + 1}:
                              </span>
                              <Input
                                type="number"
                                min={0}
                                max={17}
                                value={watchedChildrenAges[index] || 0}
                                onChange={(e) => updateChildrenAges(index, parseInt(e.target.value) || 0)}
                                className="w-16 h-9"
                              />
                              <span className="text-sm text-muted-foreground">anos</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Budget */}
            {currentStep === 3 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Wallet className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Qual seu orçamento por pessoa?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Isso nos ajuda a recomendar atrações e restaurantes
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="budgetLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid gap-3">
                            {budgetOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  "flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left",
                                  field.value === option.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <span className="font-medium">{option.label}</span>
                                <span className="text-sm text-muted-foreground">
                                  {option.description}
                                </span>
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: First Trip */}
            {currentStep === 4 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Plane className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">É sua primeira viagem para Orlando?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Isso nos ajuda a sugerir experiências essenciais ou novidades
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="isFirstTrip"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => field.onChange(true)}
                              className={cn(
                                "flex flex-col items-center p-6 rounded-xl border-2 transition-all",
                                field.value === true
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <span className="text-4xl mb-2">✨</span>
                              <span className="font-semibold">Sim!</span>
                              <span className="text-xs text-muted-foreground mt-1">
                                Primeira vez
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange(false)}
                              className={cn(
                                "flex flex-col items-center p-6 rounded-xl border-2 transition-all",
                                field.value === false
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <span className="text-4xl mb-2">🎢</span>
                              <span className="font-semibold">Não</span>
                              <span className="text-xs text-muted-foreground mt-1">
                                Já fui antes
                              </span>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 5: Travel Style */}
            {currentStep === 5 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Compass className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Qual seu estilo de viagem?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Isso define o ritmo do seu roteiro
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="travelStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid gap-3">
                            {travelStyleOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                                  field.value === option.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <span className="text-2xl">{option.emoji}</span>
                                <span className="font-medium">{option.label}</span>
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 6: Parks Interest */}
            {currentStep === 6 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Nível de interesse em parques?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Quanto tempo você quer dedicar aos parques temáticos?
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="parksInterestLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid gap-3">
                            {parksInterestOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                                  field.value === option.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <span className="text-2xl">{option.emoji}</span>
                                <div>
                                  <span className="font-medium block">{option.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {option.description}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 7: Airport Transfer */}
            {currentStep === 7 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Plane className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Transporte aeroporto → hotel?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Como você vai do aeroporto para o hotel?
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="airportTransfer"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid gap-3">
                            {airportTransferOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                                  field.value === option.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <span className="text-2xl">{option.emoji}</span>
                                <span className="font-medium">{option.label}</span>
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 8: Rent Car */}
            {currentStep === 8 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Vai alugar carro?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Isso influencia na logística do roteiro
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="willRentCar"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid gap-3">
                            {rentCarOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                                  field.value === option.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <span className="text-2xl">{option.emoji}</span>
                                <div>
                                  <span className="font-medium block">{option.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {option.description}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 9: Staying Region */}
            {currentStep === 9 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Região de hospedagem?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Onde você vai ficar em Orlando?
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="stayingRegion"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid gap-3">
                            {stayingRegionOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  "flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left",
                                  field.value === option.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <span className="font-medium">{option.label}</span>
                                <span className="text-sm text-muted-foreground">
                                  {option.description}
                                </span>
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 10: Accommodation Type */}
            {currentStep === 10 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Tipo de hospedagem?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Onde você vai se hospedar?
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="accommodationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-3">
                            {accommodationTypeOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  "flex flex-col items-center p-4 rounded-lg border-2 transition-all",
                                  field.value === option.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <span className="text-2xl mb-1">{option.emoji}</span>
                                <span className="font-medium text-sm text-center">{option.label}</span>
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 11: Selected Parks */}
            {currentStep === 11 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Ticket className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Quais parques quer visitar?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Selecione todos os parques de interesse
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="selectedParks"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-3">
                            {parksOptions.map((option) => {
                              const isChecked = watchedSelectedParks.includes(option.value);
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    const current = watchedSelectedParks;
                                    const updated = isChecked
                                      ? current.filter((v) => v !== option.value)
                                      : [...current, option.value];
                                    form.setValue("selectedParks", updated);
                                  }}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                                    isChecked
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  <Checkbox checked={isChecked} className="pointer-events-none" />
                                  <span className="text-lg">{option.emoji}</span>
                                  <span className="font-medium text-sm">{option.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedSelectedParks.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-sm text-muted-foreground">Selecionados:</span>
                      {watchedSelectedParks.map((park) => {
                        const parkInfo = parksOptions.find((p) => p.value === park);
                        return (
                          <Badge key={park} variant="secondary" className="text-xs">
                            {parkInfo?.emoji} {parkInfo?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 12: Additional Activities */}
            {currentStep === 12 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Atividades além dos parques?</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      O que mais você gostaria de fazer? (opcional)
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="additionalActivities"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-3">
                            {additionalActivitiesOptions.map((option) => {
                              const isChecked = watchedAdditionalActivities.includes(option.value);
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    const current = watchedAdditionalActivities;
                                    const updated = isChecked
                                      ? current.filter((v) => v !== option.value)
                                      : [...current, option.value];
                                    form.setValue("additionalActivities", updated);
                                  }}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                                    isChecked
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  <Checkbox checked={isChecked} className="pointer-events-none" />
                                  <span className="text-lg">{option.emoji}</span>
                                  <span className="font-medium text-sm">{option.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedAdditionalActivities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-sm text-muted-foreground">Selecionados:</span>
                      {watchedAdditionalActivities.map((activity) => {
                        const activityInfo = additionalActivitiesOptions.find((a) => a.value === activity);
                        return (
                          <Badge key={activity} variant="secondary" className="text-xs">
                            {activityInfo?.emoji} {activityInfo?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="gap-2"
          >
            {currentStep === TOTAL_STEPS ? (
              isLoading ? "Gerando..." : "Gerar Roteiro"
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
