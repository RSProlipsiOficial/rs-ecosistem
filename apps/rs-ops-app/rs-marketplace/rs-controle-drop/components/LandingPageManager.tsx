import React, { useState, useMemo } from 'react';
import { LandingPage, Product, LandingPageBlock, LandingPageBlockType } from '../types';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Video, HelpCircle, Star, Shield, List, ArrowUp, ArrowDown, Settings, Eye } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';

interface LandingPageManagerProps {
    landingPages: LandingPage[];
    products: Product[];
    onUpdatePages: (pages: LandingPage[]) => void;
}

const EMPTY_LP: Omit<LandingPage, 'id' | 'userId' | 'createdAt'> = {
    name: '',
    slug: '',
    mainProductId: '',
    headline: '',
    blocks: [],
    isActive: true,
};

const BLOCKS_PALETTE: { type: LandingPageBlockType; name: string; icon: React.ReactNode }[] = [
    { type: 'hero', name: 'Hero (Título)', icon: <ImageIcon size={18}/> },
    { type: 'video', name: 'Vídeo', icon: <Video size={18}/> },
    { type: 'testimonials', name: 'Depoimentos', icon: <Star size={18}/> },
    { type: 'faq', name: 'FAQ (Perguntas)', icon: <HelpCircle size={18}/> },
];

export const LandingPageManager: React.FC<LandingPageManagerProps> = ({ landingPages, products, onUpdatePages }) => {
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<LandingPage | Omit<LandingPage, 'id' | 'userId' | 'createdAt'> | null>(null);

    const table = useDataTable({ initialData: landingPages, searchKeys: ['name', 'slug'] });

    const handleOpenEditor = (lp?: LandingPage) => {
        if (lp) {
            setEditingPage({ ...lp, blocks: lp.blocks || [] });
        } else {
            setEditingPage(EMPTY_LP);
        }
        setEditorOpen(true);
    };
    
    const handleSave = (pageData: any) => {
        if ('id' in pageData) {
            onUpdatePages(landingPages.map(lp => lp.id === pageData.id ? pageData : lp));
        } else {
            onUpdatePages([...landingPages, { ...pageData, id: crypto.randomUUID(), userId: 'current_user', createdAt: new Date().toISOString() }]);
        }
        setEditorOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que quer excluir esta Landing Page?')) {
            onUpdatePages(landingPages.filter(lp => lp.id !== id));
        }
    };

    const columns: Column<LandingPage>[] = [
        { header: 'Nome da Página', accessor: 'name', sortable: true, render: lp => <span className="font-bold text-slate-200">{lp.name}</span>},
        { header: 'Slug (URL)', accessor: 'slug', render: lp => <span className="font-mono text-xs text-rs-gold">/{lp.slug}</span>},
        { header: 'Produto Principal', accessor: 'mainProductId', render: lp => products.find(p => p.id === lp.mainProductId)?.name || 'N/A' },
        { header: 'Status', accessor: 'isActive', render: lp => lp.isActive ? <span className="text-emerald-400">Ativa</span> : <span className="text-slate-500">Inativa</span>},
        { header: 'Ações', accessor: 'actions', render: lp => (
            <div className="flex gap-2">
                <a href={`/lp-preview/${lp.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:text-rs-gold"><Eye size={16}/></a>
                <button onClick={() => handleOpenEditor(lp)} className="p-2 hover:text-blue-400"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(lp.id)} className="p-2 hover:text-red-400"><Trash2 size={16}/></button>
            </div>
        )}
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><ImageIcon/> Landing Pages</h2>
                    <p className="text-sm text-slate-400">Crie e gerencie suas páginas de venda.</p>
                </div>
                <button onClick={() => handleOpenEditor()} className="btn-primary flex items-center gap-2"><Plus size={18}/> Nova Página</button>
            </div>

            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} />

            {isEditorOpen && editingPage && (
                <LPEditor
                    page={editingPage}
                    products={products}
                    onClose={() => setEditorOpen(false)}
                    onSave={handleSave}
                />
            )}
             <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
        </div>
    );
};

// --- LP EDITOR COMPONENT ---

interface LPEditorProps {
    page: LandingPage | Omit<LandingPage, 'id' | 'userId' | 'createdAt'>;
    products: Product[];
    onClose: () => void;
    onSave: (page: any) => void;
}

const LPEditor: React.FC<LPEditorProps> = ({ page, products, onClose, onSave }) => {
    const [pageData, setPageData] = useState({ name: page.name, slug: page.slug, mainProductId: page.mainProductId, isActive: page.isActive, headline: page.headline });
    const [blocks, setBlocks] = useState<LandingPageBlock[]>(('blocks' in page && page.blocks) ? page.blocks : []);
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

    const addBlock = (type: LandingPageBlockType) => {
        let newBlock: LandingPageBlock = { id: crypto.randomUUID(), type, content: {} };
        if (type === 'hero') newBlock.content = { title: 'Título Incrível', subtitle: 'Subtítulo que converte em segundos.', buttonText: 'Comprar Agora' };
        if (type === 'video') newBlock.content = { videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' };
        if (type === 'faq') newBlock.content = { items: [{ q: 'Pergunta 1?', a: 'Resposta para a pergunta 1.'}] };
        if (type === 'testimonials') newBlock.content = { items: [{ name: 'Cliente Satisfeito', text: '"Este produto mudou minha vida!"' }]};
        setBlocks(prev => [...prev, newBlock]);
    };

    const removeBlock = (id: string) => {
        if (activeBlockId === id) setActiveBlockId(null);
        setBlocks(prev => prev.filter(b => b.id !== id));
    };

    const updateBlock = (id: string, newContent: any) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: newContent } : b));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]; // Swap
        setBlocks(newBlocks);
    };

    const handleSaveClick = () => {
        const fullPageData = { ...page, ...pageData, blocks };
        onSave(fullPageData);
    };

    const activeBlock = useMemo(() => blocks.find(b => b.id === activeBlockId), [blocks, activeBlockId]);

    return (
        <ModalWrapper isOpen={true} onClose={onClose} title="Editor de Landing Page" size="5xl">
            <div className="flex h-full overflow-hidden max-h-[calc(95vh-60px)]">
                {/* Left Panel: Settings & Blocks */}
                <div className="w-96 bg-rs-dark border-r border-white/10 p-4 flex flex-col gap-6 overflow-y-auto">
                    <div>
                        <h3 className="panel-header"><Settings size={16}/> Configurações Gerais</h3>
                        <div className="space-y-3">
                            <div><label className="label-text">Nome da Página</label><input type="text" value={pageData.name} onChange={e => setPageData({...pageData, name: e.target.value})} className="input-field-sm" /></div>
                            <div><label className="label-text">URL (Slug)</label><input type="text" value={pageData.slug} onChange={e => setPageData({...pageData, slug: e.target.value})} className="input-field-sm" /></div>
                            <div><label className="label-text">Produto Principal</label>
                                <select value={pageData.mainProductId} onChange={e => setPageData({...pageData, mainProductId: e.target.value})} className="input-field-sm">
                                    <option value="">Nenhum</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {activeBlock ? (
                        <BlockEditor key={activeBlock.id} block={activeBlock} onUpdate={updateBlock} />
                    ) : (
                        <div>
                            <h3 className="panel-header"><Plus size={16}/> Adicionar Blocos</h3>
                            <div className="space-y-2">
                                {BLOCKS_PALETTE.map(b => (
                                <button key={b.type} onClick={() => addBlock(b.type)} className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                                    {b.icon} {b.name}
                                </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-auto flex gap-2 pt-4 border-t border-white/10">
                        <button onClick={onClose} className="flex-1 btn-secondary">Cancelar</button>
                        <button onClick={handleSaveClick} className="flex-1 btn-primary">Salvar</button>
                    </div>
                </div>

                {/* Right Panel: Canvas */}
                <div className="flex-1 bg-black/40 p-6 overflow-y-auto custom-scrollbar">
                     <div className="max-w-3xl mx-auto space-y-2">
                        {blocks.length === 0 && <div className="text-center text-slate-500 p-10 border-2 border-dashed border-slate-700 rounded-lg">Adicione blocos no painel à esquerda.</div>}
                        {blocks.map((block, index) => (
                            <BlockWrapper 
                                key={block.id} 
                                isActive={block.id === activeBlockId} 
                                onClick={() => setActiveBlockId(block.id)}
                                onMove={(dir) => moveBlock(index, dir)}
                                onRemove={() => removeBlock(block.id)}
                            >
                                <BlockPreview block={block} />
                            </BlockWrapper>
                        ))}
                     </div>
                </div>
            </div>
            <style>{`.panel-header{font-size:0.75rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem}.label-text{font-size:0.7rem;color:#94a3b8}.input-field-sm{width:100%;font-size:0.8rem;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.3rem;padding:0.3rem 0.5rem;color:#e2e8f0}.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.5rem 1rem;border-radius:0.5rem;}`}</style>
        </ModalWrapper>
    );
};

// --- BLOCK COMPONENTS ---

interface BlockWrapperProps {
    children: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    onMove: (direction: 'up' | 'down') => void;
    onRemove: () => void;
}
const BlockWrapper: React.FC<BlockWrapperProps> = ({ children, isActive, onClick, onMove, onRemove }) => (
    <div 
        onClick={onClick}
        className={`relative p-4 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? 'border-2 border-rs-gold shadow-2xl' : 'border-2 border-transparent hover:border-slate-700'}`}
    >
        {children}
        {isActive && (
            <div className="absolute -top-4 right-2 flex gap-1 bg-rs-dark p-1 rounded-md border border-rs-goldDim">
                <button onClick={(e) => { e.stopPropagation(); onMove('up'); }} className="p-1 hover:bg-white/10 rounded"><ArrowUp size={14}/></button>
                <button onClick={(e) => { e.stopPropagation(); onMove('down'); }} className="p-1 hover:bg-white/10 rounded"><ArrowDown size={14}/></button>
                <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={14}/></button>
            </div>
        )}
    </div>
);

const BlockPreview: React.FC<{ block: LandingPageBlock }> = ({ block }) => {
    const { type, content } = block;
    switch (type) {
        case 'hero':
            return <div className="text-center p-8 bg-rs-card rounded"><h1 className="text-3xl font-bold text-white">{content.title}</h1><p className="text-slate-400 mt-2">{content.subtitle}</p><button className="mt-4 btn-primary">{content.buttonText}</button></div>;
        case 'video':
            return <div className="bg-rs-card p-4 rounded"><div className="aspect-video bg-black flex items-center justify-center text-slate-500">Vídeo: {content.videoUrl}</div></div>;
        case 'faq':
            return <div className="bg-rs-card p-4 rounded"><h2 className="text-xl font-bold mb-2">Perguntas Frequentes</h2><div>{content.items.map((i: any, idx: number) => <div key={idx} className="border-t border-white/10 pt-2 mt-2"><h3 className="font-semibold text-slate-200">{i.q}</h3><p className="text-sm text-slate-400">{i.a}</p></div>)}</div></div>;
        case 'testimonials':
             return <div className="bg-rs-card p-4 rounded"><h2 className="text-xl font-bold mb-2">O que nossos clientes dizem</h2><div>{content.items.map((i: any, idx: number) => <div key={idx} className="bg-black/20 p-3 mt-2 rounded">_"{i.text}"_ <span className="font-bold text-slate-300">- {i.name}</span></div>)}</div></div>;
        default:
            return <div className="p-4 bg-red-900/50 text-red-300 rounded">Bloco desconhecido: {type}</div>;
    }
};

const BlockEditor: React.FC<{ block: LandingPageBlock, onUpdate: (id: string, content: any) => void }> = ({ block, onUpdate }) => {
    const [content, setContent] = useState(block.content);

    const handleChange = (field: string, value: any) => {
        const newContent = { ...content, [field]: value };
        setContent(newContent);
        onUpdate(block.id, newContent); // Update on change
    };

    return (
        <div className="bg-rs-gold/5 p-4 rounded-lg border border-rs-gold/20">
            <h3 className="panel-header text-rs-gold"><Edit2 size={16}/> Editando Bloco: {block.type}</h3>
            <div className="space-y-3">
                {block.type === 'hero' && (
                    <>
                        <div><label className="label-text">Título</label><input type="text" value={content.title} onChange={e => handleChange('title', e.target.value)} className="input-field-sm" /></div>
                        <div><label className="label-text">Subtítulo</label><input type="text" value={content.subtitle} onChange={e => handleChange('subtitle', e.target.value)} className="input-field-sm" /></div>
                        <div><label className="label-text">Texto do Botão</label><input type="text" value={content.buttonText} onChange={e => handleChange('buttonText', e.target.value)} className="input-field-sm" /></div>
                    </>
                )}
                 {block.type === 'video' && (
                    <div><label className="label-text">URL do Vídeo (YouTube Embed)</label><input type="text" value={content.videoUrl} onChange={e => handleChange('videoUrl', e.target.value)} className="input-field-sm" /></div>
                )}
            </div>
        </div>
    );
};