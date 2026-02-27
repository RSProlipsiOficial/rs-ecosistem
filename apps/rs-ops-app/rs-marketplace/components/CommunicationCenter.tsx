import React, { useState, useEffect, useMemo } from 'react';
import communicationAPI from '../services/communicationAPI';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { StarIcon } from './icons/StarIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { UserIcon } from './icons/UserIcon';
import { mockDeepNetwork } from '../data/network';
import { NetworkNode, UserProfile } from '../types';

import Treinamentos from './communication/Treinamentos';
import Catalogo from './communication/Catalogo';
import Downloads from './communication/Downloads';

// --- TYPES ---
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

// --- UTILITY FUNCTIONS ---
const getIcon = (type: string, className: string = 'w-6 h-6') => {
    const props = { className };
    switch (type) {
        case 'alert': return <MegaphoneIcon {...props} />;
        case 'info': return <MegaphoneIcon {...props} />;
        case 'promo': return <MegaphoneIcon {...props} />;
        case 'photo': return <PhotoIcon {...props} />;
        case 'presentation': return <DocumentTextIcon {...props} />;
        case 'catalog': return <DocumentTextIcon {...props} />;
        case 'document': return <DocumentTextIcon {...props} />;
        case 'Boas-vindas': return <UserPlusIcon {...props} />;
        case 'Aniversariantes': return <TrophyIcon {...props} />;
        case 'PINs': return <StarIcon {...props} />;
        case 'Datas Comemorativas': return <CalendarIcon {...props} />;
        case 'Network': return <UserIcon {...props} />;
        default: return null;
    }
};

const getNetworkDownline = (node: NetworkNode, maxLevel: number): UserProfile[] => {
    const downline: UserProfile[] = [];
    const queue: NetworkNode[] = [...node.children];

    while (queue.length > 0) {
        const currentNode = queue.shift();
        if (currentNode && !currentNode.isEmpty && currentNode.level <= maxLevel) {
            downline.push(currentNode);
            if (currentNode.children) {
                queue.push(...currentNode.children);
            }
        }
    }
    return downline;
};

const BirthdayCard: React.FC<{ member: UserProfile }> = ({ member }) => {
    const birthDate = (member as any).birthDate || '1990-01-01';
    const [, month, day] = birthDate.split('-');

    const handleSendWhatsApp = () => {
        const message = `Olá, ${member.name}! 🎉 Muitas felicidades, saúde e sucesso neste seu dia especial. Que seja um novo ciclo de grandes realizações! Um grande abraço da equipe RS Prólipsi.`;
        const phone = (member as any).phone || '';
        const phoneNumber = phone.replace(/\D/g, '');
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex items-center justify-between p-4 bg-dark-900 border border-dark-800 rounded-lg">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img src={member.avatarUrl} alt={member.name} className="h-12 w-12 rounded-full border-2 border-gold-500/30" />
                    <div className="absolute -bottom-1 -right-1 bg-gold-500 rounded-full p-1">
                        <CalendarIcon className="w-2.5 h-2.5 text-black" />
                    </div>
                </div>
                <div>
                    <p className="font-bold text-white mb-0.5">{member.name}</p>
                    <p className="text-[10px] font-bold text-gold-500 uppercase tracking-widest opacity-80">{member.graduation}</p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end">
                <p className="text-lg font-black text-white">{day}/{month}</p>
                <button
                    onClick={handleSendWhatsApp}
                    className="text-[10px] mt-1.5 bg-dark-800 text-gold-500 border border-gold-500/20 px-3 py-1.5 rounded-md hover:bg-gold-500 hover:text-black transition-all font-bold uppercase tracking-tighter"
                >
                    Felicitar
                </button>
            </div>
        </div>
    );
};

// Mapeadores
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

// --- TAB COMPONENTS ---
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

    const currentMonth = new Date().getMonth() + 1;
    const downline = getNetworkDownline(mockDeepNetwork, 5);
    const birthdaysThisMonth = downline
        .filter(member => {
            const bDate = (member as any).birthDate;
            if (!bDate) return false;
            return parseInt(bDate.split('-')[1]) === currentMonth;
        })
        .sort((a, b) => {
            const dayA = parseInt(((a as any).birthDate || '').split('-')[2] || '0');
            const dayB = parseInt(((b as any).birthDate || '').split('-')[2] || '0');
            return dayA - dayB;
        });

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

            <div className="space-y-4 pt-4 border-t border-dark-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {getIcon('Network', 'w-6 h-6 text-gold-500')} Aniversariantes da Rede
                </h2>
                {birthdaysThisMonth.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {birthdaysThisMonth.map(member => (
                            <BirthdayCard key={member.id} member={member} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500 border border-dark-800 border-dashed rounded-lg">
                        <TrophyIcon className="w-12 h-12 mx-auto opacity-20" />
                        <p className="mt-2">Nenhum aniversário este mês na sua rede (até 5ª geração).</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
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
