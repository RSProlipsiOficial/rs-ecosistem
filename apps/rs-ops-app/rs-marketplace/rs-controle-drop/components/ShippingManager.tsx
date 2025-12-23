import React, { useState, useMemo } from 'react';
import { Order, User } from '../types';
import { Truck, Printer, Search, Filter, Loader2 } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { shippingService } from '../services/shippingService';

interface ShippingManagerProps {
    orders: Order[];
    onUpdateOrder: (order: Order) => void;
    currentUser: User;
    users: User[];
}

export const ShippingManager: React.FC<ShippingManagerProps> = ({ orders, onUpdateOrder, currentUser, users }) => {
    const [loadingLabelId, setLoadingLabelId] = useState<string | null>(null);

    const ordersToShip = useMemo(() => {
        return orders.filter(o => ['New', 'Packing'].includes(o.status));
    }, [orders]);

    const table = useDataTable({ initialData: ordersToShip, searchKeys: ['customerName', 'id', 'trackingCode'] });

    const handleGenerateLabel = async (order: Order) => {
        setLoadingLabelId(order.id);
        try {
            // Assume the first quote is the chosen one for simplicity
            const { trackingCode, labelUrl } = await shippingService.generateLabel(order, order.shippingMethod || 'SEDEX', order.shippingCost);
            onUpdateOrder({
                ...order,
                status: 'Packing',
                trackingCode,
                shippingLabelUrl: labelUrl,
            });
        } catch (error) {
            console.error("Failed to generate label", error);
            alert("Erro ao gerar etiqueta.");
        } finally {
            setLoadingLabelId(null);
        }
    };

    const handlePrintBatch = () => {
        const labelsToPrint = table.filteredAndSortedData
            .filter(o => o.shippingLabelUrl)
            .map(o => o.shippingLabelUrl);
        
        if (labelsToPrint.length === 0) {
            alert("Nenhuma etiqueta gerada para os pedidos selecionados.");
            return;
        }

        // In a real app, this would merge PDFs. Here, we open them in new tabs.
        alert(`Simulando impressão em lote de ${labelsToPrint.length} etiquetas.`);
        labelsToPrint.forEach(url => {
            if(url) window.open(url, '_blank');
        });
    };

    const columns: Column<Order>[] = [
        {
            header: 'Pedido', accessor: 'id', sortable: true,
            render: (o) => (
                <div>
                    <div className="font-mono text-xs text-rs-gold">#{o.id.slice(0, 8)}</div>
                    <div className="text-slate-300">{new Date(o.date).toLocaleDateString('pt-BR')}</div>
                </div>
            )
        },
        {
            header: 'Cliente', accessor: 'customerName', sortable: true,
            render: (o) => <span className="font-bold text-slate-200">{o.customerName}</span>
        },
        {
            header: 'Status', accessor: 'status', sortable: true,
            render: (o) => <span className={`px-2 py-1 rounded text-xs font-bold ${o.status === 'New' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{o.status}</span>
        },
        {
            header: 'Itens', accessor: 'items',
            render: (o) => `${o.items.length} (${o.items.reduce((acc, i) => acc + i.quantity, 0)} un)`
        },
        {
            header: 'Etiqueta / Rastreio', accessor: 'trackingCode',
            render: (o) => (
                o.shippingLabelUrl ? (
                    <div>
                        <a href={o.shippingLabelUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 underline flex items-center gap-1.5 hover:text-emerald-300">
                            <Printer size={14} /> Imprimir Etiqueta
                        </a>
                        <div className="text-xs text-slate-500 font-mono mt-1">{o.trackingCode}</div>
                    </div>
                ) : (
                    <span className="text-xs text-slate-500 italic">Pendente</span>
                )
            )
        },
        {
            header: 'Ações',
            accessor: 'actions',
            headerClassName: 'text-center', cellClassName: 'text-center',
            render: (o) => {
                if (o.shippingLabelUrl) return null;
                return (
                    <button 
                        onClick={() => handleGenerateLabel(o)} 
                        disabled={loadingLabelId === o.id}
                        className="btn-secondary-sm disabled:opacity-50"
                    >
                        {loadingLabelId === o.id ? <Loader2 size={14} className="animate-spin"/> : 'Gerar Etiqueta'}
                    </button>
                )
            }
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><Truck /> Gerenciador de Envios</h2>
                    <p className="text-sm text-slate-400">Gere e imprima etiquetas de envio em lote.</p>
                </div>
                <button 
                    onClick={handlePrintBatch} 
                    className="btn-primary flex items-center gap-2"
                    disabled={table.filteredAndSortedData.filter(o => o.shippingLabelUrl).length === 0}
                >
                    <Printer size={18} /> Imprimir em Lote
                </button>
            </div>

            <DataTable 
                {...table} 
                columns={columns} 
                data={table.paginatedData} 
                onSort={table.requestSort} 
                onSearch={table.setSearchTerm} 
                onPageChange={{ next: table.nextPage, prev: table.prevPage, goTo: table.goToPage }} 
                onItemsPerPageChange={table.handleItemsPerPageChange}
                searchPlaceholder="Buscar por cliente, pedido ou rastreio..."
            />
             <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-primary:disabled{background-color:#8a7020;color:#333;cursor:not-allowed;}.btn-secondary-sm{font-size:0.8rem;border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.3rem 0.8rem;border-radius:0.5rem;}`}</style>
        </div>
    );
};