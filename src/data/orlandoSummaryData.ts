import { FerrisWheel, ShoppingBag, Hotel, Car, UtensilsCrossed } from "lucide-react";

export interface OrlandoSection {
  id: string;
  title: string;
  icon: typeof FerrisWheel;
  color: string; // HSL accent color for the section
  items: { title: string; description: string }[];
}

export const orlandoSections: OrlandoSection[] = [
  {
    id: "parques",
    title: "Parques",
    icon: FerrisWheel,
    color: "hsl(82 72% 55%)", // lime green
    items: [
      { title: "Walt Disney World Resort", description: "Onde a magia ganha vida com 4 parques temáticos icônicos." },
      { title: "Universal Orlando Resort", description: "Aventura e adrenalina nos parques Universal Studios e Islands of Adventure." },
      { title: "SeaWorld Orlando", description: "Mergulhe no mundo marinho com shows e montanhas-russas emocionantes." },
      { title: "Busch Gardens Tampa Bay", description: "Uma mistura eletrizante de parques temáticos e zoológico, a uma curta distância." },
    ],
  },
  {
    id: "compras",
    title: "Compras",
    icon: ShoppingBag,
    color: "hsl(280 60% 65%)", // purple
    items: [
      { title: "Outlets Premium", description: "Encontre as melhores marcas com preços incríveis." },
      { title: "Shoppings Centers", description: "Opções variadas para todos os estilos e orçamentos." },
      { title: "Lojas Temáticas", description: "Produtos exclusivos dos seus personagens favoritos." },
    ],
  },
  {
    id: "hoteis",
    title: "Hotéis",
    icon: Hotel,
    color: "hsl(200 80% 55%)", // sky blue
    items: [
      { title: "Resorts Temáticos", description: "Viva a imersão completa dentro dos complexos dos parques." },
      { title: "Hotéis Econômicos", description: "Conforto e praticidade para sua estadia com excelente custo-benefício." },
      { title: "Aluguel de Casas", description: "Para famílias grandes ou quem busca mais espaço e privacidade." },
    ],
  },
  {
    id: "carro",
    title: "Carro",
    icon: Car,
    color: "hsl(35 90% 55%)", // amber
    items: [
      { title: "Liberdade para explorar", description: "Indispensável para otimizar tempo e visitar todos os pontos." },
      { title: "Opções de locadoras", description: "Variedade de veículos e seguros para sua segurança." },
      { title: "Fácil navegação", description: "Estradas bem sinalizadas e com pedágios simplificados." },
    ],
  },
  {
    id: "alimentacao",
    title: "Alimentação",
    icon: UtensilsCrossed,
    color: "hsl(350 70% 60%)", // rose
    items: [
      { title: "Gastronomia diversificada", description: "De fast food a restaurantes gourmet, para todos os paladares." },
      { title: "Personagens e Buffets", description: "Experiências gastronômicas temáticas e inesquecíveis." },
      { title: "Opções saudáveis", description: "A cidade oferece diversas alternativas veganas e vegetarianas." },
    ],
  },
];
