import React, { useMemo, useState } from 'react';
import { Order, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { ExportIcon } from './icons/ExportIcon';

interface WalletSalesReportProps {
    orders: Order[];
    onNavigate: (view: View, data?: Order) => void;
}

// Flatten order items
const getSoldItems = (orders: Order[]) => {
    return orders.flatMap(order => 
        order.items.map(item => ({
            ...item,
            orderId: order.id,
            date: order.date,
            customerName: order.customerName,
            paymentStatus: order.paymentStatus,
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const WalletSalesReport: React.FC<WalletSalesReportProps> = ({ orders, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const allSoldItems = useMemo(() => getSoldItems(orders), [orders]);

    const filteredItems = useMemo(() => {
        return allSoldItems.filter(item => 
            item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [allSoldItems, searchTerm]);
    
    const handleExport = () => {
        const headers = ["Produto", "Data", "Pedido", "Qtd.", "Preço Unit.", "Total"];
        const rows = filteredItems.map(item => [
            `"${item.productName.replace(/"/g, '""')}"`,
            new Date(item.date).toLocaleDateString('pt-BR'),
            item.orderId,
            item.quantity,
            item.price,
            item.price * item.quantity
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "relatorio_de_vendas.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-black border border-dark-800 rounded-lg">
            <div className="p-4 border-b border-dark-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Relatório de Vendas de Produtos</h2>
                    <button onClick={handleExport} className="flex items-center gap-2 text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                        <ExportIcon className="w-5 h-5"/>
                        Exportar para CSV
                    </button>
                </div>
                <div className="relative max-w-lg">
                    <input
                        type="text"
                        placeholder="Buscar por produto, pedido ou SKU"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 pl-10 pr-4"
                    />
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-black">
                        <tr>
                            <th scope="col" className="px-6 py-3">Produto</th>
                            <th scope="col" className="px-6 py-3">Data</th>
                            <th scope="col" className="px-6 py-3">Pedido</th>
                            <th scope="col" className="px-6 py-3 text-center">Qtd.</th>
                            <th scope="col" className="px-6 py-3 text-right">Preço Unit.</th>
                            <th scope="col" className="px-6 py-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item, index) => {
                            const order = orders.find(o => o.id === item.orderId);
                            return (
                                <tr key={`${item.orderId}-${item.productId}-${index}`} className="border-b border-dark-800 hover:bg-dark-800/50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-white">{item.productName}</p>
                                        <p className="text-xs text-gray-500 font-mono">{item.sku || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 font-mono">
                                        <button 
                                            onClick={() => order && onNavigate('orderDetail', order)}
                                            className="text-gold-400 hover:underline disabled:text-gray-500 disabled:no-underline"
                                            disabled={!order}
                                        >
                                            {item.orderId}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">{item.quantity}</td>
                                    <td className="px-6 py-4 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WalletSalesReport;