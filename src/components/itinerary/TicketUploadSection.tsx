import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, FileText, Ticket, Check, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';


interface TicketUpload {
  ticketType: string[];
  parkDays: number;
  startDate: string;
  files: File[];
  uploadedUrls: string[];
}

interface ItineraryContext {
  selectedParks: string[];
  duration: number;
  budget: string;
  parkInterest: string;
  adultsCount?: number;
  childrenCount?: number;
  childrenAges?: number[];
  travelStyle?: string;
}

interface TicketUploadSectionProps {
  onUpdate: (data: { hasTickets: boolean | null; ticketData: TicketUpload }) => void;
  initialHasTickets?: boolean | null;
  initialTicketData?: Partial<TicketUpload>;
  itineraryContext?: ItineraryContext;
}

const TICKET_OPTIONS = [
  // Disney
  { id: 'magic-kingdom', label: 'Magic Kingdom', emoji: '🏰', group: 'Disney' },
  { id: 'epcot', label: 'Epcot', emoji: '🌍', group: 'Disney' },
  { id: 'hollywood-studios', label: 'Hollywood Studios', emoji: '🎬', group: 'Disney' },
  { id: 'animal-kingdom', label: 'Animal Kingdom', emoji: '🦁', group: 'Disney' },
  { id: 'park-hopper', label: 'Park Hopper', emoji: '🎫', group: 'Disney' },
  { id: 'park-hopper-plus', label: 'Park Hopper Plus', emoji: '✨', group: 'Disney' },
  { id: 'water-parks', label: 'Water Parks', emoji: '💦', group: 'Disney' },
  // Universal
  { id: 'universal-studios', label: 'Universal Studios', emoji: '🎥', group: 'Universal' },
  { id: 'islands-of-adventure', label: 'Islands of Adventure', emoji: '🦖', group: 'Universal' },
  { id: 'epic-universe', label: 'Epic Universe', emoji: '🌟', group: 'Universal' },
  { id: 'volcano-bay', label: 'Volcano Bay', emoji: '🌋', group: 'Universal' },
  // Outros
  { id: 'seaworld', label: 'SeaWorld', emoji: '🐬', group: 'Outros' },
  { id: 'busch-gardens', label: 'Busch Gardens', emoji: '🎢', group: 'Outros' },
  { id: 'aquatica', label: 'Aquatica', emoji: '🏄', group: 'Outros' },
  { id: 'discovery-cove', label: 'Discovery Cove', emoji: '🐠', group: 'Outros' },
  { id: 'legoland', label: 'Legoland', emoji: '🧱', group: 'Outros' },
];

export const TicketUploadSection = ({ 
  onUpdate, 
  initialHasTickets = null,
  initialTicketData,
  itineraryContext
}: TicketUploadSectionProps) => {
  const [hasTickets, setHasTickets] = useState<boolean | null>(initialHasTickets);
  const [isUploading, setIsUploading] = useState(false);
  const [ticketData, setTicketData] = useState<TicketUpload>({
    ticketType: initialTicketData?.ticketType || [],
    parkDays: initialTicketData?.parkDays || 1,
    startDate: initialTicketData?.startDate || '',
    files: [],
    uploadedUrls: initialTicketData?.uploadedUrls || []
  });

  const handleHasTicketsChange = (value: boolean) => {
    setHasTickets(value);
    onUpdate({ hasTickets: value, ticketData });
  };

  const updateTicketData = (updates: Partial<TicketUpload>) => {
    const newData = { ...ticketData, ...updates };
    setTicketData(newData);
    onUpdate({ hasTickets, ticketData: newData });
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para fazer upload');
        return;
      }

      const uploadedUrls: string[] = [...ticketData.uploadedUrls];
      const newFiles: File[] = [...ticketData.files];

      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande. Máximo 10MB.`);
          continue;
        }

        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        
        const { error } = await supabase.storage
          .from('itinerary-tickets')
          .upload(filePath, file);

        if (error) {
          toast.error(`Erro ao enviar ${file.name}`);
          console.error('Upload error:', error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('itinerary-tickets')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
        newFiles.push(file);
      }

      updateTicketData({ files: newFiles, uploadedUrls });
      toast.success('Arquivos enviados com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = ticketData.files.filter((_, i) => i !== index);
    const newUrls = ticketData.uploadedUrls.filter((_, i) => i !== index);
    updateTicketData({ files: newFiles, uploadedUrls: newUrls });
  };

  const toggleTicketType = (ticketId: string) => {
    const newTypes = ticketData.ticketType.includes(ticketId)
      ? ticketData.ticketType.filter(t => t !== ticketId)
      : [...ticketData.ticketType, ticketId];
    updateTicketData({ ticketType: newTypes });
  };

  return (
    <div className="space-y-6">
      {/* Pergunta Principal */}
      <div>
        <label className="text-base font-semibold text-foreground">
          Você já tem ingressos para os parques Disney?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => handleHasTicketsChange(true)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-xl transition-all",
              hasTickets === true
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <Ticket className="w-5 h-5" />
            <span className="font-medium">Sim, já tenho</span>
          </button>
          <button
            type="button"
            onClick={() => handleHasTicketsChange(false)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-xl transition-all",
              hasTickets === false
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Não, preciso comprar</span>
          </button>
        </div>
      </div>

      {/* Se TEM ingressos */}
      {hasTickets === true && (
        <div className="bg-muted/50 p-5 rounded-xl space-y-5 border border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Detalhes dos Ingressos
          </h3>
          
          {/* Tipo de Ingresso */}
          <div>
            <label className="block mb-3 font-medium text-foreground text-sm">
              Tipo de Ingresso (selecione todos que possui)
            </label>
            {['Disney', 'Universal', 'Outros'].map(group => {
              const groupOptions = TICKET_OPTIONS.filter(o => o.group === group);
              return (
                <div key={group} className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group === 'Outros' ? 'Outros Parques' : `Ingressos ${group}`}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {groupOptions.map(option => {
                      const isSelected = ticketData.ticketType.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleTicketType(option.id)}
                          className={cn(
                            "flex items-center gap-2 p-3 border-2 rounded-lg transition-all text-left",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card hover:border-primary/50"
                          )}
                        >
                          <span className="text-lg">{option.emoji}</span>
                          <span className="text-sm font-medium flex-1">{option.label}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantidade de Dias */}
          <div>
            <label className="block mb-2 font-medium text-foreground text-sm">
              Quantos dias de parque?
            </label>
            <input
              type="number"
              min="1"
              max="14"
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={ticketData.parkDays}
              onChange={(e) => updateTicketData({ parkDays: parseInt(e.target.value) || 1 })}
            />
          </div>

          {/* Data de Início */}
          <div>
            <label className="block mb-2 font-medium text-foreground text-sm">
              Data de início dos ingressos
            </label>
            <input
              type="date"
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={ticketData.startDate}
              onChange={(e) => updateTicketData({ startDate: e.target.value })}
            />
          </div>

          {/* Upload de Arquivos */}
          <div>
            <label className="block mb-2 font-medium text-foreground text-sm">
              Upload dos Ingressos (PDF, JPG, PNG - máx. 10MB)
            </label>
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
                isUploading 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="ticket-upload"
                disabled={isUploading}
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
              <label htmlFor="ticket-upload" className="cursor-pointer">
                <Upload className={cn(
                  "mx-auto mb-2 w-10 h-10",
                  isUploading ? "text-primary animate-pulse" : "text-muted-foreground"
                )} />
                <p className="text-sm text-muted-foreground">
                  {isUploading 
                    ? "Enviando arquivos..." 
                    : "Clique para fazer upload ou arraste os arquivos aqui"
                  }
                </p>
              </label>
            </div>

            {/* Preview dos Arquivos */}
            {ticketData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                {ticketData.files.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:text-destructive/80 transition-colors p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}


      {/* Fallback se não tem contexto */}
      {hasTickets === false && !itineraryContext && (
        <div className="bg-muted/50 p-5 rounded-xl border border-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Sem problemas!
              </h3>
              <p className="text-sm text-muted-foreground">
                Vamos incluir sugestões de compra de ingressos no seu roteiro, 
                com dicas de onde comprar e quais tipos são mais indicados para sua viagem.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
