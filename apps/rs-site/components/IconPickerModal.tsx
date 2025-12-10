import React, { useState, useMemo, useRef, useEffect } from 'react';
import { icons, iconCategories, IconData } from '../config/icons';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIconSelect: (svg: string) => void;
}

const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onIconSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const filteredIcons = useMemo(() => {
    return icons.filter(icon => {
      const matchesCategory = selectedCategory === 'All' || icon.category === selectedCategory;
      const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleIconClick = (icon: IconData) => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 1.2em; height: 1.2em; display: inline-block; vertical-align: middle; transform: translateY(-0.1em);">${icon.svg}</svg>`;
    onIconSelect(svgString);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        <header className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-bold text-accent">Select an Icon</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        
        <div className="p-4 border-b border-border flex-shrink-0 flex items-center gap-4">
          <div className="relative flex-grow">
            <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 pl-10 text-text-primary focus:ring-accent focus:border-accent"
                autoFocus
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </div>
          </div>
          <div className="relative" ref={categoryRef}>
            <button onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="flex items-center justify-between w-48 bg-gray-800 border border-gray-600 rounded-md p-2 text-text-primary hover:bg-gray-700">
              <span className="truncate">{selectedCategory}</span>
              <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCategoryOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-20 overflow-hidden max-h-60 overflow-y-auto">
                {iconCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-none transition-colors ${ selectedCategory === category ? 'bg-accent text-button-text' : 'text-text-primary hover:bg-surface'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <main className="flex-grow p-4 overflow-y-auto">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {filteredIcons.map(icon => (
              <button
                key={icon.name}
                title={icon.name}
                onClick={() => handleIconClick(icon)}
                className="aspect-square bg-gray-800 rounded-md flex flex-col items-center justify-center p-2 text-text-primary hover:bg-accent hover:text-button-text transition-all group focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                <span className="text-xs mt-2 truncate max-w-full text-text-secondary group-hover:text-button-text">{icon.name}</span>
              </button>
            ))}
            {filteredIcons.length === 0 && (
              <p className="col-span-full text-center text-text-secondary mt-8">No icons found.</p>
            )}
          </div>
        </main>
      </div>
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

const Icon: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        {children}
    </svg>
);
const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></Icon>;

export default IconPickerModal;