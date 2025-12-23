import React, { useState, useEffect } from 'react';
import { logisticsAPI, consultantsAPI } from '../../src/services/api';
import Card from '../Card';
import {
    IconPlus, IconTrash, IconSearch, IconUser, IconAward, IconCheck,
    IconFileText as IconDocument,
    IconDollarSign as IconDollar,
    IconQrCode,
    IconList as IconBarcode
} from '../icons';

// Mock data for CD Packages
const CD_PACKAGES = [
    { id: 'cd-bronze', name: 'Kit CD Bronze', price: 5000, items: 'R$ 6.000 em produtos' },
    { id: 'cd-prata', name: 'Kit CD Prata', price: 15000, items: 'R$ 18.000 em produtos' },
    { id: 'cd-ouro', name: 'Kit CD Ouro', price: 30000, items: 'R$ 38.000 em produtos + Isenção Frete' },
];

const AdminCDManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'active'>('overview');
    const [cds, setCds] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Search & Add State
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedConsultant, setSelectedConsultant] = useState<any>(null);
    const [selectedPackage, setSelectedPackage] = useState<string>('cd-bronze');

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);

    useEffect(() => {
        loadCDs();
    }, []);

    const loadCDs = async () => {
        setLoading(true);
        try {
            const res = await logisticsAPI.getDistributionCenters();
            setCds(Array.isArray(res.data) ? res.data : (res.data as any)?.data || []);
        } catch (error) {
            console.error("Error loading CDs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm) return;
        setSearching(true);
        try {
            const res = await consultantsAPI.lookup(searchTerm);
            setSearchResults(Array.isArray(res.data) ? res.data : (res.data as any)?.data || []);
        } catch (error) {
            console.error("Search error", error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectConsultant = (consultant: any) => {
        setSelectedConsultant(consultant);
        // Reset package selection
        setSelectedPackage('cd-bronze');
    };

    const handleCreateOrder = () => {
        if (!selectedConsultant) return;

        const pack = CD_PACKAGES.find(p => p.id === selectedPackage);

        // Mock generating an invoice
        const mockInvoice = {
            id: `INV-${Date.now()}`,
            consultant: selectedConsultant,
            package: pack,
            status: 'pending_payment',
            created_at: new Date().toISOString(),
            pixKey: '00020126360014br.gov.bcb.pix0114+5511999999999520400005303986540550.005802BR5913RS PROLIPSI6008SAO PAULO62070503***63041234',
            boletoCode: '34191.79001 01043.510047 91020.150008 5 89990000050000'
        };

        setPaymentData(mockInvoice);
        setShowAddModal(false);
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = async () => {
        if (!paymentData) return;

        try {
            // Visualize creating the CD after payment confirmation
            await logisticsAPI.createDistributionCenter({
                owner_id: paymentData.consultant.id,
                name: `CD - ${paymentData.consultant.name}`,
                address: 'Aguardando Configuração',
                active: true
            });
            alert('Pagamento Confirmado! CD Ativado com sucesso.');
            setShowPaymentModal(false);
            setPaymentData(null);
            setSelectedConsultant(null);
            loadCDs();
            setActiveTab('active');
        } catch (error) {
            console.error("Error activating CD", error);
            alert('Erro ao ativar CD.');
        }
    };

    const handleToggleStatus = async (cd: any) => {
        const newStatus = !cd.active;
        const action = newStatus ? 'ativar' : 'desativar';
        if (!confirm(`Confirmar ${action} o acesso de CD para ${cd.name}?`)) return;

        try {
            await logisticsAPI.updateDistributionCenter(cd.id, { ...cd, active: newStatus });
            loadCDs();
        } catch (error) {
            console.error(`Error ${action} CD`, error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-gray-800 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Gestão Profissional de CDs</h2>
                    <p className="text-sm text-gray-400">Administração de pedidos, pagamentos e ativação de Centros de Distribuição.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'overview' ? 'bg-brand-gold text-brand-dark' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'active' ? 'bg-brand-gold text-brand-dark' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                        CDs Ativos
                    </button>
                    <button
                        onClick={() => { setShowAddModal(true); setSelectedConsultant(null); }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-500 transition-colors ml-4"
                    >
                        <IconPlus /> Novo Pedido de CD
                    </button>
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-full text-blue-400"><IconDocument size={24} /></div>
                            <div>
                                <p className="text-gray-400 text-sm">Pedidos Pendentes</p>
                                <h3 className="text-2xl font-bold text-white">0</h3>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-full text-green-400"><IconDollar size={24} /></div>
                            <div>
                                <p className="text-gray-400 text-sm">Faturamento (CDs)</p>
                                <h3 className="text-2xl font-bold text-white">R$ 0,00</h3>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-400"><IconAward size={24} /></div>
                            <div>
                                <p className="text-gray-400 text-sm">Total de CDs Ativos</p>
                                <h3 className="text-2xl font-bold text-white">{cds.length}</h3>
                            </div>
                        </div>
                    </Card>

                    <div className="md:col-span-3 mt-6">
                        <h3 className="text-lg font-bold text-white mb-4">Pacotes de Adesão Disponíveis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {CD_PACKAGES.map(pkg => (
                                <div key={pkg.id} className="bg-[#121212] border border-gray-800 rounded-xl p-6 hover:border-brand-gold transition-colors group relative cursor-pointer">
                                    <div className="absolute top-4 right-4 text-gray-600 group-hover:text-brand-gold"><IconAward size={24} /></div>
                                    <h4 className="text-xl font-bold text-white">{pkg.name}</h4>
                                    <p className="text-2xl font-bold text-brand-gold mt-2">R$ {pkg.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-sm text-gray-400 mt-2">{pkg.items}</p>
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <p className="text-xs text-gray-500">Incluso Sistema de Gestão</p>
                                        <p className="text-xs text-gray-500">Treinamento Especializado</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Active CDs Tab */}
            {activeTab === 'active' && (
                <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="p-4">Nome do CD</th>
                                <th className="p-4">Responsável</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Estoque (Est.)</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {cds.map((cd) => (
                                <tr key={cd.id} className="hover:bg-gray-900/50 transition-colors">
                                    <td className="p-4 font-semibold text-white">{cd.name}</td>
                                    <td className="p-4 text-gray-300">
                                        <div className="flex flex-col">
                                            <span>ID: {cd.owner_id}</span>
                                            <span className="text-xs text-gray-500">Cadastrado</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${cd.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {cd.active ? 'ATIVO' : 'INATIVO'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-300">R$ {Math.floor(Math.random() * 50000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(cd)}
                                            className={`p-2 rounded transition-colors ${cd.active ? 'text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                                            title={cd.active ? "Desativar CD" : "Ativar CD"}
                                        >
                                            {cd.active ? <IconTrash size={18} /> : <IconCheck size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {cds.length === 0 && <div className="p-8 text-center text-gray-500">Nenhum CD ativo no momento.</div>}
                </div>
            )}


            {/* Create Order Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><IconDocument /> Novo Pedido de Adesão CD</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Step 1: Select Consultant */}
                            {!selectedConsultant ? (
                                <div className="space-y-4">
                                    <label className="text-sm font-semibold text-gray-300 block">1. Selecionar Consultor Responsável</label>
                                    <form onSubmit={handleSearch} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Buscar consultor (Nome, Email ou ID)..."
                                            className="flex-1 bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold focus:outline-none"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                        <button type="submit" className="bg-brand-gray px-6 rounded-lg text-white hover:bg-gray-600 font-semibold" disabled={searching}>
                                            {searching ? '...' : <IconSearch />}
                                        </button>
                                    </form>

                                    <div className="mt-4 space-y-2">
                                        {searchResults.map(c => (
                                            <div key={c.id} className="p-4 bg-gray-900 border border-gray-800 rounded-lg flex justify-between items-center hover:border-brand-gold transition-colors cursor-pointer" onClick={() => handleSelectConsultant(c)}>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center font-bold text-lg">
                                                        {c.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{c.name}</p>
                                                        <p className="text-xs text-gray-400">ID: {c.id} • {c.email}</p>
                                                    </div>
                                                </div>
                                                <button className="text-sm bg-brand-gold/10 text-brand-gold px-3 py-1 rounded border border-brand-gold/30">Selecionar</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Selected Consultant Badge */}
                                    <div className="p-4 bg-brand-gold/10 border border-brand-gold/30 rounded-lg flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center font-bold">
                                                <IconCheck />
                                            </div>
                                            <div>
                                                <p className="text-xs text-brand-gold uppercase font-bold">Consultor Selecionado</p>
                                                <p className="font-bold text-white">{selectedConsultant.name}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedConsultant(null)} className="text-xs underline text-gray-400 hover:text-white">Alterar</button>
                                    </div>

                                    {/* Step 2: Select Package */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-300 block mb-3">2. Selecionar Pacote de Adesão</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {CD_PACKAGES.map(pkg => (
                                                <div
                                                    key={pkg.id}
                                                    className={`p-4 border rounded-lg flex justify-between items-center cursor-pointer transition-all ${selectedPackage === pkg.id ? 'bg-brand-gold text-brand-dark border-brand-gold shadow-lg transform scale-[1.02]' : 'bg-[#121212] border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                                                    onClick={() => setSelectedPackage(pkg.id)}
                                                >
                                                    <div>
                                                        <p className="font-bold text-lg">{pkg.name}</p>
                                                        <p className={`text-xs ${selectedPackage === pkg.id ? 'text-brand-dark/80' : 'text-gray-500'}`}>{pkg.items}</p>
                                                    </div>
                                                    <p className="font-bold text-xl">R$ {pkg.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedConsultant && (
                            <div className="p-6 border-t border-gray-700 bg-gray-900 flex justify-end gap-3">
                                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancelar</button>
                                <button
                                    onClick={handleCreateOrder}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-500 shadow-lg flex items-center gap-2"
                                >
                                    <IconDollar /> Gerar Pedido e Cobrança
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && paymentData && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-200">
                    <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                        <div className="p-6 text-center space-y-4 bg-white/5">
                            <div className="h-20 w-20 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                                <IconCheck size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Pedido Gerado!</h3>
                            <p className="text-gray-400">Fatura pronta para pagamento.</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-[#121212] p-4 rounded-lg border border-gray-800">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500">Cliente</span>
                                    <span className="text-white font-semibold">{paymentData.consultant.name}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500">Pacote</span>
                                    <span className="text-white font-semibold">{paymentData.package.name}</span>
                                </div>
                                <div className="border-t border-gray-800 my-2 pt-2 flex justify-between text-lg">
                                    <span className="text-gray-400">Total</span>
                                    <span className="text-brand-gold font-bold">R$ {paymentData.package.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 border border-gray-700 transition-colors">
                                    <IconQrCode /> Copiar Código PIX
                                </button>
                                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 border border-gray-700 transition-colors">
                                    <IconBarcode /> Gerar Boleto Bancário
                                </button>
                            </div>

                            <button
                                onClick={handleConfirmPayment}
                                className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-lg shadow-lg shadow-brand-gold/20 hover:bg-yellow-300 transform active:scale-95 transition-all"
                            >
                                Simular Pagamento Confirmado
                            </button>
                            <p className="text-xs text-center text-gray-500">Ao confirmar, o CD será ativado instantaneamente.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCDManager;
