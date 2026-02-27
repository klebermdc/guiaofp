import { useEffect, useState, useRef, memo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Plane,
  Heart,
  Shield,
  Baby,
  Luggage,
  CheckCircle2,
  Sparkles,
  Star,
  CloudSun,
  Snowflake,
  Sun,
  ArrowRight,
  AlertTriangle,
  Pill,
  UtensilsCrossed,
  Gamepad2,
  Shirt,
  FileText,
  Car,
  Clock,
  ChevronDown,
} from 'lucide-react';

// ─── Animated Section ────────────────────────────────────
const AnimatedSection = memo(({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
});
AnimatedSection.displayName = 'AnimatedSection';

// ─── Checklist Item ────────────────────────────────────
const CheckItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2 py-1">
    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
    <span className="text-sm text-foreground/90">{children}</span>
  </li>
);

// ─── Section Title ────────────────────────────────────
const SectionTitle = ({ emoji, title, color = 'text-foreground' }: { emoji: string; title: string; color?: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="text-3xl">{emoji}</span>
    <h2 className={`text-2xl md:text-3xl font-display font-bold ${color}`}>{title}</h2>
  </div>
);

// ─── Color Card ────────────────────────────────────
const ColorCard = ({ title, emoji, borderColor, bgColor, children }: {
  title: string; emoji: string; borderColor: string; bgColor: string; children: React.ReactNode;
}) => (
  <Card className={`border-2 ${borderColor} ${bgColor} hover:scale-[1.02] transition-transform duration-300`}>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg">
        <span className="text-2xl">{emoji}</span>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// ─── Main Page ────────────────────────────────────
const GuiaMiniViajante = () => {
  return (
    <AppLayout>
      <SEO
        title="Guia Criança OFP | Orlando Fast Pass"
        description="Guia completo para famílias que viajam com bebês e crianças. Documentação, bagagem, farmacinha, alimentação e mais."
      />

      <div className="min-h-screen bg-background">

        {/* ═══════════════ 1. HERO ═══════════════ */}
        <section className="relative overflow-hidden py-20 md:py-28">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(200,80%,60%)] via-[hsl(270,60%,60%)] to-[hsl(340,70%,70%)] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 text-5xl opacity-30 animate-bounce" style={{ animationDuration: '3s' }}>✈️</div>
          <div className="absolute top-20 right-16 text-4xl opacity-25 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>☁️</div>
          <div className="absolute bottom-16 left-1/4 text-3xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute bottom-10 right-1/3 text-4xl opacity-25 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>🧸</div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-4 py-1.5">
              <Baby className="w-4 h-4 mr-1" /> Viajar com Crianças
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 drop-shadow-lg">
              Guia Criança OFP
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Troca por Viajar com Crianças — passo a passo para viajar leve, prática e preparada
            </p>
            <Button
              size="lg"
              className="bg-white text-purple-700 hover:bg-white/90 font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              onClick={() => document.getElementById('info-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Comece por aqui ✈️
            </Button>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">

          {/* ═══════════════ 2. INFORMAÇÕES IMPORTANTES ═══════════════ */}
          <AnimatedSection>
            <section id="info-section">
              <SectionTitle emoji="💡" title="Informações Importantes" />
              <Card className="border-2 border-purple-500/30 bg-purple-500/10">
                <CardContent className="pt-6 space-y-4">
                  <p className="text-foreground/90 leading-relaxed">
                    Este guia foi criado para transformar o planejamento de viagem em família em algo <strong>leve, prático e sem estresse</strong>. 
                    Aqui você encontra tudo o que precisa — desde documentação e bagagem até farmacinha, alimentação e um cronograma final de prontidão.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-sm px-3 py-1">
                      💜 Comunidade Exclusiva
                    </Badge>
                    <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-sm px-3 py-1">
                      ✨ Sua opinião é essencial
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-sm px-3 py-1">
                      🤝 Suporte disponível
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </section>
          </AnimatedSection>

          {/* ═══════════════ 3. BAGAGENS ═══════════════ */}
          <AnimatedSection delay={100}>
            <section>
              <SectionTitle emoji="🧳" title="Entenda sobre as Bagagens" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorCard title="Vai usando" emoji="🎒" borderColor="border-green-500/40" bgColor="bg-green-500/10">
                  <p className="text-sm text-foreground/80">Roupas do corpo, carrinho (até a porta do avião), chupeta, celular</p>
                </ColorCard>
                <ColorCard title="Bolsa de mão" emoji="👜" borderColor="border-pink-500/40" bgColor="bg-pink-500/10">
                  <p className="text-sm text-foreground/80">Mochila menor, fica debaixo da poltrona; fraldas, mamadeira, lanchinhos</p>
                </ColorCard>
                <ColorCard title="Mala de mão" emoji="🧳" borderColor="border-blue-500/40" bgColor="bg-blue-500/10">
                  <p className="text-sm text-foreground/80">Até 10kg, compartimento superior; itens do trajeto e segurança caso mala despachada seja extraviada</p>
                </ColorCard>
                <ColorCard title="Mala despachada" emoji="📦" borderColor="border-amber-500/40" bgColor="bg-amber-500/10">
                  <p className="text-sm text-foreground/80">23kg, entregue no balcão; acesso apenas no destino final; ideal para líquidos acima de 100ml</p>
                </ColorCard>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                  💡 No método Mini Viajante, a proposta é que tudo caiba na mala de mão!
                </p>
              </div>
            </section>
          </AnimatedSection>

          {/* ═══════════════ 4. CHECKLIST GERAL ═══════════════ */}
          <AnimatedSection delay={100}>
            <section>
              <SectionTitle emoji="✅" title="Checklist Geral" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <ColorCard title="Documentos" emoji="📄" borderColor="border-blue-500/40" bgColor="bg-blue-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>RG / Certidão de Nascimento / CNH / PID</CheckItem>
                    <CheckItem>Passaporte / Visto</CheckItem>
                    <CheckItem>Cartão de crédito / Dinheiro</CheckItem>
                    <CheckItem>Autorização para viagem</CheckItem>
                    <CheckItem>Documentos específicos por país</CheckItem>
                    <CheckItem>Cópia digital de todos os documentos</CheckItem>
                    <CheckItem>Seguro Viagem / Acesso a Sala VIP</CheckItem>
                    <CheckItem>Chip Internacional</CheckItem>
                    <CheckItem>Ingressos / Vouchers / Reservas / Roteiro</CheckItem>
                  </ul>
                </ColorCard>

                <ColorCard title="Transporte e Conforto" emoji="🚗" borderColor="border-teal-500/40" bgColor="bg-teal-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Carrinho / Cadeirinha / Acessórios</CheckItem>
                    <CheckItem>Sling / Canguru</CheckItem>
                    <CheckItem>Cobertor ou echarpe + fronha infantil</CheckItem>
                    <CheckItem>Puff ou cama para o avião</CheckItem>
                    <CheckItem>Almofada de amamentação / travesseiro</CheckItem>
                    <CheckItem>Canga ou mini tapete / Berço portátil</CheckItem>
                    <CheckItem>Itens para escurecer o ambiente</CheckItem>
                  </ul>
                </ColorCard>

                <ColorCard title="Segurança" emoji="🔒" borderColor="border-red-500/40" bgColor="bg-red-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Pulseira de identificação / Guia / TAG</CheckItem>
                    <CheckItem>Protetor de tomada / quina / porta</CheckItem>
                    <CheckItem>Babá eletrônica + extensão elétrica</CheckItem>
                  </ul>
                </ColorCard>

                <ColorCard title="Brinquedos e Eletrônicos" emoji="🧸" borderColor="border-purple-500/40" bgColor="bg-purple-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Chupeta / Mordedor / Naninha</CheckItem>
                    <CheckItem>Brinquedos diversos</CheckItem>
                    <CheckItem>Celular / Tablet / Kindle</CheckItem>
                    <CheckItem>Filmes e desenhos baixados</CheckItem>
                    <CheckItem>Fones de ouvido / Notebook</CheckItem>
                    <CheckItem>Suporte para celular (avião e carro)</CheckItem>
                    <CheckItem>Carregadores, Power bank, Adaptador, Câmera</CheckItem>
                  </ul>
                </ColorCard>

                <ColorCard title="Higiene e Farmacinha" emoji="💊" borderColor="border-emerald-500/40" bgColor="bg-emerald-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Fraldas (mínimo 30 ou 6 por dia)</CheckItem>
                    <CheckItem>Lenço umedecido, creme de assadura, álcool em gel</CheckItem>
                    <CheckItem>Trocador ou redutor de vaso dobrável</CheckItem>
                    <CheckItem>Escova, pasta e fio dental</CheckItem>
                    <CheckItem>Sabonete cabeça aos pés / Toalha com capuz</CheckItem>
                    <CheckItem>Protetor solar e repelente</CheckItem>
                    <CheckItem>Farmacinha completa</CheckItem>
                    <CheckItem>Banheira inflável ou dobrável</CheckItem>
                    <CheckItem>Itens de higiene para a mãe</CheckItem>
                  </ul>
                </ColorCard>

                <ColorCard title="Alimentação" emoji="🍼" borderColor="border-orange-500/40" bgColor="bg-orange-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Copos / Mamadeiras / Babador / Prato / Talher</CheckItem>
                    <CheckItem>Higienizador e aquecedor de mamadeira</CheckItem>
                    <CheckItem>Chaleira ou panela elétrica compacta</CheckItem>
                    <CheckItem>Lancheira completa</CheckItem>
                    <CheckItem>Leite em pó / biscoitos / papinha</CheckItem>
                    <CheckItem>Cadeirinha de alimentação portátil</CheckItem>
                  </ul>
                </ColorCard>

                <ColorCard title="Bagagem e Acessórios" emoji="🎒" borderColor="border-indigo-500/40" bgColor="bg-indigo-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Organizadores / Sacos a vácuo / Sacos ziplock</CheckItem>
                    <CheckItem>Cadeado TSA / Fita de segurança / Sacola de pano</CheckItem>
                    <CheckItem>Balança de mala / Mala extra expansível</CheckItem>
                    <CheckItem>Mini máquina de lavar</CheckItem>
                  </ul>
                </ColorCard>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-sm text-yellow-300 flex items-center gap-2">
                  🌟 <em>Quanto menor a mala, mais prática se torna a viagem! Use esta lista como bússola — a escolha final é sua.</em>
                </p>
              </div>
            </section>
          </AnimatedSection>

          {/* ═══════════════ 5. DOCUMENTAÇÃO ═══════════════ */}
          <AnimatedSection delay={100}>
            <section>
              <SectionTitle emoji="📋" title="Documentação" />
              <Accordion type="single" collapsible className="space-y-2">
                {[
                  { value: 'mercosul', icon: '🌎', title: 'Países do Mercosul', content: 'RG é suficiente para viagens dentro do Mercosul. Verifique se a foto do documento ainda corresponde à aparência atual da criança. Se viajar apenas com um dos pais, é necessária autorização do outro responsável.' },
                  { value: 'outros', icon: '✈️', title: 'Outros Países', content: 'Passaporte obrigatório. Alguns destinos exigem visto ou formulários adicionais. Passaporte infantil tem validade reduzida conforme a idade da criança.' },
                  { value: 'emissao', icon: '📋', title: 'Emissão de Passaporte e Autorizações', content: 'Emissão online pela Polícia Federal + agendamento presencial. Autorização judicial ou extrajudicial (com firma reconhecida). Opção de Autorização Eletrônica de Viagem disponível.' },
                  { value: 'visto', icon: '🇺🇸', title: 'Visto Americano para Bebê', content: 'Formulário DS-160 + pagamento de taxa. Menores de 14 anos podem não precisar de entrevista. Visto geralmente válido por 10 anos.' },
                  { value: 'vacina', icon: '💉', title: 'Cartão de Vacinação', content: 'Carteira de Vacinação Digital via ConecteSUS. Salve certificados offline — Febre Amarela e COVID incluídos.' },
                  { value: 'pcd', icon: '♿', title: 'Condições Específicas (Autismo, TDAH)', content: 'Considerados PCD por lei. Acompanhantes podem ter desconto de até 80% nas passagens. Formulários MEDIF ou FREMEC junto às companhias aéreas.' },
                ].map(item => (
                  <AccordionItem key={item.value} value={item.value} className="border border-border/50 rounded-xl px-4 bg-card/50">
                    <AccordionTrigger className="text-left">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-semibold">{item.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-foreground/80 text-sm leading-relaxed">{item.content}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-300 font-semibold flex items-center gap-2">
                  ⚠️ Desconto de até 80% nas passagens para acompanhantes de PCD!
                </p>
              </div>
            </section>
          </AnimatedSection>

          {/* ═══════════════ 6. TRANSPORTE E CONFORTO ═══════════════ */}
          <AnimatedSection delay={100}>
            <section>
              <SectionTitle emoji="🚗" title="Transporte e Conforto" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ColorCard title="Carrinhos de Bebê" emoji="🛒" borderColor="border-sky-500/40" bgColor="bg-sky-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Com bebê conforto acoplado — prático para táxis</CheckItem>
                    <CheckItem>Compactos de cabine — cabem no compartimento superior</CheckItem>
                    <CheckItem>Ultracompactos — alguns cabem dentro de mochilas</CheckItem>
                    <CheckItem>Para crianças maiores — até 25kg ou com extensores</CheckItem>
                    <CheckItem>Carrinhos duplos — lado a lado ou em linha</CheckItem>
                  </ul>
                </ColorCard>

                <ColorCard title="Cadeirinhas e Assentos" emoji="💺" borderColor="border-violet-500/40" bgColor="bg-violet-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Presa com cinto — leve, alterna entre veículos</CheckItem>
                    <CheckItem>Com ISOFIX — mais estável e segura</CheckItem>
                    <CheckItem>Bebê conforto no avião — requer assento próprio</CheckItem>
                    <CheckItem>Booster — para crianças acima de 15kg</CheckItem>
                  </ul>
                </ColorCard>

                <ColorCard title="Conforto no Avião" emoji="✈️" borderColor="border-rose-500/40" bgColor="bg-rose-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Almofada de amamentação no braço da poltrona</CheckItem>
                    <CheckItem>Fronha infantil + echarpe — vira travesseiro</CheckItem>
                    <CheckItem>Cama inflável e extensor de assento</CheckItem>
                    <CheckItem>Rede de descanso presa na mesinha</CheckItem>
                    <CheckItem>Berço portátil e blackout portátil</CheckItem>
                  </ul>
                </ColorCard>
              </div>
            </section>
          </AnimatedSection>

          {/* ═══════════════ 7. SEGURANÇA ═══════════════ */}
          <AnimatedSection delay={100}>
            <section>
              <SectionTitle emoji="🛡️" title="Segurança" />
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">🚶 Segurança em Movimento</h3>
                    <ul className="space-y-1">
                      <CheckItem>Pulseirinhas de identificação com nome e telefone</CheckItem>
                      <CheckItem>Tags de identificação na roupa ou mochila</CheckItem>
                      <CheckItem>Mochila com guia para locais com multidão</CheckItem>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">🏠 Segurança na Hospedagem</h3>
                    <ul className="space-y-1">
                      <CheckItem>Protetores de tomada, quina e porta</CheckItem>
                      <CheckItem>Babá eletrônica com tela própria</CheckItem>
                      <CheckItem>Câmera com acesso remoto via Wi-Fi</CheckItem>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-amber-500/15 border border-amber-500/30">
                  <p className="text-sm font-semibold text-amber-300">
                    ⚠️ Defina claramente qual adulto é responsável pela criança em cada momento — especialmente no check-in e na passagem pelo raio-x.
                  </p>
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* ═══════════════ 8. BRINQUEDOS ═══════════════ */}
          <AnimatedSection delay={100}>
            <section>
              <SectionTitle emoji="🧸" title="Brinquedos e Eletrônicos" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorCard title="Bebês menores" emoji="👶" borderColor="border-pink-500/40" bgColor="bg-pink-500/10">
                  <p className="text-sm text-foreground/80">Brinquedos flexíveis, giroscópios de sucção, dedoches, livrinhos de plástico, brinquedos de encaixe</p>
                </ColorCard>
                <ColorCard title="Bebês maiores" emoji="🍼" borderColor="border-violet-500/40" bgColor="bg-violet-500/10">
                  <p className="text-sm text-foreground/80">Blocos de silicone, pastas Montessori, livros interativos com texturas, pop-it</p>
                </ColorCard>
                <ColorCard title="Crianças menores" emoji="🧒" borderColor="border-cyan-500/40" bgColor="bg-cyan-500/10">
                  <p className="text-sm text-foreground/80">Brinquedos magnéticos, livros lanterna, pintura sem sujar (água ou lousas mágicas)</p>
                </ColorCard>
                <ColorCard title="Crianças maiores" emoji="🧑" borderColor="border-emerald-500/40" bgColor="bg-emerald-500/10">
                  <p className="text-sm text-foreground/80">Massinhas de modelar, jogos de água portáteis (aquaplay), miniaturas</p>
                </ColorCard>
              </div>

              <Card className="mt-4 border-2 border-indigo-500/30 bg-indigo-500/10">
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">📱 Eletrônicos para Distração</h3>
                  <ul className="space-y-1">
                    <CheckItem>Tablets infantis com controle de conteúdo</CheckItem>
                    <CheckItem>Suportes para prender na poltrona do avião</CheckItem>
                    <CheckItem>Fones de ouvido infantis com limitador de volume</CheckItem>
                  </ul>
                </CardContent>
              </Card>

              <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-blue-300 flex items-center gap-2">
                  💡 <em>Eletrônicos devem ir obrigatoriamente na mala de mão. Brinquedos grandes podem ser despachados para ganhar espaço.</em>
                </p>
              </div>
            </section>
          </AnimatedSection>

          {/* ═══════════════ 9. HIGIENE E FARMACINHA ═══════════════ */}
          <AnimatedSection delay={100}>
            <section>
              <SectionTitle emoji="💊" title="Higiene e Farmacinha" />

              <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 mb-6">
                <p className="text-sm text-red-300 font-semibold flex items-center gap-2">
                  🚨 Nunca medique seu bebê sem orientação médica. Consulte o pediatra antes da viagem para obter a prescrição de medicamentos de emergência.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ColorCard title="Farmacinha Básica" emoji="💊" borderColor="border-green-500/40" bgColor="bg-green-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Analgésicos</CheckItem>
                    <CheckItem>Antialérgicos</CheckItem>
                    <CheckItem>Curativos</CheckItem>
                  </ul>
                </ColorCard>

                <ColorCard title="Farmacinha Completa" emoji="🏥" borderColor="border-teal-500/40" bgColor="bg-teal-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Tudo do básico + Probióticos</CheckItem>
                    <CheckItem>Remédios para enjoo/gases</CheckItem>
                    <CheckItem>Antibióticos (com receita)</CheckItem>
                    <CheckItem>Pomadas para picadas/queimaduras</CheckItem>
                    <CheckItem>Soro fisiológico / Termômetro</CheckItem>
                  </ul>
                </ColorCard>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorCard title="Fraldas e Desfralde" emoji="🧷" borderColor="border-pink-500/40" bgColor="bg-pink-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Leve o tipo de fralda que a criança já usa</CheckItem>
                    <CheckItem>Trocadores portáteis dobráveis para aeroportos</CheckItem>
                    <CheckItem>Adaptadores de vaso dobráveis e banquinhos</CheckItem>
                  </ul>
                </ColorCard>

                <ColorCard title="Banho e Cuidados" emoji="🛁" borderColor="border-cyan-500/40" bgColor="bg-cyan-500/10">
                  <ul className="space-y-0.5">
                    <CheckItem>Produtos em potinhos menores (travel size)</CheckItem>
                    <CheckItem>Sacos ziplock para evitar vazamentos</CheckItem>
                    <CheckItem>Tesoura sem ponta e escova de cabelo</CheckItem>
                  </ul>
                </ColorCard>
              </div>
            </section>
          </AnimatedSection>

          {/* ═══════════════ 10. ALIMENTAÇÃO ═══════════════ */}
          <AnimatedSection delay={100}>
            <section>
              <SectionTitle emoji="🍽️" title="Alimentação" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <ColorCard title="Voos Nacionais" emoji="✅" borderColor="border-green-500/40" bgColor="bg-green-500/10">
                  <p className="text-sm text-foreground/80">Regras tranquilas; pode levar quase tudo que o bebê vai consumir</p>
                </ColorCard>
                <ColorCard title="Voos Internacionais" emoji="✈️" borderColor="border-blue-500/40" bgColor="bg-blue-500/10">
                  <p className="text-sm text-foreground/80">Líquidos para bebê podem passar de 100ml; leite em pó, papinhas e comida congelada geralmente permitidos</p>
                </ColorCard>
                <ColorCard title="Alfândega" emoji="⚠️" borderColor="border-amber-500/40" bgColor="bg-amber-500/10">
                  <p className="text-sm text-foreground/80">Frutas frescas, verduras e legumes crus geralmente precisam ser descartados antes da imigração</p>
                </ColorCard>
              </div>

              <Card className="border-2 border-orange-500/30 bg-orange-500/10 mb-4">
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-3">🥪 Sugestões de Lancheira</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-sm font-semibold text-orange-300 mb-1">🥪 Caseiros</p>
                      <p className="text-xs text-foreground/70">Mini sanduíches, bolinhos, quiches, tapioca, pão de queijo</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-300 mb-1">🥕 Frutas/Vegetais</p>
                      <p className="text-xs text-foreground/70">Cenoura, pepino, uvas cortadas em pedaços pequenos</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-300 mb-1">🍘 Industrializados</p>
                      <p className="text-xs text-foreground/70">Biscoitos de arroz, snacks de frutas desidratadas, papinhas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30">
                <p className="text-sm text-teal-300">
                  🛒 <strong>Lista básica de mercado:</strong> Alho, cebola, batata, carnes moídas, ovos, macarrão, arroz e frutas. Panela ou chaleira portátil ajuda no preparo rápido.
                </p>
              </div>
            </section>
          </AnimatedSection>

          {/* ═══════════════ 11. ORGANIZAÇÃO DA BAGAGEM ═══════════════ */}
          <AnimatedSection delay={100}>
            <section>
              <SectionTitle emoji="👕" title="Organização da Bagagem" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border-2 border-yellow-500/40 bg-gradient-to-b from-yellow-500/15 to-yellow-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sun className="w-6 h-6 text-yellow-400" />
                      <h3 className="font-bold text-yellow-300">Verão</h3>
                    </div>
                    <ul className="space-y-0.5">
                      <CheckItem>Roupas com proteção UV</CheckItem>
                      <CheckItem>Fraldas para água</CheckItem>
                      <CheckItem>Chapéus e protetor solar resistente</CheckItem>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-sky-500/40 bg-gradient-to-b from-sky-500/15 to-sky-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CloudSun className="w-6 h-6 text-sky-400" />
                      <h3 className="font-bold text-sky-300">Meia Estação</h3>
                    </div>
                    <ul className="space-y-0.5">
                      <CheckItem>Camadas térmicas</CheckItem>
                      <CheckItem>Casacos normais</CheckItem>
                      <CheckItem>Capas de chuva</CheckItem>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-400/40 bg-gradient-to-b from-blue-400/15 to-blue-400/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Snowflake className="w-6 h-6 text-blue-300" />
                      <h3 className="font-bold text-blue-300">Inverno / Neve</h3>
                    </div>
                    <ul className="space-y-0.5">
                      <CheckItem>Camadas: térmica + fleece + casaco impermeável</CheckItem>
                      <CheckItem>Macacões impermeáveis</CheckItem>
                      <CheckItem>Luvas e botas forradas</CheckItem>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="border border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">📦 Dicas de organização</h3>
                  <ul className="space-y-1">
                    <CheckItem>Organizadores com zíper para separar roupas</CheckItem>
                    <CheckItem>Sacos a vácuo para itens volumosos</CheckItem>
                    <CheckItem>Balança portátil para evitar taxas de excesso</CheckItem>
                  </ul>
                </CardContent>
              </Card>
            </section>
          </AnimatedSection>

          {/* ═══════════════ 12. CRONOGRAMA FINAL ═══════════════ */}
          <AnimatedSection delay={100}>
            <section>
              <SectionTitle emoji="📅" title="Cronograma Final — Desafio da Prontidão" />
              <div className="space-y-3">
                {[
                  { day: '6 dias antes', color: 'border-purple-500/50 bg-purple-500/10', dot: 'bg-purple-500', task: 'Revisar checklist e organizar documentação' },
                  { day: '5 dias antes', color: 'border-blue-500/50 bg-blue-500/10', dot: 'bg-blue-500', task: 'Separar itens de transporte, segurança, higiene e malas por estação' },
                  { day: '4 dias antes', color: 'border-green-500/50 bg-green-500/10', dot: 'bg-green-500', task: 'Organizar alimentação e planejar primeiras refeições no destino' },
                  { day: '3 dias antes', color: 'border-yellow-500/50 bg-yellow-500/10', dot: 'bg-yellow-500', task: 'Separar brinquedos e baixar filmes/séries' },
                  { day: '2 dias antes', color: 'border-orange-500/50 bg-orange-500/10', dot: 'bg-orange-500', task: 'Realizar check-in online e revisar checklist' },
                  { day: '1 dia antes', color: 'border-red-500/50 bg-red-500/10', dot: 'bg-red-500', task: 'Carregar eletrônicos, configurar apps e conferir cartões de embarque' },
                ].map((item, index) => (
                  <div key={index} className={`flex items-center gap-4 p-4 rounded-xl border ${item.color} transition-transform hover:scale-[1.01]`}>
                    <div className={`w-3 h-3 rounded-full ${item.dot} shrink-0`} />
                    <div>
                      <p className="font-bold text-sm">{item.day}</p>
                      <p className="text-sm text-foreground/80">{item.task}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </AnimatedSection>

          {/* ═══════════════ 13. MENSAGEM FINAL ═══════════════ */}
          <AnimatedSection delay={100}>
            <section className="pb-12">
              <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-blue-500/10 overflow-hidden">
                <CardContent className="pt-8 pb-8 text-center">
                  <span className="text-5xl mb-4 block">💜</span>
                  <p className="text-lg text-foreground/90 leading-relaxed max-w-2xl mx-auto italic">
                    "Preparar uma viagem em família exige tempo, pesquisa e carinho. Espero que este guia tenha ajudado a clarear escolhas e simplificar sua organização. Desejo que suas próximas viagens sejam leves, tranquilas e cheias de boas memórias."
                  </p>
                  <p className="mt-4 text-2xl">💜✈️</p>
                  <Link to="/dashboard">
                    <Button className="mt-6" variant="premium" size="lg">
                      Voltar ao Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          </AnimatedSection>

        </div>
      </div>
    </AppLayout>
  );
};

export default GuiaMiniViajante;
