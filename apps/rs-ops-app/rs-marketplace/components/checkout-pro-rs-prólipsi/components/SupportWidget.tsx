
import React from 'react';
import { MessageCircle } from 'lucide-react';

export const SupportWidget: React.FC = () => {
  const handleClick = () => {
    window.open('https://wa.me/5511999999999?text=Olá, preciso de ajuda com o checkout da RS Prólipsi.', '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Tooltip */}
      <div className="bg-white text-rs-dark text-[10px] font-bold py-1 px-3 rounded-lg shadow-lg mb-1 animate-bounce origin-bottom-right">
        Precisa de ajuda?
      </div>
      
      <button
        onClick={handleClick}
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all hover:scale-110 active:scale-95"
      >
        <MessageCircle className="w-7 h-7 text-white fill-white" />
        
        {/* Pulse Effect */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-30 animate-ping"></span>
      </button>
    </div>
  );
};
