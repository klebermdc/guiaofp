import React, { memo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Star, 
  Heart, 
  Sparkles, 
  Play 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Attraction {
  name: string;
  description: string;
  type: 'ride' | 'show' | 'character' | 'experience';
  thrillLevel?: number;
  mustDo?: boolean;
}

interface AttractionCardProps {
  attraction: Attraction;
  parkName: string;
  isSelected: boolean;
  noteValue: string;
  contentId: string | null;
  onToggle: (parkName: string, attractionName: string) => void;
  onNoteChange: (parkName: string, attractionName: string, note: string) => void;
}

const getTypeIcon = (type: Attraction['type']) => {
  switch (type) {
    case 'ride': return Zap;
    case 'show': return Star;
    case 'character': return Heart;
    case 'experience': return Sparkles;
    default: return Star;
  }
};

const getTypeLabel = (type: Attraction['type']) => {
  switch (type) {
    case 'ride': return 'Atração';
    case 'show': return 'Show';
    case 'character': return 'Personagem';
    case 'experience': return 'Experiência';
    default: return type;
  }
};

const getThrillBadge = (level?: number) => {
  if (!level) return null;
  const colors: Record<number, string> = {
    1: 'bg-green-100 text-green-700',
    2: 'bg-yellow-100 text-yellow-700',
    3: 'bg-orange-100 text-orange-700',
    4: 'bg-red-100 text-red-700',
    5: 'bg-purple-100 text-purple-700',
  };
  const labels: Record<number, string> = {
    1: 'Leve',
    2: 'Moderado',
    3: 'Intenso',
    4: 'Radical',
    5: 'Extremo',
  };
  return (
    <Badge className={colors[level] || colors[1]}>
      {labels[level] || 'Leve'}
    </Badge>
  );
};

export const AttractionCard = memo(function AttractionCard({
  attraction,
  parkName,
  isSelected,
  noteValue,
  contentId,
  onToggle,
  onNoteChange,
}: AttractionCardProps) {
  const { t } = useLanguage();
  const TypeIcon = getTypeIcon(attraction.type);

  const handleToggle = useCallback(() => {
    onToggle(parkName, attraction.name);
  }, [onToggle, parkName, attraction.name]);

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNoteChange(parkName, attraction.name, e.target.value);
  }, [onNoteChange, parkName, attraction.name]);

  return (
    <div 
      className={`p-3 rounded-lg border transition-all ${
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-muted-foreground/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleToggle}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
              {attraction.name}
            </span>
            {attraction.mustDo && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs">
                <Star className="w-3 h-3 mr-1" />
                Imperdível
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {attraction.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <TypeIcon className="w-3 h-3 mr-1" />
              {getTypeLabel(attraction.type)}
            </Badge>
            {getThrillBadge(attraction.thrillLevel)}
            {contentId && (
              <Link
                to={`/conteudos?video=${contentId}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Play className="w-3 h-3" />
                {t('attractions.watchVideo')}
              </Link>
            )}
          </div>
          
          {isSelected && (
            <div className="mt-3">
              <Textarea
                placeholder={t('attractions.notePlaceholder')}
                value={noteValue}
                onChange={handleNoteChange}
                className="text-sm resize-none"
                rows={2}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AttractionCard;
