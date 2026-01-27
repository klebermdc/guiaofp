import { Share, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface IOSInstallPromptProps {
  onDismiss: () => void;
}

export function IOSInstallPrompt({ onDismiss }: IOSInstallPromptProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-50"
      >
        <Card className="shadow-lg border-primary/20 bg-card">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Share className="w-5 h-5 text-blue-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">Adicione à Tela Inicial</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Para receber notificações no iPhone/iPad, você precisa instalar o app:
                </p>
                
                <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">1</span>
                    <span>Toque em <Share className="inline w-4 h-4 mx-1" /> (Compartilhar)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">2</span>
                    <span>Role e toque em <Plus className="inline w-4 h-4 mx-1" /> "Adicionar à Tela Inicial"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">3</span>
                    <span>Abra o app pela tela inicial</span>
                  </li>
                </ol>
                
                <div className="mt-3">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={onDismiss}
                    className="w-full"
                  >
                    Entendi
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={onDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
