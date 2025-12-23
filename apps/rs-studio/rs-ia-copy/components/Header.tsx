import React from 'react';
import { Sparkles, Feather } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-8 flex flex-col items-center justify-center border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="flex items-center gap-3 mb-2">
        <Feather className="w-8 h-8 text-amber-500" />
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700 tracking-wider">
          RS-IA-COPY
        </h1>
        <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
      </div>
      <p className="text-zinc-500 text-sm md:text-base tracking-[0.2em] uppercase mt-2">
        Estúdio de Criação Digital
      </p>
    </header>
  );
};

export default Header;