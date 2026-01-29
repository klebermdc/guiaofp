import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttractionCard } from './AttractionCard';

interface Attraction {
  name: string;
  description: string;
  type: 'ride' | 'show' | 'character' | 'experience';
  thrillLevel?: number;
  mustDo?: boolean;
}

interface Park {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  attractions: Attraction[];
}

interface ParkAttractionsTabProps {
  park: Park;
  selectedAttractions: Set<string>;
  notes: Record<string, string>;
  getContentId: (attractionName: string) => string | null;
  onToggleAttraction: (parkName: string, attractionName: string) => void;
  onNoteChange: (parkName: string, attractionName: string, note: string) => void;
}

export const ParkAttractionsTab = memo(function ParkAttractionsTab({
  park,
  selectedAttractions,
  notes,
  getContentId,
  onToggleAttraction,
  onNoteChange,
}: ParkAttractionsTabProps) {
  const ParkIcon = park.icon;

  // Memoize the selected set lookup for this park
  const isAttractionSelected = useMemo(() => {
    return (attractionName: string) => 
      selectedAttractions.has(`${park.name}-${attractionName}`);
  }, [selectedAttractions, park.name]);

  return (
    <Card>
      <CardHeader className={`bg-gradient-to-r ${park.color} text-white rounded-t-lg`}>
        <CardTitle className="flex items-center gap-2">
          <ParkIcon className="w-6 h-6" />
          {park.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {park.attractions.map((attraction, idx) => {
            const noteKey = `${park.name}-${attraction.name}`;
            
            return (
              <AttractionCard
                key={idx}
                attraction={attraction}
                parkName={park.name}
                isSelected={isAttractionSelected(attraction.name)}
                noteValue={notes[noteKey] || ''}
                contentId={getContentId(attraction.name)}
                onToggle={onToggleAttraction}
                onNoteChange={onNoteChange}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

export default ParkAttractionsTab;
