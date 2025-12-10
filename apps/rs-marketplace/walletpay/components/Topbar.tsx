import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import ComingSoonModal from './ComingSoonModal';

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.split('/').filter(p => p && p !== 'app')[0];
  const breadcrumb = path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Dashboard';

  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setProfileMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleNavigation = (path: string) => {
      setProfileMenuOpen(false);
      navigate(path);
  }

  const handleComingSoon = (feature: string) => {
      setComingSoonFeature(feature);
      setProfileMenuOpen(false);
  };

  return (
    <>
      <header className="flex-shrink-0 bg-card border-b border-border h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-text-body hover:text-text-title mr-4"
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-text-title">{breadcrumb}</h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-body" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all"
            />
          </div>

          {/* Avatar */}
          <div className="relative" ref={profileMenuRef}>
            <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-gold transition">
              <img src="https://picsum.photos/100/100" alt="Avatar" className="w-full h-full object-cover" />
            </button>
            {isProfileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-card border border-border ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                        <button onClick={() => handleNavigation('/app/dashboard')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-body hover:bg-surface hover:text-text-title transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            Ver Perfil
                        </button>
                         <button onClick={() => handleNavigation('/app/settings')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-body hover:bg-surface hover:text-text-title transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            Configurações
                        </button>
                        <button onClick={() => handleComingSoon('Sair')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-body hover:bg-surface hover:text-text-title transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            Sair
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </header>
      <ComingSoonModal isOpen={!!comingSoonFeature} onClose={() => setComingSoonFeature(null)} featureName={comingSoonFeature || ''} />
    </>
  );
};

export default Topbar;
