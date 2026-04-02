import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const occasionOptions = [
  { value: "birthday", label: "Aniversário durante a viagem", emoji: "🎂" },
  { value: "honeymoon", label: "Lua de mel", emoji: "💕" },
  { value: "proposal", label: "Pedido de casamento", emoji: "💍" },
  { value: "graduation", label: "Comemoração de formatura", emoji: "🎓" },
  { value: "first_usa", label: "Primeira vez nos EUA", emoji: "🇺🇸" },
];

const heatOptions = [
  { value: "love_heat", label: "Adoramos calor, sem problemas", emoji: "☀️" },
  { value: "need_breaks", label: "Preferimos pausas com ar-condicionado", emoji: "❄️" },
  { value: "avoid_peak", label: "Precisamos evitar pico de calor", emoji: "🌡️" },
];

const rainOptions = [
  { value: "continue_normally", label: "Continuamos normalmente", emoji: "🌧️" },
  { value: "prefer_indoor", label: "Preferimos atividades indoor", emoji: "🏠" },
];

const energyOptions = [
  { value: "early_birds", label: "Madrugadores", description: "Acordamos cedo sem problemas", emoji: "🌅" },
  { value: "normal", label: "Padrão", description: "Horário normal", emoji: "☀️" },
  { value: "night_owls", label: "Noturnos", description: "Começamos mais tarde", emoji: "🌙" },
];

const sleepOptions = [
  { value: "early", label: "Cedo (21h-22h)", description: "Especialmente com crianças", emoji: "😴" },
  { value: "normal", label: "Normal (23h-00h)", description: "", emoji: "🌃" },
  { value: "late", label: "Tarde (01h+)", description: "Aproveitar tudo", emoji: "🎆" },
];

function normalizeArr(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props { form: any; watchedValues: any; }

export function SpecialDetailsStep({ form, watchedValues }: Props) {
  const occasions = normalizeArr(watchedValues.specialOccasions);

  const toggleOccasion = (val: string) => {
    const current = normalizeArr(form.getValues("specialOccasions"));
    form.setValue("specialOccasions", current.includes(val) ? current.filter(v => v !== val) : [...current, val]);
  };

  return (
    <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
      <CardContent className="pt-6 space-y-6">
        <div className="text-center mb-2">
          <span className="text-4xl mb-2 block animate-float">✨</span>
          <h2 className="text-xl font-semibold font-display">Detalhes Especiais</h2>
          <p className="text-muted-foreground text-sm mt-1">Para deixar tudo perfeito!</p>
        </div>

        {/* Occasions */}
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-wide text-muted-foreground font-medium">🎂 Ocasiões Especiais</h3>
          <div className="grid gap-2">
            {occasionOptions.map(o => (
              <button key={o.value} type="button" onClick={() => toggleOccasion(o.value)}
                className={cn("flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left",
                  occasions.includes(o.value) ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:border-primary/40")}>
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-md border transition-colors shrink-0",
                  occasions.includes(o.value) ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                  {occasions.includes(o.value) && <Check className="h-3 w-3" />}
                </span>
                <span>{o.emoji}</span>
                <span className="text-sm font-medium">{o.label}</span>
              </button>
            ))}
          </div>
          {occasions.includes("birthday") && (
            <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-primary/30">
              <Input placeholder="Data (dd/mm)" value={watchedValues.birthdayDate || ""} onChange={e => form.setValue("birthdayDate", e.target.value)} />
              <Input placeholder="Quem faz aniversário" value={watchedValues.birthdayPerson || ""} onChange={e => form.setValue("birthdayPerson", e.target.value)} />
            </div>
          )}
          <Input placeholder="Outra ocasião..." value={watchedValues.occasionOther || ""} onChange={e => form.setValue("occasionOther", e.target.value)} />
        </div>

        {/* Climate */}
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-wide text-muted-foreground font-medium">🌡️ Preferências Climáticas</h3>
          <p className="text-xs text-muted-foreground">Como vocês lidam com calor intenso?</p>
          <div className="grid gap-2">
            {heatOptions.map(o => (
              <button key={o.value} type="button" onClick={() => form.setValue("heatPreference", o.value)}
                className={cn("flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left",
                  watchedValues.heatPreference === o.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40")}>
                <span>{o.emoji}</span>
                <span className="text-sm font-medium">{o.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">E chuva?</p>
          <div className="grid grid-cols-2 gap-2">
            {rainOptions.map(o => (
              <button key={o.value} type="button" onClick={() => form.setValue("rainPreference", o.value)}
                className={cn("flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                  watchedValues.rainPreference === o.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40")}>
                <span className="text-xl">{o.emoji}</span>
                <span className="text-xs font-medium text-center mt-1">{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Routine */}
        <div className="space-y-3">
          <h3 className="text-sm uppercase tracking-wide text-muted-foreground font-medium">⏰ Rotina do Grupo</h3>
          <p className="text-xs text-muted-foreground">Energia do grupo</p>
          <div className="grid gap-2">
            {energyOptions.map(o => (
              <button key={o.value} type="button" onClick={() => form.setValue("groupEnergy", o.value)}
                className={cn("flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                  watchedValues.groupEnergy === o.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40")}>
                <span className="text-xl">{o.emoji}</span>
                <div>
                  <span className="text-sm font-medium">{o.label}</span>
                  {o.description && <span className="text-xs text-muted-foreground ml-2">{o.description}</span>}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Hora de dormir preferencial</p>
          <div className="grid grid-cols-3 gap-2">
            {sleepOptions.map(o => (
              <button key={o.value} type="button" onClick={() => form.setValue("sleepPreference", o.value)}
                className={cn("flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                  watchedValues.sleepPreference === o.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40")}>
                <span className="text-xl">{o.emoji}</span>
                <span className="text-[10px] font-medium text-center mt-1">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
