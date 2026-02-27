import React, { useState, useEffect } from 'react';
import { supabase } from "../../src/services/supabase";
import { TruckIcon, UserPlusIcon, SpinnerIcon } from '../icons';
import AddCDModal from './AddCDModal';

interface DistributionCenter {
    id: string;
    consultantId: string;
    responsible: string;
    cpf: string;
    whatsapp: string;
    address: {
        cep: string;
        street: string;
        number: string;
        district: string;
        city: string;
        state: string;
    };
    balance: number;
    status: 'Ativo' | 'Inativo';
    pixKeyType: string;
    pixKey: string;
    shippingMethod: string;
    shippingNotes: string;
}

interface WithdrawRequest {
    id: string;
    cd_id: string;
    cd_name: string;
    amount: number;
    fee: number;
    net_amount: number;
    status: string;
    scheduled_date: string;
    requested_at: string;
    admin_notes?: string;
}

const statusClasses = { Ativo: 'bg-green-600/20 text-green-400', Inativo: 'bg-red-600/20 text-red-400' };

const ManageCDsPage: React.FC<{ navigateToCdStore: (id: number) => void }> = ({ navigateToCdStore }) => {
    const [cds, setCds] = useState<DistributionCenter[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'CDS' | 'SAQUES'>('CDS');
    const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
    const [loadingWithdraws, setLoadingWithdraws] = useState(false);

    useEffect(() => {
        loadCDs();
        loadWithdrawRequests();
    }, []);

    const loadCDs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('minisite_profiles')
                .select('*')
                .or('type.ilike.cd,type.ilike.franquia,type.ilike.proprio,type.ilike.hibrido,type.ilike.%sede%')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped: DistributionCenter[] = (data || []).map((p: any) => ({
                id: p.id,
                consultantId: p.id,
                responsible: p.name || 'Sem nome',
                cpf: p.cpf || '',
                whatsapp: p.phone || '',
                address: {
                    cep: p.address_zip || '',
                    street: p.address_street || '',
                    number: p.address_number || '',
                    district: p.address_neighborhood || '',
                    city: p.address_city || '',
                    state: p.address_state || ''
                },
                balance: parseFloat(p.wallet_balance || '0'),
                status: 'Ativo' as const,
                pixKeyType: '',
                pixKey: p.pix_key || '',
                shippingMethod: '',
                shippingNotes: ''
            }));

            setCds(mapped);
        } catch (error) {
            console.error('Error loading CDs:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadWithdrawRequests = async () => {
        setLoadingWithdraws(true);
        try {
            const { data, error } = await supabase
                .from('cd_withdraw_requests')
                .select('*')
                .order('requested_at', { ascending: false });

            if (error) throw error;
            setWithdrawRequests(data || []);
        } catch (error) {
            console.error('Error loading withdrawals:', error);
        } finally {
            setLoadingWithdraws(false);
        }
    };

    const handleRemoveCD = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este Centro de Distribuição?')) return;
        try {
            const { error } = await supabase
                .from('minisite_profiles')
                .update({ type: 'consultant' })
                .eq('id', id);

            if (error) throw error;
            loadCDs();
        } catch (error) {
            console.error('Erro ao remover CD:', error);
            alert('Erro ao remover status de CD');
        }
    };

    const handleWithdrawAction = async (id: string, action: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('cd_withdraw_requests')
                .update({
                    status: action,
                    processed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            loadWithdrawRequests();
        } catch (error) {
            console.error('Erro ao processar saque:', error);
            alert('Erro ao processar solicitação');
        }
    };

    const pendingCount = withdrawRequests.filter(w => w.status === 'pending').length;

    const statusLabels: Record<string, { label: string; cls: string }> = {
        pending: { label: 'PENDENTE', cls: 'bg-yellow-900/20 text-yellow-500' },
        approved: { label: 'APROVADO', cls: 'bg-green-900/20 text-green-500' },
        rejected: { label: 'REJEITADO', cls: 'bg-red-900/20 text-red-500' },
        paid: { label: 'PAGO', cls: 'bg-emerald-900/20 text-emerald-400' },
        cancelled: { label: 'CANCELADO', cls: 'bg-gray-800 text-gray-500' }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <TruckIcon className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold text-yellow-500 ml-3">Gerenciar Centros de Distribuição</h1>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    Novo CD
                </button>
            </header>

            <AddCDModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    loadCDs();
                }}
            />

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('CDS')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'CDS' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    CDs Cadastrados ({cds.length})
                </button>
                <button
                    onClick={() => { setActiveTab('SAQUES'); loadWithdrawRequests(); }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'SAQUES' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    Solicitações de Saque
                    {pendingCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
                    )}
                </button>
            </div>

            {/* Tab: CDs */}
            {activeTab === 'CDS' && (
                <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <header className="flex items-center justify-between p-4 bg-black/30 border-b border-gray-800">
                        <h2 className="text-xl font-semibold text-white">CDs Cadastrados</h2>
                    </header>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                                <tr>
                                    <th className="px-6 py-4">Responsável</th>
                                    <th className="px-6 py-4">Localização</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="text-center py-8"><SpinnerIcon className="w-8 h-8 animate-spin mx-auto text-yellow-500" /></td></tr>
                                ) : cds.length > 0 ? (
                                    cds.map(cd => (
                                        <tr key={cd.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{cd.responsible}</div>
                                                <div className="text-xs text-gray-500">{cd.whatsapp}</div>
                                            </td>
                                            <td className="px-6 py-4">{cd.address.city} - {cd.address.state}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses.Ativo}`}>Ativo</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => window.open('http://localhost:2020', '_blank')}
                                                        className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 text-xs font-bold uppercase tracking-wider bg-yellow-900/20 px-3 py-1 rounded transition-colors"
                                                        title="Abrir painel do CD"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                        Painel
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveCD(cd.id)}
                                                        className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider bg-red-900/20 px-3 py-1 rounded"
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-gray-500">Nenhum Centro de Distribuição cadastrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab: Saques */}
            {activeTab === 'SAQUES' && (
                <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <header className="flex items-center justify-between p-4 bg-black/30 border-b border-gray-800">
                        <h2 className="text-xl font-semibold text-white">Solicitações de Saque dos CDs</h2>
                        <button onClick={loadWithdrawRequests} className="text-xs text-yellow-400 hover:underline">Atualizar</button>
                    </header>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                                <tr>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">CD</th>
                                    <th className="px-6 py-4">Data Agendada</th>
                                    <th className="px-6 py-4 text-right">Valor</th>
                                    <th className="px-6 py-4 text-right">Taxa</th>
                                    <th className="px-6 py-4 text-right">Líquido</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingWithdraws ? (
                                    <tr><td colSpan={8} className="text-center py-8"><SpinnerIcon className="w-8 h-8 animate-spin mx-auto text-yellow-500" /></td></tr>
                                ) : withdrawRequests.length > 0 ? (
                                    withdrawRequests.map(w => {
                                        const st = statusLabels[w.status] || statusLabels.pending;
                                        return (
                                            <tr key={w.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                <td className="px-6 py-4 whitespace-nowrap">{new Date(w.requested_at).toLocaleDateString('pt-BR')}</td>
                                                <td className="px-6 py-4 font-medium text-white">{w.cd_name || 'CD'}</td>
                                                <td className="px-6 py-4">{w.scheduled_date ? w.scheduled_date.split('-').reverse().join('/') : '-'}</td>
                                                <td className="px-6 py-4 text-right font-bold text-white">R$ {Number(w.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-right text-red-400">-R$ {Number(w.fee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-right font-bold text-green-400">R$ {Number(w.net_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${st.cls}`}>{st.label}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {w.status === 'pending' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleWithdrawAction(w.id, 'approved')}
                                                                className="text-green-500 hover:text-green-400 text-xs font-bold bg-green-900/20 px-3 py-1 rounded"
                                                            >
                                                                Aprovar
                                                            </button>
                                                            <button
                                                                onClick={() => handleWithdrawAction(w.id, 'rejected')}
                                                                className="text-red-500 hover:text-red-400 text-xs font-bold bg-red-900/20 px-3 py-1 rounded"
                                                            >
                                                                Rejeitar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-600">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-10 text-gray-500">Nenhuma solicitação de saque registrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCDsPage;
