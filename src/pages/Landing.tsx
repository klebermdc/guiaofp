import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { ContactFormDialog } from '@/components/landing/ContactFormDialog';
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
import featureResumo from '@/assets/landing/feature-resumo.png';
import featureGuia from '@/assets/landing/feature-guia.png';
import featureChecklist from '@/assets/landing/feature-checklist.png';
import featureMapa from '@/assets/landing/feature-mapa.png';
import featureParques from '@/assets/landing/feature-parques.png';
import featureLightningLane from '@/assets/landing/feature-lightninglane.png';
import featureRoteiroIA from '@/assets/landing/feature-roteiro-ia.png';
import featureRestaurantes from '@/assets/landing/feature-restaurantes.png';
import featureDocumentos from '@/assets/landing/feature-documentos.png';
import featureCupons from '@/assets/landing/feature-cupons.png';
import featureDashboard from '@/assets/landing/feature-dashboard.png';
import { usePlanPricing, formatPriceBRL } from '@/hooks/usePlanPricing';

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

// ─── WhatsApp link ───────────────────────────────────────────────────────────
const WHATSAPP_PREMIUM_LINK = "https://wa.me/message/2US6I4NWQWLDD1";

const Landing = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { trackCTAClick, trackBeginCheckout } = useAnalytics();
  const { data: dbPlans } = usePlanPricing();

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

  // Preload hero image dynamically (Vite-hashed URL)
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroCastle;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-end">
          <Link to="/login">
            <Button size="lg" className="bg-gradient-to-r from-secondary to-amber-400 text-primary-foreground hover:from-amber-400 hover:to-secondary font-bold px-8 py-3 text-base rounded-full shadow-lg shadow-secondary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-secondary/40">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* ═══ BLOCO 1 — HERO ═══ */}
      <section className="min-h-screen relative overflow-hidden flex items-end pb-12 sm:pb-20">
        <img
          src={heroCastle}
          alt="Castelo da Cinderela iluminado à noite no Magic Kingdom, Orlando"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />

        <div className="relative w-full max-w-4xl mx-auto text-center px-4 sm:px-6">
          {/* Hero logo */}
          <img src={logo} alt="OFP Planejador" className="h-56 sm:h-72 md:h-[22rem] w-auto object-contain mx-auto mb-8 animate-fadeIn drop-shadow-2xl" />

          {/* Shimmer badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-secondary/40 bg-secondary/10 backdrop-blur-sm animate-fadeIn">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Planejador Inteligente de Parques</span>
          </div>

          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-fadeIn text-white"
            style={{ animationDelay: '0.1s' }}
          >
            Tudo o que você precisa para planejar Orlando,{' '}
            <span className="text-secondary">organizado em um único lugar.</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-8 animate-fadeIn"
            style={{ animationDelay: '0.2s' }}
          >
            Mapas inteligentes, roteiros personalizados, guias completos, checklists e suporte real para você aproveitar os parques do jeito certo.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 animate-fadeIn"
            style={{ animationDelay: '0.3s' }}
          >
            <TrackableButton
              size="lg"
              className="gradient-gold text-secondary-foreground rounded-2xl px-8 h-14 text-lg shadow-gold group hover:scale-105 transition-transform w-full sm:w-auto font-bold"
              onClick={() => scrollTo('planos')}
              trackingName="cta_hero_planos"
              trackingLocation="hero"
            >
              ✨ Quero planejar minha viagem agora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </TrackableButton>
          </div>

          {/* Microcopy */}
          <p className="text-white/60 text-sm animate-fadeIn" style={{ animationDelay: '0.35s' }}>
            Acesso imediato • Sem mensalidade • Garantia de 7 dias
          </p>

          {/* Social proof badges */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap animate-fadeIn mt-6" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <span>👨‍👩‍👧</span>
              <span>1500+ famílias atendidas</span>
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
          onClick={() => scrollTo('identificacao')}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 animate-bounce"
          aria-label="Rolar para baixo"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      {/* ═══ BLOCO 2 — IDENTIFICAÇÃO (DOR) ═══ */}
      <section id="identificacao" className="py-20 sm:py-28 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Você se identifica com alguma dessas situações?
            </h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-10">
            {[
              'Medo de errar o roteiro',
              'Não saber quais atrações priorizar',
              'Confusão com Lightning Lane / Multi Pass',
              'Perder tempo andando sem estratégia',
              'Assistir dezenas de vídeos e continuar inseguro',
            ].map((pain, i, arr) => (
              <AnimatedSection key={i} delay={i * 100} className={arr.length % 2 !== 0 && i === arr.length - 1 ? 'sm:col-span-2 sm:max-w-md sm:mx-auto' : ''}>
                <Card className="bg-destructive/5 border-destructive/20 hover:border-destructive/40 transition-all">
                  <CardContent className="p-5 flex items-center gap-4">
                    <X className="w-5 h-5 text-destructive flex-shrink-0" />
                    <span className="text-foreground font-medium">{pain}</span>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center" delay={500}>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto italic">
              Se você sente que sua viagem está cara demais para ser deixada no improviso, continua aqui. 👇
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ BLOCO 3 — SOLUÇÃO ═══ */}
      <section className="py-16 sm:py-24 px-4 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              O OFP Planejador é o seu <span className="text-secondary">painel de controle</span> da viagem para Orlando.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Não é PDF. Não é curso. É uma ferramenta viva, prática e feita para ser usada antes e durante a viagem.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-glow max-w-3xl mx-auto">
              <img src={featureDashboard} alt="Dashboard do OFP Planejador" className="w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ BLOCO 4 — O QUE VOCÊ TEM ACESSO (FUNCIONALIDADES) ═══ */}
      <section id="funcionalidades" className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-3">Valor empilhado</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              O que você tem acesso
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Justifique cada centavo antes mesmo de ver o preço. Veja tudo que está incluído.
            </p>
          </AnimatedSection>

          <div className="space-y-16 sm:space-y-24">
            {[
              {
                badge: '📖 Completo',
                image: featureResumo,
                title: 'Resumo de Orlando',
                alt: 'Tela do resumo de Orlando com informações essenciais para turistas brasileiros',
                text: 'Tudo o que você precisa saber antes de ir, sem enrolação. Nunca foi para Orlando? Sem problema! Aqui você encontra tudo: documentação, dicas de economia, navegação rápida por tema.',
              },
              {
                badge: '🧭 Essencial',
                image: featureGuia,
                title: 'Guia Completo de Viagem',
                alt: 'Guia completo de viagem para Orlando com dicas de transporte e compras',
                text: 'Transporte, aeroporto, compras, parques, emergências, tudo organizado. Locomoção, mochila do parque, outlets, dicas dos parques Universal e Disney — sem enrolação.',
              },
              {
                badge: '✅ Prático',
                image: featureChecklist,
                title: 'Checklists Inteligentes',
                alt: 'Checklist inteligente com categorias de documentos, mala e saúde para viagem',
                text: 'Nada esquecido. Nada improvisado. Documentos, mala de viagem, aeroporto, saúde, crianças, fotografia — tudo organizado em categorias com progresso visual.',
              },
              {
                badge: '🗺️ Interativo',
                image: featureMapa,
                title: 'Mapa Interativo dos Parques',
                alt: 'Mapa interativo dos parques de Orlando com GPS e tempo de espera ao vivo',
                text: 'Veja todas as atrações, restaurantes e banheiros no mapa com GPS integrado. Planeje sua rota dentro do parque e não perca tempo procurando atrações. Tempo de espera ao vivo.',
              },
              {
                badge: '🏰 Detalhado',
                image: featureParques,
                title: 'Guia Completo dos Parques',
                alt: 'Guia dos parques Disney, Universal e SeaWorld com informações detalhadas',
                text: 'Disney, Universal, SeaWorld, aquáticos e muito mais. Informações, dicas e vídeos de todos os parques de Orlando, organizados por categoria.',
              },
              {
                badge: '⚡ Estratégico',
                image: featureLightningLane,
                title: 'Lightning Lane & Multi Pass',
                alt: 'Tutorial passo a passo do Lightning Lane e Multi Pass da Disney',
                text: 'Explicado passo a passo, com estratégia real de quem usa todo dia. Conceitos, tipos de passes, preços por parque e tutoriais práticos.',
              },
              {
                badge: '🤖 Powered by AI',
                image: featureRoteiroIA,
                title: 'Roteiro Personalizado com IA',
                alt: 'Roteiro personalizado gerado por inteligência artificial para parques de Orlando',
                text: 'Dia a dia adaptado ao seu grupo, ritmo e preferências. Responda algumas perguntas e nossa inteligência artificial criará um roteiro exclusivo para sua viagem, otimizado e personalizado.',
              },
              {
                badge: '🍽️ Popular',
                image: featureRestaurantes,
                title: 'Guia Completo de Restaurantes',
                alt: 'Guia de restaurantes em Orlando organizados por parque e tipo de comida',
                text: 'Escolha onde comer sem improviso, com restaurantes organizados por parque, fora dos parques, tipo de comida e faixa de preço. 279 restaurantes catalogados.',
              },
              {
                badge: '📁 Seguro',
                image: featureDocumentos,
                title: 'Carteira de Documentos',
                alt: 'Carteira digital de documentos e vouchers acessível offline nos parques',
                text: 'Ingressos, vouchers e tudo em um só lugar. Seus vouchers e comprovantes acessíveis offline dentro dos parques.',
              },
              {
                badge: '🎟️ Exclusivo',
                image: featureCupons,
                title: 'Cupons de Parceiros',
                alt: 'Cupons de desconto exclusivos para compras e restaurantes em Orlando',
                text: 'Economia real durante a viagem. Descontos exclusivos para usar durante sua viagem com parceiros selecionados.',
              },
            ].map((feature, i) => (
              <AnimatedSection key={i} delay={100}>
                <div className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}>
                  {/* Feature image */}
                  <div className="flex-1 w-full">
                    <div className="relative rounded-2xl overflow-hidden group hover:shadow-glow transition-all duration-500 border border-border/50 hover:border-secondary/30">
                      <img src={feature.image} alt={feature.alt || feature.title} className="w-full aspect-video object-cover" loading="lazy" />
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
                      Há mais de 8 anos ajudando famílias brasileiras a aproveitarem Orlando sem erros, sem correria e sem frustração. Todo o conteúdo do planejador vem da prática real dentro dos parques — não de teoria.
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

      {/* ═══ BLOCO 6 — COMPARAÇÃO (Antes x Depois) ═══ */}
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
                      'Tempo perdido andando sem estratégia',
                      'Estresse com as crianças no parque',
                      'Gastos desnecessários',
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
                      'Viagem muito mais tranquila',
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
            <div className="max-w-lg mx-auto mb-10">
              {/* Basic */}
              <AnimatedSection delay={100}>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white h-full">
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="font-display text-xl font-bold mb-2">Planejador</h3>
                    <p className="text-white/60 text-sm mb-6">Autonomia total para planejar</p>
                    <div className="mb-6">
                     <span className="text-white/40 line-through text-lg">R$ 197</span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl sm:text-5xl font-bold text-secondary">
                          {dbPlans?.basic ? formatPriceBRL(dbPlans.basic.price_cents).formatted : 'R$97,00'}
                        </span>
                      </div>
                      <Badge className="mt-2 bg-secondary/20 text-secondary border-secondary/30 text-xs">🔥 Oferta por tempo limitado</Badge>
                    </div>
                    <ul className="space-y-3 mb-8 text-left">
                      {(dbPlans?.basic?.features || ['Perfil de viagem completo', 'Seleção de atrações', 'Mapa interativo', 'Checklists inteligentes', 'Roteiro com dicas gerais', 'Guia de restaurantes', 'Carteira de documentos', 'Cupons de parceiros']).map((f, i) => (
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
                    <div className="flex flex-col items-center gap-1 mt-3 text-xs text-white/50">
                      <span>✅ Acesso imediato</span>
                      <span>✅ Funciona no celular</span>
                      <span>✅ 7 dias de garantia</span>
                    </div>
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
                      Teste por 7 dias.
                    </h2>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-4">
                      Se não fizer sentido para você, devolvemos seu dinheiro. Simples assim. Sem letras miúdas.
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
          <p className="text-white/70 mt-2 text-sm">Mais de 1500 famílias já planejaram com o OFP</p>
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
            <button onClick={() => setContactOpen(true)} className="hover:text-foreground transition-colors">Contato</button>
            <Link to="/termos-e-privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Orlando Fast Pass. Todos os direitos reservados.</p>
        </div>
      </footer>

      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default Landing;
