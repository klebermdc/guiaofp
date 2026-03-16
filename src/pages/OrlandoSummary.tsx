import { FerrisWheel, ShoppingBag, Hotel, Car, UtensilsCrossed, Sparkles, MapPin, Star, Check, DollarSign, Crown, Compass } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';

const sections = [
  {
    id: 'antes-de-ir',
    title: 'Antes de Ir',
    subtitle: 'Prepare-se com antecedência e comece a viver a magia',
    icon: Check,
    color: 'from-indigo-500 to-blue-500',
    shadowColor: 'shadow-indigo-500/30',
    items: [
      {
        title: 'Passaporte e Visto Americano',
        description: 'Antes de sonhar com os parques, é fundamental garantir que toda a documentação esteja em ordem. Seu passaporte deve ter validade mínima de seis meses após a data prevista de retorno ao Brasil. Para entrar nos Estados Unidos, brasileiros precisam do visto de turismo (categoria B1/B2), que envolve preenchimento de formulário, pagamento de taxa e entrevista no consulado. Esse processo pode levar semanas ou até meses, dependendo da disponibilidade de agendamento. Quanto antes você iniciar, mais tranquilidade terá para planejar o restante da viagem.',
        badge: 'Obrigatório',
        badgeColor: 'bg-red-500/20 text-red-400',
      },
      {
        title: 'Melhor Época para Viajar',
        description: 'Escolher o período certo faz toda a diferença na experiência. Meses como janeiro, fevereiro, setembro e novembro costumam ter parques menos cheios, clima mais agradável e melhores preços. Já o verão americano, a Spring Break e grandes feriados podem trazer calor intenso, chuvas frequentes no fim da tarde e multidões. Planejar a viagem na época ideal ajuda você a aproveitar mais, descansar melhor e sentir a magia sem pressa.',
        badge: 'Dica de Ouro',
        badgeColor: 'bg-amber-500/20 text-amber-400',
      },
      {
        title: 'Quantos Dias Ficar?',
        description: 'Orlando é um destino que merece ser vivido com calma. Uma viagem de doze a dezesseis dias permite conhecer os principais parques, explorar outlets, curtir restaurantes e ainda ter momentos de descanso. Se o tempo for mais curto, viagens de sete a dez dias também funcionam, desde que o roteiro seja bem planejado. Incluir pausas estratégicas a cada dois ou três dias de parque é essencial para manter o ritmo e aproveitar cada momento com energia.',
        badge: '12-16 dias',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Seguro Viagem',
        description: 'Viajar com segurança é viajar com tranquilidade. Embora não seja obrigatório, o seguro viagem é altamente recomendado. Um atendimento médico nos Estados Unidos pode custar milhares de dólares e transformar um imprevisto em grande preocupação. Escolher uma cobertura adequada garante proteção, suporte e paz de espírito para você focar apenas no que realmente importa: viver experiências inesquecíveis.',
        badge: 'Recomendado',
        badgeColor: 'bg-emerald-500/20 text-emerald-400',
      },
      {
        title: 'Chip de Celular Internacional',
        description: 'Estar conectado desde o desembarque faz toda a diferença. Com um chip internacional ativo, você terá acesso ao GPS, aplicativos dos parques, reservas, tradutores e comunicação com sua família e grupo de viagem. Essa praticidade ajuda a evitar estresse, otimiza o tempo e torna cada dia mais leve e organizado. O serviço pode funcionar por eSIM ou chip físico, conforme o modelo do seu aparelho.',
        badge: 'Essencial',
        badgeColor: 'bg-violet-500/20 text-violet-400',
      },
    ],
  },
  {
    id: 'parques',
    title: 'Parques Temáticos',
    subtitle: 'A diversão não é apenas intensa — ela é inesquecível',
    icon: FerrisWheel,
    color: 'from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-500/30',
    items: [
      {
        title: 'Walt Disney World Resort',
        description: 'Aqui estão os sonhos que marcaram gerações. O maior complexo de entretenimento do mundo reúne quatro parques completamente diferentes entre si. No Magic Kingdom, o castelo e os personagens criam a atmosfera mais clássica e encantadora. O EPCOT mistura tecnologia, culturas e experiências gastronômicas. O Hollywood Studios leva você para dentro dos filmes e das histórias mais famosas. E o Animal Kingdom conecta emoção e natureza de uma forma surpreendente. O ideal é dedicar um dia inteiro para cada parque e viver cada detalhe com calma.',
        badge: '4 Parques',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Universal Orlando Resort',
        description: 'Um destino perfeito para quem busca adrenalina, inovação e imersão total. O Universal Studios traz atrações cinematográficas e dinâmicas. O Islands of Adventure concentra algumas das montanhas-russas mais emocionantes da região. E o Epic Universe representa a nova geração de parques temáticos, com áreas altamente imersivas e tecnologia de ponta. As áreas temáticas de Harry Potter são experiências que vão muito além de uma atração — são verdadeiros cenários vivos.',
        badge: '3 Parques',
        badgeColor: 'bg-purple-500/20 text-purple-400',
      },
      {
        title: 'SeaWorld e Parques Aquáticos',
        description: 'Uma combinação equilibrada entre emoção, relaxamento e experiências diferentes. O SeaWorld reúne montanhas-russas radicais e apresentações com temática marinha. O Aquatica é ideal para dias de calor, com toboáguas e áreas de descanso. O Discovery Cove proporciona uma experiência exclusiva e limitada, com interação com animais e ambiente mais tranquilo. Além disso, Orlando conta com excelentes parques aquáticos da Disney e da Universal, perfeitos para alternar o ritmo da viagem.',
        badge: '6+ Opções',
        badgeColor: 'bg-cyan-500/20 text-cyan-400',
      },
      {
        title: 'Busch Gardens Tampa Bay',
        description: 'Para quem ama adrenalina de verdade, este parque é uma extensão imperdível da viagem. Localizado a cerca de uma hora de Orlando, combina um zoológico de padrão internacional com algumas das montanhas-russas mais intensas da Flórida. É uma excelente opção de bate-volta para incluir ainda mais emoção no roteiro.',
        badge: '~1h de Orlando',
        badgeColor: 'bg-orange-500/20 text-orange-400',
      },
      {
        title: 'LEGOLAND Florida',
        description: 'Um parque pensado especialmente para famílias com crianças menores. Com atrações interativas, shows e áreas criativas, proporciona um dia mais leve e divertido. Localizado em Winter Haven, a aproximadamente quarenta e cinco minutos de Orlando, também conta com parque aquático e estrutura confortável para um passeio tranquilo.',
        badge: 'Crianças',
        badgeColor: 'bg-yellow-500/20 text-yellow-400',
      },
    ],
  },
  {
    id: 'ingressos',
    title: 'Ingressos e Filas',
    subtitle: 'O que separa uma viagem comum de uma experiência incrível',
    icon: Crown,
    color: 'from-yellow-500 to-amber-500',
    shadowColor: 'shadow-yellow-500/30',
    items: [
      {
        title: 'Onde Comprar Ingressos',
        description: 'Garantir seus ingressos com antecedência traz segurança, economia e tranquilidade para o planejamento. Dê preferência a agências especializadas e canais autorizados, evitando riscos com revendedores informais ou sites não confiáveis. Ingressos para vários dias costumam ter melhor custo-benefício e permitem montar um roteiro mais estratégico, sem correria.',
        badge: 'Antecedência',
        badgeColor: 'bg-amber-500/20 text-amber-400',
      },
      {
        title: 'Lightning Lane (Disney)',
        description: 'O sistema de acesso rápido às atrações da Disney pode transformar completamente o seu dia no parque. Com o Lightning Lane Multi Pass, é possível agendar experiências ao longo do dia e reduzir significativamente o tempo em filas. Já o Lightning Lane Single Pass oferece acesso às atrações mais concorridas mediante pagamento adicional. Em períodos de maior movimento, utilizar essa estratégia pode significar mais atrações e menos desgaste.',
        badge: 'Fura-Fila',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Express Pass (Universal)',
        description: 'Na Universal, o Express Pass permite pular a fila das principais atrações e otimizar o tempo dentro dos parques. Na versão tradicional, o acesso rápido é válido uma vez por atração. Já o Express Unlimited possibilita repetir quantas vezes desejar. Hóspedes de alguns hotéis premium da Universal recebem o benefício Unlimited incluído, o que pode representar grande vantagem no planejamento.',
        badge: 'Premium',
        badgeColor: 'bg-purple-500/20 text-purple-400',
      },
      {
        title: 'Estratégias Inteligentes de Fila',
        description: 'Algumas decisões simples fazem enorme diferença no rendimento do dia. Chegar antes da abertura ajuda a aproveitar as atrações mais populares com menor espera. Utilizar a fila Single Rider quando disponível pode reduzir o tempo de espera. E permanecer até as últimas horas do parque costuma ser uma excelente estratégia, pois muitas filas diminuem consideravelmente. Com organização e planejamento, é possível viver muito mais experiências sem aumentar o cansaço.',
        badge: 'Dica Pro',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
    ],
  },
  {
    id: 'compras',
    title: 'Compras',
    subtitle: 'Grandes marcas, preços excelentes e experiências únicas',
    icon: ShoppingBag,
    color: 'from-pink-500 to-rose-500',
    shadowColor: 'shadow-pink-500/30',
    items: [
      {
        title: 'Outlets Premium',
        description: 'Os outlets de Orlando são famosos pela enorme variedade de marcas e pelos descontos atrativos. O Orlando Vineland Premium Outlets e o Orlando International Premium Outlets são os mais conhecidos e reúnem lojas como Nike, Adidas, Coach, Michael Kors e Tommy Hilfiger, muitas vezes com descontos que podem chegar a setenta por cento. Para aproveitar bem, reserve pelo menos meio dia para cada outlet e vá preparado para caminhar bastante.',
        badge: 'Até 70% OFF',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
      {
        title: 'Shoppings e Grandes Lojas',
        description: 'Além dos outlets, Orlando oferece shoppings e grandes lojas com propostas diferentes. O The Mall at Millenia reúne marcas de luxo e lojas sofisticadas. O Florida Mall é um dos maiores centros de compras da região e tem grande variedade de lojas. Para quem busca preços ainda mais baixos, redes como Target, Walmart, Ross e Marshalls costumam oferecer ótimas oportunidades em roupas, eletrônicos e itens para casa.',
        badge: 'Variedade',
        badgeColor: 'bg-pink-500/20 text-pink-400',
      },
      {
        title: 'Disney Springs e CityWalk',
        description: 'Esses complexos de entretenimento combinam compras, restaurantes e experiências únicas. No Disney Springs você encontra a maior loja Disney do mundo, além de diversas lojas temáticas e restaurantes famosos. O CityWalk, localizado na Universal, também reúne lojas, bares e atrações noturnas. Ambos têm entrada gratuita e são ótimas opções para dias de descanso ou noites mais tranquilas.',
        badge: 'Entrada Grátis',
        badgeColor: 'bg-violet-500/20 text-violet-400',
      },
      {
        title: 'Dicas de Economia',
        description: 'Algumas estratégias simples ajudam a economizar ainda mais. Aplicativos de cupons podem oferecer descontos extras em diversas lojas. Eletrônicos costumam ter bons preços em redes especializadas como Best Buy e Apple Store. Na Flórida, o imposto sobre compras gira em torno de seis vírgula cinco por cento e normalmente já aparece somado no valor final no momento do pagamento.',
        badge: 'Economia',
        badgeColor: 'bg-emerald-500/20 text-emerald-400',
      },
    ],
  },
  {
    id: 'hoteis',
    title: 'Hospedagem',
    subtitle: 'Onde você se hospeda influencia diretamente na viagem',
    icon: Hotel,
    color: 'from-amber-500 to-yellow-500',
    shadowColor: 'shadow-amber-500/30',
    items: [
      {
        title: 'Resorts Disney',
        description: 'Hospedar-se dentro do complexo Disney é mergulhar completamente na atmosfera mágica da viagem. Os hotéis vão desde opções econômicas até experiências de luxo, sempre com ambientação temática e sensação de exclusividade. Entre os principais benefícios estão a entrada antecipada nos parques, transporte interno eficiente e a praticidade de estar sempre próximo das experiências. Em alguns hotéis, o sistema de transporte por Skyliner conecta diretamente a parques como EPCOT e Hollywood Studios, facilitando ainda mais a locomoção.',
        badge: 'Benefícios',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Hotéis Universal',
        description: 'Os hotéis da Universal são excelentes aliados para quem deseja otimizar o tempo e reduzir filas. Nas categorias premium, hóspedes recebem o benefício do Express Unlimited incluso durante toda a estadia, o que pode representar grande economia e mais atrações no mesmo dia. Já os hotéis de categoria econômica oferecem vantagens como entrada antecipada nos parques e transporte gratuito, combinando praticidade e bom custo-benefício.',
        badge: 'Express Grátis',
        badgeColor: 'bg-purple-500/20 text-purple-400',
      },
      {
        title: 'Hotéis na International Drive',
        description: 'A região da International Drive é uma das mais estratégicas para quem busca localização central e preços acessíveis. Com grande oferta de redes conhecidas, variedade de restaurantes próximos e fácil acesso aos parques e outlets, essa área permite equilibrar conforto, mobilidade e economia. É uma escolha frequente entre viajantes que desejam flexibilidade no roteiro.',
        badge: 'Custo-Benefício',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
      {
        title: 'Casas de Temporada',
        description: 'Para famílias maiores ou grupos de amigos, alugar uma casa pode transformar a experiência da viagem. Condomínios planejados oferecem quartos amplos, cozinha completa, lavanderia e, em muitos casos, piscina privativa. Esse tipo de hospedagem proporciona mais espaço, privacidade e liberdade de horários, sendo ideal para estadias mais longas e roteiros com dias de descanso.',
        badge: 'Famílias',
        badgeColor: 'bg-amber-500/20 text-amber-400',
      },
    ],
  },
  {
    id: 'carro',
    title: 'Transporte',
    subtitle: 'A forma como você se desloca muda toda a experiência',
    icon: Car,
    color: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/30',
    items: [
      {
        title: 'Por que Alugar Carro?',
        description: 'Orlando é uma cidade ampla e com distâncias consideráveis entre parques, outlets, restaurantes e supermercados. Ter um carro proporciona autonomia, praticidade e flexibilidade de horários, especialmente para famílias ou roteiros mais longos. Aplicativos de transporte funcionam bem, mas podem se tornar caros quando utilizados várias vezes ao dia durante toda a viagem.',
        badge: 'Essencial',
        badgeColor: 'bg-emerald-500/20 text-emerald-400',
      },
      {
        title: 'Locadoras Recomendadas',
        description: 'Existem diversas locadoras confiáveis com opções para diferentes perfis de viajantes. Empresas como Alamo, Budget e National são bastante utilizadas por brasileiros e oferecem bom custo-benefício. Já locadoras como Hertz costumam ter atendimento diferenciado e frota mais premium. Reservar com antecedência ajuda a garantir melhores preços e maior disponibilidade de veículos.',
        badge: 'Dica',
        badgeColor: 'bg-teal-500/20 text-teal-400',
      },
      {
        title: 'Pedágios e GPS',
        description: 'Na Flórida, a maioria dos pedágios é eletrônica, sem cabines de pagamento manual. As locadoras normalmente oferecem planos de uso diário para o sistema de pedágio automático, o que facilita bastante a circulação. Aplicativos de navegação como Google Maps e Waze funcionam perfeitamente e ajudam a otimizar rotas e tempo de deslocamento.',
        badge: 'Simples',
        badgeColor: 'bg-sky-500/20 text-sky-400',
      },
      {
        title: 'Gasolina e Estacionamento',
        description: 'O custo da gasolina costuma ser mais baixo do que no Brasil, o que favorece o uso do carro ao longo da viagem. Abastecer em regiões menos turísticas pode gerar economia adicional. Nos parques, o estacionamento possui tarifa diária, que varia conforme o complexo e o tipo de hospedagem. Planejar esses custos com antecedência evita surpresas e ajuda a manter o orçamento sob controle.',
        badge: 'Economia',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
    ],
  },
  {
    id: 'alimentacao',
    title: 'Alimentação',
    subtitle: 'Comer em Orlando faz parte da experiência',
    icon: UtensilsCrossed,
    color: 'from-red-500 to-orange-500',
    shadowColor: 'shadow-red-500/30',
    items: [
      {
        title: 'Dentro dos Parques',
        description: 'Os parques oferecem desde refeições rápidas e práticas até restaurantes temáticos completos. As opções de quick service são ideais para quem quer otimizar o tempo entre atrações, enquanto os restaurantes com serviço de mesa proporcionam pausas mais tranquilas e ambientes imersivos. Você também pode levar pequenos lanches e garrafas de água na mochila. Uma dica simples e valiosa é pedir gratuitamente um copo de água com gelo em qualquer lanchonete, o que ajuda a se hidratar ao longo do dia.',
        badge: 'Dica: Água Grátis',
        badgeColor: 'bg-cyan-500/20 text-cyan-400',
      },
      {
        title: 'Restaurantes Populares',
        description: 'Fora dos parques, Orlando reúne uma enorme variedade de restaurantes para todos os gostos e orçamentos. Redes conhecidas costumam oferecer porções generosas e ambiente confortável para recuperar as energias depois de um dia intenso. Para quem sente saudade da comida brasileira, há também churrascarias e opções familiares que tornam a experiência ainda mais acolhedora.',
        badge: 'Para Todos',
        badgeColor: 'bg-red-500/20 text-red-400',
      },
      {
        title: 'Refeições com Personagens',
        description: 'Alguns restaurantes proporcionam momentos especiais ao permitir encontros com personagens durante a refeição. São experiências muito procuradas por famílias e exigem reserva antecipada, pois costumam esgotar rapidamente. Além da comida, o grande destaque é o clima mágico, com fotos, interações e lembranças que ficam para sempre.',
        badge: 'Reserve Antes!',
        badgeColor: 'bg-violet-500/20 text-violet-400',
      },
      {
        title: 'Economia na Alimentação',
        description: 'Pequenas estratégias ajudam a equilibrar o orçamento sem abrir mão do conforto. Tomar café da manhã no hotel, comprar snacks e bebidas em supermercados e alternar refeições dentro e fora dos parques são decisões que fazem diferença ao longo da viagem. Planejar esses momentos com antecedência permite comer melhor, gastar menos e manter o ritmo dos dias.',
        badge: 'Economia',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
    ],
  },
  {
    id: 'dinheiro',
    title: 'Dinheiro e Orçamento',
    subtitle: 'Planejar o financeiro traz leveza para aproveitar cada momento',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    shadowColor: 'shadow-green-500/30',
    items: [
      {
        title: 'Cartão Internacional',
        description: 'Utilizar cartão internacional é hoje a forma mais prática e segura de realizar pagamentos durante a viagem. Compras no exterior possuem incidência de IOF em torno de três vírgula cinco por cento sobre o valor convertido em reais. Mais importante do que o imposto é observar o câmbio aplicado pela instituição financeira, pois essa variação pode impactar diretamente no custo final. Avisar o banco antes de viajar evita bloqueios e garante tranquilidade durante toda a estadia.',
        badge: 'Praticidade',
        badgeColor: 'bg-green-500/20 text-green-400',
      },
      {
        title: 'Dinheiro em Espécie',
        description: 'Levar uma pequena quantia em dólares ajuda em situações rápidas como gorjetas, pedágios ou emergências. Valores entre cem e duzentos dólares por família costumam ser suficientes. Evite trocar moeda em aeroportos, onde as cotações normalmente são menos vantajosas.',
        badge: 'US$100-200',
        badgeColor: 'bg-amber-500/20 text-amber-400',
      },
      {
        title: 'Quanto Custa a Viagem?',
        description: 'Uma viagem para Orlando pode variar bastante conforme o estilo escolhido. Para uma família de quatro pessoas, uma experiência bem planejada costuma ficar entre cinquenta mil e noventa mil reais considerando passagens, hospedagem, ingressos, alimentação, transporte e pequenas compras. Organizar esse orçamento com antecedência permite viver a viagem com mais conforto e menos estresse.',
        badge: 'Planeje-se',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Gorjetas (Tips)',
        description: 'Nos Estados Unidos, a gorjeta faz parte da cultura e da remuneração de muitos serviços. Em restaurantes, o padrão varia entre dezoito e vinte por cento do valor da conta. Também é comum oferecer pequenas gratificações para motoristas, camareiras e outros atendimentos. Compreender esse hábito ajuda a evitar desconfortos e melhora a experiência de atendimento.',
        badge: '18-20%',
        badgeColor: 'bg-orange-500/20 text-orange-400',
      },
    ],
  },
  {
    id: 'apps',
    title: 'Apps Essenciais',
    subtitle: 'Aplicativos que mudam completamente a experiência',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-500',
    shadowColor: 'shadow-violet-500/30',
    items: [
      {
        title: 'My Disney Experience',
        description: 'O aplicativo oficial da Disney é indispensável dentro dos parques. Ele permite acompanhar o tempo de espera das atrações em tempo real, organizar acessos rápidos, fazer pedidos de comida sem fila e visualizar o mapa completo. Quanto mais familiarizado você estiver com o app antes da viagem, mais leve e produtivo será o seu roteiro.',
        badge: 'Disney',
        badgeColor: 'bg-blue-500/20 text-blue-400',
      },
      {
        title: 'Universal Orlando Resort',
        description: 'Na Universal, o aplicativo ajuda a planejar o dia com mais estratégia. Mostra filas atualizadas, mapas interativos e sistemas de fila virtual em atrações específicas. Também facilita a organização do Express Pass e a navegação dentro dos parques.',
        badge: 'Universal',
        badgeColor: 'bg-purple-500/20 text-purple-400',
      },
      {
        title: 'Google Maps / Waze',
        description: 'Fundamentais para dirigir em Orlando com tranquilidade. Permitem traçar rotas mais rápidas, evitar trânsito e salvar locais importantes como hotel, parques, restaurantes e outlets. Essa organização reduz atrasos e aumenta o aproveitamento da viagem.',
        badge: 'Navegação',
        badgeColor: 'bg-emerald-500/20 text-emerald-400',
      },
      {
        title: 'Google Tradutor',
        description: 'Mesmo sendo uma cidade turística, ter um tradutor no bolso traz segurança. Baixar o idioma inglês para uso offline ajuda a traduzir cardápios, placas e instruções rapidamente. O modo câmera é extremamente útil no dia a dia.',
        badge: 'Tradutor',
        badgeColor: 'bg-amber-500/20 text-amber-400',
      },
      {
        title: 'Clima e Previsão do Tempo',
        description: 'O clima em Orlando pode mudar rapidamente, especialmente no verão. Monitorar a previsão ajuda a escolher o melhor horário para parques aquáticos, shows ao ar livre ou compras. Aplicativos como Weather Channel ou AccuWeather são ótimas opções.',
        badge: 'Clima',
        badgeColor: 'bg-sky-500/20 text-sky-400',
      },
      {
        title: 'Uber / Lyft',
        description: 'Mesmo alugando carro, esses aplicativos podem ser úteis em noites específicas, deslocamentos rápidos ou quando não quiser dirigir. São muito utilizados para restaurantes, eventos ou retornos mais tranquilos ao hotel.',
        badge: 'Transporte',
        badgeColor: 'bg-teal-500/20 text-teal-400',
      },
      {
        title: 'App do Supermercado',
        description: 'Aplicativos de redes como Walmart e Target permitem verificar preços, localizar produtos e até organizar compras antes de chegar à loja. Ajuda bastante na economia e na praticidade durante a viagem.',
        badge: 'Economia',
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
