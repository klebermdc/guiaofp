import { Book, Car, Plane, ShoppingBag, MapPin, Utensils, Backpack, FileText, CreditCard, Ruler, Store, Pill, Tag, Crown, Sparkles, AlertTriangle, Info, CheckCircle2, ChevronDown } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

const TravelGuide = () => {
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
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">🚗 Locomoção</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">✈️ Aeroporto</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">🛒 Compras</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">🎢 Parques</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">🎒 Mochila</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">📏 Medidas</Badge>
            </div>
          </CardContent>
        </Card>

        <Accordion type="multiple" className="space-y-4">
          {/* LOCOMOÇÃO */}
          <AccordionItem value="locomocao" className="border rounded-xl bg-card shadow-sm">
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
                  <h4 className="font-semibold">🚦 Regras de Trânsito</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• <strong>Cruzamentos sem farol:</strong> Passa quem chegar primeiro</p>
                    <p>• <strong>Sinal fechado:</strong> Pode dobrar à direita olhando os carros e pedestres</p>
                    <p>• <strong>NO TURN ON RED:</strong> Se tiver essa placa, não pode dobrar à direita</p>
                    <p>• <strong>Cinto de segurança:</strong> Obrigatório para TODOS (inclusive banco traseiro)</p>
                    <p>• <strong>Siglas nas placas:</strong> N (Norte), S (Sul), E (Leste), W (Oeste)</p>
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
          <AccordionItem value="aeroporto" className="border rounded-xl bg-card shadow-sm">
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
                  <div className="space-y-2 text-muted-foreground">
                    <p>• <strong>Peso máximo:</strong> Geralmente 23kg por mala (consulte a companhia)</p>
                    <p>• <strong>Compras de roupas:</strong> Não leve a mala com peso máximo na ida</p>
                    <p>• <strong>Balança:</strong> Compre uma no Walmart (~$10) para acompanhar o peso</p>
                    <p>• <strong>Cadeados:</strong> Use para proteção extra</p>
                    <p>• <strong>Roupas e sapatos confortáveis:</strong> Você vai andar muito!</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* MOCHILA PARA O PARQUE */}
          <AccordionItem value="mochila" className="border rounded-xl bg-card shadow-sm">
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
                  </div>
                </div>

                <Separator />

                {/* Itens Essenciais */}
                <div className="space-y-3">
                  <h4 className="font-semibold">✅ Itens Essenciais</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <span className="text-lg">☀️</span>
                      <div>
                        <p className="font-medium text-sm">Protetor Solar</p>
                        <p className="text-xs text-muted-foreground">O sol pode ser bem forte em Orlando</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <span className="text-lg">💊</span>
                      <div>
                        <p className="font-medium text-sm">Nécessaire de Remédios</p>
                        <p className="text-xs text-muted-foreground">Dor de cabeça, cólica, dor muscular</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <span className="text-lg">🧥</span>
                      <div>
                        <p className="font-medium text-sm">Casaco</p>
                        <p className="text-xs text-muted-foreground">A temperatura pode cair no final do dia</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <span className="text-lg">🕶️</span>
                      <div>
                        <p className="font-medium text-sm">Óculos de Sol</p>
                        <p className="text-xs text-muted-foreground">Proteção e conforto</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <span className="text-lg">🧢</span>
                      <div>
                        <p className="font-medium text-sm">Boné ou Chapéu</p>
                        <p className="text-xs text-muted-foreground">Proteção extra do sol</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <span className="text-lg">🌧️</span>
                      <div>
                        <p className="font-medium text-sm">Capa de Chuva</p>
                        <p className="text-xs text-muted-foreground">Para atrações que molham e chuvas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <span className="text-lg">👕</span>
                      <div>
                        <p className="font-medium text-sm">Troca de Roupas</p>
                        <p className="text-xs text-muted-foreground">Para crianças ou atrações que molham</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <span className="text-lg">🔋</span>
                      <div>
                        <p className="font-medium text-sm">Carregador Portátil</p>
                        <p className="text-xs text-muted-foreground">Bateria extra para o celular</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <span className="text-lg">🩹</span>
                      <div>
                        <p className="font-medium text-sm">Band-aid</p>
                        <p className="text-xs text-muted-foreground">Para bolhas e pequenos machucados</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                      <span className="text-lg">✏️</span>
                      <div>
                        <p className="font-medium text-sm">Caneta</p>
                        <p className="text-xs text-muted-foreground">Para autógrafos dos personagens!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Crianças */}
                <div className="space-y-3">
                  <h4 className="font-semibold">👶 Para Crianças Pequenas</h4>
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
                  <Utensils className="w-5 h-5 text-orange-500" />
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

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">🧀 Frios</h5>
                    <p className="text-sm text-muted-foreground">Queijo, presunto, peito de peru defumado, salame</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">🍞 Pães</h5>
                    <p className="text-sm text-muted-foreground">Pão de forma, pão brioche, pães integrais</p>
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
                    <h5 className="font-medium mb-2">🥛 Leite e Achocolatados</h5>
                    <p className="text-sm text-muted-foreground">Leite, Nescau, Danone, iogurtes</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* COMPRAS */}
          <AccordionItem value="compras" className="border rounded-xl bg-card shadow-sm">
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
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm">• <strong>Imposto:</strong> 6,5% sobre qualquer compra (exceto alimentos nos mercados)</p>
                    <p className="text-sm">• <strong>Separe pelo menos 2 dias</strong> inteiros para compras</p>
                    <p className="text-sm">• Prefira ir primeiro nos <strong>outlets</strong> e depois nos shoppings</p>
                    <p className="text-sm">• Souvenirs Disney: encontre mais barato no <strong>Walmart e Target</strong></p>
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
                    Outlets
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card className="border-green-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Orlando International Premium Outlets</CardTitle>
                        <CardDescription>O maior outlet com todas as marcas</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Nike, Adidas, Victoria Secrets, Polo Ralph Lauren, Carter's, Levi's, Lacoste, New Balance, Skechers e muitas outras</p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Orlando Vineland Premium Outlets</CardTitle>
                        <CardDescription>Mesmas lojas, geralmente mais vazio</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Praticamente as mesmas lojas do Internacional. Bom para compras mais tranquilas</p>
                      </CardContent>
                    </Card>
                    <Card className="border-muted">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Lake Buena Vista Factory Stores</CardTitle>
                        <CardDescription>Pequeno mas prático</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Menor variedade, mas bom para compras rápidas</p>
                      </CardContent>
                    </Card>
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
                      <h5 className="font-bold">Walmart</h5>
                      <p className="text-sm text-muted-foreground">Parada obrigatória para snacks, água, café da manhã e muito mais. Variedade gigante com preços baixos.</p>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-4">
                      <h5 className="font-bold">Target</h5>
                      <p className="text-sm text-muted-foreground">Destaque para cosméticos, roupas e brinquedos. Excelente qualidade.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Lojas de Departamento */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🏬 Lojas de Departamento</h4>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="font-medium">Ross</p>
                      <p className="text-xs text-muted-foreground">Garimpo de achados</p>
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
                </div>

                <Separator />

                {/* Farmácias */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Pill className="w-4 h-4 text-green-500" />
                    Farmácias
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    CVS e Walgreens são como mini mercados. Além de remédios, você encontra alimentos, perfumes, cosméticos e vitaminas.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* TABELA DE MEDIDAS */}
          <AccordionItem value="medidas" className="border rounded-xl bg-card shadow-sm">
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

                {/* Calçados */}
                <div className="space-y-3">
                  <h4 className="font-semibold">👟 Calçados Femininos</h4>
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
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* DICAS DOS PARQUES DISNEY */}
          <AccordionItem value="parques-disney" className="border rounded-xl bg-card shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">🏰 Dicas Gerais dos Parques Disney</h3>
                  <p className="text-sm text-muted-foreground">Ingressos, Multi Pass, Lightning Lane e mais</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Dicas Gerais */}
                <div className="space-y-3">
                  <h4 className="font-semibold">📋 Dicas Gerais</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">📸 Tire foto da localização do carro no estacionamento</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">🍿 Baldes de pipoca: $14-$24 + refil por $2,25</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">🏅 Pegue os Bottons de celebração no Guest Relations</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">🚭 Proibido fumar dentro dos parques</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Ingressos */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🎫 Ingressos Disney</h4>
                  <p className="text-muted-foreground text-sm">
                    Os Ingressos (voucher) devem ser trocados pelos Ingressos físicos no dia do parque ou no dia anterior.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><strong>📍 Locais para troca:</strong></p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      <li>Ticket Center no Disney Springs (atrás da Zara)</li>
                      <li>Balcão Will Call ao lado das bilheteiras dos parques</li>
                    </ul>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><strong>🚪 4 formas de entrar nos parques:</strong></p>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside">
                      <li>Cartão físico</li>
                      <li>Magic Band vinculada no App</li>
                      <li>Relógio smart ou celular (Magic Mobile)</li>
                      <li>App My Disney Experience</li>
                    </ol>
                  </div>
                </div>

                <Separator />

                {/* Multi Pass */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Multi Pass
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

                {/* Lightning Lane Single Pass */}
                <div className="space-y-3">
                  <h4 className="font-semibold">⚡ Lightning Lane Single Pass</h4>
                  <p className="text-muted-foreground text-sm">
                    Algumas atrações especiais que você compra à parte (não entram no Multi Pass). Limite de 1 atração por dia por pessoa.
                  </p>
                </div>

                <Separator />

                {/* Single Rider */}
                <div className="space-y-3">
                  <h4 className="font-semibold">🎢 Single Rider</h4>
                  <p className="text-muted-foreground text-sm">
                    Fila mais rápida para quem não se importa em sentar sozinho (você não vai ao lado do seu amigo).
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
                          <td className="px-3 py-2">Rock n'Roller Coaster, Millennium Falcon</td>
                        </tr>
                        <tr className="border-t">
                          <td className="px-3 py-2 font-medium">Epcot</td>
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
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SEGURO VIAGEM */}
          <AccordionItem value="seguro" className="border rounded-xl bg-card shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-red-500" />
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
                  <p className="text-sm font-medium">⚠️ A saúde nos EUA é muito cara!</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Não existe sistema público de saúde. Uma simples consulta ou atendimento de emergência pode custar milhares de dólares.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">O que geralmente está incluso:</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">✓ Despesas médicas hospitalares</div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">✓ Coberturas odontológicas</div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">✓ Cobertura para gestantes</div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">✓ Cobertura farmacêutica</div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">✓ Repatriação</div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">✓ Auxílio para atrasos de voos</div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">✓ Extravio de bagagem</div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">✓ Cancelamento de viagem</div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-sm"><strong>⚠️ Atenção:</strong> Consultas de rotina e medicamentos habituais (anti-hipertensivos, anticoncepcionais, etc.) geralmente NÃO são cobertos, exceto em emergências.</p>
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
