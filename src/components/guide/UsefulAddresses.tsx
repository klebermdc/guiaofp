import { MapPin, Navigation, ExternalLink, Building2, Hospital, ShoppingBag, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Address {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  category?: string;
}

// Parks data with coordinates
const disneyParks: Address[] = [
  { name: 'Magic Kingdom', address: '1180 Seven Seas Dr, Lake Buena Vista, FL 32830', lat: 28.4177, lng: -81.5812 },
  { name: 'EPCOT', address: '200 Epcot Center Dr, Lake Buena Vista, FL 32821', lat: 28.3747, lng: -81.5494 },
  { name: 'Hollywood Studios', address: '351 S Studio Dr, Lake Buena Vista, FL 32830', lat: 28.3575, lng: -81.5582 },
  { name: 'Animal Kingdom', address: '2901 Osceola Pkwy, Lake Buena Vista, FL 32830', lat: 28.3553, lng: -81.5901 },
  { name: 'Disney Springs', address: '1486 Buena Vista Dr, Lake Buena Vista, FL 32830', lat: 28.3717, lng: -81.5183 },
  { name: 'Typhoon Lagoon', address: '1145 E Buena Vista Dr, Lake Buena Vista, FL 32830', lat: 28.3656, lng: -81.5280 },
  { name: 'Blizzard Beach', address: '1534 Blizzard Beach Dr, Lake Buena Vista, FL 32830', lat: 28.3524, lng: -81.5757 },
];

const universalParks: Address[] = [
  { name: 'Universal Studios Florida', address: '6000 Universal Blvd, Orlando, FL 32819', lat: 28.4793, lng: -81.4689 },
  { name: 'Islands of Adventure', address: '6000 Universal Blvd, Orlando, FL 32819', lat: 28.4717, lng: -81.4722 },
  { name: 'Epic Universe', address: '2699 Kirkman Rd, Orlando, FL 32819', lat: 28.4725, lng: -81.4575 },
  { name: 'Volcano Bay', address: '6000 Universal Blvd, Orlando, FL 32819', lat: 28.4620, lng: -81.4710 },
  { name: 'CityWalk', address: '6000 Universal Blvd, Orlando, FL 32819', lat: 28.4742, lng: -81.4687 },
];

const seaworldParks: Address[] = [
  { name: 'SeaWorld Orlando', address: '7007 Sea World Dr, Orlando, FL 32821', lat: 28.4110, lng: -81.4614 },
  { name: 'Aquatica Orlando', address: '5800 Water Play Way, Orlando, FL 32821', lat: 28.4128, lng: -81.4573 },
  { name: 'Discovery Cove', address: '6000 Discovery Cove Way, Orlando, FL 32821', lat: 28.4052, lng: -81.4607 },
  { name: 'Busch Gardens Tampa', address: '10165 McKinley Dr, Tampa, FL 33612', lat: 28.0372, lng: -82.4208 },
  { name: 'Adventure Island Tampa', address: '10001 McKinley Dr, Tampa, FL 33612', lat: 28.0344, lng: -82.4186 },
];

const otherParks: Address[] = [
  { name: 'LEGOLAND Florida', address: '1 Legoland Way, Winter Haven, FL 33884', lat: 28.0926, lng: -81.6915 },
  { name: 'ICON Park', address: '8401 International Dr, Orlando, FL 32819', lat: 28.4427, lng: -81.4702 },
  { name: 'Fun Spot America', address: '5700 Fun Spot Way, Orlando, FL 32819', lat: 28.4666, lng: -81.4508 },
  { name: 'Gatorland', address: '14501 S Orange Blossom Trail, Orlando, FL 32837', lat: 28.3553, lng: -81.4023 },
];

const hospitals: Address[] = [
  { name: 'AdventHealth Celebration', address: '400 Celebration Pl, Celebration, FL 34747', lat: 28.3188, lng: -81.5339, phone: '+1 407-303-4000', category: 'Hospital 24h' },
  { name: 'Dr. Phillips Hospital', address: '9400 Turkey Lake Rd, Orlando, FL 32819', lat: 28.4489, lng: -81.4849, phone: '+1 407-351-8500', category: 'Hospital 24h' },
  { name: 'AdventHealth Orlando', address: '601 E Rollins St, Orlando, FL 32803', lat: 28.5651, lng: -81.3647, phone: '+1 407-303-5600', category: 'Hospital 24h' },
  { name: 'Orlando Health - Arnold Palmer', address: '92 W Miller St, Orlando, FL 32806', lat: 28.5225, lng: -81.3797, phone: '+1 321-841-5111', category: 'Hospital Pediátrico' },
  { name: 'Orlando Regional Medical Center', address: '52 W Underwood St, Orlando, FL 32806', lat: 28.5254, lng: -81.3784, phone: '+1 321-841-5111', category: 'Hospital 24h' },
  { name: 'Centra Care Walk-In (I-Drive)', address: '6001 Vineland Rd, Orlando, FL 32819', lat: 28.4509, lng: -81.4718, phone: '+1 407-351-6682', category: 'Urgent Care' },
  { name: 'Centra Care Walk-In (Lake Buena Vista)', address: '12500 S Apopka Vineland Rd, Orlando, FL 32836', lat: 28.3867, lng: -81.5105, phone: '+1 407-934-2273', category: 'Urgent Care' },
];

const airports: Address[] = [
  { name: 'Orlando International Airport (MCO)', address: '1 Jeff Fuqua Blvd, Orlando, FL 32827', lat: 28.4312, lng: -81.3081, category: 'Principal' },
  { name: 'Orlando Sanford Airport (SFB)', address: '1200 Red Cleveland Blvd, Sanford, FL 32773', lat: 28.7776, lng: -81.2375, category: 'Alternativo' },
  { name: 'Tampa International Airport (TPA)', address: '4100 George J Bean Pkwy, Tampa, FL 33607', lat: 27.9756, lng: -82.5333, category: 'Tampa' },
];

const shopping: Address[] = [
  { name: 'Orlando Premium Outlets (Vineland)', address: '8200 Vineland Ave, Orlando, FL 32821', lat: 28.3731, lng: -81.5011, category: 'Outlet' },
  { name: 'Orlando Premium Outlets (I-Drive)', address: '4951 International Dr, Orlando, FL 32819', lat: 28.4971, lng: -81.4512, category: 'Outlet' },
  { name: 'The Mall at Millenia', address: '4200 Conroy Rd, Orlando, FL 32839', lat: 28.4850, lng: -81.4322, category: 'Shopping' },
  { name: 'Florida Mall', address: '8001 S Orange Blossom Trail, Orlando, FL 32809', lat: 28.4494, lng: -81.3965, category: 'Shopping' },
  { name: 'Walmart Supercenter (Kissimmee)', address: '3250 Vineland Rd, Kissimmee, FL 34746', lat: 28.3544, lng: -81.4989, category: 'Supermercado' },
  { name: 'Target (I-Drive)', address: '4795 S Kirkman Rd, Orlando, FL 32811', lat: 28.4613, lng: -81.4568, category: 'Loja' },
  { name: 'Best Buy (Millenia)', address: '4601 Millenia Plaza Way, Orlando, FL 32839', lat: 28.4847, lng: -81.4298, category: 'Eletrônicos' },
  { name: 'Apple Store (Millenia)', address: '4200 Conroy Rd #172, Orlando, FL 32839', lat: 28.4853, lng: -81.4320, category: 'Eletrônicos' },
];

// Helper functions for navigation
const openGoogleMaps = (lat: number, lng: number, name: string) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
  window.open(url, '_blank');
};

const openWaze = (lat: number, lng: number) => {
  const url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  window.open(url, '_blank');
};

// Address Card Component
const AddressCard = ({ item, showCategory = false }: { item: Address; showCategory?: boolean }) => (
  <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm sm:text-base">{item.name}</p>
          {showCategory && item.category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {item.category}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{item.address}</p>
        {item.phone && (
          <a href={`tel:${item.phone}`} className="text-xs sm:text-sm text-blue-600 hover:underline mt-1 block">
            📞 {item.phone}
          </a>
        )}
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2 sm:px-3 text-xs bg-[#33CCFF]/10 hover:bg-[#33CCFF]/20 border-[#33CCFF]/30 text-[#33CCFF]"
          onClick={() => openWaze(item.lat, item.lng)}
        >
          <Navigation className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">Waze</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2 sm:px-3 text-xs bg-[#4285F4]/10 hover:bg-[#4285F4]/20 border-[#4285F4]/30 text-[#4285F4]"
          onClick={() => openGoogleMaps(item.lat, item.lng, item.name)}
        >
          <MapPin className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">Maps</span>
        </Button>
      </div>
    </div>
  </div>
);

// Category Section Component
const CategorySection = ({ title, items, showCategory = false }: { title: string; items: Address[]; showCategory?: boolean }) => (
  <div className="space-y-3">
    <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{title}</h5>
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <AddressCard key={item.name} item={item} showCategory={showCategory} />
      ))}
    </div>
  </div>
);

export const UsefulAddresses = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="parks" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 rounded-xl p-1 mb-6 h-auto">
          <TabsTrigger value="parks" className="rounded-lg text-xs sm:text-sm py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
            <Building2 className="w-4 h-4 mr-1 hidden sm:block" />
            Parques
          </TabsTrigger>
          <TabsTrigger value="hospitals" className="rounded-lg text-xs sm:text-sm py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
            <Hospital className="w-4 h-4 mr-1 hidden sm:block" />
            Saúde
          </TabsTrigger>
          <TabsTrigger value="airports" className="rounded-lg text-xs sm:text-sm py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            <Plane className="w-4 h-4 mr-1 hidden sm:block" />
            Aeroportos
          </TabsTrigger>
          <TabsTrigger value="shopping" className="rounded-lg text-xs sm:text-sm py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
            <ShoppingBag className="w-4 h-4 mr-1 hidden sm:block" />
            Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parks" className="space-y-6">
          <CategorySection title="🏰 Walt Disney World" items={disneyParks} />
          <CategorySection title="🎢 Universal Orlando Resort" items={universalParks} />
          <CategorySection title="🐬 SeaWorld Parks" items={seaworldParks} />
          <CategorySection title="🎡 Outros Parques" items={otherParks} />
        </TabsContent>

        <TabsContent value="hospitals" className="space-y-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 mb-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-red-600">⚠️ Emergência:</strong> Ligue <strong>911</strong> para emergências. 
              Para atendimento não-urgente, procure um <strong>Urgent Care (Centra Care)</strong> - mais rápido e barato que hospital.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {hospitals.map((item) => (
              <AddressCard key={item.name} item={item} showCategory />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="airports" className="space-y-6">
          <div className="grid gap-3">
            {airports.map((item) => (
              <AddressCard key={item.name} item={item} showCategory />
            ))}
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-blue-600">💡 Dica:</strong> O aeroporto <strong>MCO</strong> é o mais próximo dos parques (20-30 min). 
              O <strong>SFB</strong> pode ter voos mais baratos, mas fica 45-60 min de distância.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="shopping" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {shopping.map((item) => (
              <AddressCard key={item.name} item={item} showCategory />
            ))}
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-pink-600">🛍️ Dica:</strong> Os <strong>Premium Outlets</strong> têm os melhores preços. 
              O <strong>Mall at Millenia</strong> é mais sofisticado (Apple, Louis Vuitton, etc).
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsefulAddresses;
