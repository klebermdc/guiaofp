import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, Loader2, Save, CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { TicketUploadSection } from './TicketUploadSection';
import { HotelSection } from './HotelSection';
import { HealthStep } from './steps/HealthStep';
import { SpecialDetailsStep } from './steps/SpecialDetailsStep';
import { PriorityStep } from './steps/PriorityStep';
import { SummaryStep } from './steps/SummaryStep';
import { DatesStep } from './steps/DatesStep';
import { GroupStep } from './steps/GroupStep';
import { BudgetStep } from './steps/BudgetStep';
import { TravelStyleStep } from './steps/TravelStyleStep';
import { TransportStep } from './steps/TransportStep';
import { ParksStep } from './steps/ParksStep';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Form } from '@/components/ui/form';

import {
  STORAGE_KEY,
  TOTAL_STEPS,
  stepConfig,
  budgetOptions,
  travelStyleOptions,
  parksInterestOptions,
  stayingRegionOptions,
  accommodationTypeOptions,
  parksOptions,
} from './questionnaireConstants';

// ── Schema ─────────────────────────────────────────────────────────────────
const questionnaireSchema = z.object({
  startDate: z.date({ required_error: 'Selecione a data de ida' }),
  endDate: z.date({ required_error: 'Selecione a data de volta' }),
  adultsCount: z.number().min(1, 'Mínimo 1 adulto').max(20),
  childrenCount: z.number().min(0).max(15),
  childrenAges: z.array(z.number().min(0).max(17)),
  budgetLevel: z.enum(['economico', 'moderado', 'confortavel', 'premium']),
  isFirstTrip: z.boolean(),
  travelStyle: z.enum(['tranquilo', 'equilibrado', 'agitado', 'focado_parques', 'focado_compras']),
  parksInterestLevel: z.enum(['altissimo', 'alto', 'moderado', 'baixo']),
  airportTransfer: z.enum(['uber_lyft', 'aluguel_carro', 'transfer_hotel', 'transporte_contratado', 'nao_definido']),
  willRentCar: z.enum(['sim', 'nao', 'talvez']),
  stayingRegion: z.enum(['international_drive', 'kissimmee', 'lake_buena_vista', 'orlando_downtown', 'universal_area', 'outro']),
  accommodationType: z.enum(['hotel_economico', 'hotel_medio', 'hotel_luxo', 'resort_disney', 'resort_universal', 'casa_airbnb', 'outro']),
  selectedParks: z.array(z.string()).min(1, 'Selecione pelo menos um parque'),
  additionalActivities: z.array(z.string()),
  hasTickets: z.boolean().nullable(),
  ticketTypes: z.array(z.string()),
  ticketDays: z.number().min(0).max(14),
  ticketStartDate: z.string(),
  ticketUploadedUrls: z.array(z.string()),
  hasHotel: z.boolean().nullable(),
  hotelName: z.string(),
  hotelAddress: z.string(),
  hotelCheckIn: z.string(),
  hotelCheckOut: z.string(),
  hotelVoucherUrl: z.string(),
  dietaryRestrictions: z.array(z.string()),
  dietaryOther: z.string(),
  physicalLimitations: z.array(z.string()),
  fears: z.array(z.string()),
  specialOccasions: z.array(z.string()),
  birthdayDate: z.string(),
  birthdayPerson: z.string(),
  occasionOther: z.string(),
  heatPreference: z.enum(['love_heat', 'need_breaks', 'avoid_peak']),
  rainPreference: z.enum(['continue_normally', 'prefer_indoor']),
  groupEnergy: z.enum(['early_birds', 'normal', 'night_owls']),
  sleepPreference: z.enum(['early', 'normal', 'late']),
  attractionPriorities: z.array(z.string()),
});

export type QuestionnaireFormData = z.infer<typeof questionnaireSchema>;

interface QuestionnaireWizardProps {
  onComplete: (data: QuestionnaireFormData) => void;
  isLoading?: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value === 'string') return value ? [value] : [];
  return [];
}

function normalizeNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === 'number' ? v : Number(v))).filter((v) => Number.isFinite(v));
}

function normalizeDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function loadSavedDraft(): Partial<QuestionnaireFormData> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsedRaw = JSON.parse(saved);
    if (!parsedRaw || typeof parsedRaw !== 'object') return null;
    const parsed = parsedRaw as Record<string, unknown>;

    const draft = {
      ...parsed,
      startDate: normalizeDate(parsed.startDate),
      endDate: normalizeDate(parsed.endDate),
      adultsCount: typeof parsed.adultsCount === 'number' ? parsed.adultsCount : Number(parsed.adultsCount) || 2,
      childrenCount: typeof parsed.childrenCount === 'number' ? parsed.childrenCount : Number(parsed.childrenCount) || 0,
      childrenAges: normalizeNumberArray(parsed.childrenAges),
      selectedParks: normalizeStringArray(parsed.selectedParks),
      additionalActivities: normalizeStringArray(parsed.additionalActivities),
      hasTickets: typeof parsed.hasTickets === 'boolean' ? parsed.hasTickets : null,
      ticketTypes: normalizeStringArray(parsed.ticketTypes),
      ticketDays: typeof parsed.ticketDays === 'number' ? parsed.ticketDays : 0,
      ticketStartDate: typeof parsed.ticketStartDate === 'string' ? parsed.ticketStartDate : '',
      ticketUploadedUrls: normalizeStringArray(parsed.ticketUploadedUrls),
      hasHotel: typeof parsed.hasHotel === 'boolean' ? parsed.hasHotel : null,
      hotelName: typeof parsed.hotelName === 'string' ? parsed.hotelName : '',
      hotelAddress: typeof parsed.hotelAddress === 'string' ? parsed.hotelAddress : '',
      hotelCheckIn: typeof parsed.hotelCheckIn === 'string' ? parsed.hotelCheckIn : '',
      hotelCheckOut: typeof parsed.hotelCheckOut === 'string' ? parsed.hotelCheckOut : '',
      hotelVoucherUrl: typeof parsed.hotelVoucherUrl === 'string' ? parsed.hotelVoucherUrl : '',
      dietaryRestrictions: normalizeStringArray(parsed.dietaryRestrictions),
      dietaryOther: typeof parsed.dietaryOther === 'string' ? parsed.dietaryOther : '',
      physicalLimitations: normalizeStringArray(parsed.physicalLimitations),
      fears: normalizeStringArray(parsed.fears),
      specialOccasions: normalizeStringArray(parsed.specialOccasions),
      birthdayDate: typeof parsed.birthdayDate === 'string' ? parsed.birthdayDate : '',
      birthdayPerson: typeof (parsed as any).birthdayPerson === 'string' ? (parsed as any).birthdayPerson : '',
      occasionOther: typeof (parsed as any).occasionOther === 'string' ? (parsed as any).occasionOther : '',
      heatPreference: typeof (parsed as any).heatPreference === 'string' ? (parsed as any).heatPreference : 'need_breaks',
      rainPreference: typeof (parsed as any).rainPreference === 'string' ? (parsed as any).rainPreference : 'prefer_indoor',
      groupEnergy: typeof (parsed as any).groupEnergy === 'string' ? (parsed as any).groupEnergy : 'normal',
      sleepPreference: typeof (parsed as any).sleepPreference === 'string' ? (parsed as any).sleepPreference : 'normal',
      attractionPriorities: normalizeStringArray((parsed as any).attractionPriorities),
    };

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); } catch { /* ignore */ }
    return draft;
  } catch (e) {
    console.error('Error loading draft:', e);
    return null;
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export function QuestionnaireWizard({ onComplete, isLoading }: QuestionnaireWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const [savedDraft] = useState(() => loadSavedDraft());

  const form = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: savedDraft || {
      adultsCount: 2,
      childrenCount: 0,
      childrenAges: [],
      isFirstTrip: true,
      budgetLevel: 'moderado',
      travelStyle: 'equilibrado',
      parksInterestLevel: 'alto',
      airportTransfer: 'nao_definido',
      willRentCar: 'talvez',
      stayingRegion: 'international_drive',
      accommodationType: 'hotel_medio',
      selectedParks: [],
      additionalActivities: [],
      hasTickets: null,
      ticketTypes: [],
      ticketDays: 0,
      ticketStartDate: '',
      ticketUploadedUrls: [],
      hasHotel: null,
      hotelName: '',
      hotelAddress: '',
      hotelCheckIn: '',
      hotelCheckOut: '',
      hotelVoucherUrl: '',
      dietaryRestrictions: [],
      dietaryOther: '',
      physicalLimitations: [],
      fears: [],
      specialOccasions: [],
      birthdayDate: '',
      birthdayPerson: '',
      occasionOther: '',
      heatPreference: 'need_breaks' as const,
      rainPreference: 'prefer_indoor' as const,
      groupEnergy: 'normal' as const,
      sleepPreference: 'normal' as const,
      attractionPriorities: [],
    },
  });

  const watchedValues = form.watch();

  // Itinerary context for ticket/hotel suggestions
  const itineraryContext = {
    selectedParks: watchedValues.selectedParks?.map(p => parksOptions.find(po => po.value === p)?.label || p) || [],
    duration: watchedValues.startDate && watchedValues.endDate
      ? Math.ceil((watchedValues.endDate.getTime() - watchedValues.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 7,
    budget: budgetOptions.find(b => b.value === watchedValues.budgetLevel)?.label || 'Moderado',
    parkInterest: parksInterestOptions.find(p => p.value === watchedValues.parksInterestLevel)?.label || 'Alto',
    adultsCount: watchedValues.adultsCount || 2,
    childrenCount: watchedValues.childrenCount || 0,
    childrenAges: watchedValues.childrenAges || [],
    travelStyle: travelStyleOptions.find(t => t.value === watchedValues.travelStyle)?.label || 'Equilibrado',
    stayingRegion: stayingRegionOptions.find(r => r.value === watchedValues.stayingRegion)?.label || 'International Drive',
    accommodationType: accommodationTypeOptions.find(a => a.value === watchedValues.accommodationType)?.label || 'Hotel Médio',
  };

  // Auto-save
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch (e) { console.error('Error saving draft:', e); }
      }, 250);
    });
    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, [form]);

  const handleNext = async () => {
    const fieldsMap: Record<number, (keyof QuestionnaireFormData)[]> = {
      1: ['startDate', 'endDate'],
      2: ['adultsCount', 'childrenCount', 'childrenAges'],
      3: ['budgetLevel', 'isFirstTrip'],
      4: ['travelStyle', 'parksInterestLevel'],
      5: ['airportTransfer', 'willRentCar', 'stayingRegion', 'accommodationType'],
      6: ['selectedParks', 'additionalActivities'],
    };
    const isValid = await form.trigger(fieldsMap[currentStep] || []);
    if (isValid) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        form.handleSubmit(onComplete)();
      }
    }
  };

  const handleBack = () => { if (currentStep > 1) setCurrentStep((prev) => prev - 1); };

  const StepIcon = stepConfig[currentStep - 1]?.icon || CalendarIcon;
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

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
                <Save className="w-3 h-3" /> Salvo
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
            {currentStep === 1 && <DatesStep form={form} watchedValues={watchedValues} />}
            {currentStep === 2 && <GroupStep form={form} watchedValues={watchedValues} />}
            {currentStep === 3 && <BudgetStep form={form} watchedValues={watchedValues} />}
            {currentStep === 4 && <TravelStyleStep form={form} watchedValues={watchedValues} />}
            {currentStep === 5 && <TransportStep form={form} watchedValues={watchedValues} />}
            {currentStep === 6 && <ParksStep form={form} watchedValues={watchedValues} />}

            {currentStep === 7 && (
              <TicketUploadSection
                initialHasTickets={watchedValues.hasTickets}
                initialTicketData={{ ticketType: watchedValues.ticketTypes, parkDays: watchedValues.ticketDays, startDate: watchedValues.ticketStartDate, uploadedUrls: watchedValues.ticketUploadedUrls }}
                itineraryContext={itineraryContext}
                onUpdate={({ hasTickets, ticketData }) => {
                  form.setValue('hasTickets', hasTickets);
                  form.setValue('ticketTypes', ticketData.ticketType);
                  form.setValue('ticketDays', ticketData.parkDays);
                  form.setValue('ticketStartDate', ticketData.startDate);
                  form.setValue('ticketUploadedUrls', ticketData.uploadedUrls);
                }}
              />
            )}

            {currentStep === 8 && (
              <HotelSection
                initialHasHotel={watchedValues.hasHotel}
                initialHotelData={{ name: watchedValues.hotelName, address: watchedValues.hotelAddress, checkIn: watchedValues.hotelCheckIn, checkOut: watchedValues.hotelCheckOut, voucherUrl: watchedValues.hotelVoucherUrl }}
                itineraryContext={itineraryContext}
                onUpdate={({ hasHotel, hotelData }) => {
                  form.setValue('hasHotel', hasHotel);
                  form.setValue('hotelName', hotelData.name);
                  form.setValue('hotelAddress', hotelData.address);
                  form.setValue('hotelCheckIn', hotelData.checkIn);
                  form.setValue('hotelCheckOut', hotelData.checkOut);
                  form.setValue('hotelVoucherUrl', hotelData.voucherUrl);
                }}
              />
            )}

            {currentStep === 9 && <HealthStep form={form} watchedValues={watchedValues} />}
            {currentStep === 10 && <SpecialDetailsStep form={form} watchedValues={watchedValues} />}
            {currentStep === 11 && <PriorityStep form={form} watchedValues={watchedValues} />}
            {currentStep === 12 && <SummaryStep form={form} watchedValues={watchedValues} onEditStep={(step: number) => setCurrentStep(step)} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1 || isLoading} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </Button>
          <Button type="button" onClick={handleNext} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
            ) : currentStep === TOTAL_STEPS ? (
              <>Gerar Roteiro <ChevronRight className="w-4 h-4" /></>
            ) : (
              <>Próximo <ChevronRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
