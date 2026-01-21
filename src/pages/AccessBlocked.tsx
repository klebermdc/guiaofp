import { Lock, MessageCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AccessBlocked() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const whatsappNumber = '5511999999999'; // Número de suporte
  const whatsappMessage = encodeURIComponent(
    `Olá! Acabei de me cadastrar na plataforma Orlando Fast Pass e gostaria de saber mais sobre os planos de guiamento.\n\nEmail: ${user?.email}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">Acesso Pendente</CardTitle>
          <CardDescription className="text-base">
            Seu cadastro foi realizado com sucesso! Estamos aguardando a liberação do seu acesso pela nossa equipe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Se você já contratou nosso serviço de guiamento, entre em contato conosco para agilizar a liberação.
          </p>
          
          <div className="flex flex-col gap-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" className="w-full" size="lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar com a Equipe
              </Button>
            </a>
            
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            Conectado como: {user?.email}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
