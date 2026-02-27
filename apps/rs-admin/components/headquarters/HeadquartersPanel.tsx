import React, { useState, useEffect } from 'react';
import { PlusIcon, ShoppingBagIcon, HistoryIcon, BookOpenIcon, PencilIcon, TrashIcon, MapPinIcon } from '../icons';
import { CDRegistry, ReplenishmentOrder, GlobalSalesOrder, FranchiseRule } from '../../types';
import { headquartersService } from '../../src/services/headquartersService';
import AddCDModal from '../cd/AddCDModal';
import EditCDModal from '../cd/EditCDModal';

interface HeadquartersPanelProps {
    activeTab?: 'cds' | 'replenishment' | 'history' | 'rules' | 'OVERVIEW' | 'REQUESTS' | 'SALES' | 'RULES';
}

const HeadquartersPanel: React.FC<HeadquartersPanelProps> = ({ activeTab: initialTabProp }) => {
    const [activeTab, setActiveTab] = useState<'cds' | 'replenishment' | 'history' | 'rules'>('cds');
    const [cdList, setCdList] = useState<CDRegistry[]>([]);
    const [orders, setOrders] = useState<ReplenishmentOrder[]>([]);
    const [sales, setSales] = useState<GlobalSalesOrder[]>([]);
    const [rules, setRules] = useState<FranchiseRule | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCD, setEditingCD] = useState<CDRegistry | null>(null);
    const [isEditingRules, setIsEditingRules] = useState(false);
    const [editedRules, setEditedRules] = useState<FranchiseRule | null>(null);
    const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        setProcessingOrderId(orderId);
        const success = await headquartersService.updateReplenishmentOrderStatus(orderId, newStatus);
        if (success) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus.toUpperCase() } : o));
        } else {
            alert('Erro ao atualizar status do pedido.');
        }
        setProcessingOrderId(null);
    };

    const handleSaveRules = async () => {
        if (!editedRules) return;
        setLoading(true);
        try {
            const success = await headquartersService.updateFranchiseRules(editedRules);
            if (success) {
                setRules(editedRules);
                setIsEditingRules(false);
            } else {
                alert('Erro ao salvar as regras. Tente novamente.');
            }
        } catch (error) {
            console.error('Error saving rules:', error);
            alert('Erro ao salvar as regras.');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cds, replenishment, globalSales, franchiseRules] = await Promise.all([
                headquartersService.getCDRegistry(),
                headquartersService.getReplenishmentOrders(),
                headquartersService.getGlobalSales(),
                headquartersService.getFranchiseRules()
            ]);
            setCdList(cds);
            setOrders(replenishment);
            setSales(globalSales);
            setRules(franchiseRules);
        } catch (error) {
            console.error('Error fetching headquarters data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (initialTabProp) {
            const mapped: any = {
                'OVERVIEW': 'cds',
                'REQUESTS': 'replenishment',
                'SALES': 'history',
                'RULES': 'rules',
                'ABASTECIMENTO': 'replenishment',
                'VENDAS GERAIS': 'history',
                'REGRAS': 'rules'
            };
            const tab = (mapped[initialTabProp] || initialTabProp).toString().toLowerCase();
            const validTabs = ['cds', 'replenishment', 'history', 'rules'];

            if (validTabs.includes(tab)) {
                setActiveTab(tab as any);
            }
        }
    }, [initialTabProp]);

    const handleEditCD = (cd: CDRegistry) => {
        setEditingCD(cd);
        setIsEditModalOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E1E] p-4 rounded-xl border border-gray-800 shadow-xl">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('cds')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shrink-0 ${activeTab === 'cds' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:bg-gray-800'}`}
                    >
                        <MapPinIcon className="w-5 h-5" />
                        CDs ATIVOS
                    </button>
                    <button
                        onClick={() => setActiveTab('replenishment')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shrink-0 ${activeTab === 'replenishment' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:bg-gray-800'}`}
                    >
                        <ShoppingBagIcon className="w-5 h-5" />
                        ABASTECIMENTO
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shrink-0 ${activeTab === 'history' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:bg-gray-800'}`}
                    >
                        <HistoryIcon className="w-5 h-5" />
                        VENDAS GERAIS
                    </button>
                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shrink-0 ${activeTab === 'rules' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:bg-gray-800'}`}
                    >
                        <BookOpenIcon className="w-5 h-5" />
                        REGRAS
                    </button>
                </div>
            </div>

            {/* Dynamic Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Sincronizando Dados...</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'cds' && (
                            <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                                <div className="bg-gradient-to-r from-gray-900 to-black p-6 flex justify-between items-center border-b border-gray-800">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <MapPinIcon className="w-6 h-6 text-yellow-500" />
                                        REDE DE CDS ({cdList.length})
                                    </h3>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/10 active:scale-95 transition-all"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        NOVO CADASTRO
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-black/40 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                <th className="px-6 py-4">Centro de Distribuição</th>
                                                <th className="px-6 py-4">Localização / Contato</th>
                                                <th className="px-6 py-4">Modelo</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {cdList.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-600 font-medium">Nenhum Centro de Distribuição encontrado.</td>
                                                </tr>
                                            ) : (
                                                cdList.map((cd) => (
                                                    <tr key={cd.id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-white font-bold group-hover:text-yellow-500 transition-colors">{cd.name}</span>
                                                                <span className="text-[11px] text-gray-500 mt-0.5">{cd.managerName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col text-sm">
                                                                <span className="text-gray-300">{cd.city}, {cd.state}</span>
                                                                <span className="text-gray-500 text-xs font-mono">{cd.phone}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cd.type === 'PROPRIO' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                                }`}>
                                                                {cd.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${cd.status === 'ATIVO' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                                                                <span className={`text-[11px] font-bold ${cd.status === 'ATIVO' ? 'text-green-500' : 'text-red-500'}`}>{cd.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleEditCD(cd)}
                                                                    className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all active:scale-90" title="Editar CD"
                                                                >
                                                                    <PencilIcon className="w-5 h-5" />
                                                                </button>
                                                                <button className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-all active:scale-90" title="Bloquear/Remover">
                                                                    <TrashIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {activeTab === 'replenishment' && (
                            <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                                <div className="bg-gradient-to-r from-gray-900 to-black p-6 flex justify-between items-center border-b border-gray-800">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <ShoppingBagIcon className="w-6 h-6 text-yellow-500" />
                                        SOLICITAÇÕES DE ABASTECIMENTO ({orders.length})
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-black/40 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                <th className="px-6 py-4">Data</th>
                                                <th className="px-6 py-4">CD Origem</th>
                                                <th className="px-6 py-4">Itens</th>
                                                <th className="px-6 py-4">Total</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {orders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-600 font-medium">Nenhuma solicitação pendente.</td>
                                                </tr>
                                            ) : (
                                                orders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-5 text-gray-300 text-xs">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                                                        <td className="px-6 py-5 text-white font-bold">{order.cdName}</td>
                                                        <td className="px-6 py-5 text-gray-400 text-xs">{order.itemCount} itens</td>
                                                        <td className="px-6 py-5 text-yellow-500 font-bold">R$ {order.totalValue.toLocaleString('pt-BR')}</td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${order.status === 'APROVADO' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                                    order.status === 'SAIU PARA ENTREGA' || order.status === 'ENVIADO' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                        order.status === 'PAGO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                                }`}>{order.status}</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex justify-end gap-2">
                                                                {order.status === 'PENDENTE' && (
                                                                    <button
                                                                        onClick={() => handleUpdateOrderStatus(order.id, 'APROVADO')}
                                                                        disabled={processingOrderId === order.id}
                                                                        className="px-3 py-1 bg-green-500/20 text-green-500 text-xs font-bold rounded hover:bg-green-500/30 transition-colors"
                                                                        title="Aprovar Pedido"
                                                                    >
                                                                        {processingOrderId === order.id ? '...' : 'Aprovar'}
                                                                    </button>
                                                                )}
                                                                {(order.status === 'APROVADO' || order.status === 'PAGO') && (
                                                                    <button
                                                                        onClick={() => handleUpdateOrderStatus(order.id, 'SAIU PARA ENTREGA')}
                                                                        disabled={processingOrderId === order.id}
                                                                        className="px-3 py-1 bg-blue-500/20 text-blue-500 text-xs font-bold rounded hover:bg-blue-500/30 transition-colors"
                                                                        title="Marcar como Enviado"
                                                                    >
                                                                        {processingOrderId === order.id ? '...' : 'Enviar'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                                <div className="bg-gradient-to-r from-gray-900 to-black p-6 flex justify-between items-center border-b border-gray-800">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <HistoryIcon className="w-6 h-6 text-yellow-500" />
                                        RESUMO DE VENDAS DA REDE ({sales.length})
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-black/40 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                <th className="px-6 py-4">Data</th>
                                                <th className="px-6 py-4">Vendedor/CD</th>
                                                <th className="px-6 py-4">Referência</th>
                                                <th className="px-6 py-4">Valor</th>
                                                <th className="px-6 py-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {sales.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-600 font-medium">Nenhuma venda registrada recentemente.</td>
                                                </tr>
                                            ) : (
                                                sales.map((sale) => (
                                                    <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                                                        {/* Implementação simplificada para exibição */}
                                                        <td className="px-6 py-5 text-gray-400 text-xs">{new Date(sale.date).toLocaleDateString('pt-BR')}</td>
                                                        <td className="px-6 py-5 text-white font-bold">{sale.sellerName}</td>
                                                        <td className="px-6 py-5 text-gray-500 font-mono text-xs">{sale.id}</td>
                                                        <td className="px-6 py-5 text-green-400 font-black">R$ {sale.total.toLocaleString('pt-BR')}</td>
                                                        <td className="px-6 py-5 text-right">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">{sale.status}</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'rules' && (
                            <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 p-8 shadow-2xl">
                                <div className="max-w-4xl mx-auto space-y-8">
                                    <div className="flex items-center justify-between border-b border-gray-800 pb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-yellow-500/10 rounded-2xl">
                                                <BookOpenIcon className="w-8 h-8 text-yellow-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Diretrizes da Franquia</h3>
                                                <p className="text-gray-400 text-sm">Configurações globais para Centros de Distribuição e Micro-franquias.</p>
                                            </div>
                                        </div>
                                        {rules && (
                                            <div className="flex items-center gap-2">
                                                {isEditingRules ? (
                                                    <>
                                                        <button
                                                            onClick={handleSaveRules}
                                                            className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-green-500 transition-all active:scale-95"
                                                        >
                                                            SALVAR ALTERAÇÕES
                                                        </button>
                                                        <button
                                                            onClick={() => setIsEditingRules(false)}
                                                            className="text-gray-400 hover:text-white font-bold px-4 py-2 transition-all"
                                                        >
                                                            CANCELAR
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditedRules({ ...rules });
                                                            setIsEditingRules(true);
                                                        }}
                                                        className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-500 transition-all active:scale-95 flex items-center gap-2"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                        EDITAR REGRAS
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {rules ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-black/40 rounded-xl border border-gray-800 space-y-2">
                                                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Taxa de Royalties (%)</span>
                                                {isEditingRules ? (
                                                    <input
                                                        type="number"
                                                        value={editedRules?.royaltyPercentage}
                                                        onChange={(e) => setEditedRules({ ...editedRules!, royaltyPercentage: Number(e.target.value) })}
                                                        className="w-full bg-black border border-gray-700 rounded p-2 text-white text-2xl font-black focus:border-yellow-500 outline-none transition-all"
                                                    />
                                                ) : (
                                                    <p className="text-3xl font-black text-white">{rules.royaltyPercentage}% <span className="text-xs text-gray-600">sobre faturamento</span></p>
                                                )}
                                            </div>
                                            <div className="p-6 bg-black/40 rounded-xl border border-gray-800 space-y-2">
                                                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Setup Inicial (R$)</span>
                                                {isEditingRules ? (
                                                    <input
                                                        type="number"
                                                        value={editedRules?.initialCost}
                                                        onChange={(e) => setEditedRules({ ...editedRules!, initialCost: Number(e.target.value) })}
                                                        className="w-full bg-black border border-gray-700 rounded p-2 text-white text-2xl font-black focus:border-yellow-500 outline-none transition-all"
                                                    />
                                                ) : (
                                                    <p className="text-3xl font-black text-white">R$ {rules.initialCost.toLocaleString('pt-BR')}</p>
                                                )}
                                            </div>
                                            <div className="p-6 bg-black/40 rounded-xl border border-gray-800 space-y-2">
                                                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Recompra Mínima Stock (R$)</span>
                                                {isEditingRules ? (
                                                    <input
                                                        type="number"
                                                        value={editedRules?.minStockPurchase}
                                                        onChange={(e) => setEditedRules({ ...editedRules!, minStockPurchase: Number(e.target.value) })}
                                                        className="w-full bg-black border border-gray-700 rounded p-2 text-white text-2xl font-black focus:border-yellow-500 outline-none transition-all"
                                                    />
                                                ) : (
                                                    <p className="text-3xl font-black text-white">R$ {rules.minStockPurchase.toLocaleString('pt-BR')}</p>
                                                )}
                                            </div>
                                            <div className="p-6 bg-black/40 rounded-xl border border-gray-800 space-y-2">
                                                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Fundo de Marketing (%)</span>
                                                {isEditingRules ? (
                                                    <input
                                                        type="number"
                                                        value={editedRules?.marketingFee}
                                                        onChange={(e) => setEditedRules({ ...editedRules!, marketingFee: Number(e.target.value) })}
                                                        className="w-full bg-black border border-gray-700 rounded p-2 text-white text-2xl font-black focus:border-yellow-500 outline-none transition-all"
                                                    />
                                                ) : (
                                                    <p className="text-3xl font-black text-white">{rules.marketingFee}% <span className="text-xs text-gray-600">retidos</span></p>
                                                )}
                                            </div>
                                            <div className="p-6 bg-black/40 rounded-xl border border-yellow-500/30 space-y-2 md:col-span-2">
                                                <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">Desconto / Comissão do CD (%)</span>
                                                {isEditingRules ? (
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={editedRules?.commissionPercentage}
                                                        onChange={(e) => setEditedRules({ ...editedRules!, commissionPercentage: Number(e.target.value) })}
                                                        className="w-full bg-black border border-yellow-500/30 rounded p-2 text-white text-2xl font-black focus:border-yellow-500 outline-none transition-all"
                                                    />
                                                ) : (
                                                    <p className="text-3xl font-black text-yellow-500">{rules.commissionPercentage || 15.2}% <span className="text-xs text-gray-600 italic">aplicado sobre o valor da compra</span></p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center py-10 text-gray-600">Carregando diretrizes...</p>
                                    )}

                                    <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-xl">
                                        <p className="text-xs text-yellow-500/70 italic text-center italic leading-relaxed">
                                            As alterações nas regras de franquia afetam todos os contratos vigentes e novos cadastros.
                                            Garantir a conformidade legal antes de publicar novas versões.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modais */}
            <AddCDModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
            />
            {editingCD && (
                <EditCDModal
                    isOpen={isEditModalOpen}
                    cd={editingCD}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

export default HeadquartersPanel;
