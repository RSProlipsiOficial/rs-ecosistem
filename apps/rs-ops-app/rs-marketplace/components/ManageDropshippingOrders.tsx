
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DropshippingOrder, View, Order, DropshippingOrderStatus } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import DropshippingOrderDetailModal from './DropshippingOrderDetailModal';
import { suppliers } from '../data/suppliers';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { TruckIcon } from './icons/TruckIcon'; // Re-using existing icons

interface ManageDropshippingOrdersProps {
    orders: DropshippingOrder[];
    mainOrders: Order[]; // To get customer info if needed
    onUpdateOrder: (orderId: string, updates: Partial<DropshippingOrder>) => void;
    onNavigate: (view: View, data?: DropshippingOrder) => void;
}

// Fix: Define a constant array to hold the string literal values of DropshippingOrderStatus
const DROPSHIPPING_ORDER_STATUS_OPTIONS: DropshippingOrderStatus[] = ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'];

const DropshippingOrderStatusBadge = ({ status }: { status: DropshippingOrderStatus }) => {
    const statusConfig = {
        'Pendente': { text: 'Pendente', color: 'warning', icon: ClockIcon },
        'Processando': { text: 'Processando', color: 'info', icon: ClockIcon },
        'Enviado': { text: 'Enviado', color: 'success', icon: TruckIcon },
        'Entregue': { text: 'Entregue', color: 'success', icon: CheckCircleIcon },
        'Cancelado': { text: 'Cancelado', color: 'error', icon: XCircleIcon },
    };
    const config = statusConfig[status];
    const colorClasses = {
        warning: 'bg-[rgb(var(--color-warning))]/[0.20] text-[rgb(var(--color-warning))]',
        info: 'bg-[rgb(var(--color-info))]/[0.20] text-[rgb(var(--color-info))]',
        success: 'bg-[rgb(var(--color-success))]/[0.20] text-[rgb(var(--color-success))]',
        error: 'bg-[rgb(var(--color-error))]/[0.20] text-[rgb(var(--color-error))]',
    };

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-2 ${colorClasses[config.color]}`}>
            <config.icon className="w-4 h-4" />
            {config.text}
        </span>
    );
};

const ManageDropshippingOrders: React.FC<ManageDropshippingOrdersProps> = ({ orders, mainOrders, onUpdateOrder, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [selectedDropshippingOrder, setSelectedDropshippingOrder] = useState<DropshippingOrder | null>(null);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFilterDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchesSearch = o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  o.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  o.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
            const matchesSupplier = supplierFilter === 'all' || o.supplier === supplierFilter;
            return matchesSearch && matchesStatus && matchesSupplier;
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, searchTerm, statusFilter, supplierFilter]);

    const allSuppliers = useMemo(() => {
        const uniqueSuppliers = new Set(orders.map(o => o.supplier));
        return ['all', ...Array.from(uniqueSuppliers)];
    }, [orders]);

    return (
        <>
            <div className="bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-lg">
                <div className="p-4 border-b border-[rgb(var(--color-brand-gray-light))]">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Buscar por pedido, produto ou fornecedor"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 pl-10 pr-4 text-[rgb(var(--color-brand-text-light))]"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-[rgb(var(--color-brand-text-dim))]" />
                            </div>
                        </div>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                className="flex items-center gap-2 text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] w-full md:w-auto justify-center"
                            >
                                Filtrar
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isFilterDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-60 bg-[rgb(var(--color-brand-dark))] border border-[rgb(var(--color-brand-gray-light))] rounded-md shadow-lg z-10 p-3">
                                    <h4 className="text-sm font-bold text-[rgb(var(--color-brand-text-light))] mb-2">Status do Pedido</h4>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md py-1.5 px-2 text-sm text-[rgb(var(--color-brand-text-light))] mb-3"
                                    >
                                        <option value="all">Todos os Status</option>
                                        {/* Fix: Use the DROPSHIPPING_ORDER_STATUS_OPTIONS array */}
                                        {DROPSHIPPING_ORDER_STATUS_OPTIONS.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    <h4 className="text-sm font-bold text-[rgb(var(--color-brand-text-light))] mb-2">Fornecedor</h4>
                                    <select
                                        value={supplierFilter}
                                        onChange={(e) => setSupplierFilter(e.target.value)}
                                        className="w-full bg-[rgb(var(--color-brand-gray))] border border-[rgb(var(--color-brand-gray-light))] rounded-md py-1.5 px-2 text-sm text-[rgb(var(--color-brand-text-light))]"
                                    >
                                        <option value="all">Todos os Fornecedores</option>
                                        {allSuppliers.filter(s => s !== 'all').map(supplier => (
                                            <option key={supplier} value={supplier}>{supplier}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-[rgb(var(--color-brand-text-dim))]">
                        <thead className="text-xs text-[rgb(var(--color-brand-text-dim))] uppercase bg-[rgb(var(--color-brand-dark))]">
                            <tr>
                                <th scope="col" className="px-6 py-3">Pedido Dropship</th>
                                <th scope="col" className="px-6 py-3">Fornecedor</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-right">Custo Total</th>
                                <th scope="col" className="px-6 py-3">Rastreamento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(dropshipOrder => {
                                const mainOrder = mainOrders.find(o => o.id === dropshipOrder.orderId);
                                const supplierInfo = suppliers.find(s => s.name === dropshipOrder.supplier);
                                return (
                                    <tr key={dropshipOrder.id} className="border-b border-[rgb(var(--color-brand-gray-light))] hover:bg-[rgb(var(--color-brand-gray))]/[.50] cursor-pointer" onClick={() => setSelectedDropshippingOrder(dropshipOrder)}>
                                        <td className="px-6 py-4 font-medium text-[rgb(var(--color-brand-gold))]">{dropshipOrder.id}</td>
                                        <td className="px-6 py-4">{dropshipOrder.supplier}</td>
                                        <td className="px-6 py-4"><DropshippingOrderStatusBadge status={dropshipOrder.status} /></td>
                                        <td className="px-6 py-4 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dropshipOrder.totalCost)}</td>
                                        <td className="px-6 py-4">{dropshipOrder.trackingCode || 'N/A'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedDropshippingOrder && (
                <DropshippingOrderDetailModal 
                    order={selectedDropshippingOrder} 
                    supplier={suppliers.find(s => s.name === selectedDropshippingOrder?.supplier) || null}
                    customer={mainOrders.find(o => o.id === selectedDropshippingOrder?.orderId) || null}
                    onUpdateOrder={onUpdateOrder} 
                    onClose={() => setSelectedDropshippingOrder(null)} 
                />
            )}
        </>
    );
};

export default ManageDropshippingOrders;
