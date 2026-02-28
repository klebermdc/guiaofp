export type TransportMode =
  | 'rental_car'
  | 'uber_lyft'
  | 'shuttle'
  | 'lynx'
  | 'disney_transport'
  | 'universal_transport';

export interface TransportOption {
  id: TransportMode;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  costPerDay: number;
  costPerTrip: number;
  costNotes: string;
  comfort: number;
  flexibility: number;
  economy: number;
  convenience: number;
  pros: string[];
  cons: string[];
  bestFor: string[];
  tips: string[];
  dailyBaseRate: number;
  perPersonRate: number;
  fixedCostPerTrip: number;
  variablePerDay: number;
}

export const transportOptions: TransportOption[] = [
  {
    id: 'rental_car',
    name: 'Aluguel de Carro',
    emoji: '🚗',
    tagline: 'Liberdade total — pode valer muito a pena para famílias',
    description: 'Alugar um carro em Orlando dá liberdade total de horários, acesso a supermercados, outlets e restaurantes fora dos parques sem depender de nenhum app ou horário fixo. Para grupos de 3+ pessoas ou estadias longas, frequentemente é a opção mais econômica.',
    costPerDay: 65,
    costPerTrip: 0,
    costNotes: 'Média de US$45–85/dia (carro econômico). Inclua seguro (~US$15/dia) e gasolina (~US$8/dia).',
    comfort: 5,
    flexibility: 5,
    economy: 4,
    convenience: 3,
    pros: [
      'Liberdade total de horários — vá e volte quando quiser',
      'Para 3+ pessoas, geralmente mais barato que Uber',
      'Acesso fácil a Walmart, Publix, outlets e restaurantes fora da área turística',
      'Sem taxa de surge pricing em horários de pico',
      'Porta malas para carregar compras, carrinhos de bebê e bagagens',
      'GPS integrado — fácil de navegar em Orlando',
    ],
    cons: [
      'Estacionamento nos parques: US$25–35/dia (Disney e Universal)',
      'Seguro adicional recomendado — leia o contrato com atenção',
      'Não pode beber e dirigir (óbvio, mas importante)',
      'Motoristas brasileiros podem se sentir desconfortáveis no início',
      'Taxas extras em aeroportos (Airport Concession Fee ~US$10–20)',
      'Depósito de segurança retido no cartão durante o aluguel',
    ],
    bestFor: [
      'Famílias com 3 ou mais pessoas',
      'Estadias de 7+ dias',
      'Quem planeja visitar outlets, supermercados ou restaurantes fora da área turística',
      'Viajantes que valorizam flexibilidade e independência',
    ],
    tips: [
      '💡 Reserve com antecedência pelo site da Costco, Kayak ou diretamente com Alamo/National — até 40% mais barato',
      '💡 O estacionamento nos hotéis Disney é GRATUITO para hóspedes — aproveite',
      '💡 Abasteça ANTES de devolver — abastecer na agência custa o dobro',
      '💡 Tire fotos do carro ao retirar — registre qualquer arranhão existente',
      '💡 Verifique se seu cartão de crédito brasileiro oferece cobertura de seguro de locação — muitos oferecem',
      '💡 Plataformas como Turo permitem alugar de pessoas físicas, às vezes mais barato',
    ],
    dailyBaseRate: 65,
    perPersonRate: 0,
    fixedCostPerTrip: 0,
    variablePerDay: 65,
  },
  {
    id: 'uber_lyft',
    name: 'Uber / Lyft',
    emoji: '📱',
    tagline: 'Prático para casais e solteiros — caro para famílias grandes',
    description: 'Uber e Lyft são extremamente populares em Orlando e funcionam muito bem. A cobertura é excelente na área turística. Ideal para quem não quer se preocupar com estacionamento, mas os custos sobem rápido em viagens longas ou com surge pricing.',
    costPerDay: 80,
    costPerTrip: 18,
    costNotes: 'Média de US$12–25 por corrida na área turística. Com surge pricing pode dobrar. Calcule 4–6 corridas por dia.',
    comfort: 4,
    flexibility: 4,
    economy: 3,
    convenience: 5,
    pros: [
      'Zero preocupação com estacionamento nos parques',
      'Pode beber à vontade nos restaurantes e bares',
      'App familiar — funciona exatamente igual ao Brasil',
      'Não precisa de carteira de habilitação internacional',
      'Pagamento já configurado no app — sem complicação',
      'Pool e Comfort disponíveis para economizar ou confortar',
    ],
    cons: [
      'Surge pricing nos horários de saída dos parques pode triplicar o preço',
      'Para famílias de 4+ pessoas, sai muito caro ao longo da semana',
      'Espera na saída dos parques pode ser frustrante (20–40 min)',
      'Sem controle de horário — depende da disponibilidade',
      'Não tem porta-malas grande para compras volumosas',
      'Custo acumula rapidamente: 4 corridas/dia × 7 dias = US$500+',
    ],
    bestFor: [
      'Casais ou viajantes solo',
      'Estadias curtas de 3–4 dias',
      'Quem planeja beber nos parques ou restaurantes',
      'Quem não tem CNH internacional',
      'Dias avulsos que não justificam o aluguel',
    ],
    tips: [
      '💡 EVITE pegar Uber na saída dos parques — caminhe 5 minutos para fora da área de pico e economize',
      '💡 Agende corridas com antecedência no app para saída de shows e fogos — reduz o surge',
      '💡 Uber XL para grupos de 5–6 pessoas sai mais barato que dois carros',
      '💡 Compare Uber e Lyft sempre — o preço pode variar 30% entre os dois',
      '💡 Uber Reserve (agendar com antecedência) garante preço fixo sem surge',
      '💡 Para o aeroporto, serviços como Mears Connect são mais confiáveis que surge pricing',
    ],
    dailyBaseRate: 0,
    perPersonRate: 0,
    fixedCostPerTrip: 18,
    variablePerDay: 0,
  },
  {
    id: 'shuttle',
    name: 'Shuttle / Transfer Privado',
    emoji: '🚌',
    tagline: 'Confortável do aeroporto ao hotel — menos flexível no dia a dia',
    description: 'Shuttles são ônibus ou vans compartilhadas que fazem rotas fixas, especialmente aeroporto–hotel. Empresas como Mears Connect (substituto do Magical Express da Disney) e SuperShuttle são populares. Transferes privados são mais caros mas sem paradas.',
    costPerDay: 0,
    costPerTrip: 28,
    costNotes: 'Shuttle compartilhado aeroporto→hotel: US$20–35/pessoa. Transfer privado: US$80–150 por veículo.',
    comfort: 3,
    flexibility: 2,
    economy: 4,
    convenience: 3,
    pros: [
      'Ótimo custo-benefício para traslado aeroporto–hotel',
      'Sem stress de navegar desconhecendo a cidade na chegada',
      'Motoristas experientes com a rota',
      'Transfer privado é porta a porta sem paradas',
      'Boa opção para grupos grandes com muito bagageiro',
    ],
    cons: [
      'Horários fixos — sem flexibilidade',
      'Shuttle compartilhado faz várias paradas (pode levar 1h+)',
      'Não serve bem para deslocamentos diários entre parques',
      'Custo por pessoa acumula em grupos grandes no transfer privado',
      'Poucos shuttles funcionam à noite',
    ],
    bestFor: [
      'Traslado aeroporto → hotel na chegada e saída',
      'Grupos grandes que não querem alugar vários carros',
      'Quem ficará exclusivamente em hotéis Disney ou Universal (que têm transporte próprio)',
    ],
    tips: [
      '💡 Mears Connect é o substituto oficial do extinto Disney Magical Express — reserve com antecedência',
      '💡 Para grupos de 4+ pessoas, um transfer privado pode sair mais barato que shuttle por pessoa',
      '💡 Sempre reserve o traslado de volta com antecedência — últimas horas antes do voo são críticas',
      '💡 Gorjeta de US$2–5 por pessoa para motoristas de shuttle é padrão em Orlando',
    ],
    dailyBaseRate: 0,
    perPersonRate: 28,
    fixedCostPerTrip: 28,
    variablePerDay: 0,
  },
  {
    id: 'lynx',
    name: 'Lynx (Ônibus Público)',
    emoji: '🚍',
    tagline: 'O mais barato — mas pouco prático para turistas nos parques',
    description: 'O Lynx é o sistema de ônibus público de Orlando. Funciona bem para alguns deslocamentos dentro da cidade, mas as rotas para os parques são lentas e com muitas conexões. Útil para quem está em região central e precisa de deslocamentos urbanos.',
    costPerDay: 4,
    costPerTrip: 2,
    costNotes: 'US$2,00 por viagem ou US$4,50 por dia (day pass). Semanal: US$16,00.',
    comfort: 2,
    flexibility: 2,
    economy: 5,
    convenience: 1,
    pros: [
      'Preço imbatível — US$2 por viagem',
      'Day pass de US$4,50 cobre viagens ilimitadas no dia',
      'Funciona bem para deslocamentos no International Drive e Downtown',
      'Linha I-Ride Trolley no I-Drive é bem conveniente para turistas',
    ],
    cons: [
      'Rotas para Disney e Universal são muito demoradas (60–90 min+)',
      'Pouca frequência — ônibus a cada 30–60 minutos',
      'Não recomendado com crianças pequenas ou muito bagageiro',
      'Horários reduzidos à noite e nos fins de semana',
      'Sem ar condicionado nos pontos de parada (calor de Orlando é real)',
    ],
    bestFor: [
      'Mochileiros e viajantes solo com orçamento muito limitado',
      'Deslocamentos dentro do International Drive (I-Ride Trolley)',
      'Quem está hospedado perto do Downtown Orlando e quer explorar a cidade',
    ],
    tips: [
      '💡 O I-Ride Trolley no International Drive custa US$1,25–2,50 e é ótimo para se locomover no I-Drive',
      '💡 Use o app Transit ou Google Maps para planejar rotas Lynx',
      '💡 Nunca dependa do Lynx para chegar a horários fixos nos parques',
      '💡 Combine Lynx para deslocamentos urbanos + Uber para os parques',
    ],
    dailyBaseRate: 4,
    perPersonRate: 0,
    fixedCostPerTrip: 2,
    variablePerDay: 4,
  },
  {
    id: 'disney_transport',
    name: 'Transporte Disney',
    emoji: '🏰',
    tagline: 'Gratuito e mágico — mas apenas entre propriedades Disney',
    description: 'Hóspedes dos hotéis Disney têm acesso gratuito a uma rede completa de transporte: ônibus temáticos, o Monorail, o Disney Skyliner (teleférico), barcos e o serviço de transfers do aeroporto. É conveniente, mas funciona apenas dentro do ecossistema Disney.',
    costPerDay: 0,
    costPerTrip: 0,
    costNotes: 'Gratuito para hóspedes dos hotéis Disney. Para não hóspedes, há cobranças em alguns serviços.',
    comfort: 4,
    flexibility: 3,
    economy: 5,
    convenience: 4,
    pros: [
      '100% gratuito para hóspedes dos hotéis Disney',
      'Disney Skyliner (teleférico) é uma experiência única e lindíssima',
      'Monorail conecta Grand Floridian, Polynesian e Contemporary direto ao Magic Kingdom',
      'Barcos fazem conexão entre vários resorts às margens dos lagos',
      'Ônibus diretos de todos os resorts para todos os parques',
      'Nenhuma preocupação com estacionamento no dia a dia',
    ],
    cons: [
      'Funciona apenas DENTRO da propriedade Disney — zero utilidade para Universal ou I-Drive',
      'Horários fixos — esperas de 15–25 minutos são normais',
      'Muito lotado nos horários de abertura e encerramento dos parques',
      'Não funciona para deslocamentos urbanos fora da Disney',
      'Para quem não é hóspede Disney, o acesso é limitado',
    ],
    bestFor: [
      'Hóspedes dos hotéis Walt Disney World Resort',
      'Famílias que vão focar exclusivamente nos parques Disney',
      'Quem quer eliminar qualquer custo de transporte dentro da Disney',
    ],
    tips: [
      '💡 O Skyliner conecta Pop Century, Art of Animation e Caribbean Beach direto ao Epcot e Hollywood Studios',
      '💡 Barcos saem de Hollywood Studios e Magic Kingdom — muito mais rápido e agradável que ônibus em alguns trajetos',
      '💡 Chegue ao ponto de ônibus 30 min antes da abertura do parque — lotam rápido',
      '💡 Para ir a Universal ou I-Drive saindo de um hotel Disney, use Uber — o transporte Disney não cobre',
    ],
    dailyBaseRate: 0,
    perPersonRate: 0,
    fixedCostPerTrip: 0,
    variablePerDay: 0,
  },
  {
    id: 'universal_transport',
    name: 'Transporte Universal',
    emoji: '🎢',
    tagline: 'Gratuito para hóspedes on-site — shuttle pago para o restante',
    description: 'Hóspedes dos hotéis on-site da Universal (Hard Rock, Portofino Bay, Royal Pacific, Cabana Bay, etc.) têm shuttles gratuitos para os parques. Existe também o serviço pago de shuttle do aeroporto e conexões com alguns hotéis off-site.',
    costPerDay: 0,
    costPerTrip: 0,
    costNotes: 'Gratuito para hóspedes on-site. Shuttle aeroporto→Universal: ~US$25–35/pessoa (Mears).',
    comfort: 3,
    flexibility: 3,
    economy: 5,
    convenience: 4,
    pros: [
      'Gratuito para hóspedes dos hotéis on-site Universal',
      'Hóspedes do Hard Rock, Portofino e Royal Pacific podem IR A PÉ até os parques!',
      'Barco gratuito conecta hotéis premium à entrada dos parques',
      'Sem custo de estacionamento para hóspedes on-site',
    ],
    cons: [
      'Apenas entre propriedades Universal — não serve para Disney',
      'Hóspedes off-site precisam pagar o estacionamento (~US$30/dia)',
      'Frequência menor que o transporte Disney',
    ],
    bestFor: [
      'Hóspedes dos hotéis on-site Universal',
      'Quem foca a viagem nos parques Universal (Studios, Islands of Adventure, Epic Universe)',
    ],
    tips: [
      '💡 Hard Rock Hotel fica a menos de 5 minutos a pé dos parques — o acesso a pé é uma das maiores vantagens',
      '💡 O barco saindo do Portofino Bay é uma experiência bonita e mais rápida que o ônibus',
      '💡 Para o Epic Universe (abertura 2025), verifique as rotas de transporte — estão sendo planejadas',
    ],
    dailyBaseRate: 0,
    perPersonRate: 0,
    fixedCostPerTrip: 0,
    variablePerDay: 0,
  },
];

export interface SimulatorInputs {
  people: number;
  days: number;
  hotelType: 'disney_onsite' | 'universal_onsite' | 'offsite';
  hasLicense: boolean;
  planOutside: boolean;
  drinksAtParks: boolean;
  tripsPerDay: number;
}

export interface SimulatorResult {
  mode: TransportMode;
  name: string;
  emoji: string;
  totalCost: number;
  dailyCost: number;
  breakdown: string;
  isRecommended: boolean;
  recommendationReason?: string;
  color: string;
  available: boolean;
}

export function calculateTransportCosts(inputs: SimulatorInputs): SimulatorResult[] {
  const { people, days, hotelType, hasLicense, planOutside, tripsPerDay } = inputs;
  const results: SimulatorResult[] = [];

  // Aluguel de Carro
  const carDailyBase = 55;
  const carInsurance = 15;
  const carGas = 8;
  const parkingPerDay = hotelType === 'disney_onsite' ? 0 : 28;
  const carTotal = (carDailyBase + carInsurance + carGas + parkingPerDay) * days;

  results.push({
    mode: 'rental_car',
    name: 'Aluguel de Carro',
    emoji: '🚗',
    totalCost: hasLicense ? carTotal : 0,
    dailyCost: hasLicense ? carTotal / days : 0,
    breakdown: hasLicense
      ? `US$${carDailyBase}/dia carro + US$${carInsurance} seguro + US$${carGas} gasolina${parkingPerDay > 0 ? ` + US$${parkingPerDay} estacionamento` : ' (estacionamento grátis no hotel Disney)'}`
      : 'Não disponível — necessita CNH internacional',
    isRecommended: false,
    color: 'blue',
    available: hasLicense,
  });

  // Uber / Lyft
  const tripsTotal = tripsPerDay * days;
  const avgUberTrip = 18 + (people > 4 ? 8 : 0);
  const surgeFactor = 1.25;
  const uberTotal = tripsTotal * avgUberTrip * surgeFactor;

  results.push({
    mode: 'uber_lyft',
    name: 'Uber / Lyft',
    emoji: '📱',
    totalCost: uberTotal,
    dailyCost: uberTotal / days,
    breakdown: `${tripsPerDay} corridas/dia × US$${avgUberTrip} média × ${days} dias (inclui +25% surge estimado)`,
    isRecommended: false,
    color: 'gray',
    available: true,
  });

  // Shuttle
  const shuttleAirport = people * 28 * 2;
  const shuttleParkDaily = people * 15;
  const shuttleTotal = shuttleAirport + shuttleParkDaily * days;

  results.push({
    mode: 'shuttle',
    name: 'Shuttle / Transfer',
    emoji: '🚌',
    totalCost: shuttleTotal,
    dailyCost: shuttleTotal / days,
    breakdown: `US$${shuttleAirport} aeroporto (ida+volta) + US$${people * 15}/dia/grupo para parques`,
    isRecommended: false,
    color: 'orange',
    available: true,
  });

  // Lynx
  const lynxDayPass = 4.5;
  const lynxTotal = lynxDayPass * days * people;

  results.push({
    mode: 'lynx',
    name: 'Lynx (Ônibus)',
    emoji: '🚍',
    totalCost: lynxTotal,
    dailyCost: lynxTotal / days,
    breakdown: `Day pass US$${lynxDayPass}/dia × ${people} pessoas × ${days} dias`,
    isRecommended: false,
    color: 'green',
    available: true,
  });

  // Disney Transport
  results.push({
    mode: 'disney_transport',
    name: 'Transporte Disney',
    emoji: '🏰',
    totalCost: 0,
    dailyCost: 0,
    breakdown: 'Gratuito para hóspedes dos hotéis Disney Resort',
    isRecommended: false,
    color: 'blue',
    available: hotelType === 'disney_onsite',
  });

  // Universal Transport
  results.push({
    mode: 'universal_transport',
    name: 'Transporte Universal',
    emoji: '🎢',
    totalCost: 0,
    dailyCost: 0,
    breakdown: 'Gratuito para hóspedes dos hotéis on-site Universal',
    isRecommended: false,
    color: 'yellow',
    available: hotelType === 'universal_onsite',
  });

  // Lógica de recomendação
  if (hotelType === 'disney_onsite') {
    const disneyOpt = results.find(r => r.mode === 'disney_transport');
    if (disneyOpt) {
      disneyOpt.isRecommended = true;
      disneyOpt.recommendationReason = 'Você está hospedado em hotel Disney — transporte gratuito para todos os parques Disney. Para Universal/I-Drive, use Uber.';
    }
  } else if (hotelType === 'universal_onsite') {
    const univOpt = results.find(r => r.mode === 'universal_transport');
    if (univOpt) {
      univOpt.isRecommended = true;
      univOpt.recommendationReason = 'Você está hospedado em hotel Universal — transporte gratuito. Para Disney/I-Drive, use Uber ou alugue um carro.';
    }
  } else if (hasLicense && (people >= 3 || days >= 6 || planOutside)) {
    const carOpt = results.find(r => r.mode === 'rental_car');
    if (carOpt) {
      carOpt.isRecommended = true;
      const reasons = [];
      if (people >= 3) reasons.push(`grupo de ${people} pessoas dilui o custo`);
      if (days >= 6) reasons.push(`${days} dias de estadia`);
      if (planOutside) reasons.push('você planeja sair da área turística');
      carOpt.recommendationReason = `Aluguel de carro é a opção mais econômica para você: ${reasons.join(', ')}.`;
    }
  } else {
    const uberOpt = results.find(r => r.mode === 'uber_lyft');
    if (uberOpt) {
      uberOpt.isRecommended = true;
      uberOpt.recommendationReason = !hasLicense
        ? 'Sem CNH internacional, Uber/Lyft é sua principal opção. Prático e sem preocupação com estacionamento.'
        : `Para ${people} pessoa(s) em ${days} dias sem planos fora da área turística, Uber é mais prático que alugar um carro.`;
    }
  }

  return results.sort((a, b) => {
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    if (a.totalCost === 0 && b.totalCost === 0) return 0;
    if (a.totalCost === 0) return -1;
    if (b.totalCost === 0) return 1;
    return a.totalCost - b.totalCost;
  });
}
