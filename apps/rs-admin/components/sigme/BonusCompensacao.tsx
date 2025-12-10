

import React from 'react';
import Card from '../Card';
import { mockBonuses } from './data';
import { IconDownload, IconHandCoins } from '../icons';

const formatCurrency = (value: number | string | null | undefined): string => {
    if (value == null || value === '') {
        return 'R$ 0,00';
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) {
        return 'R$ 0,00';
    }
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const BonusCompensacao: React.FC = () => {
    const totalMes = mockBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    const totalAcumulado = totalMes + 1250.75; // Mock accumulated value

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-gold">Bônus de Compensação</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <div className="flex items-center space-x-4">
                <IconHandCoins className="h-8 w-8 text-brand-gold" />
                <div>
                  <p className="text-gray-400 text-sm">Total de Bônus (Mês)</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(totalMes)}</p>
                </div>
            </div>
        </Card>
        <Card>
            <div className="flex items-center space-x-4">
                <IconHandCoins className="h-8 w-8 text-brand-gold" />
                <div>
                  <p className="text-gray-400 text-sm">Total Acumulado</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(totalAcumulado)}</p>
                </div>
            </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-white">Origem dos Bônus</h2>
            <div className="flex items-center space-x-2">
                <select className="bg-brand-gray border border-brand-gray-light rounded-lg py-2 px-4 focus:ring-2 focus:ring-brand-gold focus:outline-none">
                    <option>Filtrar por tipo</option>
                    <option>Direto</option>
                    <option>Indireto</option>
                    <option>Derramamento</option>
                </select>
                <button className="flex items-center space-x-2 text-sm bg-brand-gray px-4 py-2 rounded-lg hover:bg-brand-gray-light">
                    <IconDownload size={16} />
                    <span>Exportar (CSV)</span>
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-brand-gray text-sm text-gray-400">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Origem</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {mockBonuses.map(bonus => (
                <tr key={bonus.id} className="border-b border-brand-gray-light hover:bg-brand-gray-light/50">
                  <td className="p-3">{bonus.date}</td>
                  <td className="p-3">{bonus.type}</td>
                  <td className="p-3">{bonus.source}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        bonus.status === 'pago' ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                    }`}>{bonus.status}</span>
                  </td>
                  <td className="p-3 text-right font-semibold text-green-400">{formatCurrency(bonus.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BonusCompensacao;
