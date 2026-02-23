import React, { useState, useMemo, useEffect } from 'react';
import { Client, Sale, LedgerState } from '../types';
import { MOCK_CLIENTS, MOCK_SALES } from '../constants';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ComingSoonModal from '../components/ComingSoonModal';
import { marketplaceAPI } from '../src/services/api';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors
            ${active ? 'border-gold text-gold' : 'border-transparent text-text-soft hover:text-text-body hover:border-border'
            }`}
    >
        {label}
    </button>
);

const InputField: React.FC<{ name: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string, required?: boolean, disabled?: boolean }> =
    ({ name, label, value, onChange, type = 'text', placeholder, required = false, disabled = false }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-text-body mb-2">{label}</label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all disabled:opacity-50"
            />
        </div>
    );


// --- Clientes Tab ---
const ClientsView: React.FC<{ clients: Client[], onAddClient: (client: Client) => void }> = ({ clients, onAddClient }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewClient(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddClient({
            id: `C${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...newClient
        });
        setNewClient({ name: '', email: '', phone: '' });
        setModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={() => setModalOpen(true)} className="text-center py-2 px-6 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors">
                    Adicionar Cliente
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {clients.map(client => (
                    <div key={client.id} className="bg-card p-5 rounded-2xl border border-border">
                        <h3 className="font-bold text-text-title text-lg">{client.name}</h3>
                        <p className="text-sm text-text-body">{client.email}</p>
                        <p className="text-sm text-text-soft">{client.phone}</p>
                        <p className="text-xs text-text-soft mt-2 pt-2 border-t border-border">Cliente desde: {new Date(client.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                ))}
            </div>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Novo Cliente">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField name="name" label="Nome Completo" value={newClient.name} onChange={handleChange} required />
                    <InputField name="email" label="E-mail" type="email" value={newClient.email} onChange={handleChange} required />
                    <InputField name="phone" label="Telefone" type="tel" value={newClient.phone} onChange={handleChange} required />
                    <button type="submit" className="mt-4 w-full text-center py-3 px-6 bg-gold text-card font-semibold rounded-lg">Salvar Cliente</button>
                </form>
            </Modal>
        </div>
    );
};

// --- Vendas Tab ---
const SalesView: React.FC<{ sales: Sale[], clients: Client[], onAddSale: (sale: Sale) => void }> = ({ sales, clients, onAddSale }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [comingSoon, setComingSoon] = useState(false);
    const [newSale, setNewSale] = useState({ clientId: '', items: '', totalAmount: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const client = clients.find(c => c.id === newSale.clientId);
        if (!client) return;

        onAddSale({
            seq: Date.now(),
            id: `S${Date.now()}`,
            clientId: client.id,
            clientName: client.name,
            items: [{ name: newSale.items, amount: parseFloat(newSale.totalAmount) * 100 }],
            totalAmount: parseFloat(newSale.totalAmount) * 100,
            state: LedgerState.PENDING,
            occurredAt: new Date().toISOString()
        });
        setNewSale({ clientId: '', items: '', totalAmount: '' });
        setModalOpen(false);
    };

    const columns = useMemo(() => [
        {
            header: 'Data',
            accessor: 'occurredAt',
            render: (item: Sale) => <span className="text-sm">{new Date(item.occurredAt).toLocaleDateString('pt-BR')}</span>
        },
        {
            header: 'Cliente',
            accessor: 'clientName',
        },
        {
            header: 'Itens',
            accessor: 'items',
            render: (item: Sale) => <span className="text-sm">{item.items.map(i => i.name).join(', ')}</span>
        },
        {
            header: 'Valor Total',
            accessor: 'totalAmount',
            render: (item: Sale) => <span className="font-semibold text-text-title">{formatCurrency(item.totalAmount)}</span>
        },
        {
            header: 'Status',
            accessor: 'state',
            render: (item: Sale) => <StatusBadge status={item.state} />
        },
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={() => setModalOpen(true)} className="text-center py-2 px-6 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors">
                    Registrar Venda
                </button>
            </div>
            <DataTable columns={columns} data={sales} onRowClick={() => setComingSoon(true)} />
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Nova Venda">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="clientId" className="block text-sm font-medium text-text-body mb-2">Cliente</label>
                        <select id="clientId" name="clientId" value={newSale.clientId} onChange={(e) => setNewSale(p => ({ ...p, clientId: e.target.value }))} required className="w-full px-4 py-3 rounded-lg bg-surface border border-border">
                            <option value="" disabled>Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <InputField name="items" label="Produtos/Serviços" value={newSale.items} onChange={(e) => setNewSale(p => ({ ...p, items: e.target.value }))} placeholder="Ex: Kit Essencial" required />
                    <InputField name="totalAmount" label="Valor Total" type="number" value={newSale.totalAmount} onChange={(e) => setNewSale(p => ({ ...p, totalAmount: e.target.value }))} placeholder="0.00" required />
                    <button type="submit" className="mt-4 w-full text-center py-3 px-6 bg-gold text-card font-semibold rounded-lg">Salvar Venda</button>
                </form>
            </Modal>
            <ComingSoonModal isOpen={comingSoon} onClose={() => setComingSoon(false)} featureName="Detalhes da Venda" />
        </div>
    );
}

// --- Main Hub Component ---

const SalesHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState('clients');
    const [clients, setClients] = useState<Client[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const userId = localStorage.getItem('userId') || 'demo-user';
                const res = await marketplaceAPI.getUserOrders(userId);
                if (res?.data?.success) {
                    const orders = Array.isArray(res.data.orders) ? res.data.orders : [];
                    const mappedSales: Sale[] = orders.map((o: any) => ({
                        seq: Number(o.seq ?? Date.now()),
                        id: String(o.id ?? ''),
                        clientId: String(o.customer_id ?? ''),
                        clientName: String(o.customer_name ?? o.customer?.name ?? 'Cliente'),
                        items: Array.isArray(o.items) ? o.items.map((it: any) => ({ name: String(it.name ?? 'Item'), amount: Number(it.amount ?? it.price ?? 0) })) : [],
                        totalAmount: Number(o.total_amount ?? o.total ?? 0),
                        state: String(o.state ?? o.status ?? 'paid') as LedgerState,
                        occurredAt: String(o.created_at ?? new Date().toISOString()),
                    }));
                    setSales(mappedSales);
                    const uniqueClients: Record<string, Client> = {};
                    mappedSales.forEach(s => {
                        uniqueClients[s.clientId] = {
                            id: s.clientId,
                            name: s.clientName,
                            email: '',
                            phone: '',
                            createdAt: s.occurredAt,
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

    const handleAddClient = (client: Client) => setClients(prev => [client, ...prev]);
    const handleAddSale = (sale: Sale) => setSales(prev => [sale, ...prev]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Central de Clientes e Vendas</h1>
                <p className="text-text-body mt-1">Gerencie seus contatos e registre suas vendas para um controle completo.</p>
            </div>

            <div className="border-b border-border">
                <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
                    <TabButton label="Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
                    <TabButton label="Vendas" active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'clients' && <ClientsView clients={clients} onAddClient={handleAddClient} />}
                {activeTab === 'sales' && <SalesView sales={sales} clients={clients} onAddSale={handleAddSale} />}
            </div>
        </div>
    );
};

export default SalesHub;
