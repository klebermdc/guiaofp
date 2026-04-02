import { useState } from 'react';
import { UserPlus, Loader2, Copy, Check, Eye, EyeOff, RefreshCw, Mail, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CreatePremiumClientProps {
  onClientCreated?: () => void;
}

export const CreatePremiumClient = ({ onClientCreated }: CreatePremiumClientProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    password: '',
    guideName: 'Rafael',
  });

  // Generate secure password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const specialChars = '!@#$%';
    let password = '';
    
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    setFormData(prev => ({ ...prev, password }));
  };

  const copyPassword = async () => {
    if (formData.password) {
      await navigator.clipboard.writeText(formData.password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
      toast.success('Senha copiada!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      whatsapp: '',
      password: '',
      guideName: 'Rafael',
    });
    setCopiedPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Preencha nome, email e senha');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create user via edge function (uses admin API)
      const { data: createResult, error: createError } = await supabase.functions.invoke('create-client', {
        body: {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          whatsapp: formData.whatsapp,
          guideName: formData.guideName,
          planTier: 'premium',
          sendWelcomeEmail,
        },
      });

      if (createError) {
        // Parse the actual error from the edge function response
        let errorMsg = 'Erro ao conectar com o servidor. Tente novamente.';
        if (typeof createError === 'object' && 'message' in createError) {
          const msg = (createError as Error).message;
          if (msg.includes('non-2xx')) {
            errorMsg = 'Erro no servidor ao criar cliente. Verifique os dados e tente novamente.';
          } else {
            errorMsg = msg;
          }
        }
        throw new Error(errorMsg);
      }
      if (createResult?.error) {
        // Map known backend errors to friendly messages
        const backendError = createResult.error;
        if (backendError.includes('já está cadastrado') || backendError.includes('already been registered')) {
          throw new Error('Este email já está cadastrado no sistema.');
        }
        throw new Error(backendError);
      }

      toast.success('Cliente Premium criado com sucesso!', {
        description: sendWelcomeEmail 
          ? 'Email com credenciais enviado automaticamente.' 
          : 'Lembre-se de enviar as credenciais manualmente.',
      });

      resetForm();
      setIsOpen(false);
      onClientCreated?.();

    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Erro ao criar cliente', {
        description: (error as Error).message || 'Tente novamente',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-primary text-primary-foreground">
          <UserPlus className="w-4 h-4" />
          Novo Cliente Premium
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-secondary" />
            Cadastrar Cliente Premium
          </DialogTitle>
          <DialogDescription>
            Crie uma conta para clientes que fecharam via WhatsApp
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo *</Label>
            <Input
              id="name"
              placeholder="João Silva"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="cliente@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              placeholder="11999999999"
              value={formData.whatsapp}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha temporária *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Gere ou digite uma senha"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={copyPassword}
                    disabled={!formData.password}
                  >
                    {copiedPassword ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generatePassword}
                title="Gerar senha"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Guide */}
          <div className="space-y-2">
            <Label>Guia responsável</Label>
            <Select 
              value={formData.guideName} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, guideName: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rafael">Rafael</SelectItem>
                <SelectItem value="Kleber">Kleber</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Send email checkbox */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="sendEmail"
              checked={sendWelcomeEmail}
              onCheckedChange={(checked) => setSendWelcomeEmail(checked as boolean)}
            />
            <Label htmlFor="sendEmail" className="flex items-center gap-2 cursor-pointer text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Enviar email com credenciais automaticamente
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Cliente
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
