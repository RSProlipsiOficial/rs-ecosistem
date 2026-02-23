import React, { useState, useMemo, useEffect } from 'react';
import { consultantsAPI } from '../src/services/api';
import { uploadAvatar } from '../src/services/supabase';
import ConsultantsTable from './ConsultantsTable';
import ConsultantDetailModal from './ConsultantDetailModal';
import ConsultantCreateTab from './ConsultantCreateTab';
import type { Consultant, PurchaseEvent, Order } from '../types';
import { ClipboardDocumentListIcon, UsersIcon, MagnifyingGlassIcon, ShareIcon, CubeIcon, ChartBarIcon, CycleIcon, StarIcon, TrophyIcon, CareerIcon, ArrowsRightLeftIcon, ChevronRightIcon, UserCircleIcon, EnvelopeIcon, WhatsAppIcon, BuildingOffice2Icon, KeyIcon, CheckCircleIcon, CloseIcon, CurrencyDollarIcon, GridIcon } from './icons';
import OrderDetailModal from './marketplace/OrderDetailModal';
import GoalsAndPerformancePage from './GoalsAndPerformancePage';
import NetworkExplorer from './NetworkExplorer';
import NetworkTreeView from './NetworkTreeView';
import FinancialAuditTab from './FinancialAuditTab';

const TreeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A4.833 4.833 0 0118 9.75c-1.25 0-2.45.35-3.5.966-1.05-.616-2.25-.966-3.5-.966s-2.45.35-3.5.966c-1.05-.616-2.25-.966-3.5-.966a4.836 4.836 0 00-1.5.25v10.5h18z" />
    </svg>
);

// Cleared mock data
const mockOrders: Order[] = [];
const detailedMockConsultants: Consultant[] = [];

// Helper para gerar dados financeiros de teste se a API não retornar
const generateMockFinancialData = (consultants: Consultant[]): Consultant[] => {
    return consultants.map(c => {
        // Se já tiver dados, mantém
        if (c.purchaseHistory && c.purchaseHistory.length > 0) return c;

        // Gera 2-5 compras fictícias para cada consultor ativo
        const numPurchases = c.status === 'Ativo' ? Math.floor(Math.random() * 4) + 2 : 0;
        const mockPurchases: PurchaseEvent[] = [];

        for (let i = 0; i < numPurchases; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Últimos 60 dias

            const total = Math.floor(Math.random() * 500) + 150;
            const hasBonus = Math.random() > 0.3; // 70% chance de gerar bônus

            mockPurchases.push({
                id: `PED-${Math.floor(Math.random() * 10000)}`,
                date: date.toISOString(),
                description: 'Pedido de Ativação Mensal',
                totalValue: total,
                items: [
                    { name: 'Kit Essencial', qty: 1 },
                    { name: 'Perfume Gold', qty: 2 }
                ],
                uplinePayments: hasBonus && c.sponsor ? [
                    {
                        recipientId: typeof c.sponsor.id === 'string' ? parseInt(c.sponsor.id) : c.sponsor.id,
                        recipientName: c.sponsor.name,
                        bonusType: 'Plano de Carreira',
                        theoreticalLevel: 1,
                        effectiveLevel: 1,
                        amount: total * 0.10 // 10%
                    }
                ] : []
            });
        }

        return {
            ...c,
            purchaseHistory: mockPurchases,
            // Também mocka comissões recebidas se estiver vazio
            commissionHistory: c.commissionHistory.length > 0 ? c.commissionHistory : [
                {
                    id: `COM-${Math.floor(Math.random() * 10000)}`,
                    date: new Date().toISOString(),
                    bonusType: 'Plano de Carreira',
                    description: 'Bônus de Indicação',
                    points: 50,
                    amount: 150.00,
                    status: 'Pago'
                }
            ]
        };
    });
};

const ConsultantsPage: React.FC<{ initialTab?: string }> = ({ initialTab = 'hierarchy' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    const [consultants, setConsultants] = useState(detailedMockConsultants);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedConsultantForEdit, setSelectedConsultantForEdit] = useState<Consultant | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadConsultants();
    }, []);

    const loadConsultants = async () => {
        try {
            setLoading(true);
            setError('');

            // Try API first
            try {
                const response = await consultantsAPI.getAll();
                console.log('[DEBUG] API Response for consultants:', response);
                const responseData = response.data as any; // Force cast to avoid type errors with generic ApiResponse
                if (responseData?.success || Array.isArray(responseData)) {
                    const loadedConsultants = (responseData.consultants || responseData) || [];
                    // REMOVIDO: generateMockFinancialData (causava confusão com dados falsos)
                    // const enriched = generateMockFinancialData(loadedConsultants);
                    setConsultants(loadedConsultants);
                    setLoading(false);
                    return;
                    setLoading(false);
                    return;
                } else {
                    console.error('[DEBUG] API returned success=false:', response?.data);
                }
            } catch (apiErr: any) {
                console.warn('API falhou, tentando Supabase direto:', apiErr);
                console.error('[DEBUG] API Connection Error Details:', {
                    message: apiErr.message,
                    url: apiErr.config?.url,
                    status: apiErr.status
                });
            }

            // Fallback: buscar diretamente do Supabase
            const { supabase } = await import('../src/services/supabase');
            const { data: consultoresDB, error: sbError } = await supabase
                .from('consultores')
                .select(`
                    id,
                    nome,
                    email,
                    cpf,
                    status,
                    pin_atual,
                    total_ciclos,
                    whatsapp,
                    cidade,
                    estado,
                    patrocinador_id,
                    nivel_profundidade,
                    created_at
                `)
                .order('created_at', { ascending: true });

            if (sbError) {
                console.error('Erro Supabase:', sbError);
                setError('Erro ao carregar consultores');
            } else {
                // Transformar dados do Supabase para formato esperado
                let transformed = (consultoresDB || []).map((c: any) => ({
                    id: c.id,
                    uuid: c.id,
                    name: c.nome,
                    contact: {
                        email: c.email || '',
                        phone: c.whatsapp || '',
                    },
                    address: {
                        city: c.cidade || '',
                        state: c.estado || '',
                        country: 'Brasil',
                        street: '',
                        zip: ''
                    },
                    bankInfo: {
                        bank: '',
                        agency: '',
                        account: '',
                        pixType: 'CPF',
                        pixKey: ''
                    },
                    status: c.status === 'ativo' ? 'Ativo' : 'Inativo',
                    pin: c.pin_atual || '',
                    digitalPin: c.pin_digital || 'RS One Star', // Default para testes, ajustar conforme real
                    sponsor: null,
                    salesHistory: [],
                    commissionHistory: [],
                    purchaseHistory: [],
                    avatar: (!c.avatar_url || c.avatar_url.includes('0aa67016')) ? `/logo-rs.png` : c.avatar_url,
                    // Permissions (Default) - Added
                    permissions: {
                        personalDataLocked: false,
                        bankDataLocked: true,
                        bonus_cycle: true,
                        bonus_fidelity: true,
                        bonus_matrix_fidelity: true,
                        bonus_leadership: true,
                        bonus_career: true, // Novo
                        bonus_digital: true, // Novo
                        access_platform: true
                    },
                    cycle: c.total_ciclos || 0,
                    networkDetails: {
                        directs: 0
                    },
                    walletStatement: [],
                    activationHistory: []
                }));

                // REMOVIDO: generateMockFinancialData (causava confusão com dados falsos)
                // transformed = generateMockFinancialData(transformed);

                setConsultants(transformed);
                setSuccess(`✅ ${transformed.length} consultores carregados do Supabase`);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Erro ao carregar consultores:', err);
            setError('Erro ao carregar consultores');
        } finally {
            setLoading(false);
        }
    };



    const [resettingConsultant, setResettingConsultant] = useState<Consultant | null>(null);
    const [resetSuccessMessage, setResetSuccessMessage] = useState<string>('');

    const handleEdit = (consultant: Consultant) => {
        setSelectedConsultantForEdit(consultant);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedConsultantForEdit(null);
    };

    const handleUpdateConsultant = async (updatedConsultant: Consultant) => {
        try {
            setSaving(true);
            setError('');
            const updateId = (updatedConsultant.uuid || updatedConsultant.id).toString();
            await consultantsAPI.update(updateId, updatedConsultant);
            setConsultants(prev => prev.map(c => c.id === updatedConsultant.id ? updatedConsultant : c));
            setSuccess('✅ Consultor atualizado!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erro ao atualizar consultor');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = (updatedConsultant: Consultant) => {
        handleUpdateConsultant(updatedConsultant);
        handleCloseModal();
    };


    const handleOpenResetModal = (consultant: Consultant) => {
        setResettingConsultant(consultant);
    };

    const handleCloseResetModal = () => {
        setResettingConsultant(null);
    };

    const handleConfirmReset = () => {
        if (resettingConsultant) {
            console.log(`Resetting password for ${resettingConsultant.name} to RS123`);

            setResetSuccessMessage(`Senha de ${resettingConsultant.name} foi resetada para "RS123"!`);
            handleCloseResetModal();

            setTimeout(() => {
                setResetSuccessMessage('');
            }, 5000);
        }
    };

    const TabButton: React.FC<{ tabId: string, label: string, icon: React.ReactNode }> = ({ tabId, label, icon }) => (
        <button type="button"
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors rounded-t-lg border-b-2 ${activeTab === tabId
                ? 'border-yellow-500 text-yellow-500'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-yellow-500 mb-6">Gestão de Consultores</h1>

            {resetSuccessMessage && (
                <div className="bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg p-4 mb-6 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6" />
                        <p>{resetSuccessMessage}</p>
                    </div>
                    <button onClick={() => setResetSuccessMessage('')} className="text-green-400 hover:text-white"><CloseIcon className="w-5 h-5" /></button>
                </div>
            )}

            <div className="border-b border-gray-800 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    <TabButton tabId="hierarchy" label="Rede Inteligente" icon={<TreeIcon className="w-5 h-5" />} />
                    <TabButton tabId="audit" label="Auditoria Financeira" icon={<CurrencyDollarIcon className="w-5 h-5" />} />
                    <TabButton tabId="management" label="Gestão & Performance" icon={<TrophyIcon className="w-5 h-5" />} />
                    <TabButton tabId="create" label="Novo Cadastro" icon={<UserCircleIcon className="w-5 h-5" />} />
                </nav>
            </div>

            {activeTab === 'hierarchy' && (
                <NetworkTreeView
                    initialId={selectedId?.toString() || '1'}
                    consultants={consultants}
                    onEdit={handleEdit}
                    onResetPassword={handleOpenResetModal}
                    onSelect={handleEdit}
                />
            )}

            {activeTab === 'audit' && (
                <FinancialAuditTab consultants={consultants} />
            )}

            {activeTab === 'management' && (
                <GoalsAndPerformancePage
                    consultants={consultants}
                    selectedConsultantId={selectedId}
                    onSelectConsultant={setSelectedId}
                    onUpdateConsultant={handleUpdateConsultant}
                />
            )}

            {activeTab === 'create' && <ConsultantCreateTab onCreated={loadConsultants} />}

            <ConsultantDetailModal
                isOpen={isModalOpen}
                consultant={selectedConsultantForEdit}
                onClose={handleCloseModal}
                onSave={handleSave}
            />
            <PasswordResetModal
                consultant={resettingConsultant}
                onClose={handleCloseResetModal}
                onConfirm={handleConfirmReset}
            />
        </div>
    );
};

const ConsultantListTab: React.FC<{ consultants: Consultant[]; onEdit: (c: Consultant) => void; onResetPassword: (c: Consultant) => void; }> = ({ consultants, onEdit, onResetPassword }) => {
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [pinFilter, setPinFilter] = useState('Todos');
    const [sigmaFilter, setSigmaFilter] = useState<'Todos' | 'Sim' | 'Não'>('Todos');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConsultants = useMemo(() => {
        return consultants.filter(c => {
            if (statusFilter !== 'Todos' && c.status !== statusFilter) return false;
            if (pinFilter !== 'Todos' && c.pin !== pinFilter) return false;
            if (sigmaFilter !== 'Todos') {
                const active = c.sigmaActive ? 'Sim' : 'Não';
                if (active !== sigmaFilter) return false;
            }
            if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [consultants, statusFilter, pinFilter, searchQuery]);

    const FilterInput: React.FC<{ children: React.ReactNode, label: string }> = ({ children, label }) => (
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
            {children}
        </div>
    );

    const baseInputClasses = "bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5";

    return (
        <div className="animate-fade-in">
            <div className="mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <FilterInput label="Buscar por nome">
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Digite o nome..." className={baseInputClasses} />
                    </FilterInput>
                    <FilterInput label="Filtrar por Status">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={baseInputClasses}>
                            <option>Todos</option>
                            <option>Ativo</option>
                            <option>Inativo</option>
                            <option>Pendente</option>
                        </select>
                    </FilterInput>
                    <FilterInput label="Filtrar por PIN">
                        <select value={pinFilter} onChange={e => setPinFilter(e.target.value)} className={baseInputClasses}>
                            <option>Todos</option>
                            <option>Bronze</option>
                            <option>Prata</option>
                            <option>Ouro</option>
                            <option>Diamante</option>
                        </select>
                    </FilterInput>
                    <FilterInput label="Ativo SIGMA">
                        <select value={sigmaFilter} onChange={e => setSigmaFilter(e.target.value as any)} className={baseInputClasses}>
                            <option>Todos</option>
                            <option>Sim</option>
                            <option>Não</option>
                        </select>
                    </FilterInput>
                    <button className="bg-yellow-500 text-black font-bold py-2.5 px-5 rounded-lg hover:bg-yellow-600 transition-colors w-full md:w-auto">
                        Aplicar Filtros
                    </button>
                </div>
            </div>
            <ConsultantsTable consultants={filteredConsultants} onEdit={onEdit} onResetPassword={onResetPassword} />
        </div>
    );
};

const PasswordResetModal: React.FC<{
    consultant: Consultant | null;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ consultant, onClose, onConfirm }) => {
    if (!consultant) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-900 border border-yellow-500/50 rounded-2xl shadow-xl w-full max-w-md">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2"><KeyIcon className="w-6 h-6" /> Confirmar Reset de Senha</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <main className="p-6 text-center">
                    <p className="text-gray-300 text-lg">
                        Tem certeza que deseja resetar a senha para <strong className="text-white">{consultant.name}</strong>?
                    </p>
                    <p className="mt-4 text-gray-400">
                        A senha será alterada para o padrão: <br />
                        <strong className="font-mono text-xl text-yellow-400 bg-black/50 px-2 py-1 rounded mt-2 inline-block">RS123</strong>
                    </p>
                    <p className="text-xs text-red-400 mt-4">Esta ação é imediata e não pode ser desfeita.</p>
                </main>
                <footer className="p-4 bg-black/50 border-t border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                    <button onClick={onConfirm} className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Confirmar Reset</button>
                </footer>
            </div>
        </div>
    );
};

const UserReportTab: React.FC<{ consultants: Consultant[], selectedId: number | null, setSelectedId: (id: number | null) => void }> = ({ consultants, selectedId, setSelectedId }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOrderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const filteredConsultants = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return consultants;
        }
        return consultants.filter(c =>
            c.name.toLowerCase().includes(query) ||
            (c.code && c.code.toLowerCase().includes(query)) ||
            (c.username && c.username.toLowerCase().includes(query))
        );
    }, [consultants, searchQuery]);

    const selectedConsultant = useMemo(() => consultants.find(c => c.id === selectedId), [consultants, selectedId]);

    const handleViewOrder = (orderId: string) => {
        const orderToView = mockOrders.find(o => o.id === orderId);
        if (orderToView) {
            setSelectedOrder(orderToView);
            setOrderDetailModalOpen(true);
        } else {
            alert(`Pedido ${orderId} não encontrado.`);
        }
    };

    const handleSaveOrder = (updatedOrder: Order) => {
        // This is a view-only modal in this context, just close it.
        setOrderDetailModalOpen(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] animate-fade-in">
            <div className="lg:col-span-1 bg-black/50 border border-gray-800 rounded-xl flex flex-col p-4">
                <div className="relative mb-4">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar consultor..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 pl-10"
                    />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {filteredConsultants.length > 0 ? filteredConsultants.map(c => (
                        <button key={c.id} onClick={() => setSelectedId(Number(c.id))} className={`w-full p-3 rounded-lg text-left transition-colors border ${selectedId === Number(c.id) ? 'bg-yellow-500/10 border-yellow-500/30' : 'border-transparent hover:bg-gray-700/50'}`}>
                            <div className="flex items-center gap-3">
                                <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold truncate ${selectedId === c.id ? 'text-yellow-400' : 'text-white'}`}>{c.code || c.id} - {c.name}</p>
                                    {c.username && <p className="text-[10px] text-yellow-500/80 -mt-1 font-mono uppercase">MMN ID: {c.username}</p>}
                                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                                        <span>PIN: <span className="font-semibold text-yellow-500">{c.pin}</span></span>
                                        <span>Status: <span className={`font-semibold ${c.status === 'Ativo' ? 'text-green-400' : c.status === 'Inativo' ? 'text-red-400' : 'text-yellow-400'}`}>{c.status}</span></span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 truncate">
                                        <EnvelopeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate">{c.contact.email}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                                        <WhatsAppIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{c.contact.phone}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                                        <BuildingOffice2Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate">{c.address.city}, {c.address.state}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    )) : (
                        <div className="text-center text-gray-500 pt-10">
                            <p>Nenhum consultor encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="lg:col-span-2 bg-black/50 border border-gray-800 rounded-xl p-6 overflow-y-auto">
                {selectedConsultant ? <ReportDetailView consultant={selectedConsultant} onViewOrder={handleViewOrder} allConsultants={consultants} onConsultantClick={(id) => setSelectedId(id)} /> : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                        <ClipboardDocumentListIcon className="w-16 h-16" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-400">Selecione um Usuário</h3>
                        <p className="max-w-xs">Escolha um consultor na lista ao lado para visualizar o relatório completo de dados, vendas e comissões.</p>
                    </div>
                )}
            </div>
            <OrderDetailModal
                isOpen={isOrderDetailModalOpen}
                order={selectedOrder}
                onClose={() => setOrderDetailModalOpen(false)}
                onSave={handleSaveOrder}
            />
        </div>
    );
};

const ReportCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-gray-900/50 border border-gray-800/80 rounded-xl shadow-md overflow-hidden">
        <header className="flex items-center p-3 bg-black/30 border-b border-gray-800/80">
            {icon}
            <h3 className="text-base font-semibold text-white ml-2">{title}</h3>
        </header>
        <div className="p-4">{children}</div>
    </div>
);

const ExpandablePurchaseCard: React.FC<{ event: PurchaseEvent & { originConsultant: Consultant }, onConsultantClick: (id: number) => void }> = ({ event, onConsultantClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { originConsultant, uplinePayments } = event;
    const totalBonusGenerated = useMemo(() => uplinePayments.reduce((sum, p) => sum + p.amount, 0), [uplinePayments]);

    return (
        <div className="bg-gray-900/50 border border-gray-800/80 rounded-lg">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between p-3 text-left">
                <div className="flex items-center gap-3">
                    <img src={originConsultant.avatar} alt={originConsultant.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <p className="font-semibold text-white">Compra de {originConsultant.name}</p>
                        <p className="text-xs text-gray-400">{event.description} ({event.id})</p>
                        <p className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString('pt-BR')} - {event.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>
                <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
            {isExpanded && (
                <div className="p-3 border-t border-gray-800 animate-fade-in">
                    {uplinePayments.length > 0 ? (
                        <table className="w-full text-xs text-left text-gray-300">
                            <thead className="text-yellow-500 uppercase">
                                <tr>
                                    <th className="py-2 px-2">Recebedor</th>
                                    <th className="py-2 px-2">Bônus</th>
                                    <th className="py-2 px-2 text-center">Nível Teórico</th>
                                    <th className="py-2 px-2 text-center">Nível Efetivo</th>
                                    <th className="py-2 px-2 text-right">Valor Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uplinePayments.map(p => (
                                    <tr key={`${p.recipientId}-${p.bonusType}`} className="border-t border-gray-800">
                                        <td className="py-2 px-2"><button onClick={() => onConsultantClick(p.recipientId)} className="hover:underline text-yellow-400">{p.recipientName}</button></td>
                                        <td className="py-2 px-2">{p.bonusType}</td>
                                        <td className="py-2 px-2 text-center">{p.theoreticalLevel}</td>
                                        <td className={`py-2 px-2 text-center font-bold ${p.effectiveLevel < p.theoreticalLevel ? 'text-yellow-400' : ''}`}>
                                            {p.effectiveLevel} {p.effectiveLevel < p.theoreticalLevel && <span title="Compressão Dinâmica Aplicada">*</span>}
                                        </td>
                                        <td className="py-2 px-2 text-right font-semibold text-green-400">{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-yellow-500/50 font-bold">
                                    <td colSpan={4} className="py-2 px-2 text-right text-white">Total de Bônus Gerado:</td>
                                    <td className="py-2 px-2 text-right text-green-400">{totalBonusGenerated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <p className="text-xs text-gray-500 text-center py-2">Nenhum bônus foi gerado para a linha ascendente nesta compra (ex: usuário no topo da rede).</p>
                    )}
                </div>
            )}
        </div>
    );
};


const ReportDetailView: React.FC<{ consultant: Consultant, onViewOrder: (orderId: string) => void, allConsultants: Consultant[], onConsultantClick: (id: number) => void }> = ({ consultant, onViewOrder, allConsultants, onConsultantClick }) => {
    const statusClasses = { 'Ativo': 'text-green-400', 'Inativo': 'text-red-400', 'Pendente': 'text-yellow-400' };
    const [reportTab, setReportTab] = useState('pessoal');

    const getDownlineIds = (consultantId: number, allConsultants: Consultant[]): number[] => {
        const downline: number[] = [];
        // Ensure type compatibility for ID comparison
        const directs = allConsultants.filter(c => c.sponsor && Number(c.sponsor.id) === consultantId);
        for (const direct of directs) {
            const directId = Number(direct.id);
            downline.push(directId);
            downline.push(...getDownlineIds(directId, allConsultants));
        }
        return downline;
    };

    const networkImpactEvents = useMemo(() => {
        if (!consultant) return [];
        const events: Array<PurchaseEvent & { originConsultant: Consultant }> = [];
        allConsultants.forEach(c => {
            if (c.id !== consultant.id) {
                c.purchaseHistory.forEach(event => {
                    if (event.uplinePayments.some(p => p.recipientId === consultant.id)) {
                        events.push({ ...event, originConsultant: c });
                    }
                });
            }
        });
        return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [consultant, allConsultants]);

    const totalBonus = useMemo(() => {
        return consultant.commissionHistory.reduce((sum, item) => sum + item.amount, 0);
    }, [consultant.commissionHistory]);

    const pinComposition = useMemo(() => {
        const downlineIds = getDownlineIds(Number(consultant.id), allConsultants);
        const downlineConsultants = allConsultants.filter(c => downlineIds.includes(Number(c.id)));
        // FIX: The initial value for reduce was an untyped empty object `{}`, causing a type error on `acc[c.pin]`. Casting the initial value to `Record<string, number>` correctly types the accumulator.
        return downlineConsultants.reduce((acc, c) => {
            acc[c.pin] = (acc[c.pin] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [consultant.id, allConsultants]);

    const ReportTabButton: React.FC<{ tabId: string; label: string; }> = ({ tabId, label }) => (
        <button onClick={() => setReportTab(tabId)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${reportTab === tabId ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-white'}`}>
            {label}
        </button>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex items-center gap-4">
                <img src={consultant.avatar} alt={consultant.name} className="w-20 h-20 rounded-full object-cover border-2 border-yellow-500" />
                <div>
                    <h2 className="text-2xl font-bold text-white">{consultant.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span>ID: <span className="font-semibold text-yellow-400">{consultant.code || consultant.id}</span></span>
                        {consultant.username && <span>MMN ID: <span className="font-semibold text-yellow-400 uppercase">{consultant.username}</span></span>}
                        <span>PIN: <span className="font-semibold text-yellow-400">{consultant.pin}</span></span>
                        <span>Status: <span className={`font-semibold ${statusClasses[consultant.status]}`}>{consultant.status}</span></span>
                    </div>
                    {consultant.sponsor && <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1"><ShareIcon className="w-4 h-4" /> Patrocinador(a): <button onClick={() => onConsultantClick(Number(consultant.sponsor!.id))} className="hover:underline text-yellow-400">{consultant.sponsor.name}</button></p>}
                </div>
            </header>

            <div className="border-b border-gray-800">
                <nav className="-mb-px flex space-x-4">
                    <ReportTabButton tabId="pessoal" label="Relatório Pessoal" />
                    <ReportTabButton tabId="rede" label="Relatório de Rede" />
                </nav>
            </div>

            {reportTab === 'pessoal' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ReportCard title="Bônus Acumulados" icon={<CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />}>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-green-400">{totalBonus.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                <p className="text-xs text-gray-400 mt-1">Total recebido na plataforma</p>
                            </div>
                        </ReportCard>
                        <ReportCard title="Composição da Rede (Downline)" icon={<GridIcon className="w-5 h-5 text-yellow-500" />}>
                            {Object.keys(pinComposition).length > 0 ? (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    {/* FIX: Explicitly cast values to number in sort to fix type inference issue. */}
                                    {Object.entries(pinComposition).sort(([, a], [, b]) => (b as number) - (a as number)).map(([pin, count]) => (
                                        <div key={pin} className="flex justify-between">
                                            <span className="text-gray-300">{pin}:</span>
                                            <span className="font-bold text-white">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-gray-500 text-center">Nenhum consultor na rede.</p>}
                        </ReportCard>
                    </div>

                    <ReportCard title="Histórico de Vendas Realizadas" icon={<CubeIcon className="w-5 h-5 text-yellow-500" />}>
                        <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-xs text-left text-gray-300">
                                <thead className="text-yellow-500 uppercase"><tr><th className="py-2 px-2">Pedido</th><th className="py-2 px-2">Data</th><th className="py-2 px-2">Itens</th><th className="py-2 px-2 text-right">Total</th></tr></thead>
                                <tbody>{consultant.salesHistory.map(sale => (<tr key={sale.id} className="border-t border-gray-800"><td className="py-2 px-2 font-mono"><button onClick={() => onViewOrder(sale.id)} className="text-yellow-500 hover:underline">{sale.id}</button></td><td className="py-2 px-2">{new Date(sale.date).toLocaleDateString('pt-BR')}</td><td className="py-2 px-2">{sale.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td><td className="py-2 px-2 text-right font-semibold">{sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>))}</tbody>
                            </table>
                        </div>
                    </ReportCard>
                    <ReportCard title="Histórico de Bônus Recebidos" icon={<ChartBarIcon className="w-5 h-5 text-yellow-500" />}>
                        <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-xs text-left text-gray-300">
                                <thead className="text-yellow-500 uppercase"><tr><th className="py-2 px-2">Data</th><th className="py-2 px-2">Tipo</th><th className="py-2 px-2">Descrição</th><th className="py-2 px-2 text-right">Valor</th></tr></thead>
                                <tbody>{consultant.commissionHistory.map(c => (<tr key={c.id} className="border-t border-gray-800"><td className="py-2 px-2">{new Date(c.date).toLocaleDateString('pt-BR')}</td><td className="py-2 px-2">{c.bonusType}</td><td className="py-2 px-2">{c.description}</td><td className="py-2 px-2 text-right font-semibold text-green-400">{c.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>))}</tbody>
                            </table>
                        </div>
                    </ReportCard>
                </div>
            )}

            {reportTab === 'rede' && (
                <div className="animate-fade-in">
                    <ReportCard title="Impacto na Rede (Compras que Geraram Bônus)" icon={<UserCircleIcon className="w-5 h-5 text-yellow-500" />}>
                        <div className="max-h-[500px] overflow-y-auto space-y-3">
                            {networkImpactEvents.length > 0 ? (
                                networkImpactEvents.map(event => <ExpandablePurchaseCard key={`${event.id}-${event.originConsultant.id}`} event={event} onConsultantClick={onConsultantClick} />)
                            ) : (
                                <p className="text-sm text-gray-500 text-center p-4">Nenhum bônus de rede foi gerado por consultores da sua equipe neste período.</p>
                            )}
                        </div>
                    </ReportCard>
                </div>
            )}

        </div>
    );
}

export default ConsultantsPage;
