import { useState, useEffect } from 'react';
import { Book, Car, Plane, ShoppingBag, MapPin, Utensils, Backpack, FileText, CreditCard, Ruler, Store, Pill, Tag, Crown, Sparkles, AlertTriangle, Info, CheckCircle2, ChevronDown, Star, Clock, DollarSign, Heart, Users, Camera, Zap, Shield, Globe, Coffee, IceCream, Beer, Pizza, Flame, Fish, Salad, Cake, Ticket, Map, Phone, Wifi, Baby, Accessibility, Sun, Umbrella, Thermometer, Calendar, Check, X, ChevronRight, ExternalLink, Navigation, Compass, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// Clothing size tables
const clothingSizes = {
  general: { brasil: ['PP', 'P', 'M', 'G', 'GG', 'XGG'], usa: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
  kids: { brasil: ['2', '4', '6', '8', '10', '12', '14', '16'], usa: ['2-3', '4-5', '6-6x', '7-8', '10', '12', '14', '16+'] },
  women: { brasil: ['36', '38', '40', '42', '44', '46', '48', '50'], usa: ['2', '4', '6', '8', '10', '12', '14', '16'] },
  men: { brasil: ['36', '37', '38', '39', '40', '41', '42'], usa: ['14', '14.5', '15', '15.5', '16', '16.5', '17'] }
};

const shoeSizes = {
  women: { brasil: ['34', '35', '36', '37', '38', '39'], usa: ['6', '6.5', '7.5', '8', '8.5', '9'] },
  men: { brasil: ['39', '40', '41', '42', '43', '44'], usa: ['8', '8.5', '9', '10', '10.5', '11'] },
  kids: { brasil: ['24-25', '26', '27', '29', '30', '31', '32'], usa: ['9', '10', '11', '12', '13', '13.5', '1'] }
};

// Navigation sections
const navSections = [
  { id: 'locomocao', label: 'Locomoção', icon: Car, color: 'from-blue-500 to-cyan-500' },
  { id: 'aeroporto', label: 'Aeroporto', icon: Plane, color: 'from-violet-500 to-purple-500' },
  { id: 'mochila', label: 'Mochila', icon: Backpack, color: 'from-green-500 to-emerald-500' },
  { id: 'compras', label: 'Compras', icon: ShoppingBag, color: 'from-pink-500 to-rose-500' },
  { id: 'restaurantes-disney', label: 'Disney', icon: Crown, color: 'from-amber-500 to-orange-500' },
  { id: 'restaurantes-universal', label: 'Universal', icon: Globe, color: 'from-indigo-500 to-blue-500' },
  { id: 'restaurantes-orlando', label: 'Orlando', icon: Utensils, color: 'from-rose-500 to-pink-500' },
  { id: 'parques-disney', label: 'Dicas Disney', icon: Star, color: 'from-yellow-500 to-amber-500' },
  { id: 'parques-universal', label: 'Dicas Universal', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
  { id: 'medidas', label: 'Medidas', icon: Ruler, color: 'from-slate-500 to-gray-500' },
  { id: 'emergencias', label: 'Emergências', icon: Shield, color: 'from-red-500 to-rose-500' },
];

const TravelGuide = () => {
  const { isLoading } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-12">
        {/* Modern Hero Header */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent p-5 sm:p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative z-10">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float flex-shrink-0">
                <Book className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-display font-bold text-white leading-tight">
                  Guia Completo de Viagem
                </h1>
                <p className="text-white/80 text-sm sm:text-lg">Tudo para sua aventura em Orlando ✨</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation - Modern Pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Compass className="w-4 h-4" />
            <span className="text-sm font-medium">Navegação Rápida</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap gap-2">
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`group flex items-center justify-center md:justify-start gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-full bg-gradient-to-r ${section.color} text-white text-xs md:text-sm font-medium shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300`}
              >
                <section.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Modern Accordion */}
        <div className="space-y-4">
          {/* LINK PARA CHECKLISTS */}
          <div data-section="checklist" className="group">
            <a href="/checklists" className="block">
              <Card className="border-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
                <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-white">Checklists de Viagem</h3>
                    <p className="text-sm text-white/80">Acesse todos os checklists em uma página dedicada</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/80 flex-shrink-0" />
                </CardContent>
              </Card>
            </a>
          </div>


          {/* LOCOMOÇÃO */}
          <div data-section="locomocao" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="locomocao" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                      <Car className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Como se Locomover</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Aluguel de carro, Uber, táxi e dicas</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-6">
                    {/* Cards Modernos para Locadoras */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                          <Car className="w-4 h-4 text-white" />
                        </span>
                        Locadoras Recomendadas
                      </h4>
                      <div className="grid gap-4 md:grid-cols-3">
                        {[
                          { name: 'Alamo', desc: 'Favorita dos brasileiros', color: 'from-blue-500 to-blue-600' },
                          { name: 'Budget', desc: 'Melhor custo-benefício', color: 'from-amber-500 to-orange-500' },
                          { name: 'Hertz', desc: 'Serviço premium', color: 'from-yellow-500 to-amber-500' },
                        ].map((loc) => (
                          <div key={loc.name} className={`p-5 rounded-2xl bg-gradient-to-br ${loc.color} text-white shadow-lg hover:scale-105 transition-transform`}>
                            <p className="font-bold text-xl">{loc.name}</p>
                            <p className="text-white/80 text-sm">{loc.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <Info className="w-5 h-5 text-blue-500" />
                          Requisitos
                        </h5>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Mais de 25 anos (21-24 paga taxa extra)</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> CNH brasileira válida</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Cartão de crédito internacional</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> PID não é obrigatória</li>
                        </ul>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-500" />
                          Custos Estimados
                        </h5>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Caução: $100-150 (não bloqueia limite)</li>
                          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Uber X Aeroporto→Disney: ~$25-35</li>
                          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> SunPass incluso na devolução</li>
                        </ul>
                      </div>
                    </div>

                    {/* Alertas */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <h5 className="font-semibold mb-3 flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="w-5 h-5" />
                        Regras de Trânsito
                      </h5>
                      <div className="grid gap-3 md:grid-cols-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                          <span>Sinal fechado: pode virar à direita (cuidado com pedestres)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <X className="w-4 h-4 text-red-500 mt-0.5" />
                          <span>NO TURN ON RED: se tiver placa, NÃO pode virar</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                          <span>Cruzamento sem farol: passa quem chegou primeiro</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                          <span>Ônibus escolar com STOP: PARE imediatamente</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* AEROPORTO */}
          <div data-section="aeroporto" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="aeroporto" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
                      <Plane className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Aeroporto e Imigração</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Check-in, imigração, duty free</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-6">
                    {/* Aeroportos */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                        <h5 className="font-bold text-lg mb-2">MCO - Orlando International</h5>
                        <p className="text-white/80 text-sm mb-3">Principal aeroporto • 20-30 min dos parques</p>
                        <Badge className="bg-white/20 text-white border-0">Recomendado</Badge>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 text-white">
                        <h5 className="font-bold text-lg mb-2">SFB - Orlando Sanford</h5>
                        <p className="text-white/80 text-sm mb-3">Alternativo • 45-60 min dos parques</p>
                        <Badge className="bg-white/20 text-white border-0">Voos mais baratos</Badge>
                      </div>
                    </div>

                    {/* Imigração */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                      <h5 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-violet-500" />
                        Dicas de Imigração
                      </h5>
                      <div className="space-y-4">
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="text-sm">
                            <p className="font-medium mb-2">📋 Tenha em mãos:</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Passaporte e Visto</li>
                              <li>• Comprovante de hotel</li>
                              <li>• Locação de carro</li>
                              <li>• Ingressos dos parques</li>
                            </ul>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium mb-2">💬 Perguntas comuns:</p>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Where are you going?</li>
                              <li>• How long will you stay?</li>
                              <li>• How much money are you bringing?</li>
                            </ul>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm">
                          <strong>⚠️ Importante:</strong> Responda apenas o que for perguntado, seja calmo e objetivo.
                        </div>
                      </div>
                    </div>

                    {/* Duty Free */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                      <h5 className="font-semibold mb-3 flex items-center gap-2 text-emerald-600">
                        <ShoppingBag className="w-5 h-5" />
                        Duty Free - Dica de Ouro
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        Compre sempre no <strong>DESEMBARQUE</strong> e nunca no embarque. Produtos comprados no Free Shop do desembarque <strong>NÃO entram na cota de $1000</strong>.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* MOCHILA */}
          <div data-section="mochila" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="mochila" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
                      <Backpack className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Mochila do Parque</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Snacks, itens essenciais</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-6">
                    {/* Snacks Grid */}
                    <div>
                      <h5 className="font-semibold mb-4">🍿 Snacks (Compre no Walmart)</h5>
                      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                        {['💧 Garrafinhas d\'água', '🍎 Frutas (potinhos)', '🧀 Queijos e castanhas', '🍪 Biscoitos e cookies', '🥔 Salgadinhos', '🍫 Barras de cereais'].map((snack) => (
                          <div key={snack} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 text-center text-sm font-medium hover:scale-105 transition-transform">
                            {snack}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Essenciais */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { icon: Sun, label: 'Protetor Solar', desc: 'O sol pode ser bem forte', color: 'from-amber-500 to-yellow-500' },
                        { icon: Umbrella, label: 'Capa de Chuva', desc: 'Para atrações e chuvas', color: 'from-cyan-500 to-blue-500' },
                        { icon: Zap, label: 'Carregador Portátil', desc: 'Bateria extra pro celular', color: 'from-yellow-500 to-amber-500' },
                        { icon: Thermometer, label: 'Casaco Leve', desc: 'Temperatura cai à noite', color: 'from-blue-500 to-indigo-500' },
                        { icon: Pill, label: 'Remédios', desc: 'Dor de cabeça, enjoo', color: 'from-red-500 to-rose-500' },
                        { icon: Camera, label: 'Caneta', desc: 'Para autógrafos dos personagens', color: 'from-purple-500 to-pink-500' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* COMPRAS - SEÇÃO EXPANDIDA */}
          <div data-section="compras" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="compras" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30 flex-shrink-0">
                      <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Guia de Compras</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Outlets, malls, eletrônicos e dicas</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <Tabs defaultValue="outlets" className="w-full">
                    <TabsList className="grid grid-cols-3 sm:grid-cols-5 bg-muted/50 rounded-xl p-1 mb-6 h-auto gap-1">
                      <TabsTrigger value="outlets" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🏪 Outlets</TabsTrigger>
                      <TabsTrigger value="malls" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🏬 Malls</TabsTrigger>
                      <TabsTrigger value="eletronicos" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">📱 Tech</TabsTrigger>
                      <TabsTrigger value="supermercados" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🛒 Super</TabsTrigger>
                      <TabsTrigger value="dicas" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">💡 Dicas</TabsTrigger>
                    </TabsList>

                    {/* OUTLETS */}
                    <TabsContent value="outlets" className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Premium Outlet International */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600 via-pink-500 to-rose-500 text-white shadow-2xl">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                          <div className="p-6 relative">
                            <div className="flex items-center justify-between mb-4">
                              <Badge className="bg-white/20 text-white border-0">⭐ Mais Popular</Badge>
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                              </div>
                            </div>
                            <h6 className="font-bold text-xl mb-2">Orlando International Premium Outlets</h6>
                            <p className="text-white/80 text-sm mb-4">O maior e mais completo outlet de Orlando com +180 lojas</p>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4" />
                                <span>4951 International Dr</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>10h - 21h (Dom-Qui) | 10h - 22h (Sex-Sáb)</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                              {['Nike', 'Coach', 'Michael Kors', 'Kate Spade', 'Tommy', 'Polo Ralph Lauren', 'Swarovski'].map(loja => (
                                <Badge key={loja} className="bg-white/20 text-white border-0 text-xs">{loja}</Badge>
                              ))}
                            </div>
                            <div className="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                              <p className="text-sm font-medium">💡 Dica: Baixe o app do outlet para cupons exclusivos!</p>
                            </div>
                          </div>
                        </div>

                        {/* Premium Outlet Vineland */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-violet-500 text-white shadow-2xl">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                          <div className="p-6 relative">
                            <div className="flex items-center justify-between mb-4">
                              <Badge className="bg-white/20 text-white border-0">🏰 Perto da Disney</Badge>
                              <div className="flex items-center gap-1">
                                {[1,2,3,4].map(i => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                                <Star className="w-3 h-3 text-white/40" />
                              </div>
                            </div>
                            <h6 className="font-bold text-xl mb-2">Orlando Vineland Premium Outlets</h6>
                            <p className="text-white/80 text-sm mb-4">Localização estratégica próximo aos parques Disney</p>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4" />
                                <span>8200 Vineland Ave</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>10h - 21h (Dom-Qui) | 10h - 22h (Sex-Sáb)</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                              {['Calvin Klein', 'Banana Republic', 'Gap', 'Levi\'s', 'Armani', 'Guess', 'Lacoste'].map(loja => (
                                <Badge key={loja} className="bg-white/20 text-white border-0 text-xs">{loja}</Badge>
                              ))}
                            </div>
                            <div className="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                              <p className="text-sm font-medium">💡 Menos cheio que o International Drive!</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lake Buena Vista Factory Stores */}
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                            <Tag className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h6 className="font-bold text-lg">Lake Buena Vista Factory Stores</h6>
                              <Badge className="bg-emerald-500/20 text-emerald-700 border-0">Preços Baixos</Badge>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">Outlet menor mas com preços ainda melhores! Ideal para compras rápidas.</p>
                            <div className="flex flex-wrap gap-2">
                              {['Old Navy', 'Carter\'s', 'OshKosh', 'Converse', 'Nike Factory'].map(loja => (
                                <Badge key={loja} variant="secondary" className="text-xs">{loja}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* MALLS */}
                    <TabsContent value="malls" className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Florida Mall */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-blue-500/50 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                              <Store className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />)}
                            </div>
                          </div>
                          <h6 className="font-bold text-lg mb-2">The Florida Mall</h6>
                          <p className="text-muted-foreground text-sm mb-4">O maior shopping de Orlando! +250 lojas incluindo Apple Store, M&M's World e lojas de departamento.</p>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>8001 S Orange Blossom Trail</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {['Apple', 'Macy\'s', 'Dillard\'s', 'Zara', 'H&M', 'Sephora'].map(loja => (
                              <Badge key={loja} variant="secondary" className="text-xs">{loja}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Mall at Millenia */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-amber-500/30 hover:border-amber-500/50 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                              <Crown className="w-6 h-6 text-white" />
                            </div>
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">Luxo</Badge>
                          </div>
                          <h6 className="font-bold text-lg mb-2">Mall at Millenia</h6>
                          <p className="text-muted-foreground text-sm mb-4">Shopping de luxo com as melhores marcas premium. Arquitetura impressionante!</p>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>4200 Conroy Rd</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {['Louis Vuitton', 'Gucci', 'Chanel', 'Tiffany', 'Burberry', 'Neiman Marcus'].map(loja => (
                              <Badge key={loja} variant="secondary" className="text-xs">{loja}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Disney Springs */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-purple-500/30 hover:border-purple-500/50 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">Disney</Badge>
                          </div>
                          <h6 className="font-bold text-lg mb-2">Disney Springs</h6>
                          <p className="text-muted-foreground text-sm mb-4">Complexo de compras, restaurantes e entretenimento da Disney. Entrada gratuita!</p>
                          <div className="flex flex-wrap gap-2">
                            {['World of Disney', 'Lego Store', 'Coca-Cola Store', 'Uniqlo', 'Sephora'].map(loja => (
                              <Badge key={loja} variant="secondary" className="text-xs">{loja}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Universal CityWalk */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-indigo-500/30 hover:border-indigo-500/50 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                              <Globe className="w-6 h-6 text-white" />
                            </div>
                            <Badge className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-0">Universal</Badge>
                          </div>
                          <h6 className="font-bold text-lg mb-2">Universal CityWalk</h6>
                          <p className="text-muted-foreground text-sm mb-4">Área de entretenimento com lojas temáticas exclusivas e restaurantes.</p>
                          <div className="flex flex-wrap gap-2">
                            {['Universal Store', 'Hard Rock Cafe', 'Voodoo Doughnut', 'Toothsome'].map(loja => (
                              <Badge key={loja} variant="secondary" className="text-xs">{loja}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* ELETRÔNICOS */}
                    <TabsContent value="eletronicos" className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Best Buy */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center">
                              <Tag className="w-6 h-6 text-blue-700" />
                            </div>
                            <div>
                              <h6 className="font-bold text-lg">Best Buy</h6>
                              <p className="text-white/70 text-sm">Maior variedade de eletrônicos</p>
                            </div>
                          </div>
                          <ul className="space-y-2 text-sm text-white/90">
                            <li className="flex items-center gap-2">✓ TVs, laptops, tablets, câmeras</li>
                            <li className="flex items-center gap-2">✓ Videogames e acessórios</li>
                            <li className="flex items-center gap-2">✓ Eletrodomésticos</li>
                            <li className="flex items-center gap-2">✓ Preços competitivos</li>
                          </ul>
                          <div className="mt-4 p-3 rounded-xl bg-white/10">
                            <p className="text-sm">💡 Compare preços com Amazon antes!</p>
                          </div>
                        </div>

                        {/* Apple Store */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-xl">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                              <span className="text-2xl">🍎</span>
                            </div>
                            <div>
                              <h6 className="font-bold text-lg">Apple Store</h6>
                              <p className="text-white/70 text-sm">Produtos Apple com garantia</p>
                            </div>
                          </div>
                          <ul className="space-y-2 text-sm text-white/90">
                            <li className="flex items-center gap-2">✓ iPhone, iPad, Mac, Watch</li>
                            <li className="flex items-center gap-2">✓ AirPods e acessórios</li>
                            <li className="flex items-center gap-2">✓ Gravação gratuita</li>
                            <li className="flex items-center gap-2">✓ Garantia internacional</li>
                          </ul>
                          <div className="mt-4 p-3 rounded-xl bg-white/10">
                            <p className="text-sm">📍 Florida Mall e Mall at Millenia</p>
                          </div>
                        </div>
                      </div>

                      {/* Outras opções */}
                      <div className="grid gap-3 md:grid-cols-3">
                        {[
                          { name: 'Target', desc: 'Eletrônicos + utilidades', icon: '🎯', color: 'from-red-500 to-red-600' },
                          { name: 'Walmart', desc: 'Preços mais baixos', icon: '🛒', color: 'from-blue-500 to-blue-600' },
                          { name: 'Amazon Locker', desc: 'Retire compras online', icon: '📦', color: 'from-amber-500 to-orange-500' },
                        ].map(loja => (
                          <div key={loja.name} className={`p-4 rounded-xl bg-gradient-to-br ${loja.color} text-white`}>
                            <span className="text-2xl mb-2 block">{loja.icon}</span>
                            <p className="font-bold">{loja.name}</p>
                            <p className="text-white/80 text-sm">{loja.desc}</p>
                          </div>
                        ))}
                      </div>

                      {/* Dica de preços */}
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30">
                        <h6 className="font-bold mb-3 flex items-center gap-2 text-amber-700">
                          <DollarSign className="w-5 h-5" />
                          Comparação de Preços
                        </h6>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="p-3 rounded-xl bg-white/50 dark:bg-black/20">
                            <p className="font-medium text-sm">iPhone 16 Pro 256GB</p>
                            <p className="text-muted-foreground text-xs">EUA: ~$1,099 | Brasil: ~R$10,500</p>
                            <p className="text-emerald-600 text-xs font-medium">Economia: ~30%</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/50 dark:bg-black/20">
                            <p className="font-medium text-sm">AirPods Pro 2</p>
                            <p className="text-muted-foreground text-xs">EUA: ~$249 | Brasil: ~R$2,200</p>
                            <p className="text-emerald-600 text-xs font-medium">Economia: ~35%</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* SUPERMERCADOS */}
                    <TabsContent value="supermercados" className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        {[
                          { name: 'Walmart', color: 'from-blue-600 to-blue-700', icon: '🛒', rating: 5, desc: 'O mais completo! Tudo que você precisa', items: ['Snacks para parques', 'Remédios baratos', 'Roupas básicas', 'Eletrônicos', 'Farmácia 24h'] },
                          { name: 'Target', color: 'from-red-500 to-red-600', icon: '🎯', rating: 4, desc: 'Qualidade superior, ambiente agradável', items: ['Produtos exclusivos', 'Roupas trendy', 'Decoração', 'Snacks gourmet', 'Café Starbucks'] },
                          { name: 'Publix', color: 'from-green-500 to-green-600', icon: '🥗', rating: 4, desc: 'Supermercado local de qualidade', items: ['Produtos frescos', 'Padaria incrível', 'Deli com sanduíches', 'Produtos locais', 'Ambiente premium'] },
                        ].map(super_ => (
                          <div key={super_.name} className={`p-5 rounded-2xl bg-gradient-to-br ${super_.color} text-white shadow-xl`}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-3xl">{super_.icon}</span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < super_.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'}`} />
                                ))}
                              </div>
                            </div>
                            <h6 className="font-bold text-lg mb-1">{super_.name}</h6>
                            <p className="text-white/80 text-sm mb-3">{super_.desc}</p>
                            <ul className="space-y-1">
                              {super_.items.map(item => (
                                <li key={item} className="text-sm text-white/90 flex items-center gap-2">
                                  <Check className="w-3 h-3" />{item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Lista de compras recomendada */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50">
                        <h6 className="font-bold mb-4 flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-pink-500" />
                          Lista de Compras Essenciais
                        </h6>
                        <div className="grid gap-3 md:grid-cols-4">
                          {[
                            { cat: '🍿 Snacks', items: 'Goldfish, Cheez-It, Oreo, M&Ms' },
                            { cat: '💊 Farmácia', items: 'Tylenol, Advil, Band-Aid, Vitaminas' },
                            { cat: '🧴 Cuidados', items: 'Protetor solar, Repelente, Loções' },
                            { cat: '🥤 Bebidas', items: 'Água, Gatorade, Sucos' },
                          ].map(cat => (
                            <div key={cat.cat} className="p-3 rounded-xl bg-background/50">
                              <p className="font-medium text-sm mb-1">{cat.cat}</p>
                              <p className="text-xs text-muted-foreground">{cat.items}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* DICAS */}
                    <TabsContent value="dicas" className="space-y-6">
                      {/* Cota de Isenção */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-7 h-7" />
                          </div>
                          <div>
                            <h5 className="font-bold text-xl mb-2">Cota de Isenção para o Brasil</h5>
                            <div className="grid gap-3 md:grid-cols-2 mt-4">
                              <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                                <p className="font-bold text-2xl">US$ 1.000</p>
                                <p className="text-white/80 text-sm">Compras em lojas (por pessoa)</p>
                              </div>
                              <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                                <p className="font-bold text-2xl">US$ 1.000</p>
                                <p className="text-white/80 text-sm">Duty Free (adicional)</p>
                              </div>
                            </div>
                            <p className="text-white/90 text-sm mt-4">⚠️ Excedeu a cota? Taxa de 50% sobre o valor excedente!</p>
                          </div>
                        </div>
                      </div>

                      {/* Lojas de Desconto */}
                      <div>
                        <h6 className="font-bold mb-4 flex items-center gap-2">
                          <Tag className="w-5 h-5 text-emerald-500" />
                          Lojas de Desconto Imperdíveis
                        </h6>
                        <div className="grid gap-4 md:grid-cols-2">
                          {[
                            { name: 'Ross Dress for Less', desc: 'Roupas de marca com até 60% off', dica: 'Vá de manhã para melhores opções', color: 'from-blue-500 to-blue-600' },
                            { name: 'TJ Maxx', desc: 'Marcas premium com desconto', dica: 'Ótimo para bolsas e acessórios', color: 'from-red-500 to-red-600' },
                            { name: 'Marshalls', desc: 'Similar ao TJ Maxx, mesma empresa', dica: 'Excelente para sapatos', color: 'from-purple-500 to-purple-600' },
                            { name: 'Burlington', desc: 'Casacos e roupas de inverno', dica: 'Preços imbatíveis em casacos', color: 'from-green-500 to-green-600' },
                          ].map(loja => (
                            <div key={loja.name} className={`p-4 rounded-xl bg-gradient-to-br ${loja.color} text-white`}>
                              <h6 className="font-bold mb-1">{loja.name}</h6>
                              <p className="text-white/80 text-sm mb-2">{loja.desc}</p>
                              <p className="text-white/90 text-xs flex items-center gap-1">
                                <Info className="w-3 h-3" /> {loja.dica}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dicas gerais */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30">
                          <h6 className="font-bold mb-3 text-emerald-700 flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Faça Isso
                          </h6>
                          <ul className="space-y-2 text-sm">
                            <li>✓ Baixe apps de cupons (Honey, RetailMeNot)</li>
                            <li>✓ Compare preços antes de comprar</li>
                            <li>✓ Guarde todas as notas fiscais</li>
                            <li>✓ Compre no início da viagem</li>
                            <li>✓ Aproveite o Tax-Free Weekend (agosto)</li>
                          </ul>
                        </div>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border-2 border-red-500/30">
                          <h6 className="font-bold mb-3 text-red-700 flex items-center gap-2">
                            <X className="w-5 h-5" />
                            Evite Isso
                          </h6>
                          <ul className="space-y-2 text-sm">
                            <li>✗ Não compre eletrônicos sem pesquisar</li>
                            <li>✗ Não esqueça do imposto (6-7.5%)</li>
                            <li>✗ Não ultrapasse a cota sem saber</li>
                            <li>✗ Não deixe tudo para o último dia</li>
                            <li>✗ Não compre falsificações</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* RESTAURANTES DISNEY - EXPANDIDO */}
          <div data-section="restaurantes-disney" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="restaurantes-disney" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                      <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Restaurantes Disney</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Dicas, preços e reservas</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <Tabs defaultValue="magic-kingdom" className="w-full">
                    <TabsList className="grid grid-cols-2 sm:flex sm:flex-wrap justify-start bg-muted/50 rounded-xl p-1 mb-6 h-auto gap-1">
                      <TabsTrigger value="magic-kingdom" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🏰 Magic Kingdom</TabsTrigger>
                      <TabsTrigger value="epcot" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🌍 EPCOT</TabsTrigger>
                      <TabsTrigger value="hollywood" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🎬 Hollywood</TabsTrigger>
                      <TabsTrigger value="animal" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🦁 Animal Kingdom</TabsTrigger>
                    </TabsList>

                    <TabsContent value="magic-kingdom" className="space-y-4">
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                        <p className="text-sm">💡 <strong>Reserve com 60 dias de antecedência</strong> para restaurantes populares!</p>
                      </div>
                      {[
                        { name: "Be Our Guest", tipo: "Table Service", preco: "$$$$", desc: "Jantar romântico no castelo da Bela e a Fera. Menu francês sofisticado com filet mignon e ratatouille.", badges: ["Mais Disputado", "Romântico"], rating: 5, dica: "Peça a Grey Stuff - é divine!" },
                        { name: "Cinderella's Royal Table", tipo: "Character Dining", preco: "$$$$", desc: "Café com princesas dentro do Castelo da Cinderela! Experiência única e inesquecível.", badges: ["Com Princesas", "No Castelo"], rating: 5, dica: "Crianças ganham varinha ou espada" },
                        { name: "Liberty Tree Tavern", tipo: "Family Style", preco: "$$$", desc: "Thanksgiving o ano todo! Peru, purê, stuffing e torta de maçã. All-you-can-eat.", badges: ["All-You-Can-Eat", "Família"], rating: 4, dica: "Porções generosas!" },
                        { name: "Skipper Canteen", tipo: "Table Service", preco: "$$$", desc: "Temática Jungle Cruise com culinária global. Garçons fazem piadas!", badges: ["Divertido", "Temático"], rating: 4, dica: "Kungaloosh Pork Ribs!" },
                        { name: "Columbia Harbour House", tipo: "Quick Service", preco: "$", desc: "Fish & chips no Liberty Square. Um dos melhores quick services!", badges: ["Frutos do Mar", "Econômico"], rating: 4, dica: "2º andar mais tranquilo" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-amber-500/30 transition-all">
                          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-2 mb-2">
                            <h6 className="font-bold text-base sm:text-lg">{rest.name}</h6>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] sm:text-xs">{rest.tipo}</Badge>
                              <Badge variant="outline" className="text-[10px] sm:text-xs">{rest.preco}</Badge>
                              <div className="flex gap-0.5 sm:ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-xs sm:text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-[10px] sm:text-xs">{b}</Badge>)}</div>
                          <div className="p-2 sm:p-3 rounded-lg bg-amber-500/10 text-xs sm:text-sm"><span className="text-amber-700 dark:text-amber-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="epcot" className="space-y-4">
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
                        <p className="text-sm">🌍 <strong>World Showcase:</strong> 11 países com culinária autêntica!</p>
                      </div>
                      {[
                        { name: "Le Cellier Steakhouse", pais: "🇨🇦", tipo: "Signature", preco: "$$$$", desc: "O melhor steakhouse da Disney! Carnes premium e o famoso Cheddar Cheese Soup.", badges: ["Premiado", "Romântico"], rating: 5, dica: "Cheddar Cheese Soup é imperdível!" },
                        { name: "Space 220", pais: "🚀", tipo: "Table Service", preco: "$$$$", desc: "Restaurante no ESPAÇO! Elevador simula subida com vista da Terra.", badges: ["Experiência Única", "Novo"], rating: 5, dica: "Reserve com muita antecedência!" },
                        { name: "Via Napoli", pais: "🇮🇹", tipo: "Table Service", preco: "$$$", desc: "Pizzaria napolitana com fornos a lenha. Pizzas enormes!", badges: ["Autêntico", "Família"], rating: 5, dica: "Pizza Mezzo Metro serve 4!" },
                        { name: "Teppan Edo", pais: "🇯🇵", tipo: "Table Service", preco: "$$$", desc: "Hibachi japonês com show de chefs! Perfeito para grupos.", badges: ["Com Show", "Interativo"], rating: 5, dica: "Sente na ponta para melhor visão" },
                        { name: "Akershus", pais: "🇳🇴", tipo: "Character Dining", preco: "$$$$", desc: "Buffet norueguês com princesas Disney!", badges: ["Com Princesas", "Buffet"], rating: 5, dica: "Menos cheio que Cinderella's" },
                        { name: "Les Halles", pais: "🇫🇷", tipo: "Quick Service", preco: "$", desc: "Padaria francesa! Croissants, quiches e macarons.", badges: ["Café", "Doces"], rating: 5, dica: "Croissants acabam cedo!" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-blue-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xl">{rest.pais}</span>
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-blue-500/10 text-sm"><span className="text-blue-700 dark:text-blue-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="hollywood" className="space-y-4">
                      {[
                        { name: "Oga's Cantina", area: "Galaxy's Edge", tipo: "Lounge", preco: "$$$", desc: "Bar de Mos Eisley! Drinks exclusivos e DJ Rex. Experiência Star Wars total!", badges: ["Star Wars", "Imperdível"], rating: 5, dica: "Limite de 45min - aproveite!", color: "from-indigo-500 to-purple-500" },
                        { name: "50's Prime Time Cafe", area: "Echo Lake", tipo: "Table Service", preco: "$$", desc: "Cozinha dos anos 50! Garçons brigam se não comer vegetais.", badges: ["Interativo", "Divertido"], rating: 5, dica: "Finja que não comeu os vegetais!", color: "from-red-500 to-rose-500" },
                        { name: "Sci-Fi Dine-In", area: "Commissary", tipo: "Table Service", preco: "$$$", desc: "Jante em carros vintage assistindo filmes B! Único na Disney.", badges: ["Único", "Temático"], rating: 4, dica: "Peça para sentar no carro!", color: "from-purple-500 to-pink-500" },
                        { name: "Woody's Lunch Box", area: "Toy Story Land", tipo: "Quick Service", preco: "$", desc: "Você é do tamanho de brinquedo! Grilled cheese e Lunch Box Tarts.", badges: ["Toy Story", "Família"], rating: 4, dica: "Tarts são pop-tarts gourmet!", color: "from-yellow-500 to-amber-500" },
                        { name: "Docking Bay 7", area: "Galaxy's Edge", tipo: "Quick Service", preco: "$$", desc: "Comidas intergalácticas! Endorian Tip Yip é frango delicioso.", badges: ["Star Wars", "Inovador"], rating: 4, dica: "Felucian Kefta top!", color: "from-indigo-500 to-blue-500" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-red-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">📍 {rest.area}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-red-500/10 text-sm"><span className="text-red-700 dark:text-red-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="animal" className="space-y-4">
                      {[
                        { name: "Satu'li Canteen", area: "Pandora", tipo: "Quick Service", preco: "$$", desc: "Melhor Quick Service da Disney! Bowls customizáveis com proteínas e molhos únicos.", badges: ["Melhor QS", "Saudável"], rating: 5, dica: "Beef com Chimichurri é top!", color: "from-cyan-500 to-blue-500" },
                        { name: "Tusker House", area: "Africa", tipo: "Character Dining", preco: "$$$$", desc: "Buffet africano com Mickey e amigos em trajes de safári!", badges: ["Com Personagens", "Buffet"], rating: 5, dica: "Café da manhã menos cheio", color: "from-amber-500 to-orange-500" },
                        { name: "Tiffins", area: "Discovery Island", tipo: "Signature", preco: "$$$$", desc: "O mais sofisticado do AK! Menu global inspirado em viagens.", badges: ["Premium", "Elegante"], rating: 5, dica: "Bread Service imperdível!", color: "from-teal-500 to-cyan-500" },
                        { name: "Yak & Yeti", area: "Asia", tipo: "Table Service", preco: "$$$", desc: "Pan-asiático em mansão do Himalaia. Sushi a tailandês!", badges: ["Asiático", "Variado"], rating: 4, dica: "Ahi Tuna Nachos surpreende!", color: "from-red-500 to-orange-500" },
                        { name: "Flame Tree BBQ", area: "Discovery Island", tipo: "Quick Service", preco: "$$", desc: "BBQ defumado com vista pro lago! Ribs e pulled pork.", badges: ["BBQ", "Vista"], rating: 4, dica: "Deck tem vista pro Everest!", color: "from-orange-500 to-red-500" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-green-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">📍 {rest.area}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-green-500/10 text-sm"><span className="text-green-700 dark:text-green-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>

                  {/* Snacks Disney */}
                  <div className="mt-6">
                    <h6 className="font-bold mb-4">🍿 Snacks Imperdíveis Disney</h6>
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                      {[
                        { name: 'Dole Whip', emoji: '🍍', desc: 'Sorvete de abacaxi icônico!', preco: '~$6' },
                        { name: 'Turkey Leg', emoji: '🍗', desc: 'Coxa de peru gigante', preco: '~$15' },
                        { name: 'Mickey Bar', emoji: '🍦', desc: 'Picolé de chocolate', preco: '~$6' },
                        { name: 'Churros', emoji: '🥖', desc: 'Clássico com canela', preco: '~$7' },
                      ].map((snack) => (
                        <div key={snack.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-amber-500/30 text-center hover:scale-105 transition-transform">
                          <span className="text-3xl block mb-2">{snack.emoji}</span>
                          <p className="font-bold text-sm">{snack.name}</p>
                          <p className="text-xs text-muted-foreground">{snack.desc}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">{snack.preco}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* RESTAURANTES UNIVERSAL - EXPANDIDO */}
          <div data-section="restaurantes-universal" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="restaurantes-universal" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                      <Globe className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Restaurantes Universal</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Gastronomia nos parques</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <Tabs defaultValue="universal-studios" className="w-full">
                    <TabsList className="grid grid-cols-2 sm:flex sm:flex-wrap justify-start bg-muted/50 rounded-xl p-1 mb-6 h-auto gap-1">
                      <TabsTrigger value="universal-studios" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🎬 Universal</TabsTrigger>
                      <TabsTrigger value="islands" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🏝️ Islands</TabsTrigger>
                      <TabsTrigger value="epic" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🌟 Epic</TabsTrigger>
                      <TabsTrigger value="citywalk" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🎉 CityWalk</TabsTrigger>
                    </TabsList>

                    <TabsContent value="universal-studios" className="space-y-4">
                      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
                        <p className="text-sm">🎬 <strong>Dica:</strong> Não precisa reserva! Filas são rápidas na maioria dos restaurantes.</p>
                      </div>
                      {[
                        { name: "Leaky Cauldron", area: "Diagon Alley", tipo: "Quick Service", preco: "$$", desc: "O autêntico pub do Beco Diagonal! Fish & chips, meat pie, cottage pie e a imperdível Butterbeer.", badges: ["Harry Potter", "Imperdível"], rating: 5, dica: "Fisherman's Pie é surpreendente!" },
                        { name: "Lombard's Seafood Grille", area: "San Francisco", tipo: "Table Service", preco: "$$$", desc: "O melhor restaurante Table Service do parque! Frutos do mar frescos com vista para a baía.", badges: ["Premium", "Frutos do Mar"], rating: 5, dica: "Reserve para o almoço" },
                        { name: "Finnegan's Bar & Grill", area: "New York", tipo: "Table Service", preco: "$$", desc: "Pub irlandês autêntico com música ao vivo! Irish nachos e fish & chips deliciosos.", badges: ["Música ao Vivo", "Bar"], rating: 4, dica: "Happy hour das 15h às 18h" },
                        { name: "Springfield Fast Food Blvd", area: "Springfield", tipo: "Quick Service", preco: "$", desc: "Todas as comidas dos Simpsons! Krusty Burger, Flaming Moe's, Moe's Tavern.", badges: ["Os Simpsons", "Família"], rating: 4, dica: "Krusty Burger é grande!" },
                        { name: "Louie's Italian", area: "New York", tipo: "Quick Service", preco: "$", desc: "Pizzas e massas italianas. Bom e barato para almoço rápido.", badges: ["Italiano", "Econômico"], rating: 4, dica: "Calzone recheado!" },
                        { name: "Richter's Burger Co.", area: "San Francisco", tipo: "Quick Service", preco: "$", desc: "Hambúrgueres gourmet com molhos especiais. Batatas bem servidas!", badges: ["Burger", "Casual"], rating: 4, dica: "Shake de chocolate top!" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-indigo-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">📍 {rest.area}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-indigo-500/10 text-sm"><span className="text-indigo-700 dark:text-indigo-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="islands" className="space-y-4">
                      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4">
                        <p className="text-sm">🏝️ <strong>Mythos é considerado o melhor restaurante de parque temático do mundo!</strong></p>
                      </div>
                      {[
                        { name: "Three Broomsticks", area: "Hogsmeade", tipo: "Quick Service", preco: "$$", desc: "Taverna de Hogsmeade! Frango defumado, fish & chips e ribs. O ambiente é mágico!", badges: ["Harry Potter", "Imperdível"], rating: 5, dica: "Great Feast serve 4!" },
                        { name: "Mythos Restaurant", area: "Lost Continent", tipo: "Table Service", preco: "$$$", desc: "PREMIADO como melhor restaurante de parque! Culinária mediterrânea dentro de uma caverna incrível.", badges: ["Premiado", "Top 1"], rating: 5, dica: "Reserve pelo app!" },
                        { name: "Thunder Falls Terrace", area: "Jurassic Park", tipo: "Quick Service", preco: "$$", desc: "BBQ com vista para a queda d'água da atração! Rotisserie chicken e ribs defumadas.", badges: ["Vista", "BBQ"], rating: 5, dica: "Sente na varanda!" },
                        { name: "Confisco Grille", area: "Port of Entry", tipo: "Table Service", preco: "$$", desc: "Internacional com menu variado. Bom para grupos indecisos!", badges: ["Variado", "Família"], rating: 4, dica: "Pad Thai surpreende!" },
                        { name: "Doc Sugrue's", area: "Lost Continent", tipo: "Quick Service", preco: "$", desc: "Kebabs e pratos do Oriente Médio. Diferente e delicioso!", badges: ["Diferente", "Rápido"], rating: 4, dica: "Chicken Shawarma!" },
                        { name: "Circus McGurkus", area: "Seuss Landing", tipo: "Quick Service", preco: "$", desc: "Perfeito para crianças! Pizza, frango e ambiente colorido do Dr. Seuss.", badges: ["Kids", "Dr. Seuss"], rating: 4, dica: "Green Eggs and Ham!" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-purple-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">📍 {rest.area}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-purple-500/10 text-sm"><span className="text-purple-700 dark:text-purple-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="epic" className="space-y-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-4">
                        <h6 className="font-bold text-lg mb-2">🎉 Epic Universe - NOVO 2025!</h6>
                        <p className="text-white/80 text-sm">O maior parque da Universal com 5 mundos temáticos únicos!</p>
                      </div>
                      {[
                        { name: "Toadstool Cafe", area: "Super Nintendo World", tipo: "Table Service", preco: "$$$", desc: "O restaurante do Toad! Decoração incrível com cogumelos e mundo do Mario. Menu com pratos temáticos.", badges: ["Nintendo", "Único"], rating: 5, dica: "Reserve com antecedência!" },
                        { name: "1-UP Factory", area: "Super Nintendo World", tipo: "Quick Service", preco: "$$", desc: "Lanches rápidos do mundo Nintendo. Power-Up drinks e Mario snacks!", badges: ["Nintendo", "Drinks"], rating: 5, dica: "Super Star Lemonade!" },
                        { name: "The Great Hall", area: "Ministry of Magic", tipo: "Table Service", preco: "$$$$", desc: "O Grande Salão de Hogwarts! Experiência imersiva com projeções mágicas no teto.", badges: ["Harry Potter", "Premium"], rating: 5, dica: "Vista pro teto encantado!" },
                        { name: "Dragon's Feast", area: "How to Train Your Dragon", tipo: "Quick Service", preco: "$$", desc: "Culinária viking de Berk! Carnes assadas, ensopados e bebidas temáticas.", badges: ["DreamWorks", "Temático"], rating: 4, dica: "Viking Feast para dois!" },
                        { name: "Monsters' Cafe", area: "Dark Universe", tipo: "Quick Service", preco: "$$", desc: "Ambiente gótico com monstros clássicos! Menu criativo e decoração assustadora.", badges: ["Terror", "Diferente"], rating: 4, dica: "Frankenstein's Feast!" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-pink-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">📍 {rest.area}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-pink-500/10 text-sm"><span className="text-pink-700 dark:text-pink-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="citywalk" className="space-y-4">
                      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-4">
                        <p className="text-sm">🎉 <strong>CityWalk:</strong> Entrada gratuita! Ótimo para jantar após os parques.</p>
                      </div>
                      {[
                        { name: "The Toothsome Chocolate Emporium", area: "CityWalk", tipo: "Table Service", preco: "$$$", desc: "Steakhouse steampunk com milkshakes gigantes e sobremesas incríveis! Decoração impressionante.", badges: ["Steampunk", "Sobremesas"], rating: 5, dica: "Milkshakes são enormes!" },
                        { name: "Antojitos Authentic Mexican", area: "CityWalk", tipo: "Table Service", preco: "$$", desc: "Culinária mexicana autêntica! Tacos, guacamole na hora e margaritas premium.", badges: ["Mexicano", "Drinks"], rating: 5, dica: "Guac preparado na mesa!" },
                        { name: "Vivo Italian Kitchen", area: "CityWalk", tipo: "Table Service", preco: "$$$", desc: "Italiano contemporâneo com massas frescas feitas na hora! Wine bar elegante.", badges: ["Italiano", "Premium"], rating: 5, dica: "Veja a pasta sendo feita!" },
                        { name: "NBC Sports Grill", area: "CityWalk", tipo: "Table Service", preco: "$$", desc: "Esportes em 100+ TVs! Comida americana, cervejas artesanais e ambiente animado.", badges: ["Esportes", "Bar"], rating: 4, dica: "Ótimo para assistir jogos!" },
                        { name: "Bob Marley - A Tribute", area: "CityWalk", tipo: "Table Service", preco: "$$", desc: "Culinária jamaicana com reggae ao vivo! Jerk chicken e drinks caribenhos.", badges: ["Jamaicano", "Ao Vivo"], rating: 4, dica: "Música ao vivo à noite!" },
                        { name: "Bubba Gump Shrimp Co.", area: "CityWalk", tipo: "Table Service", preco: "$$", desc: "Temático do filme Forrest Gump! Camarão de todas as formas possíveis.", badges: ["Temático", "Frutos do Mar"], rating: 4, dica: "Run Forrest Run!" },
                        { name: "Cowfish Sushi Burger Bar", area: "CityWalk", tipo: "Table Service", preco: "$$$", desc: "Fusão única: sushi + burgers! Criaram os 'Burgushi' - hambúrgueres com elementos de sushi.", badges: ["Fusão", "Único"], rating: 5, dica: "Tente um Burgushi!" },
                        { name: "Hard Rock Cafe", area: "CityWalk", tipo: "Table Service", preco: "$$", desc: "O maior Hard Rock do mundo! Memorabilia de rock e culinária americana clássica.", badges: ["Rock", "Clássico"], rating: 4, dica: "Loja com camisetas!" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-orange-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">📍 {rest.area}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-orange-500/10 text-sm"><span className="text-orange-700 dark:text-orange-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>

                  {/* Snacks Universal */}
                  <div className="mt-6">
                    <h6 className="font-bold mb-4">🍺 Snacks & Bebidas Imperdíveis</h6>
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                      {[
                        { name: 'Butterbeer', emoji: '🍺', desc: 'Cerveja amanteigada icônica!', preco: '~$9' },
                        { name: 'Frozen Butterbeer', emoji: '🧊', desc: 'Versão gelada cremosa', preco: '~$10' },
                        { name: 'Lard Lad Donuts', emoji: '🍩', desc: 'Donuts gigantes decorados', preco: '~$8' },
                        { name: "Flaming Moe's", emoji: '🥤', desc: 'Bebida borbulhante!', preco: '~$12' },
                      ].map((snack) => (
                        <div key={snack.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-indigo-500/30 text-center hover:scale-105 transition-transform">
                          <span className="text-3xl block mb-2">{snack.emoji}</span>
                          <p className="font-bold text-sm">{snack.name}</p>
                          <p className="text-xs text-muted-foreground">{snack.desc}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">{snack.preco}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* RESTAURANTES ORLANDO - FORA DOS PARQUES */}
          <div data-section="restaurantes-orlando" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="restaurantes-orlando" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30 flex-shrink-0">
                      <Utensils className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Restaurantes Orlando</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Opções fora dos parques</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <Tabs defaultValue="steakhouses" className="w-full">
                    <TabsList className="grid grid-cols-3 sm:flex sm:flex-wrap justify-start bg-muted/50 rounded-xl p-1 mb-6 h-auto gap-1">
                      <TabsTrigger value="steakhouses" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🥩 Steaks</TabsTrigger>
                      <TabsTrigger value="brasileiros" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🇧🇷 BR</TabsTrigger>
                      <TabsTrigger value="frutos-mar" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🦞 Seafood</TabsTrigger>
                      <TabsTrigger value="idrive" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🎡 I-Drive</TabsTrigger>
                      <TabsTrigger value="disney-springs" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">🏰 Disney</TabsTrigger>
                      <TabsTrigger value="cafes" className="rounded-lg text-[10px] sm:text-xs px-2 sm:px-3 py-2">☕ Café</TabsTrigger>
                    </TabsList>

                    <TabsContent value="steakhouses" className="space-y-4">
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-4">
                        <p className="text-sm">🥩 <strong>Dica:</strong> Reserve sempre! Steakhouses populares lotam, especialmente fins de semana.</p>
                      </div>
                      {[
                        { name: "Texas de Brazil", endereco: "5259 International Dr", tipo: "Rodízio", preco: "$$$$", desc: "Rodízio brasileiro premium! Picanha, cordeiro, linguiça tudo cortado na mesa. Buffet de saladas incrível.", badges: ["Rodízio", "Premium", "Favorito BR"], rating: 5, dica: "Pegue leve no buffet!", horario: "Dom-Qui 17h-21h30, Sex-Sáb 17h-22h" },
                        { name: "Ruth's Chris Steak House", endereco: "7501 W Sand Lake Rd", tipo: "Fine Dining", preco: "$$$$$", desc: "Carnes USDA Prime em prato aquecido a 260°C! Referência em qualidade.", badges: ["Premium", "USDA Prime"], rating: 5, dica: "Filet é sensacional!", horario: "16h-22h" },
                        { name: "STK Orlando", endereco: "1580 E Buena Vista Dr", tipo: "Steakhouse Modern", preco: "$$$$", desc: "Steakhouse trendy em Disney Springs! DJ à noite, ambiente moderno e carnes incríveis.", badges: ["Trendy", "Disney Springs"], rating: 5, dica: "Lil BRGs como entrada!", horario: "11h30-23h" },
                        { name: "The Capital Grille", endereco: "9101 International Dr", tipo: "Fine Dining", preco: "$$$$$", desc: "Elegante com dry-aged steaks e wine selection impressionante. Ótimo para ocasiões especiais.", badges: ["Elegante", "Dry-Aged"], rating: 5, dica: "Dry-Aged 22 oz Bone-In!", horario: "11h30-22h" },
                        { name: "Outback Steakhouse", endereco: "Várias locações", tipo: "Casual Dining", preco: "$$", desc: "Custo-benefício excelente! Bloomin' Onion icônica e porções generosas.", badges: ["Custo-Benefício", "Casual"], rating: 4, dica: "Bloomin' Onion de entrada!", horario: "11h-22h" },
                        { name: "LongHorn Steakhouse", endereco: "Várias locações", tipo: "Casual Dining", preco: "$$", desc: "Excelente qualidade por bom preço. Outlaw Ribeye é enorme!", badges: ["Qualidade", "Porções Grandes"], rating: 4, dica: "Outlaw Ribeye = 18 oz!", horario: "11h-22h" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-rose-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">📍 {rest.endereco}</p>
                          <p className="text-xs text-muted-foreground mb-2">🕐 {rest.horario}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-rose-500/10 text-sm"><span className="text-rose-700 dark:text-rose-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="brasileiros" className="space-y-4">
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-4">
                        <p className="text-sm">🇧🇷 <strong>Matando a saudade:</strong> Orlando tem excelentes opções de comida brasileira!</p>
                      </div>
                      {[
                        { name: "Fogo de Chão", endereco: "8282 International Dr", tipo: "Rodízio", preco: "$$$$", desc: "O melhor rodízio brasileiro de Orlando! Carnes nobres, buffet de saladas premium e atendimento impecável.", badges: ["Rodízio Premium", "Imperdível"], rating: 5, dica: "Picanha é a estrela!", horario: "11h30-22h" },
                        { name: "Texas de Brazil", endereco: "5259 International Dr", tipo: "Rodízio", preco: "$$$$", desc: "Outro rodízio excelente! Ótima variedade de carnes e buffet completo.", badges: ["Rodízio", "Tradicional"], rating: 5, dica: "Cordeiro é incrível!", horario: "17h-21h30" },
                        { name: "Café Mineiro", endereco: "5403 S Kirkman Rd", tipo: "Self-Service", preco: "$$", desc: "Comida caseira brasileira! Buffet por quilo com feijoada, estrogonofe e muito mais.", badges: ["Caseiro", "Econômico"], rating: 5, dica: "Feijoada aos sábados!", horario: "11h-21h" },
                        { name: "Giraffas", endereco: "5269 International Dr", tipo: "Fast Food", preco: "$", desc: "Fast food brasileiro! Pratos executivos, hambúrgueres e grelhados rapidinhos.", badges: ["Rápido", "Econômico"], rating: 4, dica: "Combo com picanha!", horario: "11h-22h" },
                        { name: "Camila's", endereco: "5458 International Dr", tipo: "Self-Service", preco: "$$", desc: "Buffet por quilo brasileiro completo! Comida caseira de qualidade, churrasco, feijoada e sobremesas.", badges: ["Buffet", "Caseiro", "Favorito BR"], rating: 5, dica: "Feijoada sensacional!", horario: "11h-22h" },
                        { name: "Adega Gaúcha", endereco: "8348 International Dr", tipo: "Rodízio", preco: "$$$", desc: "Rodízio gaúcho autêntico! Picanha, costela, cordeiro e mais de 15 cortes servidos na mesa.", badges: ["Rodízio", "Gaúcho", "Tradicional"], rating: 5, dica: "Costela derrete na boca!", horario: "17h-22h" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-green-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">📍 {rest.endereco}</p>
                          <p className="text-xs text-muted-foreground mb-2">🕐 {rest.horario}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-green-500/10 text-sm"><span className="text-green-700 dark:text-green-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="frutos-mar" className="space-y-4">
                      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
                        <p className="text-sm">🦞 <strong>Dica:</strong> Florida = frutos do mar frescos! Aproveite a proximidade do mar.</p>
                      </div>
                      {[
                        { name: "Red Lobster", endereco: "Várias locações", tipo: "Casual Dining", preco: "$$", desc: "Rede famosa de frutos do mar! Cheddar Bay Biscuits são viciantes. Ótimo custo-benefício.", badges: ["Clássico", "Família"], rating: 4, dica: "Ultimate Feast!", horario: "11h-22h" },
                        { name: "Bonefish Grill", endereco: "7830 W Sand Lake Rd", tipo: "Upscale Casual", preco: "$$$", desc: "Peixes grelhados com molhos especiais! Bang Bang Shrimp é imperdível.", badges: ["Premium", "Bang Bang"], rating: 5, dica: "Bang Bang Shrimp!", horario: "16h-22h" },
                        { name: "Eddie V's", endereco: "7488 W Sand Lake Rd", tipo: "Fine Dining", preco: "$$$$$", desc: "Experiência premium! Lagosta, caranguejo e ambiente sofisticado com jazz ao vivo.", badges: ["Sofisticado", "Jazz"], rating: 5, dica: "Jazz à noite!", horario: "16h-22h" },
                        { name: "The Boathouse", endereco: "Disney Springs", tipo: "Table Service", preco: "$$$$", desc: "Restaurante icônico em Disney Springs! Frutos do mar, steaks e passeios de barco vintage.", badges: ["Disney Springs", "Vista"], rating: 5, dica: "Passeio de amphicar!", horario: "11h-23h" },
                        { name: "Joe's Crab Shack", endereco: "8409 International Dr", tipo: "Casual", preco: "$$", desc: "Ambiente descontraído com baldes de caranguejo! Diversão garantida.", badges: ["Divertido", "Casual"], rating: 4, dica: "Steam Pot para dois!", horario: "11h-22h" },
                        { name: "Boston Lobster Feast", endereco: "8731 International Dr", tipo: "Buffet", preco: "$$$", desc: "Buffet all-you-can-eat de lagosta! Sim, lagosta à vontade.", badges: ["Buffet", "Lagosta"], rating: 4, dica: "Chegue com fome!", horario: "16h-22h" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-cyan-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">📍 {rest.endereco}</p>
                          <p className="text-xs text-muted-foreground mb-2">🕐 {rest.horario}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-cyan-500/10 text-sm"><span className="text-cyan-700 dark:text-cyan-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="idrive" className="space-y-4">
                      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4">
                        <p className="text-sm">🎡 <strong>I-Drive (International Drive):</strong> A avenida turística mais famosa de Orlando!</p>
                      </div>
                      {[
                        { name: "The Cheesecake Factory", endereco: "The Mall at Millenia", tipo: "American", preco: "$$$", desc: "Cardápio gigante com +250 itens! Porções enormes e 30+ sabores de cheesecake.", badges: ["Porções Grandes", "Cheesecake"], rating: 5, dica: "Divida os pratos!", horario: "11h-23h" },
                        { name: "Olive Garden", endereco: "Várias locações", tipo: "Italian", preco: "$$", desc: "Italiano casual com breadsticks infinitos! Tour of Italy é completo.", badges: ["Italiano", "Família"], rating: 4, dica: "Breadsticks à vontade!", horario: "11h-22h" },
                        { name: "TGI Friday's", endereco: "8126 International Dr", tipo: "American Bar", preco: "$$", desc: "Culinária americana com drinks! Jack Daniel's Ribs são famosas.", badges: ["Bar", "Ribs"], rating: 4, dica: "Happy Hour!", horario: "11h-24h" },
                        { name: "Bahama Breeze", endereco: "8849 International Dr", tipo: "Caribbean", preco: "$$", desc: "Culinária caribenha tropical! Drinks exóticos e clima de ilha.", badges: ["Tropical", "Drinks"], rating: 4, dica: "Painkiller cocktail!", horario: "11h-23h" },
                        { name: "Yard House", endereco: "8367 International Dr", tipo: "American Gastropub", preco: "$$", desc: "130+ cervejas artesanais on tap! Menu variado e ambiente moderno.", badges: ["Cervejas", "Gastropub"], rating: 5, dica: "Half-size portions!", horario: "11h-24h" },
                        { name: "Miller's Ale House", endereco: "5573 S Kirkman Rd", tipo: "Sports Bar", preco: "$$", desc: "Bar esportivo com zingers famosos! Ótimo para assistir jogos.", badges: ["Esportes", "Wings"], rating: 4, dica: "Zingers picantes!", horario: "11h-24h" },
                        { name: "Hash House A Go Go", endereco: "5350 International Dr", tipo: "American", preco: "$$", desc: "Porções ABSURDAMENTE grandes! Twisted Farm Food com pratos gigantes.", badges: ["Porções Épicas", "Brunch"], rating: 5, dica: "Divida SEMPRE!", horario: "8h-22h" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-purple-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">📍 {rest.endereco}</p>
                          <p className="text-xs text-muted-foreground mb-2">🕐 {rest.horario}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-purple-500/10 text-sm"><span className="text-purple-700 dark:text-purple-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="disney-springs" className="space-y-4">
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                        <p className="text-sm">🏰 <strong>Disney Springs:</strong> Entrada e estacionamento GRÁTIS! Ótimo para jantar após os parques.</p>
                      </div>
                      {[
                        { name: "Morimoto Asia", endereco: "Disney Springs", tipo: "Pan-Asian", preco: "$$$$", desc: "Do Iron Chef Masaharu Morimoto! Culinária asiática sofisticada em ambiente deslumbrante.", badges: ["Celebrity Chef", "Premium"], rating: 5, dica: "Peking Duck!", horario: "11h30-22h" },
                        { name: "The Boathouse", endereco: "Disney Springs", tipo: "Seafood/Steak", preco: "$$$$", desc: "Vista para o lago com barcos vintage Amphicars! Passeio de barco incluso.", badges: ["Vista", "Experiência"], rating: 5, dica: "Amphicar ride!", horario: "11h-23h" },
                        { name: "Wine Bar George", endereco: "Disney Springs", tipo: "Wine Bar", preco: "$$$", desc: "Master Sommelier George Miliotes! 140+ vinhos e menu mediterrâneo.", badges: ["Vinhos", "Elegante"], rating: 5, dica: "Wine flights!", horario: "11h-24h" },
                        { name: "Frontera Cocina", endereco: "Disney Springs", tipo: "Mexican", preco: "$$$", desc: "Do chef Rick Bayless! Mexicano autêntico premiado.", badges: ["Celebrity Chef", "Autêntico"], rating: 5, dica: "Tacos de carnitas!", horario: "11h-22h" },
                        { name: "Jaleo", endereco: "Disney Springs", tipo: "Spanish", preco: "$$$$", desc: "Tapas espanholas do José Andrés! Paella e jamón ibérico autênticos.", badges: ["Tapas", "Spanish"], rating: 5, dica: "Paella para dois!", horario: "11h30-22h" },
                        { name: "Raglan Road", endereco: "Disney Springs", tipo: "Irish Pub", preco: "$$", desc: "Pub irlandês autêntico com música e dança ao vivo! Fish & chips perfeito.", badges: ["Ao Vivo", "Autêntico"], rating: 5, dica: "Irish dancers!", horario: "11h-24h" },
                        { name: "Chicken Guy!", endereco: "Disney Springs", tipo: "Quick Service", preco: "$", desc: "Do Guy Fieri! Frango empanado com 22 molhos diferentes.", badges: ["Guy Fieri", "Casual"], rating: 4, dica: "Prove todos os molhos!", horario: "10h30-23h" },
                        { name: "Blaze Pizza", endereco: "Disney Springs", tipo: "Quick Service", preco: "$", desc: "Pizza artesanal build-your-own! Pronta em 3 minutos.", badges: ["Rápido", "Customizável"], rating: 4, dica: "Keto crosta!", horario: "11h-23h" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-amber-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">📍 {rest.endereco}</p>
                          <p className="text-xs text-muted-foreground mb-2">🕐 {rest.horario}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-amber-500/10 text-sm"><span className="text-amber-700 dark:text-amber-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="cafes" className="space-y-4">
                      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-4">
                        <p className="text-sm">☕ <strong>Cafés & Brunch:</strong> Ótimas opções para começar o dia ou uma pausa!</p>
                      </div>
                      {[
                        { name: "First Watch", endereco: "Várias locações", tipo: "Breakfast/Brunch", preco: "$$", desc: "Especializado em café da manhã! Panquecas, omeletes e bowls saudáveis.", badges: ["Brunch", "Saudável"], rating: 5, dica: "Million Dollar Bacon!", horario: "7h-14h30" },
                        { name: "IHOP", endereco: "Várias locações", tipo: "Breakfast", preco: "$", desc: "International House of Pancakes! Panquecas 24h e omeletes.", badges: ["24h", "Panquecas"], rating: 4, dica: "Endless pancakes!", horario: "24h" },
                        { name: "Denny's", endereco: "Várias locações", tipo: "Diner", preco: "$", desc: "Diner americano clássico! Café da manhã servido 24h.", badges: ["24h", "Econômico"], rating: 4, dica: "Grand Slam!", horario: "24h" },
                        { name: "Keke's Breakfast Cafe", endereco: "Várias locações", tipo: "Breakfast", preco: "$$", desc: "Local favorite! Waffles, French toast e pratos criativos.", badges: ["Local", "Waffles"], rating: 5, dica: "Fruity Pebble waffle!", horario: "7h-14h30" },
                        { name: "The Polite Pig", endereco: "Disney Springs", tipo: "BBQ Brunch", preco: "$$", desc: "BBQ moderno com brunch aos fins de semana! Bourbon drinks e carnes defumadas.", badges: ["BBQ", "Bourbon"], rating: 5, dica: "Bourbon cocktails!", horario: "11h-22h" },
                        { name: "Starbucks Reserve", endereco: "Disney Springs", tipo: "Coffee", preco: "$$", desc: "Starbucks premium com cafés raros e métodos especiais de preparo.", badges: ["Premium", "Reserve"], rating: 4, dica: "Nitro Cold Brew!", horario: "7h-23h" },
                      ].map((rest) => (
                        <div key={rest.name} className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/50 hover:border-orange-500/30 transition-all">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h6 className="font-bold text-lg">{rest.name}</h6>
                            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">{rest.tipo}</Badge>
                            <Badge variant="outline">{rest.preco}</Badge>
                            <div className="flex gap-0.5 ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rest.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted/30'}`} />)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">📍 {rest.endereco}</p>
                          <p className="text-xs text-muted-foreground mb-2">🕐 {rest.horario}</p>
                          <p className="text-muted-foreground text-sm mb-3">{rest.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-3">{rest.badges.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div>
                          <div className="p-3 rounded-lg bg-orange-500/10 text-sm"><span className="text-orange-700 dark:text-orange-400">💡 {rest.dica}</span></div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>

                  {/* Dicas Gerais Restaurantes */}
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30">
                      <h6 className="font-bold mb-3 text-emerald-700 flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Dicas de Ouro
                      </h6>
                      <ul className="space-y-2 text-sm">
                        <li>✓ Reserve pelo OpenTable ou Yelp</li>
                        <li>✓ Gorjeta: 18-20% é padrão</li>
                        <li>✓ Porções são GRANDES - considere dividir</li>
                        <li>✓ Happy Hour = drinks e appetizers baratos</li>
                        <li>✓ Kids Eat Free em vários restaurantes</li>
                      </ul>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/30">
                      <h6 className="font-bold mb-3 text-blue-700 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Preços Médios
                      </h6>
                      <ul className="space-y-2 text-sm">
                        <li>$ = até $15 por pessoa</li>
                        <li>$$ = $15-30 por pessoa</li>
                        <li>$$$ = $30-50 por pessoa</li>
                        <li>$$$$ = $50-80 por pessoa</li>
                        <li>$$$$$ = acima de $80 por pessoa</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* DICAS DISNEY */}
          <div data-section="parques-disney" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="parques-disney" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 flex-shrink-0">
                      <Star className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Dicas Disney</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Lightning Lane, Genie+, estratégias</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-6">
                    {/* Lightning Lane */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                      <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Lightning Lane
                      </h5>
                      <p className="text-white/90 text-sm mb-4">
                        Sistema pago para furar filas. Existem duas opções:
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                          <p className="font-semibold">Lightning Lane Multi Pass</p>
                          <p className="text-white/80 text-sm">Várias atrações por dia (~$15-30)</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                          <p className="font-semibold">Individual Lightning Lane</p>
                          <p className="text-white/80 text-sm">Atrações premium ($15-25 cada)</p>
                        </div>
                      </div>
                    </div>

                    {/* Dicas Gerais */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { icon: Clock, title: 'Chegue Cedo', desc: 'As primeiras horas têm menos filas', color: 'from-blue-500 to-cyan-500' },
                        { icon: Phone, title: 'Use o App', desc: 'My Disney Experience é essencial', color: 'from-purple-500 to-pink-500' },
                        { icon: Users, title: 'Rider Switch', desc: 'Revezamento para crianças pequenas', color: 'from-green-500 to-emerald-500' },
                        { icon: Accessibility, title: 'Single Rider', desc: 'Fila menor para quem vai sozinho', color: 'from-amber-500 to-orange-500' },
                      ].map((tip) => (
                        <div key={tip.title} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center flex-shrink-0`}>
                            <tip.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">{tip.title}</p>
                            <p className="text-sm text-muted-foreground">{tip.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* DICAS UNIVERSAL */}
          <div data-section="parques-universal" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="parques-universal" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl">Dicas dos Parques Universal</h3>
                      <p className="text-sm text-muted-foreground">Express Pass, Virtual Line, estratégias</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Express Pass */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Universal Express Pass
                      </h5>
                      <p className="text-white/90 text-sm mb-4">
                        Acesso prioritário às atrações. Preços variam de $80-250+ por pessoa dependendo do dia.
                      </p>
                      <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                        <p className="font-semibold">💡 Dica: Hotéis Premier Universal</p>
                        <p className="text-white/80 text-sm">Hóspedes ganham Express Pass ilimitado gratuito!</p>
                      </div>
                    </div>

                    {/* Dicas */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { icon: Phone, title: 'Virtual Line', desc: 'Agende horário pelo app para algumas atrações', color: 'from-indigo-500 to-blue-500' },
                        { icon: Accessibility, title: 'Single Rider', desc: 'Disponível em várias atrações', color: 'from-green-500 to-emerald-500' },
                        { icon: Ticket, title: 'Early Park Admission', desc: 'Entre 1h antes sendo hóspede', color: 'from-amber-500 to-orange-500' },
                        { icon: Navigation, title: 'Hogwarts Express', desc: 'Precisa de ingresso Park-to-Park', color: 'from-red-500 to-rose-500' },
                      ].map((tip) => (
                        <div key={tip.title} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center flex-shrink-0`}>
                            <tip.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">{tip.title}</p>
                            <p className="text-sm text-muted-foreground">{tip.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* TABELA DE MEDIDAS */}
          <div data-section="medidas" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="medidas" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center shadow-lg shadow-slate-500/30">
                      <Ruler className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl">Tabela de Medidas</h3>
                      <p className="text-sm text-muted-foreground">Conversão Brasil x EUA</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <Tabs defaultValue="clothes" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1 mb-6">
                      <TabsTrigger value="clothes" className="rounded-lg">👕 Roupas</TabsTrigger>
                      <TabsTrigger value="shoes" className="rounded-lg">👟 Calçados</TabsTrigger>
                    </TabsList>

                    <TabsContent value="clothes" className="space-y-6">
                      {[
                        { label: 'Geral', data: clothingSizes.general },
                        { label: 'Infantil', data: clothingSizes.kids },
                        { label: 'Feminino', data: clothingSizes.women },
                        { label: 'Masculino (Camisa)', data: clothingSizes.men },
                      ].map((table) => (
                        <div key={table.label} className="overflow-x-auto">
                          <h6 className="font-semibold mb-3">{table.label}</h6>
                          <div className="min-w-max">
                            <div className="flex gap-2 mb-2">
                              <div className="w-20 p-2 rounded-lg bg-blue-500/10 text-blue-700 font-medium text-center text-sm">🇧🇷 Brasil</div>
                              {table.data.brasil.map((size, i) => (
                                <div key={i} className="w-14 p-2 rounded-lg bg-muted/50 text-center text-sm font-medium">{size}</div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <div className="w-20 p-2 rounded-lg bg-red-500/10 text-red-700 font-medium text-center text-sm">🇺🇸 EUA</div>
                              {table.data.usa.map((size, i) => (
                                <div key={i} className="w-14 p-2 rounded-lg bg-muted/50 text-center text-sm font-medium">{size}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="shoes" className="space-y-6">
                      {[
                        { label: 'Feminino', data: shoeSizes.women },
                        { label: 'Masculino', data: shoeSizes.men },
                        { label: 'Infantil', data: shoeSizes.kids },
                      ].map((table) => (
                        <div key={table.label} className="overflow-x-auto">
                          <h6 className="font-semibold mb-3">{table.label}</h6>
                          <div className="min-w-max">
                            <div className="flex gap-2 mb-2">
                              <div className="w-20 p-2 rounded-lg bg-blue-500/10 text-blue-700 font-medium text-center text-sm">🇧🇷 Brasil</div>
                              {table.data.brasil.map((size, i) => (
                                <div key={i} className="w-14 p-2 rounded-lg bg-muted/50 text-center text-sm font-medium">{size}</div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <div className="w-20 p-2 rounded-lg bg-red-500/10 text-red-700 font-medium text-center text-sm">🇺🇸 EUA</div>
                              {table.data.usa.map((size, i) => (
                                <div key={i} className="w-14 p-2 rounded-lg bg-muted/50 text-center text-sm font-medium">{size}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* EMERGÊNCIAS */}
          <div data-section="emergencias" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="emergencias" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl">Emergências e Contatos</h3>
                      <p className="text-sm text-muted-foreground">Números úteis e hospitais</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Números Principais */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white text-center">
                        <Phone className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-bold text-2xl">911</p>
                        <p className="text-white/80 text-sm">Emergências</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-center">
                        <Globe className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-bold text-lg">+1 305 285-6200</p>
                        <p className="text-white/80 text-sm">Consulado Brasileiro</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white text-center">
                        <Shield className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-bold text-lg">Seguro Viagem</p>
                        <p className="text-white/80 text-sm">Confira carteirinha</p>
                      </div>
                    </div>

                    {/* Hospitais */}
                    <div>
                      <h5 className="font-semibold mb-4">🏥 Hospitais Próximos</h5>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          { name: 'AdventHealth Celebration', address: '400 Celebration Pl', phone: '+1 407-303-4000' },
                          { name: 'Dr. Phillips Hospital', address: '9400 Turkey Lake Rd', phone: '+1 407-351-8500' },
                        ].map((hospital) => (
                          <div key={hospital.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                            <p className="font-semibold">{hospital.name}</p>
                            <p className="text-sm text-muted-foreground">{hospital.address}</p>
                            <p className="text-sm text-blue-600">{hospital.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Farmácias 24h */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                      <h5 className="font-semibold mb-3 flex items-center gap-2 text-emerald-700">
                        <Pill className="w-5 h-5" />
                        Farmácias 24 horas
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        <strong>Walgreens</strong> e <strong>CVS</strong> possuem diversas unidades 24h em Orlando. Use o Google Maps para encontrar a mais próxima.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TravelGuide;
