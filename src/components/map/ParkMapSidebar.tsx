/**
 * ParkMapSidebar Component
 * 
 * Desktop sidebar with park selector, category tabs, and content lists.
 * Extracted from ParkMap.tsx for maintainability.
 */

import { memo } from 'react';
import { MapPin, Loader2, Navigation, RefreshCw, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RestaurantSidebarCard } from './RestaurantSidebarCard';
import { LiveShowCard } from './LiveShowCard';
import { PARKS, POI_CONFIG, type POIType, type Park } from '@/data/constants';
import { getWaitTimeColor } from '@/hooks/useWaitTimes';
import type { MapAttraction, MapPOI } from '@/hooks/useParkMarkers';
import type { LiveShow } from '@/hooks/useLiveShows';
import type { LatLng } from '@/hooks/useParkNavigation';

type SidebarTab = 'attractions' | 'live-shows' | POIType;
type AttractionFilter = 'all' | 'open' | 'low-wait';

interface ParkMapSidebarProps {
  // Park state
  selectedPark: Park;
  onParkChange: (parkId: string) => void;
  
  // Tab state
  sidebarTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  
  // Attraction state
  attractions: MapAttraction[];
  selectedAttraction: MapAttraction | null;
  attractionFilter: AttractionFilter;
  onAttractionFilterChange: (filter: AttractionFilter) => void;
  onAttractionSelect: (attraction: MapAttraction) => void;
  isLoadingAttractions: boolean;
  
  // Wait times
  waitTimesCount: number;
  openAttractionsCount: number;
  lastWaitTimeUpdate: Date | null;
  isLoadingWaitTimes: boolean;
  onRefreshWaitTimes: () => void;
  
  // POIs
  pois: MapPOI[];
  selectedPOI: MapPOI | null;
  onPOISelect: (poi: MapPOI) => void;
  isLoadingPOIs: boolean;
  onCalculateRoute: (position: LatLng, name: string) => void;
  onOpenMenu: (url: string, name: string) => void;
  
  // Live shows
  liveShows: LiveShow[];
  isLoadingLiveShows: boolean;
  lastShowsUpdate: Date | null;
  
  // Location
  userPosition: LatLng | null;
  isLoadingLocation: boolean;
  onGetLocation: () => void;
}

export const ParkMapSidebar = memo(function ParkMapSidebar({
  selectedPark,
  onParkChange,
  sidebarTab,
  onTabChange,
  attractions,
  selectedAttraction,
  attractionFilter,
  onAttractionFilterChange,
  onAttractionSelect,
  isLoadingAttractions,
  waitTimesCount,
  openAttractionsCount,
  lastWaitTimeUpdate,
  isLoadingWaitTimes,
  onRefreshWaitTimes,
  pois,
  selectedPOI,
  onPOISelect,
  isLoadingPOIs,
  onCalculateRoute,
  onOpenMenu,
  liveShows,
  isLoadingLiveShows,
  lastShowsUpdate,
  userPosition,
  isLoadingLocation,
  onGetLocation,
}: ParkMapSidebarProps) {
  
  // Filter attractions based on current filter
  const filteredAttractions = attractions.filter(attraction => {
    if (attractionFilter === 'open') return attraction.isOpen === true;
    if (attractionFilter === 'low-wait') return attraction.waitTime !== undefined && attraction.waitTime <= 30;
    return true;
  });

  // Filter POIs by current tab
  const filteredPOIs = pois.filter(p => p.type === sidebarTab);

  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-l bg-background shrink-0 h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-3 border-b space-y-2">
        {/* Park Selector */}
        <div className="flex items-center gap-2">
          <Select value={selectedPark.id} onValueChange={onParkChange}>
            <SelectTrigger className="flex-1 h-9">
              <SelectValue placeholder="Selecione o parque" />
            </SelectTrigger>
            <SelectContent>
              {PARKS.map((park) => (
                <SelectItem key={park.id} value={park.id}>
                  {park.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={onRefreshWaitTimes}
            disabled={isLoadingWaitTimes}
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingWaitTimes ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          <Button
            variant={sidebarTab === 'attractions' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-2 text-xs shrink-0 gap-1"
            onClick={() => onTabChange('attractions')}
          >
            ⭐ Atrações
            <Badge variant="secondary" className="text-[10px] px-1 h-4 ml-0.5">
              {attractions.length}
            </Badge>
          </Button>
          {/* Live Shows/Characters Tab */}
          <Button
            variant={sidebarTab === 'live-shows' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-2 text-xs shrink-0 gap-1"
            onClick={() => onTabChange('live-shows')}
            style={sidebarTab === 'live-shows' ? { backgroundColor: '#EC4899' } : {}}
          >
            🎭 Ao Vivo
            <Badge variant="secondary" className="text-[10px] px-1 h-4 ml-0.5">
              {liveShows.length}
            </Badge>
          </Button>
          {(Object.keys(POI_CONFIG) as POIType[]).map((type) => {
            const config = POI_CONFIG[type];
            const count = pois.filter(p => p.type === type).length;
            return (
              <Button
                key={type}
                variant={sidebarTab === type ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs shrink-0 gap-1"
                onClick={() => onTabChange(type)}
                style={sidebarTab === type ? { backgroundColor: config.color } : {}}
              >
                {config.emoji}
                <Badge variant="secondary" className="text-[10px] px-1 h-4 ml-0.5">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Attraction Filters */}
        {sidebarTab === 'attractions' && (
          <>
            <div className="flex gap-1">
              <Button
                variant={attractionFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 text-xs h-7"
                onClick={() => onAttractionFilterChange('all')}
              >
                Todas
              </Button>
              <Button
                variant={attractionFilter === 'open' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 text-xs h-7"
                onClick={() => onAttractionFilterChange('open')}
              >
                Abertas
              </Button>
              <Button
                variant={attractionFilter === 'low-wait' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 text-xs h-7"
                onClick={() => onAttractionFilterChange('low-wait')}
              >
                &lt;30 min
              </Button>
            </div>

            {lastWaitTimeUpdate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="relative">
                  <Clock className="w-3 h-3" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </div>
                <span>Ao vivo • {lastWaitTimeUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                {waitTimesCount > 0 && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {openAttractionsCount} abertas
                  </Badge>
                )}
              </div>
            )}
          </>
        )}

        {/* Live Shows Header */}
        {sidebarTab === 'live-shows' && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm bg-pink-500">
              🎭
            </div>
            <span className="font-medium text-sm">Shows e Personagens</span>
            <Badge variant="secondary" className="text-xs ml-auto">
              {liveShows.length} ao vivo
            </Badge>
          </div>
        )}

        {sidebarTab !== 'attractions' && sidebarTab !== 'live-shows' && (
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
              style={{ backgroundColor: POI_CONFIG[sidebarTab as POIType].color }}
            >
              {POI_CONFIG[sidebarTab as POIType].emoji}
            </div>
            <span className="font-medium text-sm">{POI_CONFIG[sidebarTab as POIType].label}</span>
            <Badge variant="secondary" className="text-xs ml-auto">
              {filteredPOIs.length} locais
            </Badge>
          </div>
        )}
      </div>

      {/* Content List */}
      <ScrollArea className="flex-1">
        {sidebarTab === 'attractions' && (
          <>
            {isLoadingAttractions ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredAttractions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma atração encontrada</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredAttractions.map((attraction) => (
                  <div
                    key={attraction.id}
                    className={`p-2.5 flex items-start gap-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedAttraction?.id === attraction.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => onAttractionSelect(attraction)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight line-clamp-2">{attraction.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {attraction.isOpen !== undefined && (
                          <span className={`text-[11px] ${attraction.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                            ● {attraction.isOpen ? 'Aberto' : 'Fechado'}
                          </span>
                        )}
                        {attraction.passType && (
                          <span className="text-[11px] text-muted-foreground">
                            {attraction.passType}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={`${getWaitTimeColor(attraction.waitTime)} shrink-0 text-[11px] px-1.5`}>
                      {attraction.waitTime !== undefined ? `${attraction.waitTime}m` : '—'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Live Shows Tab Content */}
        {sidebarTab === 'live-shows' && (
          <>
            {isLoadingLiveShows ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : liveShows.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum show ou personagem disponível</p>
                <p className="text-xs mt-1">Os dados são atualizados em tempo real</p>
              </div>
            ) : (
              <div className="divide-y">
                {/* Shows first, then characters */}
                {liveShows
                  .sort((a, b) => {
                    // Shows before characters
                    if (a.entityType !== b.entityType) {
                      return a.entityType === 'SHOW' ? -1 : 1;
                    }
                    // Operating before closed
                    if (a.status !== b.status) {
                      return a.status === 'OPERATING' ? -1 : 1;
                    }
                    // Alphabetical
                    return a.name.localeCompare(b.name);
                  })
                  .map((show) => (
                    <LiveShowCard key={show.id} show={show} />
                  ))}
              </div>
            )}
            {lastShowsUpdate && (
              <div className="p-2 border-t text-center">
                <p className="text-[10px] text-muted-foreground">
                  Atualizado: {lastShowsUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </>
        )}

        {sidebarTab !== 'attractions' && sidebarTab !== 'live-shows' && (
          <>
            {isLoadingPOIs ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredPOIs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum local encontrado</p>
              </div>
            ) : sidebarTab === 'restaurant' ? (
              // Special styling for restaurants
              <div className="p-2 space-y-2">
                {filteredPOIs
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((poi) => (
                    <RestaurantSidebarCard
                      key={poi.id}
                      poi={poi}
                      isSelected={selectedPOI?.id === poi.id}
                      onSelect={() => onPOISelect(poi)}
                      onNavigate={() => onCalculateRoute(poi.position, poi.name)}
                      onOpenMenu={(url, name) => onOpenMenu(url, name)}
                    />
                  ))}
              </div>
            ) : (
              // Default styling for other POIs
              <div className="divide-y">
                {filteredPOIs
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((poi) => (
                    <div
                      key={poi.id}
                      className={`p-2.5 flex items-start gap-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedPOI?.id === poi.id ? 'bg-primary/10 border-l-4' : ''
                      }`}
                      style={selectedPOI?.id === poi.id ? { borderLeftColor: POI_CONFIG[poi.type].color } : {}}
                      onClick={() => onPOISelect(poi)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight line-clamp-2">{poi.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {poi.type === 'show' && poi.schedule && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {poi.schedule}
                            </span>
                          )}
                          {poi.hasWarning && (
                            <Badge variant="destructive" className="text-[10px] px-1 h-4">
                              ⚠️
                            </Badge>
                          )}
                        </div>
                        {poi.description && (
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                            {poi.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCalculateRoute(poi.position, poi.name);
                        }}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="p-3 border-t">
        <Button
          onClick={onGetLocation}
          disabled={isLoadingLocation}
          variant={userPosition ? 'default' : 'outline'}
          className="w-full"
        >
          {isLoadingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Navigation className="w-4 h-4 mr-2" />
          )}
          {userPosition ? 'Localização ativa' : 'Ativar localização'}
        </Button>
      </div>
    </aside>
  );
});

ParkMapSidebar.displayName = 'ParkMapSidebar';
