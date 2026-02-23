
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
// import { useUser } from './ConsultantLayout'; // Removed as we use API now
import type { User, NetworkNode } from '../types';
import { mockDeepNetwork } from './data';
import { IconBell, IconMessage, IconUser, IconCalendar, IconBookOpen, IconDownload } from '../components/icons';
import { communicationService, Announcement, AgendaItem } from './services/communicationService';

import Treinamentos from './comunicacao/Treinamentos';
import Catalogo from './comunicacao/Catalogo';
import Downloads from './comunicacao/Downloads';

type Tab = 'comunicados' | 'agenda' | 'treinamentos' | 'materiais';

interface TabButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ label, active, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${active ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-400 hover:text-white'}`}
    >
        {icon}
        {label}
    </button>
);

const getNetworkDownline = (node: NetworkNode, maxLevel: number): User[] => {
    const downline: User[] = [];
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

const BirthdayCard: React.FC<{ member: User }> = ({ member }) => {
    const [, month, day] = member.birthDate.split('-');

    const handleSendWhatsApp = () => {
        const message = `Olá, ${member.name}! 🎉 Muitas felicidades, saúde e sucesso neste seu dia especial. Que seja um novo ciclo de grandes realizações! Um grande abraço da equipe RS Prólipsi.`;
        const phoneNumber = member.whatsapp.replace(/\D/g, '');
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex items-center justify-between p-4 bg-brand-gray-light rounded-lg">
            <div className="flex items-center space-x-4">
                <img src={member.avatarUrl} alt={member.name} className="h-12 w-12 rounded-full" />
                <div>
                    <p className="font-bold text-white">{member.name}</p>
                    <p className="text-sm text-gray-400">PIN: {member.pin}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-lg font-bold text-brand-gold">{day}/{month}</p>
                <button
                    onClick={handleSendWhatsApp}
                    className="text-xs mt-1 bg-brand-gray px-3 py-1.5 rounded-md hover:bg-brand-dark transition-colors font-semibold"
                >
                    Enviar Parabéns
                </button>
            </div>
        </div>
    );
};


const AgendaComemorativa: React.FC = () => {
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAgenda = async () => {
            setLoading(true);
            const res = await communicationService.getAgenda();
            if (res.success && res.data) {
                setAgendaItems(res.data);
            }
            setLoading(false);
        };
        loadAgenda();
    }, []);

    const currentMonth = new Date().getMonth() + 1;
    // Get downline up to 5th generation (Local Logic)
    const downline = getNetworkDownline(mockDeepNetwork, 5);
    const birthdaysThisMonth = downline
        .filter(member => parseInt(member.birthDate.split('-')[1]) === currentMonth)
        .sort((a, b) => parseInt(a.birthDate.split('-')[2]) - parseInt(b.birthDate.split('-')[2]));

    if (loading) return <div className="text-center py-10 text-gray-400">Carregando agenda...</div>;

    return (
        <div className="animate-fade-in space-y-8">
            {/* Corporate Agenda from API */}
            {agendaItems.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <IconCalendar size={20} className="text-brand-gold" />
                        Agenda Corporativa
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {agendaItems.map(item => (
                            <div key={item.id} className="p-4 bg-brand-gray-light rounded-lg border-l-4 border-brand-gold">
                                <span className="text-xs font-bold text-brand-gold uppercase">{item.category}</span>
                                <h3 className="font-bold text-white mt-1">{item.title}</h3>
                                <p className="text-sm text-gray-400 mt-2">{item.content}</p>
                                <p className="text-xs text-gray-500 mt-2">{new Date(item.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Local Birthdays */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <IconUser size={20} className="text-brand-gold" />
                    Aniversariantes da Rede
                </h2>
                {birthdaysThisMonth.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {birthdaysThisMonth.map(member => <BirthdayCard key={member.id} member={member} />)}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500 bg-brand-gray-light rounded-lg">
                        <p>Nenhum aniversário este mês na sua rede (até 5ª geração).</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const Comunicados: React.FC = () => {
    const [messages, setMessages] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMessages = async () => {
            setLoading(true);
            const res = await communicationService.getAnnouncements();
            if (res.success && res.data) {
                setMessages(res.data);
            }
            setLoading(false);
        };
        loadMessages();
    }, []);

    if (loading) return <div className="text-center py-10 text-gray-400">Carregando comunicados...</div>;

    return (
        <div className="space-y-6 animate-fade-in max-h-[70vh] overflow-y-auto pr-2">
            {messages.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <IconMessage size={40} className="mx-auto" />
                    <p className="mt-2">Você está em dia com os comunicados.</p>
                </div>
            ) : (
                messages.map(msg => (
                    <div key={msg.id} className="flex space-x-4 p-4 border-b border-brand-gray-light last:border-b-0">
                        <div className="flex-shrink-0">
                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center
                                ${msg.type === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
                                ${msg.type === 'alert' ? 'bg-red-500/20 text-red-400' : ''}
                                ${msg.type === 'promo' ? 'bg-green-500/20 text-green-400' : ''}
                            `}>
                                {msg.type === 'alert' ? <IconBell /> : <IconMessage />}
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-white">{msg.title}</h2>
                                    <p className="text-sm text-gray-300 mt-1">{msg.message}</p>
                                </div>
                                {!msg.read && <span className="text-xs bg-brand-gold text-brand-dark font-semibold px-2 py-1 rounded-full">Novo</span>}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{new Date(msg.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};


// [DEBUG] Forcing HMR update for tabs
const Comunicacao: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('comunicados');

    const renderContent = () => {
        switch (activeTab) {
            case 'comunicados': return <Comunicados />;
            case 'agenda': return <AgendaComemorativa />;
            case 'treinamentos': return <Treinamentos />;
            case 'materiais': return (
                <div className="space-y-8 animate-fade-in">
                    <Catalogo />
                    <hr className="border-gray-700 my-8" />
                    <Downloads />
                </div>
            );
            default: return null;
        }
    };


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-brand-gold">Central de Comunicação e Conteúdo</h1>
            <Card>
                <div className="border-b border-brand-gray-light mb-6">
                    <div className="flex items-center overflow-x-auto space-x-1">
                        <TabButton label="Mural de Comunicados" active={activeTab === 'comunicados'} onClick={() => setActiveTab('comunicados')} icon={<IconBell size={20} />} />
                        <TabButton label="Agenda Comemorativa" active={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} icon={<IconCalendar size={20} />} />
                        <TabButton label="Central de Treinamentos" active={activeTab === 'treinamentos'} onClick={() => setActiveTab('treinamentos')} icon={<IconBookOpen size={20} />} />
                        <TabButton label="Materiais de Apoio" active={activeTab === 'materiais'} onClick={() => setActiveTab('materiais')} icon={<IconDownload size={20} />} />
                    </div>
                </div>

                {renderContent()}
            </Card>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Comunicacao;
