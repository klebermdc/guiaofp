import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { MapPin, Navigation, Loader2, AlertCircle, Star } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Parks data with coordinates
const PARKS = [
  {
    id: 'magic-kingdom',
    name: 'Magic Kingdom',
    center: [28.4177, -81.5812] as LatLngTuple,
    zoom: 16,
    color: '#1E40AF',
  },
  {
    id: 'epcot',
    name: 'EPCOT',
    center: [28.3747, -81.5494] as LatLngTuple,
    zoom: 16,
    color: '#7C3AED',
  },
  {
    id: 'hollywood-studios',
    name: 'Hollywood Studios',
    center: [28.3575, -81.5583] as LatLngTuple,
    zoom: 16,
    color: '#DC2626',
  },
  {
    id: 'animal-kingdom',
    name: 'Animal Kingdom',
    center: [28.3553, -81.5901] as LatLngTuple,
    zoom: 15,
    color: '#059669',
  },
  {
    id: 'universal-studios',
    name: 'Universal Studios',
    center: [28.4753, -81.4682] as LatLngTuple,
    zoom: 16,
    color: '#F59E0B',
  },
  {
    id: 'islands-of-adventure',
    name: 'Islands of Adventure',
    center: [28.4722, -81.4710] as LatLngTuple,
    zoom: 16,
    color: '#0891B2',
  },
  {
    id: 'epic-universe',
    name: 'Epic Universe',
    center: [28.4726, -81.5358] as LatLngTuple,
    zoom: 16,
    color: '#8B5CF6',
  },
];

// Sample attractions with coordinates
const ATTRACTIONS: Record<string, Array<{
  id: string;
  name: string;
  position: LatLngTuple;
  description: string;
  waitTime?: number;
  isNextInAgenda?: boolean;
}>> = {
  'magic-kingdom': [
    { id: '1', name: 'Space Mountain', position: [28.4192, -81.5783], description: 'Montanha-russa no escuro pelo espaço', waitTime: 45 },
    { id: '2', name: 'Big Thunder Mountain', position: [28.4197, -81.5844], description: 'Trem descontrolado por minas de ouro', waitTime: 35 },
    { id: '3', name: 'Pirates of the Caribbean', position: [28.4181, -81.5842], description: 'Navegue com os piratas do Caribe', waitTime: 20 },
    { id: '4', name: 'Haunted Mansion', position: [28.4205, -81.5830], description: 'Tour pela mansão mal-assombrada', waitTime: 25 },
    { id: '5', name: 'Seven Dwarfs Mine Train', position: [28.4203, -81.5802], description: 'Montanha-russa dos Sete Anões', waitTime: 75, isNextInAgenda: true },
  ],
  'universal-studios': [
    { id: '1', name: 'Hollywood Rip Ride Rockit', position: [28.4748, -81.4677], description: 'Montanha-russa com sua trilha sonora', waitTime: 60 },
    { id: '2', name: 'Revenge of the Mummy', position: [28.4755, -81.4693], description: 'Montanha-russa indoor no escuro', waitTime: 40, isNextInAgenda: true },
    { id: '3', name: 'E.T. Adventure', position: [28.4760, -81.4710], description: 'Voe com E.T. para seu planeta', waitTime: 25 },
    { id: '4', name: 'Men in Black', position: [28.4738, -81.4668], description: 'Atire em alienígenas nessa aventura', waitTime: 30 },
  ],
  'islands-of-adventure': [
    { id: '1', name: 'Hagrid\'s Magical Creatures', position: [28.4725, -81.4735], description: 'Moto-coaster pelo mundo mágico', waitTime: 90 },
    { id: '2', name: 'VelociCoaster', position: [28.4712, -81.4695], description: 'Montanha-russa de velociraptores', waitTime: 75 },
    { id: '3', name: 'Incredible Hulk Coaster', position: [28.4718, -81.4680], description: 'Seja lançado como o Hulk', waitTime: 45, isNextInAgenda: true },
  ],
  'epic-universe': [
    { id: '1', name: 'Stardust Racers', position: [28.4730, -81.5355], description: 'Duelo de montanhas-russas', waitTime: 60, isNextInAgenda: true },
    { id: '2', name: 'Mario Kart: Bowser\'s Challenge', position: [28.4722, -81.5362], description: 'Corrida interativa do Mario Kart', waitTime: 90 },
    { id: '3', name: 'Harry Potter and the Battle at the Ministry', position: [28.4728, -81.5348], description: 'Batalha épica no Ministério da Magia', waitTime: 75 },
  ],
};

// Custom marker icons
const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="3"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const nextAttractionIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#F59E0B" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -48],
});

// Component to recenter map
function RecenterMap({ center, zoom }: { center: LatLngTuple; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Component to fly to location
function FlyToLocation({ position }: { position: LatLngTuple | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 18, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

export default function ParkMap() {
  const [selectedPark, setSelectedPark] = useState(PARKS[0]);
  const [userPosition, setUserPosition] = useState<LatLngTuple | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [flyToPosition, setFlyToPosition] = useState<LatLngTuple | null>(null);

  const attractions = ATTRACTIONS[selectedPark.id] || [];
  const nextAttraction = attractions.find(a => a.isNextInAgenda);

  const handleGetLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocalização não suportada pelo navegador');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos: LatLngTuple = [position.coords.latitude, position.coords.longitude];
        setUserPosition(pos);
        setFlyToPosition(pos);
        setIsLoadingLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Permissão de localização negada');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Localização indisponível');
            break;
          case error.TIMEOUT:
            setLocationError('Tempo esgotado ao obter localização');
            break;
          default:
            setLocationError('Erro ao obter localização');
        }
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleNavigateToAttraction = (position: LatLngTuple) => {
    setFlyToPosition(position);
  };

  const handleParkChange = (parkId: string) => {
    const park = PARKS.find(p => p.id === parkId);
    if (park) {
      setSelectedPark(park);
      setFlyToPosition(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Mapa do Parque
            </h1>
            <p className="text-muted-foreground text-sm">Localize-se e encontre as atrações</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedPark.id} onValueChange={handleParkChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
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
              onClick={handleGetLocation}
              disabled={isLoadingLocation}
              variant="outline"
              className="shrink-0"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              <span className="hidden sm:inline ml-2">Minha Localização</span>
            </Button>
          </div>
        </div>

        {/* Location Error */}
        {locationError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {locationError}
          </div>
        )}

        {/* Next Attraction Card */}
        {nextAttraction && (
          <Card className="border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Próxima Atração na Agenda
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{nextAttraction.name}</p>
                  <p className="text-sm text-muted-foreground">{nextAttraction.description}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleNavigateToAttraction(nextAttraction.position)}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  Ver no Mapa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map Container */}
        <div className="h-[calc(100vh-320px)] min-h-[400px] rounded-xl overflow-hidden border shadow-lg">
          <MapContainer
            center={selectedPark.center}
            zoom={selectedPark.zoom}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <RecenterMap center={selectedPark.center} zoom={selectedPark.zoom} />
            <FlyToLocation position={flyToPosition} />

            {/* User Position Marker */}
            {userPosition && (
              <Marker position={userPosition} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <strong>Você está aqui</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Attraction Markers */}
            {attractions.map((attraction) => (
              <Marker
                key={attraction.id}
                position={attraction.position}
                icon={attraction.isNextInAgenda ? nextAttractionIcon : defaultIcon}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-base mb-1">{attraction.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{attraction.description}</p>
                    {attraction.waitTime && (
                      <Badge variant="secondary" className="mb-2">
                        Espera: ~{attraction.waitTime} min
                      </Badge>
                    )}
                    {attraction.isNextInAgenda && (
                      <Badge className="bg-amber-500 text-white block text-center">
                        ⭐ Próxima na Agenda
                      </Badge>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Attractions List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attractions.map((attraction) => (
            <Card
              key={attraction.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                attraction.isNextInAgenda ? 'ring-2 ring-amber-400' : ''
              }`}
              onClick={() => handleNavigateToAttraction(attraction.position)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate flex items-center gap-1">
                      {attraction.isNextInAgenda && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                      {attraction.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{attraction.description}</p>
                  </div>
                  {attraction.waitTime && (
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {attraction.waitTime}min
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
