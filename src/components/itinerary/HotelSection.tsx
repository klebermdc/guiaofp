import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Upload, FileCheck, Hotel, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HotelData {
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  voucherFile: File | null;
  voucherUrl: string;
}

interface ItineraryContext {
  budget: string;
  accommodationType: string;
  selectedParks: string[];
  duration: number;
  stayingRegion?: string;
  adultsCount?: number;
  childrenCount?: number;
  travelStyle?: string;
}

interface HotelSectionProps {
  onUpdate: (data: { hasHotel: boolean | null; hotelData: HotelData }) => void;
  initialHasHotel?: boolean | null;
  initialHotelData?: Partial<HotelData>;
  itineraryContext?: ItineraryContext;
}

export const HotelSection = ({ 
  onUpdate, 
  initialHasHotel = null,
  initialHotelData,
  itineraryContext
}: HotelSectionProps) => {
  const [hasHotel, setHasHotel] = useState<boolean | null>(initialHasHotel);
  const [isUploading, setIsUploading] = useState(false);
  const [hotelData, setHotelData] = useState<HotelData>({
    name: initialHotelData?.name || '',
    address: initialHotelData?.address || '',
    checkIn: initialHotelData?.checkIn || '',
    checkOut: initialHotelData?.checkOut || '',
    voucherFile: null,
    voucherUrl: initialHotelData?.voucherUrl || ''
  });

  const handleHasHotelChange = (value: boolean) => {
    setHasHotel(value);
    onUpdate({ hasHotel: value, hotelData });
  };

  const updateHotelData = (updates: Partial<HotelData>) => {
    const newData = { ...hotelData, ...updates };
    setHotelData(newData);
    onUpdate({ hasHotel, hotelData: newData });
  };

  const handleVoucherUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para fazer upload');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB.');
        return;
      }

      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      const { error } = await supabase.storage
        .from('hotel-vouchers')
        .upload(filePath, file);

      if (error) {
        toast.error('Erro ao enviar voucher');
        console.error('Upload error:', error);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('hotel-vouchers')
        .getPublicUrl(filePath);
      
      updateHotelData({ voucherFile: file, voucherUrl: publicUrl });
      toast.success('Voucher enviado com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload');
    } finally {
      setIsUploading(false);
    }
  };

  const removeVoucher = () => {
    updateHotelData({ voucherFile: null, voucherUrl: '' });
  };

  return (
    <div className="space-y-6">
      {/* Pergunta Principal */}
      <div>
        <label className="text-base font-semibold text-foreground">
          Você já tem hotel reservado?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => handleHasHotelChange(true)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-xl transition-all",
              hasHotel === true
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <Hotel className="w-5 h-5" />
            <span className="font-medium">Sim, já reservei</span>
          </button>
          <button
            type="button"
            onClick={() => handleHasHotelChange(false)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-xl transition-all",
              hasHotel === false
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <Search className="w-5 h-5" />
            <span className="font-medium">Não, preciso reservar</span>
          </button>
        </div>
      </div>

      {/* Se TEM hotel */}
      {hasHotel === true && (
        <div className="bg-muted/50 p-5 rounded-xl space-y-5 border border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Informações do Hotel
          </h3>
          
          {/* Nome do Hotel */}
          <div>
            <label className="block mb-2 font-medium text-foreground text-sm">
              Nome do Hotel
            </label>
            <input
              type="text"
              placeholder="Ex: Disney's Grand Floridian Resort"
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={hotelData.name}
              onChange={(e) => updateHotelData({ name: e.target.value })}
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="block mb-2 font-medium text-foreground text-sm">
              Endereço Completo
            </label>
            <input
              type="text"
              placeholder="Ex: 4401 Floridian Way, Orlando, FL 32836"
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={hotelData.address}
              onChange={(e) => updateHotelData({ address: e.target.value })}
            />
          </div>

          {/* Check-in e Check-out */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-foreground text-sm">
                Check-in
              </label>
              <input
                type="date"
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={hotelData.checkIn}
                onChange={(e) => updateHotelData({ checkIn: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-foreground text-sm">
                Check-out
              </label>
              <input
                type="date"
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={hotelData.checkOut}
                onChange={(e) => updateHotelData({ checkOut: e.target.value })}
              />
            </div>
          </div>

          {/* Upload Voucher */}
          <div>
            <label className="block mb-2 font-medium text-foreground text-sm">
              Upload do Voucher (PDF, JPG, PNG - máx. 10MB)
            </label>
            
            {hotelData.voucherFile || hotelData.voucherUrl ? (
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-3 text-primary">
                  <FileCheck className="w-8 h-8" />
                  <div>
                    <p className="font-medium text-sm">
                      {hotelData.voucherFile?.name || 'Voucher enviado'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Arquivo carregado com sucesso
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeVoucher}
                  className="text-destructive hover:text-destructive/80 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
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
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="voucher-upload"
                  disabled={isUploading}
                  onChange={(e) => e.target.files?.[0] && handleVoucherUpload(e.target.files[0])}
                />
                <label htmlFor="voucher-upload" className="cursor-pointer">
                  <Upload className={cn(
                    "mx-auto mb-2 w-10 h-10",
                    isUploading ? "text-primary animate-pulse" : "text-muted-foreground"
                  )} />
                  <p className="text-sm text-muted-foreground">
                    {isUploading 
                      ? "Enviando voucher..." 
                      : "Clique para fazer upload do voucher"
                    }
                  </p>
                </label>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Fallback se não tem contexto */}
      {hasHotel === false && !itineraryContext && (
        <div className="bg-muted/50 p-5 rounded-xl border border-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Sem problemas!
              </h3>
              <p className="text-sm text-muted-foreground">
                Vamos incluir sugestões de hotéis no seu roteiro, 
                considerando a localização dos parques que você escolheu e seu orçamento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
