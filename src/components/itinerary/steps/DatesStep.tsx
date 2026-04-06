import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { UseFormReturn } from 'react-hook-form';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { QuestionnaireFormData } from '../QuestionnaireWizard';

interface Props {
  form: UseFormReturn<QuestionnaireFormData>;
  watchedValues: QuestionnaireFormData;
}

export function DatesStep({ form, watchedValues }: Props) {
  return (
    <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
      <CardContent className="pt-6 space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">Quando será sua viagem?</h2>
          <p className="text-muted-foreground text-sm mt-1">Toque na data de ida e depois na data de volta</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={cn('rounded-lg border p-3 text-center transition-colors',
            watchedValues.startDate ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/30')}>
            <p className="text-xs text-muted-foreground mb-1">✈️ Ida</p>
            <p className={cn('font-semibold text-sm', !watchedValues.startDate && 'text-muted-foreground')}>
              {watchedValues.startDate ? format(watchedValues.startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
            </p>
          </div>
          <div className={cn('rounded-lg border p-3 text-center transition-colors',
            watchedValues.endDate ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/30')}>
            <p className="text-xs text-muted-foreground mb-1">🏠 Volta</p>
            <p className={cn('font-semibold text-sm', !watchedValues.endDate && 'text-muted-foreground')}>
              {watchedValues.endDate ? format(watchedValues.endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Calendar
            mode="range"
            selected={watchedValues.startDate ? { from: watchedValues.startDate, to: watchedValues.endDate || undefined } : undefined}
            onSelect={(range) => {
              form.setValue('startDate', range?.from as Date, { shouldValidate: true });
              form.setValue('endDate', range?.to as Date, { shouldValidate: true });
            }}
            disabled={(d) => d < new Date()}
            numberOfMonths={1}
            locale={ptBR}
            className="p-3 pointer-events-auto rounded-lg border"
          />
        </div>

        <div className="flex gap-4">
          <FormField control={form.control} name="startDate" render={() => <FormItem><FormMessage /></FormItem>} />
          <FormField control={form.control} name="endDate" render={() => <FormItem><FormMessage /></FormItem>} />
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
  );
}
