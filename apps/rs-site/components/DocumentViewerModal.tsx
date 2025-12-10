

import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface DocumentViewerModalProps {
  title: string;
  pages: string[];
  onClose: () => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ title, pages, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === pages.length - 1 ? prev : prev + 1));
  }, [pages.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'auto';
    };
  }, [nextSlide, prevSlide, onClose]);

  const handleDownload = async () => {
    try {
      const imageUrl = pages[currentIndex];
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const filename = `${title.replace(/\s+/g, '_')}_page_${currentIndex + 1}.${blob.type.split('/')[1] || 'jpg'}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
      alert(t('doc_viewer_download_error'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex flex-col p-2 sm:p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="document-viewer-title">
      <header className="flex-shrink-0 flex justify-between items-center text-text-primary p-2">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Voltar">
            <ArrowLeftIcon />
          </button>
          <h2 id="document-viewer-title" className="text-lg sm:text-xl font-semibold truncate">{title}</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm sm:text-lg font-mono">{currentIndex + 1} / {pages.length}</span>
          <button onClick={handleDownload} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Baixar página atual">
            <DownloadIcon />
          </button>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center relative overflow-hidden">
        <button onClick={prevSlide} disabled={currentIndex === 0} className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-accent/80 transition-all z-10 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Página anterior">
          <ChevronLeftIcon />
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-full h-full flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {pages.map((pageUrl, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0 flex items-center justify-center p-2 sm:p-4">
                        <img src={pageUrl} alt={`Página ${index + 1} de ${title}`} className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
                    </div>
                ))}
            </div>
        </div>
        
        <button onClick={nextSlide} disabled={currentIndex === pages.length - 1} className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-accent/80 transition-all z-10 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Próxima página">
          <ChevronRightIcon />
        </button>
      </main>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

// SVG Icons
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

export default DocumentViewerModal;