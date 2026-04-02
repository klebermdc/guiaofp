import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Upload, 
  FileText, 
  Trash2, 
  Hotel, 
  Plane, 
  Car, 
  Ticket,
  Shield,
  Download,
  Eye,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  ScanSearch
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number | null;
  uploaded_at: string;
  ai_validation_status: string | null;
  ai_validation_message: string | null;
  ai_extracted_dates: unknown | null;
  ai_validated_at: string | null;
}

const DOCUMENT_TYPES = [
  { value: 'hotel_voucher', label: 'Voucher do Hotel', icon: Hotel, color: 'text-blue-500' },
  { value: 'flight_ticket', label: 'Passagem Aérea', icon: Plane, color: 'text-purple-500' },
  { value: 'car_rental', label: 'Aluguel de Carro', icon: Car, color: 'text-green-500' },
  { value: 'park_ticket', label: 'Ingresso de Parque', icon: Ticket, color: 'text-orange-500' },
  { value: 'insurance', label: 'Seguro Viagem', icon: Shield, color: 'text-red-500' },
  { value: 'other', label: 'Outro Documento', icon: FileText, color: 'text-muted-foreground' },
];

const ANALYZABLE_TYPES = ['park_ticket', 'ingresso'];

const ValidationBadge = ({ status, message }: { status: string | null; message: string | null }) => {
  if (!status || status === 'pending') return null;

  const config = {
    valid: { icon: CheckCircle2, label: 'Validado', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    warning: { icon: AlertTriangle, label: 'Atenção', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    error: { icon: CircleAlert, label: 'Verificar', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
  }[status] || { icon: CircleAlert, label: 'Desconhecido', className: 'bg-muted text-muted-foreground' };

  const Icon = config.icon;

  return (
    <div className="mt-2">
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </div>
      {message && (
        <p className={`text-xs mt-1 leading-relaxed ${
          status === 'warning' ? 'text-amber-600' : status === 'error' ? 'text-red-500' : 'text-emerald-600'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};

const DocumentWalletComponent = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [deleteDoc, setDeleteDoc] = useState<UserDocument | null>(null);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as UserDocument[]) || []);
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const analyzeTicket = useCallback(async (documentId: string) => {
    setAnalyzingIds(prev => new Set(prev).add(documentId));
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-ticket', {
        body: { documentId },
      });

      if (error) throw error;

      if (data?.status === 'warning') {
        toast.warning('⚠️ Atenção com seu ingresso!', {
          description: data.message,
          duration: 8000,
        });
      } else if (data?.status === 'valid') {
        toast.success('✅ Ingresso validado!', {
          description: data.message,
          duration: 5000,
        });
      } else if (data?.status === 'error') {
        toast.info('📋 Verificação manual necessária', {
          description: data.message,
          duration: 5000,
        });
      }

      // Reload to show updated AI status
      await loadDocuments();
    } catch {
      toast.error('Erro ao analisar documento');
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(documentId);
        return next;
      });
    }
  }, [loadDocuments]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedType) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${selectedType}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-documents')
        .getPublicUrl(fileName);

      // Save document record
      const { data: insertedDoc, error: dbError } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          document_type: selectedType,
          document_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('Documento enviado com sucesso!');
      setShowUploadModal(false);
      setSelectedType('');
      await loadDocuments();

      // Auto-analyze if it's a park ticket
      if (insertedDoc && ANALYZABLE_TYPES.includes(selectedType)) {
        analyzeTicket(insertedDoc.id);
      }
    } catch {
      toast.error('Erro ao enviar documento');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDoc || !user) return;

    try {
      // Extract file path from URL
      const urlParts = deleteDoc.file_url.split('/user-documents/');
      const filePath = urlParts[1];

      if (filePath) {
        await supabase.storage
          .from('user-documents')
          .remove([filePath]);
      }

      const { error } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', deleteDoc.id);

      if (error) throw error;

      toast.success('Documento excluído');
      loadDocuments();
    } catch {
      toast.error('Erro ao excluir documento');
    } finally {
      setDeleteDoc(null);
    }
  };

  const getDocTypeInfo = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type) || DOCUMENT_TYPES[DOCUMENT_TYPES.length - 1];
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Check if there are any warnings
  const warnings = documents.filter(d => d.ai_validation_status === 'warning');

  return (
    <>
      {/* Warning Alert Banner */}
      {warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm">
                {warnings.length === 1 ? '1 ingresso precisa de atenção' : `${warnings.length} ingressos precisam de atenção`}
              </p>
              {warnings.map(w => (
                <p key={w.id} className="text-xs text-amber-600 dark:text-amber-400/80 mt-1">
                  📄 {w.document_name}: {w.ai_validation_message}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <Card variant="premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-magic rounded-xl flex items-center justify-center text-accent-foreground">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Carteira de Documentos</CardTitle>
                <CardDescription>Seus vouchers e comprovantes em um só lugar</CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum documento adicionado</p>
              <p className="text-xs mt-1">Adicione vouchers, passagens e ingressos</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {documents.map((doc) => {
                const typeInfo = getDocTypeInfo(doc.document_type);
                const Icon = typeInfo.icon;
                const isAnalyzing = analyzingIds.has(doc.id);
                const canAnalyze = ANALYZABLE_TYPES.includes(doc.document_type);
                
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="p-3 bg-muted/50 rounded-lg group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-background flex items-center justify-center ${typeInfo.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.document_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {typeInfo.label}
                          </Badge>
                          {doc.file_size && (
                            <span>{formatFileSize(doc.file_size)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canAnalyze && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isAnalyzing}
                            onClick={() => analyzeTicket(doc.id)}
                            title="Analisar com IA"
                          >
                            {isAnalyzing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ScanSearch className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewingDoc(doc.file_url)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={doc.file_url} download target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteDoc(doc)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* AI Validation Result */}
                    {isAnalyzing && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analisando documento com IA...</span>
                      </div>
                    )}
                    <ValidationBadge 
                      status={doc.ai_validation_status} 
                      message={doc.ai_validation_message} 
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-xl p-6 max-w-md w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Adicionar Documento</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowUploadModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Documento</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className={`w-4 h-4 ${type.color}`} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedType && ANALYZABLE_TYPES.includes(selectedType) && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <ScanSearch className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-primary/80">
                      A IA irá analisar automaticamente as datas do ingresso e comparar com seu perfil de viagem.
                    </p>
                  </div>
                )}

                {selectedType && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Arquivo</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            Clique para selecionar
                          </span>
                          <span className="text-xs text-muted-foreground/70 mt-1">
                            PDF, imagem ou documento (máx. 10MB)
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Document Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setViewingDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="secondary"
                size="icon"
                className="absolute -top-12 right-0"
                onClick={() => setViewingDoc(null)}
              >
                <X className="w-5 h-5" />
              </Button>
              {viewingDoc.endsWith('.pdf') ? (
                <iframe
                  src={viewingDoc}
                  className="w-full h-[80vh] rounded-lg bg-white"
                />
              ) : (
                <img
                  src={viewingDoc}
                  alt="Document preview"
                  className="max-w-full max-h-[80vh] mx-auto rounded-lg object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteDoc?.document_name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const DocumentWallet = memo(DocumentWalletComponent);
