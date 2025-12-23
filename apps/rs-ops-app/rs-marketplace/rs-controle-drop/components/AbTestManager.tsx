import React, { useState, useMemo } from 'react';
import { Experiment, Product, ProductPageTemplate, ExperimentDataPoint, User, ExperimentType } from '../types';
import { TestTube2, Plus, Edit2, Trash2, Eye, Play, Pause, Flag, BarChart, Users, CheckCircle, TrendingUp, X, Sparkles, Sliders } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { DataTable, Column } from './DataTable';
import { useDataTable } from '../hooks/useDataTable';
import { useNotifier } from '../contexts/NotificationContext';

interface AbTestManagerProps {
    experiments: Experiment[];
    experimentData: ExperimentDataPoint[];
    products: Product[];
    productPageTemplates: ProductPageTemplate[];
    onUpdateExperiments: (exps: Experiment[]) => void;
    onAddExperimentData: (data: ExperimentDataPoint[]) => void;
    onUpdateProduct: (product: Product) => void;
    currentUser: User;
}

const EMPTY_EXPERIMENT: Omit<Experiment, 'id' | 'userId' | 'createdAt' | 'variations'> = {
    name: '',
    productId: '',
    status: 'running',
    type: 'price',
};

export const AbTestManager: React.FC<AbTestManagerProps> = ({ experiments, experimentData, products, productPageTemplates, onUpdateExperiments, onAddExperimentData, onUpdateProduct, currentUser }) => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isResultsModalOpen, setResultsModalOpen] = useState(false);
    const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
    const { addToast } = useNotifier();

    const table = useDataTable({ initialData: experiments, searchKeys: ['name'] });

    const handleOpenResults = (exp: Experiment) => {
        setSelectedExperiment(exp);
        setResultsModalOpen(true);
    };

    const handleUpdateStatus = (id: string, status: 'running' | 'paused' | 'completed') => {
        onUpdateExperiments(experiments.map(e => e.id === id ? { ...e, status, completedAt: status === 'completed' ? new Date().toISOString() : e.completedAt } : e));
    };

    const handleSaveExperiment = (exp: Omit<Experiment, 'id' | 'userId' | 'createdAt'>) => {
        const newExperiment: Experiment = {
            ...exp,
            id: crypto.randomUUID(),
            userId: currentUser.id,
            createdAt: new Date().toISOString(),
        };
        onUpdateExperiments([...experiments, newExperiment]);
        setCreateModalOpen(false);
    };

    const columns: Column<Experiment>[] = [
        { header: 'Nome do Teste', accessor: 'name', sortable: true, render: e => <span className="font-bold text-slate-200">{e.name}</span> },
        { header: 'Produto', accessor: 'productId', render: e => products.find(p => p.id === e.productId)?.name || 'N/A' },
        { header: 'Tipo', accessor: 'type', render: e => <span className="capitalize">{e.type.replace('_', ' ')}</span> },
        { header: 'Status', accessor: 'status', render: e => {
            const styles = {
                running: 'bg-emerald-500/10 text-emerald-400',
                paused: 'bg-yellow-500/10 text-yellow-400',
                completed: 'bg-slate-700 text-slate-400',
            };
            return <span className={`px-2 py-1 rounded text-xs font-bold ${styles[e.status]}`}>{e.status}</span>;
        }},
        { header: 'Ações', accessor: 'actions', render: e => (
            <div className="flex gap-2">
                <button onClick={() => handleOpenResults(e)} className="btn-secondary-sm"><Eye size={14}/> Resultados</button>
                {e.status === 'running' && <button onClick={() => handleUpdateStatus(e.id, 'paused')} className="p-2 hover:text-yellow-400"><Pause size={14}/></button>}
                {e.status === 'paused' && <button onClick={() => handleUpdateStatus(e.id, 'running')} className="p-2 hover:text-emerald-400"><Play size={14}/></button>}
                {e.status !== 'completed' && <button onClick={() => handleUpdateStatus(e.id, 'completed')} className="p-2 hover:text-slate-400"><Flag size={14}/></button>}
            </div>
        )}
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-rs-gold flex items-center gap-2"><TestTube2 /> Testes A/B</h2>
                    <p className="text-sm text-slate-400">Otimize suas conversões com base em dados.</p>
                </div>
                <button onClick={() => setCreateModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18}/> Novo Teste</button>
            </div>

            <DataTable {...table} columns={columns} data={table.paginatedData} onSort={table.requestSort} onSearch={table.setSearchTerm} onPageChange={{next: table.nextPage, prev: table.prevPage, goTo: table.goToPage}} onItemsPerPageChange={table.handleItemsPerPageChange} />

            {isCreateModalOpen && (
                <CreateExperimentModal
                    products={products}
                    productPageTemplates={productPageTemplates}
                    onClose={() => setCreateModalOpen(false)}
                    onSave={handleSaveExperiment}
                />
            )}

            {isResultsModalOpen && selectedExperiment && (
                <ResultsModal
                    experiment={selectedExperiment}
                    experimentData={experimentData}
                    onClose={() => setResultsModalOpen(false)}
                    onSimulateTraffic={onAddExperimentData}
                    onApplyWinner={(winnerVariation) => {
                        const product = products.find(p => p.id === selectedExperiment.productId);
                        if (product) {
                            let updatedProduct = { ...product };
                            if (selectedExperiment.type === 'price') updatedProduct.salePrice = winnerVariation.value as number;
                            if (selectedExperiment.type === 'headline') updatedProduct.name = winnerVariation.value as string;
                            if (selectedExperiment.type === 'page_layout') {
                                const template = productPageTemplates.find(t => t.id === winnerVariation.value);
                                if (template) updatedProduct.pageLayout = template.layout;
                            }
                            onUpdateProduct(updatedProduct);
                            handleUpdateStatus(selectedExperiment.id, 'completed');
                            addToast(`Variação vencedora aplicada ao produto "${product.name}"!`, 'success');
                        }
                    }}
                />
            )}
            <style>{`.btn-primary{background-color:#d4af37;color:#0a0a0a;font-weight:700;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary-sm{font-size:0.8rem;border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:0.3rem 0.8rem;border-radius:0.5rem;}`}</style>
        </div>
    );
};

// --- MODALS ---

interface CreateExperimentModalProps {
    products: Product[];
    productPageTemplates: ProductPageTemplate[];
    onClose: () => void;
    onSave: (exp: Omit<Experiment, 'id' | 'userId' | 'createdAt'>) => void;
}
const CreateExperimentModal: React.FC<CreateExperimentModalProps> = ({ products, productPageTemplates, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [productId, setProductId] = useState('');
    const [type, setType] = useState<ExperimentType>('price');
    const [variationBValue, setVariationBValue] = useState<string | number>('');
    
    const selectedProduct = useMemo(() => products.find(p => p.id === productId), [products, productId]);

    const getControlValue = () => {
        if (!selectedProduct) return 'N/A';
        if (type === 'price') return selectedProduct.salePrice;
        if (type === 'headline') return selectedProduct.name;
        if (type === 'page_layout') return 'Layout Atual';
        return 'N/A';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !variationBValue) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }
        onSave({
            name,
            productId,
            type,
            status: 'running',
            variations: [
                { id: 'A', name: 'Controle', split: 50, value: getControlValue() },
                { id: 'B', name: 'Variação B', split: 50, value: variationBValue }
            ]
        });
    };

    return (
        <ModalWrapper isOpen={true} onClose={onClose} title="Novo Teste A/B">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label className="label-text">Nome do Teste</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Ex: Teste de Preço Inflamax" required /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="label-text">Produto</label><select value={productId} onChange={e => setProductId(e.target.value)} className="input-field" required><option value="">Selecione...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><label className="label-text">O que testar?</label><select value={type} onChange={e => setType(e.target.value as ExperimentType)} className="input-field"><option value="price">Preço</option><option value="headline">Título</option><option value="page_layout">Layout da Página</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-lg border border-white/5">
                    <div><label className="label-text">Variação A (Controle)</label><input type="text" value={getControlValue()} className="input-field bg-slate-800" readOnly /></div>
                    <div>
                        <label className="label-text">Variação B</label>
                        {type === 'price' && <input type="number" value={variationBValue} onChange={e => setVariationBValue(Number(e.target.value))} className="input-field" placeholder="Novo preço" required />}
                        {type === 'headline' && <input type="text" value={variationBValue} onChange={e => setVariationBValue(e.target.value)} className="input-field" placeholder="Novo título" required />}
                        {type === 'page_layout' && <select value={variationBValue} onChange={e => setVariationBValue(e.target.value)} className="input-field" required><option value="">Selecione o template...</option>{productPageTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>}
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Salvar e Iniciar</button></div>
            </form>
             <style>{`.label-text{display:block;font-size:0.75rem;color:#94a3b8;margin-bottom:0.25rem}.input-field{width:100%;background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e2e8f0;outline:none}`}</style>
        </ModalWrapper>
    );
};

interface ResultsModalProps {
    experiment: Experiment;
    experimentData: ExperimentDataPoint[];
    onClose: () => void;
    onSimulateTraffic: (data: ExperimentDataPoint[]) => void;
    onApplyWinner: (variation: Experiment['variations'][0]) => void;
}
const ResultsModal: React.FC<ResultsModalProps> = ({ experiment, experimentData, onClose, onSimulateTraffic, onApplyWinner }) => {
    
    const results = useMemo(() => {
        const data = experimentData.filter(d => d.experimentId === experiment.id);
        const results = {
            A: { visitors: 0, conversions: 0, revenue: 0 },
            B: { visitors: 0, conversions: 0, revenue: 0 },
        };
        const visitorsA = new Set();
        const visitorsB = new Set();

        data.forEach(d => {
            if (d.eventType === 'visit') {
                if (d.variationId === 'A') visitorsA.add(d.sessionId);
                else visitorsB.add(d.sessionId);
            } else if (d.eventType === 'conversion') {
                results[d.variationId].conversions++;
                results[d.variationId].revenue += d.revenue || 0;
            }
        });
        results.A.visitors = visitorsA.size;
        results.B.visitors = visitorsB.size;

        const crA = results.A.visitors > 0 ? (results.A.conversions / results.A.visitors) * 100 : 0;
        const crB = results.B.visitors > 0 ? (results.B.conversions / results.B.visitors) * 100 : 0;
        
        const winner = crB > crA ? 'B' : crA > crB ? 'A' : null;
        const improvement = winner && crA > 0 ? ((crB - crA) / crA) * 100 : winner === 'B' ? 100 : 0;

        return { A: {...results.A, cr: crA}, B: {...results.B, cr: crB}, winner, improvement };
    }, [experiment.id, experimentData]);

    const handleSimulate = () => {
        const newPoints: ExperimentDataPoint[] = [];
        const visitors = 1000;
        const baseCr = 0.05; // 5%
        const uplift = 0.02; // +2% for variation B
        for (let i = 0; i < visitors; i++) {
            const sessionId = crypto.randomUUID();
            const variationId = Math.random() < 0.5 ? 'A' : 'B';
            newPoints.push({ id: crypto.randomUUID(), experimentId: experiment.id, variationId, eventType: 'visit', sessionId, timestamp: new Date().toISOString() });
            
            const cr = variationId === 'A' ? baseCr : baseCr + uplift;
            if (Math.random() < cr) {
                const revenue = typeof experiment.variations.find(v=>v.id === variationId)!.value === 'number'
                    ? experiment.variations.find(v=>v.id === variationId)!.value as number
                    : 197;
                newPoints.push({ id: crypto.randomUUID(), experimentId: experiment.id, variationId, eventType: 'conversion', revenue, sessionId, timestamp: new Date().toISOString() });
            }
        }
        onSimulateTraffic(newPoints);
    };

    return (
        <ModalWrapper isOpen={true} onClose={onClose} title={`Resultados: ${experiment.name}`} size="4xl">
            <div className="p-6 space-y-4">
                <table className="w-full text-left">
                    <thead className="text-xs text-slate-400 uppercase">
                        <tr><th className="p-2">Métrica</th><th className="p-2 text-center">Controle (A)</th><th className="p-2 text-center">Variação (B)</th></tr>
                    </thead>
                    <tbody className="text-sm">
                        <tr className="border-b border-white/5"><td className="p-2 flex items-center gap-2"><Users size={14}/> Visitantes</td><td className="p-2 text-center font-bold">{results.A.visitors}</td><td className="p-2 text-center font-bold">{results.B.visitors}</td></tr>
                        <tr className="border-b border-white/5"><td className="p-2 flex items-center gap-2"><CheckCircle size={14}/> Conversões</td><td className="p-2 text-center font-bold">{results.A.conversions}</td><td className="p-2 text-center font-bold">{results.B.conversions}</td></tr>
                        <tr className="border-b border-white/5"><td className="p-2 flex items-center gap-2"><TrendingUp size={14}/> Taxa de Conversão</td><td className="p-2 text-center font-bold text-lg">{results.A.cr.toFixed(2)}%</td><td className={`p-2 text-center font-bold text-lg ${results.winner === 'B' ? 'text-emerald-400' : ''}`}>{results.B.cr.toFixed(2)}%</td></tr>
                        <tr className="border-b border-white/5"><td className="p-2 flex items-center gap-2"><BarChart size={14}/> Receita</td><td className="p-2 text-center font-bold">R$ {results.A.revenue.toFixed(2)}</td><td className="p-2 text-center font-bold">R$ {results.B.revenue.toFixed(2)}</td></tr>
                    </tbody>
                </table>

                {results.winner && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
                        <div className="font-bold text-emerald-400 text-lg">Variação "{results.winner}" é a vencedora!</div>
                        <p className="text-sm text-slate-300">Melhoria de <span className="font-bold">{results.improvement.toFixed(1)}%</span> na taxa de conversão.</p>
                        <button onClick={() => onApplyWinner(experiment.variations.find(v => v.id === results.winner)!)} className="btn-primary mt-3">Aplicar Variação Vencedora</button>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button onClick={handleSimulate} className="btn-secondary flex items-center gap-2"><Sparkles size={14}/> Simular Tráfego</button>
                </div>
            </div>
        </ModalWrapper>
    );
};