import { Card, CardContent } from '@/components/ui/card';

const tips = [
  {
    category: '✈️ Chegada no Aeroporto',
    items: [
      'O Aeroporto de Orlando (MCO) fica a ~25 min de Disney e ~20 min de Universal — via Uber custa US$30–45',
      'Mears Connect é o serviço oficial de shuttle — compartilhado sai ~US$25/pessoa, privado ~US$130/van',
      'Aluguel de carro no MCO: as agências ficam no Terminal B — pegue o trem interno para chegar lá',
      'Evite pegar Uber na área de chegadas — vá ao nível superior (Departures) para espera menor',
      'Sempre reserve o transfer de volta com antecedência — não deixe para o dia da viagem',
    ],
  },
  {
    category: '🏰 Disney World',
    items: [
      'Hóspedes Disney têm estacionamento GRATUITO nos parques — uma das maiores vantagens de ficar on-site',
      'O Skyliner (teleférico) é lindo e rápido: conecta Caribbean Beach e Art of Animation ao Epcot e Hollywood Studios',
      'Monorail: conecta Magic Kingdom, Grand Floridian, Polynesian e Contemporary de forma direta',
      'O TTC (Transportation & Ticket Center) é o hub central — de lá saem barcos e monorail',
      'Ônibus Disney funcionam das 6h até 2h da manhã — frequência de 20 min',
    ],
  },
  {
    category: '🎢 Universal Orlando',
    items: [
      'Hóspedes do Hard Rock, Portofino e Royal Pacific podem caminhar até os parques — enorme vantagem',
      'Barco gratuito do Portofino e Hard Rock até CityWalk — rota linda e funcional',
      'Estacionamento padrão: ~US$30/dia. Preferred: ~US$50/dia. Prime: ~US$70/dia',
      'Para o Epic Universe, verifique rotas de transporte do seu hotel — é em área separada',
      'Cabana Bay e Aventura têm shuttle gratuito — a cada 15 min nos horários de pico',
    ],
  },
  {
    category: '📱 Uber & Lyft',
    items: [
      'Sempre compare preços entre Uber e Lyft antes de cada corrida — pode variar 30%',
      'Uber Reserve garante preço fixo — ideal para saídas de shows e fogos de artifício',
      'Área de pick-up dos parques Disney fica no estacionamento — caminhe até lá para evitar filas',
      'Para o aeroporto, Mears Connect (~US$25pp) é mais previsível que Uber com surge',
      'Uber Pool / Lyft Shared pode economizar 30–40% em corridas no I-Drive',
    ],
  },
  {
    category: '🚗 Aluguel de Carro',
    items: [
      'Reserve com antecedência pela Costco Travel, Kayak ou diretamente com Alamo/National',
      'Tire fotos de TODOS os arranhões do carro ao retirar — envie por e-mail para você mesmo',
      'Abasteça sempre ANTES de devolver — o reabastecimento pela locadora custa o dobro',
      'Verifique se seu cartão de crédito oferece CDW/LDW gratuito para locação internacional',
      'GPS do celular + suporte de celular é mais prático que o GPS da locadora (cobrado à parte)',
      'Pedágios na FL são eletrônicos (SunPass/Uni) — locadoras cobram taxa diária pelo transponder',
    ],
  },
  {
    category: '💡 Dicas Gerais',
    items: [
      'Google Maps funciona perfeitamente em Orlando — baixe o mapa offline antes de sair do Brasil',
      'A Florida tem lei de cinto de segurança obrigatório — inclusive no banco traseiro',
      'Velocidade máxima nas highways é 65–70 mph — não exagere, multas são pesadas',
      'Estacione SEMPRE de ré — é mais seguro e facilita saídas rápidas no fim do dia',
      'Em dias de parque aquático, Uber pode ser mais prático (você volta molhado)',
      'Mantenha a CNH Internacional junto com a brasileira — as duas são obrigatórias',
    ],
  },
];

export default function TransportTips() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Dicas reais de quem conhece Orlando — tudo testado e aprovado por viajantes brasileiros.
      </p>
      {tips.map((section, idx) => (
        <Card key={idx}>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">{section.category}</h3>
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
