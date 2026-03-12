import React, { useEffect, useMemo, useState } from 'react';
import { Client, LedgerState, Sale } from '../types';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { marketplaceAPI } from '../src/services/api';
import { getWalletUserId } from '../src/utils/walletSession';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
            active ? 'border-gold text-gold' : 'border-transparent text-text-soft hover:text-text-body hover:border-border'
        }`}
    >
        {label}
    </button>
);

const ClientsView: React.FC<{ clients: Client[] }> = ({ clients }) => (
    <div className="space-y-6">
        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-text-body">
            Os clientes abaixo sao montados automaticamente a partir dos pedidos reais sincronizados do marketplace.
        </div>
        {clients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {clients.map(client => (
                    <div key={client.id} className="bg-card p-5 rounded-2xl border border-border">
                        <h3 className="font-bold text-text-title text-lg">{client.name}</h3>
                        <p className="text-sm text-text-body">{client.email || 'Email nao informado'}</p>
                        <p className="text-sm text-text-soft">{client.phone || 'Telefone nao informado'}</p>
                        <p className="text-xs text-text-soft mt-2 pt-2 border-t border-border">Cliente desde: {new Date(client.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-card p-8 rounded-2xl border border-border text-center text-text-soft">
                Nenhum cliente sincronizado ainda.
            </div>
        )}
    </div>
);

const SalesView: React.FC<{ sales: Sale[] }> = ({ sales }) => {
    const columns = useMemo(() => [
        {
            header: 'Data',
            accessor: 'occurredAt' as keyof Sale,
            render: (item: Sale) => <span className="text-sm">{new Date(item.occurredAt).toLocaleDateString('pt-BR')}</span>
        },
        {
            header: 'Cliente',
            accessor: 'clientName' as keyof Sale,
        },
        {
            header: 'Itens',
            accessor: 'items' as keyof Sale,
            render: (item: Sale) => <span className="text-sm">{item.items.map(i => i.name).join(', ') || 'Sem itens'}</span>
        },
        {
            header: 'Valor Total',
            accessor: 'totalAmount' as keyof Sale,
            render: (item: Sale) => <span className="font-semibold text-text-title">{formatCurrency(item.totalAmount)}</span>
        },
        {
            header: 'Status',
            accessor: 'state' as keyof Sale,
            render: (item: Sale) => <StatusBadge status={item.state} />
        },
    ], []);

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-text-body">
                As vendas desta central sao somente leitura e refletem os pedidos reais vinculados ao seu acesso atual.
            </div>
            <DataTable columns={columns} data={sales} />
        </div>
    );
};

const SalesHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState('clients');
    const [clients, setClients] = useState<Client[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const userId = getWalletUserId();
                if (!userId) {
                    setClients([]);
                    setSales([]);
                    return;
                }

                const res = await marketplaceAPI.getUserOrders(userId);
                if (res?.data?.success) {
                    const orders = Array.isArray(res.data.orders) ? res.data.orders : [];
                    const mappedSales: Sale[] = orders.map((o: any) => ({
                        seq: Number(o.seq ?? Date.now()),
                        id: String(o.id ?? ''),
                        clientId: String(o.customer_id ?? o.user_id ?? ''),
                        clientName: String(o.customer_name ?? o.customer?.name ?? 'Cliente'),
                        items: Array.isArray(o.items)
                            ? o.items.map((it: any) => ({ name: String(it.name ?? 'Item'), amount: Number(it.amount ?? it.price ?? 0) }))
                            : [],
                        totalAmount: Number(o.total_amount ?? o.total ?? 0),
                        state: String(o.state ?? o.status ?? 'paid') as LedgerState,
                        occurredAt: String(o.created_at ?? new Date().toISOString()),
                    }));

                    setSales(mappedSales);

                    const uniqueClients: Record<string, Client> = {};
                    mappedSales.forEach(sale => {
                        uniqueClients[sale.clientId || sale.id] = {
                            id: sale.clientId || sale.id,
                            name: sale.clientName,
                            email: '',
                            phone: '',
                            createdAt: sale.occurredAt,
                        };
                    });

                    setClients(Object.values(uniqueClients));
                } else {
                    setClients([]);
                    setSales([]);
                }
            } catch (err) {
                console.error('Erro ao carregar orders/clientes:', err);
                setClients([]);
                setSales([]);
            }
        };

        load();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Central de Clientes e Vendas</h1>
                <p className="text-text-body mt-1">Acompanhe os clientes e vendas sincronizados do marketplace.</p>
            </div>

            <div className="border-b border-border">
                <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
                    <TabButton label="Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
                    <TabButton label="Vendas" active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'clients' && <ClientsView clients={clients} />}
                {activeTab === 'sales' && <SalesView sales={sales} />}
            </div>
        </div>
    );
};

export default SalesHub;
