import React, { useState, useMemo, FC } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { mockWalletTransactions, mockUser } from './data';
import type { WalletTransaction } from '../types';
import { 
    IconDownload, 
    IconGitFork, 
    IconAward, 
    IconShop, 
    IconHandCoins,
    IconTransfer,
    IconReceipt,
    IconWallet,
    IconFilter,
    IconActive,
} from '../components/icons';

const transactionTypeMap = {
  all: { label: 'Todos os Tipos' },
  commission_cycle: { label: 'Bônus de Ciclo', icon: IconGitFork },
  commission_shop: { label: 'Comissão RS Shop', icon: IconShop },
  bonus_career: { label: 'Bônus de Carreira', icon: IconAward },
  bonus_compensation: { label: 'Bônus de Compensação', icon: IconHandCoins },
  withdrawal: { label: 'Saque', icon: IconWallet },
  deposit: { label: 'Depósito', icon: IconWallet },
  transfer_in: { label: 'Transferência Recebida', icon: IconTransfer },
  transfer_out: { label: 'Transferência Enviada', icon: IconTransfer },
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


const Wallet: React.FC = () => {
  const [filterType, setFilterType] = useState('all');
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [isAddFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState(false);
  const [modalSuccess, setModalSuccess] = useState('');
  const [detailModalData, setDetailModalData] = useState<{
      isOpen: boolean;
      title: string;
      transactions: WalletTransaction[];
  }>({ isOpen: false, title: '', transactions: [] });

  const handleModalSuccess = (modalId: string) => {
    setModalSuccess(modalId);
    setTimeout(() => {
        setModalSuccess('');
        setWithdrawModalOpen(false);
        setTransferModalOpen(false);
        setAddFundsModalOpen(false);
    }, 2000);
  }

  const handleExport = () => {
    setExportStatus(true);
    setTimeout(() => setExportStatus(false), 2500);
  }

  const showDetailedExtract = (types: WalletTransaction['type'][], title: string) => {
    const relevantTransactions = mockWalletTransactions.filter(t => types.includes(t.type));
    setDetailModalData({
        isOpen: true,
        title: `Extrato Detalhado - ${title}`,
        transactions: relevantTransactions,
    });
  };

  const { walletBalance, bonusCiclo, bonusCarreira, comissaoShop, bonusCompensacao, totalSaques, totalTransferencias } = useMemo(() => {
    let balance = 0, bCiclo = 0, bCarreira = 0, cShop = 0, bComp = 0, saques = 0, transferencias = 0;
    for(const t of mockWalletTransactions) {
        balance += t.amount;
        if (t.amount > 0) {
            switch (t.type) {
                case 'commission_cycle': bCiclo += t.amount; break;
                case 'bonus_career': bCarreira += t.amount; break;
                case 'commission_shop': cShop += t.amount; break;
                case 'bonus_compensation': bComp += t.amount; break;
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
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return mockWalletTransactions.filter(t => filterType === 'all' || t.type === filterType);
  }, [filterType]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-gold">Central Financeira - RS Wallet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col justify-center items-center text-center bg-gradient-to-br from-brand-gray to-brand-gray-dark border-2 border-brand-gold shadow-gold-glow">
            <p className="text-gray-400 text-lg">Saldo Total Disponível</p>
            <p className="text-5xl font-extrabold text-brand-gold my-4">R$ {walletBalance.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Atualizado agora</p>
        </Card>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           <SummaryCard title="Bônus de Ciclo" amount={bonusCiclo} icon={IconGitFork} onClick={() => showDetailedExtract(['commission_cycle'], 'Bônus de Ciclo')} />
           <SummaryCard title="Bônus de Carreira" amount={bonusCarreira} icon={IconAward} onClick={() => showDetailedExtract(['bonus_career'], 'Bônus de Carreira')} />
           <SummaryCard title="Comissões RS Shop" amount={comissaoShop} icon={IconShop} onClick={() => showDetailedExtract(['commission_shop'], 'Comissões RS Shop')} />
           <SummaryCard title="Bônus de Compensação" amount={bonusCompensacao} icon={IconHandCoins} onClick={() => showDetailedExtract(['bonus_compensation'], 'Bônus de Compensação')} />
           <SummaryCard title="Saques Realizados" amount={totalSaques} icon={IconWallet} isNegative onClick={() => showDetailedExtract(['withdrawal'], 'Saques Realizados')} />
           <SummaryCard title="Transferências Enviadas" amount={totalTransferencias} icon={IconTransfer} isNegative onClick={() => showDetailedExtract(['transfer_out'], 'Transferências Enviadas')} />
        </div>
      </div>

       <Card>
        <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={() => setWithdrawModalOpen(true)} className="flex items-center justify-center space-x-2 w-full text-center py-3 bg-brand-gold text-brand-dark hover:bg-yellow-400 rounded-lg transition-colors text-sm font-bold shadow-lg shadow-brand-gold/20">
                <IconWallet size={18} />
                <span>Solicitar Saque</span>
            </button>
             <button onClick={() => setTransferModalOpen(true)} className="flex items-center justify-center space-x-2 w-full text-center py-3 bg-brand-gray hover:bg-brand-gray-light rounded-lg transition-colors text-sm font-semibold">
                <IconTransfer size={18} />
                <span>Transferir Saldo</span>
            </button>
             <button onClick={() => setAddFundsModalOpen(true)} className="flex items-center justify-center space-x-2 w-full text-center py-3 bg-brand-gray hover:bg-brand-gray-light rounded-lg transition-colors text-sm font-semibold">
                <IconReceipt size={18} />
                <span>Adicionar Fundos</span>
            </button>
        </div>
      </Card>

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
                <tr key={t.id} className="border-b border-brand-gray-light last:border-b-0 hover:bg-brand-gray-light/50">
                  <td className="p-3 text-sm">{t.date}</td>
                  <td className="p-3 text-sm">{t.description}</td>
                  <td className="p-3 text-sm hidden sm:table-cell">{transactionTypeMap[t.type]?.label || t.type}</td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusMap[t.status].color}`}>
                        {statusMap[t.status].label}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-semibold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {t.amount > 0 ? `+ ${t.amount.toFixed(2)}` : `- ${Math.abs(t.amount).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ACTION MODALS */}
      <Modal isOpen={isWithdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} title="Solicitar Saque">
        <form onSubmit={(e) => { e.preventDefault(); handleModalSuccess('withdraw'); }}>
            <div className="space-y-4">
                <div className="p-4 bg-brand-gray rounded-lg">
                    <p className="text-sm text-gray-400">Saldo Disponível</p>
                    <p className="text-2xl font-bold text-brand-gold">R$ {walletBalance.toFixed(2)}</p>
                </div>
                <div>
                    <label className="text-sm text-gray-400 block mb-1">Valor do Saque</label>
                    <input type="number" step="0.01" placeholder="R$ 0,00" required className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                </div>
                 <div className="p-4 bg-brand-gray rounded-lg border-l-4 border-brand-gold/50">
                    <p className="text-sm font-semibold text-white">Destino do Saque</p>
                    <p className="text-xs text-gray-300">{mockUser.bankAccount.bank}</p>
                    <p className="text-xs text-gray-400">Chave PIX: {mockUser.bankAccount.pixKey}</p>
                </div>
                <button type="submit" className={`w-full mt-4 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${modalSuccess === 'withdraw' ? 'bg-green-500 text-white' : 'bg-brand-gold text-brand-dark hover:bg-yellow-400'}`}>
                   {modalSuccess === 'withdraw' ? <><IconActive className="mr-2"/> Solicitação Enviada!</> : 'Confirmar Saque'}
                </button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isTransferModalOpen} onClose={() => setTransferModalOpen(false)} title="Transferir Saldo">
        <form onSubmit={(e) => { e.preventDefault(); handleModalSuccess('transfer'); }}>
            <div className="space-y-4">
                 <div>
                    <label className="text-sm text-gray-400 block mb-1">ID do Consultor de Destino</label>
                    <input type="text" placeholder="Ex: user-02" required className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                </div>
                <div>
                    <label className="text-sm text-gray-400 block mb-1">Valor da Transferência</label>
                    <input type="number" step="0.01" placeholder="R$ 0,00" required className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                </div>
                 <button type="submit" className={`w-full mt-4 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${modalSuccess === 'transfer' ? 'bg-green-500 text-white' : 'bg-brand-gold text-brand-dark hover:bg-yellow-400'}`}>
                   {modalSuccess === 'transfer' ? <><IconActive className="mr-2"/> Transferido com Sucesso!</> : 'Confirmar Transferência'}
                </button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isAddFundsModalOpen} onClose={() => setAddFundsModalOpen(false)} title="Adicionar Fundos via PIX">
        <div className="text-center space-y-4">
            <p className="text-gray-300">Escaneie o QR Code abaixo ou utilize o código "Copia e Cola" no seu aplicativo bancário.</p>
            <div className="p-4 bg-white rounded-lg inline-block">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=EsteEhUmQRCodeDeExemplo" alt="QR Code PIX" className="h-48 w-48"/>
            </div>
            <div className="space-y-2">
                <input type="text" readOnly value="00020126...exemplo...5303986" className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light text-center text-sm font-mono"/>
                <button onClick={() => navigator.clipboard.writeText("00020126...exemplo...5303986")} className="w-full bg-brand-gray-light hover:bg-brand-gray py-2 rounded-lg text-sm font-semibold transition-colors">Copiar Código</button>
            </div>
        </div>
      </Modal>

      {/* DETAIL EXTRACT MODAL */}
      <Modal 
        isOpen={detailModalData.isOpen} 
        onClose={() => setDetailModalData({ ...detailModalData, isOpen: false })} 
        title={detailModalData.title}
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {detailModalData.transactions.length > 0 ? detailModalData.transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-brand-gray-light rounded-lg">
                    <div>
                        <p className="font-semibold text-white text-sm">{t.description}</p>
                        <p className="text-xs text-gray-400">{t.date} - <span className={`capitalize ${statusMap[t.status]?.color}`}>{statusMap[t.status]?.label}</span></p>
                    </div>
                    <p className={`font-bold text-lg ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {t.amount > 0 ? `+ R$ ${t.amount.toFixed(2)}` : `- R$ ${Math.abs(t.amount).toFixed(2)}`}
                    </p>
                </div>
            )) : <p className="text-gray-400 text-center py-4">Nenhuma transação encontrada.</p>}
        </div>
        <div className="mt-4 pt-4 border-t border-brand-gray flex justify-between items-center">
            <span className="font-bold text-white">TOTAL</span>
            <span className="font-bold text-2xl text-brand-gold">
                R$ {detailModalData.transactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
            </span>
        </div>
    </Modal>
    </div>
  );
};

export default Wallet;