import { useState } from 'react';
import { TransportOption } from '@/data/transportData';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Check, X, Star } from 'lucide-react';

interface TransportCardProps {
  option: TransportOption;
}

const RatingBar = ({ value, label }: { value: number; label: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${(value / 5) * 100}%` }}
      />
    </div>
    <span className="text-xs font-bold text-foreground w-6 text-right">{value}</span>
  </div>
);

export default function TransportCard({ option }: TransportCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-border/60 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{option.emoji}</span>
              <h3 className="text-base font-bold text-foreground">{option.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{option.tagline}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Estimativa/dia</p>
            <p className="text-lg font-bold text-primary">
              {option.costPerDay === 0 ? 'Grátis*' : `US$${option.costPerDay}`}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>

        {/* Ratings */}
        <div className="space-y-2">
          <RatingBar value={option.comfort} label="Conforto" />
          <RatingBar value={option.flexibility} label="Flexibilidade" />
          <RatingBar value={option.economy} label="Economia" />
          <RatingBar value={option.convenience} label="Conveniência" />
        </div>

        {/* Cost note */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          💰 {option.costNotes}
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-sm text-primary font-medium hover:text-primary/80 py-1 transition-colors"
        >
          {expanded ? (
            <>Menos detalhes <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Ver prós, contras e dicas <ChevronDown className="w-4 h-4" /></>
          )}
        </button>

        {expanded && (
          <div className="space-y-4 pt-2 border-t border-border/40">
            {/* Pros */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">✅ Prós</h4>
              <ul className="space-y-1.5">
                {option.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">❌ Contras</h4>
              <ul className="space-y-1.5">
                {option.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <X className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>

            {/* Best for */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">🎯 Ideal para</h4>
              <ul className="space-y-1.5">
                {option.bestFor.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Star className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">💡 Dicas práticas</h4>
              <div className="space-y-1.5">
                {option.tips.map((tip, i) => (
                  <p key={i} className="text-xs text-muted-foreground bg-primary/5 rounded-lg p-2">
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
