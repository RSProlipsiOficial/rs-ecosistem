import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Facebook, ExternalLink, Eye, Wand2, Plus, Minus, Smile, TrendingUp } from 'lucide-react';
import { GeneratedContent } from '../types';
import FacebookPreview from './FacebookPreview';

interface ResultDisplayProps {
  content: GeneratedContent;
  onRefine?: (instruction: string) => void;
  isRefining?: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content, onRefine, isRefining }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Post para Redes Sociais',
          text: content.text,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard();
      alert('Conteúdo copiado! Agora você pode colar onde quiser.');
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(content.text)}`;
    window.open(url, '_blank');
  };

  const openFacebook = () => {
    copyToClipboard();
    setTimeout(() => {
        window.open('https://facebook.com', '_blank');
    }, 100);
  };
  
  const openFacebookGroups = () => {
      copyToClipboard();
      setTimeout(() => {
          window.open('https://www.facebook.com/groups/feed/', '_blank');
      }, 100);
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 border-green-500';
    if (score >= 70) return 'text-amber-400 border-amber-500';
    return 'text-red-400 border-red-500';
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-fade-in-up space-y-6">
      
      {/* Viral Score & Preview Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest">
            <Eye className="w-4 h-4" />
            <span>Simulação do Post</span>
        </div>

        {content.viralScore && (
           <div className="flex items-center gap-2 animate-fade-in">
               <span className="text-zinc-400 text-[10px] uppercase font-bold">Potencial Viral:</span>
               <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm bg-zinc-900 ${getScoreColor(content.viralScore)}`}>
                   {content.viralScore}
               </div>
           </div>
        )}
      </div>

      {/* Facebook Mockup Preview */}
      <FacebookPreview content={content} />
      
      {/* Refinement Tools */}
      {onRefine && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 animate-fade-in">
           <button 
             disabled={isRefining}
             onClick={() => onRefine("Resuma este texto, deixando-o mais curto e direto.")}
             className="flex flex-col items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all disabled:opacity-50"
           >
               <Minus className="w-4 h-4 text-amber-500 mb-1" />
               <span className="text-[10px] uppercase font-bold text-zinc-400">Encurtar</span>
           </button>
           <button 
             disabled={isRefining}
             onClick={() => onRefine("Expanda este texto, adicionando mais detalhes e emoção.")}
             className="flex flex-col items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all disabled:opacity-50"
           >
               <Plus className="w-4 h-4 text-amber-500 mb-1" />
               <span className="text-[10px] uppercase font-bold text-zinc-400">Expandir</span>
           </button>
           <button 
             disabled={isRefining}
             onClick={() => onRefine("Adicione mais emojis relevantes ao longo do texto para deixá-lo mais visual.")}
             className="flex flex-col items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all disabled:opacity-50"
           >
               <Smile className="w-4 h-4 text-amber-500 mb-1" />
               <span className="text-[10px] uppercase font-bold text-zinc-400">+ Emojis</span>
           </button>
           <button 
             disabled={isRefining}
             onClick={() => onRefine("Torne o tom mais persuasivo e focado em vendas.")}
             className="flex flex-col items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all disabled:opacity-50"
           >
               <Wand2 className="w-4 h-4 text-amber-500 mb-1" />
               <span className="text-[10px] uppercase font-bold text-zinc-400">Refazer</span>
           </button>
        </div>
      )}
      
      {isRefining && (
          <div className="text-center py-2">
              <span className="text-amber-500 text-xs font-bold animate-pulse">Refinando sua copy...</span>
          </div>
      )}

      {/* Main Text Content (Raw) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Toolbar */}
        <div className="bg-zinc-950/50 border-b border-zinc-800 p-4 flex justify-between items-center">
          <span className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Texto Puro (Para Copiar)</span>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "COPIADO" : "COPIAR TEXTO"}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 whitespace-pre-wrap text-zinc-200 leading-relaxed font-medium text-lg font-mono text-sm bg-black/20">
          {content.text}
        </div>

        {/* Action Buttons Footer */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-3">
          
          <button 
             onClick={openFacebook}
             className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white py-3 px-4 rounded-lg font-bold transition-all shadow-lg"
          >
            <Facebook className="w-5 h-5" />
            <span>Copiar e Abrir FB</span>
          </button>

          <button 
             onClick={openFacebookGroups}
             className="flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-lg border border-zinc-600"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Postar em Grupo</span>
          </button>

          <button 
             onClick={shareToWhatsApp}
             className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#22bf5b] text-white py-3 px-4 rounded-lg font-bold transition-all shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button 
             onClick={handleShare}
             className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 py-3 px-4 rounded-lg font-bold transition-all shadow-lg"
          >
            <Share2 className="w-5 h-5" />
            <span>Mais Opções</span>
          </button>
        </div>
        
        <div className="px-4 py-2 bg-zinc-950 text-center">
            <p className="text-[10px] text-zinc-500">
                *Para o Facebook, o texto é copiado automaticamente ao clicar nos botões. Basta clicar em "Colar" quando o Facebook abrir.
            </p>
        </div>
      </div>

    </div>
  );
};

export default ResultDisplay;