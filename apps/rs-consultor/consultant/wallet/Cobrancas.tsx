import React from 'react';
import Card from '../../components/Card';
import { mockInvoices } from '../data';
import { IconReceipt } from '../../components/icons';

const statusMap = {
  paid: { label: 'Paga', color: 'bg-green-500/20 text-green-400' },
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400' },
  overdue: { label: 'Vencida', color: 'bg-red-500/20 text-red-400' },
};

const Cobrancas: React.FC = () => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gerenciar Cobranças</h2>
        <button className="flex items-center justify-center space-x-2 text-sm bg-brand-gold text-brand-dark font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors">
            <IconReceipt size={16} />
            <span>Nova Cobrança</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-brand-gray text-sm text-gray-400">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Vencimento</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {mockInvoices.map(invoice => (
              <tr key={invoice.id} className="border-b border-brand-gray-light last:border-b-0 hover:bg-brand-gray-light/50">
                <td className="p-3 text-sm font-semibold text-white">{invoice.customerName}</td>
                <td className="p-3 text-sm">{invoice.dueDate}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusMap[invoice.status].color}`}>
                      {statusMap[invoice.status].label}
                  </span>
                </td>
                <td className="p-3 text-right font-semibold text-white">
                  {invoice.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default Cobrancas;
