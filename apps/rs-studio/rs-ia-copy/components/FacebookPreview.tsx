import React from 'react';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Globe, ImageIcon } from 'lucide-react';
import { GeneratedContent } from '../types';

interface FacebookPreviewProps {
  content: GeneratedContent;
}

const FacebookPreview: React.FC<FacebookPreviewProps> = ({ content }) => {
  return (
    <div className="w-full bg-[#242526] rounded-xl border border-zinc-800 shadow-2xl overflow-hidden font-sans mb-6">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-700 flex items-center justify-center text-white font-bold text-sm">
            VC
          </div>
          <div>
            <h4 className="text-[#E4E6EB] font-semibold text-[15px] leading-tight">Você / Sua Página</h4>
            <div className="flex items-center gap-1 text-[#B0B3B8] text-[13px]">
              <span>Agora mesmo</span>
              <span>•</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>
        <MoreHorizontal className="text-[#B0B3B8] w-5 h-5" />
      </div>

      {/* Content Text */}
      <div className="px-4 pb-3 text-[#E4E6EB] text-[15px] whitespace-pre-wrap leading-normal">
        {content.text}
      </div>

      {/* Image Display: Real Upload OR AI Suggestion */}
      <div className="w-full bg-zinc-900 aspect-[4/5] or aspect-square flex flex-col items-center justify-center text-center border-y border-zinc-800 relative overflow-hidden group">
        
        {content.uploadedImage ? (
          // Show Real Image
          <div className="w-full h-full relative">
            <img 
              src={`data:image/jpeg;base64,${content.uploadedImage}`} 
              alt="Uploaded Visual" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          // Show AI Suggestion Placeholder
          <div className="w-full h-full p-8 flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-black/50" />
              <div className="relative z-10 max-w-md">
                  <div className="bg-amber-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                      <ImageIcon className="w-8 h-8 text-amber-500" />
                  </div>
                  <h5 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-2">Sugestão de Imagem IA</h5>
                  <p className="text-zinc-300 text-sm italic font-serif leading-relaxed border border-amber-500/30 p-4 rounded-lg bg-black/40 backdrop-blur-md">
                      "{content.imageIdea || 'Imagem relacionada ao tema'}"
                  </p>
              </div>
          </div>
        )}
      </div>

      {/* Link Preview (if URL exists) */}
      {content.targetUrl && (
        <div className="bg-[#3A3B3C] p-3 flex justify-between items-center border-b border-zinc-700/50">
            <span className="text-[#B0B3B8] text-xs uppercase tracking-wide truncate w-2/3">
                {content.targetUrl}
            </span>
            <span className="text-amber-500 text-xs font-bold border border-amber-500/50 px-2 py-1 rounded">SAIBA MAIS</span>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex justify-between items-center border-b border-[#3E4042]">
         <div className="flex items-center gap-1">
             <div className="bg-[#1877F2] p-1 rounded-full w-4 h-4 flex items-center justify-center">
                 <ThumbsUp className="w-2 h-2 text-white fill-current" />
             </div>
             <span className="text-[#B0B3B8] text-[13px]">99 comentários</span>
         </div>
         <span className="text-[#B0B3B8] text-[13px]">24 compartilhamentos</span>
      </div>

      {/* Footer Actions */}
      <div className="px-2 py-1 grid grid-cols-3 gap-1">
        <button className="flex items-center justify-center gap-2 py-2 hover:bg-[#3A3B3C] rounded-lg transition-colors text-[#B0B3B8] font-medium text-[14px]">
          <ThumbsUp className="w-5 h-5" />
          <span>Curtir</span>
        </button>
        <button className="flex items-center justify-center gap-2 py-2 hover:bg-[#3A3B3C] rounded-lg transition-colors text-[#B0B3B8] font-medium text-[14px]">
          <MessageCircle className="w-5 h-5" />
          <span>Comentar</span>
        </button>
        <button className="flex items-center justify-center gap-2 py-2 hover:bg-[#3A3B3C] rounded-lg transition-colors text-[#B0B3B8] font-medium text-[14px]">
          <Share2 className="w-5 h-5" />
          <span>Compartilhar</span>
        </button>
      </div>
    </div>
  );
};

export default FacebookPreview;