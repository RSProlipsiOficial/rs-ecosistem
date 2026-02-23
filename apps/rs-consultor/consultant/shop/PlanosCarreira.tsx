import React from 'react';
import Card from '../../components/Card';
import { mockShopCareerPlan } from '../data';
import { IconAward } from '../../components/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PlanosCarreira: React.FC = () => {
  const { currentRevenue, quarterlyRevenue, monthlyGrowth, pinTable } = mockShopCareerPlan;
  
  let currentPin = { pin: 'Iniciante', revenue: 0, bonus: 0, iconColor: 'text-gray-500' };
  let nextPin = pinTable[0];
  let revenueForCurrentPin = 0;
  
  // Determine the user's current and next PIN based on their revenue
  for (let i = pinTable.length - 1; i >= 0; i--) {
    if (currentRevenue >= pinTable[i].revenue) {
      currentPin = pinTable[i];
      revenueForCurrentPin = pinTable[i].revenue;
      nextPin = pinTable[i + 1] || pinTable[i]; // If it's the last pin, next is itself
      break;
    }
  }

  const revenueIntoCurrentTier = currentRevenue - revenueForCurrentPin;
  const revenueNeededForNextTier = nextPin.revenue - revenueForCurrentPin;
  const progressPercentage = revenueNeededForNextTier > 0 ? (revenueIntoCurrentTier / revenueNeededForNextTier) * 100 : 100;

  const chartData = monthlyGrowth;
  const averageMonthlyGrowth = chartData.reduce((acc, item) => acc + item.revenue, 0) / chartData.length;
  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Velocimetro Card */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
            <div className={`absolute inset-0 m-auto h-64 w-64 rounded-full ${currentPin.iconColor} opacity-20 blur-3xl animate-pulse`}></div>
            
            <p className="text-lg text-gray-400">Seu PIN Atual</p>
            <IconAward className={`h-24 w-24 ${currentPin.iconColor} my-4 drop-shadow-lg`} />
            <h2 className="text-4xl font-extrabold text-white">{currentPin.pin}</h2>
            <p className="font-mono text-lg text-gray-300 mt-2">{formatCurrency(currentRevenue)} / {formatCurrency(nextPin.revenue)}</p>
            
            <div className="w-full max-w-sm mt-6">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>{currentPin.pin}</span>
                  <span>{nextPin.pin}</span>
              </div>
              <div className="w-full bg-brand-gray h-4 rounded-full shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-brand-gold h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-gray w-full max-w-sm">
                <p className="text-gray-400">Faturamento do Trimestre</p>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(quarterlyRevenue)}</p>
            </div>
          </Card>
        </div>

        {/* Chart and Summary Side */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Evolução de Faturamento</h3>
            <div className="h-60 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                      <XAxis type="number" stroke="#888" fontSize={12} tickFormatter={(value) => `R$${Number(value)/1000}k`} />
                      <YAxis type="category" dataKey="month" stroke="#888" width={50} fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#222', border: '1px solid #333' }} 
                        cursor={{fill: '#ffffff10'}}
                        formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                      />
                      <Legend wrapperStyle={{fontSize: "12px"}}/>
                      <Bar dataKey="revenue" name="Faturamento" fill="#FFD700" />
                  </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Resumo da Carreira</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="text-gray-300">Próximo PIN:</span><span className="font-bold text-white bg-brand-gray-light px-2 py-1 rounded">{nextPin.pin}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-300">Faturamento Restante:</span><span className="font-bold text-white bg-brand-gray-light px-2 py-1 rounded">{formatCurrency(Math.max(0, nextPin.revenue - currentRevenue))}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-300">Média Mensal:</span><span className="font-bold text-white bg-brand-gray-light px-2 py-1 rounded">{formatCurrency(averageMonthlyGrowth)}</span></div>
              <button className="mt-4 w-full text-center py-2 bg-brand-gray hover:bg-brand-gray-light rounded-lg transition-colors text-sm font-semibold">Ver Histórico Completo</button>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <h2 className="text-2xl font-bold text-white mb-6">Tabela de PINs e Premiações da RS Shop</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pinTable.map(pin => {
            const isConquered = currentRevenue >= pin.revenue;
            const isCurrent = currentPin.pin === pin.pin;
            let progress = 0;
            if (isConquered) {
                progress = 100;
            } else if (isCurrent) {
                progress = progressPercentage;
            }

            return (
              <div key={pin.pin} className={`p-4 rounded-xl transition-all duration-300 border ${isCurrent ? 'border-brand-gold shadow-gold-glow' : 'border-brand-gray'} ${isConquered ? 'bg-brand-gold/10' : 'bg-brand-gray-light'}`}>
                  <div className="flex items-center space-x-3 mb-3">
                      <IconAward className={`h-8 w-8 flex-shrink-0 ${pin.iconColor}`} />
                      <div>
                          <h4 className={`font-bold text-lg ${isCurrent || isConquered ? 'text-white' : 'text-gray-400'}`}>{pin.pin}</h4>
                          <p className="text-xs text-gray-400">Faturamento: {formatCurrency(pin.revenue)}</p>
                      </div>
                      {isConquered && !isCurrent && <span className="ml-auto text-xs bg-brand-gold text-brand-dark font-bold px-2 py-0.5 rounded-full">Conquistado</span>}
                  </div>
                  <div className="w-full bg-brand-gray rounded-full h-1.5 my-2">
                      <div className="bg-brand-gold h-1.5 rounded-full" style={{width: `${progress}%`}}></div>
                  </div>
                  <p className="text-right font-semibold text-green-400">Bônus: {formatCurrency(pin.bonus)}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  );
};

export default PlanosCarreira;
