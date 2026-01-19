import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TutorialSection } from "@/components/multipass/TutorialSection";
import { 
  Zap, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  DollarSign,
  Users,
  MapPin,
  Star,
  Target,
  Lightbulb,
  HelpCircle,
  Castle,
  Rocket,
  Film,
  TreePine,
  Shuffle
} from "lucide-react";

// Dados das atrações por parque
const parkData = {
  magicKingdom: {
    name: "Magic Kingdom",
    icon: Castle,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    multiPassPrice: "US$ 20-45",
    singlePass: [
      { name: "TRON Lightcycle / Run", price: "US$ 19-22", height: "1,22m" },
      { name: "Seven Dwarfs Mine Train", price: "US$ 10-14", height: "0,97m" }
    ],
    grupo1: [
      "Tiana's Bayou Adventure",
      "Jungle Cruise",
      "Peter Pan's Flight",
      "Space Mountain"
    ],
    grupo2: [
      "The Many Adventures of Winnie the Pooh",
      "Haunted Mansion",
      "Mickey's PhilharMagic",
      "Tomorrowland Speedway",
      "Pirates of the Caribbean",
      "Monsters Inc. Laugh Floor",
      "The Barnstormer",
      "Buzz Lightyear's Space Ranger Spin",
      "Under the Sea",
      "The Magic Carpets of Aladdin",
      "Mad Tea Party",
      "it's a small world",
      "Dumbo the Flying Elephant"
    ],
    strategy: {
      grupo1Tip: "A Tiana's Bayou Adventure é a mais concorrida. Agende com antecedência junto com Peter Pan's Flight.",
      grupo2Tip: "Priorize Pirates of the Caribbean e Haunted Mansion. São as mais concorridas do grupo.",
      dayTip: "Horários mágicos para Tiana's: 09:47, 11:47, 13:47. Fique de olho!",
      order: ["Adventureland", "Frontierland", "Liberty Square", "Tomorrowland", "Fantasyland"]
    }
  },
  epcot: {
    name: "EPCOT",
    icon: Rocket,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    multiPassPrice: "US$ 15-37",
    singlePass: [
      { name: "Guardians of the Galaxy: Cosmic Rewind", price: "US$ 14-19", height: "1,07m" }
    ],
    grupo1: [
      "Remy's Ratatouille Adventure",
      "Frozen Ever After",
      "Test Track"
    ],
    grupo2: [
      "Mission: SPACE",
      "Turtle Talk with Crush",
      "Journey into Imagination with Figment",
      "Spaceship Earth",
      "The Seas with Nemo & Friends",
      "Living with the Land",
      "Disney and Pixar Short Film Festival",
      "Soarin' Around the World"
    ],
    strategy: {
      grupo1Tip: "É praticamente impossível agendar as 3 do Grupo 1 no mesmo dia. Escolha a mais importante para você.",
      grupo2Tip: "Soarin' Around the World e Mission: SPACE são as mais concorridas. Priorize-as.",
      dayTip: "Se entrar pela entrada lateral (Skyliner), agende Remy's para cedo. Frozen tem horários mágicos às 09:17 e 13:17.",
      order: ["World Celebration/Nature/Discovery (manhã)", "World Showcase - Países (tarde)"]
    }
  },
  hollywoodStudios: {
    name: "Hollywood Studios",
    icon: Film,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    multiPassPrice: "US$ 20-39",
    singlePass: [
      { name: "Star Wars: Rise of the Resistance", price: "US$ 20-25", height: "1,02m" }
    ],
    grupo1: [
      "Slinky Dog Dash",
      "Rock 'n' Roller Coaster Starring Aerosmith",
      "Mickey & Minnie's Runaway Railway",
      "Millennium Falcon: Smugglers Run"
    ],
    grupo2: [
      "Toy Story Mania!",
      "Indiana Jones Epic Stunt Spectacular!",
      "The Twilight Zone Tower of Terror",
      "Beauty and the Beast - Live on Stage",
      "For the First Time in Forever: A Frozen Sing-Along Celebration",
      "Alien Swirling Saucers",
      "Star Tours - The Adventures Continue"
    ],
    strategy: {
      grupo1Tip: "Slinky Dog Dash é a mais concorrida. Deixe este parque para o final da viagem para ter mais antecedência.",
      grupo2Tip: "Tower of Terror e Toy Story Mania são essenciais. Priorize horários pela manhã.",
      dayTip: "Horários mágicos para Slinky: 13:17 e 15:47. Rise of the Resistance: agende para início da tarde.",
      order: ["Não siga ordem por área - priorize os agendamentos independente da localização"]
    }
  },
  animalKingdom: {
    name: "Animal Kingdom",
    icon: TreePine,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    multiPassPrice: "US$ 15-35",
    singlePass: [
      { name: "Avatar Flight of Passage", price: "US$ 13-18", height: "1,12m" }
    ],
    grupo1: [], // Animal Kingdom não tem divisão de grupos
    grupo2: [
      "Na'vi River Journey",
      "Festival of the Lion King",
      "Feathered Friends in Flight!",
      "Kali River Rapids",
      "Finding Nemo: The Big Blue… and Beyond!",
      "Expedition Everest",
      "DINOSAUR",
      "Kilimanjaro Safaris"
    ],
    strategy: {
      grupo1Tip: "Animal Kingdom não possui restrição de grupos! Você pode escolher qualquer atração.",
      grupo2Tip: "Priorize Na'vi River Journey, Kilimanjaro Safaris e Expedition Everest.",
      dayTip: "Agende Avatar Flight of Passage próximo à Na'vi River Journey. Festival of the Lion King é imperdível!",
      order: ["Pandora → Safari → Lion King → Everest → Kali River → Dinosaur"]
    }
  }
};

const MultiPass = () => {
  const [selectedPark, setSelectedPark] = useState<keyof typeof parkData>("magicKingdom");

  return (
    <AppLayout>
      <div className="space-y-8 pb-24">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Zap className="h-5 w-5" />
            <span className="font-medium">Guia Completo</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Lightning Lane Multi Pass
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Aprenda como funciona o sistema de filas rápidas da Disney e domine as estratégias para aproveitar ao máximo seu dia nos parques.
          </p>
        </div>

        {/* Conceitos Básicos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            Conceitos Importantes
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Stand-By (Fila Normal)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fila tradicional onde você espera o tempo normal. A Disney informa o tempo estimado na entrada, mas pode variar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Lightning Lane (Fila Rápida)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fila preferencial com prioridade de acesso. O tempo de espera é praticamente inexistente na maioria dos casos.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dicionário */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dicionário de Siglas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { sigla: "LL", desc: "Lightning Lane" },
                  { sigla: "MP", desc: "Multi Pass" },
                  { sigla: "SP", desc: "Single Pass" },
                  { sigla: "MDE", desc: "My Disney Experience" },
                  { sigla: "MK", desc: "Magic Kingdom" },
                  { sigla: "EP", desc: "EPCOT" },
                  { sigla: "DHS", desc: "Hollywood Studios" },
                  { sigla: "DAK", desc: "Animal Kingdom" }
                ].map((item) => (
                  <div key={item.sigla} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Badge variant="secondary" className="font-mono">{item.sigla}</Badge>
                    <span className="text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Multi Pass vs Single Pass */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Tipos de Passes
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Multi Pass (MP)
                  </CardTitle>
                  <Badge className="bg-primary">Recomendado</Badge>
                </div>
                <CardDescription>
                  Permite agendar múltiplas atrações por dia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Preços por parque (+ 6,5% imposto):</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-blue-500/10 rounded">
                      <span>Magic Kingdom</span>
                      <span className="font-bold">$20-45</span>
                    </div>
                    <div className="flex justify-between p-2 bg-purple-500/10 rounded">
                      <span>EPCOT</span>
                      <span className="font-bold">$15-37</span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-500/10 rounded">
                      <span>Hollywood Studios</span>
                      <span className="font-bold">$20-39</span>
                    </div>
                    <div className="flex justify-between p-2 bg-green-500/10 rounded">
                      <span>Animal Kingdom</span>
                      <span className="font-bold">$15-35</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Agende até 3 atrações com antecedência</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Continue agendando novas atrações após entrar em cada uma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <span>Não inclui algumas atrações exclusivas (Single Pass)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Single Pass (SP)
                </CardTitle>
                <CardDescription>
                  Compra individual para atrações específicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Atrações exclusivas (+ 6,5% imposto):</p>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-muted/50 rounded space-y-1">
                      <div className="font-medium text-blue-400">Magic Kingdom</div>
                      <div className="flex justify-between"><span>TRON Lightcycle / Run</span><span>$19-22</span></div>
                      <div className="flex justify-between"><span>Seven Dwarfs Mine Train</span><span>$10-14</span></div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded space-y-1">
                      <div className="font-medium text-purple-400">EPCOT</div>
                      <div className="flex justify-between"><span>Guardians of the Galaxy</span><span>$14-19</span></div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded space-y-1">
                      <div className="font-medium text-red-400">Hollywood Studios</div>
                      <div className="flex justify-between"><span>Rise of the Resistance</span><span>$20-25</span></div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded space-y-1">
                      <div className="font-medium text-green-400">Animal Kingdom</div>
                      <div className="flex justify-between"><span>Avatar Flight of Passage</span><span>$13-18</span></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-yellow-500/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span>Limite de 2 Single Pass por dia de visita</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quando Comprar */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Quando Comprar
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Castle className="h-5 w-5" />
                  Hóspedes Disney
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-green-400">7 dias antes</div>
                <p className="text-sm text-muted-foreground">
                  Abertura 7 dias antes do check-in, para todo o período de hospedagem.
                </p>
                <div className="p-3 bg-green-500/10 rounded-lg text-sm">
                  <strong>Vantagem:</strong> Maior antecedência = mais opções de horários e atrações disponíveis!
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  Não Hóspedes Disney
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold">3 dias antes</div>
                <p className="text-sm text-muted-foreground">
                  Ingressos datados: 3 dias antes da data inicial, para todo o período válido.
                </p>
                <p className="text-sm text-muted-foreground">
                  Ingressos não-datados: 3 dias antes de cada visita individual.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-bold text-lg">Horário de Abertura: 07:00 de Orlando</p>
                  <p className="text-sm text-muted-foreground">
                    Esteja pronto às 7h (horário de Orlando) no dia da abertura para garantir os melhores horários!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Regras de Agendamento */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Regras de Agendamento
          </h2>

          <div className="grid gap-4">
            {/* Sistema de Grupos */}
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Grupos (MK, EPCOT, DHS)</CardTitle>
                <CardDescription>
                  Magic Kingdom, EPCOT e Hollywood Studios dividem as atrações em dois grupos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary">Grupo 1</Badge>
                      <span className="text-sm text-muted-foreground">Mais concorridas</span>
                    </div>
                    <p className="text-sm">
                      Você pode agendar apenas <strong>1 atração</strong> deste grupo com antecedência.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Grupo 2</Badge>
                      <span className="text-sm text-muted-foreground">Demais atrações</span>
                    </div>
                    <p className="text-sm">
                      Você pode agendar até <strong>2 atrações</strong> deste grupo com antecedência.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span><strong>Animal Kingdom</strong> não possui essa restrição! Todas as atrações estão disponíveis sem divisão de grupos.</span>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-yellow-500/10 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span>A restrição de grupos cai assim que você entra na sua primeira atração agendada no dia!</span>
                </div>
              </CardContent>
            </Card>

            {/* Overlap */}
            <Card>
              <CardHeader>
                <CardTitle>Overlap (Sobreposição de Horários)</CardTitle>
                <CardDescription>
                  Seus agendamentos não podem se sobrepor dentro de um intervalo de 40-60 minutos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Embora o agendamento seja para um horário específico, você tem uma <strong>janela de 1 hora</strong> para entrar na atração.
                </p>
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <strong>Exemplo:</strong> Se você agendou Space Mountain para as 10h, pode entrar entre 10h e 11h.
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-primary/10 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                  <span><strong>Dica:</strong> A partir da meia-noite do dia da visita, a restrição de overlap deixa de existir. Você pode agendar várias atrações para o mesmo horário!</span>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-yellow-500/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span>Reservas de restaurantes também causam overlap! O intervalo mínimo é de aproximadamente 1h15.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Estratégias por Parque */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Estratégias por Parque
          </h2>

          <Tabs value={selectedPark} onValueChange={(v) => setSelectedPark(v as keyof typeof parkData)}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto">
              {Object.entries(parkData).map(([key, park]) => {
                const Icon = park.icon;
                return (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    className={`flex flex-col gap-1 py-3 data-[state=active]:${park.bgColor}`}
                  >
                    <Icon className={`h-5 w-5 ${park.color}`} />
                    <span className="text-xs">{park.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(parkData).map(([key, park]) => {
              const Icon = park.icon;
              return (
                <TabsContent key={key} value={key} className="mt-4 space-y-4">
                  {/* Header do Parque */}
                  <Card className={`${park.borderColor} border-2`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Icon className={`h-6 w-6 ${park.color}`} />
                          {park.name}
                        </CardTitle>
                        <Badge className={park.bgColor}>
                          Multi Pass: {park.multiPassPrice}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Single Pass */}
                      {park.singlePass.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            Single Pass (compra separada)
                          </h4>
                          <div className="grid gap-2">
                            {park.singlePass.map((sp) => (
                              <div key={sp.name} className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg text-sm">
                                <div>
                                  <span className="font-medium">{sp.name}</span>
                                  <span className="text-muted-foreground ml-2">• Altura mín: {sp.height}</span>
                                </div>
                                <Badge variant="outline">{sp.price}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Grupos */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {park.grupo1.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Badge className="bg-primary">Grupo 1</Badge>
                              <span className="text-sm text-muted-foreground">(máx. 1 prévia)</span>
                            </h4>
                            <ul className="space-y-1">
                              {park.grupo1.map((attraction, i) => (
                                <li key={i} className="text-sm flex items-center gap-2 p-2 bg-primary/5 rounded">
                                  <span className="text-primary font-bold">{i + 1}.</span>
                                  {attraction}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Badge variant="secondary">Grupo 2</Badge>
                            <span className="text-sm text-muted-foreground">
                              {park.grupo1.length > 0 ? "(máx. 2 prévias)" : "(todas as atrações)"}
                            </span>
                          </h4>
                          <ul className="space-y-1 max-h-60 overflow-y-auto">
                            {park.grupo2.map((attraction, i) => (
                              <li key={i} className="text-sm flex items-center gap-2 p-2 bg-muted/30 rounded">
                                <span className="text-muted-foreground">{i + 1}.</span>
                                {attraction}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dicas Estratégicas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Estratégia Recomendada
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {park.grupo1.length > 0 && (
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <p className="text-sm font-medium text-primary mb-1">Grupo 1:</p>
                          <p className="text-sm">{park.strategy.grupo1Tip}</p>
                        </div>
                      )}
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-1">Grupo 2:</p>
                        <p className="text-sm">{park.strategy.grupo2Tip}</p>
                      </div>
                      <div className="p-3 bg-yellow-500/10 rounded-lg">
                        <p className="text-sm font-medium text-yellow-600 mb-1">💡 Dica do Dia:</p>
                        <p className="text-sm">{park.strategy.dayTip}</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <p className="text-sm font-medium text-green-600 mb-1">📍 Ordem Sugerida:</p>
                        <p className="text-sm">{park.strategy.order.join(" → ")}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </section>

        {/* Park Hopper */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shuffle className="h-6 w-6 text-primary" />
            Park Hopper
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Visitando mais de um parque no mesmo dia</CardTitle>
              <CardDescription>
                O Park Hopper permite trocar de parque ao longo do dia com ingresso especial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Multi Pass com Hopper</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Compre o MP para o primeiro parque que visitará</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Todas as 3 atrações prévias devem ser do primeiro parque</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Após entrar na primeira atração, pode agendar em outros parques</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Single Pass com Hopper</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>SP permite agendamentos em diferentes parques no mesmo dia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span>Limite de 2 SP por dia continua valendo</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Desvantagens do Park Hopper
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>• Apenas o primeiro parque tem agendamentos garantidos com antecedência</li>
                  <li>• Atrações populares podem estar esgotadas nos parques seguintes</li>
                  <li>• O app MDE sempre volta para Magic Kingdom ao atualizar - mais confuso</li>
                  <li>• Processo pode ser cansativo para primeira viagem</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tutoriais no App */}
        <TutorialSection />

        {/* Mandamentos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Mandamentos do Método
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Clock, tip: "Chegue cedo e já comece nas atrações - deixe fotos e lojas para depois" },
              { icon: Calendar, tip: "Agende pelo menos 2 atrações para o início do dia, próximo da abertura" },
              { icon: MapPin, tip: "Estude o mapa dos parques e tente fazer por áreas para economizar tempo" },
              { icon: Users, tip: "Prefira refeições com personagens ao invés de filas para encontros" },
              { icon: Target, tip: "Priorize agendar atrações com maiores tempos de fila" },
              { icon: Lightbulb, tip: "Tente melhorar horários ruins no próprio dia, antes do parque abrir" }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={i} className="border-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm">{item.tip}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Perguntas Frequentes
          </h2>

          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="expired" className="border rounded-lg px-4">
              <AccordionTrigger>O que acontece quando expira o horário de uma atração?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-2">
                  As atrações têm um período de 1 hora para você entrar. Após esse horário, o agendamento expira e a Disney libera um novo agendamento automaticamente.
                </p>
                <p className="text-yellow-500">
                  ⚠️ Se expirar antes de você entrar em qualquer atração, o novo agendamento ainda estará sujeito às restrições de grupos!
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tolerance" className="border rounded-lg px-4">
              <AccordionTrigger>Existe tolerância para atrasos?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="space-y-2">
                  <li><strong>Shows:</strong> Não há tolerância - têm horário fixo para começar.</li>
                  <li><strong>Atrações:</strong> Tolerância média de ~15 minutos, podendo ser maior em alta temporada.</li>
                  <li className="text-primary">💡 Dica: Seja educado com os Cast Members - eles têm certa flexibilidade!</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="change-date" className="border rounded-lg px-4">
              <AccordionTrigger>Posso alterar a data da visita após comprar?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>Sim! Você pode alterar:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Data e parque do Multi Pass</li>
                  <li>Data e atração do Single Pass</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="order" className="border rounded-lg px-4">
              <AccordionTrigger>Qual a ordem ideal dos parques na viagem?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-2">Do menos concorrido para o mais concorrido:</p>
                <ol className="space-y-1">
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-400">1º</Badge> Animal Kingdom
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-purple-400">2º</Badge> EPCOT
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-400">3º</Badge> Magic Kingdom
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-red-400">4º</Badge> Hollywood Studios
                  </li>
                </ol>
                <p className="mt-2 text-sm text-primary">
                  Deixar os mais concorridos para o final = maior antecedência nos agendamentos!
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="first-attraction" className="border rounded-lg px-4">
              <AccordionTrigger>Por que é importante entrar cedo na primeira atração?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="space-y-2">
                  <li>✅ A restrição de grupos cai assim que você entra na primeira atração</li>
                  <li>✅ Você libera espaço para agendar novas atrações</li>
                  <li>✅ Quanto mais cedo começar, mais atrações consegue fazer no dia</li>
                  <li className="text-primary">💡 Se alguém do grupo não puder ir, leve o ingresso e passe na entrada mesmo assim para "dar baixa"!</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </AppLayout>
  );
};

export default MultiPass;
