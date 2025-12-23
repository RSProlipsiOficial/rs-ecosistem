import React, { useMemo } from 'react';
import { Product, Order, AbandonmentLog, ProductSupplier, PriceSuggestion } from '../types';
import { generatePriceSuggestions } from '../services/pricingService';
import { Sliders, CheckCircle } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { useNotifier } from '../contexts/NotificationContext';

interface PriceOptimizerProps {
    products: Product[];
    orders: Order[];
    abandonmentLogs: AbandonmentLog[];
    productSuppliers: ProductSupplier[];
    onUpdateProduct: (product: Product) => void;
}

export const PriceOptimizer: React.FC<PriceOptimizerProps> = ({
    products,
    orders,
    abandonmentLogs,
    productSuppliers,
    onUpdateProduct,
}) => {
    const { addToast } = useNotifier();

    const suggestions = useMemo(
        () => generatePriceSuggestions(products, orders, abandonmentLogs, productSuppliers),
        [products, orders, abandonmentLogs, productSuppliers]
    );

    const table = useDataTable({ initialData: suggestions, searchKeys: ['productName'] });
    
    const handleApplySuggestion = (suggestion: PriceSuggestion) => {
        const product = products.find(p => p.id === suggestion.productId);
        if (product) {
            onUpdateProduct({ ...product, salePrice: suggestion.suggestedPrice });
            addToast(`Preço de "${product.name}" atualizado para R$ ${suggestion.suggestedPrice.toFixed(2)}!`, 'success');
        }
    };

    const columns: Column<PriceSuggestion>[] = [
        {
            header: 'Produto',
            accessor: 'productName',
            render: s => <span className="font-bold text-slate-200">{s.productName}</span>
        },
        {
            header: 'Preço Atual',
            accessor: 'currentPrice',
            headerClassName: 'text-center',
            cellClassName: 'text-center',
            render: s => `R$ ${s.currentPrice.toFixed(2)}`
        },
        {
            header: 'Preço Sugerido',
            accessor: 'suggestedPrice',
            headerClassName: 'text-center',
            cellClassName: 'text-center',
            render: s => {
                const isIncrease = s.suggestedPrice > s.currentPrice;
                const isDecrease = s.suggestedPrice < s.currentPrice;
                const color = isIncrease ? 'text-emerald-400' : isDecrease ? 'text-red-400' : 'text-slate-300';
                return <span className={`font-bold text-lg ${color}`}>R$ {s.suggestedPrice.toFixed(2)}</span>
            }
        },
        {
            header: 'Margem (Atual → Proj.)',
            accessor: 'currentMargin',
            render: s => (
                <div className="flex items-center gap-2 justify-center">
                    <span>{s.currentMargin.toFixed(1)}%</span>
                    <span className="text-slate-500">→</span>
                    <span className="font-bold">{s.projectedMargin.toFixed(1)}%</span>
                </div>
            ),
            headerClassName: 'text-center',
            cellClassName: 'text-center',
        },
        {
            header: 'Justificativa da IA',
            accessor: 'justification',
            render: s => <p className="text-xs text-slate-400 max-w-xs">{s.justification}</p>
        },
        {
            header: 'Ação',
            accessor: 'actions',
            headerClassName: 'text-center',
            cellClassName: 'text-center',
            render: s => {
                const isSamePrice = s.currentPrice.toFixed(2) === s.suggestedPrice.toFixed(2);
                return (
                    <button
                        onClick={() => handleApplySuggestion(s)}
                        disabled={isSamePrice}
                        className={`btn-primary-sm flex items-center gap-1 mx-auto disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed`}
                    >
                       <CheckCircle size={14}/> Aplicar
                    </button>
                )
            }
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><Sliders /> Otimizador de Preços</h2>
                    <p className="text-sm text-slate-400">Receba sugestões de preço baseadas em dados para maximizar seu lucro.</p>
                </div>
            </div>

            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} searchPlaceholder="Buscar por nome do produto..."/>
             <style>{`.btn-primary-sm { background-color: #d4af37; color: #0a0a0a; font-weight: 600; padding: 0.3rem 0.8rem; border-radius: 0.5rem; font-size: 0.8rem; }`}</style>
        </div>
    );
};