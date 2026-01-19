import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sparkles,
  Crown,
  MapPin,
  CheckCircle2,
  Route,
  Users,
  Calendar,
  Play,
  Star,
  MessageCircle,
  Clock,
  Zap,
  ChevronRight,
  Castle,
  Rocket,
  Heart,
  ArrowRight,
  Map,
  BookOpen,
  Target,
  Shield,
} from 'lucide-react';

const Landing = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: Users,
      title: 'Perfil de Viagem',
      description: 'Datas, grupo e preferências',
    },
    {
      icon: Star,
      title: 'Atrações Desejadas',
      description: 'Marque o que quer fazer',
    },
    {
      icon: MapPin,
      title: 'Mapa do Parque',
      description: 'Visualize os pontos',
    },
    {
      icon: CheckCircle2,
      title: 'Checklist Completo',
      description: 'Organização pré-viagem',
    },
    {
      icon: Play,
      title: 'Conteúdos por Parque',
      description: 'Vídeos e dicas exclusivas',
    },
    {
      icon: Route,
      title: 'Gerar Roteiro',
      description: 'Seu plano pronto!',
    },
  ];

  const basicFeatures = [
    'Roteiro genérico com dicas estratégicas',
    'Sugestão de blocos do dia (manhã/tarde/noite)',
    'Dicas para chegar cedo e aproveitar ao máximo',
    'Organização simples e visual',
  ];

  const premiumFeatures = [
    'Sequência exata e otimizada de atrações',
    'Considera perfil do grupo e fluxo de visitantes',
    'Janelas de descanso e ajustes de fila',
    'Alterações estratégicas em tempo real',
    'Comunicação direta e suporte humano',
  ];

  const testimonials = [
    {
      quote: 'Planejei sozinho e ainda assim consegui organizar tudo com clareza. Depois ajustei com guia e foi perfeito!',
      author: 'Família Silva',
      rating: 5,
    },
    {
      quote: 'A sequência de atrações fez todo sentido pra nós — aproveitamos muito mais!',
      author: 'João e Maria',
      rating: 5,
    },
    {
      quote: 'Nunca imaginei que poderia aproveitar tanto em um único dia. O guia fez toda diferença!',
      author: 'Carlos R.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: 'Esse serviço funciona para todos os parques?',
      answer: 'Sim — Disney (Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom), Universal (Studios, Islands of Adventure, Epic Universe), SeaWorld e todos os parques que você escolher.',
    },
    {
      question: 'Posso marcar meu roteiro e depois contratar um guia?',
      answer: 'Sim — seu plano base funciona independente e pode ser otimizado a qualquer momento com suporte humano de um guia experiente.',
    },
    {
      question: 'O que muda entre o com e sem guia?',
      answer: 'Com guia você tem decisões estratégicas e apoio humano em tempo real. Sem guia você recebe orientação e sequência base para organizar o seu dia com autonomia.',
    },
    {
      question: 'Preciso pagar para usar o Planejador?',
      answer: 'Você pode começar gratuitamente com o Planejador Inteligente básico. Para recursos premium e guia humano, oferecemos planos acessíveis.',
    },
  ];

  const benefits = [
    { icon: Target, text: 'Plano personalizado a partir das suas preferências' },
    { icon: Zap, text: 'Acesso simples e rápido pelo site' },
    { icon: Calendar, text: 'Trabalha todas as fases da viagem' },
    { icon: Users, text: 'Você decide o nível de ajuda que quer' },
    { icon: Crown, text: 'Pode evoluir para um guia humano quando quiser' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Orlando Fast Pass
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gradient-primary text-primary-foreground">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gradient-primary opacity-5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6 animate-fade-in">
              <Castle className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Planejador Inteligente de Parques
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Planeje sua Viagem dos Sonhos com{' '}
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Orlando Fast Pass
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              ✨ Você escolhe os momentos. Nós organizamos sua melhor rota.
            </p>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Chegar no parque <strong>sem saber por onde começar</strong> pode transformar seu sonho em frustração. 
              Aqui, você planeja com clareza e pode <strong>elevar sua experiência para outro nível</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/login">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow px-8 group">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Começar Gratuitamente
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}>
                <Play className="w-5 h-5 mr-2" />
                Ver Como Funciona
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-success" />
                <span className="text-sm">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5 text-accent" />
                <span className="text-sm">+500 Famílias Atendidas</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-5 h-5 text-secondary" />
                <span className="text-sm">Avaliação 5 Estrelas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20">
              <Rocket className="w-3 h-3 mr-1" />
              Passo a Passo
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como funciona o Planejador Inteligente
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para começar a planejar — sem complicação e sem decisões no escuro.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {steps.map((step, index) => (
              <Card
                key={index}
                className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                  activeStep === index ? 'ring-2 ring-accent shadow-glow' : ''
                }`}
                onMouseEnter={() => setActiveStep(index)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Checkmarks */}
          <div className="flex flex-wrap justify-center gap-6">
            {['É fácil', 'É visual', 'É organizado', 'Plano pronto para usar'].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="font-medium text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Comparison Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
              <Crown className="w-3 h-3 mr-1" />
              Escolha seu Estilo
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Roteiro que se adapta ao seu estilo de viagem
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-muted-foreground/30" />
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                    <Map className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      Sem Guia
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Planejador Inteligente
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  Ideal para quem quer <strong>autonomia e organização simples</strong>, sem acompanhamento humano.
                </p>

                <ul className="space-y-3 mb-8">
                  {basicFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-4 bg-muted/50 rounded-xl mb-6">
                  <p className="text-sm text-muted-foreground italic">
                    "Você planeja. O sistema organiza. A decisão final é sua."
                  </p>
                </div>

                <Link to="/login">
                  <Button className="w-full" variant="outline" size="lg">
                    Começar Gratuitamente
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative overflow-hidden border-secondary/50 shadow-gold">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-accent" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
              <CardContent className="p-8 relative">
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-secondary to-accent text-white">
                  Recomendado
                </Badge>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center">
                    <Crown className="w-7 h-7 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      Com Guia
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Roteiro Inteligente com Apoio
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  Quer mais? Aqui é onde a <strong>magia acontece</strong>. Melhor performance, decisões em tempo real.
                </p>

                <ul className="space-y-3 mb-8">
                  {premiumFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Crown className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-4 bg-secondary/10 rounded-xl mb-6">
                  <p className="text-sm text-foreground italic">
                    "Você aproveita. O guia decide. O sistema executa."
                  </p>
                </div>

                <Link to="/login">
                  <Button className="w-full gradient-primary text-primary-foreground" size="lg">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Falar com um Guia
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why It Works Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                <BookOpen className="w-3 h-3 mr-1" />
                Por que funciona
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Experiência que transforma seu dia
              </h2>
              <p className="text-lg text-muted-foreground">
                Nosso sistema foi desenvolvido com base em anos de experiência no acompanhamento de visitantes nos parques.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:shadow-card transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-success" />
                  </div>
                  <p className="text-foreground font-medium">{benefit.text}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-muted-foreground">
                Combinamos tecnologia com <strong>decisões inteligentes</strong>, ajudando você a transformar um dia de parque em{' '}
                <strong>uma experiência memorável</strong> — reduzindo filas, otimizando tempo e priorizando o que importa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20">
              <Heart className="w-3 h-3 mr-1" />
              Depoimentos
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Quem já usou recomenda
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-card transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <p className="text-sm font-semibold text-muted-foreground">
                    — {testimonial.author}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                Dúvidas Frequentes
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Perguntas Frequentes
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 overflow-hidden"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
              🔥 Aproveite Agora
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Transforme seu dia de parque em pura magia com o Planejador da Orlando Fast Pass!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to="/login">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg px-8">
                  <Map className="w-5 h-5 mr-2" />
                  Planejador Inteligente
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="gradient-gold text-secondary-foreground shadow-gold px-8">
                  <Crown className="w-5 h-5 mr-2" />
                  Roteiro com Guia
                </Button>
              </Link>
            </div>

            <p className="text-primary-foreground/60 text-sm">
              Clique no botão acima para começar agora!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-display text-xl font-bold">
                Orlando Fast Pass
              </span>
            </div>

            <div className="flex items-center gap-6 text-primary-foreground/80 text-sm">
              <a href="https://wa.me/5511966144493" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <span>•</span>
              <span>© 2025 Orlando Fast Pass</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;