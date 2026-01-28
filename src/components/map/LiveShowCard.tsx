import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Navigation, Sparkles, Users } from 'lucide-react';
import type { LiveShow } from '@/hooks/useLiveShows';

interface LiveShowCardProps {
  show: LiveShow;
  onNavigate?: () => void;
}

export function LiveShowCard({ show, onNavigate }: LiveShowCardProps) {
  const isCharacter = show.entityType === 'CHARACTER';
  const isOperating = show.status === 'OPERATING';
  
  return (
    <div className="p-2.5 border-b border-border hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-2">
        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isCharacter 
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
        }`}>
          {isCharacter ? <Users className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm leading-tight line-clamp-2">{show.name}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge 
                  variant={isOperating ? 'default' : 'secondary'}
                  className={`text-[10px] px-1.5 h-4 ${
                    isOperating 
                      ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isOperating ? '● Ativo' : '● Fechado'}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1.5 h-4"
                >
                  {isCharacter ? '🤗 Personagem' : '🎭 Show'}
                </Badge>
              </div>
            </div>
            
            {/* Navigate button */}
            {onNavigate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate();
                }}
              >
                <Navigation className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          
          {/* Showtimes */}
          {show.showtimes.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                <span>Horários:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {show.showtimes.slice(0, 6).map((time, idx) => (
                  <Badge 
                    key={idx}
                    variant="secondary"
                    className={`text-[10px] px-1.5 h-5 ${
                      show.nextShowtime === time 
                        ? 'bg-primary/20 text-primary border border-primary/30 font-semibold' 
                        : ''
                    }`}
                  >
                    {time}
                    {show.nextShowtime === time && ' →'}
                  </Badge>
                ))}
                {show.showtimes.length > 6 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 h-5">
                    +{show.showtimes.length - 6}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Next showtime highlight */}
          {show.nextShowtime && show.showtimes.length === 0 && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-muted-foreground">Próximo:</span>
              <span className="font-semibold text-primary">{show.nextShowtime}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
