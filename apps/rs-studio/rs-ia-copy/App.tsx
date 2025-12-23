import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ResultDisplay from './components/ResultDisplay';
import HistoryList from './components/HistoryList';
import { generateSocialCopy, refineCopy } from './services/gemini';
import { GeneratedContent, GenerationStatus, Platform, CopyFramework, EmojiLevel, PostObjective } from './types';
import { AlertCircle, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [isRefining, setIsRefining] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('rsia_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  const saveToHistory = (newItem: GeneratedContent) => {
    // NOTE: We do NOT save the full base64 image to history/localStorage 
    // to avoid hitting storage limits (usually 5MB). 
    // We save the content without the image data for history purposes.
    const historyItem = { ...newItem, uploadedImage: undefined };
    
    const updated = [historyItem, ...history].slice(0, 10); // Keep last 10
    setHistory(updated);
    localStorage.setItem('rsia_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('rsia_history');
  };

  const handleGenerate = async (
      topic: string, 
      tone: string, 
      platform: Platform, 
      framework: CopyFramework,
      objective: PostObjective,
      emojiLevel: EmojiLevel,
      targetUrl: string, 
      audioBase64?: string, 
      audioMimeType?: string,
      imageBase64?: string,
      imageMimeType?: string
    ) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setResult(null);

    try {
      // Returns { text, imageIdea, viralScore }
      const { text, imageIdea, viralScore } = await generateSocialCopy(
          topic, tone, platform, framework, objective, emojiLevel, targetUrl, audioBase64, audioMimeType, imageBase64, imageMimeType
      );
      
      const newItem: GeneratedContent = {
        id: crypto.randomUUID(),
        text,
        imageIdea,
        targetUrl,
        timestamp: Date.now(),
        topic: topic || (imageBase64 ? 'Análise de Imagem' : 'Postagem de Áudio'),
        tone,
        platform,
        framework,
        viralScore,
        uploadedImage: imageBase64 // Store temporarily for current view
      };

      setResult(newItem);
      saveToHistory(newItem);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Algo deu errado. Tente novamente.");
      setStatus(GenerationStatus.ERROR);
    }
  };
  
  const handleRefine = async (instruction: string) => {
    if (!result) return;
    setIsRefining(true);
    try {
        const newText = await refineCopy(result.text, instruction);
        const updatedResult = { ...result, text: newText };
        setResult(updatedResult);
        // Optional: Update history with refined version or create new entry
    } catch (e) {
        console.error("Failed to refine");
    } finally {
        setIsRefining(false);
    }
  };

  const handleHistorySelect = (item: GeneratedContent) => {
    setResult(item);
    setStatus(GenerationStatus.SUCCESS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center gap-6">
        <div className="text-center max-w-xl mx-auto mb-2">
          <h2 className="text-3xl md:text-4xl font-serif text-amber-100 mb-3 tracking-tight">
            Crie Conteúdo <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">Lendário</span>
          </h2>
          <p className="text-zinc-400 text-sm md:text-base font-light">
            A IA que transforma ideias em posts virais. 
            Use voz, <strong>imagens</strong>, templates ou links.
          </p>
        </div>

        <PromptInput onGenerate={handleGenerate} isLoading={status === GenerationStatus.LOADING} />

        {/* Loading Skeleton */}
        {status === GenerationStatus.LOADING && (
          <div className="w-full max-w-2xl mt-8 animate-pulse space-y-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-center">
                <div className="h-4 bg-zinc-800 rounded w-24"></div>
                <div className="h-4 bg-zinc-800 rounded w-16"></div>
            </div>
            <div className="h-4 bg-amber-900/20 rounded w-3/4"></div>
            <div className="h-4 bg-zinc-800 rounded w-full"></div>
            <div className="h-4 bg-zinc-800 rounded w-full"></div>
            <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
            <div className="h-12 bg-zinc-800 rounded w-full mt-4"></div>
            <div className="flex justify-center gap-2 mt-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                <span className="text-amber-500 text-sm font-bold uppercase tracking-widest">A IA está utilizando o framework escolhido...</span>
            </div>
          </div>
        )}

        {status === GenerationStatus.ERROR && (
          <div className="w-full max-w-2xl p-4 bg-red-950/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-300 animate-fade-in mt-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {status === GenerationStatus.SUCCESS && result && (
          <ResultDisplay 
            content={result} 
            onRefine={handleRefine} 
            isRefining={isRefining}
          />
        )}

        <HistoryList 
          history={history} 
          onSelect={handleHistorySelect} 
          onClear={clearHistory}
        />

      </main>
      
      <footer className="w-full py-8 text-center border-t border-zinc-900 mt-12 bg-zinc-950">
        <p className="text-zinc-600 text-xs uppercase tracking-widest">&copy; {new Date().getFullYear()} RS-IA-Copy Suite</p>
      </footer>
    </div>
  );
};

export default App;