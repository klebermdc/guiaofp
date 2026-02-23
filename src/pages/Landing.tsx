import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLoadingScreen } from '@/components/layout/AuthLoadingScreen';
import { useScrollTracking, useAnalytics } from '@/hooks/useAnalytics';
import { TrackableButton } from '@/components/analytics';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Crown,
  CheckCircle2,
  ArrowRight,
  Star,
  MessageCircle,
  ChevronDown,
  Shield,
  X,
  Sparkles,
  Menu,
  XIcon,
} from 'lucide-react';

import logo from '@/assets/logo.png';
import heroCastle from '@/assets/landing/hero-castle.jpg';
import featureRoteiro from '@/assets/landing/feature-roteiro.jpg';
import featureGuia from '@/assets/landing/feature-guia.jpg';
import featureChecklist from '@/assets/landing/feature-checklist.jpg';
import featureMapa from '@/assets/landing/feature-mapa.jpg';
import featureRestaurantes from '@/assets/landing/feature-restaurantes.jpg';
import featureDocumentos from '@/assets/landing/feature-documentos.jpg';
import featureCupons from '@/assets/landing/feature-cupons.jpg';
import featurePlanner from '@/assets/landing/feature-planner.jpg';

// ─── Animated Section (fade-in on scroll) ────────────────────────────────────
const AnimatedSection = memo(({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
});
AnimatedSection.displayName = 'AnimatedSection';

// ─── Counter Animation ───────────────────────────────────────────────────────
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// ─── WhatsApp link ───────────────────────────────────────────────────────────
const WHATSAPP_PREMIUM_LINK = "https://wa.me/message/2US6I4NWQWLDD1";

const Landing = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { trackCTAClick } = useAnalytics();

  useScrollTracking();

  // Scroll listener for navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Admin check
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
        const roles = data?.map(r => r.role) || [];
        setIsAdminUser(roles.includes('admin') || roles.includes('guide'));
      }
    };
    checkAdmin();
  }, [user]);

  // Safety timeout
  useEffect(() => {
    const t = setTimeout(() => { if (!showContent) setShowContent(true); }, 3000);
    return () => clearTimeout(t);
  }, [showContent]);

  // Redirect auth users
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isAdminUser) {
      const t = setTimeout(() => { if (!isAdminUser) navigate('/dashboard', { replace: true }); }, 500);
      return () => clearTimeout(t);
    } else if (!authLoading) {
      setShowContent(true);
    }
  }, [authLoading, isAuthenticated, isAdminUser, navigate]);

  if (authLoading && !showContent) return <AuthLoadingScreen />;

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Como funciona', id: 'como-funciona' },
    { label: 'Funcionalidades', id: 'funcionalidades' },
    { label: 'Planos', id: 'planos' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <div className="min-h-screen bg-background font-body overflow-x-hidden scroll-smooth">
      <SEO
        title="OFP Planejador — Roteiro Inteligente para Orlando"
        description="Planeje sua viagem a Orlando com roteiros personalizados, guia de restaurantes, mapa interativo e muito mais. Para famílias brasileiras."
        url="/"
      />

      {/* ═══ NAVBAR ═══ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-soft' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <img src={logo} alt="Orlando Fast Pass" className="h-10 sm:h-12 w-auto object-contain" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground">Entrar</Button>
            </Link>
            <Button size="sm" className="gradient-gold text-secondary-foreground rounded-xl px-5" onClick={() => scrollTo('planos')}>
              Começar agora
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-foreground p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 pb-4 animate-fadeIn">
            {navLinks.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="block w-full text-left py-3 text-foreground border-b border-border/20">
                {l.label}
              </button>
            ))}
            <div className="flex gap-3 mt-4">
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full">Entrar</Button>
              </Link>
              <Button className="flex-1 gradient-gold text-secondary-foreground" onClick={() => scrollTo('planos')}>
                Começar
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ═══ BLOCO 1 — HERO ═══ */}
      <section className="min-h-screen relative overflow-hidden flex items-end pb-12 sm:pb-20">
        <img
          src={heroCastle}
          alt="Castelo da Cinderela iluminado"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />

        <div className="relative w-full max-w-4xl mx-auto text-center px-4 sm:px-6">
          {/* Shimmer badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-secondary/40 bg-secondary/10 backdrop-blur-sm animate-fadeIn">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Planejador Inteligente de Parques</span>
          </div>

          <h1
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6 animate-fadeIn"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="text-white">Menos filas.</span>
            <br />
            <span className="text-secondary">Mais magia.</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-8 animate-fadeIn"
            style={{ animationDelay: '0.2s' }}
          >
            Roteiros inteligentes que transformam seu dia de parque em uma experiência inesquecível.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 animate-fadeIn"
            style={{ animationDelay: '0.3s' }}
          >
            <TrackableButton
              size="lg"
              className="gradient-gold text-secondary-foreground rounded-2xl px-8 h-14 text-lg shadow-gold group hover:scale-105 transition-transform w-full sm:w-auto font-bold"
              onClick={() => scrollTo('planos')}
              trackingName="cta_hero_planos"
              trackingLocation="hero"
            >
              ✨ Escolher meu plano
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </TrackableButton>
            <TrackableButton
              size="lg"
              variant="outline"
              className="rounded-2xl px-8 h-14 text-lg bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
              onClick={() => scrollTo('como-funciona')}
              trackingName="cta_hero_como_funciona"
              trackingLocation="hero"
            >
              ▷ Como funciona
            </TrackableButton>
          </div>

          {/* Social proof badges */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <Star className="w-4 h-4 fill-secondary text-secondary" />
              <span>5.0 no Google</span>
            </div>
            <div className="w-px h-4 bg-white/30 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <span>👨‍👩‍👧</span>
              <span>500+ famílias</span>
            </div>
            <div className="w-px h-4 bg-white/30 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <Shield className="w-4 h-4" />
              <span>Garantia 7 dias</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => scrollTo('prova-social')}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 animate-bounce"
          aria-label="Rolar para baixo"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      {/* ═══ BLOCO 2 — NÚMEROS / PROVA SOCIAL ═══ */}
      <section id="prova-social" className="py-20 sm:py-28 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <AnimatedSection className="text-center mb-12">
            <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-3">Números que falam</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Por que famílias confiam no <span className="text-secondary">OFP</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            {[
              { emoji: '🏰', value: 500, suffix: '+', label: 'Famílias planejadas', highlight: true },
              { emoji: '🎢', value: 7, suffix: '', label: 'Parques cobertos', highlight: false },
              { emoji: '⭐', value: 5, suffix: '.0', label: 'Avaliação média', highlight: false },
              { emoji: '📅', value: 8, suffix: '+', label: 'Anos de experiência', highlight: false },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 120}>
                <div
                  className={`group relative text-center rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-1 ${
                    item.highlight
                      ? 'bg-gradient-to-br from-secondary/15 to-secondary/5 border-2 border-secondary/40 shadow-gold hover:shadow-[0_8px_40px_hsl(38_92%_50%/0.35)]'
                      : 'bg-card/60 backdrop-blur-sm border border-border/50 hover:border-secondary/30 hover:shadow-glow'
                  }`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                  <span className="text-4xl sm:text-5xl block mb-4 group-hover:scale-110 transition-transform duration-300">{item.emoji}</span>
                  <p className="text-4xl sm:text-5xl font-bold text-secondary font-display tracking-tight mb-1">
                    <AnimatedCounter end={item.value} suffix={item.suffix} />
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium">{item.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BLOCO 3 — FUNCIONALIDADES ═══ */}
      <section id="funcionalidades" className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tudo que você precisa para uma viagem perfeita
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Não é um PDF estático. É uma plataforma viva que te guia do planejamento até o último dia.
            </p>
          </AnimatedSection>

          <div className="space-y-16 sm:space-y-24">
            {[
              {
                badge: '🔥 Mais usado',
                image: featureRoteiro,
                title: 'Roteiro Personalizado para Sua Família',
                text: 'Informe sua data, grupo e parques desejados. O planejador monta um roteiro otimizado considerando filas, horários de shows e o perfil do seu grupo — tudo automaticamente.',
              },
              {
                badge: '🧩 Flexível',
                image: featurePlanner,
                title: 'Planejador Manual com Biblioteca Completa',
                text: 'Monte seu roteiro do seu jeito, arrastando e soltando atividades. Escolha entre parques, restaurantes, compras e atividades de uma biblioteca completa de tudo o que fazer em Orlando.',
              },
              {
                badge: '📖 Completo',
                image: featureGuia,
                title: 'Guia de Viagem em Português',
                text: 'Tudo que você precisa saber sobre cada parque: dicas de chegada, estratégias por área, o que não pode perder e como economizar tempo e dinheiro.',
              },
              {
                badge: '✅ Essencial',
                image: featureChecklist,
                title: 'Checklists que Guiam Cada Etapa',
                text: 'Da mala ao retorno para casa. Listas organizadas por momento da viagem para que nada seja esquecido — especialmente com crianças.',
              },
              {
                badge: '🗺️ Interativo',
                image: featureMapa,
                title: 'Mapa Interativo em Tempo Real',
                text: 'Veja todas as atrações, restaurantes e banheiros no mapa. Planeje sua rota dentro do parque e não perca tempo procurando atrações.',
              },
              {
                badge: '🍽️ Popular',
                image: featureRestaurantes,
                title: '279 Restaurantes Organizados',
                text: 'Escolha onde comer sem improviso, com restaurantes organizados por parque, tipo de comida e faixa de preço. Nunca mais pague caro em lugar ruim.',
              },
              {
                badge: '📁 Prático',
                image: featureDocumentos,
                title: 'Carteira de Documentos Digital',
                text: 'Ingressos, vouchers de hotel, passagens aéreas e muito mais — tudo num só lugar, acessível offline dentro dos parques.',
              },
              {
                badge: '🎟️ Exclusivo',
                image: featureCupons,
                title: 'Cupons e Descontos Exclusivos',
                text: 'Economia real durante a viagem com cupons de parceiros selecionados. Transporte, restaurantes e muito mais.',
              },
            ].map((feature, i) => (
              <AnimatedSection key={i} delay={100}>
                <div className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}>
                  {/* Feature image */}
                  <div className="flex-1 w-full">
                    <div className="relative rounded-2xl overflow-hidden group hover:shadow-glow transition-all duration-500 border border-border/50 hover:border-secondary/30">
                      <img src={feature.image} alt={feature.title} className="w-full aspect-video object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                  {/* Text */}
                  <div className="flex-1 w-full">
                    <Badge className="mb-3 bg-secondary/10 text-secondary border-secondary/30 text-xs">{feature.badge}</Badge>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{feature.text}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BLOCO 4 — DEPOIMENTOS ═══ */}
      <section className="py-16 sm:py-24 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              O que as famílias dizem
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                initial: 'M',
                color: 'bg-primary',
                name: 'Mayara Miranda Reis',
                text: 'O planejador mudou completamente a forma como organizamos nossa viagem. Conseguimos aproveitar muito mais com as crianças sem ficar perdidas.',
              },
              {
                initial: 'R',
                color: 'bg-blue-600',
                name: 'Rafael Gomes',
                text: 'Fui pela primeira vez e senti como se conhecesse os parques há anos. O roteiro foi certeiro, economizamos horas de fila.',
              },
              {
                initial: 'C',
                color: 'bg-emerald-600',
                name: 'Carlos Bacha',
                text: 'Incrível como tudo fica mais claro com o planejador. Cada detalhe pensado para brasileiros que não conhecem o sistema americano.',
              },
            ].map((t, i) => (
              <AnimatedSection key={i} delay={i * 150}>
                <Card className="h-full bg-card/80 backdrop-blur-sm border-border/50 hover:border-secondary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <p className="text-foreground/90 mb-6 leading-relaxed italic">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                        {t.initial}
                      </div>
                      <span className="font-medium text-foreground">{t.name}</span>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-8">
            <Badge variant="outline" className="text-muted-foreground border-border/50">
              🔒 Depoimentos verificados de clientes reais
            </Badge>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ BLOCO 5 — AUTORIDADE ═══ */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8 sm:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  <div className="flex-shrink-0">
                    <img src={logo} alt="Orlando Fast Pass" className="h-24 sm:h-32 w-auto object-contain" loading="lazy" />
                  </div>
                  <div>
                    <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-2">Quem está por trás</p>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                      Somos a Orlando Fast Pass.
                    </h2>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
                      Há mais de 8 anos ajudando famílias brasileiras a aproveitarem Orlando sem erros, sem correria e sem frustração. Todo o conteúdo do planejador vem da prática real dentro dos parques — não de teoria ou de cópias de sites estrangeiros.
                    </p>
                    <ul className="space-y-3">
                      {[
                        'Equipe que vive nos parques',
                        'Conteúdo 100% em português',
                        'Atualizado com cada mudança dos parques',
                        'Pensado para famílias brasileiras',
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-foreground">
                          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ BLOCO 6 — COMPARAÇÃO ═══ */}
      <section id="como-funciona" className="py-16 sm:py-24 px-4 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              A diferença que o planejador faz
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            <AnimatedSection delay={100}>
              <Card className="h-full border-destructive/30 bg-destructive/5">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-display text-xl font-bold text-destructive mb-6 flex items-center gap-2">
                    <X className="w-6 h-6" />
                    Sem OFP Planejador
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'Informações soltas pela internet',
                      'Decisões inseguras e improvisadas',
                      'Tempo perdido procurando atrações',
                      'Estresse com as crianças no parque',
                      'Gastos desnecessários com o que não vale',
                      'Filas longas por falta de estratégia',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-muted-foreground">
                        <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <Card className="h-full border-success/30 bg-success/5 shadow-[0_0_30px_hsl(152_69%_45%/0.1)]">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-display text-xl font-bold text-success mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" />
                    Com OFP Planejador
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'Estratégia clara desde o primeiro dia',
                      'Tudo centralizado numa só plataforma',
                      'Mais atrações aproveitadas por dia',
                      'Menos filas com roteiro inteligente',
                      'Viagem muito mais tranquila e organizada',
                      'Família feliz e sem imprevistos',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ BLOCO 7 — OFERTA / PREÇO ═══ */}
      <section id="planos" className="py-16 sm:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <p className="text-white/60 uppercase tracking-widest text-sm mb-4 font-medium">Investimento</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Sua viagem vai custar milhares de dólares.
            </h2>
            <p className="text-secondary text-xl sm:text-2xl font-semibold mb-6">
              O OFP Planejador custa menos que um lanche dentro do parque.
            </p>
            <p className="text-white/70 max-w-xl mx-auto mb-10">
              Se o conhecimento de anos vivendo isso não vale esse valor, nada mais vai valer.
            </p>

            {/* Pricing cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
              {/* Basic */}
              <AnimatedSection delay={100}>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white h-full">
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="font-display text-xl font-bold mb-2">Planejador</h3>
                    <p className="text-white/60 text-sm mb-6">Autonomia total para planejar</p>
                    <div className="mb-6">
                      <span className="text-white/40 line-through text-lg">R$ 197</span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl sm:text-5xl font-bold text-secondary">R$ 97</span>
                      </div>
                      <Badge className="mt-2 bg-secondary/20 text-secondary border-secondary/30 text-xs">🔥 Oferta por tempo limitado</Badge>
                    </div>
                    <ul className="space-y-3 mb-8 text-left">
                      {['Perfil de viagem completo', 'Seleção de atrações', 'Mapa interativo', 'Checklists inteligentes', 'Roteiro com dicas gerais', 'Guia de restaurantes', 'Carteira de documentos'].map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/registro/basic" className="block" onClick={() => trackCTAClick('cta_plano_basico', 'pricing')}>
                      <Button className="w-full h-14 rounded-xl gradient-gold text-secondary-foreground font-bold text-base hover:scale-[1.02] transition-transform shadow-gold">
                        🚀 Quero acesso imediato
                      </Button>
                    </Link>
                    <p className="text-xs text-white/50 mt-3">✅ Acesso imediato • ✅ Funciona no celular • ✅ 7 dias de garantia</p>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Premium */}
              <AnimatedSection delay={200}>
                <Card className="bg-white/10 backdrop-blur-sm border-secondary/40 text-white h-full relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-accent rounded-t-xl" />
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground border-0 px-4">
                    ⭐ Popular
                  </Badge>
                  <CardContent className="p-6 sm:p-8 pt-8">
                    <h3 className="font-display text-xl font-bold mb-2">Com Guia</h3>
                    <p className="text-white/60 text-sm mb-6">Experiência premium completa</p>
                    <div className="mb-6">
                      <p className="text-white/60 text-sm mb-1">Consultoria personalizada</p>
                      <p className="text-lg text-white/80 italic">"Você aproveita. O guia decide."</p>
                    </div>
                    <ul className="space-y-3 mb-8 text-left">
                      {['Tudo do Planejador +', 'Roteiro otimizado por horário', 'Ajustes em tempo real', 'Suporte via WhatsApp', 'Guia humano dedicado'].map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                          <Crown className="w-4 h-4 text-secondary flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <a href={WHATSAPP_PREMIUM_LINK} target="_blank" rel="noopener noreferrer" className="block" onClick={() => trackCTAClick('cta_plano_premium', 'pricing')}>
                      <Button className="w-full h-14 rounded-xl bg-[hsl(142_70%_45%)] hover:bg-[hsl(142_70%_40%)] text-white font-bold text-base hover:scale-[1.02] transition-transform">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Falar com consultor
                      </Button>
                    </a>
                    <p className="text-xs text-white/50 mt-3">Atendimento personalizado via WhatsApp</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ BLOCO 8 — GARANTIA ═══ */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <Card className="border-secondary/30 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 sm:p-12">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl gradient-gold flex items-center justify-center shadow-gold">
                      <Shield className="w-10 h-10 text-secondary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
                      Garantia Total de 7 Dias
                    </h2>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-4">
                      Teste o OFP Planejador por 7 dias completos. Se por qualquer motivo não fizer sentido para a sua viagem, devolvemos 100% do seu dinheiro. Simples assim. Sem perguntas, sem letras miúdas.
                    </p>
                    <Badge className="bg-success/10 text-success border-success/30">💚 Zero risco para você</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ BLOCO 9 — FAQ ═══ */}
      <section id="faq" className="py-16 sm:py-24 px-4 bg-card/50">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              ❓ Perguntas Frequentes
            </h2>
          </AnimatedSection>

          <AnimatedSection>
            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: 'Isso substitui o guia virtual?',
                  a: 'O OFP Planejador não substitui o guia virtual, ele complementa. Ele te dá autonomia para planejar, entender e decidir com segurança. Para quem contrata guiamento remoto, o planejador deixa tudo ainda mais organizado e eficiente.',
                },
                {
                  q: 'Funciona para primeira viagem?',
                  a: 'Sim, principalmente para primeira viagem. O planejador foi pensado para quem não conhece Orlando, explicando tudo de forma simples, organizada e sem termos confusos.',
                },
                {
                  q: 'Funciona com crianças?',
                  a: 'Funciona muito bem com crianças. O roteiro é adaptável ao ritmo da família, evita correria desnecessária e ajuda a escolher atrações, horários e restaurantes mais adequados.',
                },
                {
                  q: 'Posso usar durante a viagem?',
                  a: 'Sim. O OFP Planejador foi feito para ser usado antes e durante a viagem, direto do celular, inclusive dentro dos parques.',
                },
                {
                  q: 'O conteúdo é atualizado?',
                  a: 'Sim. O conteúdo é constantemente atualizado com base em mudanças dos parques, filas, sistemas como Lightning Lane e experiências reais da equipe.',
                },
                {
                  q: 'Preciso saber inglês?',
                  a: 'Não. Todo o conteúdo do OFP Planejador está em português, pensado para brasileiros que querem viajar com mais segurança e tranquilidade.',
                },
              ].map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-foreground font-semibold text-left hover:no-underline py-5">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ BLOCO 10 — CTA FINAL ═══ */}
      <section className="py-20 sm:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(262_60%_30%)] via-[hsl(262_50%_20%)] to-[hsl(280_60%_15%)]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        </div>

        <AnimatedSection className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Planejar Orlando não precisa ser estressante.
          </h2>
          <p className="text-secondary text-xl sm:text-2xl font-semibold mb-10">
            Tenha tudo organizado, estratégico e claro antes mesmo de embarcar.
          </p>
          <TrackableButton
            size="lg"
            className="gradient-gold text-secondary-foreground rounded-2xl px-10 h-16 text-lg font-bold shadow-gold hover:scale-105 transition-transform animate-pulse-glow"
            onClick={() => scrollTo('planos')}
            trackingName="cta_final"
            trackingLocation="footer_cta"
          >
            ✨ Quero planejar minha viagem com segurança
          </TrackableButton>
          <div className="flex items-center justify-center gap-1 mt-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
            ))}
          </div>
          <p className="text-white/70 mt-2 text-sm">Mais de 500 famílias já planejaram com o OFP</p>
        </AnimatedSection>
      </section>

      {/* ═══ RODAPÉ ═══ */}
      <footer className="py-8 sm:py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <img src={logo} alt="Orlando Fast Pass" className="h-10 w-auto object-contain" loading="lazy" />
            <span className="text-sm text-muted-foreground">Menos filas. Mais magia.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => scrollTo('planos')} className="hover:text-foreground transition-colors">Planos</button>
            <a href="https://wa.me/5511966144493" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Contato</a>
            <Link to="/termos-e-privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Orlando Fast Pass. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
