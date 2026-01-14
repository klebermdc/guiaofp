import { useState } from 'react';
import { Book, Car, Plane, ShoppingBag, MapPin, Utensils, Backpack, FileText, CreditCard, Ruler, Store, Pill, Tag, Crown, Sparkles, AlertTriangle, Info, CheckCircle2, ChevronDown, Star, Clock, DollarSign, Heart, Users, Camera, Zap, Shield, Globe, Coffee, IceCream, Beer, Pizza, Flame, Fish, Salad, Cake, Ticket, Map, Phone, Wifi, Baby, Accessibility, Sun, Umbrella, Thermometer, Calendar, Check, X, ChevronRight, ExternalLink } from 'lucide-react';
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

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 gradient-gold rounded-xl flex items-center justify-center">
            <Book className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">📚 Guia Completo de Viagem</h1>
            <p className="text-muted-foreground">Tudo que você precisa saber para sua viagem a Orlando</p>
          </div>
        </div>

        {/* Quick Navigation */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Map className="w-4 h-4" />
              Navegação Rápida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => scrollToSection('locomocao')}>🚗 Locomoção</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => scrollToSection('aeroporto')}>✈️ Aeroporto</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => scrollToSection('mochila')}>🎒 Mochila</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => scrollToSection('compras')}>🛒 Compras</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => scrollToSection('restaurantes-disney')}>🏰 Restaurantes Disney</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => scrollToSection('restaurantes-universal')}>🎢 Restaurantes Universal</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => scrollToSection('parques-disney')}>⭐ Dicas Disney</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => scrollToSection('parques-universal')}>🌍 Dicas Universal</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => scrollToSection('checklist')}>✅ Checklist</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => scrollToSection('medidas')}>📏 Medidas</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => scrollToSection('emergencias')}>🆘 Emergências</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Seu Progresso de Preparação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Documentos</span>
                  <span>{Math.round(getProgress('documents'))}%</span>
                </div>
                <Progress value={getProgress('documents')} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Mala</span>
                  <span>{Math.round(getProgress('luggage'))}%</span>
                </div>
                <Progress value={getProgress('luggage')} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Apps</span>
                  <span>{Math.round(getProgress('apps'))}%</span>
                </div>
                <Progress value={getProgress('apps')} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Accordion type="multiple" className="space-y-4">
          {/* CHECKLIST INTERATIVO */}
          <AccordionItem value="checklist" className="border rounded-xl bg-card shadow-sm" data-section="checklist">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">✅ Checklist Interativo</h3>
                  <p className="text-sm text-muted-foreground">Marque os itens conforme for preparando</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <Tabs defaultValue="documents" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="documents">📄 Documentos</TabsTrigger>
                  <TabsTrigger value="luggage">🧳 Mala</TabsTrigger>
                  <TabsTrigger value="apps">📱 Apps</TabsTrigger>
                </TabsList>
                
                <TabsContent value="documents" className="mt-4 space-y-3">
                  {checklistItems.documents.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        checkedItems[item.id] ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/30'
                      }`}
                    >
                      <Checkbox 
                        id={item.id} 
                        checked={checkedItems[item.id] || false}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <label 
                        htmlFor={item.id} 
                        className={`flex-1 text-sm cursor-pointer ${checkedItems[item.id] ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.label}
                      </label>
                      {item.required && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="luggage" className="mt-4 space-y-3">
                  {checklistItems.luggage.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        checkedItems[item.id] ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/30'
                      }`}
                    >
                      <Checkbox 
                        id={item.id} 
                        checked={checkedItems[item.id] || false}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <label 
                        htmlFor={item.id} 
                        className={`flex-1 text-sm cursor-pointer ${checkedItems[item.id] ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.label}
                      </label>
                      {item.required && <Badge variant="destructive" className="text-xs">Essencial</Badge>}
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="apps" className="mt-4 space-y-3">
                  {checklistItems.apps.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        checkedItems[item.id] ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/30'
                      }`}
                    >
                      <Checkbox 
                        id={item.id} 
                        checked={checkedItems[item.id] || false}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <label 
                        htmlFor={item.id} 
                        className={`flex-1 text-sm cursor-pointer ${checkedItems[item.id] ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.label}
                      </label>
                      {item.required && <Badge variant="destructive" className="text-xs">Importante</Badge>}
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>

          {/* LOCOMOÇÃO */}
          <AccordionItem value="locomocao" className="border rounded-xl bg-card shadow-sm" data-section="locomocao">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">🚗 Como se Locomover em Orlando</h3>
                  <p className="text-sm text-muted-foreground">Aluguel de carro, Uber, táxi e dicas de trânsito</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Aluguel de Carro */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Aluguel de Carro (Recomendado)
                  </h4>
                  <p className="text-muted-foreground">
                    Na nossa opinião, a melhor forma de locomoção é alugar um carro. Você pega e devolve no aeroporto, então assim que chega você já pega seu carro e não precisa ficar dependendo de aplicativo nenhum. A liberdade de estar com seu carro não tem preço.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><strong>✓ PID não é obrigatória:</strong> Basta ter mais de 25 anos e CNH válida do Brasil</p>
                    <p className="text-sm"><strong>✓ Entre 21 e 25 anos:</strong> Será cobrada taxa extra</p>
                    <p className="text-sm"><strong>✓ Todos os carros são automáticos</strong> nos EUA</p>
                    <p className="text-sm"><strong>✓ Caução:</strong> $100 a $150 (não bloqueado do limite)</p>
                    <p className="text-sm"><strong>✓ Cartão de crédito internacional</strong> obrigatório na retirada</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                      <p className="font-bold text-lg text-blue-600">Alamo</p>
                      <p className="text-xs text-muted-foreground">Brasileiros adoram</p>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                      <p className="font-bold text-lg text-blue-600">Budget</p>
                      <p className="text-xs text-muted-foreground">Bom custo-benefício</p>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                      <p className="font-bold text-lg text-blue-600">Hertz</p>
                      <p className="text-xs text-muted-foreground">Premium</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Uber/Táxi */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Táxi e Uber
                  </h4>
                  <p className="text-muted-foreground">
                    Caso sua decisão seja andar de Táxi ou Uber (legalizado na Flórida), a indicação sempre será os APPs. Táxi costuma ser bem caro na Flórida, portanto deem preferência ao Uber. Existem bandeiras diferentes conforme os horários, igual no Brasil.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">Uber X</p>
                      <p className="text-xs text-muted-foreground">Aeroporto → Disney: ~$25-35</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">Uber XL</p>
                      <p className="text-xs text-muted-foreground">Para grupos maiores: +30%</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pedágios */}
                <div className="space-y-3">
                  <h4 className="font-semibold">💰 Pedágios</h4>
                  <p className="text-muted-foreground">
                    Existem muitos pedágios espalhados por Orlando. Eles são bem baratinhos. Se você alugar um carro através das grandes locadoras (Alamo, Dollar, Thrifty), o Sun Pass já vem instalado e a cobrança é feita na devolução do carro.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">SunPass / EPass</p>
                      <p className="text-xs text-muted-foreground">Cobrança automática na devolução</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">Exact Coins</p>
                      <p className="text-xs text-muted-foreground">Moedas exatas no valor do pedágio</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Abastecimento */}
                <div className="space-y-3">
                  <h4 className="font-semibold">⛽ Abastecimento</h4>
                  <p className="text-muted-foreground">
                    Você mesmo abastece o carro. A gasolina mais barata é a Regular (Comum), e o valor é do Galão (3.8L). Entre na loja de conveniência, indique o número da bomba (Gas Pump), pague e abasteça.
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-sm"><strong>⚠️ Dica:</strong> Nunca diga "bomba", diga "Gas Pump". Exemplo: "My car is in Gas Pump number 4"</p>
                  </div>
                </div>

                <Separator />

                {/* Regras de Trânsito */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🚦 Regras de Trânsito Importantes</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Cruzamentos sem farol: Passa quem chegar primeiro</p>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Sinal fechado: Pode dobrar à direita (cuidado com pedestres)</p>
                    </div>
                    <div className="flex items-start gap-2 bg-red-500/10 rounded-lg p-3">
                      <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">NO TURN ON RED: Se tiver essa placa, NÃO pode dobrar</p>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Cinto obrigatório para TODOS (inclusive banco traseiro)</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Segurança */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Segurança no Trânsito
                  </h4>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><strong>🚌 Ônibus Escolar com STOP piscando:</strong> PARE imediatamente, independente da faixa. Mesmo no sentido contrário!</p>
                    <p className="text-sm"><strong>🍺 Dirigir alcoolizado:</strong> É delito grave. Além de multa, você pode ser preso.</p>
                    <p className="text-sm"><strong>📍 Fiscalização:</strong> Existem guardas escondidos fiscalizando velocidade.</p>
                  </div>
                </div>

                <Separator />

                {/* Crianças */}
                <div className="space-y-3">
                  <h4 className="font-semibold">👶 Carros com Crianças</h4>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-bold text-lg">Até 3 anos</p>
                      <p className="text-sm text-muted-foreground">Cadeirinha obrigatória</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-bold text-lg">3 a 5 anos</p>
                      <p className="text-sm text-muted-foreground">Booster obrigatório</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-bold text-lg">6+ anos</p>
                      <p className="text-sm text-muted-foreground">Opcional</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Pode contratar na hora da retirada do carro, direto no balcão da locadora.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* AEROPORTO E IMIGRAÇÃO */}
          <AccordionItem value="aeroporto" className="border rounded-xl bg-card shadow-sm" data-section="aeroporto">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">✈️ Aeroporto e Imigração</h3>
                  <p className="text-sm text-muted-foreground">Check-in, imigração, duty free e dicas</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Check-in */}
                <div className="space-y-3">
                  <h4 className="font-semibold">📋 Check-in Internacional</h4>
                  <p className="text-muted-foreground">
                    Os check-ins internacionais normalmente são feitos com 3 horas de antecedência, e acredite, esse tempo não é muito grande. Existem filas de check-in e despacho de bagagens que podem durar mais de 1 hora.
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-sm"><strong>⏰ Dica:</strong> Se programe para chegar no aeroporto com no mínimo 3 horas de antecedência do horário de embarque.</p>
                  </div>
                </div>

                <Separator />

                {/* Aeroportos Orlando */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🛫 Aeroportos de Orlando</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card className="border-blue-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">MCO - Orlando International</CardTitle>
                        <CardDescription>Principal aeroporto</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">20-30 min dos parques Disney e Universal. Maior e mais movimentado.</p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">SFB - Orlando Sanford</CardTitle>
                        <CardDescription>Alternativo (mais distante)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">45-60 min dos parques. Menos movimentado, pode ter voos mais baratos.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Imigração */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🛂 Imigração</h4>
                  <p className="text-muted-foreground">
                    Assim que descer do avião e pegar suas malas, você é obrigado a passar na Imigração. O Agente vai fazer perguntas sobre aonde você vai, intenção da viagem, quanto tempo vai ficar e quanto está levando em dinheiro. Terá que colocar os dedos para digitais e tirar foto.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Documentos para ter em mãos:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Passaporte e Visto</li>
                      <li>Comprovante de hotel</li>
                      <li>Locação de carro (se tiver)</li>
                      <li>Ingressos dos parques</li>
                      <li>Seguro saúde</li>
                    </ul>
                    <p className="text-sm mt-3"><strong>⚠️ Importante:</strong> Só entregue se for solicitado. Responda apenas o que for perguntado. Respostas calmas, curtas e objetivas sempre.</p>
                  </div>
                  
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-green-500/10 rounded-lg p-3">
                      <p className="font-medium text-sm text-green-700">✓ Perguntas Comuns</p>
                      <p className="text-xs text-muted-foreground">Where are you going? / How long? / How much money?</p>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-3">
                      <p className="font-medium text-sm text-red-700">✗ Evitar</p>
                      <p className="text-xs text-muted-foreground">Não brinque, não minta, não seja nervoso</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Duty Free */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🛍️ Duty Free</h4>
                  <p className="text-muted-foreground">
                    Qualquer produto que você compra no Duty Free é livre de imposto (6,5% na Flórida, 7% em Miami). Você tem $1000 dólares de cota por pessoa.
                  </p>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm"><strong>💡 Dica Importante:</strong> Compre sempre no DESEMBARQUE e nunca no embarque. Tudo que comprar no FreeShop do desembarque NÃO entra na cota de $1000.</p>
                  </div>
                </div>

                <Separator />

                {/* Malas */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🧳 Dicas para Malas</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <p className="text-sm">Peso máximo: Geralmente 23kg por mala</p>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <p className="text-sm">Não vá com peso máximo na ida (deixe espaço para compras)</p>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <p className="text-sm">Compre uma balança no Walmart (~$10)</p>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <p className="text-sm">Use cadeados para proteção extra</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* MOCHILA PARA O PARQUE */}
          <AccordionItem value="mochila" className="border rounded-xl bg-card shadow-sm" data-section="mochila">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Backpack className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">🎒 O que Levar para o Parque</h3>
                  <p className="text-sm text-muted-foreground">Snacks, itens essenciais e documentos</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Snacks */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🍿 Snacks (Compre no Walmart)</h4>
                  <p className="text-muted-foreground">
                    Vá ao Walmart no dia anterior e compre alguns lanchinhos para os parques. Os snacks não são nada baratos nos parques!
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">💧 Garrafinhas d'água</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">🍎 Frutas (potinhos)</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">🧀 Queijos e castanhas</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">🍪 Biscoitos e cookies</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">🥔 Salgadinhos (Pringles)</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">🍫 Barras de cereais</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Itens Essenciais */}
                <div className="space-y-3">
                  <h4 className="font-semibold">✅ Itens Essenciais</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Sun className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-sm">Protetor Solar</p>
                        <p className="text-xs text-muted-foreground">O sol pode ser bem forte em Orlando</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Pill className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-sm">Nécessaire de Remédios</p>
                        <p className="text-xs text-muted-foreground">Dor de cabeça, cólica, dor muscular</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Thermometer className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Casaco</p>
                        <p className="text-xs text-muted-foreground">A temperatura pode cair no final do dia</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Umbrella className="w-5 h-5 text-cyan-500" />
                      <div>
                        <p className="font-medium text-sm">Capa de Chuva</p>
                        <p className="text-xs text-muted-foreground">Para atrações que molham e chuvas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-sm">Carregador Portátil</p>
                        <p className="text-xs text-muted-foreground">Bateria extra para o celular</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <Camera className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-sm">Caneta para Autógrafos</p>
                        <p className="text-xs text-muted-foreground">Para pegar autógrafos dos personagens!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Crianças */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Baby className="w-4 h-4 text-pink-500" />
                    Para Crianças Pequenas
                  </h4>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-sm mb-2"><strong>🔖 Pulseira de identificação:</strong> Coloque com nome dos responsáveis, da criança e telefone de contato. Já vimos casos desesperadores de pais com crianças perdidas.</p>
                    <p className="text-sm"><strong>🛒 Locação de carrinho:</strong> Ajuda muito pois as crianças se cansam facilmente. Para idosos, cadeira motorizada disponível.</p>
                  </div>
                </div>

                <Separator />

                {/* Documentos */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Documentos
                  </h4>
                  <p className="text-muted-foreground">
                    O seu documento oficial é o passaporte. Preste muita atenção para não perder. Leve-o para todos os lugares em um ZipLoc para proteger de água.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm"><strong>Consulado Geral do Brasil em Orlando:</strong></p>
                    <p className="text-sm text-muted-foreground">355 N Orange Avenue, Orlando, Florida</p>
                    <p className="text-sm text-muted-foreground">Tel: +1 (407) 608-0080</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* CAFÉ DA MANHÃ */}
          <AccordionItem value="cafe" className="border rounded-xl bg-card shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">☕ Café da Manhã</h3>
                  <p className="text-sm text-muted-foreground">O que comprar no Walmart para o café</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>💡 Dica importante:</strong> Hotéis com café da manhã encarecem muito e o café não é como estamos acostumados no Brasil. O Walmart é sua salvação!
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">🧀 Frios</h5>
                    <p className="text-sm text-muted-foreground">Queijo, presunto, peito de peru, salame</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">🍞 Pães</h5>
                    <p className="text-sm text-muted-foreground">Pão de forma, pão brioche, integrais</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">🧃 Sucos</h5>
                    <p className="text-sm text-muted-foreground">Laranja e maçã são os mais comuns</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">🥣 Cereais</h5>
                    <p className="text-sm text-muted-foreground">Grande variedade de cereais e granolas</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">☕ Café e Chás</h5>
                    <p className="text-sm text-muted-foreground">Café solúvel, cápsulas, chás variados</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">🥛 Leite</h5>
                    <p className="text-sm text-muted-foreground">Leite, Nescau, Danone, iogurtes</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* COMPRAS */}
          <AccordionItem value="compras" className="border rounded-xl bg-card shadow-sm" data-section="compras">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-pink-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">🛒 Compras em Orlando</h3>
                  <p className="text-sm text-muted-foreground">Outlets, lojas, supermercados e dicas</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Dicas Gerais */}
                <div className="space-y-3">
                  <h4 className="font-semibold">💡 Dicas Gerais</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <strong>Imposto:</strong> 6,5% sobre qualquer compra (exceto alimentos nos mercados)
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <strong>Tempo:</strong> Separe pelo menos 2 dias inteiros para compras
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <strong>Ordem:</strong> Vá primeiro nos outlets, depois nos shoppings
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <strong>Souvenirs:</strong> Mais baratos no Walmart e Target
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Cota */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Cota e Alfândega
                  </h4>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><strong>Limite:</strong> US$1.000 de bens adquiridos no exterior</p>
                    <p className="text-sm"><strong>Eletrônicos:</strong> 1 câmera, 1 celular e 1 relógio por pessoa entram na cota</p>
                    <p className="text-sm"><strong>Receita Federal:</strong> Pode solicitar nota fiscal para comprovar valor</p>
                    <p className="text-sm"><strong>Evite:</strong> Produtos repetidos e com etiquetas (parecem revenda)</p>
                  </div>
                </div>

                <Separator />

                {/* Outlets */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-500" />
                    Outlets Premium
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card className="border-green-500/20 bg-green-500/5">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500 text-white">⭐ Favorito</Badge>
                        </div>
                        <CardTitle className="text-base mt-2">Orlando International Premium Outlets</CardTitle>
                        <CardDescription>O maior outlet com TODAS as marcas</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">Nike, Adidas, Victoria's Secret, Polo Ralph Lauren, Carter's, Levi's, Lacoste, New Balance, Skechers, Coach, Michael Kors, Kate Spade...</p>
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">180+ lojas</Badge>
                          <Badge variant="secondary" className="text-xs">Aberto</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-blue-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Orlando Vineland Premium Outlets</CardTitle>
                        <CardDescription>Perto da Disney, geralmente mais vazio</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">Praticamente as mesmas lojas do Internacional. Ótimo para compras mais tranquilas. Próximo ao Disney Springs.</p>
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">160+ lojas</Badge>
                          <Badge variant="secondary" className="text-xs">Menos cheio</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Lake Buena Vista Factory Stores</CardTitle>
                        <CardDescription>Pequeno mas prático</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Menor variedade, mas bom para compras rápidas. Fica bem perto da Disney.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">The Florida Mall</CardTitle>
                        <CardDescription>Shopping tradicional</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Não é outlet, mas tem Apple Store, Macy's, JCPenney, Sears e muito mais.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Melhores Lojas por Categoria */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🏆 Melhores Lojas por Categoria</h4>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    <div className="bg-blue-500/10 rounded-lg p-3">
                      <p className="font-medium text-sm mb-1">👟 Tênis</p>
                      <p className="text-xs text-muted-foreground">Nike Factory, Adidas Outlet, New Balance, Skechers</p>
                    </div>
                    <div className="bg-pink-500/10 rounded-lg p-3">
                      <p className="font-medium text-sm mb-1">👗 Roupas Femininas</p>
                      <p className="text-xs text-muted-foreground">Victoria's Secret, Bath & Body Works, Forever 21</p>
                    </div>
                    <div className="bg-purple-500/10 rounded-lg p-3">
                      <p className="font-medium text-sm mb-1">👜 Bolsas</p>
                      <p className="text-xs text-muted-foreground">Coach, Michael Kors, Kate Spade, Guess</p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-3">
                      <p className="font-medium text-sm mb-1">👶 Infantil</p>
                      <p className="text-xs text-muted-foreground">Carter's, OshKosh, Children's Place, Gap Kids</p>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-3">
                      <p className="font-medium text-sm mb-1">👔 Masculino</p>
                      <p className="text-xs text-muted-foreground">Polo Ralph Lauren, Tommy Hilfiger, Calvin Klein</p>
                    </div>
                    <div className="bg-cyan-500/10 rounded-lg p-3">
                      <p className="font-medium text-sm mb-1">💄 Cosméticos</p>
                      <p className="text-xs text-muted-foreground">Bath & Body Works, Victoria's Secret, Ulta</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Supermercados */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-500" />
                    Supermercados
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="bg-blue-500/10 rounded-lg p-4">
                      <h5 className="font-bold">🔵 Walmart</h5>
                      <p className="text-sm text-muted-foreground mt-1">Parada OBRIGATÓRIA! Snacks, água, café da manhã, eletrônicos, roupas e muito mais. Variedade gigante com preços imbatíveis.</p>
                      <Badge variant="secondary" className="mt-2 text-xs">24 horas (alguns)</Badge>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-4">
                      <h5 className="font-bold">🔴 Target</h5>
                      <p className="text-sm text-muted-foreground mt-1">Destaque para cosméticos, roupas e brinquedos. Produtos com melhor curadoria e qualidade.</p>
                      <Badge variant="secondary" className="mt-2 text-xs">Fecha às 22h</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Lojas de Departamento */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🏬 Lojas de Departamento (Garimpo)</h4>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-medium">Ross</p>
                      <p className="text-xs text-muted-foreground">Achados incríveis!</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-medium">Burlington</p>
                      <p className="text-xs text-muted-foreground">Marcas famosas</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-medium">TJ Maxx</p>
                      <p className="text-xs text-muted-foreground">Preços baixos</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-medium">Marshalls</p>
                      <p className="text-xs text-muted-foreground">Bem organizada</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">💡 Dica: Essas lojas vendem de tudo a preços muito baixos, mas exige paciência para garimpar!</p>
                </div>

                <Separator />

                {/* Eletrônicos */}
                <div className="space-y-3">
                  <h4 className="font-semibold">📱 Eletrônicos</h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                      <p className="font-bold">Best Buy</p>
                      <p className="text-xs text-muted-foreground">Maior variedade</p>
                    </div>
                    <div className="bg-gray-500/10 rounded-lg p-3 text-center">
                      <p className="font-bold">Apple Store</p>
                      <p className="text-xs text-muted-foreground">Produtos Apple</p>
                    </div>
                    <div className="bg-orange-500/10 rounded-lg p-3 text-center">
                      <p className="font-bold">Amazon Locker</p>
                      <p className="text-xs text-muted-foreground">Compre online, retire</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Farmácias */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Pill className="w-4 h-4 text-green-500" />
                    Farmácias
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    CVS e Walgreens são como mini mercados. Além de remédios, você encontra alimentos, perfumes, cosméticos, vitaminas e muito mais!
                  </p>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm"><strong>💡 Dica:</strong> Vitaminas, suplementos e produtos de beleza têm preços excelentes nas farmácias!</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* TABELA DE MEDIDAS */}
          <AccordionItem value="medidas" className="border rounded-xl bg-card shadow-sm" data-section="medidas">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">📏 Tabela de Medidas</h3>
                  <p className="text-sm text-muted-foreground">Conversão Brasil x EUA para roupas e calçados</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Roupas Gerais */}
                <div className="space-y-3">
                  <h4 className="font-semibold">👕 Roupas (Geral)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium">Brasil</th>
                          {clothingSizes.general.brasil.map((size, i) => (
                            <th key={i} className="px-3 py-2 text-center">{size}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 font-medium">EUA</td>
                          {clothingSizes.general.usa.map((size, i) => (
                            <td key={i} className="px-3 py-2 text-center">{size}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Roupas Femininas */}
                <div className="space-y-3">
                  <h4 className="font-semibold">👗 Roupas Femininas</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium">Brasil</th>
                          {clothingSizes.women.brasil.map((size, i) => (
                            <th key={i} className="px-3 py-2 text-center">{size}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 font-medium">EUA</td>
                          {clothingSizes.women.usa.map((size, i) => (
                            <td key={i} className="px-3 py-2 text-center">{size}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Roupas Infantis */}
                <div className="space-y-3">
                  <h4 className="font-semibold">👶 Roupas Infantis</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium">Brasil</th>
                          {clothingSizes.kids.brasil.map((size, i) => (
                            <th key={i} className="px-3 py-2 text-center">{size}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 font-medium">EUA</td>
                          {clothingSizes.kids.usa.map((size, i) => (
                            <td key={i} className="px-3 py-2 text-center">{size}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <Separator />

                {/* Calçados */}
                <div className="space-y-3">
                  <h4 className="font-semibold">👠 Calçados Femininos</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium">Brasil</th>
                          {shoeSizes.women.brasil.map((size, i) => (
                            <th key={i} className="px-3 py-2 text-center">{size}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 font-medium">EUA</td>
                          {shoeSizes.women.usa.map((size, i) => (
                            <td key={i} className="px-3 py-2 text-center">{size}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">👞 Calçados Masculinos</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium">Brasil</th>
                          {shoeSizes.men.brasil.map((size, i) => (
                            <th key={i} className="px-3 py-2 text-center">{size}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 font-medium">EUA</td>
                          {shoeSizes.men.usa.map((size, i) => (
                            <td key={i} className="px-3 py-2 text-center">{size}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">👟 Calçados Infantis</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium">Brasil</th>
                          {shoeSizes.kids.brasil.map((size, i) => (
                            <th key={i} className="px-3 py-2 text-center">{size}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 font-medium">EUA</td>
                          {shoeSizes.kids.usa.map((size, i) => (
                            <td key={i} className="px-3 py-2 text-center">{size}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* DICAS PARQUES DISNEY */}
          <AccordionItem value="parques-disney" className="border rounded-xl bg-card shadow-sm" data-section="parques-disney">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">🏰 Dicas dos Parques Disney</h3>
                  <p className="text-sm text-muted-foreground">Ingressos, Lightning Lane, Multi Pass e mais</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Os 4 Parques */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🎢 Os 4 Parques Disney</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card className="border-pink-500/20 bg-pink-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          🏰 Magic Kingdom
                          <Badge className="bg-pink-500 text-white text-xs">Clássico</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">O parque mais famoso do mundo! Castelo da Cinderela, Space Mountain, Big Thunder Mountain, Pirates of the Caribbean.</p>
                        <p className="text-xs mt-2"><strong>Tempo sugerido:</strong> Dia inteiro</p>
                      </CardContent>
                    </Card>
                    <Card className="border-blue-500/20 bg-blue-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          🌐 EPCOT
                          <Badge className="bg-blue-500 text-white text-xs">Adultos adoram</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Pavilhões de 11 países, Guardians of the Galaxy, Test Track, Frozen Ever After. Ótima gastronomia!</p>
                        <p className="text-xs mt-2"><strong>Tempo sugerido:</strong> Dia inteiro</p>
                      </CardContent>
                    </Card>
                    <Card className="border-orange-500/20 bg-orange-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          🎬 Hollywood Studios
                          <Badge className="bg-orange-500 text-white text-xs">Star Wars</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Galaxy's Edge (Star Wars), Toy Story Land, Tower of Terror, Rock 'n' Roller Coaster.</p>
                        <p className="text-xs mt-2"><strong>Tempo sugerido:</strong> Dia inteiro</p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-500/20 bg-green-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          🦁 Animal Kingdom
                          <Badge className="bg-green-500 text-white text-xs">Natureza</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Pandora (Avatar), Kilimanjaro Safaris, Expedition Everest. Maior parque Disney do mundo!</p>
                        <p className="text-xs mt-2"><strong>Tempo sugerido:</strong> 3/4 do dia</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Ingressos */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🎫 Ingressos Disney</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><strong>📍 Locais para troca do voucher:</strong></p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      <li>Ticket Center no Disney Springs (atrás da Zara)</li>
                      <li>Balcão Will Call ao lado das bilheteiras dos parques</li>
                    </ul>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">Base Ticket</p>
                      <p className="text-xs text-muted-foreground">1 parque por dia (mais barato)</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">Park Hopper</p>
                      <p className="text-xs text-muted-foreground">Visitar múltiplos parques no mesmo dia</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Lightning Lane */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Lightning Lane Multi Pass
                  </h4>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 space-y-2">
                    <p className="text-sm">Serviço pago para agendar atrações e furar filas.</p>
                    <p className="text-sm">• Agende 3 atrações antecipadas</p>
                    <p className="text-sm">• <strong>Hóspede Disney:</strong> 7 dias antes</p>
                    <p className="text-sm">• <strong>Não hóspede:</strong> 3 dias antes</p>
                    <p className="text-sm">• Ao usar a 1ª, pode marcar outra e assim por diante</p>
                  </div>
                </div>

                <Separator />

                {/* Single Pass */}
                <div className="space-y-3">
                  <h4 className="font-semibold">⚡ Lightning Lane Single Pass</h4>
                  <p className="text-muted-foreground text-sm">
                    Algumas atrações especiais que você compra à parte (não entram no Multi Pass). Limite de 2 atrações por dia por pessoa.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-sm">
                      <strong>MK:</strong> Tiana's Bayou Adventure, TRON
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-sm">
                      <strong>EPCOT:</strong> Guardians of the Galaxy
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-sm">
                      <strong>HS:</strong> Rise of the Resistance
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-sm">
                      <strong>AK:</strong> Flight of Passage
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Single Rider */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🎢 Single Rider (Fila Mais Rápida)</h4>
                  <p className="text-muted-foreground text-sm">
                    Fila mais rápida para quem não se importa em sentar sozinho.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium">Parque</th>
                          <th className="px-3 py-2 text-left">Atrações com Single Rider</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-3 py-2 font-medium">Magic Kingdom</td>
                          <td className="px-3 py-2 text-muted-foreground">Não tem</td>
                        </tr>
                        <tr className="border-t">
                          <td className="px-3 py-2 font-medium">Hollywood Studios</td>
                          <td className="px-3 py-2">Rock 'n' Roller Coaster, Millennium Falcon</td>
                        </tr>
                        <tr className="border-t">
                          <td className="px-3 py-2 font-medium">EPCOT</td>
                          <td className="px-3 py-2">Test Track</td>
                        </tr>
                        <tr className="border-t">
                          <td className="px-3 py-2 font-medium">Animal Kingdom</td>
                          <td className="px-3 py-2">Expedition Everest</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <Separator />

                {/* Dicas Gerais */}
                <div className="space-y-3">
                  <h4 className="font-semibold">💡 Dicas Valiosas</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">📸 Tire foto da localização do carro no estacionamento</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">🍿 Baldes de pipoca: $14-$24 + refil por $2,25</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">🏅 Pegue os Buttons de celebração no Guest Relations</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">⏰ Chegue 30-45 min antes do parque abrir</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">📱 Baixe o My Disney Experience</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">💧 Água grátis em qualquer restaurante!</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* DICAS PARQUES UNIVERSAL */}
          <AccordionItem value="parques-universal" className="border rounded-xl bg-card shadow-sm" data-section="parques-universal">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">🎢 Dicas dos Parques Universal</h3>
                  <p className="text-sm text-muted-foreground">Universal Studios, Islands of Adventure e Epic Universe</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Os Parques */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🎢 Os 3 Parques Universal</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card className="border-blue-600/20 bg-blue-600/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          🎬 Universal Studios
                          <Badge className="bg-blue-600 text-white text-xs">Filmes</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Diagon Alley (Harry Potter), Revenge of the Mummy, Transformers, Hollywood Rip Ride Rockit, MEN IN BLACK.</p>
                        <p className="text-xs mt-2"><strong>Tempo sugerido:</strong> Dia inteiro</p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-600/20 bg-green-600/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          🏝️ Islands of Adventure
                          <Badge className="bg-green-600 text-white text-xs">Adrenalina</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Hogsmeade (Harry Potter), Hagrid's Magical Creatures, VelociCoaster, Jurassic World, Hulk Coaster.</p>
                        <p className="text-xs mt-2"><strong>Tempo sugerido:</strong> Dia inteiro</p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-600/20 bg-purple-600/5 sm:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          ✨ Epic Universe
                          <Badge className="bg-purple-600 text-white text-xs">NOVO 2025!</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">O parque mais novo! Super Nintendo World (Mario Kart!), Wizarding World (Ministério da Magia), How to Train Your Dragon, Dark Universe (monstros clássicos).</p>
                        <p className="text-xs mt-2"><strong>Tempo sugerido:</strong> Dia inteiro + (chegue cedo!)</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Hogwarts Express */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    🚂 Hogwarts Express
                  </h4>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <p className="text-sm">O trem que liga Hogsmeade (Islands of Adventure) a Diagon Alley (Universal Studios).</p>
                    <p className="text-sm mt-2"><strong>⚠️ Importante:</strong> Precisa ter ingresso Park-to-Park para usar o Hogwarts Express!</p>
                  </div>
                </div>

                <Separator />

                {/* Express Pass */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Universal Express Pass
                  </h4>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 space-y-2">
                    <p className="text-sm">Fure a fila na maioria das atrações!</p>
                    <p className="text-sm">• <strong>Express:</strong> 1 uso por atração</p>
                    <p className="text-sm">• <strong>Express Unlimited:</strong> Uso ilimitado</p>
                    <p className="text-sm">• <strong>Hóspedes Premier/Preferred:</strong> Express incluso!</p>
                  </div>
                </div>

                <Separator />

                {/* Single Rider Universal */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🎢 Single Rider na Universal</h4>
                  <p className="text-muted-foreground text-sm">
                    Economize MUITO tempo! Várias atrações têm Single Rider.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">Islands of Adventure</p>
                      <p className="text-xs text-muted-foreground">Hagrid's, VelociCoaster, Forbidden Journey, Hulk</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium text-sm">Universal Studios</p>
                      <p className="text-xs text-muted-foreground">Mummy, Transformers, MEN IN BLACK, Fast & Furious</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Virtual Line */}
                <div className="space-y-3">
                  <h4 className="font-semibold">📱 Virtual Line</h4>
                  <p className="text-muted-foreground text-sm">
                    Algumas atrações usam fila virtual pelo app. Você agenda um horário e volta quando for a sua vez.
                  </p>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-sm"><strong>💡 Dica:</strong> Baixe o app Universal Orlando Resort e faça login antes de ir!</p>
                  </div>
                </div>

                <Separator />

                {/* Dicas */}
                <div className="space-y-3">
                  <h4 className="font-semibold">💡 Dicas Valiosas Universal</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">🎒 Deixe mochilas nos lockers (gratuitos nas montanhas-russas)</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">⏰ Chegue 1h antes para pegar as atrações vazias</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">🧙‍♂️ Compre uma varinha interativa em Hogsmeade</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">🍺 Prove a Butterbeer (cerveja amanteigada)!</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* RESTAURANTES DISNEY */}
          <AccordionItem value="restaurantes-disney" className="border rounded-xl bg-card shadow-sm" data-section="restaurantes-disney">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-pink-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">🏰 Restaurantes Disney</h3>
                  <p className="text-sm text-muted-foreground">Magic Kingdom, EPCOT, Hollywood Studios e Animal Kingdom</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Dica de Reserva */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">📅 Como Fazer Reservas</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Hóspedes Disney:</strong> 60 dias de antecedência<br />
                    <strong>Demais visitantes:</strong> 30 dias de antecedência<br />
                    <strong>App:</strong> My Disney Experience ou site disneyworld.com
                  </p>
                </div>

                <Tabs defaultValue="magic-kingdom" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                    <TabsTrigger value="magic-kingdom">🏰 Magic Kingdom</TabsTrigger>
                    <TabsTrigger value="epcot">🌐 EPCOT</TabsTrigger>
                    <TabsTrigger value="hollywood">🎬 Hollywood Studios</TabsTrigger>
                    <TabsTrigger value="animal">🦁 Animal Kingdom</TabsTrigger>
                  </TabsList>

                  {/* Magic Kingdom */}
                  <TabsContent value="magic-kingdom" className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-pink-500/20 bg-pink-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-pink-500 text-white">Premium</Badge>
                            <Badge variant="outline">Reserva Obrigatória</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Cinderella's Royal Table</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Dentro do Castelo da Cinderela! Refeição com princesas, muitas fotos e autógrafos. Sonho para as crianças!
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">👸 Princesas</Badge>
                            <Badge variant="secondary" className="text-xs">📸 Fotos</Badge>
                            <Badge variant="secondary" className="text-xs">$$$</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-amber-500 text-white">Premium</Badge>
                            <Badge variant="outline">Reserva Obrigatória</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Be Our Guest</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Dentro do Castelo da Fera! Ambiente de palácio refinado. Pratos à la carte e bebidas alcoólicas. Aparição da Fera no jantar.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🥀 A Fera</Badge>
                            <Badge variant="secondary" className="text-xs">🍷 Bebidas</Badge>
                            <Badge variant="secondary" className="text-xs">$$</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="w-fit">Fast Food</Badge>
                          <CardTitle className="text-base mt-2">Cosmic Ray's Starlight Café</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Restaurante fast food bem grande. Hambúrgueres e frangos fritos com batata são os mais pedidos. Show com animatronic!
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="w-fit">Balcão</Badge>
                          <CardTitle className="text-base mt-2">Columbia Harbour House</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Peixe frito, camarão, pães de lagosta, sopas. Dica: a quiche de legumes é sensacional! Ambiente aconchegante.
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="w-fit">Mesa</Badge>
                          <CardTitle className="text-base mt-2">Liberty Tree Tavern</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Comida americana tradicional estilo Thanksgiving: peru, purê, stuffing. Ambiente colonial charmoso.
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="w-fit">Sobremesas</Badge>
                          <CardTitle className="text-base mt-2">Sunshine Tree Terrace</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            O famosíssimo Dole Whip (sorvete de abacaxi)! Imperdível, especialmente no calor. Tem versão com rum também!
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* EPCOT */}
                  <TabsContent value="epcot" className="mt-4 space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                      <p className="text-sm"><strong>💡 Dica EPCOT:</strong> Experimente algo de cada pavilhão! Funnel Cake nos EUA, Crepe na França, gelatos na Itália, pipoca de caramelo na Alemanha. Para adultos: margarita no México e chopp na Alemanha!</p>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-blue-500/20 bg-blue-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-blue-500 text-white">Premium</Badge>
                            <Badge variant="outline">Difícil Conseguir</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Space 220 Restaurant</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Restaurante espacial! "Elevador" te leva para estação espacial com vista simulada da Terra. Menu fixo (2 ou 3 pratos).
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🚀 Temático</Badge>
                            <Badge variant="secondary" className="text-xs">🍸 Drinks</Badge>
                            <Badge variant="secondary" className="text-xs">$$$</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-500/20 bg-green-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-green-600 text-white">🇲🇽 México</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">San Angel Inn</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Dentro da pirâmide! Ambiente noturno romântico inspirado em fazenda mexicana. Margaritas e tequilas premium.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🌙 Romântico</Badge>
                            <Badge variant="secondary" className="text-xs">🌮 Mexicano</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-indigo-500/20 bg-indigo-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-indigo-600 text-white">🇫🇷 França</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Chefs de France</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Cozinha francesa clássica: sopa de cebola, filé mignon, pato assado. Crème brûlée imperdível!
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🍷 Vinhos</Badge>
                            <Badge variant="secondary" className="text-xs">👨‍🍳 Elegante</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-red-500/20 bg-red-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-red-600 text-white">🇯🇵 Japão</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Teppan Edo</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Teppanyaki! Chef prepara na sua frente com show de habilidades. Carnes, frutos do mar e vegetais.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🍱 Show</Badge>
                            <Badge variant="secondary" className="text-xs">👨‍👩‍👧 Família</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-yellow-500/20 bg-yellow-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-yellow-600 text-white">🇮🇹 Itália</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Via Napoli</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Pizza napolitana autêntica em forno a lenha gigante! Massa fina e ingredientes importados da Itália.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🍕 Pizza</Badge>
                            <Badge variant="secondary" className="text-xs">⭐ Favorito</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-cyan-500/20 bg-cyan-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-cyan-600 text-white">🐠 The Seas</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Coral Reef</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Jantar com vista para o aquário gigante! Mais de 2.000 criaturas marinhas. Especialidade: frutos do mar.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🦐 Frutos do Mar</Badge>
                            <Badge variant="secondary" className="text-xs">👀 Vista</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-amber-600 text-white">🇩🇪 Alemanha</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Biergarten Restaurant</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Buffet alemão com salsicha, schnitzel, sauerkraut. Show ao vivo de música alemã! Cervejas autênticas.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🍺 Cerveja</Badge>
                            <Badge variant="secondary" className="text-xs">🎵 Show</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="w-fit">🇺🇸 EUA - Quick Service</Badge>
                          <CardTitle className="text-base mt-2">Regal Eagle Smokehouse</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            BBQ americano: costela, brisket, pulled pork. Churrasco defumado de verdade! Área com personagens Muppets.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Hollywood Studios */}
                  <TabsContent value="hollywood" className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-orange-500/20 bg-orange-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-orange-500 text-white">⭐ Star Wars</Badge>
                            <Badge variant="outline">Reserva Difícil</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Oga's Cantina</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Bar em Galaxy's Edge! Drinks exclusivos temáticos de Star Wars. DJ Rex toca músicas. Tempo limitado (45 min).
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🍸 Drinks</Badge>
                            <Badge variant="secondary" className="text-xs">🎵 DJ</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-500/20 bg-blue-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-blue-600 text-white">⭐ Star Wars</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Docking Bay 7</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Restaurante quick service em Galaxy's Edge. Pratos criativos com nomes galácticos. Fried Endorian Tip-Yip é incrível!
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🚀 Temático</Badge>
                            <Badge variant="secondary" className="text-xs">Fast Food</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-yellow-500/20 bg-yellow-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-yellow-500 text-white">Toy Story</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Woody's Lunch Box</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Quick service em Toy Story Land! Grilled cheese totcho (nachos), BBQ Brisket Melt. Ambiente nostálgico.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🧸 Crianças</Badge>
                            <Badge variant="secondary" className="text-xs">Fast Food</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-500/20 bg-purple-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-purple-500 text-white">Anos 50</Badge>
                            <Badge variant="outline">Reserva Recomendada</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">50's Prime Time Café</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Tema de cozinha americana dos anos 50! Garçons "brigam" se você não comer os vegetais. Comfort food deliciosa.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">😂 Divertido</Badge>
                            <Badge variant="secondary" className="text-xs">🍖 Comfort</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-red-500/20 bg-red-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-red-500 text-white">Cinema</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Sci-Fi Dine-In Theater</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Comer dentro de carros antigos vendo filmes B de ficção científica! Hambúrgueres e shakes. Experiência única!
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🎬 Temático</Badge>
                            <Badge variant="secondary" className="text-xs">🚗 Carros</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="w-fit">Italiano</Badge>
                          <CardTitle className="text-base mt-2">Mama Melrose's</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Italiano casual. Massas, flatbreads, frango parmegiana. Boa opção para fugir das filas dos mais concorridos.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Animal Kingdom */}
                  <TabsContent value="animal" className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-purple-500/20 bg-purple-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-purple-600 text-white">🌙 Pandora</Badge>
                            <Badge variant="outline">Reserva Obrigatória</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Satu'li Canteen</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Quick service em Pandora (Avatar)! Bowls saudáveis com proteína, grãos e molhos. Decoração alienígena impressionante.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🥗 Saudável</Badge>
                            <Badge variant="secondary" className="text-xs">⭐ Melhor QS</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-500/20 bg-green-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-green-600 text-white">🌿 África</Badge>
                            <Badge variant="outline">Reserva Recomendada</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Tusker House</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Buffet africano com personagens! Mickey, Donald e amigos em roupas de safari. Pratos africanos e americanos.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🐭 Personagens</Badge>
                            <Badge variant="secondary" className="text-xs">🍽️ Buffet</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-amber-600 text-white">🐯 Ásia</Badge>
                            <Badge variant="outline">Reserva Recomendada</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Yak & Yeti</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Culinária pan-asiática: pratos chineses, japoneses, tailandeses. Honey Chicken é o favorito! Ambiente elaborado.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🍜 Asiático</Badge>
                            <Badge variant="secondary" className="text-xs">🍗 Honey Chicken</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-500/20 bg-blue-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-blue-600 text-white">🦖 DinoLand</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Restaurantosaurus</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Quick service com tema de escavação de dinossauros. Hambúrgueres, chicken nuggets. Bom para crianças!
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🦕 Dinos</Badge>
                            <Badge variant="secondary" className="text-xs">Fast Food</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="w-fit">🦘 Austrália</Badge>
                          <CardTitle className="text-base mt-2">Flame Tree Barbecue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            BBQ americano delicioso! Ribs, pulled pork, chicken. Área externa com vista linda. Um dos melhores quick service Disney!
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="w-fit">🌺 Rainforest</Badge>
                          <CardTitle className="text-base mt-2">Rainforest Cafe</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Na entrada do parque! Temático de floresta tropical com animais animatrônicos. Crianças adoram! Pratos americanos.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator />

                {/* Snacks Disney */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🍿 Snacks Clássicos Disney</h4>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">🍍</p>
                      <p className="font-medium text-sm">Dole Whip</p>
                      <p className="text-xs text-muted-foreground">Sorvete de abacaxi</p>
                    </div>
                    <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">🍗</p>
                      <p className="font-medium text-sm">Turkey Leg</p>
                      <p className="text-xs text-muted-foreground">Coxa de peru gigante</p>
                    </div>
                    <div className="bg-orange-500/10 rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">🥨</p>
                      <p className="font-medium text-sm">Mickey Pretzel</p>
                      <p className="text-xs text-muted-foreground">Pretzel do Mickey</p>
                    </div>
                    <div className="bg-pink-500/10 rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">🍦</p>
                      <p className="font-medium text-sm">Mickey Bar</p>
                      <p className="text-xs text-muted-foreground">Sorvete do Mickey</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* RESTAURANTES UNIVERSAL */}
          <AccordionItem value="restaurantes-universal" className="border rounded-xl bg-card shadow-sm" data-section="restaurantes-universal">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
                  <Pizza className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">🎢 Restaurantes Universal</h3>
                  <p className="text-sm text-muted-foreground">Universal Studios, Islands of Adventure e Epic Universe</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <Tabs defaultValue="universal-studios" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="universal-studios">🎬 Universal Studios</TabsTrigger>
                    <TabsTrigger value="islands">🏝️ Islands</TabsTrigger>
                    <TabsTrigger value="epic">✨ Epic Universe</TabsTrigger>
                  </TabsList>

                  {/* Universal Studios */}
                  <TabsContent value="universal-studios" className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-amber-600 text-white">🧙 Harry Potter</Badge>
                            <Badge variant="outline">Imperdível</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Leaky Cauldron</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Pub bruxo em Diagon Alley! Fish and chips, shepherd's pie, bangers and mash. Cerveja amanteigada gelada ou quente!
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🍺 Butterbeer</Badge>
                            <Badge variant="secondary" className="text-xs">🇬🇧 Britânico</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-yellow-500/20 bg-yellow-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-yellow-500 text-white">🍩 Simpsons</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Moe's Tavern & Fast Food Blvd</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Springfield inteira! Krusty Burger, Flaming Moe's, donuts do Lard Lad (gigantes!). Muito divertido!
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🍔 Fast Food</Badge>
                            <Badge variant="secondary" className="text-xs">😂 Divertido</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-500/20 bg-green-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-green-600 text-white">Italiano</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Lombard's Seafood Grille</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Frutos do mar e pratos italianos. Um dos melhores restaurantes de mesa do parque. Vista para a lagoa.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🦞 Frutos do Mar</Badge>
                            <Badge variant="secondary" className="text-xs">Mesa</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="w-fit">🎬 Clássico</Badge>
                          <CardTitle className="text-base mt-2">Finnegan's Bar & Grill</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Pub irlandês! Fish and chips, Irish stew. Música ao vivo às vezes. Cervejas importadas.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Islands of Adventure */}
                  <TabsContent value="islands" className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-amber-600 text-white">🧙 Harry Potter</Badge>
                            <Badge variant="outline">⭐ Favorito</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Three Broomsticks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Taverna em Hogsmeade! Shepherd's pie, fish and chips, Great Feast para compartilhar. Butterbeer obrigatória!
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🍺 Butterbeer</Badge>
                            <Badge variant="secondary" className="text-xs">🏰 Hogsmeade</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-500/20 bg-green-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-green-600 text-white">🦖 Jurássico</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Thunder Falls Terrace</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Vista para a queda d'água do Jurassic River Adventure! Rotisserie chicken, ribs. Ambiente temático incrível.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🍗 BBQ</Badge>
                            <Badge variant="secondary" className="text-xs">👀 Vista</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-500/20 bg-blue-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-blue-600 text-white">🦸 Marvel</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Captain America Diner</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Hambúrgueres e pratos americanos em ambiente de HQ Marvel. Encontre os heróis por perto!
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🍔 Hambúrguer</Badge>
                            <Badge variant="secondary" className="text-xs">Fast Food</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <Badge variant="outline" className="w-fit">🍽️ Mesa</Badge>
                          <CardTitle className="text-base mt-2">Mythos Restaurant</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Considerado um dos melhores restaurantes de parque temático do MUNDO! Decoração de caverna, menu mediterrâneo.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Epic Universe */}
                  <TabsContent value="epic" className="mt-4 space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
                      <p className="text-sm"><strong>✨ NOVO 2025:</strong> Epic Universe traz restaurantes temáticos incríveis em cada mundo!</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-red-500/20 bg-red-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-red-500 text-white">🍄 Nintendo</Badge>
                            <Badge variant="outline">Imperdível</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Toadstool Cafe</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Restaurante do Toad em Super Nintendo World! Pratos criativos inspirados nos jogos. Decoração mágica!
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🎮 Nintendo</Badge>
                            <Badge variant="secondary" className="text-xs">📸 Fotos</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-500/20 bg-purple-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-purple-600 text-white">🧙 Harry Potter</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">The Ministry Cafe</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            No Ministério da Magia! Pratos britânicos com toque mágico. Ambiente de escritórios do Ministério.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🪄 Mágico</Badge>
                            <Badge variant="secondary" className="text-xs">🇬🇧 Britânico</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-500/20 bg-green-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-green-600 text-white">🐉 Dragons</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">The Great Hall of Berk</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Em How to Train Your Dragon! Salão viking imponente. Pratos inspirados na cultura nórdica.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">⚔️ Viking</Badge>
                            <Badge variant="secondary" className="text-xs">🍖 Carnes</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-gray-500/20 bg-gray-500/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-gray-600 text-white">🧛 Dark Universe</Badge>
                          </div>
                          <CardTitle className="text-base mt-2">Das Stakehaus</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Restaurante gótico em Dark Universe! Steaks e pratos europeus em ambiente sombrio e elegante.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">🥩 Steak</Badge>
                            <Badge variant="secondary" className="text-xs">🌙 Gótico</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator />

                {/* Snacks Universal */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🍺 Snacks Imperdíveis Universal</h4>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">🍺</p>
                      <p className="font-medium text-sm">Butterbeer</p>
                      <p className="text-xs text-muted-foreground">Cerveja amanteigada</p>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">🍩</p>
                      <p className="font-medium text-sm">Lard Lad Donuts</p>
                      <p className="text-xs text-muted-foreground">Donuts gigantes</p>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">🍄</p>
                      <p className="font-medium text-sm">Super Mushroom</p>
                      <p className="text-xs text-muted-foreground">Snacks Nintendo</p>
                    </div>
                    <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">🧙</p>
                      <p className="font-medium text-sm">Pumpkin Juice</p>
                      <p className="text-xs text-muted-foreground">Suco de abóbora</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SEGURO VIAGEM */}
          <AccordionItem value="seguro" className="border rounded-xl bg-card shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">🏥 Seguro Viagem</h3>
                  <p className="text-sm text-muted-foreground">Por que é essencial ter um seguro</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-sm font-medium">⚠️ A saúde nos EUA é MUITO cara!</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Não existe sistema público de saúde. Uma simples consulta pode custar $200-500. Emergência? Milhares de dólares.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-center">
                    <p className="font-bold text-red-500">$200-500</p>
                    <p className="text-xs text-muted-foreground">Consulta médica</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-center">
                    <p className="font-bold text-red-500">$1.000+</p>
                    <p className="text-xs text-muted-foreground">Raio-X simples</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-center">
                    <p className="font-bold text-red-500">$5.000+</p>
                    <p className="text-xs text-muted-foreground">Emergência</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-center">
                    <p className="font-bold text-red-500">$50.000+</p>
                    <p className="text-xs text-muted-foreground">Internação</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">O que geralmente está incluso:</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 bg-green-500/10 rounded-lg p-3 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      Despesas médicas hospitalares
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 rounded-lg p-3 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      Coberturas odontológicas
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 rounded-lg p-3 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      Cobertura farmacêutica
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 rounded-lg p-3 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      Repatriação
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 rounded-lg p-3 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      Extravio de bagagem
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 rounded-lg p-3 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      Cancelamento de viagem
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-sm"><strong>⚠️ Atenção:</strong> Consultas de rotina e medicamentos habituais geralmente NÃO são cobertos, exceto em emergências.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* EMERGÊNCIAS */}
          <AccordionItem value="emergencias" className="border rounded-xl bg-card shadow-sm" data-section="emergencias">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">🆘 Emergências e Contatos</h3>
                  <p className="text-sm text-muted-foreground">Números importantes e o que fazer em emergências</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Números de Emergência */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-500">📞 Números de Emergência</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <p className="text-3xl font-bold text-red-500">911</p>
                      <p className="text-sm font-medium">Emergência Geral</p>
                      <p className="text-xs text-muted-foreground">Polícia, bombeiros, ambulância</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-lg font-bold text-blue-500">+1 (407) 608-0080</p>
                      <p className="text-sm font-medium">Consulado do Brasil</p>
                      <p className="text-xs text-muted-foreground">355 N Orange Ave, Orlando</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Hospitais */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🏥 Hospitais Próximos aos Parques</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">AdventHealth Celebration</CardTitle>
                        <CardDescription>Perto da Disney</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">400 Celebration Place, Celebration, FL</p>
                        <p className="text-xs">Tel: (407) 303-4000</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Dr. Phillips Hospital</CardTitle>
                        <CardDescription>Perto da Universal</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">9400 Turkey Lake Rd, Orlando, FL</p>
                        <p className="text-xs">Tel: (407) 351-8500</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Farmácias 24h */}
                <div className="space-y-3">
                  <h4 className="font-semibold">💊 Farmácias 24 Horas</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-green-500/10 rounded-lg p-3">
                      <p className="font-medium text-sm">Walgreens</p>
                      <p className="text-xs text-muted-foreground">Várias unidades 24h em Orlando</p>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-3">
                      <p className="font-medium text-sm">CVS Pharmacy</p>
                      <p className="text-xs text-muted-foreground">Várias unidades 24h em Orlando</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Perda de Documentos */}
                <div className="space-y-3">
                  <h4 className="font-semibold">📄 Perda de Documentos</h4>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><strong>Passaporte perdido:</strong> Vá ao Consulado do Brasil para emissão de documento de viagem</p>
                    <p className="text-sm"><strong>Cartão de crédito:</strong> Ligue para o banco imediatamente para bloquear</p>
                    <p className="text-sm"><strong>Celular:</strong> Registre boletim de ocorrência e acione seguro</p>
                  </div>
                </div>

                <Separator />

                {/* Apps Úteis */}
                <div className="space-y-3">
                  <h4 className="font-semibold">📱 Apps Úteis para Emergência</h4>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-medium text-sm">Google Translate</p>
                      <p className="text-xs text-muted-foreground">Tradução instantânea</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-medium text-sm">Uber / Lyft</p>
                      <p className="text-xs text-muted-foreground">Transporte rápido</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-medium text-sm">Google Maps</p>
                      <p className="text-xs text-muted-foreground">Navegação offline</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </AppLayout>
  );
};

export default TravelGuide;
