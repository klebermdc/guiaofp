import { AppLayout } from "@/components/layout/AppLayout";
import { SavingsCalculator } from "@/components/guidance/SavingsCalculator";
import { ParkDayChecklist } from "@/components/guidance/ParkDayChecklist";
import { 
  Headphones, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  Shield, 
  Users, 
  MapPin, 
  AlertTriangle,
  HelpCircle,
  Phone,
  Wifi,
  Battery,
  Sun,
  Timer,
  Heart,
  Target,
  TrendingUp,
  Sparkles,
  Zap,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useGuideContact } from "@/hooks/useGuideContact";

const RemoteGuidance = () => {
  const { whatsappUrl, guideName, hasGuide } = useGuideContact();

  const openWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
  };

  const benefits = [
    {
      icon: Clock,
      title: "Economia de Tempo",
      description: "Redução significativa nas filas com decisões estratégicas em tempo real"
    },
    {
      icon: Target,
      title: "Decisões Certas",
      description: "Orientação baseada em dados atuais do parque, não em achismos"
    },
    {
      icon: Heart,
      title: "Menos Estresse",
      description: "Você aproveita o parque enquanto o guia monitora e orienta"
    },
    {
      icon: TrendingUp,
      title: "Mais Atrações",
      description: "Otimização do roteiro para fazer mais com menos tempo de espera"
    },
    {
      icon: Users,
      title: "Para Todo o Grupo",
      description: "Estratégias personalizadas considerando crianças, idosos e restrições"
    },
    {
      icon: Shield,
      title: "Suporte Completo",
      description: "Acompanhamento do início ao fim do dia no parque"
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Antes do Parque",
      description: "Alinhamos a estratégia, analisamos lotação prevista e definimos o melhor horário de chegada",
      icon: Sun
    },
    {
      step: 2,
      title: "Chegada ao Parque",
      description: "Orientações via WhatsApp sobre por onde começar e primeiras atrações prioritárias",
      icon: MapPin
    },
    {
      step: 3,
      title: "Durante o Dia",
      description: "Monitoramento em tempo real das filas, ajustes de rota e marcações de Lightning Lane",
      icon: Zap
    },
    {
      step: 4,
      title: "Situações Especiais",
      description: "Reorganização imediata em caso de chuva, fechamento de atrações ou cansaço do grupo",
      icon: AlertTriangle
    },
    {
      step: 5,
      title: "Encerramento",
      description: "Orientação sobre melhor horário para sair, posicionamento para shows noturnos",
      icon: Star
    }
  ];

  const parks = [
    { name: "Magic Kingdom", highlight: "Maior diferença", color: "bg-blue-500" },
    { name: "EPCOT", highlight: "Festivais e horários", color: "bg-purple-500" },
    { name: "Hollywood Studios", highlight: "Alta disputa", color: "bg-red-500" },
    { name: "Animal Kingdom", highlight: "Fluxo otimizado", color: "bg-green-500" },
    { name: "Universal Studios", highlight: "Ordem estratégica", color: "bg-yellow-500" },
    { name: "Islands of Adventure", highlight: "Alta lotação", color: "bg-orange-500" },
    { name: "Epic Universe", highlight: "Novo parque", color: "bg-pink-500" },
    { name: "SeaWorld", highlight: "Shows e atrações", color: "bg-cyan-500" },
    { name: "Busch Gardens", highlight: "Tampa Bay", color: "bg-emerald-500" }
  ];

  const included = [
    "Análise de lotação antes do dia",
    "Orientação do melhor horário de chegada",
    "Acompanhamento via WhatsApp durante todo o dia",
    "Monitoramento de filas em tempo real",
    "Marcações de Lightning Lane (conforme plano)",
    "Ajustes de estratégia ao longo do dia",
    "Orientação para shows e encontros com personagens",
    "Suporte em situações de chuva ou imprevistos",
    "Dicas de alimentação nos melhores horários"
  ];

  const notIncluded = [
    "Garantia de zero fila (reduzimos, mas não eliminamos)",
    "Troca de parque no mesmo dia",
    "Presença física do guia",
    "Compra de ingressos ou reservas",
    "Garantia de disponibilidade de atrações"
  ];

  const faqGeneral = [
    {
      question: "O guiamento funciona em quais parques?",
      answer: "Funciona em todos os parques da Disney (Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom), Universal (Universal Studios, Islands of Adventure, Epic Universe), SeaWorld e Busch Gardens."
    },
    {
      question: "Como é a comunicação durante o parque?",
      answer: "Toda comunicação é feita via WhatsApp em tempo real. Você envia sua localização e dúvidas, e o guia responde com orientações estratégicas imediatas."
    },
    {
      question: "O guia está atendendo outros grupos ao mesmo tempo?",
      answer: "Sim, com limite operacional para manter a qualidade. Durante seu horário contratado, você é prioridade."
    },
    {
      question: "Vocês fazem marcações de Lightning Lane?",
      answer: "Sim, conforme o plano contratado e disponibilidade do sistema. Orientamos os melhores horários e atrações para maximizar seu aproveitamento."
    },
    {
      question: "O guiamento garante zero fila?",
      answer: "Não garantimos zero fila. O serviço reduz significativamente o tempo de espera através de decisões estratégicas, mas filas fazem parte da experiência dos parques."
    },
    {
      question: "Vale a pena contratar o guiamento?",
      answer: "Se você quer tomar decisões certas no momento certo, aproveitar mais atrações e reduzir estresse, sim. A principal vantagem é ter orientação profissional em tempo real baseada em dados."
    }
  ];

  const faqSituations = [
    {
      question: "Se chover o dia inteiro?",
      answer: "A chuva costuma reduzir filas significativamente e pode melhorar o aproveitamento! Ajustamos a estratégia para atrações cobertas e melhores momentos."
    },
    {
      question: "Se eu perder meu celular no parque?",
      answer: "Sem outro aparelho no grupo com WhatsApp ativo, o guiamento não consegue continuar. Por isso, recomendamos que mais de uma pessoa tenha acesso à comunicação."
    },
    {
      question: "Se minha bateria acabar?",
      answer: "Sem comunicação ativa, o guiamento fica limitado. Recomendamos levar carregador portátil e manter o celular carregado."
    },
    {
      question: "Se o aplicativo da Disney cair?",
      answer: "Orientamos estratégias manuais e alternativas. Temos experiência para adaptar a rota mesmo sem o app funcionando perfeitamente."
    },
    {
      question: "Se uma atração fechar sem aviso?",
      answer: "Redirecionamos rapidamente para alternativas. Monitoramos o status das atrações e avisamos sobre mudanças."
    },
    {
      question: "Se alguém do grupo passar mal?",
      answer: "Priorizamos o bem-estar. Indicamos locais com ar-condicionado, primeiros socorros e reorganizamos o dia respeitando o ritmo da família."
    },
    {
      question: "Se eu decidir descansar no meio do dia?",
      answer: "Orientamos os melhores locais e horários para pausas. Se quiser voltar ao hotel, avaliamos se faz sentido e ajustamos o restante do dia."
    },
    {
      question: "Se o transporte atrasar e eu chegar muito depois?",
      answer: "Reorganizamos o dia com foco no que ainda vale a pena. A estratégia é sempre adaptada ao cenário real."
    }
  ];

  const faqExpectations = [
    {
      question: "E se eu discordar da recomendação do guia?",
      answer: "Você pode discordar e seguir sua intuição. Continuamos orientando com base técnica, mas a decisão final é sempre sua."
    },
    {
      question: "E se meu grupo não entrar em consenso?",
      answer: "Orientamos a decisão mais equilibrada possível, considerando as preferências de todos. Às vezes é preciso priorizar."
    },
    {
      question: "E se eu quiser fazer tudo no parque?",
      answer: "Explicamos que não é possível fazer tudo em um dia e ajudamos a priorizar as atrações mais importantes para você."
    },
    {
      question: "E se eu vier com expectativa irreal?",
      answer: "Reajustamos desde o início com transparência. Preferimos alinhar expectativas do que prometer algo impossível."
    },
    {
      question: "E se eu quiser experiência perfeita?",
      answer: "Explicamos que não existe perfeição em parques temáticos, mas trabalhamos para maximizar seu aproveitamento dentro das condições do dia."
    },
    {
      question: "O guia pode errar?",
      answer: "Sim, decisões são humanas e contextuais. Mas são sempre baseadas em dados e experiência, buscando a melhor opção possível."
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-8 md:p-12">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Headphones className="w-3 h-3 mr-1" />
              Seu Guia de Referência
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Como Funciona o Guiamento Remoto
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Tudo o que você precisa saber para aproveitar ao máximo seu dia no parque 
              com o acompanhamento estratégico do seu guia.
            </p>
          </div>
        </div>

        {/* What is it */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              O que é o Guiamento Remoto?
            </CardTitle>
          </CardHeader>
          <CardContent className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              O guiamento remoto é um serviço de <strong className="text-foreground">orientação estratégica em tempo real</strong> durante 
              sua visita aos parques de Orlando. Um guia especializado acompanha você remotamente via WhatsApp, 
              monitorando filas, horários e condições do parque para ajudar você a <strong className="text-foreground">tomar as melhores 
              decisões no momento certo</strong>.
            </p>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-sm text-muted-foreground italic">
                "A principal vantagem é ter alguém experiente analisando dados em tempo real enquanto você 
                apenas aproveita o parque com sua família."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What You Get - Educational */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            O que você terá durante o guiamento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Savings Calculator */}
        <SavingsCalculator />

        {/* Park Day Checklist */}
        <ParkDayChecklist />

        {/* How it Works */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Como Funciona
            </CardTitle>
            <CardDescription>O passo a passo do seu dia com guiamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20 hidden md:block" />
              
              <div className="space-y-6">
                {howItWorks.map((item, index) => (
                  <div key={index} className="flex gap-4 md:gap-6">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parks */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <MapPin className="w-6 h-6 text-red-500" />
            Parques Atendidos
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {parks.map((park, index) => (
              <Card key={index} className="hover:scale-105 transition-transform cursor-default">
                <CardContent className="p-4 text-center">
                  <div className={`w-3 h-3 rounded-full ${park.color} mx-auto mb-2`} />
                  <h3 className="font-semibold text-sm mb-1">{park.name}</h3>
                  <p className="text-xs text-muted-foreground">{park.highlight}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What's included / not included */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                O que está incluído
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="w-5 h-5" />
                O que NÃO está incluído
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {notIncluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Important Tips */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              Dicas Importantes para o Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <Battery className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Bateria do Celular</p>
                  <p className="text-xs text-muted-foreground">Leve carregador portátil. Sem bateria = sem guiamento!</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <Wifi className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Internet</p>
                  <p className="text-xs text-muted-foreground">Tenha chip ou plano de dados funcionando nos EUA.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <Phone className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Dois Celulares</p>
                  <p className="text-xs text-muted-foreground">Recomendamos backup caso um aparelho tenha problema.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <Timer className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Respostas Rápidas</p>
                  <p className="text-xs text-muted-foreground">Fique atento às mensagens para não perder oportunidades.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Sections */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-500" />
            Perguntas Frequentes
          </h2>

          {/* General FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Sobre o Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqGeneral.map((item, index) => (
                  <AccordionItem key={index} value={`general-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Situations FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Situações Especiais
              </CardTitle>
              <CardDescription>O que acontece se...</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqSituations.map((item, index) => (
                  <AccordionItem key={index} value={`situations-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Expectations FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Expectativas e Limites
              </CardTitle>
              <CardDescription>Transparência sobre o serviço</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqExpectations.map((item, index) => (
                  <AccordionItem key={index} value={`expectations-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact Guide Section */}
        <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 border-green-500/20">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-3">Alguma dúvida?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Se tiver qualquer pergunta sobre o funcionamento do guiamento ou precisar de suporte, 
              fale diretamente com seu guia.
            </p>
            <Button 
              size="lg" 
              className="font-semibold bg-green-600 hover:bg-green-700"
              onClick={openWhatsApp}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar com {guideName || 'o Guia'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RemoteGuidance;
