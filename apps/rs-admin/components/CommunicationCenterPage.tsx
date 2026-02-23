import React, { useState, useEffect, useMemo, useRef } from 'react';
import communicationAPI from '../src/services/communicationAPI';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import {
    BellIcon,
    ChatBubbleLeftRightIcon,
    ChatBubbleBottomCenterTextIcon,
    PhotoIcon,
    PresentationChartLineIcon,
    PlusIcon,
    CatalogIcon,
    TrainingChartIcon,
    TrainingUsersIcon,
    TrainingDnaIcon,
    ArrowDownTrayIcon,
    CloseIcon,
    PencilIcon,
    TrashIcon,
    SparklesIcon,
    UserPlusIcon,
    CakeIcon,
    StarIcon,
    CalendarDaysIcon,
    SpinnerIcon,
    RobotIcon,
    BookOpenIcon,
    ChevronRightIcon,
    ArrowLeftIcon,
    ArrowUpTrayIcon,
    LinkIcon,
    DocumentTextIcon
} from './icons';
import TrainingCenter from './training/TrainingCenter';

// --- TYPES ---
interface Announcement {
    id: number;
    type: 'alert' | 'info' | 'promo';
    title: string;
    content: string;
    date: string;
    new: boolean;
}

type AgendaCategory = 'Boas-vindas' | 'Aniversariantes' | 'PINs' | 'Datas Comemorativas';
interface AgendaItem {
    id: number;
    category: AgendaCategory;
    title: string;
    content: string;
    isDeletable?: boolean;
}

interface CommunicationCenterPageProps {
    credits: number;
    setCredits: React.Dispatch<React.SetStateAction<number>>;
}

interface Catalog {
    id: string;
    title: string;
    coverImage: string | null;
    pdfSource: string | null;
    sourceType: 'file' | 'url' | 'none';
    fileName?: string;
}

interface DownloadMaterial {
    id: string;
    title: string;
    description: string;
    iconType: 'photo' | 'document' | 'presentation';
    fileUrl: string | null;
    sourceType: 'file' | 'url' | 'none';
    fileName?: string;
}


// Cleared mock data
const initialAnnouncements: Announcement[] = [];
const initialAgendaItems: AgendaItem[] = [];
const initialCatalogs: Catalog[] = [];
const initialDownloads: DownloadMaterial[] = [];


// --- UTILITY FUNCTIONS ---
const getIcon = (type: string, props: any) => {
    switch (type) {
        case 'alert': return <BellIcon {...props} />;
        case 'info': return <ChatBubbleLeftRightIcon {...props} />;
        case 'promo': return <ChatBubbleBottomCenterTextIcon {...props} />;
        case 'photo': return <PhotoIcon {...props} />;
        case 'presentation': return <PresentationChartLineIcon {...props} />;
        case 'catalog': return <CatalogIcon {...props} />;
        case 'document': return <DocumentTextIcon {...props} />;
        case 'Boas-vindas': return <UserPlusIcon {...props} />;
        case 'Aniversariantes': return <CakeIcon {...props} />;
        case 'PINs': return <StarIcon {...props} />;
        case 'Datas Comemorativas': return <CalendarDaysIcon {...props} />;
        default: return null;
    }
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
        alert('Ocorreu um erro ao baixar o arquivo. Tentando abrir em uma nova aba.');
        window.open(url, '_blank');
    }
};


// --- SUB-COMPONENTS for TABS ---

const AiModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: any) => void;
    item: Announcement | AgendaItem | null;
    modalType: 'announcement' | 'agenda';
}> = ({ isOpen, onClose, onSave, item, modalType }) => {
    const [formData, setFormData] = useState<any>({});
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else { // Creating new
            if (modalType === 'agenda') {
                setFormData({ title: '', content: '', category: 'Boas-vindas', isDeletable: true });
            } else { // announcement
                setFormData({ title: '', content: '', type: 'info', new: true });
            }
        }
    }, [item, isOpen, modalType]);


    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = () => { onSave({ ...formData, id: item?.id }); };

    const handleGenerateWithAi = async () => {
        if (!formData.title) {
            alert("Por favor, insira um título para a IA gerar o conteúdo.");
            return;
        }
        setIsAiLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Escreva uma mensagem de "${formData.title}" para consultores de uma empresa de marketing de rede chamada RS Prólipsi. O tom deve ser inspirador, profissional e conciso. A mensagem deve ter no máximo 3 frases.`;
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setFormData(prev => ({ ...prev, content: response.text }));
        } catch (error) {
            console.error("AI generation failed:", error);
            alert("Ocorreu um erro ao gerar o conteúdo com a IA. Tente novamente.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const baseInputClasses = "bg-[#2A2A2A] border border-[#2A2A2A] text-[#E5E7EB] rounded-lg p-2.5 focus:ring-[#FFD700] focus:border-[#FFD700] w-full disabled:opacity-50";

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                    <h2 className="text-xl font-bold text-white">{item ? `Editar ${modalType === 'agenda' ? 'Item' : 'Comunicado'}` : `Novo ${modalType === 'agenda' ? 'Item' : 'Comunicado'}`}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                </header>
                <main className="p-6 space-y-4 overflow-y-auto">
                    {modalType === 'agenda' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
                            <select name="category" value={formData.category ?? 'Boas-vindas'} onChange={handleChange} className={baseInputClasses}>
                                <option value="Boas-vindas">Boas-vindas</option>
                                <option value="Aniversariantes">Aniversariantes</option>
                                <option value="PINs">PINs</option>
                                <option value="Datas Comemorativas">Datas Comemorativas</option>
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                        <div className="flex gap-2">
                            <input type="text" name="title" value={formData.title ?? ''} onChange={handleChange} className={baseInputClasses} />
                            <button onClick={handleGenerateWithAi} disabled={isAiLoading} className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#FFD700] text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:bg-yellow-500/50 transition-colors text-sm w-44">
                                {isAiLoading ? <><SpinnerIcon className="w-5 h-5 animate-spin" /> Gerando...</> : <><SparklesIcon className="w-5 h-5" /> Gerar com IA</>}
                            </button>
                        </div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Conteúdo</label><textarea name="content" value={formData.content ?? ''} onChange={handleChange} rows={6} className={baseInputClasses} disabled={isAiLoading}></textarea></div>
                    {modalType === 'announcement' && <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Comunicado</label><select name="type" value={formData.type ?? 'info'} onChange={handleChange} className={baseInputClasses}><option value="info">Informativo</option><option value="alert">Alerta</option><option value="promo">Promoção</option></select></div>
                        <div className="flex items-center gap-3 pt-6"><input type="checkbox" id="isNew" name="new" checked={!!formData.new} onChange={handleChange} className="w-5 h-5 accent-[#FFD700] bg-gray-700 border-gray-600 rounded" /><label htmlFor="isNew" className="text-sm font-medium text-gray-300">Marcar como "Novo"</label></div>
                    </div>}
                </main>
                <footer className="p-4 bg-black/50 border-t border-[#2A2A2A] flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-black bg-[#FFD700] rounded-lg hover:bg-yellow-600">Salvar</button>
                </footer>
            </div>
        </div>
    );
};

const AnnouncementsTab: React.FC<{
    announcements: Announcement[]; onEdit: (announcement: Announcement) => void;
    onDelete: (id: number) => void; onCreate: () => void;
}> = ({ announcements, onEdit, onDelete, onCreate }) => (
    <div>
        <div className="flex justify-end mb-4">
            <button onClick={onCreate} className="flex items-center justify-center gap-2 bg-[#FFD700] text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                <PlusIcon className="w-5 h-5" /> Criar Comunicado
            </button>
        </div>
        <div className="space-y-4">
            {announcements.length > 0 ? announcements.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-[#1E1E1E] rounded-lg border border-[#2A2A2A]">
                    <div className="p-3 rounded-full bg-[#2A2A2A] text-[#FFD700] flex-shrink-0">{getIcon(item.type, { className: 'w-6 h-6' })}</div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-[#E5E7EB]">{item.title}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                {item.new && <span className="px-3 py-1 text-xs font-bold text-black bg-[#FFD700] rounded-full">Novo</span>}
                                <button onClick={() => onEdit(item)} className="p-1.5 text-gray-400 hover:text-yellow-400"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <p className="text-sm text-[#9CA3AF] mt-1">{item.content}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                    </div>
                </div>
            )) : (
                <div className="text-center py-16 text-gray-500">
                    <BellIcon className="w-12 h-12 mx-auto" />
                    <p className="mt-2">Nenhum comunicado publicado.</p>
                </div>
            )}
        </div>
    </div>
);

const AgendaComemorativaTab: React.FC<{
    items: AgendaItem[]; onEdit: (item: AgendaItem) => void; onCreate: () => void; onDelete: (id: number) => void;
}> = ({ items, onEdit, onCreate, onDelete }) => {
    const groupedItems = useMemo(() => {
        return items.reduce((acc: Record<AgendaCategory, AgendaItem[]>, item) => {
            (acc[item.category] = acc[item.category] || []).push(item);
            return acc;
        }, {} as Record<AgendaCategory, AgendaItem[]>);
    }, [items]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-400">Gerencie as mensagens automáticas para datas e conquistas especiais.</p>
                <button onClick={onCreate} className="flex items-center justify-center gap-2 bg-[#FFD700] text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                    <PlusIcon className="w-5 h-5" /> Adicionar Item Comemorativo
                </button>
            </div>
            {items.length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(groupedItems).map(([category, categoryItems]) => {
                        return (
                            <div key={category}>
                                <h2 className="text-xl font-bold text-[#E5E7EB] mb-3 flex items-center gap-2">
                                    {getIcon(category, { className: "w-6 h-6 text-yellow-500" })} {category}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(categoryItems as AgendaItem[]).map(item => (
                                        <div key={item.id} className="group relative flex flex-col justify-between p-4 bg-[#1E1E1E] rounded-lg border border-[#2A2A2A]">
                                            <div>
                                                <h3 className="font-bold text-white">{item.title}</h3>
                                                <p className="text-sm text-gray-400 mt-1">{item.content}</p>
                                            </div>
                                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => onEdit(item)} className="p-1.5 bg-black/30 rounded-full text-gray-400 hover:text-yellow-400"><PencilIcon className="w-4 h-4" /></button>
                                                {item.isDeletable && <button onClick={() => onDelete(item.id)} className="p-1.5 bg-black/30 rounded-full text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <CalendarDaysIcon className="w-12 h-12 mx-auto" />
                    <p className="mt-2">Nenhum item na agenda comemorativa.</p>
                </div>
            )}
        </div>
    );
};

const MaterialsTab: React.FC<{
    catalogs: Catalog[];
    downloads: DownloadMaterial[];
    onEdit: (type: 'catalog' | 'download', item: any) => void;
    onDelete: (type: 'catalog' | 'download', id: string) => void;
    onCreate: (type: 'catalog' | 'download') => void;
}> = ({ catalogs, downloads, onEdit, onDelete, onCreate }) => (
    <div className="space-y-8">
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><CatalogIcon className="w-6 h-6 text-yellow-500" /> Catálogos</h2>
                <button onClick={() => onCreate('catalog')} className="flex items-center gap-2 bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 text-sm"><PlusIcon className="w-5 h-5" /> Novo Catálogo</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {catalogs.map(c => (
                    <div key={c.id} className="group relative bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg overflow-hidden">
                        <div className="aspect-w-3 aspect-h-4 bg-gray-800 flex items-center justify-center">{c.coverImage ? <img src={c.coverImage} alt={c.title} className="w-full h-full object-cover" /> : <CatalogIcon className="w-12 h-12 text-gray-600" />}</div>
                        <div className="p-3"><p className="font-semibold text-white truncate">{c.title}</p></div>
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {c.pdfSource && <button onClick={() => forceDownload(c.pdfSource!, c.fileName || c.title)} className="flex items-center gap-2 text-sm bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-md"><ArrowDownTrayIcon className="w-4 h-4" /> Baixar</button>}
                            <div className="flex gap-2">
                                <button onClick={() => onEdit('catalog', c)} className="p-1.5 text-gray-300 hover:text-yellow-400"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => onDelete('catalog', c.id)} className="p-1.5 text-gray-300 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><ArrowDownTrayIcon className="w-6 h-6 text-yellow-500" /> Materiais para Download</h2>
                <button onClick={() => onCreate('download')} className="flex items-center gap-2 bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 text-sm"><PlusIcon className="w-5 h-5" /> Novo Material</button>
            </div>
            <div className="space-y-3">
                {downloads.map(d => (
                    <div key={d.id} className="group flex items-center justify-between p-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#2A2A2A] rounded-lg text-yellow-500">{getIcon(d.iconType, { className: "w-6 h-6" })}</div>
                            <div>
                                <p className="font-semibold text-white">{d.title}</p>
                                <p className="text-sm text-gray-400">{d.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.fileUrl && <button onClick={() => forceDownload(d.fileUrl!, d.fileName || d.title)} className="p-2 text-gray-300 hover:text-yellow-400"><ArrowDownTrayIcon className="w-5 h-5" /></button>}
                            <button onClick={() => onEdit('download', d)} className="p-2 text-gray-300 hover:text-yellow-400"><PencilIcon className="w-5 h-5" /></button>
                            <button onClick={() => onDelete('download', d.id)} className="p-2 text-gray-300 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const MaterialEditModal: React.FC<{
    isOpen: boolean; onClose: () => void;
    material: Catalog | DownloadMaterial | null;
    type: 'catalog' | 'download';
    onSave: (material: any) => void;
}> = ({ isOpen, onClose, material, type, onSave }) => {
    const [formData, setFormData] = useState<any>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (material) {
            setFormData(material);
        } else {
            setFormData({ title: '', sourceType: 'none', fileUrl: null, pdfSource: null, coverImage: null });
        }
    }, [material, isOpen]);

    if (!isOpen) return null;

    const isCatalog = type === 'catalog';
    const sourceProp = isCatalog ? 'pdfSource' : 'fileUrl';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'pdfSource' | 'fileUrl') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, [field]: event.target?.result as string, fileName: file.name }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => { onSave({ ...formData, id: material?.id }); };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl shadow-xl w-full max-w-lg">
                <header className="flex items-center justify-between p-4 border-b border-[#2A2A2A]"><h2 className="text-xl font-bold text-white">{material ? 'Editar' : 'Novo'} {isCatalog ? 'Catálogo' : 'Material'}</h2><button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button></header>
                <main className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Título</label><input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="bg-[#2A2A2A] w-full p-2 rounded-lg" /></div>
                    {!isCatalog && <div><label className="block text-sm font-medium text-gray-300 mb-1">Descrição</label><input type="text" name="description" value={formData.description || ''} onChange={handleChange} className="bg-[#2A2A2A] w-full p-2 rounded-lg" /></div>}
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Fonte</label><select name="sourceType" value={formData.sourceType || 'none'} onChange={handleChange} className="bg-[#2A2A2A] w-full p-2 rounded-lg"><option value="none">Nenhum</option><option value="file">Arquivo (Upload)</option><option value="url">URL Externa</option></select></div>
                    {formData.sourceType === 'file' && <div><label className="block text-sm font-medium text-gray-300 mb-1">Arquivo {isCatalog ? 'PDF' : ''}</label><button onClick={() => fileInputRef.current?.click()} className="w-full text-sm bg-gray-700 p-2 rounded-lg hover:bg-gray-600">{formData.fileName || 'Selecionar arquivo...'}</button><input ref={fileInputRef} type="file" onChange={(e) => handleFileChange(e, sourceProp)} className="hidden" accept={isCatalog ? '.pdf' : undefined} /></div>}
                    {formData.sourceType === 'url' && <div><label className="block text-sm font-medium text-gray-300 mb-1">URL do Arquivo</label><input type="url" name={sourceProp} value={formData[sourceProp] || ''} onChange={handleChange} className="bg-[#2A2A2A] w-full p-2 rounded-lg" /></div>}
                    {isCatalog && <div><label className="block text-sm font-medium text-gray-300 mb-1">Imagem de Capa</label>{formData.coverImage && <img src={formData.coverImage} className="w-24 h-32 object-cover rounded-md mb-2" />}<button onClick={() => coverInputRef.current?.click()} className="w-full text-sm bg-gray-700 p-2 rounded-lg hover:bg-gray-600">Selecionar imagem...</button><input ref={coverInputRef} type="file" onChange={(e) => handleFileChange(e, 'coverImage')} className="hidden" accept="image/*" /></div>}
                    {!isCatalog && <div><label className="block text-sm font-medium text-gray-300 mb-1">Ícone</label><select name="iconType" value={formData.iconType || 'document'} onChange={handleChange} className="bg-[#2A2A2A] w-full p-2 rounded-lg"><option value="document">Documento</option><option value="photo">Imagem</option><option value="presentation">Apresentação</option></select></div>}
                </main>
                <footer className="p-4 bg-black/50 border-t border-[#2A2A2A] flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-sm bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button><button onClick={handleSave} className="px-4 py-2 text-sm bg-[#FFD700] text-black font-bold rounded-lg hover:bg-yellow-600">Salvar</button></footer>
            </div>
        </div>
    );
};


const CommunicationCenterPage: React.FC<CommunicationCenterPageProps> = ({ credits, setCredits }) => {
    const [activeTab, setActiveTab] = useState('announcements');
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [agendaItems, setAgendaItems] = useState(initialAgendaItems);
    const [catalogs, setCatalogs] = useState(initialCatalogs);
    const [downloads, setDownloads] = useState(initialDownloads);

    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Announcement | AgendaItem | null>(null);
    const [aiModalType, setAiModalType] = useState<'announcement' | 'agenda'>('announcement');

    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Catalog | DownloadMaterial | null>(null);
    const [materialType, setMaterialType] = useState<'catalog' | 'download'>('catalog');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const normalizeError = (err: any): string => {
        if (!err) return 'Erro desconhecido';
        if (typeof err === 'string') return err;
        if (typeof err.message === 'string') return err.message;
        try { return JSON.stringify(err); } catch { return String(err); }
    };
    const formatError = (err: any): string => {
        if (!err) return 'Erro desconhecido';
        if (typeof err === 'string') return err;
        if (Array.isArray(err)) {
            const labelMap: Record<string, string> = {
                title: 'Título',
                message: 'Conteúdo',
                content: 'Conteúdo'
            };
            const msgs = err
                .map((e: any) => {
                    const path = Array.isArray(e?.path) && e.path.length ? String(e.path[0]) : '';
                    const label = labelMap[path] || path || 'Campo';
                    const msg = typeof e?.message === 'string' ? e.message : normalizeError(e);
                    return `${label}: ${msg}`;
                })
                .filter(Boolean);
            return msgs.join('; ');
        }
        if (typeof err.message === 'string') return err.message;
        return normalizeError(err);
    };
    const [success, setSuccess] = useState('');

    // Carregar dados do Supabase ao inicializar
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([
            loadAnnouncements(),
            loadAgenda(),
            loadCatalogs(),
            loadMaterials()
        ]);
        setLoading(false);
    };


    const loadAnnouncements = async () => {
        const res = await communicationAPI.announcements.getAll();
        if (res.success && res.data) {
            const formatted = res.data.map((item: any) => ({
                id: item.id,
                type: item.type || 'info',
                title: String(item.title || ''),
                content: String(item.content || item.message || ''),
                date: item.created_at || new Date().toISOString(),
                new: Boolean(item.is_new)
            }));
            setAnnouncements(formatted);
        } else {
            console.error("Failed to load announcements:", res.error);
            setError(formatError(res.error));
        }
    };

    const loadAgenda = async () => {
        const res = await communicationAPI.agenda.getAll();
        if (res.success && res.data) {
            const formatted = res.data.map((item: any) => ({
                id: item.id,
                category: item.category || 'Boas-vindas',
                title: String(item.title || ''),
                content: String(item.content || ''),
                isDeletable: Boolean(item.is_deletable)
            }));
            setAgendaItems(formatted);
        } else {
            console.error("Failed to load agenda:", res.error);
            setError(formatError(res.error));
        }
    };

    const loadCatalogs = async () => {
        const res = await communicationAPI.catalogs.getAll();
        if (res.success && res.data) {
            const formatted = res.data.map((item: any) => ({
                id: item.id,
                title: String(item.title || ''),
                coverImage: item.cover_image || null,
                pdfSource: item.pdf_url || null,
                sourceType: item.source_type || 'none',
                fileName: item.file_name || ''
            }));
            setCatalogs(formatted);
        } else {
            console.error("Failed to load catalogs:", res.error);
            setError(formatError(res.error));
        }
    };

    const loadMaterials = async () => {
        const res = await communicationAPI.materials.getAll();
        if (res.success && res.data) {
            const formatted = res.data.map((item: any) => ({
                id: item.id,
                title: String(item.title || ''),
                description: String(item.description || ''),
                iconType: item.icon_type || 'document',
                fileUrl: item.file_url || null,
                sourceType: item.source_type || 'none',
                fileName: item.file_name || ''
            }));
            setDownloads(formatted);
        } else {
            console.error("Failed to load materials:", res.error);
            setError(formatError(res.error));
        }
    };


    // Handlers for Announcements & Agenda
    const handleEditItem = (type: 'announcement' | 'agenda', item: Announcement | AgendaItem) => {
        setAiModalType(type);
        setEditingItem(item);
        setIsAiModalOpen(true);
    };
    const handleCreateItem = (type: 'announcement' | 'agenda') => {
        setAiModalType(type);
        setEditingItem(null);
        setIsAiModalOpen(true);
    };
    const handleDeleteItem = async (type: 'announcement' | 'agenda', id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este item?")) return;
        setLoading(true);
        setError('');

        if (type === 'announcement') {
            const res = await communicationAPI.announcements.delete(String(id));
            if (res.success) {
                setAnnouncements(prev => prev.filter(item => item.id !== id));
                setSuccess('Comunicado excluído com sucesso!');
            } else {
                setError(formatError(res.error) || 'Erro ao excluir');
            }
        } else {
            const res = await communicationAPI.agenda.delete(String(id));
            if (res.success) {
                setAgendaItems(prev => prev.filter(item => item.id !== id));
                setSuccess('Item da agenda excluído com sucesso!');
            } else {
                setError(formatError(res.error) || 'Erro ao excluir');
            }
        }
        setLoading(false);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleSaveItem = async (item: any) => {
        setLoading(true);
        setError('');

        if (aiModalType === 'announcement') {
            const t = String(item.title || '').trim();
            const c = String(item.content || '').trim();
            if (t.length < 3 || c.length < 3) {
                setError('Título e conteúdo devem ter pelo menos 3 caracteres');
                setLoading(false);
                return;
            }
            const payload = {
                title: String(item.title || ''),
                message: String(item.content || ''),
                type: item.type || 'info',
                is_new: Boolean(item.new),
                is_published: true,
                audience: ['consultor', 'marketplace']
            };

            const res = item.id
                ? await communicationAPI.announcements.update(String(item.id), payload)
                : await communicationAPI.announcements.create(payload);

            if (res.success) {
                await loadAnnouncements();
                setSuccess('Comunicado salvo com sucesso!');
            } else {
                setError(formatError(res.error) || 'Erro ao salvar comunicado');
            }
        } else {
            const t = String(item.title || '').trim();
            const c = String(item.content || '').trim();
            if (t.length < 3 || c.length < 3) {
                setError('Título e conteúdo devem ter pelo menos 3 caracteres');
                setLoading(false);
                return;
            }
            const payload = {
                category: item.category,
                title: item.title,
                content: item.content,
                is_deletable: item.isDeletable !== false,
                active: true
            };

            const res = item.id
                ? await communicationAPI.agenda.update(String(item.id), payload)
                : await communicationAPI.agenda.create(payload);

            if (res.success) {
                await loadAgenda();
                setSuccess('Item da agenda salvo com sucesso!');
            } else {
                setError(formatError(res.error) || 'Erro ao salvar item da agenda');
            }
        }

        setIsAiModalOpen(false);
        setLoading(false);
        setTimeout(() => setSuccess(''), 3000);
    };

    // Handlers for Materials
    const handleEditMaterial = (type: 'catalog' | 'download', material: Catalog | DownloadMaterial) => {
        setMaterialType(type);
        setEditingMaterial(material);
        setIsMaterialModalOpen(true);
    };
    const handleCreateMaterial = (type: 'catalog' | 'download') => {
        setMaterialType(type);
        setEditingMaterial(null);
        setIsMaterialModalOpen(true);
    };
    const handleDeleteMaterial = async (type: 'catalog' | 'download', id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir este material?")) return;
        setLoading(true);
        setError('');

        if (type === 'catalog') {
            const res = await communicationAPI.catalogs.delete(id);
            if (res.success) {
                setCatalogs(prev => prev.filter(c => c.id !== id));
                setSuccess('Catálogo excluído com sucesso!');
            } else {
                setError(formatError(res.error) || 'Erro ao excluir');
            }
        } else {
            const res = await communicationAPI.materials.delete(id);
            if (res.success) {
                setDownloads(prev => prev.filter(d => d.id !== id));
                setSuccess('Material excluído com sucesso!');
            } else {
                setError(formatError(res.error) || 'Erro ao excluir');
            }
        }
        setLoading(false);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleSaveMaterial = async (material: any) => {
        setLoading(true);
        setError('');

        if (materialType === 'catalog') {
            const payload = {
                title: material.title,
                cover_image: material.coverImage,
                pdf_url: material.pdfSource,
                source_type: material.sourceType || 'none',
                file_name: material.fileName,
                is_published: true
            };

            const res = material.id
                ? await communicationAPI.catalogs.update(material.id, payload)
                : await communicationAPI.catalogs.create(payload);

            if (res.success) {
                await loadCatalogs();
                setSuccess('Catálogo salvo com sucesso!');
            } else {
                setError(formatError(res.error) || 'Erro ao salvar catálogo');
            }
        } else {
            const payload = {
                title: material.title,
                description: material.description,
                icon_type: material.iconType,
                file_url: material.fileUrl,
                source_type: material.sourceType || 'none',
                file_name: material.fileName,
                is_published: true
            };

            const res = material.id
                ? await communicationAPI.materials.update(material.id, payload)
                : await communicationAPI.materials.create(payload);

            if (res.success) {
                await loadMaterials();
                setSuccess('Material salvo com sucesso!');
            } else {
                setError(formatError(res.error) || 'Erro ao salvar material');
            }
        }

        setIsMaterialModalOpen(false);
        setLoading(false);
        setTimeout(() => setSuccess(''), 3000);
    };

    const TabButton: React.FC<{ tabId: string, label: string, icon: React.ReactNode }> = ({ tabId, label, icon }) => (
        <button onClick={() => setActiveTab(tabId)} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors rounded-t-lg border-b-2 whitespace-nowrap ${activeTab === tabId ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-400 hover:text-white'}`}>
            {icon} {label}
        </button>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-yellow-500 mb-6">Central de Comunicação e Conteúdo (DEBUG)</h1>

            {/* Mensagens de Feedback */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-4 flex items-center gap-2">
                    <span>❌</span>
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="bg-green-500/20 border border-green-500 text-green-300 p-4 rounded-lg mb-4 flex items-center gap-2">
                    <span>✅</span>
                    <span>{success}</span>
                </div>
            )}

            <div className="border-b border-gray-800 mb-6">
                <nav className="-mb-px flex space-x-2 overflow-x-auto">
                    <TabButton tabId="announcements" label="Mural de Comunicados" icon={<BellIcon className="w-5 h-5" />} />
                    <TabButton tabId="agenda" label="Agenda Comemorativa" icon={<CalendarDaysIcon className="w-5 h-5" />} />
                    <TabButton tabId="training" label="Central de Treinamentos" icon={<BookOpenIcon className="w-5 h-5" />} />
                    <TabButton tabId="materials" label="Materiais de Apoio" icon={<ArrowDownTrayIcon className="w-5 h-5" />} />
                </nav>
            </div>

            <div className="animate-fade-in">
                {activeTab === 'announcements' && <AnnouncementsTab announcements={announcements} onEdit={(item) => handleEditItem('announcement', item)} onDelete={(id) => handleDeleteItem('announcement', id)} onCreate={() => handleCreateItem('announcement')} />}
                {activeTab === 'agenda' && <AgendaComemorativaTab items={agendaItems} onEdit={(item) => handleEditItem('agenda', item)} onDelete={(id) => handleDeleteItem('agenda', id)} onCreate={() => handleCreateItem('agenda')} />}
                {activeTab === 'training' && <TrainingCenter credits={credits} setCredits={setCredits} />}
                {activeTab === 'materials' && <MaterialsTab catalogs={catalogs} downloads={downloads} onEdit={handleEditMaterial} onDelete={handleDeleteMaterial} onCreate={handleCreateMaterial} />}
            </div>

            {isAiModalOpen && <AiModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} item={editingItem} modalType={aiModalType} onSave={handleSaveItem} />}
            {isMaterialModalOpen && <MaterialEditModal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} material={editingMaterial} type={materialType} onSave={handleSaveMaterial} />}
        </div>
    );
};

export default CommunicationCenterPage;
