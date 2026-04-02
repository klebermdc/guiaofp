import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const dietaryOptions = [
  { value: "none", label: "Não temos restrições", emoji: "✅" },
  { value: "vegetarian", label: "Vegetariano/Vegano", emoji: "🥬" },
  { value: "lactose", label: "Intolerância à lactose", emoji: "🥛" },
  { value: "gluten", label: "Alergia a glúten/celíaco", emoji: "🌾" },
  { value: "seafood", label: "Alergia a frutos do mar", emoji: "🦐" },
  { value: "nuts", label: "Alergia a nozes/amendoim", emoji: "🥜" },
  { value: "diabetes", label: "Diabetes", emoji: "💉" },
];

const physicalOptions = [
  { value: "all_day_walking", label: "Todos conseguem andar o dia todo", emoji: "🚶" },
  { value: "frequent_breaks", label: "Precisamos de pausas frequentes", emoji: "🪑" },
  { value: "wheelchair", label: "Cadeira de rodas/mobilidade reduzida", emoji: "♿" },
  { value: "no_coasters", label: "Dificuldade com montanhas-russas", emoji: "🎢" },
  { value: "heart_issues", label: "Problemas cardíacos/pressão", emoji: "❤️‍🩹" },
  { value: "pregnant", label: "Gestante", emoji: "🤰" },
];

const fearOptions = [
  { value: "heights", label: "Medo de altura", emoji: "🏔️" },
  { value: "dark", label: "Medo de escuro", emoji: "🌑" },
  { value: "claustrophobia", label: "Claustrofobia", emoji: "📦" },
  { value: "water", label: "Medo de água/afogamento", emoji: "🌊" },
  { value: "animals", label: "Fobia de animais", emoji: "🐍" },
];

function normalizeArr(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

function Chip({ checked, label, emoji, onClick }: { checked: boolean; label: string; emoji: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left",
        checked ? "border-primary bg-primary/10 shadow-sm shadow-primary/10" : "border-border hover:border-primary/40"
      )}>
      <span className={cn(
        "flex h-5 w-5 items-center justify-center rounded-md border transition-colors shrink-0",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
      )}>
        {checked && <Check className="h-3 w-3" />}
      </span>
      <span className="text-base">{emoji}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface HealthStepProps { form: any; watchedValues: any; }

export function HealthStep({ form, watchedValues }: HealthStepProps) {
  const dietary = normalizeArr(watchedValues.dietaryRestrictions);
  const physical = normalizeArr(watchedValues.physicalLimitations);
  const fears = normalizeArr(watchedValues.fears);

  const toggle = (field: string, value: string) => {
    const current = normalizeArr(form.getValues(field));
    if (field === "dietaryRestrictions" && value === "none") {
      form.setValue(field, current.includes(value) ? [] : ["none"]); return;
    }
    if (field === "dietaryRestrictions" && current.includes("none")) {
      form.setValue(field, [value]); return;
    }
    if (field === "physicalLimitations" && value === "all_day_walking") {
      form.setValue(field, current.includes(value) ? [] : ["all_day_walking"]); return;
    }
    if (field === "physicalLimitations" && current.includes("all_day_walking")) {
      form.setValue(field, [value]); return;
    }
    form.setValue(field, current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
  };

  return (
    <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
      <CardContent className="pt-6 space-y-6">
        <div className="text-center mb-2">
          <span className="text-4xl mb-2 block animate-float">🏥</span>
          <h2 className="text-xl font-semibold font-display">Saúde e Restrições</h2>
          <p className="text-muted-foreground text-sm mt-1">Para um roteiro seguro e confortável para todos</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
            🍽️ Restrições Alimentares
          </h3>
          <div className="grid gap-2">
            {dietaryOptions.map(o => <Chip key={o.value} checked={dietary.includes(o.value)} label={o.label} emoji={o.emoji} onClick={() => toggle("dietaryRestrictions", o.value)} />)}
          </div>
          {dietary.length > 0 && !dietary.includes("none") && (
            <Input placeholder="Outras restrições..." value={watchedValues.dietaryOther || ""} onChange={e => form.setValue("dietaryOther", e.target.value)} />
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
            ⚡ Limitações Físicas
          </h3>
          <div className="grid gap-2">
            {physicalOptions.map(o => <Chip key={o.value} checked={physical.includes(o.value)} label={o.label} emoji={o.emoji} onClick={() => toggle("physicalLimitations", o.value)} />)}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
            😨 Medos / Fobias
          </h3>
          <div className="grid gap-2">
            {fearOptions.map(o => <Chip key={o.value} checked={fears.includes(o.value)} label={o.label} emoji={o.emoji} onClick={() => toggle("fears", o.value)} />)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
