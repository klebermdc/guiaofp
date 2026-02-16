import { FerrisWheel, ShoppingBag, Hotel, Car, UtensilsCrossed, Sparkles, MapPin, Star, Check, DollarSign, Crown, Compass } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';

const sections = [
  {
    id: 'parques',
    title: 'Parques Temáticos',
    subtitle: 'Os melhores parques do mundo',
    icon: FerrisWheel,
    color: 'from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-500/30',
    items: [
      {
        title: 'Walt Disney World Resort',
        description: 'Onde a magia ganha vida com 4 parques temáticos icônicos: Magic Kingdom, EPCOT, Hollywood Studios e Animal Kingdom.',
        badge: '4 Parques',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Universal Orlando Resort',
        description: 'Aventura e adrenalina nos parques Universal Studios, Islands of Adventure e o novíssimo Epic Universe.',
        badge: '3 Parques',
        badgeColor: 'bg-purple-500/20 text-purple-400',
      },
      {
        title: 'SeaWorld Orlando',
        description: 'Mergulhe no mundo marinho com shows incríveis e montanhas-russas emocionantes como a Mako e a Kraken.',
        badge: 'Imperdível',
        badgeColor: 'bg-cyan-500/20 text-cyan-400',
      },
      {
        title: 'Busch Gardens Tampa Bay',
        description: 'Uma mistura eletrizante de parques temáticos e zoológico, a apenas 1h de Orlando. Montanhas-russas radicais!',
        badge: '~1h de Orlando',
        badgeColor: 'bg-orange-500/20 text-orange-400',
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
        description: 'Orlando Premium Outlets (Vineland e International) com as melhores marcas como Nike, Adidas, Coach e Michael Kors com até 70% de desconto.',
        badge: 'Até 70% OFF',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
      {
        title: 'Shoppings Centers',
        description: 'The Mall at Millenia (luxo), Florida Mall (maior da região) e The Pointe Orlando para compras e entretenimento.',
        badge: 'Variedade',
        badgeColor: 'bg-pink-500/20 text-pink-400',
      },
      {
        title: 'Lojas Temáticas',
        description: 'World of Disney em Disney Springs, Universal CityWalk e as lojas dentro dos parques com produtos exclusivos dos seus personagens favoritos.',
        badge: 'Exclusivos',
        badgeColor: 'bg-violet-500/20 text-violet-400',
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
        title: 'Resorts Temáticos',
        description: 'Viva a imersão completa dentro dos complexos Disney ou Universal. Benefícios exclusivos como Early Entry e transporte incluso.',
        badge: 'Premium',
        badgeColor: 'bg-amber-500/20 text-amber-400',
      },
      {
        title: 'Hotéis Econômicos',
        description: 'Redes como Hampton Inn, Holiday Inn e Best Western oferecem conforto e praticidade com excelente custo-benefício na International Drive.',
        badge: 'Custo-Benefício',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
      {
        title: 'Aluguel de Casas',
        description: 'Casas em condomínios como Reunion e Champions Gate são perfeitas para famílias grandes, com piscina privativa e mais espaço.',
        badge: 'Famílias',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
    ],
  },
  {
    id: 'carro',
    title: 'Transporte',
    subtitle: 'Aluguel de carro e locomoção',
    icon: Car,
    color: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/30',
    items: [
      {
        title: 'Liberdade para Explorar',
        description: 'Alugar um carro é indispensável para otimizar tempo e visitar outlets, restaurantes e parques no seu ritmo.',
        badge: 'Recomendado',
        badgeColor: 'bg-emerald-500/20 text-emerald-400',
      },
      {
        title: 'Opções de Locadoras',
        description: 'Alamo (favorita dos brasileiros), Budget (melhor custo-benefício) e Hertz (serviço premium). Reserve com antecedência para melhores preços.',
        badge: '3 Opções',
        badgeColor: 'bg-teal-500/20 text-teal-400',
      },
      {
        title: 'Fácil Navegação',
        description: 'Estradas bem sinalizadas, GPS no celular é suficiente. Pedágios são cobrados via SunPass (incluso na devolução do carro). Gasolina muito mais barata que no Brasil.',
        badge: 'Simples',
        badgeColor: 'bg-sky-500/20 text-sky-400',
      },
    ],
  },
  {
    id: 'alimentacao',
    title: 'Alimentação',
    subtitle: 'Gastronomia para todos os gostos',
    icon: UtensilsCrossed,
    color: 'from-red-500 to-orange-500',
    shadowColor: 'shadow-red-500/30',
    items: [
      {
        title: 'Gastronomia Diversificada',
        description: 'De fast food a restaurantes gourmet, Orlando oferece opções para todos os paladares e orçamentos. Redes como Olive Garden, Red Lobster e Outback são populares.',
        badge: 'Para Todos',
        badgeColor: 'bg-red-500/20 text-red-400',
      },
      {
        title: 'Refeições com Personagens',
        description: "Chef Mickey's, Cinderella's Royal Table e Tusker House oferecem experiências gastronômicas inesquecíveis com seus personagens favoritos.",
        badge: 'Experiência Única',
        badgeColor: 'bg-violet-500/20 text-violet-400',
      },
      {
        title: 'Opções Saudáveis',
        description: 'A cidade oferece diversas alternativas veganas, vegetarianas e sem glúten tanto dentro dos parques quanto nos restaurantes da cidade.',
        badge: 'Inclusivo',
        badgeColor: 'bg-green-500/20 text-green-400',
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
              Orlando é a capital mundial da diversão, um destino que transcende idades e oferece 
              experiências inesquecíveis para todos. Conheça tudo o que você precisa saber!
            </p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Compass className="w-4 h-4" />
            <span className="text-sm font-medium">Navegação Rápida</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {sections.map((section) => (
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
