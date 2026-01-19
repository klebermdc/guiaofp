import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Crown,
  MapPin,
  CheckCircle2,
  Route,
  Users,
  Play,
  Star,
  MessageCircle,
  Clock,
  ArrowRight,
  Map,
  Zap,
  Calendar,
  ChevronDown,
} from 'lucide-react';

const Landing = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Floating Header */}
      <header className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-6xl mx-auto bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-3 flex items-center justify-between shadow-soft">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground hidden sm:block">
              Orlando Fast Pass
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Entrar
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gradient-primary text-primary-foreground rounded-xl">
                Começar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden px-4">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative pt-20">
          <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 px-4 py-2 text-sm">
            ✨ Planejador Inteligente de Parques
          </Badge>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-tight mb-6">
            Menos filas.
            <br />
            <span className="bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
              Mais magia.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Roteiros inteligentes que transformam seu dia de parque em uma experiência inesquecível.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/login">
              <Button size="lg" className="gradient-primary text-primary-foreground rounded-2xl px-8 h-14 text-lg shadow-glow group">
                Criar meu roteiro
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-2xl px-8 h-14 text-lg"
              onClick={() => scrollToSection('como-funciona')}
            >
              <Play className="w-5 h-5 mr-2" />
              Como funciona
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 text-center">
            <div>
              <p className="text-3xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Famílias</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-3xl font-bold text-foreground">7</p>
              <p className="text-sm text-muted-foreground">Parques</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex items-center gap-1">
              <p className="text-3xl font-bold text-foreground">5.0</p>
              <Star className="w-5 h-5 fill-secondary text-secondary" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={() => scrollToSection('como-funciona')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      {/* How It Works - Bento Grid */}
      <section id="como-funciona" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-medium mb-2">Simples e poderoso</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Como funciona
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 - Large */}
            <Card className="md:col-span-2 bg-gradient-to-br from-accent/10 to-transparent border-accent/20 overflow-hidden group hover:shadow-glow transition-shadow">
              <CardContent className="p-8 flex flex-col h-full min-h-[280px]">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="mt-auto">
                  <p className="text-accent text-sm font-medium mb-2">Passo 1</p>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    Monte seu perfil
                  </h3>
                  <p className="text-muted-foreground">
                    Datas, tamanho do grupo, preferências e estilo de viagem. Tudo em minutos.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20 overflow-hidden hover:shadow-gold transition-shadow">
              <CardContent className="p-8 flex flex-col h-full min-h-[280px]">
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6">
                  <Star className="w-6 h-6 text-secondary" />
                </div>
                <div className="mt-auto">
                  <p className="text-secondary text-sm font-medium mb-2">Passo 2</p>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Escolha as atrações
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Marque tudo que quer fazer em cada parque.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 overflow-hidden hover:shadow-soft transition-shadow">
              <CardContent className="p-8 flex flex-col h-full min-h-[280px]">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                  <Route className="w-6 h-6 text-primary" />
                </div>
                <div className="mt-auto">
                  <p className="text-primary text-sm font-medium mb-2">Passo 3</p>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Gere seu roteiro
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    IA cria a melhor sequência para você.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 4 - Large */}
            <Card className="md:col-span-2 bg-gradient-to-br from-success/10 to-transparent border-success/20 overflow-hidden hover:shadow-soft transition-shadow">
              <CardContent className="p-8 flex flex-col h-full min-h-[280px]">
                <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-success" />
                </div>
                <div className="mt-auto">
                  <p className="text-success text-sm font-medium mb-2">Passo 4</p>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    Aproveite sem stress
                  </h3>
                  <p className="text-muted-foreground">
                    Menos tempo na fila, mais tempo criando memórias. Simples assim.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-medium mb-2">Escolha seu caminho</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Dois jeitos de planejar
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Plan */}
            <Card className="relative overflow-hidden hover:shadow-card transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                    <Map className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      Planejador
                    </h3>
                    <p className="text-sm text-muted-foreground">Autonomia total</p>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    'Perfil de viagem completo',
                    'Seleção de atrações',
                    'Mapa dos parques',
                    'Checklist de viagem',
                    'Roteiro com dicas gerais',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-sm text-muted-foreground italic mb-6">
                  "Você planeja. O sistema organiza."
                </p>

                <Link to="/login" className="block">
                  <Button variant="outline" className="w-full h-12 rounded-xl">
                    Começar grátis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative overflow-hidden border-secondary/50 shadow-gold hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-accent" />
              <CardContent className="p-8">
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-secondary to-accent text-white border-0">
                  Popular
                </Badge>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center">
                    <Crown className="w-7 h-7 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      Com Guia
                    </h3>
                    <p className="text-sm text-muted-foreground">Experiência premium</p>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    'Tudo do Planejador +',
                    'Roteiro otimizado por horário',
                    'Ajustes em tempo real',
                    'Suporte via WhatsApp',
                    'Guia humano dedicado',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-secondary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-sm text-muted-foreground italic mb-6">
                  "Você aproveita. O guia decide."
                </p>

                <Link to="/login" className="block">
                  <Button className="w-full h-12 rounded-xl gradient-primary text-primary-foreground">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Falar com guia
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-medium mb-2">Tudo que você precisa</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Ferramentas incluídas
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Calendar, label: 'Agenda', desc: 'Organize cada dia' },
              { icon: MapPin, label: 'Mapas', desc: 'Visualize o parque' },
              { icon: Play, label: 'Vídeos', desc: 'Dicas exclusivas' },
              { icon: CheckCircle2, label: 'Checklist', desc: 'Nada esquecido' },
              { icon: Star, label: 'Atrações', desc: 'Escolha favoritas' },
              { icon: Route, label: 'Roteiro', desc: 'Gerado por IA' },
              { icon: Clock, label: 'Filas', desc: 'Tempo otimizado' },
              { icon: MessageCircle, label: 'Suporte', desc: 'Ajuda quando precisar' },
            ].map((item, i) => (
              <Card key={i} className="group hover:shadow-card hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <item.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-secondary text-secondary" />
            ))}
          </div>
          <blockquote className="font-display text-2xl md:text-3xl text-foreground mb-6">
            "A sequência de atrações fez todo sentido — aproveitamos muito mais do que imaginávamos!"
          </blockquote>
          <p className="text-muted-foreground">— Família Santos, São Paulo</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Pronto para sua
            <br />melhor viagem?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10">
            Comece agora e transforme seu dia de parque.
          </p>

          <Link to="/login">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-2xl px-10 h-14 text-lg shadow-lg">
              Criar meu roteiro grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">
              Orlando Fast Pass
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a 
              href="https://wa.me/5511966144493" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" />
              Contato
            </a>
            <span>© 2025</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;