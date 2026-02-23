import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { IconDownload, IconHandCoins } from '../../components/icons';
import { sigmaApi } from '../services/sigmaApi';

const BonusCompensacao: React.FC = () => {
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBonuses() {
      try {
        setLoading(true);
        const res = await sigmaApi.getBonuses();
        if (res.success) {
          setBonuses(res.data);
        } else {
          setError(res.error || 'Erro ao carregar bônus');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadBonuses();
  }, []);

  const totalMes = bonuses.reduce((sum, bonus) => sum + (Number(bonus.amount) || 0), 0);
  const totalAcumulado = totalMes; // No componente real, aqui poderíamos ter um cálculo histórico

  if (loading) return <div className="p-10 text-center text-brand-gold">Carregando extrato de bônus...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Erro: {error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-gold">Bônus de Compensação</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center space-x-4">
            <IconHandCoins size={32} className="text-brand-gold" />
            <div>
              <p className="text-gray-400 text-sm">Total de Bônus (Período)</p>
              <p className="text-lg font-bold text-white">R$ {totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <IconHandCoins size={32} className="text-brand-gold" />
            <div>
              <p className="text-gray-400 text-sm">Total Acumulado</p>
              <p className="text-lg font-bold text-white">R$ {totalAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-white">Origem dos Bônus</h2>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 text-sm bg-brand-gray px-4 py-2 rounded-lg hover:bg-brand-gray-light transition-colors">
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
                <th className="p-3">Origem/Descrição</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {bonuses.length > 0 ? bonuses.map(bonus => (
                <tr key={bonus.id} className="border-b border-brand-gray-light hover:bg-brand-gray-light/50 transition-colors">
                  <td className="p-3 text-sm">{bonus.date}</td>
                  <td className="p-3 text-sm capitalize">{bonus.type}</td>
                  <td className="p-3 text-sm">{bonus.source}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${bonus.status === 'pago' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                      }`}>{bonus.status}</span>
                  </td>
                  <td className="p-3 text-right font-semibold text-green-400 font-mono">
                    + R$ {Number(bonus.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500 italic">
                    Nenhum registro de bônus encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BonusCompensacao;
