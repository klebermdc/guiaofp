import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  RefreshCw, 
  CalendarPlus, 
  XCircle, 
  Timer,
  ChevronLeft,
  ChevronRight,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Importando as imagens dos tutoriais
import step1Menu from "@/assets/tutorials/multipass/step1-menu.png";
import step2LightningLane from "@/assets/tutorials/multipass/step2-lightning-lane.png";
import step3Calendar from "@/assets/tutorials/multipass/step3-calendar.png";
import step4SelectPark from "@/assets/tutorials/multipass/step4-select-park.png";
import step5Prices from "@/assets/tutorials/multipass/step5-prices.png";
import step6SelectGuests from "@/assets/tutorials/multipass/step6-select-guests.png";
import step7SelectAttractions from "@/assets/tutorials/multipass/step7-select-attractions.png";
import step8ModifyTime from "@/assets/tutorials/multipass/step8-modify-time.png";
import step9TimeOptions from "@/assets/tutorials/multipass/step9-time-options.png";
import step10Review from "@/assets/tutorials/multipass/step10-review.png";
import step11Payment from "@/assets/tutorials/multipass/step11-payment.png";
import step12Confirmation from "@/assets/tutorials/multipass/step12-confirmation.png";
import modify1Find from "@/assets/tutorials/multipass/modify1-find.png";
import modify2Options from "@/assets/tutorials/multipass/modify2-options.png";
import modify3Review from "@/assets/tutorials/multipass/modify3-review.png";
import tipboard1 from "@/assets/tutorials/multipass/tipboard1.png";
import tipboard2 from "@/assets/tutorials/multipass/tipboard2.png";
import cancel1 from "@/assets/tutorials/multipass/cancel1.png";
import virtualQueue1 from "@/assets/tutorials/multipass/virtual-queue1.png";
import virtualQueue2 from "@/assets/tutorials/multipass/virtual-queue2.png";
import virtualQueue3 from "@/assets/tutorials/multipass/virtual-queue3.png";
import virtualQueue4 from "@/assets/tutorials/multipass/virtual-queue4.png";

interface TutorialStep {
  image: string;
  title: string;
  description: string;
  tip?: string;
}

interface Tutorial {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  steps: TutorialStep[];
}

const tutorials: Tutorial[] = [
  {
    id: "comprar",
    title: "Como Comprar",
    icon: <ShoppingCart className="h-4 w-4" />,
    description: "Passo a passo completo para comprar Multi Pass e Single Pass",
    steps: [
      {
        image: step1Menu,
        title: "Acesse o Menu",
        description: "No menu inferior do app My Disney Experience, selecione a opção da direita (3 barras horizontais)."
      },
      {
        image: step2LightningLane,
        title: "Lightning Lane Passes",
        description: "Clique em 'Lightning Lane Passes' e depois em 'Purchase Lightning Lane Multi Pass'.",
        tip: "Se você clicar em 'Purchase Lightning Lane Single Pass' também funciona - ambos levam para a mesma tela."
      },
      {
        image: step3Calendar,
        title: "Selecione a Data",
        description: "No calendário, selecione a data em que você quer comprar o Multi e/ou Single Pass."
      },
      {
        image: step4SelectPark,
        title: "Escolha o Parque",
        description: "Clique em 'Select a Park' e escolha o parque que você irá visitar naquele dia."
      },
      {
        image: step5Prices,
        title: "Veja os Preços",
        description: "Nessa etapa, você encontra os valores de cada item. O primeiro item é sempre o Lightning Lane Multi Pass, e depois o Single Pass. Selecione o item que quer comprar e clique em 'Continue'."
      },
      {
        image: step6SelectGuests,
        title: "Selecione as Pessoas",
        description: "Selecione as pessoas que irão comprar e clique em 'Continue'.",
        tip: "Se você selecionou Multi Pass e Single Pass, mas alguém do grupo quer apenas uma delas, terá que fazer compras separadas. Exemplo: Se uma criança não tem altura para TRON, compre o Multi Pass para todos primeiro, depois compre a TRON apenas para quem pode ir."
      },
      {
        image: step7SelectAttractions,
        title: "Escolha as Atrações",
        description: "Faça a seleção das atrações. Na parte de cima da tela aparecem as atrações do Grupo 1, e abaixo as do Grupo 2. Quando selecionar uma do Grupo 1, irá bloquear a seleção de outras do mesmo grupo.",
        tip: "Caso mude de ideia na opção escolhida, terá que desmarcar a atração selecionada para marcar outra."
      },
      {
        image: step8ModifyTime,
        title: "Modifique os Horários",
        description: "A Disney irá trazer uma sequência das atrações. Mas você pode clicar em 'Modify Time' e modificar os horários conforme seu planejamento."
      },
      {
        image: step9TimeOptions,
        title: "Opções de Horário",
        description: "Se você clicar em 'Modify Time', vai aparecer primeiro os horários divididos por horas cheias (4 PM, 5 PM...). Clicando em cima dessas horas, abre as opções de horário dentro daquela hora.",
        tip: "Aparecem no máximo 3 opções de horários. Quando escolher, clique em 'Save New Time' e confira se o novo horário foi aplicado."
      },
      {
        image: step10Review,
        title: "Revise os Detalhes",
        description: "Confira todas as atrações, horários e valores. Quando estiver tudo certo, clique em 'Continue'."
      },
      {
        image: step11Payment,
        title: "Pagamento",
        description: "Se o seu cartão já estiver salvo no app, ele vai puxar automaticamente. Caso contrário, você terá que adicionar os dados do cartão.",
        tip: "Para alterar o cartão selecionado ou adicionar outro, clique no '>' ao lado do cartão. Quando os dados estiverem certos, clique em 'Purchase'."
      },
      {
        image: step12Confirmation,
        title: "Confirmação",
        description: "Quando finalizar sua compra, os seus agendamentos estarão dentro de 'Lightning Lane Passes'. Parabéns! 🎉"
      }
    ]
  },
  {
    id: "alterar",
    title: "Como Alterar",
    icon: <RefreshCw className="h-4 w-4" />,
    description: "Aprenda a modificar horários e atrações já agendadas",
    steps: [
      {
        image: modify1Find,
        title: "Encontre o Agendamento",
        description: "Dentro de 'Lightning Lane Passes', você vai encontrar o agendamento que quer alterar. Clique em cima dele."
      },
      {
        image: modify2Options,
        title: "Modify Plan",
        description: "Selecione a opção 'Modify Plan'. Na tela de Modify Experience, você verá qual o próximo horário disponível.",
        tip: "Se quiser alterar para outra atração, você encontra a lista de atrações abaixo do mesmo parque. Para atualizar os horários disponíveis, segure a tela e arraste para baixo."
      },
      {
        image: modify3Review,
        title: "Confirme a Alteração",
        description: "Se você gostou de algum horário, clique em cima dele para ir à tela de 'Review Details'. O agendamento que está alterando estará com a borda em azul.",
        tip: "Clique em 'Modify Time' para ver outras opções de horários. Se o horário estiver de acordo, clique em 'Continue'."
      }
    ]
  },
  {
    id: "agendar-novas",
    title: "Agendar Novas",
    icon: <CalendarPlus className="h-4 w-4" />,
    description: "Como agendar novas atrações no dia da visita",
    steps: [
      {
        image: tipboard1,
        title: "Acesse o Tip Board",
        description: "Para acessar o Tip Board, vá em 'Wait Times & Showtimes'. Você verá a mensagem 'Check for another available experience now!' quando puder agendar uma nova atração."
      },
      {
        image: tipboard2,
        title: "Escolha a Atração",
        description: "Para agendar, basta clicar em cima do 'Multi Pass Experience' da atração que você gostaria. Os próximos passos são os mesmos: selecionar as pessoas e confirmar o horário.",
        tip: "Se aparecer 'You can select another experience once you redeem one' significa que você precisa entrar em uma atração agendada para liberar novo agendamento."
      }
    ]
  },
  {
    id: "cancelar",
    title: "Cancelar",
    icon: <XCircle className="h-4 w-4" />,
    description: "Como cancelar agendamentos quando necessário",
    steps: [
      {
        image: cancel1,
        title: "Cancel Plan",
        description: "Clicando em cima do agendamento, você encontra a opção 'Cancel Plan'. Selecione as pessoas que quer cancelar e clique em 'Confirm Changes'.",
        tip: "Se você quiser cancelar para todos, recomendo alterar para outra atração ao invés de cancelar. Use a função de cancelar apenas quando parte do grupo não quiser/puder ir na atração."
      }
    ]
  },
  {
    id: "fila-virtual",
    title: "Fila Virtual",
    icon: <Timer className="h-4 w-4" />,
    description: "Como entrar na fila virtual de atrações especiais",
    steps: [
      {
        image: virtualQueue1,
        title: "Acesse Virtual Queue",
        description: "No menu, clique em 'Virtual Queue' e depois em 'Join a Virtual Queue'."
      },
      {
        image: virtualQueue2,
        title: "Prepare-se para o Horário",
        description: "A fila virtual abre em dois momentos: 7h e 13h (horário de Orlando). Para entrar às 13h, você precisa já estar dentro do parque.",
        tip: "Fique de olho no relógio vendo os segundos! Comece a clicar em 'Refresh' alguns segundos antes das 7h em ponto, sem parar."
      },
      {
        image: virtualQueue3,
        title: "Join Virtual Queue",
        description: "Às 7h em ponto, após clicar no 'Refresh', vai habilitar o botão 'Join Virtual Queue'. Aperte nele para entrar em um grupo.",
        tip: "A rapidez para clicar determina seu grupo. Quanto mais rápido, melhor o grupo. Geralmente em 5 segundos não há mais grupos disponíveis!"
      },
      {
        image: virtualQueue4,
        title: "Acompanhe seu Grupo",
        description: "Nessa tela você sabe qual seu grupo. Dentro de 'Virtual Queue', você encontra qual grupo estão chamando no momento. Quando chegar sua vez, você receberá uma notificação do app.",
        tip: "Você tem 1 hora após ser chamado para ir até a atração e escanear seu ingresso."
      }
    ]
  }
];

const TutorialViewer = ({ tutorial }: { tutorial: Tutorial }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorial.steps[currentStep];

  const goToPrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentStep((prev) => Math.min(tutorial.steps.length - 1, prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Passo {currentStep + 1} de {tutorial.steps.length}
        </span>
        <div className="flex gap-1">
          {tutorial.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep 
                  ? "bg-primary" 
                  : index < currentStep 
                    ? "bg-primary/50" 
                    : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Image */}
      <div className="relative bg-gradient-to-b from-muted/50 to-muted rounded-2xl p-4 flex items-center justify-center min-h-[400px]">
        <div className="relative max-w-[280px] mx-auto">
          {/* Phone frame effect */}
          <div className="absolute inset-0 bg-black/10 rounded-[2rem] transform scale-[1.02]" />
          <img 
            src={step.image} 
            alt={step.title}
            className="relative rounded-2xl shadow-xl w-full h-auto"
          />
        </div>
        
        {/* Navigation arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          disabled={currentStep === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={currentStep === tutorial.steps.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Step info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {currentStep + 1}
          </Badge>
          <h4 className="font-semibold text-lg">{step.title}</h4>
        </div>
        <p className="text-muted-foreground">{step.description}</p>
        {step.tip && (
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <p className="text-sm">
              <span className="font-medium text-yellow-600">💡 Dica: </span>
              {step.tip}
            </p>
          </div>
        )}
      </div>

      {/* Step navigation buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentStep === 0}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          onClick={goToNext}
          disabled={currentStep === tutorial.steps.length - 1}
          className="flex-1"
        >
          Próximo
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export const TutorialSection = () => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Tutoriais no App</h2>
          <p className="text-muted-foreground text-sm">Passo a passo com imagens do My Disney Experience</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Escolha um tutorial</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="comprar">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-1">
              {tutorials.map((tutorial) => (
                <TabsTrigger 
                  key={tutorial.id} 
                  value={tutorial.id}
                  className="flex items-center gap-2 py-3 text-xs md:text-sm"
                >
                  {tutorial.icon}
                  <span className="hidden sm:inline">{tutorial.title}</span>
                  <span className="sm:hidden">{tutorial.title.split(" ")[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tutorials.map((tutorial) => (
              <TabsContent key={tutorial.id} value={tutorial.id} className="mt-4">
                <TutorialViewer tutorial={tutorial} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
};
