import React, { useState, useRef, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import EditorCanvas from './components/EditorCanvas';
import { AD_FORMATS, INITIAL_LAYERS } from './constants';
import { AdFormat, TextLayer } from './types';
import { generateImage, generateCopy, enhancePrompt } from './services/geminiService';

declare global {
  interface Window {
    html2canvas: any;
  }
}

const App: React.FC = () => {
  const [format, setFormat] = useState<AdFormat>(AD_FORMATS[0]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>('#241e0b'); // Default Dark Gold
  const [layers, setLayers] = useState<TextLayer[]>(INITIAL_LAYERS);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleFormatChange = (newFormat: AdFormat) => {
    setFormat(newFormat);
  };

  const handleGenerateImage = async (prompt: string) => {
    try {
      setIsGeneratingImage(true);
      const base64Image = await generateImage(prompt, format.aspectRatio);
      setBackgroundImage(base64Image);
    } catch (error) {
      console.error("Failed to generate image", error);
      alert("Erro ao gerar imagem. Verifique se a API Key está configurada.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleEnhancePrompt = async (currentPrompt: string): Promise<string> => {
    try {
        setIsEnhancingPrompt(true);
        const enhanced = await enhancePrompt(currentPrompt);
        return enhanced;
    } catch (error) {
        console.error("Failed to enhance prompt", error);
        return currentPrompt;
    } finally {
        setIsEnhancingPrompt(false);
    }
  };

  const handleGenerateCopy = async (context: string, useImageContext: boolean) => {
    try {
      setIsGeneratingCopy(true);
      // Pass background image only if check is true and image exists
      const imageToAnalyze = (useImageContext && backgroundImage) ? backgroundImage : undefined;
      
      const copy = await generateCopy(context, imageToAnalyze);
      
      const newLayers = layers.map(layer => {
        if (layer.type === 'headline') return { ...layer, text: copy.headline };
        if (layer.type === 'body') return { ...layer, text: copy.body };
        if (layer.type === 'cta') return { ...layer, text: copy.cta };
        return layer;
      });
      
      setLayers(newLayers);
    } catch (error) {
      console.error("Failed to generate copy", error);
      alert("Erro ao gerar texto.");
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setBackgroundImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const updateLayer = (id: string, updates: Partial<TextLayer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const addLayer = () => {
    const newId = `text-${Date.now()}`;
    const newLayer: TextLayer = {
      id: newId,
      text: 'Novo Texto',
      x: format.width / 2 - 100,
      y: format.height / 2,
      fontSize: 32,
      fontFamily: 'Inter',
      fontWeight: 400,
      color: '#FFFFFF',
      align: 'center',
      type: 'body',
      opacity: 1,
      letterSpacing: 0,
      shadow: false,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newId);
  };

  // Layer ordering functions
  const moveLayerForward = (id: string) => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === id);
      if (index === -1 || index === prev.length - 1) return prev;
      const newLayers = [...prev];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      return newLayers;
    });
  };

  const moveLayerBackward = (id: string) => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === id);
      if (index === -1 || index === 0) return prev;
      const newLayers = [...prev];
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      return newLayers;
    });
  };

  const handleDownload = useCallback(async () => {
    if (canvasRef.current && window.html2canvas) {
      const currentSelection = selectedLayerId;
      setSelectedLayerId(null);
      
      setTimeout(async () => {
        try {
          const canvas = await window.html2canvas(canvasRef.current, {
            scale: 2, 
            useCORS: true,
            backgroundColor: null, 
          });
          
          const link = document.createElement('a');
          link.download = `rs-ia-creative-${format.id}-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        } catch (err) {
          console.error("Export failed", err);
          alert("Falha na exportação.");
        } finally {
          setSelectedLayerId(currentSelection);
        }
      }, 100);
    }
  }, [selectedLayerId, format.id]);

  const handleShare = useCallback(async () => {
    if (canvasRef.current && window.html2canvas) {
        const currentSelection = selectedLayerId;
        setSelectedLayerId(null);

        setTimeout(async () => {
            try {
                const canvas = await window.html2canvas(canvasRef.current, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: null,
                });

                canvas.toBlob(async (blob: Blob | null) => {
                    if (!blob) return;
                    
                    if (navigator.share) {
                        const file = new File([blob], `creative-${Date.now()}.png`, { type: 'image/png' });
                        try {
                            await navigator.share({
                                title: 'RS-IA Creative',
                                text: 'Confira este criativo gerado com RS-IA Editor.',
                                files: [file]
                            });
                        } catch (e) {
                            console.log('Share canceled or failed', e);
                        }
                    } else {
                        alert("Compartilhamento nativo não suportado neste navegador. Use a opção de Download.");
                    }
                }, 'image/png');

            } catch (err) {
                console.error("Share failed", err);
            } finally {
                setSelectedLayerId(currentSelection);
            }
        }, 100);
    }
  }, [selectedLayerId, format.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (selectedLayerId) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          deleteLayer(selectedLayerId);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          updateLayer(selectedLayerId, { y: layers.find(l => l.id === selectedLayerId)!.y - 1 });
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          updateLayer(selectedLayerId, { y: layers.find(l => l.id === selectedLayerId)!.y + 1 });
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          updateLayer(selectedLayerId, { x: layers.find(l => l.id === selectedLayerId)!.x - 1 });
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          updateLayer(selectedLayerId, { x: layers.find(l => l.id === selectedLayerId)!.x + 1 });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, layers]);

  const selectedLayer = layers.find(l => l.id === selectedLayerId) || null;

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden">
      <Sidebar 
        currentFormat={format}
        onFormatChange={handleFormatChange}
        onGenerateImage={handleGenerateImage}
        onEnhancePrompt={handleEnhancePrompt}
        onGenerateCopy={handleGenerateCopy}
        onUploadImage={handleUploadImage}
        isGeneratingImage={isGeneratingImage}
        isEnhancingPrompt={isEnhancingPrompt}
        isGeneratingCopy={isGeneratingCopy}
        selectedLayer={selectedLayer}
        onUpdateLayer={updateLayer}
        onDeleteLayer={deleteLayer}
        onAddLayer={addLayer}
        onDownload={handleDownload}
        onShare={handleShare}
        backgroundColor={backgroundColor}
        onChangeBackgroundColor={setBackgroundColor}
        onMoveLayerForward={() => selectedLayerId && moveLayerForward(selectedLayerId)}
        onMoveLayerBackward={() => selectedLayerId && moveLayerBackward(selectedLayerId)}
        backgroundImage={backgroundImage}
      />
      
      <EditorCanvas 
        format={format}
        backgroundImage={backgroundImage}
        layers={layers}
        selectedLayerId={selectedLayerId}
        onUpdateLayer={updateLayer}
        onSelectLayer={setSelectedLayerId}
        canvasRef={canvasRef}
        backgroundColor={backgroundColor}
      />
    </div>
  );
};

export default App;