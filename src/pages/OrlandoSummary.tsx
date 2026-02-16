import { FerrisWheel, ShoppingBag, Hotel, Car, UtensilsCrossed, Sparkles, MapPin, Star, Check, DollarSign, Crown, Compass } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';

const sections = [
  {
    id: 'antes-de-ir',
    title: 'Antes de Ir',
    subtitle: 'Documentação, visto e preparativos essenciais',
    icon: Check,
    color: 'from-indigo-500 to-blue-500',
    shadowColor: 'shadow-indigo-500/30',
    items: [
      {
        title: 'Passaporte e Visto Americano',
        description: 'O passaporte deve ter validade mínima de 6 meses. O visto de turista (B1/B2) é obrigatório para brasileiros e a entrevista é agendada pelo site do consulado (CASV). O processo leva em média de 2 a 4 semanas.',
        badge: 'Obrigatório',
        badgeColor: 'bg-red-500/20 text-red-400',
      },
      {
        title: 'Melhor Época para Ir',
        description: 'Setembro a novembro e janeiro a fevereiro são meses com menos multidão e preços mais baixos. Evite feriados americanos (Thanksgiving, Spring Break, 4 de julho) se busca parques mais vazios. O verão (jun-ago) é quente e lotado.',
        badge: 'Dica de Ouro',
        badgeColor: 'bg-amber-500/20 text-amber-400',
      },
      {
        title: 'Quantos Dias Ficar?',
        description: 'O ideal é de 12 a 16 dias para conhecer os principais parques, fazer compras e curtir com calma. Viagens de 7 a 10 dias funcionam, mas exigem mais planejamento. Um dia de descanso a cada 2-3 dias de parque é essencial.',
        badge: '12-16 dias',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Seguro Viagem',
        description: 'Não é obrigatório, mas é altamente recomendado. Uma consulta médica nos EUA pode custar milhares de dólares. Contrate um seguro com cobertura mínima de US$ 50.000 para despesas médicas.',
        badge: 'Recomendado',
        badgeColor: 'bg-emerald-500/20 text-emerald-400',
      },
      {
        title: 'Chip de Celular Internacional',
        description: 'Compre um chip internacional antes de viajar (America Chip, Airalo, etc.) para ter internet desde o desembarque. Essencial para GPS, tradutores e apps dos parques. Funciona por eSIM ou chip físico.',
        badge: 'Essencial',
        badgeColor: 'bg-violet-500/20 text-violet-400',
      },
    ],
  },
  {
    id: 'parques',
    title: 'Parques Temáticos',
    subtitle: 'Os melhores parques do mundo reunidos em um só lugar',
    icon: FerrisWheel,
    color: 'from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-500/30',
    items: [
      {
        title: 'Walt Disney World Resort',
        description: 'O maior complexo de parques do mundo com 4 parques temáticos: Magic Kingdom (castelo, clássicos), EPCOT (tecnologia e culturas), Hollywood Studios (Star Wars, Toy Story) e Animal Kingdom (natureza e Avatar). Reserve 1 dia inteiro para cada parque.',
        badge: '4 Parques',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Universal Orlando Resort',
        description: 'Universal Studios (Transformers, Minions), Islands of Adventure (Harry Potter, Jurassic World) e o novíssimo Epic Universe (Nintendo, How to Train Your Dragon). As áreas temáticas de Harry Potter são imperdíveis!',
        badge: '3 Parques',
        badgeColor: 'bg-purple-500/20 text-purple-400',
      },
      {
        title: 'SeaWorld e Parques Aquáticos',
        description: 'SeaWorld (shows marinhos + montanhas-russas radicais), Aquatica (parque aquático), Discovery Cove (nado com golfinhos). Disney também tem Typhoon Lagoon e Blizzard Beach, e a Universal tem o Volcano Bay.',
        badge: '6+ Opções',
        badgeColor: 'bg-cyan-500/20 text-cyan-400',
      },
      {
        title: 'Busch Gardens Tampa Bay',
        description: 'A 1h de Orlando, combina zoológico de classe mundial com as montanhas-russas mais radicais da Flórida (SheiKra, Cheetah Hunt, Iron Gwazi). Vale muito o bate-volta!',
        badge: '~1h de Orlando',
        badgeColor: 'bg-orange-500/20 text-orange-400',
      },
      {
        title: 'LEGOLAND Florida',
        description: 'Ideal para crianças de 2 a 12 anos. Fica em Winter Haven (~45 min de Orlando) com atrações interativas, shows e um parque aquático. Perfeito para famílias com crianças pequenas.',
        badge: 'Crianças',
        badgeColor: 'bg-yellow-500/20 text-yellow-400',
      },
    ],
  },
  {
    id: 'ingressos',
    title: 'Ingressos e Filas',
    subtitle: 'Como comprar e estratégias para aproveitar mais',
    icon: Crown,
    color: 'from-yellow-500 to-amber-500',
    shadowColor: 'shadow-yellow-500/30',
    items: [
      {
        title: 'Onde Comprar Ingressos',
        description: 'Compre sempre com antecedência por sites autorizados ou agências brasileiras especializadas. Nunca compre de cambistas ou sites não oficiais. Ingressos de múltiplos dias são proporcionalmente mais baratos.',
        badge: 'Antecedência',
        badgeColor: 'bg-amber-500/20 text-amber-400',
      },
      {
        title: 'Lightning Lane (Disney)',
        description: 'Sistema pago para furar filas na Disney. O Lightning Lane Multi Pass permite agendar 3 atrações por vez. O Lightning Lane Single Pass dá acesso às atrações mais concorridas por um valor extra. Vale muito em dias lotados!',
        badge: 'Fura-Fila',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Express Pass (Universal)',
        description: 'O Universal Express permite pular a fila das principais atrações 1 vez cada. O Express Unlimited permite quantas vezes quiser. Hóspedes de hotéis premium da Universal ganham o Unlimited incluso!',
        badge: 'Premium',
        badgeColor: 'bg-purple-500/20 text-purple-400',
      },
      {
        title: 'Estratégias de Fila',
        description: 'Chegue 30 min antes da abertura, comece pelas atrações mais populares, use Single Rider quando disponível e aproveite a última hora do parque quando as filas diminuem bastante.',
        badge: 'Dica Pro',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
    ],
  },
  {
    id: 'compras',
    title: 'Compras',
    subtitle: 'Outlets, shoppings e lojas temáticas',
    icon: ShoppingBag,
    color: 'from-pink-500 to-rose-500',
    shadowColor: 'shadow-pink-500/30',
    items: [
      {
        title: 'Outlets Premium',
        description: 'Orlando Vineland Premium Outlets e International Premium Outlets são os mais populares. Marcas como Nike, Adidas, Coach, Michael Kors, Tommy Hilfiger com até 70% de desconto. Separe pelo menos meio dia para cada.',
        badge: 'Até 70% OFF',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
      {
        title: 'Shoppings e Lojas',
        description: 'The Mall at Millenia (luxo: Gucci, Louis Vuitton), Florida Mall (maior da região), Target e Walmart (eletrônicos, roupas, produtos de casa com ótimos preços). Ross e Marshalls para pechinchas.',
        badge: 'Variedade',
        badgeColor: 'bg-pink-500/20 text-pink-400',
      },
      {
        title: 'Disney Springs e CityWalk',
        description: 'Áreas de entretenimento com lojas temáticas (World of Disney é a maior loja Disney do mundo!), restaurantes e shows. Entrada gratuita e estacionamento gratuito. Ótima opção para dias sem parque.',
        badge: 'Entrada Grátis',
        badgeColor: 'bg-violet-500/20 text-violet-400',
      },
      {
        title: 'Dicas de Economia',
        description: 'Baixe o app "RetailMeNot" para cupons extras. Compre eletrônicos na Best Buy ou Apple Store (sem imposto sobre eletrônicos na Flórida!). O imposto geral da Flórida é de ~6.5% e já é adicionado no caixa.',
        badge: 'Economia',
        badgeColor: 'bg-emerald-500/20 text-emerald-400',
      },
    ],
  },
  {
    id: 'hoteis',
    title: 'Hospedagem',
    subtitle: 'Resorts, hotéis e casas de temporada',
    icon: Hotel,
    color: 'from-amber-500 to-yellow-500',
    shadowColor: 'shadow-amber-500/30',
    items: [
      {
        title: 'Resorts Disney',
        description: 'De econômicos (All-Star) a luxuosos (Grand Floridian). Benefícios: Early Entry (30 min antes), transporte gratuito, MagicBand+ incluso e Lightning Lane antecipado. O Skyliner conecta EPCOT e Hollywood Studios.',
        badge: 'Benefícios',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Hotéis Universal',
        description: 'Hotéis premium (Royal Pacific, Hard Rock, Portofino) incluem Express Unlimited Pass grátis – uma economia enorme! Hotéis value (Endless Summer) oferecem Early Park Admission e transporte.',
        badge: 'Express Grátis',
        badgeColor: 'bg-purple-500/20 text-purple-400',
      },
      {
        title: 'Hotéis na International Drive',
        description: 'A I-Drive é a região mais central e com melhor custo-benefício. Redes como Hilton, Marriott, Hampton Inn e Holiday Inn. Perto de outlets, restaurantes e com fácil acesso aos parques.',
        badge: 'Custo-Benefício',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
      {
        title: 'Casas de Temporada',
        description: 'Condomínios como Reunion, Champions Gate e Storey Lake oferecem casas com 4-8 quartos, piscina privativa, cozinha completa e lavanderia. Ideal para grupos grandes e estadias longas. Reserve pelo Vrbo ou Airbnb.',
        badge: 'Famílias',
        badgeColor: 'bg-amber-500/20 text-amber-400',
      },
    ],
  },
  {
    id: 'carro',
    title: 'Transporte',
    subtitle: 'Aluguel de carro, GPS e locomoção',
    icon: Car,
    color: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/30',
    items: [
      {
        title: 'Por que Alugar Carro?',
        description: 'Orlando é uma cidade espalhada – as distâncias são grandes. Carro é essencial para ir aos outlets, restaurantes fora dos parques, farmácias e supermercados. Uber funciona bem, mas sai caro para famílias ao longo de vários dias.',
        badge: 'Essencial',
        badgeColor: 'bg-emerald-500/20 text-emerald-400',
      },
      {
        title: 'Locadoras Recomendadas',
        description: 'Alamo (favorita dos brasileiros, aceita CNH do Brasil), Budget e National (bom custo-benefício), Hertz (serviço premium). Reserve com antecedência pelo RentCars ou direto no site da locadora.',
        badge: 'Dica',
        badgeColor: 'bg-teal-500/20 text-teal-400',
      },
      {
        title: 'Pedágios e GPS',
        description: 'Pedágios são eletrônicos (SunPass/E-Pass). As locadoras oferecem o serviço por ~US$3-5/dia (Plate Pass) ou você pode comprar seu próprio SunPass. Use Google Maps ou Waze – funciona perfeitamente.',
        badge: 'Simples',
        badgeColor: 'bg-sky-500/20 text-sky-400',
      },
      {
        title: 'Gasolina e Estacionamento',
        description: 'Gasolina é muito mais barata que no Brasil (~US$3-4/galão). Abasteça em postos fora das áreas turísticas. Estacionamento nos parques Disney custa ~US$30/dia (grátis para hóspedes Disney). Universal cobra ~US$30-50.',
        badge: 'Economia',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
    ],
  },
  {
    id: 'alimentacao',
    title: 'Alimentação',
    subtitle: 'Gastronomia para todos os gostos e bolsos',
    icon: UtensilsCrossed,
    color: 'from-red-500 to-orange-500',
    shadowColor: 'shadow-red-500/30',
    items: [
      {
        title: 'Dentro dos Parques',
        description: 'Quick Service (fast food temático, US$12-18 por refeição) e Table Service (restaurantes com garçom, US$25-60). Você pode levar lanches e garrafinhas de água. Peça "cup of ice water" em qualquer lanchonete gratuitamente!',
        badge: 'Dica: Água Grátis',
        badgeColor: 'bg-cyan-500/20 text-cyan-400',
      },
      {
        title: 'Restaurantes Populares',
        description: 'Olive Garden, Red Lobster, Outback, TGI Fridays e Cheesecake Factory são redes acessíveis e com porções generosas. Texas de Brazil e Fogo de Chão para quem sente falta da churrascaria brasileira.',
        badge: 'Para Todos',
        badgeColor: 'bg-red-500/20 text-red-400',
      },
      {
        title: 'Refeições com Personagens',
        description: "Chef Mickey's (café da manhã com Mickey), Cinderella's Royal Table (dentro do castelo!), Tusker House (Animal Kingdom) e Garden Grill (EPCOT). Reserve com 60 dias de antecedência – lotam rápido!",
        badge: 'Reserve Antes!',
        badgeColor: 'bg-violet-500/20 text-violet-400',
      },
      {
        title: 'Economia na Alimentação',
        description: 'Faça café da manhã no hotel, compre lanches e bebidas no Walmart/Target para levar ao parque, e jante fora dos parques. Um cooler no carro com água e snacks economiza muito ao longo da viagem.',
        badge: 'Economia',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
    ],
  },
  {
    id: 'dinheiro',
    title: 'Dinheiro e Orçamento',
    subtitle: 'Câmbio, cartões e quanto levar',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    shadowColor: 'shadow-green-500/30',
    items: [
      {
        title: 'Cartão Internacional',
        description: 'Leve um cartão de débito internacional (Wise, C6 Bank, Nomad) para as compras do dia a dia. O IOF é de 4,38% para cartão de crédito e 1,1% para cartão de débito internacional. Avise seu banco antes de viajar!',
        badge: 'Menor IOF',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
      {
        title: 'Dinheiro em Espécie',
        description: 'Leve US$100-200 em espécie para gorjetas, pedágios e emergências. O restante use cartão. Não troque dólar em casas de câmbio do aeroporto (cotação ruim). Compre antes no Brasil com antecedência.',
        badge: 'US$100-200',
        badgeColor: 'bg-amber-500/20 text-amber-400',
      },
      {
        title: 'Quanto Custa a Viagem?',
        description: 'Para uma família de 4 pessoas, 14 dias: passagens (~R$12-20mil), hospedagem (~R$8-15mil), ingressos (~R$8-12mil), alimentação (~R$5-8mil), carro (~R$3-5mil), compras (varia). Total médio: R$40-70mil dependendo do estilo.',
        badge: 'Planeje-se',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Gorjetas (Tips)',
        description: 'Gorjetas são obrigatórias nos EUA! Restaurantes: 18-20% da conta. Camareiras de hotel: US$2-5/dia. Motoristas de Uber: 15-20%. Não dar gorjeta é considerado muito rude e o serviço pode ser afetado.',
        badge: '18-20%',
        badgeColor: 'bg-orange-500/20 text-orange-400',
      },
    ],
  },
  {
    id: 'apps',
    title: 'Apps Essenciais',
    subtitle: 'Aplicativos que vão salvar sua viagem',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-500',
    shadowColor: 'shadow-violet-500/30',
    items: [
      {
        title: 'My Disney Experience',
        description: 'App oficial da Disney para ver filas em tempo real, agendar Lightning Lane, fazer pedidos de comida (Mobile Order), ver mapa do parque e gerenciar reservas de restaurantes. Instale e configure ANTES da viagem.',
        badge: 'Disney',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Universal Orlando Resort',
        description: 'App oficial da Universal com filas em tempo real, compra de Express Pass, mapa interativo e Virtual Line (fila virtual) para atrações selecionadas. Essencial para o Epic Universe!',
        badge: 'Universal',
        badgeColor: 'bg-purple-500/20 text-purple-400',
      },
      {
        title: 'Google Maps / Waze',
        description: 'GPS indispensável para se locomover. O Waze avisa sobre radares e trânsito. Salve seus destinos favoritos (hotel, parques, outlets) como favoritos para facilitar a navegação diária.',
        badge: 'Navegação',
        badgeColor: 'bg-emerald-500/20 text-emerald-400',
      },
      {
        title: 'Google Tradutor',
        description: 'Baixe o idioma inglês para uso offline. O recurso de câmera traduz placas e menus em tempo real. Muito útil em restaurantes e farmácias. A maioria dos locais turísticos tem atendentes que falam espanhol.',
        badge: 'Tradutor',
        badgeColor: 'bg-amber-500/20 text-amber-400',
      },
    ],
  },
];

const OrlandoSummary = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AppLayout>
      <SEO
        title="Resumo de Orlando | Orlando Fast Pass"
        description="Tudo que você precisa saber sobre Orlando: parques, compras, hotéis, alimentação e transporte."
      />

      <div className="space-y-6 sm:space-y-8 pb-12">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent p-5 sm:p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative z-10">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float flex-shrink-0">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-display font-bold text-white leading-tight">
                  Resumo de Orlando
                </h1>
                <p className="text-white/80 text-sm sm:text-lg">Seu guia completo para uma viagem inesquecível ✨</p>
              </div>
            </div>

            {/* Intro text */}
            <p className="text-white/70 text-sm sm:text-base max-w-2xl leading-relaxed">
              Nunca foi para Orlando? Sem problema! Aqui você encontra tudo o que precisa saber 
              para planejar sua viagem dos sonhos: desde documentação até dicas de economia nos parques.
            </p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Compass className="w-4 h-4" />
            <span className="text-sm font-medium">Navegação Rápida</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`group flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl bg-gradient-to-r ${section.color} text-white text-xs font-medium shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300`}
              >
                <section.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sections as Accordions */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} data-section={section.id}>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value={section.id}
                  className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden"
                >
                  <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg ${section.shadowColor} flex-shrink-0`}>
                        <section.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="text-left min-w-0">
                        <h3 className="font-display font-bold text-base sm:text-xl">{section.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{section.subtitle}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 sm:px-6 pb-6">
                    <div className="space-y-4">
                      {section.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:border-border transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h5 className="font-semibold text-foreground flex items-center gap-2">
                              <Star className="w-4 h-4 text-secondary flex-shrink-0" />
                              {item.title}
                            </h5>
                            <Badge className={`${item.badgeColor} border-0 text-xs whitespace-nowrap`}>
                              {item.badge}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Explore cada detalhe com o Orlando Fast Pass e transforme sua viagem em uma experiência perfeita. ✨
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default OrlandoSummary;
