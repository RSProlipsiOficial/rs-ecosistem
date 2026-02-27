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

interface Training {
    id: string;
    title: string;
    description?: string;
    cover_image?: string;
    duration?: number;
    category?: string;
}

interface Catalog {
    id: string;
    title: string;
    cover_image?: string;
    pdf_url?: string;
    file_name?: string;
}

interface DownloadMaterial {
    id: string;
    title: string;
    description?: string;
    icon_type?: 'photo' | 'document' | 'presentation';
    file_url?: string;
    file_name?: string;
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
    // member.birthDate for mock purposes is not always available in UserProfile type, 
    // but in consultant it was member.birthDate. split('-')
    // I'll add a birthDate check or use a default
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

const forceDownload = async (url: string, fileName: string) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        a.remove();
    } catch (error) {
        console.error('Download failed:', error);
        window.open(url, '_blank');
    }
};

// Mapeadores para alinhar DTOs da API com o front
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

const mapTraining = (it: any) => {
    const rawLessons = Array.isArray(it.lessons)
        ? it.lessons
        : Array.isArray(it.modules)
            ? it.modules.flatMap((m: any) => Array.isArray(m.lessons) ? m.lessons : [])
            : [];
    const lessons = rawLessons.map((ls: any) => ({
        id: String(ls.id ?? Math.random()),
        title: String(ls.title ?? 'Aula'),
        video_id: String(ls.video_id ?? ls.videoId ?? ''),
        completed: Boolean(ls.completed ?? false),
    }));
    return {
        id: String(it.id ?? ''),
        title: String(it.title ?? ''),
        description: it.description ? String(it.description) : undefined,
        cover_image: String(it.cover_image ?? it.thumbnail_url ?? ''),
        lessons,
    };
};

const mapCatalog = (it: any): Catalog => ({
    id: String(it.id ?? ''),
    title: String(it.title ?? ''),
    cover_image: it.cover_image ? String(it.cover_image) : undefined,
    pdf_url: it.pdf_url ? String(it.pdf_url) : undefined,
    file_name: it.file_name ? String(it.file_name) : undefined,
});

const mapDownload = (it: any): DownloadMaterial => ({
    id: String(it.id ?? ''),
    title: String(it.title ?? ''),
    description: it.description ? String(it.description) : undefined,
    icon_type: (it.icon_type ?? 'document') as any,
    file_url: it.file_url ? String(it.file_url) : undefined,
    file_name: it.file_name ? String(it.file_name) : undefined,
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

            {/* Aniversariantes da Rede - Sincronizado do Consultor */}
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

const TrainingTab: React.FC<{ trainings: any[]; selectedTraining: any | null; setSelectedTraining: (t: any | null) => void; selectedLessonId: string | null; setSelectedLessonId: (id: string | null) => void }> = ({ trainings, selectedTraining, setSelectedTraining, selectedLessonId, setSelectedLessonId }) => {
    const getEmbedUrl = (videoId: string) => videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
    const [isAiExplainLoading, setIsAiExplainLoading] = useState(false);
    const [quizData, setQuizData] = useState<Array<{ question: string; options: string[]; correctAnswerIndex: number }> | null>(null);
    const [isQuizOpen, setIsQuizOpen] = useState(false);

    if (!selectedTraining) {
        return (
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainings.length > 0 ? trainings.map(t => (
                        <button key={t.id} onClick={() => { setSelectedTraining(t); const first = Array.isArray(t.lessons) && t.lessons[0] ? String(t.lessons[0].id) : null; setSelectedLessonId(first); }} className="bg-dark-900 border border-dark-800 rounded-lg overflow-hidden hover:border-gold-500 transition-colors text-left">
                            <div className="aspect-video bg-dark-800 flex items-center justify-center">
                                {t.cover_image ? (
                                    <img src={t.cover_image} alt={t.title} className="w-full h-full object-cover" />
                                ) : (
                                    <BookOpenIcon className="w-12 h-12 text-gray-600" />
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-white mb-1">{t.title}</h3>
                                {t.description && (
                                    <p className="text-sm text-gray-400 mb-2">{t.description}</p>
                                )}
                            </div>
                        </button>
                    )) : (
                        <div className="col-span-full text-center py-16 text-gray-500">
                            <BookOpenIcon className="w-12 h-12 mx-auto" />
                            <p className="mt-2">Nenhum treinamento disponível.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const lessons = Array.isArray(selectedTraining.lessons) ? selectedTraining.lessons : [];
    const currentLesson = lessons.find((l: any) => String(l.id) === String(selectedLessonId));
    const moduleProgress = lessons.length > 0 ? Math.round((lessons.filter((l: any) => l.completed).length / lessons.length) * 100) : 0;

    const handleAiSummarize = () => { setIsAiSummaryLoading(true); setAiSummary(null); setTimeout(() => { setAiSummary(`Resumo da aula "${currentLesson?.title || ''}":\n- Pontos principais\n- Dicas práticas\n- Próximos passos`); setIsAiSummaryLoading(false); }, 600); };
    const handleAiExplain = () => { setIsAiExplainLoading(true); setAiExplanation(null); setTimeout(() => { setAiExplanation(`Explicação da aula "${currentLesson?.title || ''}": visão prática e exemplo simples para aplicar.`); setIsAiExplainLoading(false); }, 700); };
    const handleGenerateQuiz = () => { setQuizData([{ question: `O que melhor descreve ${currentLesson?.title}?`, options: ['Conceito', 'Ferramenta', 'Processo', 'Nada'], correctAnswerIndex: 0 }]); setIsQuizOpen(true); };

    return (
        <div className="space-y-6">
            <button onClick={() => { setSelectedTraining(null); setSelectedLessonId(null); setAiSummary(null); setAiExplanation(null); setQuizData(null); setIsQuizOpen(false); }} className="text-gold-500 font-semibold">&larr; Voltar para todos os treinamentos</button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden border border-dark-800">
                        {currentLesson && <iframe key={String(currentLesson.id)} width="100%" height="100%" src={getEmbedUrl(String(currentLesson.video_id || currentLesson.videoId || ''))} title={currentLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
                    </div>
                    {currentLesson && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center gap-4 flex-wrap">
                                <h3 className="text-2xl font-bold text-white">{currentLesson.title}</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleAiSummarize} disabled={isAiSummaryLoading} className="bg-dark-800 px-3 py-1.5 rounded-md text-sm text-gold-500 font-semibold">Resumir</button>
                                    <button onClick={handleAiExplain} disabled={isAiExplainLoading} className="bg-dark-800 px-3 py-1.5 rounded-md text-sm text-gold-500 font-semibold">Explicar</button>
                                </div>
                            </div>
                            {(isAiSummaryLoading || aiSummary) && (
                                <div className="p-4 bg-black/50 border border-dark-800 rounded-lg">
                                    <h4 className="font-bold text-gold-500 mb-2">Resumo</h4>
                                    {isAiSummaryLoading ? <p className="text-gray-400">Gerando resumo...</p> : <p className="text-sm text-gray-300 whitespace-pre-wrap">{aiSummary}</p>}
                                </div>
                            )}
                            {(isAiExplainLoading || aiExplanation) && (
                                <div className="p-4 bg-black/50 border border-dark-800 rounded-lg">
                                    <h4 className="font-bold text-gold-500 mb-2">Explicação</h4>
                                    {isAiExplainLoading ? <p className="text-gray-400">Gerando explicação...</p> : <p className="text-sm text-gray-300 whitespace-pre-wrap">{aiExplanation}</p>}
                                </div>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-dark-800">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" className="w-5 h-5 rounded bg-dark-800 border-dark-700 text-gold-500" checked={Boolean(currentLesson.completed)} onChange={async () => { const id = String(currentLesson.id); const updated = lessons.map((l: any) => String(l.id) === id ? { ...l, completed: !l.completed } : l); setSelectedTraining({ ...selectedTraining, lessons: updated }); try { const uid = localStorage.getItem('rs-user-id') || 'anonymous'; await communicationAPI.trainings.completeLesson(id, uid, String(selectedTraining.id)); } catch { } }} />
                                    <span className="text-sm text-gray-300">Marcar como concluída</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleGenerateQuiz} className="bg-dark-800 px-3 py-1.5 rounded-md text-sm text-gray-300">Gerar Quiz</button>
                                    <button onClick={() => { const url = `https://www.youtube.com/watch?v=${String(currentLesson.video_id || currentLesson.videoId || '')}`; if ((navigator as any).share) { (navigator as any).share({ title: currentLesson.title, url }); } else { navigator.clipboard.writeText(url); alert('Link copiado!'); } }} className="bg-dark-800 px-3 py-1.5 rounded-md text-sm text-gray-300">Compartilhar</button>
                                </div>
                            </div>
                            {isQuizOpen && quizData && (
                                <div className="p-4 bg-black/50 border border-dark-800 rounded-lg">
                                    <h4 className="font-bold text-gold-500 mb-2">Quiz</h4>
                                    {quizData.map((q, qi) => (
                                        <div key={qi} className="mb-3">
                                            <p className="text-white font-semibold mb-1">{q.question}</p>
                                            <ul className="text-sm text-gray-300 list-disc list-inside">
                                                {q.options.map((opt, oi) => (<li key={oi}>{opt}</li>))}
                                            </ul>
                                        </div>
                                    ))}
                                    <button onClick={() => setIsQuizOpen(false)} className="bg-gold-500 text-black px-3 py-1.5 rounded-md">Fechar</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1 bg-dark-900 border border-dark-800 rounded-xl p-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-white">{selectedTraining.title}</h3>
                        <span className="text-xs text-gray-400">{moduleProgress}%</span>
                    </div>
                    <div className="space-y-2">
                        {lessons.map((lesson: any, idx: number) => (
                            <div key={String(lesson.id)} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${String(selectedLessonId) === String(lesson.id) ? 'bg-gold-500/10' : 'hover:bg-white/5'}`} onClick={() => setSelectedLessonId(String(lesson.id))}>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400">{lesson.completed ? '✔' : '▶'}</span>
                                    <span className={`${String(selectedLessonId) === String(lesson.id) ? 'text-gold-500' : 'text-gray-200'}`}>Aula {idx + 1}: {lesson.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MaterialsTab: React.FC<{ catalogs: Catalog[]; downloads: DownloadMaterial[] }> = ({ catalogs, downloads }) => (
    <div className="space-y-8">
        {/* Catálogos */}
        <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <DocumentTextIcon className="w-6 h-6 text-gold-500" /> Catálogos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {catalogs.map(c => (
                    <div key={c.id} className="group relative bg-dark-900 border border-dark-800 rounded-lg overflow-hidden">
                        <div className="aspect-w-3 aspect-h-4 bg-dark-800 flex items-center justify-center">
                            {c.cover_image ? (
                                <img src={c.cover_image} alt={c.title} className="w-full h-full object-cover" />
                            ) : (
                                <DocumentTextIcon className="w-12 h-12 text-gray-600" />
                            )}
                        </div>
                        <div className="p-3">
                            <p className="font-semibold text-white truncate">{c.title}</p>
                        </div>
                        {c.pdf_url && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={async () => { if (c.id) { try { await communicationAPI.catalogs.incrementDownload(String(c.id)); } catch { } } if (c.pdf_url) { await forceDownload(c.pdf_url!, c.file_name || c.title); } }}
                                    className="flex items-center gap-2 text-sm bg-gold-500 text-black font-bold px-3 py-1.5 rounded-md hover:bg-gold-400"
                                >
                                    <DownloadIcon className="w-4 h-4" /> Baixar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {catalogs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <DocumentTextIcon className="w-12 h-12 mx-auto" />
                    <p className="mt-2">Nenhum catálogo disponível.</p>
                </div>
            )}
        </div>

        {/* Materiais para Download */}
        <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <DownloadIcon className="w-6 h-6 text-gold-500" /> Materiais para Download
            </h2>
            <div className="space-y-3">
                {downloads.map(d => (
                    <div key={d.id} className="group flex items-center justify-between p-3 bg-dark-900 border border-dark-800 rounded-lg hover:border-gold-500 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-dark-800 rounded-lg text-gold-500">
                                {getIcon(d.icon_type || 'document')}
                            </div>
                            <div>
                                <p className="font-semibold text-white">{d.title}</p>
                                {d.description && (
                                    <p className="text-sm text-gray-400">{d.description}</p>
                                )}
                            </div>
                        </div>
                        {d.file_url && (
                            <button
                                onClick={async () => { if (d.id) { try { await communicationAPI.downloadMaterials.incrementDownload(String(d.id)); } catch { } } await forceDownload(d.file_url!, d.file_name || d.title) }}
                                className="p-2 text-gray-300 hover:text-gold-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <DownloadIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {downloads.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <DownloadIcon className="w-12 h-12 mx-auto" />
                    <p className="mt-2">Nenhum material disponível.</p>
                </div>
            )}
        </div>
    </div>
);

// --- MAIN COMPONENT ---
const CommunicationCenter: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'announcements' | 'agenda' | 'training' | 'materials'>('announcements');
    const [loading, setLoading] = useState(true);

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
    const [trainings, setTrainings] = useState<any[]>([]);
    const [selectedTraining, setSelectedTraining] = useState<any | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [downloads, setDownloads] = useState<DownloadMaterial[]>([]);

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
            const [announcementsRes, agendaRes, trainingsRes, modulesRes, lessonsRes, catalogsRes, materialsRes] = await Promise.all([
                communicationAPI.announcements.getAll(),
                communicationAPI.agendaItems.getAll(),
                communicationAPI.trainings.getAll(),
                communicationAPI.trainings.getModules(),
                communicationAPI.trainings.getLessons(),
                communicationAPI.catalogs.getAll(),
                communicationAPI.downloadMaterials.getAll()
            ]);

            if (announcementsRes.success && announcementsRes.data) {
                setAnnouncements((announcementsRes.data as any[]).map(mapAnnouncement));
                console.log('[Comunicacao] Anuncios:', (announcementsRes.data as any[]).length);
            }
            if (agendaRes.success && agendaRes.data) {
                setAgendaItems((agendaRes.data as any[]).map(mapAgendaItem));
                console.log('[Comunicacao] Agenda:', (agendaRes.data as any[]).length);
            }
            if (trainingsRes.success && trainingsRes.data) {
                const base = (trainingsRes.data as any[]);
                const modules = modulesRes.success && Array.isArray(modulesRes.data) ? (modulesRes.data as any[]) : [];
                const lessons = lessonsRes.success && Array.isArray(lessonsRes.data) ? (lessonsRes.data as any[]) : [];
                const withLessons = base.map(t => {
                    const tModules = modules.filter(m => String(m.training_id) === String(t.id));
                    const tLessons = lessons.filter(ls => String(ls.training_id) === String(t.id));
                    return { ...t, modules: tModules, lessons: tLessons };
                });
                setTrainings(withLessons.map(mapTraining));
                console.log('[Comunicacao] Treinamentos:', withLessons.length, ' módulos:', modules.length, ' aulas:', lessons.length);
            }
            if (catalogsRes.success && catalogsRes.data) {
                setCatalogs((catalogsRes.data as any[]).map(mapCatalog));
                console.log('[Comunicacao] Catalogos:', (catalogsRes.data as any[]).length);
            }
            if (materialsRes.success && materialsRes.data) {
                setDownloads((materialsRes.data as any[]).map(mapDownload));
                console.log('[Comunicacao] Materiais:', (materialsRes.data as any[]).length);
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
                {activeTab === 'training' && <TrainingTab trainings={trainings} selectedTraining={selectedTraining} setSelectedTraining={setSelectedTraining} selectedLessonId={selectedLessonId} setSelectedLessonId={setSelectedLessonId} />}
                {activeTab === 'materials' && <MaterialsTab catalogs={catalogs} downloads={downloads} />}
            </div>
        </div>
    );
};

export default CommunicationCenter;
