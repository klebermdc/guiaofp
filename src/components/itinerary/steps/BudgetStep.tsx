import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { budgetOptions } from '../questionnaireConstants';
import type { QuestionnaireFormData } from '../QuestionnaireWizard';

interface Props {
  form: UseFormReturn<QuestionnaireFormData>;
  watchedValues: QuestionnaireFormData;
}

export function BudgetStep({ form }: Props) {
  return (
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
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn('flex flex-col items-center p-4 rounded-lg border-2 transition-all',
                      field.value === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                  >
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
                <button
                  type="button"
                  onClick={() => field.onChange(true)}
                  className={cn('flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all',
                    field.value === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                >
                  <span className="text-xl">🎉</span><span className="font-medium">Sim!</span>
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange(false)}
                  className={cn('flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all',
                    field.value === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                >
                  <span className="text-xl">🔄</span><span className="font-medium">Já fui</span>
                </button>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
