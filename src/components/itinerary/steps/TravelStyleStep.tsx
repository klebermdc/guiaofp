import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { travelStyleOptions, parksInterestOptions } from '../questionnaireConstants';
import type { QuestionnaireFormData } from '../QuestionnaireWizard';

interface Props {
  form: UseFormReturn<QuestionnaireFormData>;
  watchedValues: QuestionnaireFormData;
}

export function TravelStyleStep({ form }: Props) {
  return (
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
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn('flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                      field.value === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <div>
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{opt.description}</span>
                    </div>
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
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn('flex flex-col items-center p-3 rounded-lg border-2 transition-all',
                      field.value === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                  >
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
  );
}
