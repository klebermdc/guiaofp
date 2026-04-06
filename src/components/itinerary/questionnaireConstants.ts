import { CalendarIcon, Users, Wallet, Compass, Car, Ticket, CreditCard, Hotel, Heart, Sparkles, ListOrdered, ClipboardList } from 'lucide-react';

export const STORAGE_KEY = 'roteiro-questionario-draft';
export const TOTAL_STEPS = 12;

export const stepConfig = [
  { title: 'Datas da Viagem', icon: CalendarIcon },
  { title: 'Quem Vai Viajar', icon: Users },
  { title: 'Orçamento e Perfil', icon: Wallet },
  { title: 'Estilo de Viagem', icon: Compass },
  { title: 'Transporte e Hospedagem', icon: Car },
  { title: 'Parques e Atividades', icon: Ticket },
  { title: 'Ingressos Disney', icon: CreditCard },
  { title: 'Hospedagem', icon: Hotel },
  { title: 'Saúde e Restrições', icon: Heart },
  { title: 'Detalhes Especiais', icon: Sparkles },
  { title: 'Suas Prioridades', icon: ListOrdered },
  { title: 'Resumo Final', icon: ClipboardList },
];

export const budgetOptions = [
  { value: 'economico', label: 'Econômico', description: 'Até $150/dia', emoji: '💵' },
  { value: 'moderado', label: 'Moderado', description: '$150-300/dia', emoji: '💳' },
  { value: 'confortavel', label: 'Confortável', description: '$300-500/dia', emoji: '💎' },
  { value: 'premium', label: 'Premium', description: '$500+/dia', emoji: '👑' },
];

export const travelStyleOptions = [
  { value: 'tranquilo', label: 'Tranquilo', emoji: '🧘', description: 'Sem pressa' },
  { value: 'equilibrado', label: 'Equilibrado', emoji: '⚖️', description: 'Mix de atividades' },
  { value: 'agitado', label: 'Agitado', emoji: '🏃', description: 'Máximo de atrações' },
  { value: 'focado_parques', label: 'Focado em Parques', emoji: '🎢', description: 'Prioridade total' },
  { value: 'focado_compras', label: 'Focado em Compras', emoji: '🛍️', description: 'Outlets e shopping' },
];

export const parksInterestOptions = [
  { value: 'altissimo', label: 'Altíssimo', emoji: '🔥', description: 'Todos os parques!' },
  { value: 'alto', label: 'Alto', emoji: '⭐', description: 'Parques são prioridade' },
  { value: 'moderado', label: 'Moderado', emoji: '👍', description: 'Alguns parques' },
  { value: 'baixo', label: 'Baixo', emoji: '🌴', description: 'Outras atividades' },
];

export const airportTransferOptions = [
  { value: 'uber_lyft', label: 'Uber / Lyft', emoji: '🚗' },
  { value: 'aluguel_carro', label: 'Alugar carro', emoji: '🚙' },
  { value: 'transfer_hotel', label: 'Transfer hotel', emoji: '🚐' },
  { value: 'transporte_contratado', label: 'Contratado', emoji: '🚌' },
  { value: 'nao_definido', label: 'Não decidi', emoji: '🤔' },
];

export const rentCarOptions = [
  { value: 'sim', label: 'Sim', emoji: '✅' },
  { value: 'nao', label: 'Não', emoji: '❌' },
  { value: 'talvez', label: 'Talvez', emoji: '🤔' },
];

export const stayingRegionOptions = [
  { value: 'international_drive', label: 'International Drive' },
  { value: 'kissimmee', label: 'Kissimmee' },
  { value: 'lake_buena_vista', label: 'Lake Buena Vista' },
  { value: 'orlando_downtown', label: 'Orlando Downtown' },
  { value: 'universal_area', label: 'Área Universal' },
  { value: 'outro', label: 'Outra região' },
];

export const accommodationTypeOptions = [
  { value: 'hotel_economico', label: 'Hotel Econômico', emoji: '🏨' },
  { value: 'hotel_medio', label: 'Hotel Médio', emoji: '🏢' },
  { value: 'hotel_luxo', label: 'Hotel Luxo', emoji: '✨' },
  { value: 'resort_disney', label: 'Resort Disney', emoji: '🏰' },
  { value: 'resort_universal', label: 'Resort Universal', emoji: '🎬' },
  { value: 'casa_airbnb', label: 'Casa/Airbnb', emoji: '🏠' },
  { value: 'outro', label: 'Outro', emoji: '📍' },
];

export const parksOptions = [
  { value: 'magic_kingdom', label: 'Magic Kingdom', emoji: '🏰' },
  { value: 'epcot', label: 'EPCOT', emoji: '🌍' },
  { value: 'hollywood_studios', label: 'Hollywood Studios', emoji: '🎬' },
  { value: 'animal_kingdom', label: 'Animal Kingdom', emoji: '🦁' },
  { value: 'universal_studios', label: 'Universal Studios', emoji: '🎥' },
  { value: 'islands_of_adventure', label: 'Islands of Adventure', emoji: '🦖' },
  { value: 'epic_universe', label: 'Epic Universe', emoji: '🌟' },
  { value: 'volcano_bay', label: 'Volcano Bay', emoji: '🌋' },
  { value: 'seaworld', label: 'SeaWorld', emoji: '🐬' },
  { value: 'busch_gardens', label: 'Busch Gardens', emoji: '🎢' },
  { value: 'legoland', label: 'LEGOLAND', emoji: '🧱' },
  { value: 'aquatica', label: 'Aquatica', emoji: '💦' },
];

export const additionalActivitiesOptions = [
  { value: 'compras_outlets', label: 'Outlets', emoji: '🛍️' },
  { value: 'compras_shopping', label: 'Shoppings', emoji: '🏬' },
  { value: 'restaurantes_finos', label: 'Restaurantes', emoji: '🍽️' },
  { value: 'kennedy_space', label: 'Kennedy Space', emoji: '🚀' },
  { value: 'airboat', label: 'Airboat', emoji: '🐊' },
  { value: 'golfe', label: 'Golfe', emoji: '⛳' },
  { value: 'basketball_nba', label: 'Jogo NBA', emoji: '🏀' },
  { value: 'disney_springs', label: 'Disney Springs', emoji: '🎭' },
  { value: 'universal_citywalk', label: 'CityWalk', emoji: '🎤' },
  { value: 'spa_relaxamento', label: 'Spa', emoji: '💆' },
  { value: 'fotos_profissionais', label: 'Ensaio Foto', emoji: '📸' },
  { value: 'dia_piscina', label: 'Piscina', emoji: '🏊' },
];
