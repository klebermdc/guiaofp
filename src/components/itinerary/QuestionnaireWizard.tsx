import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarIcon, ChevronLeft, ChevronRight, Users, Wallet, Compass, 
  Plus, Minus, Car, Ticket, Loader2, Save, Check, CreditCard, Hotel
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TicketUploadSection } from "./TicketUploadSection";
import { HotelSection } from "./HotelSection";

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
import { Progress } from "@/components/ui/progress";

const STORAGE_KEY = "roteiro-questionario-draft";

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  if (typeof value === "string") {
    return value ? [value] : [];
  }
  return [];
}

function normalizeNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "number" ? v : Number(v)))
    .filter((v) => Number.isFinite(v));
}

function normalizeDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function SelectionIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-transparent"
      )}
    >
      {checked ? <Check className="h-4 w-4" /> : null}
    </span>
  );
}

const questionnaireSchema = z.object({
  startDate: z.date({ required_error: "Selecione a data de ida" }),
  endDate: z.date({ required_error: "Selecione a data de volta" }),
  adultsCount: z.number().min(1, "Mínimo 1 adulto").max(20),
  childrenCount: z.number().min(0).max(15),
  childrenAges: z.array(z.number().min(0).max(17)),
  budgetLevel: z.enum(["economico", "moderado", "confortavel", "premium"]),
  isFirstTrip: z.boolean(),
  travelStyle: z.enum(["tranquilo", "equilibrado", "agitado", "focado_parques", "focado_compras"]),
  parksInterestLevel: z.enum(["altissimo", "alto", "moderado", "baixo"]),
  airportTransfer: z.enum(["uber_lyft", "aluguel_carro", "transfer_hotel", "transporte_contratado", "nao_definido"]),
  willRentCar: z.enum(["sim", "nao", "talvez"]),
  stayingRegion: z.enum(["international_drive", "kissimmee", "lake_buena_vista", "orlando_downtown", "universal_area", "outro"]),
  accommodationType: z.enum(["hotel_economico", "hotel_medio", "hotel_luxo", "resort_disney", "resort_universal", "casa_airbnb", "outro"]),
  selectedParks: z.array(z.string()).min(1, "Selecione pelo menos um parque"),
  additionalActivities: z.array(z.string()),
  // Step 7: Tickets
  hasTickets: z.boolean().nullable(),
  ticketTypes: z.array(z.string()),
  ticketDays: z.number().min(0).max(14),
  ticketStartDate: z.string(),
  ticketUploadedUrls: z.array(z.string()),
  // Step 8: Hotel
  hasHotel: z.boolean().nullable(),
  hotelName: z.string(),
  hotelAddress: z.string(),
  hotelCheckIn: z.string(),
  hotelCheckOut: z.string(),
  hotelVoucherUrl: z.string(),
});

export type QuestionnaireFormData = z.infer<typeof questionnaireSchema>;

interface QuestionnaireWizardProps {
  onComplete: (data: QuestionnaireFormData) => void;
  isLoading?: boolean;
}

const TOTAL_STEPS = 8;

const stepConfig = [
  { title: "Datas da Viagem", icon: CalendarIcon },
  { title: "Quem Vai Viajar", icon: Users },
  { title: "Orçamento e Perfil", icon: Wallet },
  { title: "Estilo de Viagem", icon: Compass },
  { title: "Transporte e Hospedagem", icon: Car },
  { title: "Parques e Atividades", icon: Ticket },
  { title: "Ingressos Disney", icon: CreditCard },
  { title: "Hospedagem", icon: Hotel },
];

const budgetOptions = [
  { value: "economico", label: "Econômico", description: "Até $150/dia", emoji: "💵" },
  { value: "moderado", label: "Moderado", description: "$150-300/dia", emoji: "💳" },
  { value: "confortavel", label: "Confortável", description: "$300-500/dia", emoji: "💎" },
  { value: "premium", label: "Premium", description: "$500+/dia", emoji: "👑" },
];

const travelStyleOptions = [
  { value: "tranquilo", label: "Tranquilo", emoji: "🧘", description: "Sem pressa" },
  { value: "equilibrado", label: "Equilibrado", emoji: "⚖️", description: "Mix de atividades" },
  { value: "agitado", label: "Agitado", emoji: "🏃", description: "Máximo de atrações" },
  { value: "focado_parques", label: "Focado em Parques", emoji: "🎢", description: "Prioridade total" },
  { value: "focado_compras", label: "Focado em Compras", emoji: "🛍️", description: "Outlets e shopping" },
];

const parksInterestOptions = [
  { value: "altissimo", label: "Altíssimo", emoji: "🔥", description: "Todos os parques!" },
  { value: "alto", label: "Alto", emoji: "⭐", description: "Parques são prioridade" },
  { value: "moderado", label: "Moderado", emoji: "👍", description: "Alguns parques" },
  { value: "baixo", label: "Baixo", emoji: "🌴", description: "Outras atividades" },
];

const airportTransferOptions = [
  { value: "uber_lyft", label: "Uber / Lyft", emoji: "🚗" },
  { value: "aluguel_carro", label: "Alugar carro", emoji: "🚙" },
  { value: "transfer_hotel", label: "Transfer hotel", emoji: "🚐" },
  { value: "transporte_contratado", label: "Contratado", emoji: "🚌" },
  { value: "nao_definido", label: "Não decidi", emoji: "🤔" },
];

const rentCarOptions = [
  { value: "sim", label: "Sim", emoji: "✅" },
  { value: "nao", label: "Não", emoji: "❌" },
  { value: "talvez", label: "Talvez", emoji: "🤔" },
];

const stayingRegionOptions = [
  { value: "international_drive", label: "International Drive" },
  { value: "kissimmee", label: "Kissimmee" },
  { value: "lake_buena_vista", label: "Lake Buena Vista" },
  { value: "orlando_downtown", label: "Orlando Downtown" },
  { value: "universal_area", label: "Área Universal" },
  { value: "outro", label: "Outra região" },
];

const accommodationTypeOptions = [
  { value: "hotel_economico", label: "Hotel Econômico", emoji: "🏨" },
  { value: "hotel_medio", label: "Hotel Médio", emoji: "🏢" },
  { value: "hotel_luxo", label: "Hotel Luxo", emoji: "✨" },
  { value: "resort_disney", label: "Resort Disney", emoji: "🏰" },
  { value: "resort_universal", label: "Resort Universal", emoji: "🎬" },
  { value: "casa_airbnb", label: "Casa/Airbnb", emoji: "🏠" },
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
  { value: "compras_outlets", label: "Outlets", emoji: "🛍️" },
  { value: "compras_shopping", label: "Shoppings", emoji: "🏬" },
  { value: "restaurantes_finos", label: "Restaurantes", emoji: "🍽️" },
  { value: "kennedy_space", label: "Kennedy Space", emoji: "🚀" },
  { value: "airboat", label: "Airboat", emoji: "🐊" },
  { value: "golfe", label: "Golfe", emoji: "⛳" },
  { value: "basketball_nba", label: "Jogo NBA", emoji: "🏀" },
  { value: "disney_springs", label: "Disney Springs", emoji: "🎭" },
  { value: "universal_citywalk", label: "CityWalk", emoji: "🎤" },
  { value: "spa_relaxamento", label: "Spa", emoji: "💆" },
  { value: "fotos_profissionais", label: "Ensaio Foto", emoji: "📸" },
  { value: "dia_piscina", label: "Piscina", emoji: "🏊" },
];

export function QuestionnaireWizard({ onComplete, isLoading }: QuestionnaireWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  const loadSavedDraft = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed || typeof parsed !== "object") return null;

        // Normalize (defensive) to avoid crashes from older/corrupted drafts
        const draft = {
          ...parsed,
          startDate: normalizeDate((parsed as any).startDate),
          endDate: normalizeDate((parsed as any).endDate),
          adultsCount:
            typeof (parsed as any).adultsCount === "number"
              ? (parsed as any).adultsCount
              : Number((parsed as any).adultsCount) || 2,
          childrenCount:
            typeof (parsed as any).childrenCount === "number"
              ? (parsed as any).childrenCount
              : Number((parsed as any).childrenCount) || 0,
          childrenAges: normalizeNumberArray((parsed as any).childrenAges),
          selectedParks: normalizeStringArray((parsed as any).selectedParks),
          additionalActivities: normalizeStringArray((parsed as any).additionalActivities),
          // Step 7 fields
          hasTickets: typeof (parsed as any).hasTickets === "boolean" ? (parsed as any).hasTickets : null,
          ticketTypes: normalizeStringArray((parsed as any).ticketTypes),
          ticketDays: typeof (parsed as any).ticketDays === "number" ? (parsed as any).ticketDays : 0,
          ticketStartDate: typeof (parsed as any).ticketStartDate === "string" ? (parsed as any).ticketStartDate : "",
          ticketUploadedUrls: normalizeStringArray((parsed as any).ticketUploadedUrls),
          // Step 8 fields
          hasHotel: typeof (parsed as any).hasHotel === "boolean" ? (parsed as any).hasHotel : null,
          hotelName: typeof (parsed as any).hotelName === "string" ? (parsed as any).hotelName : "",
          hotelAddress: typeof (parsed as any).hotelAddress === "string" ? (parsed as any).hotelAddress : "",
          hotelCheckIn: typeof (parsed as any).hotelCheckIn === "string" ? (parsed as any).hotelCheckIn : "",
          hotelCheckOut: typeof (parsed as any).hotelCheckOut === "string" ? (parsed as any).hotelCheckOut : "",
          hotelVoucherUrl: typeof (parsed as any).hotelVoucherUrl === "string" ? (parsed as any).hotelVoucherUrl : "",
        };

        // Persist sanitized draft so the user doesn't get stuck in a crash loop
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        } catch {
          // ignore
        }

        return draft;
      }
    } catch (e) {
      console.error("Error loading draft:", e);
    }
    return null;
  };

  // Load draft only once (avoid heavy localStorage I/O on every render)
  const [savedDraft] = useState(() => loadSavedDraft());

  const form = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: savedDraft || {
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
      // Step 7 defaults
      hasTickets: null,
      ticketTypes: [],
      ticketDays: 0,
      ticketStartDate: "",
      ticketUploadedUrls: [],
      // Step 8 defaults
      hasHotel: null,
      hotelName: "",
      hotelAddress: "",
      hotelCheckIn: "",
      hotelCheckOut: "",
      hotelVoucherUrl: "",
    },
  });

  const watchedValues = form.watch();

  // Build itinerary context for ticket and hotel suggestions
  const itineraryContext = {
    selectedParks: watchedValues.selectedParks?.map(p => {
      const park = parksOptions.find(po => po.value === p);
      return park?.label || p;
    }) || [],
    duration: watchedValues.startDate && watchedValues.endDate 
      ? Math.ceil((watchedValues.endDate.getTime() - watchedValues.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 7,
    budget: budgetOptions.find(b => b.value === watchedValues.budgetLevel)?.label || "Moderado",
    parkInterest: parksInterestOptions.find(p => p.value === watchedValues.parksInterestLevel)?.label || "Alto",
    adultsCount: watchedValues.adultsCount || 2,
    childrenCount: watchedValues.childrenCount || 0,
    childrenAges: watchedValues.childrenAges || [],
    travelStyle: travelStyleOptions.find(t => t.value === watchedValues.travelStyle)?.label || "Equilibrado",
    // Additional context for hotel suggestions
    stayingRegion: stayingRegionOptions.find(r => r.value === watchedValues.stayingRegion)?.label || "International Drive",
    accommodationType: accommodationTypeOptions.find(a => a.value === watchedValues.accommodationType)?.label || "Hotel Médio",
  };

  // Auto-save to localStorage
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Debounce localStorage writes to avoid UI jank on mobile
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        } catch (e) {
          console.error("Error saving draft:", e);
        }
      }, 250);
    });
    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [form]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof QuestionnaireFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["startDate", "endDate"];
        break;
      case 2:
        fieldsToValidate = ["adultsCount", "childrenCount", "childrenAges"];
        break;
      case 3:
        fieldsToValidate = ["budgetLevel", "isFirstTrip"];
        break;
      case 4:
        fieldsToValidate = ["travelStyle", "parksInterestLevel"];
        break;
      case 5:
        fieldsToValidate = ["airportTransfer", "willRentCar", "stayingRegion", "accommodationType"];
        break;
      case 6:
        fieldsToValidate = ["selectedParks", "additionalActivities"];
        break;
      case 7:
        // Step 7 has no required validation - user can skip or complete tickets section
        fieldsToValidate = [];
        break;
      case 8:
        // Step 8 has no required validation - user can skip or complete hotel section
        fieldsToValidate = [];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        form.handleSubmit(onComplete)();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;
  const StepIcon = stepConfig[currentStep - 1]?.icon || CalendarIcon;

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Progress Header */}
        <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/80 sm:backdrop-blur sticky top-4 z-10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <StepIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Etapa {currentStep} de {TOTAL_STEPS}</p>
                  <h3 className="font-semibold">{stepConfig[currentStep - 1]?.title}</h3>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Save className="w-3 h-3" />
                Salvo
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 1: Dates */}
            {currentStep === 1 && (
              <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold">Quando será sua viagem?</h2>
                    <p className="text-muted-foreground text-sm mt-1">Selecione ida e volta</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Ida</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn("w-full pl-3 text-left h-11", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < new Date()} />
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
                        <FormItem>
                          <FormLabel>Data de Volta</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn("w-full pl-3 text-left h-11", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < (form.getValues("startDate") || new Date())} />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchedValues.startDate && watchedValues.endDate && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">Duração</p>
                      <p className="text-2xl font-bold text-primary">
                        {Math.ceil((watchedValues.endDate.getTime() - watchedValues.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} dias
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Group */}
            {currentStep === 2 && (
              <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold">Quem vai viajar?</h2>
                    <p className="text-muted-foreground text-sm mt-1">Adultos e crianças</p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="adultsCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adultos (18+)</FormLabel>
                          <div className="flex items-center gap-3">
                            <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(Math.max(1, field.value - 1))} disabled={field.value <= 1}><Minus className="w-4 h-4" /></Button>
                            <span className="text-2xl font-bold w-12 text-center">{field.value}</span>
                            <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(Math.min(20, field.value + 1))} disabled={field.value >= 20}><Plus className="w-4 h-4" /></Button>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="childrenCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crianças (0-17)</FormLabel>
                          <div className="flex items-center gap-3">
                            <Button type="button" variant="outline" size="icon" onClick={() => {
                              const n = Math.max(0, field.value - 1);
                              field.onChange(n);
                              form.setValue("childrenAges", form.getValues("childrenAges").slice(0, n));
                            }} disabled={field.value <= 0}><Minus className="w-4 h-4" /></Button>
                            <span className="text-2xl font-bold w-12 text-center">{field.value}</span>
                            <Button type="button" variant="outline" size="icon" onClick={() => {
                              const n = Math.min(15, field.value + 1);
                              field.onChange(n);
                              form.setValue("childrenAges", [...form.getValues("childrenAges"), 5]);
                            }} disabled={field.value >= 15}><Plus className="w-4 h-4" /></Button>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchedValues.childrenCount > 0 && (
                    <div className="space-y-2">
                      <FormLabel>Idade das crianças</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Array.from({ length: watchedValues.childrenCount }).map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">#{i + 1}:</span>
                            <Input type="number" min={0} max={17} value={watchedValues.childrenAges[i] || 0}
                              onChange={(e) => {
                                const ages = [...watchedValues.childrenAges];
                                ages[i] = Math.min(17, Math.max(0, parseInt(e.target.value) || 0));
                                form.setValue("childrenAges", ages);
                              }} className="w-16"
                            />
                            <span className="text-xs text-muted-foreground">anos</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Budget & Profile */}
            {currentStep === 3 && (
              <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold">Orçamento e Perfil</h2>
                  </div>

                  <FormField
                    control={form.control}
                    name="budgetLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Orçamento por pessoa/dia</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {budgetOptions.map((opt) => (
                            <button key={opt.value} type="button" onClick={() => field.onChange(opt.value)}
                              className={cn("flex flex-col items-center p-4 rounded-lg border-2 transition-all",
                                field.value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                              <span className="text-2xl mb-1">{opt.emoji}</span>
                              <span className="font-medium">{opt.label}</span>
                              <span className="text-xs text-muted-foreground">{opt.description}</span>
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFirstTrip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primeira vez em Orlando?</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          <button type="button" onClick={() => field.onChange(true)}
                            className={cn("flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                              field.value === true ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                            <span className="text-xl">🎉</span><span className="font-medium">Sim!</span>
                          </button>
                          <button type="button" onClick={() => field.onChange(false)}
                            className={cn("flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                              field.value === false ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                            <span className="text-xl">🔄</span><span className="font-medium">Já fui</span>
                          </button>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: Travel Style */}
            {currentStep === 4 && (
              <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold">Estilo de Viagem</h2>
                  </div>

                  <FormField
                    control={form.control}
                    name="travelStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu estilo</FormLabel>
                        <div className="grid gap-2">
                          {travelStyleOptions.map((opt) => (
                            <button key={opt.value} type="button" onClick={() => field.onChange(opt.value)}
                              className={cn("flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                                field.value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                              <span className="text-2xl">{opt.emoji}</span>
                              <div><span className="font-medium">{opt.label}</span><span className="text-xs text-muted-foreground ml-2">{opt.description}</span></div>
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parksInterestLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interesse em parques</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {parksInterestOptions.map((opt) => (
                            <button key={opt.value} type="button" onClick={() => field.onChange(opt.value)}
                              className={cn("flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                                field.value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                              <span className="text-xl mb-1">{opt.emoji}</span>
                              <span className="font-medium text-sm">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 5: Transportation & Accommodation */}
            {currentStep === 5 && (
              <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
                <CardContent className="pt-6 space-y-5">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold">Transporte e Hospedagem</h2>
                  </div>

                  <FormField
                    control={form.control}
                    name="airportTransfer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transporte aeroporto → hotel</FormLabel>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {airportTransferOptions.map((opt) => (
                            <button key={opt.value} type="button" onClick={() => field.onChange(opt.value)}
                              className={cn("flex flex-col items-center p-2 rounded-lg border-2 transition-all",
                                field.value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                              <span className="text-lg">{opt.emoji}</span>
                              <span className="text-[10px] font-medium text-center">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="willRentCar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alugar carro?</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {rentCarOptions.map((opt) => (
                            <button key={opt.value} type="button" onClick={() => field.onChange(opt.value)}
                              className={cn("flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                                field.value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                              <span className="text-xl">{opt.emoji}</span>
                              <span className="text-xs font-medium">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stayingRegion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Região de hospedagem</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {stayingRegionOptions.map((opt) => (
                            <button key={opt.value} type="button" onClick={() => field.onChange(opt.value)}
                              className={cn("p-2 rounded-lg border-2 transition-all text-sm font-medium",
                                field.value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accommodationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de hospedagem</FormLabel>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {accommodationTypeOptions.map((opt) => (
                            <button key={opt.value} type="button" onClick={() => field.onChange(opt.value)}
                              className={cn("flex flex-col items-center p-2 rounded-lg border-2 transition-all",
                                field.value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                              <span className="text-lg">{opt.emoji}</span>
                              <span className="text-[10px] font-medium text-center">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 6: Parks & Activities */}
            {currentStep === 6 && (
              <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
                <CardContent className="pt-6 space-y-5">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold">Parques e Atividades</h2>
                  </div>

                  <FormField
                    control={form.control}
                    name="selectedParks"
                    render={() => {
                      const currentParks = normalizeStringArray(watchedValues.selectedParks);

                      return (
                        <FormItem>
                          <FormLabel>Parques que quer visitar</FormLabel>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {parksOptions.map((opt) => {
                              const isChecked = currentParks.includes(opt.value);
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  aria-pressed={isChecked}
                                  onClick={() => {
                                    const base = normalizeStringArray(form.getValues("selectedParks"));
                                    const updated = base.includes(opt.value)
                                      ? base.filter((v) => v !== opt.value)
                                      : [...base, opt.value];
                                    form.setValue("selectedParks", updated, {
                                      shouldValidate: false,
                                      shouldDirty: true,
                                      shouldTouch: true,
                                    });
                                  }}
                                  className={cn(
                                    "flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left",
                                    isChecked
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  <SelectionIndicator checked={isChecked} />
                                  <span className="text-base">{opt.emoji}</span>
                                  <span className="text-xs font-medium">{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {normalizeStringArray(watchedValues.selectedParks).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {normalizeStringArray(watchedValues.selectedParks).map((p) => {
                        const info = parksOptions.find((x) => x.value === p);
                        return <Badge key={p} variant="secondary" className="text-xs">{info?.emoji} {info?.label}</Badge>;
                      })}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="additionalActivities"
                    render={() => {
                      const currentActivities = normalizeStringArray(watchedValues.additionalActivities);

                      return (
                        <FormItem>
                          <FormLabel>Atividades extras (opcional)</FormLabel>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {additionalActivitiesOptions.map((opt) => {
                              const isChecked = currentActivities.includes(opt.value);
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  aria-pressed={isChecked}
                                  onClick={() => {
                                    const base = normalizeStringArray(form.getValues("additionalActivities"));
                                    const updated = base.includes(opt.value)
                                      ? base.filter((v) => v !== opt.value)
                                      : [...base, opt.value];
                                    form.setValue("additionalActivities", updated, {
                                      shouldValidate: false,
                                      shouldDirty: true,
                                      shouldTouch: true,
                                    });
                                  }}
                                  className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                                    isChecked
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  <span className="text-2xl">{opt.emoji}</span>
                                  <span className="text-[10px] font-medium text-center mt-1">{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 7: Ingressos Disney */}
            {currentStep === 7 && (
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-4">
                  <TicketUploadSection
                    initialHasTickets={watchedValues.hasTickets}
                    initialTicketData={{
                      ticketType: watchedValues.ticketTypes,
                      parkDays: watchedValues.ticketDays,
                      startDate: watchedValues.ticketStartDate,
                      uploadedUrls: watchedValues.ticketUploadedUrls,
                    }}
                    itineraryContext={itineraryContext}
                    onUpdate={({ hasTickets, ticketData }) => {
                      form.setValue("hasTickets", hasTickets);
                      form.setValue("ticketTypes", ticketData.ticketType);
                      form.setValue("ticketDays", ticketData.parkDays);
                      form.setValue("ticketStartDate", ticketData.startDate);
                      form.setValue("ticketUploadedUrls", ticketData.uploadedUrls);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 8: Hospedagem */}
            {currentStep === 8 && (
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-4">
                  <HotelSection
                    initialHasHotel={watchedValues.hasHotel}
                    initialHotelData={{
                      name: watchedValues.hotelName,
                      address: watchedValues.hotelAddress,
                      checkIn: watchedValues.hotelCheckIn,
                      checkOut: watchedValues.hotelCheckOut,
                      voucherUrl: watchedValues.hotelVoucherUrl,
                    }}
                    itineraryContext={itineraryContext}
                    onUpdate={({ hasHotel, hotelData }) => {
                      form.setValue("hasHotel", hasHotel);
                      form.setValue("hotelName", hotelData.name);
                      form.setValue("hotelAddress", hotelData.address);
                      form.setValue("hotelCheckIn", hotelData.checkIn);
                      form.setValue("hotelCheckOut", hotelData.checkOut);
                      form.setValue("hotelVoucherUrl", hotelData.voucherUrl);
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1 || isLoading} className="gap-2">
            <ChevronLeft className="w-4 h-4" />Voltar
          </Button>
          <Button type="button" onClick={handleNext} disabled={isLoading} className="gap-2">
            {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Gerando...</>) : currentStep === TOTAL_STEPS ? (<>Gerar Roteiro<ChevronRight className="w-4 h-4" /></>) : (<>Próximo<ChevronRight className="w-4 h-4" /></>)}
          </Button>
        </div>
      </form>
    </Form>
  );
}
