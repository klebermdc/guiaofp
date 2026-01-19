import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  RefreshCw, 
  CalendarPlus, 
  XCircle, 
  ChevronLeft,
  ChevronRight,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Hand,
  MousePointer2,
  ArrowRight,
  Info,
  Lightbulb,
  CircleDot
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

interface TutorialStep {
  image: string;
  title: string;
  action: string; // O que o usuário deve fazer (ação principal)
  whereToClick: string; // Onde exatamente clicar
  description: string;
  warning?: string;
  tip?: string;
  important?: string;
}

interface Tutorial {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  beforeStart?: string[];
  steps: TutorialStep[];
  finalTip?: string;
}

const tutorials: Tutorial[] = [
  {
    id: "comprar",
    title: "Como Comprar",
    icon: <ShoppingCart className="h-4 w-4" />,
    description: "Passo a passo completo para comprar seu Multi Pass e Single Pass no app My Disney Experience",
    beforeStart: [
      "Tenha o app My Disney Experience instalado e logado",
      "Tenha seus ingressos dos parques já vinculados à sua conta",
      "Adicione todas as pessoas do seu grupo no app (Family & Friends)",
      "Tenha um cartão de crédito internacional cadastrado ou em mãos"
    ],
    steps: [
      {
        image: step1Menu,
        title: "Abra o Menu Principal",
        action: "TOQUE NO ÍCONE DE 3 BARRAS",
        whereToClick: "No canto inferior direito da tela, você verá 3 barras horizontais (≡). Toque nesse ícone.",
        description: "Este é o menu principal do app. É por aqui que você acessa todas as funcionalidades importantes."
      },
      {
        image: step2LightningLane,
        title: "Acesse Lightning Lane Passes",
        action: "TOQUE EM 'LIGHTNING LANE PASSES'",
        whereToClick: "Na lista de opções que apareceu, procure por 'Lightning Lane Passes' e toque.",
        description: "Depois, toque em 'Purchase Lightning Lane Multi Pass' para começar a compra.",
        tip: "Se você clicar em 'Purchase Lightning Lane Single Pass' também funciona! Ambos levam para a mesma tela de compra."
      },
      {
        image: step3Calendar,
        title: "Escolha a Data",
        action: "SELECIONE O DIA NO CALENDÁRIO",
        whereToClick: "Toque no dia específico que você quer comprar o Lightning Lane. O dia selecionado ficará destacado.",
        description: "Escolha a data em que você vai visitar o parque. Só aparecem os dias para os quais você tem ingresso válido.",
        important: "Lembre-se: se você é hóspede Disney, pode comprar com 7 dias de antecedência. Não-hóspedes podem comprar com 3 dias."
      },
      {
        image: step4SelectPark,
        title: "Selecione o Parque",
        action: "TOQUE NO PARQUE DESEJADO",
        whereToClick: "Aparecerá uma lista com os 4 parques Disney. Toque no parque que você vai visitar naquele dia.",
        description: "Você verá: Magic Kingdom, EPCOT, Hollywood Studios e Animal Kingdom. Escolha apenas um.",
        warning: "Se você tem Park Hopper, ainda assim escolha o PRIMEIRO parque que vai visitar. Depois de entrar na primeira atração, poderá agendar nos outros parques."
      },
      {
        image: step5Prices,
        title: "Veja os Preços e Selecione",
        action: "ESCOLHA O MULTI PASS E/OU SINGLE PASS",
        whereToClick: "O primeiro item da lista é o Multi Pass. Abaixo aparecem as opções de Single Pass. Toque para selecionar o que deseja.",
        description: "Os preços variam de acordo com a data e parque. O Multi Pass dá direito a múltiplas atrações. O Single Pass é para atrações específicas (TRON, Seven Dwarfs, etc).",
        tip: "Você pode comprar os dois ao mesmo tempo! Basta selecionar ambos antes de continuar.",
        important: "Os preços mostrados não incluem taxa de 6.5%. O valor final será um pouco maior."
      },
      {
        image: step6SelectGuests,
        title: "Selecione as Pessoas",
        action: "MARQUE TODOS DO SEU GRUPO",
        whereToClick: "Aparecerá a lista de pessoas da sua conta. Toque no nome de cada pessoa que vai comprar. Um ✓ aparecerá ao lado.",
        description: "Todos os selecionados receberão exatamente os mesmos passes que você escolheu no passo anterior.",
        warning: "ATENÇÃO: Se você selecionou Multi Pass + Single Pass, mas uma criança não tem altura para a atração Single Pass, você precisará fazer DUAS compras separadas! Primeiro compre o Multi Pass para todos, depois volte e compre o Single Pass apenas para quem pode ir.",
        tip: "Depois de selecionar todos, toque em 'Continue' no final da tela."
      },
      {
        image: step7SelectAttractions,
        title: "Escolha suas 3 Atrações",
        action: "SELECIONE ATÉ 3 ATRAÇÕES",
        whereToClick: "Você verá as atrações divididas em grupos. Toque em cada atração que deseja. Ela ficará marcada com ✓.",
        description: "Magic Kingdom, EPCOT e Hollywood Studios têm divisão em 2 grupos. Você pode escolher APENAS 1 do Grupo 1 e até 2 do Grupo 2. Animal Kingdom não tem essa divisão.",
        important: "GRUPO 1 = Atrações mais concorridas (aparece primeiro na tela). GRUPO 2 = Demais atrações. Quando você seleciona uma do Grupo 1, as outras desse grupo ficam bloqueadas.",
        tip: "Se mudar de ideia, toque novamente na atração selecionada para desmarcá-la e escolher outra."
      },
      {
        image: step8ModifyTime,
        title: "Confira os Horários Sugeridos",
        action: "REVISE OU ALTERE OS HORÁRIOS",
        whereToClick: "A Disney sugere horários automaticamente. Se quiser mudar, toque em 'Modify Time' ao lado de cada atração.",
        description: "Os horários são baseados na disponibilidade e na lógica de sequência. Mas você pode personalizar!",
        tip: "Tente agendar a primeira atração para logo após a abertura do parque. Quanto mais cedo você entrar na primeira atração, mais tempo terá para agendar novas ao longo do dia."
      },
      {
        image: step9TimeOptions,
        title: "Altere o Horário (Opcional)",
        action: "ESCOLHA UM NOVO HORÁRIO",
        whereToClick: "Ao clicar em 'Modify Time', aparecem as horas cheias (4 PM, 5 PM...). Toque em uma hora para ver os horários disponíveis dentro dela.",
        description: "Aparecem no máximo 3 opções de horário dentro de cada hora. Escolha a que melhor se encaixa no seu planejamento.",
        tip: "Depois de escolher, toque em 'Save New Time'. CONFIRA se o horário foi salvo corretamente antes de continuar!",
        warning: "Se aquele horário não estiver mais disponível, a Disney pode alterar para outro automaticamente. Sempre confira!"
      },
      {
        image: step10Review,
        title: "Revise Tudo",
        action: "CONFIRA TODAS AS INFORMAÇÕES",
        whereToClick: "Verifique: data, parque, atrações, horários, pessoas e valor total. Se tudo estiver certo, toque em 'Continue'.",
        description: "Esta é sua última chance de verificar antes do pagamento. Confirme especialmente os horários das atrações e se todas as pessoas estão incluídas.",
        important: "O valor mostrado agora inclui os impostos (6.5%). Este será o valor final cobrado no seu cartão."
      },
      {
        image: step11Payment,
        title: "Realize o Pagamento",
        action: "CONFIRME O CARTÃO E FINALIZE",
        whereToClick: "Se seu cartão já está salvo, ele aparecerá automaticamente. Caso contrário, toque em 'Add Payment' para adicionar. Depois toque em 'Purchase'.",
        description: "Você pode trocar o cartão tocando na seta (>) ao lado dele. Após conferir, toque no botão 'Purchase' para finalizar.",
        warning: "Use cartão de crédito INTERNACIONAL. Cartões apenas nacionais podem ser recusados.",
        tip: "Mantenha a tela aberta até a confirmação aparecer. Não feche o app!"
      },
      {
        image: step12Confirmation,
        title: "Compra Concluída! 🎉",
        action: "PRONTO! SEUS AGENDAMENTOS ESTÃO SALVOS",
        whereToClick: "Você verá a confirmação na tela. Para ver seus agendamentos, vá em 'Lightning Lane Passes' no menu.",
        description: "Parabéns! Seus agendamentos aparecem com os horários e nome das atrações. No dia da visita, basta ir até a atração no horário marcado e entrar pela fila Lightning Lane.",
        tip: "Tire um print da tela de confirmação! É sempre bom ter um backup.",
        important: "Lembre-se: você tem 1 HORA de janela para entrar na atração a partir do horário agendado. Exemplo: agendou 10h, pode entrar até 11h."
      }
    ],
    finalTip: "Após entrar na sua primeira atração do dia, a restrição de grupos cai! Você poderá agendar novas atrações de qualquer grupo. Por isso, chegue cedo e entre rápido na primeira atração!"
  },
  {
    id: "alterar",
    title: "Como Alterar",
    icon: <RefreshCw className="h-4 w-4" />,
    description: "Aprenda a modificar horários e trocar atrações já agendadas",
    beforeStart: [
      "Você já deve ter um Multi Pass ou Single Pass comprado",
      "Só é possível alterar para horários disponíveis no momento",
      "Alterações são gratuitas (não há cobrança adicional)"
    ],
    steps: [
      {
        image: modify1Find,
        title: "Encontre seu Agendamento",
        action: "ACESSE LIGHTNING LANE PASSES",
        whereToClick: "No menu (≡), toque em 'Lightning Lane Passes'. Você verá todos os seus agendamentos listados por data.",
        description: "Procure o agendamento que deseja alterar e toque em cima dele para abrir os detalhes.",
        tip: "Seus agendamentos aparecem em ordem cronológica. Role para baixo se tiver vários."
      },
      {
        image: modify2Options,
        title: "Toque em Modify Plan",
        action: "SELECIONE 'MODIFY PLAN'",
        whereToClick: "Na tela de detalhes do agendamento, você verá 3 opções: 'View Details', 'Modify Plan' e 'Cancel Plan'. Toque em 'Modify Plan'.",
        description: "A tela 'Modify Experience' mostrará o próximo horário disponível para esta atração. Se quiser trocar para OUTRA atração, role para baixo para ver a lista.",
        important: "Se quiser um horário mais cedo que o mostrado, você pode atualizar a tela: segure e arraste para BAIXO para fazer refresh. Novos horários podem aparecer!",
        tip: "Se a atração que você quer estiver 'Currently Unavailable', continue atualizando a tela. Horários podem liberar a qualquer momento!"
      },
      {
        image: modify3Review,
        title: "Confirme a Alteração",
        action: "ESCOLHA O HORÁRIO E CONFIRME",
        whereToClick: "Toque no horário desejado. Você irá para 'Review Details'. O agendamento sendo alterado aparece com borda azul. Toque em 'Continue' para confirmar.",
        description: "Se quiser ver outras opções de horário, toque em 'Modify Time' e escolha entre os disponíveis.",
        warning: "A alteração só é confirmada quando você toca em 'Continue'. Se fechar o app antes disso, a alteração não será salva!",
        tip: "Você pode alterar quantas vezes quiser sem custo adicional. Use isso a seu favor para pegar horários melhores!"
      }
    ],
    finalTip: "ESTRATÉGIA: Na madrugada do dia da visita (após meia-noite de Orlando), fique atualizando seus agendamentos. Muitas pessoas cancelam ou alteram nesse horário, liberando horários melhores!"
  },
  {
    id: "agendar-novas",
    title: "Agendar Novas",
    icon: <CalendarPlus className="h-4 w-4" />,
    description: "Como agendar novas atrações no dia da visita usando o Tip Board",
    beforeStart: [
      "Você precisa estar no DIA da visita ao parque",
      "Você já deve ter ENTRADO em pelo menos uma atração agendada",
      "Novas atrações são agendadas pelo 'Tip Board', não pela tela de compra"
    ],
    steps: [
      {
        image: tipboard1,
        title: "Verifique se Pode Agendar",
        action: "PROCURE A MENSAGEM DE LIBERAÇÃO",
        whereToClick: "No menu (≡), toque em 'Wait Times & Showtimes'. Esta é a tela do Tip Board.",
        description: "Se você puder agendar uma nova atração, verá a mensagem: 'Check for another available experience now!' em destaque.",
        important: "Esta mensagem SÓ aparece quando você está liberado para agendar. Se não aparecer, significa que você precisa entrar em uma atração agendada primeiro.",
        warning: "Se aparecer 'You can select another experience once you redeem one', você precisa entrar em uma atração antes de agendar novas."
      },
      {
        image: tipboard2,
        title: "Escolha a Nova Atração",
        action: "TOQUE EM 'MULTI PASS EXPERIENCE'",
        whereToClick: "Na lista de atrações, procure as que têm o botão 'Multi Pass Experience' disponível. Toque nesse botão para agendar.",
        description: "A lista mostra também o tempo de espera da fila normal (Stand-by). Atrações com maior tempo de espera são as mais valiosas para usar o Lightning Lane!",
        tip: "Suas atrações favoritas (que você pré-selecionou) aparecem no topo em 'My Top Picks'. Isso facilita encontrar o que você mais quer!",
        important: "Após tocar no botão, os próximos passos são iguais: selecionar as pessoas e confirmar o horário. Faça isso RÁPIDO pois os horários podem esgotar!"
      }
    ],
    finalTip: "ESTRATÉGIA AVANÇADA: Logo após entrar em cada atração, já abra o app e agende a próxima! Quanto mais rápido você agendar, mais atrações consegue fazer no dia. Não espere terminar a atração para agendar!"
  },
  {
    id: "cancelar",
    title: "Cancelar",
    icon: <XCircle className="h-4 w-4" />,
    description: "Como cancelar agendamentos quando necessário",
    beforeStart: [
      "Cancelamentos NÃO geram reembolso",
      "Só cancele se realmente não for usar",
      "Na maioria dos casos, é melhor ALTERAR para outra atração do que cancelar"
    ],
    steps: [
      {
        image: cancel1,
        title: "Cancele o Agendamento",
        action: "TOQUE EM 'CANCEL PLAN'",
        whereToClick: "Na tela de detalhes do agendamento (mesma do Modify), toque em 'Cancel Plan'. Selecione as pessoas que deseja cancelar e toque em 'Confirm Changes'.",
        description: "Você pode cancelar para TODAS as pessoas ou apenas para ALGUMAS do grupo.",
        important: "RECOMENDAÇÃO: Se você quer cancelar para TODOS, é melhor usar 'Modify Plan' e trocar para outra atração! Assim você não perde o agendamento.",
        tip: "Use o cancelamento apenas quando PARTE do grupo não puder/quiser ir na atração. Por exemplo: adultos vão na montanha-russa, mas a criança não quer. Cancele só para a criança.",
        warning: "Após cancelar, você pode agendar uma nova atração imediatamente (se estiver no dia da visita). Mas se cancelar ANTES do dia, você pode ter perdido o horário para sempre."
      }
    ],
    finalTip: "DICA DE OURO: Se alguém do grupo não puder ir em uma atração (criança pequena, por exemplo), cancele apenas para essa pessoa. Quando o resto do grupo entrar na atração, todos ficam liberados para agendar uma nova atração JUNTOS!"
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
    <div className="space-y-6">
      {/* Before Start Section */}
      {tutorial.beforeStart && currentStep === 0 && (
        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Antes de Começar
          </h4>
          <ul className="space-y-2">
            {tutorial.beforeStart.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-base px-3 py-1">
            Passo {currentStep + 1} de {tutorial.steps.length}
          </Badge>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {step.title}
          </span>
        </div>
        <div className="flex gap-1.5">
          {tutorial.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentStep 
                  ? "bg-primary scale-125" 
                  : index < currentStep 
                    ? "bg-primary/50" 
                    : "bg-muted hover:bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image Section */}
        <div className="relative bg-gradient-to-b from-muted/30 to-muted/60 rounded-2xl p-6 flex items-center justify-center min-h-[450px]">
          <div className="relative max-w-[260px] mx-auto">
            {/* Phone frame */}
            <div className="absolute -inset-2 bg-slate-800 rounded-[2.5rem] shadow-2xl" />
            <div className="absolute -inset-1 bg-slate-700 rounded-[2.2rem]" />
            <img 
              src={step.image} 
              alt={step.title}
              className="relative rounded-2xl w-full h-auto z-10"
            />
            {/* Notch */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-800 rounded-b-xl z-20" />
          </div>
          
          {/* Navigation arrows on image */}
          <Button
            variant="secondary"
            size="icon"
            onClick={goToPrevious}
            disabled={currentStep === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={goToNext}
            disabled={currentStep === tutorial.steps.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Instructions Section */}
        <div className="space-y-4">
          {/* Step Title */}
          <div>
            <h3 className="text-xl font-bold mb-1">{step.title}</h3>
            <p className="text-muted-foreground text-sm">{step.description}</p>
          </div>

          {/* Action Box - Main CTA */}
          <div className="p-4 bg-primary/10 rounded-xl border-2 border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-primary">
                <Hand className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-primary">O QUE FAZER:</span>
            </div>
            <p className="text-lg font-semibold">{step.action}</p>
          </div>

          {/* Where to Click Box */}
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer2 className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Onde tocar na tela:</span>
            </div>
            <p className="text-sm text-muted-foreground">{step.whereToClick}</p>
          </div>

          {/* Important Note */}
          {step.important && (
            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <div className="flex items-start gap-2">
                <CircleDot className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-purple-400">IMPORTANTE: </span>
                  <span className="text-sm">{step.important}</span>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          {step.warning && (
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-red-400">ATENÇÃO: </span>
                  <span className="text-sm">{step.warning}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tip */}
          {step.tip && (
            <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-yellow-600">💡 DICA: </span>
                  <span className="text-sm">{step.tip}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Final Tip - Only on last step */}
      {currentStep === tutorial.steps.length - 1 && tutorial.finalTip && (
        <div className="p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-green-500/20">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h4 className="font-bold text-green-400 mb-1">🎯 DICA FINAL</h4>
              <p className="text-sm">{tutorial.finalTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentStep === 0}
          className="flex-1 h-12 text-base"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Passo Anterior
        </Button>
        <Button
          onClick={goToNext}
          disabled={currentStep === tutorial.steps.length - 1}
          className="flex-1 h-12 text-base"
        >
          {currentStep === tutorial.steps.length - 1 ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Concluído!
            </>
          ) : (
            <>
              Próximo Passo
              <ChevronRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Quick Navigation */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">Ir para o passo:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {tutorial.steps.map((s, index) => (
            <Button
              key={index}
              variant={index === currentStep ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentStep(index)}
              className="h-8 px-3 text-xs"
            >
              {index + 1}. {s.title.split(' ').slice(0, 2).join(' ')}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TutorialSection = () => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Smartphone className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Tutoriais Passo a Passo</h2>
          <p className="text-muted-foreground">Guia visual completo do app My Disney Experience</p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Hand className="h-5 w-5 text-primary" />
            Escolha o que você quer aprender
          </CardTitle>
          <CardDescription>
            Cada tutorial mostra exatamente onde tocar na tela e o que fazer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="comprar">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto gap-2 p-2 bg-muted/50">
              {tutorials.map((tutorial) => (
                <TabsTrigger 
                  key={tutorial.id} 
                  value={tutorial.id}
                  className="flex items-center gap-2 py-4 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tutorial.icon}
                  <span className="font-medium">{tutorial.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tutorials.map((tutorial) => (
              <TabsContent key={tutorial.id} value={tutorial.id} className="mt-6">
                <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                </div>
                <TutorialViewer tutorial={tutorial} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
};
