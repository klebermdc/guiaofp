import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const priorityItems = [
  { id: "quantity", label: "Quantidade de atrações", description: "Fazer o máximo possível", emoji: "🎢" },
  { id: "quality", label: "Qualidade da experiência", description: "Com calma, sem pressa", emoji: "⭐" },
  { id: "family", label: "Atrações para toda família", description: "Todos possam fazer juntos", emoji: "👨‍👩‍👧" },
  { id: "characters", label: "Encontros com personagens", description: "Fotos e autógrafos", emoji: "🎬" },
  { id: "dining", label: "Experiências gastronômicas", description: "Bons restaurantes", emoji: "🍽️" },
  { id: "shows", label: "Shows e apresentações", description: "Não perder espetáculos", emoji: "🎆" },
  { id: "shopping", label: "Tempo para compras", description: "Nos parques e outlets", emoji: "🛍️" },
  { id: "photos", label: "Tempo para fotos", description: "Locais icônicos", emoji: "📸" },
];

function normalizeArr(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

interface Props { form: any; watchedValues: any; }

export function PriorityStep({ form, watchedValues }: Props) {
  const priorities = normalizeArr(watchedValues.attractionPriorities);

  const togglePriority = (id: string) => {
    const current = normalizeArr(form.getValues("attractionPriorities"));
    if (current.includes(id)) {
      form.setValue("attractionPriorities", current.filter(v => v !== id));
    } else {
      form.setValue("attractionPriorities", [...current, id]);
    }
  };

  const getRank = (id: string) => {
    const idx = priorities.indexOf(id);
    return idx >= 0 ? idx + 1 : null;
  };

  return (
    <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
      <CardContent className="pt-6 space-y-5">
        <div className="text-center mb-2">
          <span className="text-4xl mb-2 block animate-float">🎯</span>
          <h2 className="text-xl font-semibold font-display">Suas Prioridades</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Toque na ordem de importância <span className="text-primary font-medium">(1 = mais importante)</span>
          </p>
        </div>

        <div className="grid gap-2">
          {priorityItems.map(item => {
            const rank = getRank(item.id);
            const isSelected = rank !== null;
            return (
              <button key={item.id} type="button" onClick={() => togglePriority(item.id)}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left group",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm shadow-primary/10"
                    : "border-border hover:border-primary/40"
                )}>
                {/* Rank badge */}
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm shrink-0 transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-muted text-muted-foreground"
                )}>
                  {rank ?? "—"}
                </div>

                <span className="text-2xl">{item.emoji}</span>

                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-sm", isSelected && "text-primary")}>{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {priorities.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
            <p className="text-sm text-muted-foreground">
              {priorities.length === priorityItems.length
                ? "✅ Todas as prioridades ordenadas!"
                : `${priorities.length}/${priorityItems.length} selecionadas — toque nas restantes`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
