import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { airportTransferOptions, rentCarOptions, stayingRegionOptions, accommodationTypeOptions } from '../questionnaireConstants';
import type { QuestionnaireFormData } from '../QuestionnaireWizard';

interface Props {
  form: UseFormReturn<QuestionnaireFormData>;
  watchedValues: QuestionnaireFormData;
}

export function TransportStep({ form }: Props) {
  return (
    <Card className="border-0 shadow sm:shadow-lg bg-card sm:bg-card/50 sm:backdrop-blur">
      <CardContent className="pt-6 space-y-5">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">Transporte e Hospedagem</h2>
        </div>

        <FormField
          control={form.control}
          name="airportTransfer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transporte aeroporto → hotel</FormLabel>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {airportTransferOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn('flex flex-col items-center p-2 rounded-lg border-2 transition-all',
                      field.value === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    <span className="text-[10px] font-medium text-center">{opt.label}</span>
                  </button>
                ))}
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="willRentCar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alugar carro?</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                {rentCarOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn('flex flex-col items-center p-3 rounded-lg border-2 transition-all',
                      field.value === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stayingRegion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Região de hospedagem</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {stayingRegionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn('p-2 rounded-lg border-2 transition-all text-sm font-medium',
                      field.value === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accommodationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de hospedagem</FormLabel>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {accommodationTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn('flex flex-col items-center p-2 rounded-lg border-2 transition-all',
                      field.value === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    <span className="text-[10px] font-medium text-center">{opt.label}</span>
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
