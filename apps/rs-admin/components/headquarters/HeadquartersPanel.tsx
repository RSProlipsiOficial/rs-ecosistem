import React, { useState, useEffect } from 'react';
import { PlusIcon, ShoppingBagIcon, HistoryIcon, BookOpenIcon, PencilIcon, TrashIcon, MapPinIcon } from '../icons';
import { CDRegistry, ReplenishmentOrder, GlobalSalesOrder, FranchiseRule } from '../../types';
import { headquartersService } from '../../src/services/headquartersService';
import AddCDModal from '../cd/AddCDModal';
import EditCDModal from '../cd/EditCDModal';

interface HeadquartersPanelProps {
    activeTab?: 'cds' | 'replenishment' | 'history' | 'rules' | 'OVERVIEW' | 'REQUESTS' | 'SALES' | 'RULES';
}

const SALE_STATUS: Record<string, { label: string; cls: string }> = {
    'PENDING': { label: 'Pendente', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    'PENDENTE': { label: 'Pendente', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    'PAID': { label: 'Pago', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'PAGO': { label: 'Pago', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'SEPARACAO': { label: 'Em Separação', cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    'ENVIADO': { label: 'Enviado', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    'SHIPPED': { label: 'Enviado', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    'ENTREGUE': { label: 'Entregue', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    'DELIVERED': { label: 'Entregue', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    'COMPLETO': { label: 'Completo', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    'COMPLETED': { label: 'Completo', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    'CANCELADO': { label: 'Cancelado', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
    'CANCELED': { label: 'Cancelado', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

interface SalesTabProps { sales: GlobalSalesOrder[]; onRefresh: () => void; }
const SalesTab: React.FC<SalesTabProps> = ({ sales, onRefresh }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('TODOS');

    const allStatuses = ['TODOS', ...Array.from(new Set(sales.map(s => ((s as any).status || '').toUpperCase()))).filter(Boolean)];

    const filtered = sales.filter(s => {
        const rawStatus = ((s as any).status || '').toUpperCase();
        const matchStatus = statusFilter === 'TODOS' || rawStatus === statusFilter;
        const q = search.toLowerCase();
        const matchSearch = !q ||
            ((s as any).customerName || s.sellerName || '').toLowerCase().includes(q) ||
            (s.id || '').toLowerCase().includes(q) ||
            (s.sellerName || '').toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const CONFIRMED = ['PAID', 'PAGO', 'ENTREGUE', 'DELIVERED', 'COMPLETO', 'COMPLETED', 'ENVIADO', 'SHIPPED', 'SEPARACAO'];
    const totalConfirmed = sales
        .filter(s => CONFIRMED.includes(((s as any).status || '').toUpperCase()))
        .reduce((acc, s) => acc + Number(s.total || 0), 0);

    return (
        <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 border-b border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <HistoryIcon className="w-6 h-6 text-yellow-500" />
                            VENDAS DA REDE ({filtered.length})
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Receita confirmada: <span className="text-green-400 font-bold">R$ {totalConfirmed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <span className="ml-3 text-gray-600">| {sales.length} pedidos totais</span>
                        </p>
                    </div>
                    <button onClick={onRefresh} className="px-3 py-1.5 text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-colors">
                        🔄 Atualizar
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por cliente, ID ou vendedor..."
                            className="w-full bg-black/40 border border-gray-800 text-white pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-yellow-500/50"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {allStatuses.slice(0, 6).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${statusFilter === s
                                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                                        : 'bg-black/20 text-gray-500 border-gray-800 hover:text-white'
                                    }`}
                            >{SALE_STATUS[s]?.label || s}</button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-black/40 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Vendedor / CD</th>
                            <th className="px-6 py-4">Pagamento</th>
                            <th className="px-6 py-4">Valor</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-20 text-center text-gray-600 font-medium">
                                {search || statusFilter !== 'TODOS' ? 'Nenhum resultado para os filtros.' : 'Nenhuma venda registrada.'}
                            </td></tr>
                        ) : (
                            filtered.map(sale => {
                                const rawStatus = ((sale as any).status || 'PENDING').toUpperCase();
                                const meta = SALE_STATUS[rawStatus] || { label: rawStatus, cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
                                return (
                                    <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-gray-400 text-xs">{sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : '—'}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">#{(sale.id || '').toString().toUpperCase().slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-white font-medium text-sm">{(sale as any).customerName || '—'}</td>
                                        <td className="px-6 py-4 text-gray-300 text-sm">{sale.sellerName || 'Sede RS'}</td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">{(sale as any).paymentMethod || 'PIX'}</td>
                                        <td className="px-6 py-4 text-green-400 font-black text-sm">R$ {Number(sale.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.cls}`}>{meta.label}</span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

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
    const [selectedOrder, setSelectedOrder] = useState<ReplenishmentOrder | null>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

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

    const handleOpenOrderDetails = (order: ReplenishmentOrder) => {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
    };

    const handlePrintOrder = (order: ReplenishmentOrder) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Pedido AC-${order.id.split('-')[0].toUpperCase()}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; max-width: 800px; margin: 0 auto; color: #333; }
                        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                        .title { font-size: 24px; font-weight: bold; }
                        .subtitle { color: #666; font-size: 14px; }
                        .grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 30px; }
                        .box { border: 1px solid #ccc; padding: 15px; flex: 1; border-radius: 4px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f4f4f4; text-transform: uppercase; font-size: 12px; }
                        .total { text-align: right; font-weight: bold; margin-top: 20px; font-size: 18px; padding-top: 10px; border-top: 2px solid #000; }
                        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">RS PRÓLIPSI - ABASTECIMENTO</div>
                        <div class="subtitle">PEDIDO ID: AC-${order.id.split('-')[0].toUpperCase()} | DATA: ${new Date(order.date).toLocaleString('pt-BR')}</div>
                    </div>

                    <div class="grid">
                        <div class="box">
                            <strong>DESTINATÁRIO:</strong><br/>
                            ${order.cdName}<br/>
                            CNPJ/CPF: ${order.cdDetails?.document || 'Não informado'}<br/>
                            E-mail: ${order.cdDetails?.email || 'Não informado'}<br/>
                            Tel: ${order.cdDetails?.phone || 'Não informado'}
                        </div>
                        <div class="box">
                            <strong>ENDEREÇO DE ENTREGA:</strong><br/>
                            ${order.cdDetails?.addressStreet || 'Rua não informada'}, ${order.cdDetails?.addressNumber || 'S/N'}<br/>
                            Bairro: ${order.cdDetails?.addressNeighborhood || 'Não informado'}<br/>
                            ${order.cdDetails?.city || 'Não informada'} - ${order.cdDetails?.state || 'UF'}<br/>
                            CEP: ${order.cdDetails?.addressZip || 'Não informado'}
                        </div>
                    </div>

                    <h3>ITENS SOLICITADOS (TOTAL: ${order.itemCount})</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>SKU</th>
                                <th style="text-align: right">Qtd</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(i => `
                                <tr>
                                    <td>${i.name}</td>
                                    <td>${i.sku}</td>
                                    <td style="text-align: right">${i.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="total">
                        VALOR TOTAL: R$ ${order.totalValue.toLocaleString('pt-BR')}
                    </div>
                    
                    <div class="footer">
                        Documento gerado em ${new Date().toLocaleString('pt-BR')} - RS Prólipsi Ecossistema
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
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
                                                <th className="px-6 py-4">ID</th>
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
                                                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="px-6 py-5 text-gray-300 text-xs">{new Date(order.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                                        <td className="px-6 py-5">
                                                            <button
                                                                onClick={() => handleOpenOrderDetails(order)}
                                                                className="text-xs font-mono text-gray-300 bg-white/5 hover:bg-yellow-500/20 hover:text-yellow-500 px-2 py-1 rounded border border-gray-800 hover:border-yellow-500/50 transition-all cursor-pointer"
                                                                title="Ver Detalhes do Abastecimento e Envio"
                                                            >
                                                                AC-{order.id.split('-')[0].toUpperCase()}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <button onClick={() => handleOpenOrderDetails(order)} className="text-white font-bold group-hover:text-yellow-500 text-left cursor-pointer transition-colors">
                                                                {order.cdName}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-5 text-gray-400 text-xs">{order.itemCount} itens</td>
                                                        <td className="px-6 py-5 text-yellow-500 font-bold">R$ {order.totalValue.toLocaleString('pt-BR')}</td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${order.status === 'APROVADO' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                                order.status === 'SAIU PARA ENTREGA' || order.status === 'ENVIADO' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                    order.status === 'PAGO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                                }`}>{order.status}</span>
                                                            {order.paymentProofUrl && (
                                                                <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 text-[10px] text-blue-400 hover:text-blue-300 underline font-semibold">
                                                                    Ver Comprovante ({order.paymentProofStatus || 'Pendente'})
                                                                </a>
                                                            )}
                                                            {order.trackingCode && (
                                                                <span className="block mt-1 text-[10px] text-gray-400 font-mono">
                                                                    Rastreio: {order.trackingCode}
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-5 align-top">
                                                            <div className="flex flex-col items-end gap-2">
                                                                {(order.status === 'PENDENTE' || order.status === 'CANCELADO') && (
                                                                    <button
                                                                        onClick={() => handleUpdateOrderStatus(order.id, 'AGUARDANDO PAGAMENTO')}
                                                                        disabled={processingOrderId === order.id}
                                                                        className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded hover:bg-yellow-500/30 transition-colors"
                                                                        title="Cobrar Pagamento"
                                                                    >
                                                                        {processingOrderId === order.id ? '...' : 'Cobrar Pagamento'}
                                                                    </button>
                                                                )}
                                                                {(order.status === 'COMPROVANTE ENVIADO' || order.status === 'EM SEPARAÇÃO' || order.status === 'AGUARDANDO PAGAMENTO') && order.paymentProofUrl && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            setProcessingOrderId(order.id);
                                                                            await headquartersService.confirmPaymentProof(order.id, true);
                                                                            fetchData();
                                                                            setProcessingOrderId(null);
                                                                        }}
                                                                        disabled={processingOrderId === order.id}
                                                                        className="px-3 py-1 bg-green-500/20 text-green-500 text-[10px] font-bold rounded hover:bg-green-500/30 transition-colors"
                                                                        title="Confirmar que o pagamento foi recebido"
                                                                    >
                                                                        {processingOrderId === order.id ? '...' : 'Confirmar Pgto'}
                                                                    </button>
                                                                )}
                                                                {(order.status === 'PAGO' || order.status === 'EM SEPARAÇÃO' || order.status === 'SAIU PARA ENTREGA' || order.status === 'ENVIADO') && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            const tracking = window.prompt("Informe o Código de Rastreio (se houver):");
                                                                            if (tracking !== null) {
                                                                                setProcessingOrderId(order.id);
                                                                                const success = await headquartersService.updateReplenishmentOrderStatus(order.id, 'SAIU PARA ENTREGA', tracking);
                                                                                if (success) {
                                                                                    setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'SAIU PARA ENTREGA', trackingCode: tracking } : o));
                                                                                }
                                                                                setProcessingOrderId(null);
                                                                            }
                                                                        }}
                                                                        disabled={processingOrderId === order.id}
                                                                        className="px-3 py-1 bg-blue-500/20 text-blue-500 text-[10px] font-bold rounded hover:bg-blue-500/30 transition-colors"
                                                                        title="Despachar Pedido e informar rastreio"
                                                                    >
                                                                        {processingOrderId === order.id ? '...' : 'Despachar / Rastreio'}
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
                            <SalesTab sales={sales} onRefresh={fetchData} />
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

            {isOrderModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-900 to-black">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShoppingBagIcon className="w-6 h-6 text-yellow-500" />
                                Detalhes do Pedido de Abastecimento
                            </h2>
                            <button
                                onClick={() => setIsOrderModalOpen(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Informações do Pedido e Itens */}
                                <div className="space-y-6">
                                    <div className="bg-black/20 p-4 rounded-lg border border-gray-800">
                                        <h3 className="text-yellow-500 font-bold mb-4 uppercase text-xs tracking-wider">Resumo do Pedido</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">ID:</span>
                                                <span className="text-white font-mono">AC-{selectedOrder.id.split('-')[0].toUpperCase()}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Data:</span>
                                                <span className="text-white">{new Date(selectedOrder.date).toLocaleString('pt-BR')}</span>
                                            </div>

                                            {(() => {
                                                const subtotal = selectedOrder.items.reduce((acc: number, item: any) => acc + ((item.unitCost || 0) * item.quantity), 0);
                                                let freight = selectedOrder.totalValue - subtotal;
                                                // [RS-FIX] Suprimir pequenas anomalias de precisão flutuante entre backend/frontend (ex: R$ 0,04)
                                                if (freight < 0.1) freight = 0;

                                                return (
                                                    <>
                                                        <div className="flex justify-between pt-1">
                                                            <span className="text-gray-400">Produtos:</span>
                                                            <span className="text-white">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">Frete/Acréscimos:</span>
                                                            <span className="text-white">R$ {freight.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </>
                                                )
                                            })()}

                                            <div className="flex justify-between border-t border-gray-800 pt-2">
                                                <span className="text-gray-400 font-bold uppercase text-[10px] self-end mb-1">Valor Total:</span>
                                                <span className="text-yellow-500 font-black text-lg">R$ {selectedOrder.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between mt-2 items-center bg-gray-900 absolute top-4 right-4 px-3 py-1 rounded-full border border-gray-700 shadow shadow-black hidden">
                                                {/* Migrado para o status_badge visual em vez da lista padrão */}
                                                <span className="text-gray-400 text-xs">Status Atual:</span>
                                                <span className="text-white font-bold text-xs ml-2">{selectedOrder.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-yellow-500 font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                                            <ShoppingBagIcon className="w-4 h-4" /> Itens Solicitados
                                        </h3>
                                        <div className="bg-black/20 rounded-lg border border-gray-800 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-900 text-gray-400 text-[10px] uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">Produto</th>
                                                        <th className="px-4 py-2 text-center">SKU</th>
                                                        <th className="px-4 py-2 text-center">Valor Unit.</th>
                                                        <th className="px-4 py-2 text-center">Qtd</th>
                                                        <th className="px-4 py-2 text-right">Total Item</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-800">
                                                    {selectedOrder.items.map((item: any, idx: number) => (
                                                        <tr key={idx} className="text-gray-300">
                                                            <td className="px-4 py-3">{item.name}</td>
                                                            <td className="px-4 py-3 text-center font-mono text-xs">{item.sku}</td>
                                                            <td className="px-4 py-3 text-center text-xs">R$ {(item.unitCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-center font-bold text-white">{item.quantity}</td>
                                                            <td className="px-4 py-3 text-right font-bold text-yellow-500">R$ {((item.unitCost || 0) * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Informações do Destinatário */}
                                <div className="space-y-6">
                                    <div className="bg-black/20 p-4 rounded-lg border border-gray-800">
                                        <h3 className="text-yellow-500 font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                                            <MapPinIcon className="w-4 h-4" /> Endereço de Entrega (Destinatário)
                                        </h3>

                                        {!selectedOrder.cdDetails ? (
                                            <p className="text-sm text-gray-500 italic">Detalhes do endereço não encontrados para este CD.</p>
                                        ) : (
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <span className="block text-gray-500 text-xs uppercase">Nome do Destinatário / Razão</span>
                                                    <span className="text-white font-bold">{selectedOrder.cdName}</span>
                                                </div>

                                                <div>
                                                    <span className="block text-gray-500 text-xs uppercase">Documento (CPF/CNPJ)</span>
                                                    <span className="text-gray-300 font-mono">{selectedOrder.cdDetails.document || 'Não informado'}</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="block text-gray-500 text-xs uppercase">E-mail</span>
                                                        <span className="text-gray-300 truncate block" title={selectedOrder.cdDetails.email}>{selectedOrder.cdDetails.email || 'Não informado'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-gray-500 text-xs uppercase">Telefone</span>
                                                        <span className="text-gray-300">{selectedOrder.cdDetails.phone || 'Não informado'}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-3 mt-3 border-t border-gray-800">
                                                    <span className="block text-gray-500 text-xs uppercase mb-1">Endereço Completo</span>
                                                    <span className="text-white block">
                                                        {selectedOrder.cdDetails.addressStreet
                                                            ? `${selectedOrder.cdDetails.addressStreet}, ${selectedOrder.cdDetails.addressNumber}`
                                                            : 'Rua não informada'}
                                                    </span>
                                                    <span className="text-gray-400 block">
                                                        {selectedOrder.cdDetails.addressNeighborhood || 'Bairro não informado'}
                                                    </span>
                                                    <span className="text-gray-400 block">
                                                        {selectedOrder.cdDetails.city || 'Cidade'} - {selectedOrder.cdDetails.state || 'UF'}
                                                    </span>
                                                    <span className="text-gray-300 font-mono mt-1 block">
                                                        CEP: {selectedOrder.cdDetails.addressZip || 'Não informado'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-800">
                                        <button
                                            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors flex justify-center items-center gap-2"
                                            onClick={() => {
                                                const addr = selectedOrder.cdDetails;
                                                const text = `DESTINATÁRIO: ${selectedOrder.cdName}\nDOC: ${addr?.document}\nENDEREÇO: ${addr?.addressStreet}, ${addr?.addressNumber} - ${addr?.addressNeighborhood}\n${addr?.city} - ${addr?.state} / CEP: ${addr?.addressZip}\nCONTATO: ${addr?.phone}`;
                                                navigator.clipboard.writeText(text);
                                                alert("Endereço copiado para a área de transferência!");
                                            }}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            Copiar Endereço
                                        </button>
                                        <button
                                            className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2"
                                            onClick={() => handlePrintOrder(selectedOrder)}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            Imprimir Pedido
                                        </button>
                                        <button
                                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-colors"
                                            onClick={() => setIsOrderModalOpen(false)}
                                        >
                                            Fechar Modal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeadquartersPanel;
