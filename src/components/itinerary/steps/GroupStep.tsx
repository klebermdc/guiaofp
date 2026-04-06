import { Minus, Plus } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { QuestionnaireFormData } from '../QuestionnaireWizard';

interface Props {
  form: UseFormReturn<QuestionnaireFormData>;
  watchedValues: QuestionnaireFormData;
}

export function GroupStep({ form, watchedValues }: Props) {
  return (
    <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
      <CardContent className="pt-6 space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">Quem vai viajar?</h2>
          <p className="text-muted-foreground text-sm mt-1">Adultos e crianças</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="adultsCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adultos (18+)</FormLabel>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(Math.max(1, field.value - 1))} disabled={field.value <= 1}><Minus className="w-4 h-4" /></Button>
                  <span className="text-2xl font-bold w-12 text-center">{field.value}</span>
                  <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(Math.min(20, field.value + 1))} disabled={field.value >= 20}><Plus className="w-4 h-4" /></Button>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="childrenCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crianças (0-17)</FormLabel>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="icon" onClick={() => {
                    const n = Math.max(0, field.value - 1);
                    field.onChange(n);
                    form.setValue('childrenAges', form.getValues('childrenAges').slice(0, n));
                  }} disabled={field.value <= 0}><Minus className="w-4 h-4" /></Button>
                  <span className="text-2xl font-bold w-12 text-center">{field.value}</span>
                  <Button type="button" variant="outline" size="icon" onClick={() => {
                    const n = Math.min(15, field.value + 1);
                    field.onChange(n);
                    form.setValue('childrenAges', [...form.getValues('childrenAges'), 5]);
                  }} disabled={field.value >= 15}><Plus className="w-4 h-4" /></Button>
                </div>
              </FormItem>
            )}
          />
        </div>

        {watchedValues.childrenCount > 0 && (
          <div className="space-y-2">
            <FormLabel>Idade das crianças</FormLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: watchedValues.childrenCount }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">#{i + 1}:</span>
                  <Input
                    type="number"
                    min={0}
                    max={17}
                    value={watchedValues.childrenAges[i] || 0}
                    onChange={(e) => {
                      const ages = [...watchedValues.childrenAges];
                      ages[i] = Math.min(17, Math.max(0, parseInt(e.target.value) || 0));
                      form.setValue('childrenAges', ages);
                    }}
                    className="w-16"
                  />
                  <span className="text-xs text-muted-foreground">anos</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
