import React, { useState, useMemo, FC } from 'react';
import Card from '../../components/Card';
import { mockWalletTransactions, mockAnticipationRequests } from '../data';
import { IconFileClock, IconActive } from '../../components/icons';
import type { AnticipationRequest } from '../../types';

const ANTICIPATION_RATE = 0.30; // 30% of recent earnings
const FEE_RATE = 0.05; // 5% fee

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const InfoCard: FC<{title: string; value: string;}> = ({ title, value }) => (
  <div className="bg-brand-gray p-4 rounded-lg text-center">
    <p className="text-sm text-gray-400">{title}</p>
    <p className="text-2xl font-bold text-brand-gold">{value}</p>
  </div>
);

const statusMap = {
  approved: { label: 'Aprovada', color: 'bg-green-500/20 text-green-400' },
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400' },
  denied: { label: 'Negada', color: 'bg-red-500/20 text-red-400' },
};


const Antecipacao: React.FC = () => {
  const [anticipationHistory, setAnticipationHistory] = useState<AnticipationRequest[]>(mockAnticipationRequests);
  const [requestedAmount, setRequestedAmount] = useState('');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const availableLimit = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEarnings = mockWalletTransactions
      .filter(t => t.amount > 0 && new Date(t.date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    return recentEarnings * ANTICIPATION_RATE;
  }, []);

  const numericAmount = parseFloat(requestedAmount.replace('.', '').replace(',', '.')) || 0;
  const feeAmount = numericAmount * FEE_RATE;
  const netAmount = numericAmount - feeAmount;
  const isAmountValid = numericAmount > 0 && numericAmount <= availableLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAmountValid) return;

    setRequestStatus('loading');
    setTimeout(() => {
      const newRequest: AnticipationRequest = {
        id: `ant-${Date.now()}`,
        requestDate: new Date().toISOString().split('T')[0],
        requestedAmount: numericAmount,
        feeAmount: feeAmount,
        netAmount: netAmount,
        status: 'pending',
      };

      setAnticipationHistory(prev => [newRequest, ...prev]);
      setRequestStatus('success');
      
      setTimeout(() => {
          setRequestedAmount('');
          setRequestStatus('idle');
      }, 2000);

    }, 1500);
  };

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
            <IconFileClock size={48} className="mx-auto md:mx-0 text-brand-gold opacity-80 flex-shrink-0"/>
            <div>
                <h2 className="text-2xl font-bold text-white">Antecipação de Recebíveis</h2>
                <p className="text-gray-400 mt-2">
                   Solicite um adiantamento dos seus ganhos futuros de forma rápida e segura.
                </p>
            </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">Solicitar Antecipação</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoCard title="Limite Disponível" value={formatCurrency(availableLimit)} />
              <InfoCard title="Taxa de Antecipação" value={`${(FEE_RATE * 100)}%`} />
              <InfoCard title="Valor a Receber" value={formatCurrency(netAmount)} />
            </div>

            <div>
              <label htmlFor="amount" className="text-sm text-gray-400 block mb-1">Valor a antecipar</label>
              <input
                id="amount"
                type="text"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                placeholder="R$ 0,00"
                className={`w-full bg-brand-gray p-3 rounded-md border border-brand-gray-light focus:ring-2 focus:outline-none transition-shadow text-lg ${!isAmountValid && numericAmount > 0 ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand-gold'}`}
              />
              {numericAmount > availableLimit && (
                <p className="text-red-500 text-xs mt-1">O valor solicitado excede seu limite disponível.</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!isAmountValid || requestStatus !== 'idle'}
              className="w-full font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed bg-brand-gold text-brand-dark hover:bg-yellow-400"
            >
              {requestStatus === 'idle' && 'Solicitar Antecipação'}
              {requestStatus === 'loading' && 'Processando...'}
              {requestStatus === 'success' && <><IconActive className="mr-2"/> Solicitação Enviada!</>}
            </button>
          </form>
        </Card>
        
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">Histórico de Antecipações</h3>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left">
              <thead className="border-b border-brand-gray text-sm text-gray-400 sticky top-0 bg-brand-gray">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Valor Solicitado</th>
                  <th className="p-3 hidden sm:table-cell">Taxa</th>
                  <th className="p-3">Valor Líquido</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {anticipationHistory.map(req => (
                  <tr key={req.id} className="border-b border-brand-gray-light last:border-b-0">
                    <td className="p-3 text-sm">{req.requestDate}</td>
                    <td className="p-3 text-sm font-semibold text-white">{formatCurrency(req.requestedAmount)}</td>
                    <td className="p-3 text-sm text-red-400 hidden sm:table-cell">{formatCurrency(req.feeAmount)}</td>
                    <td className="p-3 text-sm font-semibold text-green-400">{formatCurrency(req.netAmount)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusMap[req.status].color}`}>
                        {statusMap[req.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Antecipacao;