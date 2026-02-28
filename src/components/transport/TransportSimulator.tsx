import { useState } from 'react';
import { SimulatorInputs, SimulatorResult, calculateTransportCosts } from '@/data/transportData';
import SimulatorResultView from '@/components/transport/SimulatorResultView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Users, Calendar, Hotel, Car, Wine, ShoppingBag, Navigation, AlertTriangle, Calculator,
} from 'lucide-react';

export default function TransportSimulator() {
  const [inputs, setInputs] = useState<SimulatorInputs>({
    people: 2,
    days: 7,
    hotelType: 'offsite',
    hasLicense: true,
    planOutside: false,
    drinksAtParks: false,
    tripsPerDay: 4,
  });

  const [results, setResults] = useState<SimulatorResult[] | null>(null);
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    const r = calculateTransportCosts(inputs);
    setResults(r);
    setCalculated(true);
  };

  const handleReset = () => {
    setCalculated(false);
    setResults(null);
  };

  const ToggleButton = ({
    value, onChange, label, sublabel, icon: Icon,
  }: {
    value: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string; icon: React.ElementType;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all w-full ${
        value
          ? 'border-primary bg-primary/5 text-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-border/80'
      }`}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${value ? 'text-primary' : 'text-muted-foreground'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      {value && (
        <Badge variant="default" className="shrink-0 text-[10px]">Sim</Badge>
      )}
    </button>
  );

  if (calculated && results) {
    return <SimulatorResultView results={results} inputs={inputs} onReset={handleReset} />;
  }

  return (
    <Card>
      <CardContent className="p-5 sm:p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            🧮 Simulador de Custo de Transporte
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha seu perfil de viagem e veja qual opção sai mais barata para você.
          </p>
        </div>

        {/* People */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Quantas pessoas vão viajar?
            </span>
            <Badge variant="secondary">{inputs.people}</Badge>
          </div>
          <Slider min={1} max={8} step={1} value={[inputs.people]} onValueChange={([v]) => setInputs({ ...inputs, people: v })} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1 pessoa</span><span>8 pessoas</span>
          </div>
        </div>

        {/* Days */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Quantos dias de viagem?
            </span>
            <Badge variant="secondary">{inputs.days}</Badge>
          </div>
          <Slider min={1} max={14} step={1} value={[inputs.days]} onValueChange={([v]) => setInputs({ ...inputs, days: v })} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1 dia</span><span>14 dias</span>
          </div>
        </div>

        {/* Trips per day */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              Corridas de Uber estimadas por dia?
            </span>
            <Badge variant="secondary">{inputs.tripsPerDay}</Badge>
          </div>
          <Slider min={2} max={8} step={1} value={[inputs.tripsPerDay]} onValueChange={([v]) => setInputs({ ...inputs, tripsPerDay: v })} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>2 corridas (hotel→parque→hotel)</span><span>8 corridas</span>
          </div>
        </div>

        {/* Hotel type */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <Hotel className="w-4 h-4 text-primary" />
            Onde você vai se hospedar?
          </span>
          <div className="space-y-2">
            {([
              { value: 'disney_onsite' as const, label: '🏰 Hotel dentro da Disney (WDW)', sublabel: 'Grand Floridian, Pop Century, Art of Animation, etc.' },
              { value: 'universal_onsite' as const, label: '🎢 Hotel on-site da Universal', sublabel: 'Hard Rock, Portofino Bay, Cabana Bay, etc.' },
              { value: 'offsite' as const, label: '🏨 Hotel fora dos parques (I-Drive, LBV, Kissimmee)', sublabel: 'Hilton, Marriott, Rosen, Holiday Inn, etc.' },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setInputs({ ...inputs, hotelType: opt.value })}
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all w-full ${
                  inputs.hotelType === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground">{opt.sublabel}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-foreground">Sobre sua viagem:</span>
          <div className="space-y-2">
            <ToggleButton
              value={inputs.hasLicense}
              onChange={(v) => setInputs({ ...inputs, hasLicense: v })}
              icon={Car}
              label="Tenho CNH Internacional (ou PIU)"
              sublabel="Necessário para alugar carro nos EUA"
            />
            <ToggleButton
              value={inputs.planOutside}
              onChange={(v) => setInputs({ ...inputs, planOutside: v })}
              icon={ShoppingBag}
              label="Planejo visitar outlets, Walmart ou restaurantes fora da área turística"
              sublabel="Premium Outlets, Mall at Millenia, Publix, etc."
            />
            <ToggleButton
              value={inputs.drinksAtParks}
              onChange={(v) => setInputs({ ...inputs, drinksAtParks: v })}
              icon={Wine}
              label="Planejo beber nos parques ou restaurantes"
              sublabel="Se sim, aluguel de carro fica inviável naquele dia"
            />
          </div>
        </div>

        <Button onClick={handleCalculate} size="lg" className="w-full gap-2">
          <Calculator className="w-5 h-5" />
          Calcular e comparar opções
        </Button>

        <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Estimativas de mercado — valores reais podem variar
        </p>
      </CardContent>
    </Card>
  );
}
