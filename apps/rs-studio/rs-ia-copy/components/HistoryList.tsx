import React from 'react';
import { Clock, ArrowRight, Trash2, Facebook, Instagram, Linkedin } from 'lucide-react';
import { GeneratedContent, Platform } from '../types';

interface HistoryListProps {
  history: GeneratedContent[];
  onSelect: (item: GeneratedContent) => void;
  onClear: () => void;
}

const PlatformIcon = ({ platform }: { platform: Platform }) => {
  switch (platform) {
    case 'facebook': return <Facebook className="w-3 h-3 text-[#1877F2]" />;
    case 'instagram': return <Instagram className="w-3 h-3 text-pink-500" />;
    case 'linkedin': return <Linkedin className="w-3 h-3 text-[#0A66C2]" />;
    default: return null;
  }
};

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 animate-fade-in">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-amber-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Histórico Recente
        </h3>
        <button 
          onClick={onClear}
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Limpar
        </button>
      </div>

      <div className="grid gap-3">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 p-4 rounded-lg cursor-pointer transition-all hover:bg-zinc-800/50"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <PlatformIcon platform={item.platform} />
                   <p className="text-zinc-200 font-medium truncate text-sm">
                      {item.topic || "Post Gerado por Áudio"}
                   </p>
                </div>
                <p className="text-zinc-500 text-xs truncate">
                  {item.text.substring(0, 60)}...
                </p>
              </div>
              <div className="ml-4 flex flex-col items-end gap-1">
                {item.viralScore && (
                    <span className={`text-[10px] font-bold px-1.5 rounded ${item.viralScore > 80 ? 'text-green-400 bg-green-900/20' : 'text-amber-400 bg-amber-900/20'}`}>
                        {item.viralScore}/100
                    </span>
                )}
                <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-amber-500 transition-colors mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;