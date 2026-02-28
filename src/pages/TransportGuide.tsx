import { useState } from 'react';
import { transportOptions } from '@/data/transportData';
import TransportCard from '@/components/transport/TransportCard';
import TransportSimulator from '@/components/transport/TransportSimulator';
import TransportTips from '@/components/transport/TransportTips';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Car, Calculator, Lightbulb } from 'lucide-react';

type ActiveTab = 'overview' | 'simulator' | 'tips';

const TransportGuidePage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const tabs = [
    { id: 'overview' as ActiveTab, label: 'Visão Geral', icon: Car },
    { id: 'simulator' as ActiveTab, label: 'Simulador', icon: Calculator },
    { id: 'tips' as ActiveTab, label: 'Dicas', icon: Lightbulb },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">Guia Completo</Badge>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            🚗 Transporte em Orlando
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Uber, aluguel de carro, shuttle ou ônibus? Compare todas as opções e descubra
            quanto vai gastar de verdade — muita gente se surpreende ao saber que{' '}
            <strong className="text-foreground">alugar um carro pode ser mais barato que Uber para famílias</strong>.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Modais comparados', value: '6', icon: '🚗' },
            { label: 'Custo mín. Uber/dia', value: 'US$50+', icon: '📱' },
            { label: 'Aluguel carro/dia', value: 'US$55–85', icon: '🔑' },
            { label: 'Transporte Disney', value: 'Grátis', icon: '🏰' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border/50 rounded-xl p-3 text-center space-y-1">
              <p className="text-xl">{stat.icon}</p>
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-muted/50 rounded-xl p-1.5 flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Toque em qualquer card para ver detalhes, prós, contras e dicas de cada opção.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transportOptions.map((option) => (
                <TransportCard key={option.id} option={option} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'simulator' && <TransportSimulator />}

        {activeTab === 'tips' && <TransportTips />}
      </div>
    </AppLayout>
  );
};

export default TransportGuidePage;
