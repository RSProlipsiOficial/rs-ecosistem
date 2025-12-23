import React, { useState, useMemo } from 'react';
import { Customer, Order, CustomerWithMetrics, CustomerSegment } from '../types';
import { UserCheck, Download } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { crmService } from '../services/crmService';

interface CrmManagerProps {
  customers: Customer[];
  orders: Order[];
}

const SEGMENTS: (CustomerSegment | 'Todos')[] = ['Todos', 'VIPs', 'Campeões', 'Leais', 'Em Risco', 'Hibernando', 'Novos', 'Potencial'];

export const CrmManager: React.FC<CrmManagerProps> = ({ customers, orders }) => {
    const [activeSegment, setActiveSegment] = useState<CustomerSegment | 'Todos'>('Todos');

    const customerMetrics: CustomerWithMetrics[] = useMemo(() => {
        return customers.map(customer => {
            const customerOrders = orders.filter(o => o.customerId === customer.id);
            const frequency = customerOrders.length;
            const monetary = customerOrders.reduce((sum, o) => sum + o.itemsTotal + o.shippingCharged - o.discountTotal, 0);
            
            let recency = 9999;
            if (customerOrders.length > 0) {
                const lastOrderDate = customerOrders.reduce((latest, o) => new Date(o.date) > new Date(latest.date) ? o : latest).date;
                recency = crmService.calculateRecency(new Date(lastOrderDate));
            }

            const segment = crmService.getCustomerSegment(recency, frequency, monetary);

            return { ...customer, recency, frequency, monetary, segment };
        });
    }, [customers, orders]);

    const filteredCustomers = useMemo(() => {
        if (activeSegment === 'Todos') return customerMetrics;
        return customerMetrics.filter(c => c.segment === activeSegment);
    }, [customerMetrics, activeSegment]);

    const table = useDataTable({ initialData: filteredCustomers, searchKeys: ['name', 'email'] });
    
    const handleExport = () => {
        const dataToExport = table.filteredAndSortedData;
        if (dataToExport.length === 0) {
            alert("Nenhum cliente para exportar.");
            return;
        }
        const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Segmento', 'Recencia (dias)', 'Frequencia', 'Valor Gasto (LTV)'];
        const csvRows = [
            headers.join(','),
            ...dataToExport.map(c => [
                c.id,
                `"${c.name}"`,
                c.email || '',
                c.phone,
                c.segment,
                c.recency,
                c.frequency,
                c.monetary.toFixed(2)
            ].join(','))
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `clientes_${activeSegment.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns: Column<CustomerWithMetrics>[] = [
        { header: 'Cliente', accessor: 'name', sortable: true, render: c => <div><div className="font-bold text-slate-200">{c.name}</div><div className="text-xs text-slate-500">{c.email || 'Sem e-mail'}</div></div>},
        { header: 'Segmento', accessor: 'segment', sortable: true, render: c => <span className="text-xs font-bold bg-rs-gold/10 text-rs-gold px-2 py-1 rounded">{c.segment}</span>},
        { header: 'Recência (Dias)', accessor: 'recency', sortable: true, render: c => c.recency === 9999 ? <span className="text-slate-500">N/A</span> : c.recency },
        { header: 'Frequência', accessor: 'frequency', sortable: true },
        { header: 'LTV (R$)', accessor: 'monetary', sortable: true, render: c => `R$ ${c.monetary.toFixed(2)}`},
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><UserCheck /> CRM Clientes</h2>
                    <p className="text-sm text-slate-400">Analise e segmente sua base de clientes com base no comportamento de compra.</p>
                </div>
                <button onClick={handleExport} className="btn-secondary flex items-center gap-2"><Download size={18}/> Exportar Segmento</button>
            </div>

            <div className="flex gap-1 p-1 bg-rs-dark rounded-xl border border-white/10 w-fit overflow-x-auto">
                {SEGMENTS.map(segment => (
                    <button 
                        key={segment}
                        onClick={() => setActiveSegment(segment)} 
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeSegment === segment ? 'bg-rs-gold text-rs-black' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                        {segment}
                    </button>
                ))}
            </div>
            
            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} searchPlaceholder="Buscar por nome ou e-mail..."/>
            <style>{`.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
        </div>
    );
};