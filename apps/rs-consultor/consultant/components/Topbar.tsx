import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import type { User, SystemMessage } from '../../types';
import { IconMenu, IconSettings, IconLogOut, IconBell, IconStore } from '../../components/icons';
import { useUser } from '../ConsultantLayout';
import Modal from '../../components/Modal';

interface TopbarProps {
  user: User;
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  isSidebarCollapsed: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ user, onMenuClick, onToggleCollapse }) => {
  const { messages, markMessageAsRead, logout } = useUser();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<SystemMessage | null>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = messages.filter(m => !m.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (message: SystemMessage) => {
    setSelectedNotification(message);
    if (!message.read) {
      markMessageAsRead(message.id);
    }
    setNotificationsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const menuButtonClasses = "text-brand-text-dim hover:text-white p-2 rounded-md hover:bg-brand-gray-light transition-colors";

  return (
    <>
      <header className="bg-brand-gray h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 shadow-md border-b border-brand-gray-light">
        {/* Left: Logo & Menu Button */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Menu Button (toggles sidebar collapse) */}
          <button
            aria-label="Recolher menu"
            onClick={onToggleCollapse}
            className={`${menuButtonClasses} hidden md:flex`}
          >
            <IconMenu className="h-6 w-6" />
          </button>
          {/* Mobile Menu Button (toggles slide-out menu) */}
          <button
            aria-label="Abrir menu"
            onClick={onMenuClick}
            className={`${menuButtonClasses} md:hidden`}
          >
            <IconMenu className="h-6 w-6" />
          </button>
        </div>

        {/* Center: Main App Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <svg aria-label="RS Prólipsi Logo" role="img" height="28" viewBox="0 0 250 40" xmlns="http://www.w3.org/2000/svg" className="text-brand-gold">
            <text x="0" y="35" fontFamily="Inter, sans-serif" fontSize="38" fontWeight="800" fill="currentColor" letterSpacing="-2">
              RS Prólipsi
            </text>
          </svg>
        </div>

        {/* Right: User Menu & Notifications */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* RS Shop Link */}
          <a href={`http://${window.location.hostname}:3003`} target="_blank" rel="noopener noreferrer" className={`${menuButtonClasses} flex items-center gap-1`}>
            <IconStore size={22} />
            <span className="hidden sm:inline">Shop</span>
          </a>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="relative text-brand-text-dim hover:text-white p-2 rounded-full hover:bg-brand-gray-light">
              <IconBell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] items-center justify-center">{unreadCount}</span>
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-brand-gray border border-brand-gray-light rounded-lg shadow-2xl z-20 animate-fade-in-down overflow-hidden">
                <div className="p-3 font-semibold text-white border-b border-brand-gray-light">Notificações</div>
                <div className="max-h-80 overflow-y-auto">
                  {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} onClick={() => handleNotificationClick(msg)} className="flex items-start p-3 hover:bg-brand-gray-light cursor-pointer border-b border-brand-gray-light last:border-b-0">
                      {!msg.read && <div className="h-2 w-2 rounded-full bg-brand-gold mt-1.5 mr-3 flex-shrink-0"></div>}
                      <div className={`flex-1 ${msg.read ? 'pl-5' : ''}`}>
                        <p className="text-sm font-semibold text-white">{msg.title}</p>
                        <p className="text-xs text-brand-text-dim truncate">{msg.content}</p>
                        <p className="text-xs text-brand-text-dim/50 mt-1">{msg.date}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="p-4 text-center text-sm text-brand-text-dim">Nenhuma notificação.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-semibold text-brand-text-light text-sm leading-tight">{user.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {/* Exibe Login se existir e não for um UUID longo */}
                  {user.idConsultor && user.idConsultor.length < 20 && user.idConsultor !== 'RS-PRO-001' && (
                    <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-1.5 py-0.5 rounded border border-brand-gold/20">
                      {user.idConsultor}
                    </span>
                  )}
                  {/* Exibe sempre o ID curto (UID) */}
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
                    #{user.id ? user.id.split('-')[0].toUpperCase() : '---'}
                  </span>
                </div>
              </div>
              <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full border-2 border-brand-gold/50 object-cover" />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-brand-gray border border-brand-gray-light rounded-lg shadow-2xl z-20 py-1 animate-fade-in-down">
                <NavLink to="/consultant/configuracoes" onClick={() => setProfileMenuOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-brand-text-dim hover:bg-brand-gray-light hover:text-white">
                  <IconSettings className="mr-3 h-5 w-5" />
                  Configurações
                </NavLink>
                <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-brand-text-dim hover:bg-brand-gray-light hover:text-white">
                  <IconLogOut className="mr-3 h-5 w-5" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <Modal isOpen={!!selectedNotification} onClose={() => setSelectedNotification(null)} title={selectedNotification?.title || ''}>
        {selectedNotification && (
          <div className="space-y-4">
            <p className="text-sm text-brand-text-dim">{selectedNotification.date}</p>
            <p className="text-brand-text-light whitespace-pre-wrap">{selectedNotification.content}</p>
          </div>
        )}
      </Modal>
      <style>{`
        @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
    `}</style>
    </>
  );
};

export default Topbar;