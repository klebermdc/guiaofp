import { Check } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { parksOptions, additionalActivitiesOptions } from '../questionnaireConstants';
import type { QuestionnaireFormData } from '../QuestionnaireWizard';

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value === 'string') return value ? [value] : [];
  return [];
}

function SelectionIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn('flex h-6 w-6 items-center justify-center rounded-md border transition-colors',
        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-transparent')}
    >
      {checked ? <Check className="h-4 w-4" /> : null}
    </span>
  );
}

interface Props {
  form: UseFormReturn<QuestionnaireFormData>;
  watchedValues: QuestionnaireFormData;
}

export function ParksStep({ form, watchedValues }: Props) {
  return (
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
                          const base = normalizeStringArray(form.getValues('selectedParks'));
                          const updated = base.includes(opt.value)
                            ? base.filter((v) => v !== opt.value)
                            : [...base, opt.value];
                          form.setValue('selectedParks', updated, { shouldValidate: false, shouldDirty: true, shouldTouch: true });
                        }}
                        className={cn('flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left',
                          isChecked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
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
                          const base = normalizeStringArray(form.getValues('additionalActivities'));
                          const updated = base.includes(opt.value)
                            ? base.filter((v) => v !== opt.value)
                            : [...base, opt.value];
                          form.setValue('additionalActivities', updated, { shouldValidate: false, shouldDirty: true, shouldTouch: true });
                        }}
                        className={cn('flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all',
                          isChecked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
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
  );
}
