import React, { useState, useRef, useEffect, FC, WheelEvent, useReducer } from 'react';
import { 
    IconX, IconSparkles, IconAdjustments, IconRotateCcw, IconRotateCw, 
    IconFlipHorizontal, IconFlipVertical, IconZoomIn, IconZoomOut,
    IconMaximize, IconRepeat, IconFilter, IconMove
} from '../../components/icons';
import type { ImageAdjustments, ImageTransform, EditHistory } from '../../types';

interface ImageEditorProps {
    imageUrl: string;
    onSave: (base64: string, mimeType: string) => void;
    onCancel: () => void;
    aiRemoveBg: (base64: string, mimeType: string) => Promise<{ base64: string, mimeType: string }>;
    aiEnhance: (base64: string, mimeType: string) => Promise<{ base64: string, mimeType: string }>;
}

const INITIAL_ADJUSTMENTS: ImageAdjustments = { brightness: 100, contrast: 100, saturate: 100, sepia: 0, grayscale: 0, invert: 0, hueRotate: 0, blur: 0 };
const INITIAL_TRANSFORM: ImageTransform = { scale: 1, translateX: 0, translateY: 0, rotate: 0, flipX: false, flipY: false };

type ActivePanel = 'adjust' | 'filters' | 'transform' | null;

const ADJUSTMENT_CONFIG = {
    brightness: { min: 0, max: 200, step: 1, label: 'Brilho' },
    contrast: { min: 0, max: 200, step: 1, label: 'Contraste' },
    saturate: { min: 0, max: 300, step: 1, label: 'Saturação' },
    sepia: { min: 0, max: 100, step: 1, label: 'Sépia' },
    grayscale: { min: 0, max: 100, step: 1, label: 'Escala de Cinza' },
    invert: { min: 0, max: 100, step: 1, label: 'Inverter' },
    hueRotate: { min: 0, max: 360, step: 1, label: 'Matiz' },
    blur: { min: 0, max: 20, step: 0.1, label: 'Desfoque' },
};

const FILTERS = [
    { name: 'Nenhum', settings: INITIAL_ADJUSTMENTS },
    { name: 'Vintage', settings: { ...INITIAL_ADJUSTMENTS, sepia: 60, contrast: 75, brightness: 120, saturate: 110 } },
    { name: 'Noir', settings: { ...INITIAL_ADJUSTMENTS, grayscale: 100, contrast: 130, brightness: 95 } },
    { name: 'Cinematic', settings: { ...INITIAL_ADJUSTMENTS, contrast: 110, saturate: 120, brightness: 95 } },
    { name: 'Luz Fria', settings: { ...INITIAL_ADJUSTMENTS, saturate: 110, hueRotate: -10, brightness: 105 } },
    { name: 'Sépia Quente', settings: { ...INITIAL_ADJUSTMENTS, sepia: 80, contrast: 90 } },
];

const EditorButton: FC<{ icon: React.ElementType, label: string, onClick: () => void, isActive: boolean }> = ({ icon: Icon, label, onClick, isActive }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-md text-xs w-full transition-colors ${isActive ? 'bg-brand-gold text-brand-dark' : 'bg-brand-gray-light hover:bg-brand-gray-dark'}`}>
        <Icon size={20}/>
        <span>{label}</span>
    </button>
);


const ImageEditorWorkspace: FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel, aiRemoveBg, aiEnhance }) => {
    const [adjustments, setAdjustments] = useState<ImageAdjustments>(INITIAL_ADJUSTMENTS);
    const [transform, setTransform] = useState<ImageTransform>(INITIAL_TRANSFORM);
    const [history, setHistory] = useState<EditHistory[]>([{ adjustments: INITIAL_ADJUSTMENTS, transform: INITIAL_TRANSFORM }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const handleZoom = (direction: 'in' | 'out', clientX?: number, clientY?: number) => {
        const container = containerRef.current;
        if (!container) return;

        const zoomFactor = 1.1;
        const newScale = direction === 'in' ? transform.scale * zoomFactor : transform.scale / zoomFactor;
        const clampedScale = Math.max(0.1, Math.min(5, newScale));

        if (clampedScale === transform.scale) return;

        const rect = container.getBoundingClientRect();
        const mouseX = clientX ? clientX - rect.left : rect.width / 2;
        const mouseY = clientY ? clientY - rect.top : rect.height / 2;

        const contentX = (mouseX - transform.translateX) / transform.scale;
        const contentY = (mouseY - transform.translateY) / transform.scale;

        const newX = mouseX - contentX * clampedScale;
        const newY = mouseY - contentY * clampedScale;
        
        const newTransform = { ...transform, scale: clampedScale, translateX: newX, translateY: newY };
        setTransform(newTransform);
        updateHistory(adjustments, newTransform);
    };

    const updateHistory = (newAdjustments: ImageAdjustments, newTransform: ImageTransform) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ adjustments: newAdjustments, transform: newTransform });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleAdjustmentChange = (key: keyof ImageAdjustments, value: number) => {
        const newAdjustments = { ...adjustments, [key]: value };
        setAdjustments(newAdjustments);
    };
    
    const handleMouseUpOnSlider = () => {
        if (JSON.stringify(history[historyIndex].adjustments) !== JSON.stringify(adjustments)) {
            updateHistory(adjustments, transform);
        }
    };

    const resetAdjustments = () => {
        setAdjustments(INITIAL_ADJUSTMENTS);
        updateHistory(INITIAL_ADJUSTMENTS, transform);
    };

    const applyFilterPreset = (settings: ImageAdjustments) => {
        setAdjustments(settings);
        updateHistory(settings, transform);
    };

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const handleUndo = () => {
        if (canUndo) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setAdjustments(history[newIndex].adjustments);
            setTransform(history[newIndex].transform);
        }
    };
    const handleRedo = () => {
        if (canRedo) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setAdjustments(history[newIndex].adjustments);
            setTransform(history[newIndex].transform);
        }
    };
    
    const handleTransformChange = (key: keyof ImageTransform, value: number | boolean) => {
        const newTransform = { ...transform, [key]: value };
        setTransform(newTransform);
    };

    const handleMouseUpOnTransform = () => {
        if (JSON.stringify(history[historyIndex].transform) !== JSON.stringify(transform)) {
            updateHistory(adjustments, transform);
        }
    }
    
    const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setStartDragPos({ x: e.clientX - transform.translateX, y: e.clientY - transform.translateY }); };
    const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) { setTransform(t => ({...t, translateX: e.clientX - startDragPos.x, translateY: e.clientY - startDragPos.y })); }};
    const handleMouseUpDrag = () => { if(isDragging) { setIsDragging(false); updateHistory(adjustments, transform); } };
    const handleWheel = (e: WheelEvent<HTMLDivElement>) => { e.preventDefault(); handleZoom(e.deltaY < 0 ? 'in' : 'out', e.clientX, e.clientY); };
    
    const fitToScreen = () => {
         if (containerRef.current && imageRef.current) {
            const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();
            const { naturalWidth, naturalHeight } = imageRef.current;
            const scale = Math.min(containerWidth / naturalWidth, containerHeight / naturalHeight) * 0.9;
            const newTransform = {...INITIAL_TRANSFORM, scale};
            setTransform(newTransform);
            updateHistory(adjustments, newTransform);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const { naturalWidth: w, naturalHeight: h } = img;
            canvas.width = w;
            canvas.height = h;

            ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturate}%) sepia(${adjustments.sepia}%) grayscale(${adjustments.grayscale}%) invert(${adjustments.invert}%) hue-rotate(${adjustments.hueRotate}deg) blur(${adjustments.blur}px)`;

            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(transform.rotate * Math.PI / 180);
            ctx.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();

            const base64 = canvas.toDataURL('image/png').split(',')[1];
            onSave(base64, 'image/png');
            setIsLoading(false);
        };
    };

    const handleAiAction = async (action: 'removeBg' | 'enhance') => {
        setIsLoading(true);
        const originalMimeType = imageUrl.split(';')[0].split(':')[1];
        const originalBase64 = imageUrl.split(',')[1];
        try {
            const {base64: newBase64, mimeType: newMimeType} = action === 'removeBg' 
                ? await aiRemoveBg(originalBase64, originalMimeType)
                : await aiEnhance(originalBase64, originalMimeType);
            onSave(newBase64, newMimeType);
        } catch (error) {
            alert('AI action failed: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const imageStyle: React.CSSProperties = {
        filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturate}%) sepia(${adjustments.sepia}%) grayscale(${adjustments.grayscale}%) invert(${adjustments.invert}%) hue-rotate(${adjustments.hueRotate}deg) blur(${adjustments.blur}px)`,
        transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale}) rotate(${transform.rotate}deg) scaleX(${transform.flipX ? -1 : 1}) scaleY(${transform.flipY ? -1 : 1})`,
        cursor: isDragging ? 'grabbing' : 'grab',
    };
    
    return (
        <div className="fixed inset-0 bg-brand-dark z-50 flex flex-col animate-fade-in">
            {isLoading && <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div></div>}

            {/* Header */}
            <header className="h-16 bg-brand-gray flex-shrink-0 flex items-center justify-between px-4 border-b border-brand-gray-light">
                <div className="flex items-center gap-2">
                    <button onClick={onCancel} className="font-semibold text-gray-300 hover:text-white px-4 py-2 rounded-lg">Cancelar</button>
                    <button onClick={handleUndo} disabled={!canUndo} className="p-2 rounded-md disabled:opacity-50 hover:bg-brand-gray-light" title="Desfazer"><IconRotateCcw/></button>
                    <button onClick={handleRedo} disabled={!canRedo} className="p-2 rounded-md disabled:opacity-50 hover:bg-brand-gray-light" title="Refazer"><IconRotateCw/></button>
                </div>
                <h2 className="text-lg font-bold text-white">Editor de Imagem</h2>
                <button onClick={handleSave} className="bg-brand-gold text-brand-dark font-bold px-6 py-2 rounded-lg hover:bg-yellow-400">Salvar</button>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                <main 
                    ref={containerRef}
                    className="flex-1 bg-brand-dark overflow-hidden relative"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpDrag}
                    onMouseLeave={handleMouseUpDrag}
                    onWheel={handleWheel}
                >
                    <img ref={imageRef} src={imageUrl} className="max-w-none max-h-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={imageStyle} alt="Editing" />
                </main>

                <aside className="w-80 bg-brand-gray border-l border-brand-gray-light p-4 flex flex-col">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button onClick={() => handleAiAction('removeBg')} className="flex items-center justify-center gap-2 bg-brand-gray-light p-2 rounded-md hover:bg-brand-gray-dark text-sm"><IconSparkles size={16}/> Remover Fundo</button>
                        <button onClick={() => handleAiAction('enhance')} className="flex items-center justify-center gap-2 bg-brand-gray-light p-2 rounded-md hover:bg-brand-gray-dark text-sm"><IconSparkles size={16}/> Melhorar</button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <EditorButton icon={IconAdjustments} label="Ajustes" onClick={() => setActivePanel(p => p === 'adjust' ? null : 'adjust')} isActive={activePanel === 'adjust'} />
                        <EditorButton icon={IconFilter} label="Filtros" onClick={() => setActivePanel(p => p === 'filters' ? null : 'filters')} isActive={activePanel === 'filters'} />
                        <EditorButton icon={IconMove} label="Transformar" onClick={() => setActivePanel(p => p === 'transform' ? null : 'transform')} isActive={activePanel === 'transform'} />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2">
                        {activePanel === 'adjust' && (
                            <div className="space-y-3 animate-fade-in" onMouseUp={handleMouseUpOnSlider}>
                                {(Object.keys(ADJUSTMENT_CONFIG) as (keyof ImageAdjustments)[]).map(key => {
                                    const config = ADJUSTMENT_CONFIG[key];
                                    return (
                                        <div key={key}>
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs capitalize text-gray-400">{config.label}</label>
                                                <span className="text-xs font-mono text-gray-300">{adjustments[key]}</span>
                                            </div>
                                            <input type="range" min={config.min} max={config.max} step={config.step} value={adjustments[key]} onChange={(e) => handleAdjustmentChange(key, parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm accent-brand-gold"/>
                                        </div>
                                    )
                                })}
                                <button onClick={resetAdjustments} className="w-full text-center py-1.5 bg-brand-gray-light rounded-md text-sm font-semibold hover:bg-brand-gray-dark mt-4">Redefinir Ajustes</button>
                            </div>
                        )}
                        {activePanel === 'filters' && (
                             <div className="grid grid-cols-2 gap-2 animate-fade-in">
                                {FILTERS.map(filter => (
                                    <button key={filter.name} onClick={() => applyFilterPreset(filter.settings)} className="text-center group">
                                        <img src={imageUrl} alt={filter.name} className="w-full h-20 object-cover rounded-md border-2 border-transparent group-hover:border-brand-gold" style={{filter: Object.entries(filter.settings).map(([key, value]) => {
                                            if (key === 'hueRotate') return `hue-rotate(${value}deg)`;
                                            if (key === 'blur') return `blur(${value}px)`;
                                            if (['sepia', 'grayscale', 'invert'].includes(key)) return `${key}(${value}%)`;
                                            return `${key}(${value}%)`;
                                        }).join(' ')}} />
                                        <span className="text-xs mt-1 block">{filter.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {activePanel === 'transform' && (
                             <div className="space-y-4 animate-fade-in" onMouseUp={handleMouseUpOnTransform}>
                                <div>
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs capitalize text-gray-400">Girar</label>
                                        <span className="text-xs font-mono text-gray-300">{transform.rotate}°</span>
                                    </div>
                                    <input type="range" min="-180" max="180" value={transform.rotate} onChange={(e) => handleTransformChange('rotate', parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm accent-brand-gold"/>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => handleTransformChange('flipX', !transform.flipX)} className="flex items-center justify-center gap-2 p-2 rounded-md text-sm bg-brand-gray-light"><IconFlipHorizontal size={16}/> Horizontal</button>
                                    <button onClick={() => handleTransformChange('flipY', !transform.flipY)} className="flex items-center justify-center gap-2 p-2 rounded-md text-sm bg-brand-gray-light"><IconFlipVertical size={16}/> Vertical</button>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
            
            <footer className="h-12 bg-brand-gray flex-shrink-0 flex items-center justify-center gap-4 px-4 border-t border-brand-gray-light">
                <button onClick={() => handleZoom('out')} className="p-2 rounded-md hover:bg-brand-gray-light"><IconZoomOut/></button>
                <span className="font-mono text-sm w-16 text-center">{Math.round(transform.scale * 100)}%</span>
                <button onClick={() => handleZoom('in')} className="p-2 rounded-md hover:bg-brand-gray-light"><IconZoomIn/></button>
                <button onClick={fitToScreen} className="p-2 rounded-md hover:bg-brand-gray-light"><IconMaximize/></button>
            </footer>
        </div>
    );
};

export default ImageEditorWorkspace;