import { useState } from 'react';
import { 
  User, Users, Plane, Hotel, Heart, Smartphone, 
  Accessibility, PartyPopper, Star, ChevronDown, ChevronUp,
  Check, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
}

const sections: Section[] = [
  { id: 'responsible', title: 'Dados do Responsável', icon: User, description: 'Informações de contato principal' },
  { id: 'group', title: 'Composição do Grupo', icon: Users, description: 'Quem vai viajar com você' },
  { id: 'trip', title: 'Dados da Viagem', icon: Plane, description: 'Datas e parques' },
  { id: 'accommodation', title: 'Hospedagem', icon: Hotel, description: 'Onde você vai ficar' },
  { id: 'profile', title: 'Perfil do Grupo', icon: Heart, description: 'Estilo e preferências' },
  { id: 'disney', title: 'Acesso ao App Disney', icon: Smartphone, description: 'My Disney Experience' },
  { id: 'special', title: 'Necessidades Especiais', icon: Accessibility, description: 'Restrições e cuidados' },
  { id: 'celebrations', title: 'Comemorações', icon: PartyPopper, description: 'Datas especiais' },
  { id: 'expectations', title: 'Expectativas', icon: Star, description: 'O que você espera da viagem' },
];

const TravelProfile = () => {
  const { travelProfile, updateTravelProfile } = useAuth();
  const [openSections, setOpenSections] = useState<string[]>(['responsible']);
  const { toast } = useToast();

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSave = () => {
    toast({
      title: "Perfil salvo! ✨",
      description: "Suas informações foram atualizadas com sucesso.",
    });
  };

  const parks = [
    'Magic Kingdom',
    'EPCOT',
    'Hollywood Studios',
    'Animal Kingdom',
    'Universal Studios',
    'Islands of Adventure',
    'SeaWorld',
    'LEGOLAND',
  ];

  const priorities = [
    'Atrações radicais',
    'Experiências em família',
    'Encontro com personagens',
    'Shows e espetáculos',
    'Gastronomia',
    'Compras',
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl gradient-magic p-8 text-accent-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 gradient-gold opacity-20 rounded-full blur-3xl" />
          <div className="relative">
            <h1 className="font-display text-3xl font-bold mb-2">
              📋 Perfil da Minha Viagem
            </h1>
            <p className="text-accent-foreground/80">
              Preencha seu perfil para recebermos roteiro personalizado
            </p>
          </div>
        </div>

        {/* Progress Card */}
        <Card variant="premium">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {travelProfile.completionPercentage >= 100 ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-warning" />
                  )}
                  Progresso do Preenchimento
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quanto mais completo, melhor será seu roteiro
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={travelProfile.completionPercentage} className="w-40 h-3" />
                <span className="font-bold text-lg">{travelProfile.completionPercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const isOpen = openSections.includes(section.id);
            const Icon = section.icon;

            return (
              <Card key={section.id} variant="default">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/50 transition-colors rounded-t-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center text-primary-foreground">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {isOpen && (
                  <CardContent className="pt-0 pb-6 space-y-4 animate-fadeIn">
                    {/* Section 1: Responsible Data */}
                    {section.id === 'responsible' && (
                      <>
                        <div className="space-y-2">
                          <Label>Nome completo do responsável</Label>
                          <Input
                            placeholder="Seu nome completo"
                            value={travelProfile.responsibleName}
                            onChange={(e) => updateTravelProfile({ responsibleName: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>E-mail</Label>
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              value={travelProfile.email}
                              onChange={(e) => updateTravelProfile({ email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>WhatsApp</Label>
                            <Input
                              placeholder="(00) 00000-0000"
                              value={travelProfile.whatsapp}
                              onChange={(e) => updateTravelProfile({ whatsapp: e.target.value })}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Section 2: Group Composition */}
                    {section.id === 'group' && (
                      <>
                        <div className="space-y-2">
                          <Label>Quantas pessoas viajarão?</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Número de viajantes"
                            value={travelProfile.groupSize || ''}
                            onChange={(e) => updateTravelProfile({ groupSize: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            Após informar o número de pessoas, você poderá adicionar os dados de cada viajante: nome, idade, altura e se é a primeira vez na Disney.
                          </p>
                        </div>
                      </>
                    )}

                    {/* Section 3: Trip Data */}
                    {section.id === 'trip' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Data de chegada em Orlando</Label>
                            <Input
                              type="date"
                              value={travelProfile.arrivalDate}
                              onChange={(e) => updateTravelProfile({ arrivalDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Data de saída de Orlando</Label>
                            <Input
                              type="date"
                              value={travelProfile.departureDate}
                              onChange={(e) => updateTravelProfile({ departureDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Quais parques pretende visitar?</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {parks.map((park) => (
                              <div key={park} className="flex items-center space-x-2">
                                <Checkbox
                                  id={park}
                                  checked={travelProfile.parks.includes(park)}
                                  onCheckedChange={(checked) => {
                                    const newParks = checked
                                      ? [...travelProfile.parks, park]
                                      : travelProfile.parks.filter(p => p !== park);
                                    updateTravelProfile({ parks: newParks });
                                  }}
                                />
                                <Label htmlFor={park} className="text-sm cursor-pointer">
                                  {park}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Section 4: Accommodation */}
                    {section.id === 'accommodation' && (
                      <>
                        <div className="space-y-2">
                          <Label>Hotel onde ficará hospedado</Label>
                          <Input
                            placeholder="Nome do hotel"
                            value={travelProfile.hotel}
                            onChange={(e) => updateTravelProfile({ hotel: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo de hotel</Label>
                          <RadioGroup
                            value={travelProfile.hotelType}
                            onValueChange={(value) => updateTravelProfile({ hotelType: value })}
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="disney" id="disney" />
                                <Label htmlFor="disney">Hotel Disney</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="universal" id="universal" />
                                <Label htmlFor="universal">Hotel Universal</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="outside" id="outside" />
                                <Label htmlFor="outside">Fora dos parques</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="space-y-2">
                          <Label>Já possui transporte?</Label>
                          <RadioGroup
                            value={travelProfile.hasTransport ? 'yes' : 'no'}
                            onValueChange={(value) => updateTravelProfile({ hasTransport: value === 'yes' })}
                          >
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="transport-yes" />
                                <Label htmlFor="transport-yes">Sim</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="transport-no" />
                                <Label htmlFor="transport-no">Não</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </>
                    )}

                    {/* Section 5: Group Profile */}
                    {section.id === 'profile' && (
                      <>
                        <div className="space-y-2">
                          <Label>Já visitou parques antes?</Label>
                          <RadioGroup
                            value={travelProfile.visitedBefore ? 'yes' : 'no'}
                            onValueChange={(value) => updateTravelProfile({ visitedBefore: value === 'yes' })}
                          >
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="visited-yes" />
                                <Label htmlFor="visited-yes">Sim</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="visited-no" />
                                <Label htmlFor="visited-no">Não</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="space-y-2">
                          <Label>Estilo do grupo</Label>
                          <RadioGroup
                            value={travelProfile.groupStyle}
                            onValueChange={(value) => updateTravelProfile({ groupStyle: value })}
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="tranquilo" id="tranquilo" />
                                <Label htmlFor="tranquilo">🧘 Tranquilo - Ritmo leve, sem pressa</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="moderado" id="moderado" />
                                <Label htmlFor="moderado">⚖️ Moderado - Equilíbrio entre atrações e descanso</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="intenso" id="intenso" />
                                <Label htmlFor="intenso">🚀 Intenso - Máximo de atrações possível</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="space-y-2">
                          <Label>Prioridades do grupo</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {priorities.map((priority) => (
                              <div key={priority} className="flex items-center space-x-2">
                                <Checkbox
                                  id={priority}
                                  checked={travelProfile.priority.includes(priority)}
                                  onCheckedChange={(checked) => {
                                    const newPriorities = checked
                                      ? [...travelProfile.priority, priority]
                                      : travelProfile.priority.filter(p => p !== priority);
                                    updateTravelProfile({ priority: newPriorities });
                                  }}
                                />
                                <Label htmlFor={priority} className="text-sm cursor-pointer">
                                  {priority}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Section 6: Disney App Access */}
                    {section.id === 'disney' && (
                      <>
                        <div className="space-y-2">
                          <Label>Possui conta no My Disney Experience?</Label>
                          <RadioGroup
                            value={travelProfile.hasMyDisneyExperience ? 'yes' : 'no'}
                            onValueChange={(value) => updateTravelProfile({ hasMyDisneyExperience: value === 'yes' })}
                          >
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="mde-yes" />
                                <Label htmlFor="mde-yes">Sim</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="mde-no" />
                                <Label htmlFor="mde-no">Não</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        {travelProfile.hasMyDisneyExperience && (
                          <>
                            <div className="space-y-2">
                              <Label>E-mail de login do My Disney Experience</Label>
                              <Input
                                type="email"
                                placeholder="email@disney.com"
                                value={travelProfile.myDisneyEmail}
                                onChange={(e) => updateTravelProfile({ myDisneyEmail: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Senha do My Disney Experience</Label>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                value={travelProfile.myDisneyPassword}
                                onChange={(e) => updateTravelProfile({ myDisneyPassword: e.target.value })}
                              />
                            </div>
                            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                              <Checkbox
                                id="authorize"
                                checked={travelProfile.authorizeGuideAccess}
                                onCheckedChange={(checked) => updateTravelProfile({ authorizeGuideAccess: !!checked })}
                              />
                              <Label htmlFor="authorize" className="cursor-pointer">
                                Autorizo o guia a acessar e configurar o aplicativo em meu nome
                              </Label>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* Section 7: Special Needs */}
                    {section.id === 'special' && (
                      <>
                        <div className="space-y-2">
                          <Label>Alguma restrição física ou de saúde?</Label>
                          <Textarea
                            placeholder="Descreva aqui qualquer condição que devemos considerar..."
                            value={travelProfile.physicalRestrictions}
                            onChange={(e) => updateTravelProfile({ physicalRestrictions: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Alguma alergia alimentar?</Label>
                          <Textarea
                            placeholder="Liste alergias ou restrições alimentares..."
                            value={travelProfile.foodAllergies}
                            onChange={(e) => updateTravelProfile({ foodAllergies: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Utiliza carrinho de bebê ou cadeira de rodas?</Label>
                          <Input
                            placeholder="Descreva se necessário..."
                            value={travelProfile.usesStrollerOrWheelchair}
                            onChange={(e) => updateTravelProfile({ usesStrollerOrWheelchair: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* Section 8: Celebrations */}
                    {section.id === 'celebrations' && (
                      <>
                        <div className="space-y-2">
                          <Label>A viagem envolve alguma comemoração especial?</Label>
                          <RadioGroup
                            value={travelProfile.hasCelebration ? 'yes' : 'no'}
                            onValueChange={(value) => updateTravelProfile({ hasCelebration: value === 'yes' })}
                          >
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="celebration-yes" />
                                <Label htmlFor="celebration-yes">Sim</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="celebration-no" />
                                <Label htmlFor="celebration-no">Não</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        {travelProfile.hasCelebration && (
                          <>
                            <div className="space-y-2">
                              <Label>Qual comemoração?</Label>
                              <Input
                                placeholder="Ex: Aniversário, lua de mel, formatura..."
                                value={travelProfile.celebrationType}
                                onChange={(e) => updateTravelProfile({ celebrationType: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Deseja algo especial durante os parques?</Label>
                              <Textarea
                                placeholder="Conte-nos suas ideias..."
                                value={travelProfile.specialRequests}
                                onChange={(e) => updateTravelProfile({ specialRequests: e.target.value })}
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* Section 9: Expectations */}
                    {section.id === 'expectations' && (
                      <>
                        <div className="space-y-2">
                          <Label>O que você mais espera dessa viagem?</Label>
                          <Textarea
                            placeholder="Conte-nos seus sonhos para essa viagem..."
                            value={travelProfile.expectations}
                            onChange={(e) => updateTravelProfile({ expectations: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quais são suas maiores dúvidas ou preocupações?</Label>
                          <Textarea
                            placeholder="O que te deixa apreensivo? Podemos ajudar!"
                            value={travelProfile.concerns}
                            onChange={(e) => updateTravelProfile({ concerns: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button variant="premium" size="xl" onClick={handleSave}>
            Salvar Perfil
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default TravelProfile;
