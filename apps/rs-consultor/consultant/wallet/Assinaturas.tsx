import React from 'react';
import Card from '../../components/Card';
import { mockSubscriptions } from '../data';
import { IconRepeat } from '../../components/icons';

const statusMap = {
  active: { label: 'Ativa', color: 'bg-green-500/20 text-green-400' },
  paused: { label: 'Pausada', color: 'bg-yellow-500/20 text-yellow-400' },
  cancelled: { label: 'Cancelada', color: 'bg-red-500/20 text-red-400' },
};

const Assinaturas: React.FC = () => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gerenciar Assinaturas</h2>
        <button className="flex items-center justify-center space-x-2 text-sm bg-brand-gold text-brand-dark font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors">
            <IconRepeat size={16} />
            <span>Novo Plano</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-brand-gray text-sm text-gray-400">
            <tr>
              <th className="p-3">Plano / Cliente</th>
              <th className="p-3">Próx. Cobrança</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {mockSubscriptions.map(sub => (
              <tr key={sub.id} className="border-b border-brand-gray-light last:border-b-0 hover:bg-brand-gray-light/50">
                <td className="p-3 text-sm">
                    <p className="font-semibold text-white">{sub.planName}</p>
                    <p className="text-xs text-gray-400">{sub.customerName}</p>
                </td>
                <td className="p-3 text-sm">{sub.nextBillingDate}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusMap[sub.status].color}`}>
                      {statusMap[sub.status].label}
                  </span>
                </td>
                <td className="p-3 text-right font-semibold text-white">
                  {sub.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default Assinaturas;
