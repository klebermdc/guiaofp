import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function normalizeArr(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

function normalizeNumArr(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map(v => Number(v)).filter(v => Number.isFinite(v));
}

const labelMaps: Record<string, Record<string, string>> = {
  budgetLevel: { economico: "💵 Econômico", moderado: "💳 Moderado", confortavel: "💎 Confortável", premium: "👑 Premium" },
  travelStyle: { tranquilo: "🧘 Tranquilo", equilibrado: "⚖️ Equilibrado", agitado: "🏃 Agitado", focado_parques: "🎢 Focado em Parques", focado_compras: "🛍️ Focado em Compras" },
  heatPreference: { love_heat: "☀️ Adora calor", need_breaks: "❄️ Pausas com AC", avoid_peak: "🌡️ Evitar pico" },
  rainPreference: { continue_normally: "🌧️ Continua normalmente", prefer_indoor: "🏠 Prefere indoor" },
  groupEnergy: { early_birds: "🌅 Madrugadores", normal: "☀️ Padrão", night_owls: "🌙 Noturnos" },
  sleepPreference: { early: "😴 Cedo (21h-22h)", normal: "🌃 Normal (23h-00h)", late: "🎆 Tarde (01h+)" },
};

const parkLabels: Record<string, string> = {
  magic_kingdom: "🏰 Magic Kingdom", epcot: "🌍 EPCOT", hollywood_studios: "🎬 Hollywood Studios",
  animal_kingdom: "🦁 Animal Kingdom", universal_studios: "🎥 Universal Studios",
  islands_of_adventure: "🦖 Islands of Adventure", epic_universe: "🌟 Epic Universe",
  volcano_bay: "🌋 Volcano Bay", seaworld: "🐬 SeaWorld", busch_gardens: "🎢 Busch Gardens",
  legoland: "🧱 LEGOLAND", aquatica: "💦 Aquatica",
};

const priorityLabels: Record<string, string> = {
  quantity: "🎢 Quantidade", quality: "⭐ Qualidade", family: "👨‍👩‍👧 Família",
  characters: "🎬 Personagens", dining: "🍽️ Gastronomia", shows: "🎆 Shows",
  shopping: "🛍️ Compras", photos: "📸 Fotos",
};

interface Props {
  form: any;
  watchedValues: any;
  onEditStep: (step: number) => void;
}

function Section({ title, step, onEdit, children }: { title: string; step: number; onEdit: (s: number) => void; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(step)} className="h-7 gap-1 text-xs text-muted-foreground hover:text-primary">
          <Pencil className="w-3 h-3" /> Editar
        </Button>
      </div>
      <div className="bg-muted/30 rounded-xl p-3 text-sm space-y-1">{children}</div>
    </div>
  );
}

export function SummaryStep({ form, watchedValues, onEditStep }: Props) {
  const v = watchedValues;
  const parks = normalizeArr(v.selectedParks);
  const priorities = normalizeArr(v.attractionPriorities);
  const dietary = normalizeArr(v.dietaryRestrictions);
  const physical = normalizeArr(v.physicalLimitations);
  const fears = normalizeArr(v.fears);
  const occasions = normalizeArr(v.specialOccasions);
  const childAges = normalizeNumArr(v.childrenAges);

  const totalDays = v.startDate && v.endDate
    ? Math.ceil((new Date(v.endDate).getTime() - new Date(v.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return (
    <Card className="border-0 shadow-lg bg-card/80 backdrop-blur overflow-hidden">
      <div className="gradient-magic p-4 text-center">
        <Sparkles className="w-8 h-8 text-primary-foreground mx-auto mb-2 animate-float" />
        <h2 className="text-xl font-bold font-display text-primary-foreground">Resumo da Viagem</h2>
        <p className="text-primary-foreground/80 text-sm mt-1">Confira tudo antes de gerar seu roteiro</p>
      </div>

      <CardContent className="pt-5 space-y-4">
        <Section title="📅 Datas" step={1} onEdit={onEditStep}>
          {v.startDate && v.endDate ? (
            <p>{format(new Date(v.startDate), "dd MMM", { locale: ptBR })} → {format(new Date(v.endDate), "dd MMM yyyy", { locale: ptBR })} • <strong>{totalDays} dias</strong></p>
          ) : <p className="text-muted-foreground">Não definidas</p>}
        </Section>

        <Section title="👤 Viajantes" step={2} onEdit={onEditStep}>
          <p>{v.adultsCount || 0} adulto(s){(v.childrenCount || 0) > 0 && ` + ${v.childrenCount} criança(s)`}</p>
          {childAges.length > 0 && <p className="text-xs text-muted-foreground">Idades: {childAges.join(", ")} anos</p>}
        </Section>

        <Section title="💰 Orçamento e Perfil" step={3} onEdit={onEditStep}>
          <p>{labelMaps.budgetLevel[v.budgetLevel] || v.budgetLevel}</p>
          <p>{v.isFirstTrip ? "🎉 Primeira viagem" : "🔄 Já visitou Orlando"}</p>
        </Section>

        <Section title="🧭 Estilo" step={4} onEdit={onEditStep}>
          <p>{labelMaps.travelStyle[v.travelStyle] || v.travelStyle}</p>
        </Section>

        <Section title="🎢 Parques" step={6} onEdit={onEditStep}>
          <div className="flex flex-wrap gap-1">
            {parks.map(p => <Badge key={p} variant="secondary" className="text-xs">{parkLabels[p] || p}</Badge>)}
          </div>
        </Section>

        {dietary.length > 0 && !dietary.includes("none") && (
          <Section title="🍽️ Restrições" step={9} onEdit={onEditStep}>
            <p>{dietary.join(", ")}</p>
          </Section>
        )}

        {physical.length > 0 && !physical.includes("all_day_walking") && (
          <Section title="⚡ Limitações" step={9} onEdit={onEditStep}>
            <p>{physical.join(", ")}</p>
          </Section>
        )}

        {fears.length > 0 && (
          <Section title="😨 Medos" step={9} onEdit={onEditStep}>
            <p>{fears.join(", ")}</p>
          </Section>
        )}

        {occasions.length > 0 && (
          <Section title="🎂 Ocasiões" step={10} onEdit={onEditStep}>
            <p>{occasions.join(", ")}</p>
          </Section>
        )}

        <Section title="🌡️ Clima e Rotina" step={10} onEdit={onEditStep}>
          <p>{labelMaps.heatPreference[v.heatPreference] || "—"} • {labelMaps.rainPreference[v.rainPreference] || "—"}</p>
          <p>{labelMaps.groupEnergy[v.groupEnergy] || "—"} • Dormir: {labelMaps.sleepPreference[v.sleepPreference] || "—"}</p>
        </Section>

        {priorities.length > 0 && (
          <Section title="🎯 Prioridades" step={11} onEdit={onEditStep}>
            <div className="space-y-0.5">
              {priorities.map((p, i) => (
                <p key={p} className="text-xs"><span className="font-bold text-primary">{i + 1}.</span> {priorityLabels[p] || p}</p>
              ))}
            </div>
          </Section>
        )}

        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-xl p-4 text-center mt-4">
          <p className="text-sm font-medium">Tudo certo? Clique em <span className="text-primary font-bold">"Gerar Roteiro"</span> abaixo! 🚀</p>
        </div>
      </CardContent>
    </Card>
  );
}
