import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePlanPageAccess } from "@/hooks/usePlanPageAccess";
import { Loader2, LayoutDashboard, User, Star, Calendar, Map, MapPin, Zap, BookOpen, CheckSquare, FileText, MessageCircle, Settings } from "lucide-react";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  User,
  Star,
  Calendar,
  Map,
  MapPin,
  Zap,
  BookOpen,
  CheckSquare,
  FileText,
  MessageCircle,
  Settings,
};

export function PlanAccessManager() {
  const { pageAccess, isLoading, updatePageAccess } = usePlanPageAccess();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (
    id: string,
    field: "basic_visible" | "premium_visible",
    currentValue: boolean
  ) => {
    setUpdating(`${id}-${field}`);
    const { error } = await updatePageAccess(id, { [field]: !currentValue });
    
    if (error) {
      toast.error("Erro ao atualizar configuração");
    } else {
      toast.success("Configuração atualizada!");
    }
    setUpdating(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Acesso por Plano
        </CardTitle>
        <CardDescription>
          Configure quais páginas ficam visíveis para cada tipo de plano. 
          As alterações são aplicadas imediatamente para todos os usuários.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
            OFP Planejador (R$49,90)
          </Badge>
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
            Premium = Roteiro com Guia
          </Badge>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Página</TableHead>
                <TableHead className="text-center w-[150px]">
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    Básico
                  </span>
                </TableHead>
                <TableHead className="text-center w-[150px]">
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    Premium
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageAccess.map((page) => {
                const IconComponent = iconMap[page.page_icon] || FileText;
                return (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{page.page_name}</p>
                          <p className="text-xs text-muted-foreground">/{page.page_key}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={page.basic_visible}
                          onCheckedChange={() => handleToggle(page.id, "basic_visible", page.basic_visible)}
                          disabled={updating === `${page.id}-basic_visible`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={page.premium_visible}
                          onCheckedChange={() => handleToggle(page.id, "premium_visible", page.premium_visible)}
                          disabled={updating === `${page.id}-premium_visible`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          💡 <strong>Dica:</strong> Páginas desativadas não aparecem no menu lateral do usuário. 
          Se o usuário tentar acessar diretamente a URL, será redirecionado.
        </p>
      </CardContent>
    </Card>
  );
}
