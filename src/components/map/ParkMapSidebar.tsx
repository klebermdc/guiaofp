import { Loader2, MapPin, Clock, Navigation, Sparkles, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RestaurantSidebarCard } from '@/components/map/RestaurantSidebarCard';
import { LiveShowCard } from '@/components/map/LiveShowCard';
import type { LiveShow } from '@/hooks/useLiveShows';
import { POI_CONFIG, PARKS } from '@/data/constants';
import type { ExtendedPOIType } from '@/data/constants';
import type { Attraction, POI, LatLng } from '@/types/parkMap';
import { getWaitTimeColor } from '@/utils/parkMapUtils';

interface ParkMapSidebarProps {
  selectedParkId: string;
  onParkChange: (parkId: string) => void;
  isLoadingWaitTimes: boolean;
  onRefreshWaitTimes: () => void;
  sidebarTab: 'attractions' | 'shows' | 'characters' | ExtendedPOIType;
  onTabChange: (tab: 'attractions' | 'shows' | 'characters' | ExtendedPOIType) => void;
  attractionFilter: 'all' | 'open' | 'low-wait';
  onAttractionFilterChange: (f: 'all' | 'open' | 'low-wait') => void;
  filteredAttractions: Attraction[];
  attractionsWithWaitTimes: Attraction[];
  isLoadingAttractions: boolean;
  selectedAttractionId: string | null;
  onSelectAttraction: (attraction: Attraction) => void;
  waitTimes: { isOpen: boolean }[];
  lastWaitTimeUpdate: Date | null;
  liveShows: LiveShow[];
  isLoadingLiveShows: boolean;
  lastShowsUpdate: Date | null;
  currentParkPOIs: POI[];
  isLoadingPOIs: boolean;
  selectedPOIId: string | null;
  onSelectPOI: (poi: POI) => void;
  onNavigateToPOI: (pos: LatLng, name: string) => void;
  onOpenMenu: (url: string, name: string) => void;
  userPosition: LatLng | null;
  isLoadingLocation: boolean;
  onGetLocation: () => void;
}

export function ParkMapSidebar({
  selectedParkId,
  onParkChange,
  isLoadingWaitTimes,
  onRefreshWaitTimes,
  sidebarTab,
  onTabChange,
  attractionFilter,
  onAttractionFilterChange,
  filteredAttractions,
  attractionsWithWaitTimes,
  isLoadingAttractions,
  selectedAttractionId,
  onSelectAttraction,
  waitTimes,
  lastWaitTimeUpdate,
  liveShows,
  isLoadingLiveShows,
  lastShowsUpdate,
  currentParkPOIs,
  isLoadingPOIs,
  selectedPOIId,
  onSelectPOI,
  onNavigateToPOI,
  onOpenMenu,
  userPosition,
  isLoadingLocation,
  onGetLocation,
}: ParkMapSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-l bg-background shrink-0 h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center gap-2">
          <Select value={selectedParkId} onValueChange={onParkChange}>
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
              {attractionsWithWaitTimes.length}
            </Badge>
          </Button>

          <Button
            variant={sidebarTab === 'shows' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-2 text-xs shrink-0 gap-1"
            onClick={() => onTabChange('shows')}
            style={sidebarTab === 'shows' ? { backgroundColor: '#EC4899' } : {}}
          >
            🎭 Shows
            <Badge variant="secondary" className="text-[10px] px-1 h-4 ml-0.5">
              {liveShows.filter(s => s.entityType === 'SHOW').length}
            </Badge>
          </Button>

          <Button
            variant={sidebarTab === 'characters' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-2 text-xs shrink-0 gap-1"
            onClick={() => onTabChange('characters')}
            style={sidebarTab === 'characters' ? { backgroundColor: '#8B5CF6' } : {}}
          >
            🤗 Personagens
            <Badge variant="secondary" className="text-[10px] px-1 h-4 ml-0.5">
              {liveShows.filter(s => s.entityType === 'CHARACTER').length}
            </Badge>
          </Button>

          {(Object.keys(POI_CONFIG) as ExtendedPOIType[]).map((type) => {
            const config = POI_CONFIG[type];
            const count = currentParkPOIs.filter(p => p.type === type).length;
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
              {(['all', 'open', 'low-wait'] as const).map((f) => (
                <Button
                  key={f}
                  variant={attractionFilter === f ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 text-xs h-7"
                  onClick={() => onAttractionFilterChange(f)}
                >
                  {f === 'all' ? 'Todas' : f === 'open' ? 'Abertas' : '<30 min'}
                </Button>
              ))}
            </div>

            {lastWaitTimeUpdate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="relative">
                  <Clock className="w-3 h-3" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </div>
                <span>
                  Ao vivo •{' '}
                  {lastWaitTimeUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {waitTimes.length > 0 && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {waitTimes.filter(w => w.isOpen).length} abertas
                  </Badge>
                )}
              </div>
            )}
          </>
        )}

        {sidebarTab === 'shows' && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: '#EC4899' }}>
              🎭
            </div>
            <span className="font-medium text-sm">Shows ao Vivo</span>
            <Badge variant="secondary" className="text-xs ml-auto bg-pink-500/20 text-pink-600 dark:text-pink-400">
              {liveShows.filter(s => s.entityType === 'SHOW').length} shows
            </Badge>
          </div>
        )}

        {sidebarTab === 'characters' && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: '#8B5CF6' }}>
              🤗
            </div>
            <span className="font-medium text-sm">Encontro com Personagens</span>
            <Badge variant="secondary" className="text-xs ml-auto bg-purple-500/20 text-purple-600 dark:text-purple-400">
              {liveShows.filter(s => s.entityType === 'CHARACTER').length} personagens
            </Badge>
          </div>
        )}

        {sidebarTab !== 'attractions' && sidebarTab !== 'shows' && sidebarTab !== 'characters' && (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
              style={{ backgroundColor: POI_CONFIG[sidebarTab].color }}
            >
              {POI_CONFIG[sidebarTab].emoji}
            </div>
            <span className="font-medium text-sm">{POI_CONFIG[sidebarTab].label}</span>
            <Badge variant="secondary" className="text-xs ml-auto">
              {currentParkPOIs.filter(p => p.type === sidebarTab).length} locais
            </Badge>
          </div>
        )}
      </div>

      {/* Content List */}
      <ScrollArea className="flex-1">
        {/* Attractions */}
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
                      selectedAttractionId === attraction.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => onSelectAttraction(attraction)}
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
                          <span className="text-[11px] text-muted-foreground">{attraction.passType}</span>
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

        {/* Shows */}
        {sidebarTab === 'shows' && (
          <>
            {isLoadingLiveShows ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : liveShows.filter(s => s.entityType === 'SHOW').length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum show disponível</p>
                <p className="text-xs mt-1">Os dados são atualizados em tempo real</p>
              </div>
            ) : (
              <div className="divide-y">
                {liveShows
                  .filter(s => s.entityType === 'SHOW')
                  .sort((a, b) => {
                    if (a.status !== b.status) return a.status === 'OPERATING' ? -1 : 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((show) => (
                    <LiveShowCard key={show.id} show={show} onNavigate={() => {}} />
                  ))}
              </div>
            )}
            {lastShowsUpdate && (
              <div className="p-2 border-t text-center">
                <p className="text-[10px] text-muted-foreground">
                  Atualizado:{' '}
                  {lastShowsUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </>
        )}

        {/* Characters */}
        {sidebarTab === 'characters' && (
          <>
            {isLoadingLiveShows ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : liveShows.filter(s => s.entityType === 'CHARACTER').length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum personagem disponível</p>
                <p className="text-xs mt-1">Os dados são atualizados em tempo real</p>
              </div>
            ) : (
              <div className="divide-y">
                {liveShows
                  .filter(s => s.entityType === 'CHARACTER')
                  .sort((a, b) => {
                    if (a.status !== b.status) return a.status === 'OPERATING' ? -1 : 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((show) => (
                    <LiveShowCard key={show.id} show={show} onNavigate={() => {}} />
                  ))}
              </div>
            )}
            {lastShowsUpdate && (
              <div className="p-2 border-t text-center">
                <p className="text-[10px] text-muted-foreground">
                  Atualizado:{' '}
                  {lastShowsUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </>
        )}

        {/* POI tabs */}
        {sidebarTab !== 'attractions' && sidebarTab !== 'shows' && sidebarTab !== 'characters' && (
          <>
            {isLoadingPOIs ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : currentParkPOIs.filter(p => p.type === sidebarTab).length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum local encontrado</p>
              </div>
            ) : sidebarTab === 'restaurant' ? (
              <div className="p-2 space-y-2">
                {currentParkPOIs
                  .filter(p => p.type === 'restaurant')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((poi) => (
                    <RestaurantSidebarCard
                      key={poi.id}
                      poi={poi}
                      isSelected={selectedPOIId === poi.id}
                      onSelect={() => {
                        onSelectPOI(poi);
                        onNavigateToPOI(poi.position, poi.name);
                      }}
                      onNavigate={() => onNavigateToPOI(poi.position, poi.name)}
                      onOpenMenu={(url, name) => onOpenMenu(url, name)}
                    />
                  ))}
              </div>
            ) : (
              <div className="divide-y">
                {currentParkPOIs
                  .filter(p => p.type === sidebarTab)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((poi) => (
                    <div
                      key={poi.id}
                      className={`p-2.5 flex items-start gap-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedPOIId === poi.id ? 'bg-primary/10 border-l-4' : ''
                      }`}
                      style={selectedPOIId === poi.id ? { borderLeftColor: POI_CONFIG[poi.type].color } : {}}
                      onClick={() => {
                        onSelectPOI(poi);
                        onNavigateToPOI(poi.position, poi.name);
                      }}
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
                            <Badge variant="destructive" className="text-[10px] px-1 h-4">⚠️</Badge>
                          )}
                        </div>
                        {poi.description && (
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{poi.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToPOI(poi.position, poi.name);
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

      {/* Footer */}
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
}
