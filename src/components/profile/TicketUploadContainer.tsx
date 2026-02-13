import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, ExternalLink, Loader2, ScanSearch, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface UploadedTicket {
  id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  uploaded_at: string;
  ai_validation_status: string | null;
  ai_validation_message: string | null;
}

export const TicketUploadContainer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<UploadedTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('document_type', 'ingresso')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 10MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/tickets/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-documents')
        .getPublicUrl(fileName);

      // Save to database
      const { data: insertedDoc, error: dbError } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          document_name: file.name,
          document_type: 'ingresso',
          file_url: urlData.publicUrl,
          file_size: file.size
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Ingresso enviado! 🎟️",
        description: "Analisando datas com IA...",
      });

      loadTickets();

      // Auto-analyze ticket with AI
      if (insertedDoc) {
        try {
          const { data: aiResult } = await supabase.functions.invoke('analyze-ticket', {
            body: { documentId: insertedDoc.id },
          });
          if (aiResult?.status === 'warning') {
            toast({
              title: "⚠️ Atenção com seu ingresso!",
              description: aiResult.message,
              variant: "destructive",
            });
          }
          loadTickets();
        } catch {
          // Silent fail for AI analysis
        }
      }
    } catch (error) {
      console.error('Error uploading ticket:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o ingresso. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDelete = async (ticket: UploadedTicket) => {
    if (!user) return;

    try {
      // Delete from database
      const { error } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', ticket.id);

      if (error) throw error;

      toast({
        title: "Ingresso removido",
        description: "O ingresso foi removido da sua carteira.",
      });

      loadTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o ingresso.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">🎟️ Ingressos dos Parques</Label>
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <Button variant="outline" size="sm" asChild disabled={isUploading}>
            <span className="flex items-center gap-2">
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Enviar Ingresso
            </span>
          </Button>
        </label>
      </div>

      <p className="text-sm text-muted-foreground">
        Envie seus ingressos (PDF ou imagem) para ter acesso rápido durante a viagem.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <FileText className="w-10 h-10 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Nenhum ingresso enviado ainda.
            <br />
            Clique em "Enviar Ingresso" para adicionar.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  {ticket.ai_validation_status === 'valid' && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 absolute -bottom-1 -right-1" />
                  )}
                  {ticket.ai_validation_status === 'warning' && (
                    <AlertTriangle className="w-3 h-3 text-amber-500 absolute -bottom-1 -right-1" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-medium truncate block">
                    {ticket.document_name}
                  </span>
                  {ticket.ai_validation_message && ticket.ai_validation_status === 'warning' && (
                    <span className="text-xs text-amber-600 line-clamp-1">{ticket.ai_validation_message}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => window.open(ticket.file_url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(ticket)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
