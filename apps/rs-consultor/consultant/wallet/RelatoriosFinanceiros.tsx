import React, { useMemo, useState, FC } from 'react';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { IconDownload, IconFileText, IconUser, IconActive, IconInactive } from '../../components/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { mockWalletTransactions, mockActivationHistory, mockNetworkReport } from '../data';
import type { WalletTransaction } from '../../types';

// Data types for reports
type ActivationHistory = typeof mockActivationHistory[0];
type NetworkReportItem = typeof mockNetworkReport[0];

const ReportCard: FC<{title: string; description: string; format: 'PDF' | 'CSV'; onClick: () => void;}> = ({ title, description, format, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-4 bg-brand-gray-light rounded-lg hover:bg-brand-gray transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <div className="flex items-center space-x-2 text-sm bg-brand-gray px-4 py-2 rounded-lg">
                <IconDownload size={16} />
                <span>{format}</span>
            </div>
        </div>
    </button>
);

const transactionTypeMap: { [key in WalletTransaction['type']]?: string } = {
    commission_cycle: 'Bônus de Ciclo',
    commission_shop: 'Comissão RS Shop',
    bonus_career: 'Bônus de Carreira',
    bonus_compensation: 'Bônus de Compensação',
    withdrawal: 'Saque',
    deposit: 'Depósito',
    transfer_in: 'Transferência Recebida',
    transfer_out: 'Transferência Enviada',
    bonus_sigme: 'Bônus SIGME',
    bonus_fidelity: 'Bônus Fidelidade',
};

const statusMap = {
  completed: { label: 'Concluído', color: 'text-green-400' },
  pending: { label: 'Pendente', color: 'text-yellow-400' },
  failed: { label: 'Falhou', color: 'text-red-400' },
};


// Report rendering components for modals
const WalletReport: FC<{ data: WalletTransaction[] }> = ({ data }) => (
    <div className="overflow-x-auto max-h-[60vh]">
        <table className="w-full text-left">
            <thead className="border-b-2 border-brand-gray-light text-xs text-gray-400 uppercase sticky top-0 bg-brand-gray">
                <tr>
                    <th className="p-2">Data</th>
                    <th className="p-2">Descrição</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-right">Valor</th>
                </tr>
            </thead>
            <tbody>
                {data.map(t => (
                    <tr key={t.id} className="border-b border-brand-gray-light last:border-b-0">
                        <td className="p-2 text-sm">{t.date}</td>
                        <td className="p-2 text-sm">{t.description}</td>
                        <td className="p-2 text-sm">{transactionTypeMap[t.type] || t.type}</td>
                        <td className={`p-2 text-sm font-semibold ${statusMap[t.status].color}`}>{statusMap[t.status].label}</td>
                        <td className={`p-2 text-right font-semibold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ActivationReport: FC<{ data: ActivationHistory[] }> = ({ data }) => (
    <div className="overflow-x-auto max-h-[60vh]">
        <table className="w-full text-left">
            <thead className="border-b-2 border-brand-gray-light text-xs text-gray-400 uppercase sticky top-0 bg-brand-gray">
                <tr>
                    <th className="p-2">Mês/Ano</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Método</th>
                    <th className="p-2 text-right">Valor Ativação</th>
                </tr>
            </thead>
            <tbody>
                {data.map(item => (
                    <tr key={item.month} className="border-b border-brand-gray-light last:border-b-0">
                        <td className="p-2 text-sm font-semibold">{item.month}</td>
                        <td className="p-2 text-sm">
                            <span className={`flex items-center gap-2 font-semibold ${item.status === 'Ativo' ? 'text-green-400' : 'text-red-400'}`}>
                                {item.status === 'Ativo' ? <IconActive size={16}/> : <IconInactive size={16}/>}
                                {item.status}
                            </span>
                        </td>
                        <td className="p-2 text-sm">{item.method}</td>
                        <td className="p-2 text-right font-semibold">
                           {item.value > 0 ? item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const NetworkReport: FC<{ data: NetworkReportItem[] }> = ({ data }) => (
    <div className="overflow-x-auto max-h-[60vh]">
        <table className="w-full text-left">
             <thead className="border-b-2 border-brand-gray-light text-xs text-gray-400 uppercase sticky top-0 bg-brand-gray">
                <tr>
                    <th className="p-2">Consultor</th>
                    <th className="p-2">PIN</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-right">Volume Pessoal</th>
                    <th className="p-2 text-right">Volume Grupo</th>
                </tr>
            </thead>
            <tbody>
                {data.map(user => (
                    <tr key={user.id} className="border-b border-brand-gray-light last:border-b-0">
                        <td className="p-2">
                            <div className="flex items-center space-x-3">
                                <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full" />
                                <div>
                                    <p className="font-semibold text-white text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-400">Desde: {user.joinDate}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-2 text-sm font-semibold">{user.pin}</td>
                        <td className="p-2 text-sm">
                            <span className={`flex items-center gap-2 font-semibold ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                {user.status === 'active' ? <IconActive size={16}/> : <IconInactive size={16}/>}
                                <span className="capitalize">{user.status}</span>
                            </span>
                        </td>
                        <td className="p-2 text-right font-mono">{user.personalVolume}</td>
                        <td className="p-2 text-right font-mono">{user.groupVolume}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const RelatoriosFinanceiros: React.FC = () => {
    const [modalContent, setModalContent] = useState<{ title: string, type: 'wallet' | 'activation' | 'network' | null }>({ title: '', type: null });

    const openModal = (type: 'wallet' | 'activation' | 'network', title: string) => {
        setModalContent({ type, title });
    };

    const closeModal = () => {
        setModalContent({ title: '', type: null });
    };
    
    const earningsData = useMemo(() => {
        const summary = mockWalletTransactions.reduce((acc, t) => {
            if (t.amount > 0) {
                 if (t.type === 'commission_cycle' || t.type === 'bonus_sigme' || t.type === 'bonus_fidelity') {
                    acc['Bônus de Ciclo'] = (acc['Bônus de Ciclo'] || 0) + t.amount;
                } else if (t.type === 'bonus_career') {
                    acc['Bônus de Carreira'] = (acc['Bônus de Carreira'] || 0) + t.amount;
                } else if (t.type === 'commission_shop') {
                    acc['Comissões RS Shop'] = (acc['Comissões RS Shop'] || 0) + t.amount;
                } else if (t.type === 'bonus_compensation') {
                    acc['Bônus Compensação'] = (acc['Bônus Compensação'] || 0) + t.amount;
                }
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(summary).map(([name, value]) => ({ name, value }));
    }, []);

    const COLORS = ['#FFD700', '#F59E0B', '#10B981', '#3B82F6'];

    const renderModalContent = () => {
        switch (modalContent.type) {
            case 'wallet': return <WalletReport data={mockWalletTransactions} />;
            case 'activation': return <ActivationReport data={mockActivationHistory} />;
            case 'network': return <NetworkReport data={mockNetworkReport} />;
            default: return null;
        }
    }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Ganhos por Origem</h2>
                <button className="flex items-center space-x-2 text-sm bg-brand-gray px-3 py-1.5 rounded-lg hover:bg-brand-gray-light">
                    <IconDownload size={14} />
                    <span>CSV</span>
                </button>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={earningsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={110}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                            {earningsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #333' }} formatter={(value: number, name: string) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), name]}/>
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
        
        <Card className="flex flex-col space-y-4">
            <h2 className="text-xl font-bold text-white">Exportar Relatórios</h2>
            <ReportCard 
                title="Extrato de Wallet"
                description="Histórico completo de transações."
                format="PDF"
                onClick={() => openModal('wallet', 'Extrato Completo de Wallet')}
            />
             <ReportCard 
                title="Histórico de Ativações"
                description="Datas de ativações mensais."
                format="CSV"
                onClick={() => openModal('activation', 'Histórico Completo de Ativações')}
            />
             <ReportCard 
                title="Relatório de Rede"
                description="Dados dos seus indicados diretos."
                format="CSV"
                onClick={() => openModal('network', 'Relatório Completo de Rede')}
            />
        </Card>
      </div>

      <Modal isOpen={!!modalContent.type} onClose={closeModal} title={modalContent.title}>
        {renderModalContent()}
        <div className="mt-4 pt-4 border-t border-brand-gray-light flex justify-end">
            <button className="flex items-center space-x-2 text-sm bg-brand-gray px-4 py-2 rounded-lg hover:bg-brand-gray-light">
                <IconDownload size={16} />
                <span>Exportar Relatório</span>
            </button>
        </div>
      </Modal>
    </div>
  );
};

export default RelatoriosFinanceiros;
