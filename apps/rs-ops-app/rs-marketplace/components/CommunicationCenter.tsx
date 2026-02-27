import React, { useState, useEffect, useMemo } from 'react';
import communicationAPI from '../services/communicationAPI';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { StarIcon } from './icons/StarIcon';
import { TrophyIcon } from './icons/TrophyIcon';

import Treinamentos from './communication/Treinamentos';
import Catalogo from './communication/Catalogo';
import Downloads from './communication/Downloads';

// --- TIPOS ---
interface Announcement {
    id: string;
    type: 'alert' | 'info' | 'promo';
    title: string;
    content: string;
    created_at: string;
    is_new: boolean;
}

type AgendaCategory = 'Boas-vindas' | 'Aniversariantes' | 'PINs' | 'Datas Comemorativas';
interface AgendaItem {
    id: string;
    category: AgendaCategory;
    title: string;
    content: string;
}

// --- FUNÇÕES UTILITÁRIAS ---
const getIcon = (type: string, className: string = 'w-6 h-6') => {
    const props = { className };
    switch (type) {
        case 'alert': return <MegaphoneIcon {...props} />;
        case 'info': return <MegaphoneIcon {...props} />;
        case 'promo': return <MegaphoneIcon {...props} />;
        case 'presentation': return <DocumentTextIcon {...props} />;
        case 'catalog': return <DocumentTextIcon {...props} />;
        case 'document': return <DocumentTextIcon {...props} />;
        case 'Boas-vindas': return <UserPlusIcon {...props} />;
        case 'Aniversariantes': return <TrophyIcon {...props} />;
        case 'PINs': return <StarIcon {...props} />;
        case 'Datas Comemorativas': return <CalendarIcon {...props} />;
        default: return null;
    }
};

// Mapeadores de dados da API
const mapAnnouncement = (it: any): Announcement => ({
    id: String(it.id ?? ''),
    type: String(it.type ?? 'info') as any,
    title: String(it.title ?? it.name ?? ''),
    content: String(it.content ?? it.message ?? ''),
    created_at: String(it.created_at ?? it.date ?? new Date().toISOString()),
    is_new: Boolean(it.is_new ?? it.new ?? false),
});

const mapAgendaItem = (it: any): AgendaItem => ({
    id: String(it.id ?? ''),
    category: (it.category ?? 'Datas Comemorativas') as any,
    title: String(it.title ?? ''),
    content: String(it.content ?? it.message ?? ''),
});

// --- COMPONENTES DAS ABAS ---
const AnnouncementsTab: React.FC<{ announcements: Announcement[] }> = ({ announcements }) => (
    <div className="space-y-4">
        {announcements.length > 0 ? announcements.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-4 bg-dark-900 rounded-lg border border-dark-800" onClick={async () => { try { const uid = localStorage.getItem('rs-user-id') || 'anonymous'; await communicationAPI.announcements.acknowledge(item.id, uid); } catch { } }}>
                <div className="p-3 rounded-full bg-dark-800 text-gold-500 flex-shrink-0">
                    {getIcon(item.type)}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-white">{item.title}</h3>
                        {item.is_new && (
                            <span className="px-3 py-1 text-xs font-bold text-black bg-gold-500 rounded-full ml-4 flex-shrink-0">
                                Novo
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{item.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </p>
                </div>
            </div>
        )) : (
            <div className="text-center py-16 text-gray-500">
                <MegaphoneIcon className="w-12 h-12 mx-auto" />
                <p className="mt-2">Nenhum comunicado disponível.</p>
            </div>
        )}
    </div>
);

const AgendaComemorativaTab: React.FC<{ items: AgendaItem[] }> = ({ items }) => {
    const groupedItems = useMemo(() => {
        return items.reduce((acc: Record<AgendaCategory, AgendaItem[]>, item) => {
            (acc[item.category] = acc[item.category] || []).push(item);
            return acc;
        }, {} as Record<AgendaCategory, AgendaItem[]>);
    }, [items]);

    return (
        <div className="space-y-8">
            <div>
                <p className="text-sm text-gray-400 mb-4">
                    Mensagens automáticas para datas e conquistas especiais.
                </p>
                {items.length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(groupedItems).map(([category, categoryItems]) => (
                            <div key={category}>
                                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    {getIcon(category, 'w-6 h-6 text-gold-500')} {category}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(categoryItems as AgendaItem[]).map(item => (
                                        <div key={item.id} className="flex flex-col justify-between p-4 bg-dark-900 rounded-lg border border-dark-800">
                                            <div>
                                                <h3 className="font-bold text-white">{item.title}</h3>
                                                <p className="text-sm text-gray-400 mt-1">{item.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500 border border-dark-800 border-dashed rounded-lg">
                        <CalendarIcon className="w-12 h-12 mx-auto opacity-20" />
                        <p className="mt-2">Nenhum item na agenda corporativa.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const CommunicationCenter: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'announcements' | 'agenda' | 'training' | 'materials'>('announcements');
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);

    useEffect(() => {
        loadAllData();
        const interval = setInterval(() => {
            loadAllData();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [announcementsRes, agendaRes] = await Promise.all([
                communicationAPI.announcements.getAll(),
                communicationAPI.agendaItems.getAll()
            ]);

            if (announcementsRes.success && announcementsRes.data) {
                setAnnouncements((announcementsRes.data as any[]).map(mapAnnouncement));
            }
            if (agendaRes.success && agendaRes.data) {
                setAgendaItems((agendaRes.data as any[]).map(mapAgendaItem));
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const TabButton: React.FC<{ tabId: typeof activeTab; label: string; icon: React.ReactNode }> = ({ tabId, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors rounded-t-lg border-b-2 whitespace-nowrap ${activeTab === tabId
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
        >
            {icon} {label}
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-400"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gold-500 mb-6">Central de Comunicação e Conteúdo</h1>

            <div className="border-b border-dark-800 mb-6">
                <nav className="-mb-px flex space-x-2 overflow-x-auto">
                    <TabButton tabId="announcements" label="Mural de Comunicados" icon={<MegaphoneIcon className="w-5 h-5" />} />
                    <TabButton tabId="agenda" label="Agenda Comemorativa" icon={<CalendarIcon className="w-5 h-5" />} />
                    <TabButton tabId="training" label="Central de Treinamentos" icon={<BookOpenIcon className="w-5 h-5" />} />
                    <TabButton tabId="materials" label="Materiais de Apoio" icon={<DownloadIcon className="w-5 h-5" />} />
                </nav>
            </div>

            <div className="animate-fade-in">
                {activeTab === 'announcements' && <AnnouncementsTab announcements={announcements} />}
                {activeTab === 'agenda' && <AgendaComemorativaTab items={agendaItems} />}
                {activeTab === 'training' && <Treinamentos />}
                {activeTab === 'materials' && (
                    <div className="space-y-12">
                        <Catalogo />
                        <Downloads />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunicationCenter;
