import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QuickCommand {
  category: string;
  categoryColor: string;
  commands: {
    message: string;
    context: string;
  }[];
}

const quickCommands: QuickCommand[] = [
  {
    category: "Início do Dia",
    categoryColor: "bg-blue-500",
    commands: [
      { message: "Chegamos no estacionamento!", context: "Avise quando chegar para receber orientação de entrada" },
      { message: "Passamos pela catraca, por onde começar?", context: "Assim que entrar no parque" },
      { message: "Estamos no [nome do local], qual atração mais perto?", context: "Para receber direcionamento baseado na sua localização" }
    ]
  },
  {
    category: "Durante o Parque",
    categoryColor: "bg-green-500",
    commands: [
      { message: "Acabamos a [atração], qual a próxima?", context: "Após cada atração para manter o ritmo" },
      { message: "A fila da [atração] está grande, vale esperar?", context: "Quando estiver em dúvida sobre uma fila" },
      { message: "Temos X minutos, dá tempo de fazer algo?", context: "Para otimizar pequenas janelas de tempo" }
    ]
  },
  {
    category: "Alimentação",
    categoryColor: "bg-orange-500",
    commands: [
      { message: "Estamos com fome, onde comer agora?", context: "Para receber sugestão de restaurante próximo" },
      { message: "Queremos almoçar, qual melhor horário?", context: "Para evitar filas de restaurante" },
      { message: "Tem opção vegetariana/sem glúten por perto?", context: "Para restrições alimentares" }
    ]
  },
  {
    category: "Lightning Lane",
    categoryColor: "bg-purple-500",
    commands: [
      { message: "Quando devo marcar a próxima LL?", context: "Para saber o momento ideal" },
      { message: "Qual atração priorizar no LL agora?", context: "Para decidir entre opções" },
      { message: "Perdi o horário do LL, o que fazer?", context: "Em caso de atraso" }
    ]
  },
  {
    category: "Situações Especiais",
    categoryColor: "bg-red-500",
    commands: [
      { message: "Começou a chover, o que fazemos?", context: "Para reajustar a estratégia" },
      { message: "As crianças estão cansadas, podemos pausar?", context: "Para reorganizar o ritmo" },
      { message: "A [atração] fechou, qual alternativa?", context: "Quando uma atração fecha inesperadamente" }
    ]
  },
  {
    category: "Final do Dia",
    categoryColor: "bg-indigo-500",
    commands: [
      { message: "A que horas devemos parar para o show?", context: "Para se posicionar bem para fogos" },
      { message: "Vale a pena ficar até fechar?", context: "Para avaliar se compensa" },
      { message: "Estamos indo embora, obrigado!", context: "Para encerrar o guiamento do dia" }
    ]
  }
];

export function QuickCommands() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const copyToClipboard = (text: string, index: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Mensagem copiada!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Comandos Rápidos
        </CardTitle>
        <CardDescription>
          Exemplos de mensagens que você pode enviar ao guia durante o dia. Toque para copiar!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {quickCommands.map((category, catIndex) => (
          <div key={catIndex}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${category.categoryColor}`} />
              <h3 className="font-semibold">{category.category}</h3>
            </div>
            
            <div className="grid gap-2">
              {category.commands.map((cmd, cmdIndex) => {
                const uniqueIndex = `${catIndex}-${cmdIndex}`;
                const isCopied = copiedIndex === uniqueIndex;
                
                return (
                  <div
                    key={cmdIndex}
                    onClick={() => copyToClipboard(cmd.message, uniqueIndex)}
                    className="group flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-primary/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">
                        "{cmd.message}"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cmd.context}
                      </p>
                    </div>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Dica:</strong> Quanto mais contexto você der nas mensagens 
            (localização, tempo disponível, preferências), melhor será a orientação do guia!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
