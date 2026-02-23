import { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
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

import { UsefulAddresses } from '@/components/guide/UsefulAddresses';

// Navigation sections
const navSections = [
  { id: 'locomocao', label: 'Locomoção', icon: Car, color: 'from-blue-500 to-cyan-500' },
  { id: 'aeroporto', label: 'Aeroporto', icon: Plane, color: 'from-violet-500 to-purple-500' },
  { id: 'mochila', label: 'Mochila', icon: Backpack, color: 'from-green-500 to-emerald-500' },
  { id: 'compras', label: 'Compras', icon: ShoppingBag, color: 'from-pink-500 to-rose-500' },
  { id: 'parques-disney', label: 'Disney', icon: Star, color: 'from-yellow-500 to-amber-500' },
  { id: 'parques-universal', label: 'Universal', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
  { id: 'parques-seaworld', label: 'SeaWorld', icon: Fish, color: 'from-blue-600 to-cyan-500' },
  { id: 'parques-busch', label: 'Busch', icon: Flame, color: 'from-orange-600 to-red-500' },
  { id: 'parques-legoland', label: 'LEGO', icon: Globe, color: 'from-yellow-500 to-red-500' },
  { id: 'medidas', label: 'Medidas', icon: Ruler, color: 'from-slate-500 to-gray-500' },
  { id: 'enderecos', label: 'Endereços', icon: MapPin, color: 'from-teal-500 to-emerald-500' },
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
      <SEO title="Guia de Viagem" description="Tudo para sua aventura em Orlando: locomoção, aeroporto, compras, parques e dicas." />
      <div className="space-y-6 sm:space-y-8 pb-12 overflow-y-auto">
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

          {/* DICAS UNIVERSAL */}
          <div data-section="parques-universal" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="parques-universal" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                      <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Dicas dos Parques Universal</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Express Pass, estratégias</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
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

          {/* DICAS SEAWORLD & AQUATICA */}
          <div data-section="parques-seaworld" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="parques-seaworld" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                      <Fish className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Dicas SeaWorld & Aquatica</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Shows, animais e parque aquático</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-6">
                    {/* Quick Queue */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                      <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Quick Queue (Fura-Fila)
                      </h5>
                      <p className="text-white/90 text-sm mb-4">
                        Acesso prioritário às atrações. Preços variam de $30-80+ por pessoa dependendo do dia. Inclui Aquatica no combo!
                      </p>
                      <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                        <p className="font-semibold">💡 Dica: Combo SeaWorld + Aquatica</p>
                        <p className="text-white/80 text-sm">Compre o ingresso combo e economize até 30%!</p>
                      </div>
                    </div>

                    {/* Dicas SeaWorld */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { icon: Clock, title: 'Shows com Horário', desc: 'Chegue 15min antes dos shows de golfinhos e orcas', color: 'from-blue-500 to-cyan-500' },
                        { icon: Camera, title: 'All Day Dining', desc: 'Plano de refeições ilimitadas - vale a pena!', color: 'from-green-500 to-emerald-500' },
                        { icon: Fish, title: 'Manta & Kraken', desc: 'Montanhas-russas TOP - vá cedo!', color: 'from-purple-500 to-pink-500' },
                        { icon: Sun, title: 'Aquatica', desc: 'Leve roupa de banho e toalha própria', color: 'from-amber-500 to-orange-500' },
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

          {/* DICAS BUSCH GARDENS */}
          <div data-section="parques-busch" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="parques-busch" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-600 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
                      <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Dicas Busch Gardens Tampa</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Montanhas-russas radicais e safári</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-6">
                    {/* Quick Queue */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-600 to-red-500 text-white">
                      <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Quick Queue Unlimited
                      </h5>
                      <p className="text-white/90 text-sm mb-4">
                        Acesso ilimitado às principais atrações. Preços variam de $50-100+ por pessoa. Essencial em dias cheios!
                      </p>
                      <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                        <p className="font-semibold">📍 Fica em Tampa - 1h de Orlando</p>
                        <p className="text-white/80 text-sm">Reserve o dia todo, vale a viagem!</p>
                      </div>
                    </div>

                    {/* Dicas Busch */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { icon: Flame, title: 'Iron Gwazi', desc: 'Melhor montanha-russa da Flórida!', color: 'from-red-500 to-orange-500' },
                        { icon: Heart, title: 'Serengeti Safari', desc: 'Tour com animais - reserve com antecedência', color: 'from-green-500 to-emerald-500' },
                        { icon: Users, title: 'Menos Lotado', desc: 'Geralmente mais vazio que outros parques', color: 'from-blue-500 to-cyan-500' },
                        { icon: Clock, title: 'Chegue Cedo', desc: 'Comece pelas montanhas-russas do fundo', color: 'from-purple-500 to-pink-500' },
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

          {/* DICAS LEGOLAND */}
          <div data-section="parques-legoland" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="parques-legoland" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 flex-shrink-0">
                      <Globe className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Dicas LEGOLAND Florida</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Ideal para crianças de 2-12 anos</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <div className="space-y-6">
                    {/* Info Principal */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-500 to-red-500 text-white">
                      <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Baby className="w-5 h-5" />
                        Parque para Crianças
                      </h5>
                      <p className="text-white/90 text-sm mb-4">
                        Focado em crianças de 2 a 12 anos. Adultos sem crianças podem achar limitado. Inclui parque aquático!
                      </p>
                      <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                        <p className="font-semibold">📍 Fica em Winter Haven - 45min de Orlando</p>
                        <p className="text-white/80 text-sm">Reserve 1 dia inteiro para aproveitar bem</p>
                      </div>
                    </div>

                    {/* Dicas LEGO */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { icon: Globe, title: 'Miniland USA', desc: 'Réplicas de cidades em LEGO - imperdível!', color: 'from-yellow-500 to-amber-500' },
                        { icon: Sun, title: 'Parque Aquático', desc: 'Incluso no combo - leve roupa de banho', color: 'from-blue-500 to-cyan-500' },
                        { icon: Star, title: 'Build & Test', desc: 'Área para construir carros LEGO', color: 'from-red-500 to-orange-500' },
                        { icon: Ticket, title: 'Desconto LEGO', desc: 'Cupons no site oficial - sempre confira!', color: 'from-green-500 to-emerald-500' },
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
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center shadow-lg shadow-slate-500/30 flex-shrink-0">
                      <Ruler className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Tabela de Medidas</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Conversão Brasil x EUA</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
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

          {/* ENDEREÇOS ÚTEIS */}
          <div data-section="enderecos" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="enderecos" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30 flex-shrink-0">
                      <MapPin className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Endereços Úteis</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Parques, hospitais, aeroportos e compras</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
                  <UsefulAddresses />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* EMERGÊNCIAS */}
          <div data-section="emergencias" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="emergencias" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0">
                      <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-display font-bold text-base sm:text-xl">Emergências e Contatos</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Números úteis e hospitais</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 pb-6">
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
