
import React, { useState, useMemo, FC } from 'react';
import { NavLink } from 'react-router-dom';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { mockWalletTransactions } from '../data';
import type { WalletTransaction, WalletTransactionType } from '../../types';
import { 
    IconDownload, 
    IconGitFork, 
    IconAward, 
    IconShop, 
    IconHandCoins,
    IconTransfer,
    IconWallet,
    IconFilter,
    IconActive,
    IconStar,
    IconRepeat,
    IconUser,
    IconTrendingUp,
} from '../../components/icons';

const transactionInfoMap: Record<WalletTransactionType, { label: string; icon: React.ElementType }> = {
  commission_cycle: { label: 'Bônus de Ciclo', icon: IconGitFork },
  commission_shop: { label: 'Comissão RS Shop', icon: IconShop },
  bonus_career: { label: 'Bônus de Carreira', icon: IconAward },
  bonus_compensation: { label: 'Bônus de Compensação', icon: IconHandCoins },
  bonus_sigme: { label: 'Bônus SIGME', icon: IconStar },
  bonus_fidelity: { label: 'Bônus Fidelidade', icon: IconRepeat },
  withdrawal: { label: 'Saque', icon: IconWallet },
  deposit: { label: 'Depósito', icon: IconWallet },
  transfer_in: { label: 'Transferência Recebida', icon: IconTransfer },
  transfer_out: { label: 'Transferência Enviada', icon: IconTransfer },
};

const transactionTypeMap = {
  all: { label: 'Todos os Tipos' },
  ...Object.entries(transactionInfoMap).reduce((acc, [key, { label }]) => {
    acc[key as WalletTransactionType] = { label };
    return acc;
  }, {} as Record<WalletTransactionType, { label: string }>),
};


const statusMap = {
  completed: { label: 'Concluído', color: 'bg-green-500/20 text-green-400' },
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400' },
  failed: { label: 'Falhou', color: 'bg-red-500/20 text-red-400' },
};

const SummaryCard: FC<{title: string; amount: number; icon: React.ElementType; onClick?: () => void; isNegative?: boolean}> = ({ title, amount, icon: Icon, onClick, isNegative = false }) => (
    <button onClick={onClick} disabled={!onClick} className="text-left w-full transition-transform duration-200 hover:scale-[1.02] disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-dark rounded-xl">
        <Card className={`flex items-start space-x-4 h-full ${onClick ? 'cursor-pointer' : ''}`}>
            <div className="p-3 bg-brand-gray-light rounded-lg">
                <Icon className={`h-6 w-6 ${isNegative ? 'text-red-400' : 'text-brand-gold'}`} />
            </div>
            <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <p className={`text-xl font-bold ${isNegative ? 'text-red-400' : 'text-white'}`}>R$ {amount.toFixed(2)}</p>
            </div>
        </Card>
    </button>
);

const TransactionRow = React.memo(({ transaction, onRowClick }: { transaction: WalletTransaction, onRowClick: (t: WalletTransaction) => void }) => {
    return (
        <tr onClick={() => onRowClick(transaction)} className="border-b border-brand-gray-light last:border-b-0 hover:bg-brand-gray-light/50 cursor-pointer">
            <td className="p-3 text-sm">{transaction.date}</td>
            <td className="p-3 text-sm">{transaction.description}</td>
            <td className="p-3 text-sm hidden sm:table-cell">{transactionInfoMap[transaction.type as WalletTransactionType]?.label || transaction.type}</td>
            <td className="p-3 hidden md:table-cell">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusMap[transaction.status].color}`}>
                    {statusMap[transaction.status].label}
                </span>
            </td>
            <td className={`p-3 text-right font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {transaction.amount > 0 ? `+ ${transaction.amount.toFixed(2)}` : `- ${Math.abs(transaction.amount).toFixed(2)}`}
            </td>
        </tr>
    );
});


const SaldoExtrato: React.FC = () => {
  const [filterType, setFilterType] = useState('all');
  const [exportStatus, setExportStatus] = useState(false);

  const [reportModalData, setReportModalData] = useState<{
      isOpen: boolean;
      title: string;
      transactions: WalletTransaction[];
  }>({ isOpen: false, title: '', transactions: [] });

  const handleExport = () => {
    setExportStatus(true);
    setTimeout(() => setExportStatus(false), 2500);
  }

  const showReport = (types: WalletTransaction['type'][], title: string) => {
    const relevantTransactions = mockWalletTransactions.filter(t => types.includes(t.type));
    setReportModalData({
        isOpen: true,
        title: `Relatório - ${title}`,
        transactions: relevantTransactions,
    });
  };

  const showTransactionDetail = (transaction: WalletTransaction) => {
    setReportModalData({
        isOpen: true,
        title: 'Detalhes da Transação',
        transactions: [transaction],
    })
  }

  const { 
      walletBalance, bonusCiclo, bonusCarreira, comissaoShop, bonusCompensacao, 
      totalSaques, totalTransferencias, bonusSigme, bonusFidelity 
  } = useMemo(() => {
    let balance = 0, bCiclo = 0, bCarreira = 0, cShop = 0, bComp = 0, 
        saques = 0, transferencias = 0, bSigme = 0, bFidelity = 0;

    for(const t of mockWalletTransactions) {
        balance += t.amount;
        if (t.amount > 0) {
            switch (t.type) {
                case 'commission_cycle': bCiclo += t.amount; break;
                case 'bonus_career': bCarreira += t.amount; break;
                case 'commission_shop': cShop += t.amount; break;
                case 'bonus_compensation': bComp += t.amount; break;
                case 'bonus_sigme': bSigme += t.amount; break;
                case 'bonus_fidelity': bFidelity += t.amount; break;
            }
        } else {
            switch (t.type) {
                case 'withdrawal': saques += t.amount; break;
                case 'transfer_out': transferencias += t.amount; break;
            }
        }
    }
    return { 
        walletBalance: balance, 
        bonusCiclo: bCiclo, 
        bonusCarreira: bCarreira, 
        comissaoShop: cShop, 
        bonusCompensacao: bComp,
        totalSaques: Math.abs(saques),
        totalTransferencias: Math.abs(transferencias),
        bonusSigme: bSigme,
        bonusFidelity: bFidelity,
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return mockWalletTransactions.filter(t => filterType === 'all' || t.type === filterType);
  }, [filterType]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col justify-center items-center text-center bg-gradient-to-br from-brand-gray to-brand-gray-dark border-2 border-brand-gold shadow-gold-glow">
            <p className="text-gray-400 text-lg">Saldo Total Disponível</p>
            <p className="text-5xl font-extrabold text-brand-gold my-4">R$ {walletBalance.toFixed(2)}</p>
            <NavLink to="/consultant/wallet/saque" className="w-full text-center py-3 bg-brand-gold text-brand-dark hover:bg-yellow-400 rounded-lg transition-colors text-sm font-bold shadow-lg shadow-brand-gold/20">
                Solicitar Saque
            </NavLink>
        </Card>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <SummaryCard title="Bônus de Ciclo" amount={bonusCiclo} icon={IconGitFork} onClick={() => showReport(['commission_cycle'], 'Bônus de Ciclo')} />
           <SummaryCard title="Bônus de Carreira" amount={bonusCarreira} icon={IconAward} onClick={() => showReport(['bonus_career'], 'Bônus de Carreira')} />
           <SummaryCard title="Comissões RS Shop" amount={comissaoShop} icon={IconShop} onClick={() => showReport(['commission_shop'], 'Comissões RS Shop')} />
           <SummaryCard title="Bônus de Compensação" amount={bonusCompensacao} icon={IconHandCoins} onClick={() => showReport(['bonus_compensation'], 'Bônus de Compensação')} />
           <SummaryCard title="Bônus SIGME" amount={bonusSigme} icon={IconStar} onClick={() => showReport(['bonus_sigme'], 'Bônus SIGME')} />
           <SummaryCard title="Bônus Fidelidade" amount={bonusFidelity} icon={IconRepeat} onClick={() => showReport(['bonus_fidelity'], 'Bônus Fidelidade')} />
           <SummaryCard title="Saques Realizados" amount={totalSaques} icon={IconWallet} isNegative onClick={() => showReport(['withdrawal'], 'Saques Realizados')} />
           <SummaryCard title="Transferências Enviadas" amount={totalTransferencias} icon={IconTransfer} isNegative onClick={() => showReport(['transfer_out'], 'Transferências Enviadas')} />
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-white">Histórico de Transações</h2>
          <div className='flex items-center gap-2'>
                <div className="relative">
                     <IconFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-brand-gray border border-brand-gray-light rounded-lg py-2 pl-10 pr-4 w-full md:w-52 appearance-none focus:ring-2 focus:ring-brand-gold focus:outline-none text-sm"
                    >
                       {Object.entries(transactionTypeMap).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <button onClick={handleExport} disabled={exportStatus} className="flex items-center justify-center space-x-2 text-sm bg-brand-gray px-4 py-2 rounded-lg hover:bg-brand-gray-light h-full w-32 transition-colors">
                   {exportStatus ? <><IconActive size={16} className="text-green-400"/><span>Iniciado</span></> : <><IconDownload size={16} /><span>Exportar</span></>}
                </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-brand-gray text-sm text-gray-400">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Descrição</th>
                <th className="p-3 hidden sm:table-cell">Tipo</th>
                <th className="p-3 hidden md:table-cell">Status</th>
                <th className="p-3 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <TransactionRow key={t.id} transaction={t} onRowClick={showTransactionDetail} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* NEW REPORT MODAL - EXPORTED FOR REUSE */}
      <ReportModal
        isOpen={reportModalData.isOpen} 
        onClose={() => setReportModalData({ ...reportModalData, isOpen: false })} 
        title={reportModalData.title}
        transactions={reportModalData.transactions}
      />
    </div>
  );
};

export const ReportModal: FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    transactions: WalletTransaction[]; 
}> = ({ isOpen, onClose, title, transactions }) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title}
        >
            <div className="space-y-4">
                <div className="p-4 bg-brand-gray-light rounded-lg flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-400">Total no Período</p>
                        <p className="text-2xl font-bold text-brand-gold">
                            R$ {transactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 text-right">Transações</p>
                        <p className="text-2xl font-bold text-white text-right">
                            {transactions.length}
                        </p>
                    </div>
                </div>

                <div className="max-h-[50vh] overflow-y-auto pr-2">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b-2 border-brand-gray-light text-xs text-gray-400 uppercase sticky top-0 bg-brand-gray-dark">
                                <tr>
                                    <th className="p-2">Data</th>
                                    <th className="p-2">Origem do Bônus</th>
                                    <th className="p-2">Detalhes</th>
                                    <th className="p-2 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t.id} className="border-b border-brand-gray-light last:border-b-0">
                                        <td className="p-2 align-top text-xs">{t.date}</td>
                                        <td className="p-2 align-top">
                                            {t.details?.sourceUser ? (
                                                <div className="flex items-center space-x-2">
                                                    <img src={t.details.sourceUser.avatarUrl || 'https://via.placeholder.com/150/222222/888888?text=?'} alt={t.details.sourceUser.name} className="h-8 w-8 rounded-full flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">{t.details.sourceUser.name}</p>
                                                        <p className="text-xs text-gray-400">
                                                            {t.details.networkLevel > 0 ? `${t.details.networkLevel}º Nível` : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-2 align-top">
                                            <p className="text-sm font-semibold text-white">{t.details?.bonusType || t.description}</p>
                                            <div className="text-xs text-gray-400 flex items-center space-x-1 mt-1">
                                                <IconTrendingUp size={14} className="text-brand-gold"/>
                                                <span>
                                                    Compressão: {t.details?.dynamicCompressionLevel ? `${t.details.dynamicCompressionLevel}º Nível` : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={`p-2 align-top text-right font-bold text-base ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.amount > 0 ? `+${t.amount.toFixed(2)}` : t.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SaldoExtrato;