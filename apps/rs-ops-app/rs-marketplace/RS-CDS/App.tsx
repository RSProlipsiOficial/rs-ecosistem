

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Inventory from './components/Inventory';
import GeminiAdvisor from './components/GeminiAdvisor';
import Financial from './components/Financial';
import Settings from './components/Settings';
import SalesHistory from './components/SalesHistory';
import HeadquartersPanel from './components/HeadquartersPanel';
import { ViewState, SettingsData } from './types';
import { mockProfile, mockOrders, mockProducts, mockTransactions, mockReplenishmentOrders, mockSettings } from './services/mockData';
import { Bell, User, Menu, ArrowLeft, Home } from 'lucide-react';

interface RSCDAppProps {
  cdId?: string;
  onBackToAdmin?: () => void;
}

const App: React.FC<RSCDAppProps> = ({ cdId, onBackToAdmin }) => {
  const isEmbeddedCdAdmin = typeof window !== 'undefined' && new URL(window.location.href).searchParams.get('embed') === 'cd';
  // Estado alterado para armazenar o HISTÓRICO de visualizações, não apenas a atual
  const [viewHistory, setViewHistory] = useState<ViewState[]>(isEmbeddedCdAdmin ? ['HEADQUARTERS'] : ['DASHBOARD']);

  // A tela atual é sempre a última do histórico
  const currentView = viewHistory[viewHistory.length - 1];

  const [userProfile, setUserProfile] = useState(mockProfile);
  // Estado global para as configurações, para refletir mudanças no Header
  const [appSettings, setAppSettings] = useState<SettingsData>(mockSettings);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // CORREÇÃO DE NOTIFICAÇÃO:
  // Agora conta quantos pedidos de consultores estão com status 'PENDENTE'
  // (Ou seja, consultor comprou do CD e precisa de aprovação/separação)
  const pendingNotifications = mockOrders.filter(o => o.status === 'PENDENTE').length;

  // Função para navegar (Adiciona ao histórico)
  const handleNavigate = (view: ViewState) => {
    const shouldKeepOpen = typeof window !== 'undefined' && window.innerWidth >= 768;
    // Se clicar na mesma tela, apenas fecha o menu
    if (view === currentView) {
      setIsSidebarOpen(shouldKeepOpen);
      return;
    }

    // Se for para o Dashboard, reseta o histórico para evitar pilhas infinitas
    if (view === 'DASHBOARD') {
      setViewHistory(['DASHBOARD']);
    } else {
      setViewHistory(prev => [...prev, view]);
    }

    setIsSidebarOpen(shouldKeepOpen);
  };

  // Função para Voltar (Remove a última tela do histórico)
  const handleBack = () => {
    if (viewHistory.length > 1) {
      setViewHistory(prev => prev.slice(0, -1));
      setIsSidebarOpen(true);
    }
  };

  // Função chamada pelo componente Settings ao salvar o perfil
  const handleUpdateProfile = (newProfileData: SettingsData['profile']) => {
    // Atualiza o estado global de configurações
    setAppSettings(prev => ({
      ...prev,
      profile: newProfileData
    }));

    // Atualiza também o perfil do usuário exibido no dashboard (Nome do gerente/fantasia)
    setUserProfile(prev => ({
      ...prev,
      name: newProfileData.fantasyName || prev.name,
      managerName: newProfileData.companyName || prev.managerName,
      avatarUrl: newProfileData.avatarUrl
    }));
  };

  if (isEmbeddedCdAdmin) {
    return (
      <div className="bg-dark-950 min-h-screen text-gray-200 font-sans selection:bg-gold-500 selection:text-black">
        <main className="p-4 md:p-8">
          <HeadquartersPanel />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-dark-950 min-h-screen text-gray-200 font-sans selection:bg-gold-500 selection:text-black">
      <Sidebar
        currentView={currentView}
        setView={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 
         Ajuste de margem: ml-0 no mobile, ml-64 no desktop (md).
         Isso garante que o conteúdo use 100% da tela no celular.
      */}
      <main className={`ml-0 p-4 md:p-8 min-h-screen bg-black/40 transition-all duration-300 flex flex-col ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}>
        {/* Header Content */}
        <header className="flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-dark-800 sticky top-0 bg-dark-950/90 backdrop-blur z-30 pt-2">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Botão Hamburguer (Visível apenas Mobile) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-dark-800 rounded-lg"
              aria-label="Abrir menu lateral"
              title="Abrir menu lateral"
            >
              <Menu size={24} />
            </button>

            {/* BOTÃO VOLTAR - Só aparece se tiver histórico (length > 1) */}
            {viewHistory.length > 1 && (
              <button
                onClick={handleBack}
                className="p-2 text-gold-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors flex items-center gap-2 animate-fade-in"
                title="Voltar para página anterior"
              >
                <ArrowLeft size={24} />
                <span className="hidden sm:inline text-sm font-medium">Voltar</span>
              </button>
            )}

            {/* Breadcrumbs (Opcional) ou Título Mobile */}
            <div className="md:hidden text-sm font-bold text-gold-400 uppercase tracking-wider ml-2">
              RS Prólipsi
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md border border-gold-400/40 text-xs font-semibold text-gold-400 hover:bg-gold-400/10"
                title="Voltar ao painel do lojista"
              >
                <Home size={16} />
                Voltar ao Painel
              </button>
            )}
            <div
              className="relative cursor-pointer hover:bg-dark-800 p-2 rounded-full transition-colors"
              onClick={() => pendingNotifications > 0 && handleNavigate('PEDIDOS')}
              title={pendingNotifications > 0 ? `${pendingNotifications} novos pedidos de consultores` : "Sem novos pedidos"}
            >
              <Bell size={20} className={pendingNotifications > 0 ? "text-gray-200" : "text-gray-500"} />
              {pendingNotifications > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-dark-950 animate-pulse">
                  {pendingNotifications}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-dark-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">
                  {userProfile.managerName || appSettings.profile.companyName || 'Administrador'}
                </p>
                <p className="text-xs text-gray-500">
                  {userProfile.name !== 'CD (Não Configurado)' ? userProfile.name : 'Configurar Perfil'}
                </p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-dark-800 border border-gold-400/50 flex items-center justify-center text-gold-400 overflow-hidden">
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="animate-fade-in-up pb-10 flex-1">
          {currentView === 'DASHBOARD' && (
            <Dashboard
              profile={userProfile}
              orders={mockOrders}
              onNavigate={handleNavigate}
            />
          )}
          {currentView === 'PEDIDOS' && <Orders orders={mockOrders} onNavigate={handleNavigate} />}
          {currentView === 'ESTOQUE' && <Inventory products={mockProducts} walletBalance={userProfile.walletBalance} />}
          {currentView === 'FINANCEIRO' && <Financial profile={userProfile} transactions={mockTransactions} />}
          {currentView === 'IA_ADVISOR' && <GeminiAdvisor profile={userProfile} orders={mockOrders} products={mockProducts} />}

          {/* Passando props para o Settings atualizar o estado global */}
          {currentView === 'CONFIGURACOES' && (
            <Settings
              initialData={appSettings}
              onSaveProfile={handleUpdateProfile}
            />
          )}

          {currentView === 'HISTORICO' && <SalesHistory orders={mockOrders} />}
          {currentView === 'HEADQUARTERS' && <HeadquartersPanel />}
        </div>

        {/* Footer Info - Global */}
        <footer className="mt-auto pt-6 border-t border-dark-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>© 2025 RS Prólipsi - Sistema de Gestão</p>
          <p className="mt-2 md:mt-0 opacity-70 flex items-center gap-1">
            A RS-IA pode cometer erros. Verifique informações críticas.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;