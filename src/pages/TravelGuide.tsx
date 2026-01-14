import { useState } from 'react';
import { Book, Car, Plane, ShoppingBag, MapPin, Utensils, Backpack, FileText, CreditCard, Ruler, Store, Pill, Tag, Crown, Sparkles, AlertTriangle, Info, CheckCircle2, ChevronDown, Star, Clock, DollarSign, Heart, Users, Camera, Zap, Shield, Globe, Coffee, IceCream, Beer, Pizza, Flame, Fish, Salad, Cake, Ticket, Map, Phone, Wifi, Baby, Accessibility, Sun, Umbrella, Thermometer, Calendar, Check, X, ChevronRight, ExternalLink, Navigation, Compass } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

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

// Checklist items
const checklistItems = {
  documents: [
    { id: 'passport', label: 'Passaporte válido', required: true },
    { id: 'visa', label: 'Visto americano válido', required: true },
    { id: 'tickets', label: 'Ingressos dos parques', required: true },
    { id: 'hotel', label: 'Comprovante de hotel', required: true },
    { id: 'insurance', label: 'Seguro viagem', required: true },
    { id: 'car', label: 'Reserva de carro (se aplicável)', required: false },
    { id: 'cnh', label: 'CNH válida', required: false },
    { id: 'credit_card', label: 'Cartão de crédito internacional', required: true },
  ],
  luggage: [
    { id: 'sunscreen', label: 'Protetor solar', required: true },
    { id: 'hat', label: 'Boné ou chapéu', required: false },
    { id: 'sunglasses', label: 'Óculos de sol', required: false },
    { id: 'rain_coat', label: 'Capa de chuva', required: true },
    { id: 'portable_charger', label: 'Carregador portátil', required: true },
    { id: 'comfortable_shoes', label: 'Sapatos confortáveis', required: true },
    { id: 'jacket', label: 'Casaco leve', required: true },
    { id: 'medicine', label: 'Remédios básicos', required: false },
    { id: 'band_aids', label: 'Band-aids', required: false },
    { id: 'pen', label: 'Caneta para autógrafos', required: false },
  ],
  apps: [
    { id: 'mde', label: 'My Disney Experience instalado', required: true },
    { id: 'universal', label: 'Universal Orlando Resort app', required: true },
    { id: 'uber', label: 'Uber instalado', required: false },
    { id: 'google_maps', label: 'Google Maps offline', required: true },
    { id: 'translator', label: 'App de tradução', required: false },
  ],
};

// Navigation sections
const navSections = [
  { id: 'checklist', label: 'Checklist', icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
  { id: 'locomocao', label: 'Locomoção', icon: Car, color: 'from-blue-500 to-cyan-500' },
  { id: 'aeroporto', label: 'Aeroporto', icon: Plane, color: 'from-violet-500 to-purple-500' },
  { id: 'mochila', label: 'Mochila', icon: Backpack, color: 'from-green-500 to-emerald-500' },
  { id: 'compras', label: 'Compras', icon: ShoppingBag, color: 'from-pink-500 to-rose-500' },
  { id: 'restaurantes-disney', label: 'Disney', icon: Crown, color: 'from-amber-500 to-orange-500' },
  { id: 'restaurantes-universal', label: 'Universal', icon: Globe, color: 'from-indigo-500 to-blue-500' },
  { id: 'parques-disney', label: 'Dicas Disney', icon: Star, color: 'from-yellow-500 to-amber-500' },
  { id: 'parques-universal', label: 'Dicas Universal', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
  { id: 'medidas', label: 'Medidas', icon: Ruler, color: 'from-slate-500 to-gray-500' },
  { id: 'emergencias', label: 'Emergências', icon: Shield, color: 'from-red-500 to-rose-500' },
];

const TravelGuide = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getProgress = (category: keyof typeof checklistItems) => {
    const items = checklistItems[category];
    const checked = items.filter(item => checkedItems[item.id]).length;
    return (checked / items.length) * 100;
  };

  const totalProgress = () => {
    const allItems = [...checklistItems.documents, ...checklistItems.luggage, ...checklistItems.apps];
    const checked = allItems.filter(item => checkedItems[item.id]).length;
    return Math.round((checked / allItems.length) * 100);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 pb-12">
        {/* Modern Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float">
                <Book className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                  Guia Completo de Viagem
                </h1>
                <p className="text-white/80 text-lg">Tudo para sua aventura em Orlando ✨</p>
              </div>
            </div>
            
            {/* Progress Circle */}
            <div className="flex items-center gap-6 mt-6">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="40" cy="40" r="36" 
                    stroke="white" 
                    strokeWidth="8" 
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${totalProgress() * 2.26} 226`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{totalProgress()}%</span>
                </div>
              </div>
              <div className="text-white/90">
                <p className="font-medium">Sua Preparação</p>
                <p className="text-sm text-white/70">Continue marcando os itens do checklist</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation - Modern Pills */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Compass className="w-4 h-4" />
            <span className="text-sm font-medium">Navegação Rápida</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r ${section.color} text-white text-sm font-medium shadow-lg shadow-${section.color.split('-')[1]}-500/20 hover:scale-105 hover:shadow-xl transition-all duration-300`}
              >
                <section.icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress Cards - Glassmorphism */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { key: 'documents' as const, label: 'Documentos', icon: FileText, color: 'from-blue-500 to-indigo-500' },
            { key: 'luggage' as const, label: 'Mala', icon: Backpack, color: 'from-green-500 to-emerald-500' },
            { key: 'apps' as const, label: 'Apps', icon: Phone, color: 'from-purple-500 to-pink-500' },
          ].map((item) => (
            <Card key={item.key} className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 backdrop-blur-sm shadow-xl">
              <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-5`} />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">{Math.round(getProgress(item.key))}%</span>
                </div>
                <p className="font-medium text-lg mb-2">{item.label}</p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${item.color} transition-all duration-500 rounded-full`}
                    style={{ width: `${getProgress(item.key)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content - Modern Accordion */}
        <div className="space-y-4">
          {/* CHECKLIST INTERATIVO */}
          <div data-section="checklist" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="checklist" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl">Checklist Interativo</h3>
                      <p className="text-sm text-muted-foreground">Marque os itens conforme for preparando</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <Tabs defaultValue="documents" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-xl p-1 mb-6">
                      <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">📄 Documentos</TabsTrigger>
                      <TabsTrigger value="luggage" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">🧳 Mala</TabsTrigger>
                      <TabsTrigger value="apps" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">📱 Apps</TabsTrigger>
                    </TabsList>
                    
                    {(['documents', 'luggage', 'apps'] as const).map((category) => (
                      <TabsContent key={category} value={category} className="mt-0 space-y-2">
                        {checklistItems[category].map((item, index) => (
                          <div 
                            key={item.id} 
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
                              checkedItems[item.id] 
                                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 dark:from-emerald-900/20 dark:to-teal-900/20' 
                                : 'bg-muted/20 border-transparent hover:border-muted-foreground/20'
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => toggleItem(item.id)}
                          >
                            <Checkbox 
                              id={item.id} 
                              checked={checkedItems[item.id] || false}
                              onCheckedChange={() => toggleItem(item.id)}
                              className="w-6 h-6 rounded-lg border-2"
                            />
                            <label 
                              htmlFor={item.id} 
                              className={`flex-1 font-medium cursor-pointer transition-all ${checkedItems[item.id] ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {item.label}
                            </label>
                            {item.required && (
                              <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-sm">
                                Obrigatório
                              </Badge>
                            )}
                            {checkedItems[item.id] && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </TabsContent>
                    ))}
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* LOCOMOÇÃO */}
          <div data-section="locomocao" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="locomocao" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Car className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl">Como se Locomover</h3>
                      <p className="text-sm text-muted-foreground">Aluguel de carro, Uber, táxi e dicas</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
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
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <Plane className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl">Aeroporto e Imigração</h3>
                      <p className="text-sm text-muted-foreground">Check-in, imigração, duty free e dicas</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
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
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <Backpack className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl">O que Levar para o Parque</h3>
                      <p className="text-sm text-muted-foreground">Snacks, itens essenciais e documentos</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
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

          {/* COMPRAS */}
          <div data-section="compras" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="compras" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                      <ShoppingBag className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl">Guia de Compras</h3>
                      <p className="text-sm text-muted-foreground">Outlets, malls, supermercados e dicas</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Outlets */}
                    <div>
                      <h5 className="font-semibold text-lg mb-4">🏪 Premium Outlets</h5>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                          <h6 className="font-bold text-lg mb-2">International Drive</h6>
                          <p className="text-white/80 text-sm mb-3">Maior variedade de lojas premium</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-white/20 text-white border-0 text-xs">Nike</Badge>
                            <Badge className="bg-white/20 text-white border-0 text-xs">Coach</Badge>
                            <Badge className="bg-white/20 text-white border-0 text-xs">Michael Kors</Badge>
                          </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 text-white">
                          <h6 className="font-bold text-lg mb-2">Vineland Ave</h6>
                          <p className="text-white/80 text-sm mb-3">Próximo aos parques Disney</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-white/20 text-white border-0 text-xs">Kate Spade</Badge>
                            <Badge className="bg-white/20 text-white border-0 text-xs">Tommy</Badge>
                            <Badge className="bg-white/20 text-white border-0 text-xs">Calvin Klein</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lojas por Categoria */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                        <h6 className="font-semibold mb-2">👕 Roupas</h6>
                        <p className="text-sm text-muted-foreground">Ross, TJ Maxx, Old Navy, Gap, H&M</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                        <h6 className="font-semibold mb-2">📱 Eletrônicos</h6>
                        <p className="text-sm text-muted-foreground">Best Buy, Apple Store, Target</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                        <h6 className="font-semibold mb-2">🛒 Supermercados</h6>
                        <p className="text-sm text-muted-foreground">Walmart, Target, Publix</p>
                      </div>
                    </div>

                    {/* Cota */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <h6 className="font-semibold mb-2 text-amber-700">💰 Cota de Compras</h6>
                      <p className="text-sm text-muted-foreground">
                        A cota de isenção para entrar no Brasil é de <strong>US$ 1.000</strong> por pessoa para compras em lojas + <strong>US$ 1.000</strong> no Duty Free.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* RESTAURANTES DISNEY */}
          <div data-section="restaurantes-disney" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="restaurantes-disney" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl">Restaurantes Disney</h3>
                      <p className="text-sm text-muted-foreground">Os melhores restaurantes dos parques Disney</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <Tabs defaultValue="magic-kingdom" className="w-full">
                    <TabsList className="flex flex-wrap justify-start bg-muted/50 rounded-xl p-1 mb-6 h-auto gap-1">
                      <TabsTrigger value="magic-kingdom" className="rounded-lg text-xs px-3">Magic Kingdom</TabsTrigger>
                      <TabsTrigger value="epcot" className="rounded-lg text-xs px-3">EPCOT</TabsTrigger>
                      <TabsTrigger value="hollywood" className="rounded-lg text-xs px-3">Hollywood Studios</TabsTrigger>
                      <TabsTrigger value="animal" className="rounded-lg text-xs px-3">Animal Kingdom</TabsTrigger>
                    </TabsList>

                    <TabsContent value="magic-kingdom" className="space-y-4">
                      {[
                        { name: "Be Our Guest", desc: "Jantar no castelo da Bela e a Fera", badges: ["Premium", "Reserva 60 dias"], icon: Crown },
                        { name: "Cinderella's Royal Table", desc: "Café com princesas no castelo", badges: ["Character Dining", "$$$$"], icon: Star },
                        { name: "Pecos Bill", desc: "Tex-Mex casual, bom preço", badges: ["Fast Food", "Família"], icon: Pizza },
                      ].map((rest) => (
                        <div key={rest.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <rest.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-semibold">{rest.name}</h6>
                            <p className="text-sm text-muted-foreground mb-2">{rest.desc}</p>
                            <div className="flex flex-wrap gap-1">
                              {rest.badges.map((badge) => (
                                <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="epcot" className="space-y-4">
                      {[
                        { name: "Le Cellier", desc: "Steakhouse canadense premiado", badges: ["Premium", "Reserva 60 dias"], icon: Flame },
                        { name: "Teppan Edo", desc: "Hibachi japonês com show", badges: ["Experiência", "Família"], icon: Utensils },
                        { name: "Via Napoli", desc: "Pizzaria italiana autêntica", badges: ["Casual", "$$"], icon: Pizza },
                        { name: "Akershus Royal", desc: "Buffet norueguês com princesas", badges: ["Character Dining"], icon: Star },
                      ].map((rest) => (
                        <div key={rest.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <rest.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-semibold">{rest.name}</h6>
                            <p className="text-sm text-muted-foreground mb-2">{rest.desc}</p>
                            <div className="flex flex-wrap gap-1">
                              {rest.badges.map((badge) => (
                                <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="hollywood" className="space-y-4">
                      {[
                        { name: "50's Prime Time Cafe", desc: "Comida caseira dos anos 50", badges: ["Temático", "Divertido"], icon: Coffee },
                        { name: "Sci-Fi Dine-In Theater", desc: "Jantar em carros vintage", badges: ["Único", "Star Wars"], icon: Star },
                        { name: "Oga's Cantina", desc: "Bar temático de Star Wars", badges: ["Star Wars", "Drinks"], icon: Beer },
                      ].map((rest) => (
                        <div key={rest.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                            <rest.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-semibold">{rest.name}</h6>
                            <p className="text-sm text-muted-foreground mb-2">{rest.desc}</p>
                            <div className="flex flex-wrap gap-1">
                              {rest.badges.map((badge) => (
                                <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="animal" className="space-y-4">
                      {[
                        { name: "Tusker House", desc: "Buffet africano com personagens", badges: ["Character Dining", "Buffet"], icon: Users },
                        { name: "Yak & Yeti", desc: "Culinária asiática variada", badges: ["Casual", "Família"], icon: Fish },
                        { name: "Satu'li Canteen", desc: "Bowls saudáveis em Pandora", badges: ["Quick Service", "Saudável"], icon: Salad },
                      ].map((rest) => (
                        <div key={rest.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                            <rest.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-semibold">{rest.name}</h6>
                            <p className="text-sm text-muted-foreground mb-2">{rest.desc}</p>
                            <div className="flex flex-wrap gap-1">
                              {rest.badges.map((badge) => (
                                <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>

                  {/* Dica de Reserva */}
                  <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <h6 className="font-semibold mb-2 text-amber-700 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Dica de Reservas
                    </h6>
                    <p className="text-sm text-muted-foreground">
                      Restaurantes premium abrem reservas com <strong>60 dias de antecedência</strong> às 6h (horário de Orlando). Use o My Disney Experience para reservar!
                    </p>
                  </div>

                  {/* Snacks Clássicos */}
                  <div className="mt-6">
                    <h6 className="font-semibold mb-4">🍦 Snacks Clássicos Disney</h6>
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                      {[
                        { name: 'Dole Whip', emoji: '🍍', desc: 'Sorvete de abacaxi' },
                        { name: 'Turkey Leg', emoji: '🍗', desc: 'Coxa de peru' },
                        { name: 'Churros', emoji: '🥖', desc: 'Tradicional Disney' },
                        { name: 'Mickey Pretzel', emoji: '🥨', desc: 'Pretzel do Mickey' },
                      ].map((snack) => (
                        <div key={snack.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 text-center hover:scale-105 transition-transform">
                          <span className="text-3xl block mb-2">{snack.emoji}</span>
                          <p className="font-medium text-sm">{snack.name}</p>
                          <p className="text-xs text-muted-foreground">{snack.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* RESTAURANTES UNIVERSAL */}
          <div data-section="restaurantes-universal" className="group">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="restaurantes-universal" className="border-0 rounded-2xl bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Globe className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl">Restaurantes Universal</h3>
                      <p className="text-sm text-muted-foreground">Gastronomia nos parques Universal</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <Tabs defaultValue="universal-studios" className="w-full">
                    <TabsList className="flex flex-wrap justify-start bg-muted/50 rounded-xl p-1 mb-6 h-auto gap-1">
                      <TabsTrigger value="universal-studios" className="rounded-lg text-xs px-3">Universal Studios</TabsTrigger>
                      <TabsTrigger value="islands" className="rounded-lg text-xs px-3">Islands of Adventure</TabsTrigger>
                      <TabsTrigger value="epic" className="rounded-lg text-xs px-3">Epic Universe</TabsTrigger>
                    </TabsList>

                    <TabsContent value="universal-studios" className="space-y-4">
                      {[
                        { name: "Leaky Cauldron", desc: "Pub britânico no Beco Diagonal", badges: ["Harry Potter", "Temático"], icon: Beer },
                        { name: "Finnegan's Bar", desc: "Pub irlandês com música ao vivo", badges: ["Bar", "Entretenimento"], icon: Beer },
                        { name: "Lombard's Seafood", desc: "Frutos do mar em São Francisco", badges: ["Premium", "Vista"], icon: Fish },
                      ].map((rest) => (
                        <div key={rest.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <rest.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-semibold">{rest.name}</h6>
                            <p className="text-sm text-muted-foreground mb-2">{rest.desc}</p>
                            <div className="flex flex-wrap gap-1">
                              {rest.badges.map((badge) => (
                                <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="islands" className="space-y-4">
                      {[
                        { name: "Three Broomsticks", desc: "Pub em Hogsmeade", badges: ["Harry Potter", "Família"], icon: Beer },
                        { name: "Mythos Restaurant", desc: "Premiado como melhor do parque", badges: ["Premium", "Mediterrâneo"], icon: Star },
                        { name: "Confisco Grille", desc: "Culinária internacional variada", badges: ["Casual", "Variedade"], icon: Utensils },
                      ].map((rest) => (
                        <div key={rest.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <rest.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-semibold">{rest.name}</h6>
                            <p className="text-sm text-muted-foreground mb-2">{rest.desc}</p>
                            <div className="flex flex-wrap gap-1">
                              {rest.badges.map((badge) => (
                                <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="epic" className="space-y-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-4">
                        <h6 className="font-bold text-lg mb-2">🎉 Epic Universe - NOVO 2025!</h6>
                        <p className="text-white/80 text-sm">O mais novo parque da Universal com áreas temáticas inéditas!</p>
                      </div>
                      {[
                        { name: "Super Nintendo World", desc: "Restaurante temático do Mario", badges: ["Nintendo", "Novo"], icon: Star },
                        { name: "How to Train Your Dragon", desc: "Área de Como Treinar seu Dragão", badges: ["DreamWorks", "Família"], icon: Flame },
                        { name: "Dark Universe", desc: "Monstros clássicos da Universal", badges: ["Terror", "Temático"], icon: Sparkles },
                      ].map((rest) => (
                        <div key={rest.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <rest.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-semibold">{rest.name}</h6>
                            <p className="text-sm text-muted-foreground mb-2">{rest.desc}</p>
                            <div className="flex flex-wrap gap-1">
                              {rest.badges.map((badge) => (
                                <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>

                  {/* Snacks Universal */}
                  <div className="mt-6">
                    <h6 className="font-semibold mb-4">🍺 Bebidas e Snacks Imperdíveis</h6>
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                      {[
                        { name: 'Butterbeer', emoji: '🍺', desc: 'Cerveja amanteigada' },
                        { name: 'Lard Lad Donuts', emoji: '🍩', desc: 'Donuts gigantes' },
                        { name: 'Flaming Moe\'s', emoji: '🥤', desc: 'Bebida dos Simpsons' },
                        { name: 'Frozen Butterbeer', emoji: '🧊', desc: 'Versão gelada' },
                      ].map((snack) => (
                        <div key={snack.name} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 text-center hover:scale-105 transition-transform">
                          <span className="text-3xl block mb-2">{snack.emoji}</span>
                          <p className="font-medium text-sm">{snack.name}</p>
                          <p className="text-xs text-muted-foreground">{snack.desc}</p>
                        </div>
                      ))}
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
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl">Dicas dos Parques Disney</h3>
                      <p className="text-sm text-muted-foreground">Lightning Lane, Genie+, estratégias</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
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
