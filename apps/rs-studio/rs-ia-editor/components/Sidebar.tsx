import React, { useState, useEffect, useRef } from 'react';
import { 
  Wand2, 
  Image as ImageIcon, 
  Type, 
  Download, 
  Layout, 
  Loader2, 
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Move, 
  Palette, 
  Layers,
  Ghost,
  Type as TypeIcon,
  Copy,
  Check,
  Share2,
  Sparkles,
  Upload,
  ScanEye
} from 'lucide-react';
import { AdFormat, TextLayer } from '../types';
import { AD_FORMATS } from '../constants';

interface SidebarProps {
  currentFormat: AdFormat;
  onFormatChange: (format: AdFormat) => void;
  onGenerateImage: (prompt: string) => void;
  onEnhancePrompt: (currentPrompt: string) => void;
  onGenerateCopy: (context: string, useImageContext: boolean) => void;
  onUploadImage: (file: File) => void;
  isGeneratingImage: boolean;
  isEnhancingPrompt: boolean;
  isGeneratingCopy: boolean;
  selectedLayer: TextLayer | null;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
  onDeleteLayer: (id: string) => void;
  onAddLayer: () => void;
  onDownload: () => void;
  onShare: () => void;
  backgroundColor: string;
  onChangeBackgroundColor: (color: string) => void;
  onMoveLayerForward: () => void;
  onMoveLayerBackward: () => void;
  backgroundImage: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentFormat,
  onFormatChange,
  onGenerateImage,
  onEnhancePrompt,
  onGenerateCopy,
  onUploadImage,
  isGeneratingImage,
  isEnhancingPrompt,
  isGeneratingCopy,
  selectedLayer,
  onUpdateLayer,
  onDeleteLayer,
  onAddLayer,
  onDownload,
  onShare,
  backgroundColor,
  onChangeBackgroundColor,
  onMoveLayerForward,
  onMoveLayerBackward,
  backgroundImage
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');
  const [imagePrompt, setImagePrompt] = useState('');
  const [copyPrompt, setCopyPrompt] = useState('');
  const [nudgeStep, setNudgeStep] = useState(10);
  const [isCopied, setIsCopied] = useState(false);
  const [useImageForCopy, setUseImageForCopy] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local prompt if external change happens (e.g. enhancement)
  // This is a simplified way to handle parent state updates reflecting in local input
  // Ideally, prompt state should be lifted or controlled fully
  
  // Auto-switch to Edit tab when a layer is selected
  useEffect(() => {
    if (selectedLayer) {
      setActiveTab('edit');
    }
  }, [selectedLayer?.id]);

  const handleCopyText = () => {
    if (selectedLayer?.text) {
      navigator.clipboard.writeText(selectedLayer.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleEnhanceClick = async () => {
    if (!imagePrompt) return;
    const enhanced = await onEnhancePrompt(imagePrompt);
    // Since onEnhancePrompt returns the string in the parent handler, 
    // we actually need the parent to pass back the enhanced string or handle it there.
    // For this UI, we'll assume the parent updates the state if we lifted it, 
    // BUT since state is local here, we need to adapt.
    // Let's change the pattern: pass the prompt to parent, parent calls service, parent calls back with result.
    // Refactored: We will handle the async result here for the input update.
  };

  const PRESET_BG_COLORS = [
      '#241e0b', // Default Dark Gold
      '#080808', // Obsidian 950
      '#1A1A1A', // Obsidian 800
      '#000000', // Pure Black
      '#5C4D35', // Bronze
      '#C5A059', // Gold 500
      '#FFFFFF', // White
      '#3f3f3f'  // Grey
  ];

  return (
    <div className="w-[360px] bg-obsidian-900 border-r border-white/10 flex flex-col h-full z-20 shadow-2xl select-text">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="font-serif text-2xl text-gold-400 italic font-bold tracking-wide">RS-IA <span className="text-white not-italic text-sm font-sans font-light tracking-widest opacity-80 uppercase ml-2">Editor</span></h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <button 
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-4 text-xs font-semibold uppercase tracking-widest transition-colors ${activeTab === 'create' ? 'text-gold-500 border-b-2 border-gold-500 bg-white/5' : 'text-gray-500 hover:text-white'}`}
        >
          Criar
        </button>
        <button 
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-4 text-xs font-semibold uppercase tracking-widest transition-colors ${activeTab === 'edit' ? 'text-gold-500 border-b-2 border-gold-500 bg-white/5' : 'text-gray-500 hover:text-white'}`}
        >
          Editar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {activeTab === 'create' && (
          <>
            {/* Format Selection */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <Layout className="w-3 h-3" /> Formato
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {AD_FORMATS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => onFormatChange(f)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      currentFormat.id === f.id 
                      ? 'border-gold-500 bg-gold-500/10 text-gold-400' 
                      : 'border-white/10 hover:border-white/30 text-gray-400'
                    }`}
                  >
                    <div className="text-sm font-bold">{f.name}</div>
                    <div className="text-[10px] opacity-60 mt-1">{f.label}</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Image Source */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Background Visual
              </h2>
              
              <div className="space-y-3">
                  <div className="relative">
                    <textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Descreva sua imagem..."
                        className="w-full bg-obsidian-950 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:border-gold-500 focus:outline-none min-h-[100px] resize-none placeholder-gray-700 select-text cursor-text pb-8"
                    />
                    <button
                        onClick={async () => {
                            if (!imagePrompt) return;
                            // We need to pass a callback to update the local state since enhancePrompt is async
                            // For now, we rely on the prop function returning the value? 
                            // Actually, let's use a simpler pattern:
                            // The prop onEnhancePrompt will return a Promise<string>
                            const newPrompt = await onEnhancePrompt(imagePrompt);
                            if (newPrompt) setImagePrompt(newPrompt);
                        }}
                        disabled={!imagePrompt || isEnhancingPrompt}
                        className="absolute bottom-2 right-2 p-1.5 bg-gold-500 text-black rounded hover:bg-white transition-colors disabled:opacity-50"
                        title="Melhorar Prompt com IA"
                    >
                         {isEnhancingPrompt ? <Loader2 className="animate-spin w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                    </button>
                  </div>

                  <button
                    disabled={isGeneratingImage || !imagePrompt}
                    onClick={() => onGenerateImage(imagePrompt)}
                    className="w-full bg-white text-black py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGeneratingImage ? <Loader2 className="animate-spin w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                    Gerar Imagem (IA)
                  </button>

                  <div className="flex items-center gap-2 text-xs text-gray-600 my-2">
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span>OU</span>
                      <div className="flex-1 h-px bg-white/10"></div>
                  </div>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files?.[0]) onUploadImage(e.target.files[0]);
                    }} 
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-white/20 text-gray-300 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-gold-500 hover:text-gold-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Foto Produto
                  </button>
              </div>
            </section>

            {/* Copy Generation */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <Type className="w-3 h-3" /> Inteligência de Texto
              </h2>
              
              {backgroundImage && (
                 <div className="mb-3 flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10">
                    <input 
                        type="checkbox"
                        id="useImageContext"
                        checked={useImageForCopy}
                        onChange={(e) => setUseImageForCopy(e.target.checked)}
                        className="accent-gold-500 w-4 h-4"
                    />
                    <label htmlFor="useImageContext" className="text-xs text-gray-300 flex items-center gap-1 cursor-pointer select-none">
                        <ScanEye className="w-3 h-3 text-gold-500" />
                        Ler imagem de fundo
                    </label>
                 </div>
              )}

              <textarea
                value={copyPrompt}
                onChange={(e) => setCopyPrompt(e.target.value)}
                placeholder={useImageForCopy ? "Instruções adicionais (ex: 'Foco no desconto de 50%')..." : "Sobre o que é a campanha? Ex: Venda exclusiva de relógios..."}
                className="w-full bg-obsidian-950 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:border-gold-500 focus:outline-none min-h-[80px] resize-none placeholder-gray-700 select-text cursor-text"
              />
              <button
                disabled={isGeneratingCopy || (!copyPrompt && !useImageForCopy)}
                onClick={() => onGenerateCopy(copyPrompt, useImageForCopy)}
                className="w-full mt-3 border border-white/20 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-gold-500 hover:text-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGeneratingCopy ? <Loader2 className="animate-spin w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                {useImageForCopy ? 'Analisar & Escrever' : 'Escrever Copy'}
              </button>
            </section>
          </>
        )}

        {activeTab === 'edit' && (
          <div className="space-y-6">
             {selectedLayer ? (
               <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gold-500 text-sm font-bold uppercase tracking-widest">Editar Camada</h3>
                    <div className="flex gap-2">
                         <div className="flex bg-white/5 rounded p-0.5 border border-white/10">
                            <button onClick={onMoveLayerBackward} className="p-1 hover:text-gold-500" title="Enviar para trás"><Layers className="w-3 h-3" /></button>
                            <div className="w-px bg-white/10 mx-0.5"></div>
                            <button onClick={onMoveLayerForward} className="p-1 hover:text-gold-500" title="Trazer para frente"><Layers className="w-3 h-3 rotate-180" /></button>
                         </div>
                        <button onClick={() => onDeleteLayer(selectedLayer.id)} className="text-red-500 hover:text-red-400 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Position Controls */}
                    <div className="p-3 border border-white/5 rounded-lg bg-white/5">
                        <label className="text-xs text-gray-500 mb-2 block flex items-center gap-2">
                            <Move className="w-3 h-3" /> Posição & Ajuste Fino
                        </label>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-xs text-gray-500">X</span>
                                <input
                                    type="number"
                                    value={Math.round(selectedLayer.x)}
                                    onChange={(e) => onUpdateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                                    className="w-full bg-obsidian-950 border border-white/10 rounded p-1.5 pl-6 text-sm text-right focus:border-gold-500 focus:outline-none select-text cursor-text"
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-xs text-gray-500">Y</span>
                                <input
                                    type="number"
                                    value={Math.round(selectedLayer.y)}
                                    onChange={(e) => onUpdateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                                    className="w-full bg-obsidian-950 border border-white/10 rounded p-1.5 pl-6 text-sm text-right focus:border-gold-500 focus:outline-none select-text cursor-text"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-1 text-[10px] mb-1 w-full justify-between px-2">
                                <span className="text-gray-500">Passo:</span>
                                {[1, 10, 50].map(step => (
                                    <button
                                        key={step}
                                        onClick={() => setNudgeStep(step)}
                                        className={`px-2 rounded ${nudgeStep === step ? 'bg-gold-500 text-black font-bold' : 'bg-black text-gray-500 hover:text-white'}`}
                                    >
                                        {step}px
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <div></div>
                                <button onClick={() => onUpdateLayer(selectedLayer.id, { y: selectedLayer.y - nudgeStep })} className="w-8 h-8 flex items-center justify-center bg-obsidian-950 hover:bg-gold-500 hover:text-black rounded border border-white/10 transition-colors">
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <div></div>
                                
                                <button onClick={() => onUpdateLayer(selectedLayer.id, { x: selectedLayer.x - nudgeStep })} className="w-8 h-8 flex items-center justify-center bg-obsidian-950 hover:bg-gold-500 hover:text-black rounded border border-white/10 transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="w-8 h-8 flex items-center justify-center text-xs text-gold-500/50 font-mono">
                                    <Move className="w-3 h-3" />
                                </div>
                                <button onClick={() => onUpdateLayer(selectedLayer.id, { x: selectedLayer.x + nudgeStep })} className="w-8 h-8 flex items-center justify-center bg-obsidian-950 hover:bg-gold-500 hover:text-black rounded border border-white/10 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                <div></div>
                                <button onClick={() => onUpdateLayer(selectedLayer.id, { y: selectedLayer.y + nudgeStep })} className="w-8 h-8 flex items-center justify-center bg-obsidian-950 hover:bg-gold-500 hover:text-black rounded border border-white/10 transition-colors">
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                                <div></div>
                            </div>
                        </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-gray-500 block">Conteúdo</label>
                        {selectedLayer.type === 'cta' && (
                            <button 
                                onClick={handleCopyText}
                                className="flex items-center gap-1.5 text-[10px] text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-widest font-bold bg-white/5 px-2 py-1 rounded border border-white/10 hover:border-gold-500/50"
                                title="Copiar texto para área de transferência"
                            >
                                {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {isCopied ? 'Copiado' : 'Copiar'}
                            </button>
                        )}
                      </div>
                      <textarea 
                        value={selectedLayer.text}
                        onChange={(e) => onUpdateLayer(selectedLayer.id, { text: e.target.value })}
                        onFocus={(e) => e.target.select()}
                        className="w-full bg-obsidian-950 border border-white/10 rounded p-2 text-sm focus:border-gold-500 focus:outline-none placeholder-gray-700 select-text cursor-text"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs text-gray-500 mb-2 block">Fonte</label>
                          <select 
                            value={selectedLayer.fontFamily}
                            onChange={(e) => onUpdateLayer(selectedLayer.id, { fontFamily: e.target.value as any })}
                            className="w-full bg-obsidian-950 border border-white/10 rounded p-2 text-sm focus:border-gold-500 focus:outline-none"
                          >
                            <option value="Playfair Display">Serif (Playfair)</option>
                            <option value="Inter">Sans (Inter)</option>
                            <option value="Cinzel">Luxury (Cinzel)</option>
                            <option value="Lato">Clean (Lato)</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-xs text-gray-500 mb-2 block">Tamanho</label>
                          <input 
                            type="number"
                            value={selectedLayer.fontSize}
                            onChange={(e) => onUpdateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                            className="w-full bg-obsidian-950 border border-white/10 rounded p-2 text-sm focus:border-gold-500 focus:outline-none select-text cursor-text"
                          />
                       </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-2 block">Alinhamento</label>
                      <div className="flex bg-obsidian-950 rounded border border-white/10 p-1">
                        {(['left', 'center', 'right'] as const).map(align => (
                          <button
                            key={align}
                            onClick={() => onUpdateLayer(selectedLayer.id, { align })}
                            className={`flex-1 p-1 flex justify-center rounded ${selectedLayer.align === align ? 'bg-white/10 text-gold-500' : 'text-gray-500'}`}
                          >
                            {align === 'left' && <AlignLeft className="w-4 h-4" />}
                            {align === 'center' && <AlignCenter className="w-4 h-4" />}
                            {align === 'right' && <AlignRight className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Typography Extras */}
                    <div className="p-3 border border-white/5 rounded-lg bg-white/5">
                        <label className="text-xs text-gray-500 mb-3 block flex items-center gap-2">
                             <TypeIcon className="w-3 h-3" /> Detalhes
                        </label>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                    <span>Espaçamento (Kerning)</span>
                                    <span>{selectedLayer.letterSpacing || 0}em</span>
                                </div>
                                <input
                                    type="range"
                                    min="-0.05"
                                    max="0.5"
                                    step="0.01"
                                    value={selectedLayer.letterSpacing || 0}
                                    onChange={(e) => onUpdateLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })}
                                    className="w-full accent-gold-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300 flex items-center gap-2">
                                    <Ghost className="w-3 h-3" /> Sombra
                                </span>
                                <button 
                                    onClick={() => onUpdateLayer(selectedLayer.id, { shadow: !selectedLayer.shadow })}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${selectedLayer.shadow ? 'bg-gold-500' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${selectedLayer.shadow ? 'left-5.5' : 'left-0.5'}`} />
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-white/5 pt-2">
                                <span className="text-sm text-gray-300">Maiúsculas</span>
                                <input 
                                  type="checkbox"
                                  checked={selectedLayer.uppercase || false}
                                  onChange={(e) => onUpdateLayer(selectedLayer.id, { uppercase: e.target.checked })}
                                  className="accent-gold-500 w-4 h-4"
                                />
                            </div>
                        </div>
                    </div>
                     
                    <div>
                        <label className="text-xs text-gray-500 mb-2 block">Cor</label>
                        <div className="flex gap-2 mb-4">
                          {['#FFFFFF', '#000000', '#C5A059', '#D4AF37', '#E5E5E5'].map(c => (
                            <button
                              key={c}
                              onClick={() => onUpdateLayer(selectedLayer.id, { color: c })}
                              className={`w-8 h-8 rounded-full border border-white/20 ${selectedLayer.color === c ? 'ring-2 ring-white' : ''}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-2 block">Opacidade</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={(selectedLayer.opacity ?? 1) * 100}
                                onChange={(e) => onUpdateLayer(selectedLayer.id, { opacity: Number(e.target.value) / 100 })}
                                className="w-full accent-gold-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs text-gray-400 w-8 text-right">
                                {Math.round((selectedLayer.opacity ?? 1) * 100)}%
                            </span>
                        </div>
                    </div>
                  </div>
               </div>
             ) : (
               <div className="space-y-6 animate-in fade-in">
                  <h3 className="text-gold-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Canvas / Fundo
                  </h3>
                  
                  <div className="p-4 border border-white/5 rounded-lg bg-white/5">
                    <label className="text-xs text-gray-500 mb-3 block">Cor de Fundo</label>
                    
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {PRESET_BG_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => onChangeBackgroundColor(color)}
                          className={`h-8 rounded-md border transition-all ${backgroundColor === color ? 'border-white scale-110 shadow-lg' : 'border-white/10 hover:border-white/30'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-gray-500">HEX</span>
                      <input 
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => onChangeBackgroundColor(e.target.value)}
                        className="w-full bg-obsidian-950 border border-white/10 rounded p-2 pl-10 text-sm font-mono text-white focus:border-gold-500 focus:outline-none select-text cursor-text"
                      />
                      <div 
                        className="absolute right-2 top-2 w-5 h-5 rounded border border-white/20"
                        style={{ backgroundColor: backgroundColor }}
                      />
                    </div>
                    
                    <p className="text-[10px] text-gray-500 mt-4 italic">
                      Dica: Selecione um elemento na tela para editar suas propriedades específicas.
                      <br/><br/>
                      Teclas de Atalho:<br/>
                      Setas: Mover 1px<br/>
                      Delete: Remover Camada
                    </p>
                  </div>
               </div>
             )}

             <div className="pt-6 border-t border-white/10">
                <button 
                  onClick={onAddLayer}
                  className="w-full border border-dashed border-white/30 py-3 rounded text-gray-400 hover:text-white hover:border-white transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Adicionar Texto
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Footer / Download */}
      <div className="p-6 border-t border-white/10 bg-obsidian-900 grid grid-cols-[1fr_auto] gap-2">
        <button 
          onClick={onDownload}
          className="bg-gradient-to-r from-gold-600 to-gold-400 text-black py-4 rounded font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Exportar
        </button>
        <button
            onClick={onShare}
            className="bg-white/10 text-white px-4 rounded hover:bg-white/20 transition-colors flex items-center justify-center"
            title="Compartilhar Criativo"
        >
            <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;