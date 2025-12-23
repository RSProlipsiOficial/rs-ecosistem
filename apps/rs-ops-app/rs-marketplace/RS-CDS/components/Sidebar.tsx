

import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut, Bot, PieChart, History, X, Shield, Menu } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const menuItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'DASHBOARD', label: 'Painel', icon: <LayoutDashboard size={20} /> },
    { id: 'PEDIDOS', label: 'Gestão Pedidos', icon: <ShoppingBag size={20} /> },
    { id: 'HISTORICO', label: 'Histórico', icon: <History size={20} /> },
    { id: 'ESTOQUE', label: 'Estoque CD', icon: <Package size={20} /> },
    { id: 'FINANCEIRO', label: 'Financeiro', icon: <PieChart size={20} /> },
    { id: 'IA_ADVISOR', label: 'RS-IA', icon: <Bot size={20} /> },
    { id: 'CONFIGURACOES', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Overlay Escuro para Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-dark-950 border-r border-dark-800 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          ${isCollapsed ? 'w-64 md:w-20' : 'w-64 md:w-64'}
        `}
      >
        <div className="p-6 flex justify-between items-start">
          <div className={isCollapsed ? 'hidden md:hidden' : ''}>
            <h1 className="text-xl font-bold text-gold-400 tracking-tight">RS Prólipsi</h1>
            <p className="text-xs text-gray-500 mt-1">Gestão de CD v2.0</p>
          </div>
          {isCollapsed && <div className="hidden md:block w-full text-center"><span className="text-2xl font-bold text-gold-400">RS</span></div>}
          {/* Botão Fechar (Apenas Mobile) */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-white"
            aria-label="Fechar menu"
            title="Fechar menu"
          >
            <X size={24} />
          </button>
          {/* Botão Colapsar (Apenas Desktop) */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:block text-gray-500 hover:text-gold-400 transition-colors"
            title={isCollapsed ? 'Expandir menu' : 'Colapsar menu'}
            aria-label={isCollapsed ? 'Expandir menu lateral' : 'Colapsar menu lateral'}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${currentView === item.id
                ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20'
                : 'text-gray-400 hover:text-white hover:bg-dark-800'
                } ${isCollapsed ? 'md:justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Botão Administrador Master (Separado do menu comum) */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setView('HEADQUARTERS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 border ${currentView === 'HEADQUARTERS'
              ? 'bg-red-900/30 text-red-500 border-red-800 shadow-lg shadow-red-900/20'
              : 'bg-dark-900 border-dark-800 text-gray-400 hover:text-white hover:border-gray-600'
              } ${isCollapsed ? 'md:justify-center' : ''}`}
            title={isCollapsed ? 'Administrador' : ''}
          >
            <Shield size={20} />
            {!isCollapsed && <span>Administrador</span>}
          </button>
        </div>

        <div className="p-4 border-t border-dark-800">
          <button className={`w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 text-sm font-medium transition-colors rounded-lg hover:bg-dark-800 ${isCollapsed ? 'md:justify-center' : ''
            }`} title={isCollapsed ? 'Sair do Sistema' : ''}>
            <LogOut size={20} />
            {!isCollapsed && <span>Sair do Sistema</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
