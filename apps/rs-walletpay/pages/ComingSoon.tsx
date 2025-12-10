
import React from 'react';

interface ComingSoonProps {
  title: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-card p-8 rounded-2xl border border-border">
      <div className="p-4 bg-surface rounded-full text-gold mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 12c0-5.25-4.25-9.5-9.5-9.5S2.5 6.75 2.5 12s4.25 9.5 9.5 9.5"></path><path d="M12 8v4l2 2"></path><path d="m16 22-4-4"></path></svg>
      </div>
      <h1 className="text-3xl font-bold text-text-title mb-2">{title}</h1>
      <p className="text-lg text-text-body max-w-md">
        Esta funcionalidade está em desenvolvimento e será lançada em breve. Estamos trabalhando para trazer a melhor experiência para você.
      </p>
    </div>
  );
};

export default ComingSoon;
