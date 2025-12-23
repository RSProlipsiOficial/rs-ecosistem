import React, { useMemo } from 'react';
import { Checkout } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Filter } from 'lucide-react';

interface FunnelAnalysisProps {
  checkouts: Checkout[];
}

export const FunnelAnalysis: React.FC<FunnelAnalysisProps> = ({ checkouts }) => {

  const funnelData = useMemo(() => {
    const totalInitiated = checkouts.length;
    if (totalInitiated === 0) return [];

    const stepCounts = {
      'dados_pessoais': checkouts.filter(c => ['dados_pessoais', 'endereco_frete', 'pagamento', 'upsell', 'concluido'].includes(c.currentStep || '')).length,
      'endereco_frete': checkouts.filter(c => ['endereco_frete', 'pagamento', 'upsell', 'concluido'].includes(c.currentStep || '')).length,
      'pagamento': checkouts.filter(c => ['pagamento', 'upsell', 'concluido'].includes(c.currentStep || '')).length,
      'concluido': checkouts.filter(c => c.status === 'concluido').length,
    };

    const data = [
      { name: 'Iniciou Checkout', value: stepCounts.dados_pessoais, conversion: 100 },
      { name: 'Preencheu Endereço', value: stepCounts.endereco_frete, conversion: (stepCounts.dados_pessoais > 0 ? (stepCounts.endereco_frete / stepCounts.dados_pessoais) * 100 : 0) },
      { name: 'Chegou ao Pagamento', value: stepCounts.pagamento, conversion: (stepCounts.endereco_frete > 0 ? (stepCounts.pagamento / stepCounts.endereco_frete) * 100 : 0) },
      { name: 'Venda Concluída', value: stepCounts.concluido, conversion: (stepCounts.pagamento > 0 ? (stepCounts.concluido / stepCounts.pagamento) * 100 : 0) },
    ];
    
    return data;
  }, [checkouts]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><Filter /> Análise de Funil</h2>
          <p className="text-sm text-slate-400">Visualize as taxas de conversão em cada etapa do checkout.</p>
        </div>
      </div>

      <div className="bg-rs-card p-6 rounded-xl border border-rs-goldDim/20">
        <h3 className="font-bold text-slate-200 mb-6">Funil de Conversão do Checkout</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#888" />
              <YAxis dataKey="name" type="category" width={150} stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333' }}
                formatter={(value, name, props) => [`${value} (${props.payload.conversion.toFixed(1)}%)`, 'Usuários']}
              />
              <Bar dataKey="value" fill="#d4af37" barSize={40}>
                 <LabelList 
                    dataKey="value" 
                    position="right" 
                    style={{ fill: '#e5e5e5', fontWeight: 'bold' }} 
                    formatter={(value: number) => `${value}`}
                 />
                 <LabelList 
                    dataKey="conversion" 
                    position="insideRight"
                    style={{ fill: '#0a0a0a' }} 
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                 />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};