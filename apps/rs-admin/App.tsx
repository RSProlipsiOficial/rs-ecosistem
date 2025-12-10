import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import ConsultantsPage from './components/ConsultantsPage';
import SettingsPage from './components/SettingsPage';
import SigmeSettingsPage from './components/SigmeSettingsPage';
import CareerPlanPage from './components/CareerPlanPage';
import CareerReportsPage from './components/CareerReportsPage';
import FidelityBonusPage from './components/FidelityBonusPage';
// Wallet imports removed
import ManageCDsPage from './components/cd/ManageCDsPage';
import CDStorePage from './components/cd/CDStorePage';
// import CDReportsPage from './components/cd/CDReportsPage';
// Marketplace imports removed
import CommunicationCenterPage from './components/CommunicationCenterPage';
import FloatingChat from './components/FloatingChat';
// Wallet features imports removed
import LoginPage from './components/LoginPage';
import PersonalData from './components/admin-consultor/PersonalDataSimple';
import DashboardEditor from './components/admin-consultor/DashboardEditorFull';
import AdminMarketplaceEditor from './components/admin-consultor/AdminMarketplaceEditor';
import AdminConsultorPanelSettings from './components/admin-consultor/AdminConsultorPanelSettings';
import { DashboardConfigProvider } from './components/admin-consultor/dashboardConfigContext';
import MpOverview from './components/marketplace-admin/Overview';
import MpStores from './components/marketplace-admin/Stores';
import MpSellers from './components/marketplace-admin/Sellers';
import MpConfig from './components/marketplace-admin/Config';
import MpPermissions from './components/marketplace-admin/Permissions';
// SIGME views removidas: centralização em Configurações SIGMA

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if token exists in localStorage
    return !!localStorage.getItem('adminToken');
  });
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('Dashboard');
  const [selectedCDId, setSelectedCDId] = useState<number | null>(null);
  const [credits, setCredits] = useState(100);

  React.useEffect(() => {
    const role = localStorage.getItem('rs-role');
    const isDev = (import.meta as any).env?.DEV ?? true;
    if (!role && isDev) {
      try { localStorage.setItem('rs-role', 'super_admin'); } catch { }
    }
    const applyHashRoute = () => {
      const hash = (window.location.hash || '').replace('#', '');
      switch (hash) {
        case '/admin/consultor/panel-settings':
          setActiveView('Admin Configurações do Painel');
          break;
        case '/dashboard-editor':
          setActiveView('Admin Configurações do Painel');
          break;
        case '/marketplace-admin':
          setActiveView('Admin Configurações do Painel');
          break;
        default:
          break;
      }
    };
    applyHashRoute();
    window.addEventListener('hashchange', applyHashRoute);
    return () => window.removeEventListener('hashchange', applyHashRoute);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const navigateToCdStore = (id: number) => {
    setSelectedCDId(id);
    setActiveView('Loja do CD');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard setActiveView={setActiveView} />;
      case 'Consultores':
        return <ConsultantsPage />;
      case 'Admin Dados Pessoais':
        return <PersonalData />;
      case 'Admin Dashboard Editor':
        return <DashboardEditor />;
      case 'Admin Marketplace Editor':
        return <AdminMarketplaceEditor />;
      case 'Admin Configurações do Painel': {
        const isSuperAdmin = (typeof window !== 'undefined' && (['admin', 'super_admin'].includes(localStorage.getItem('rs-role') || '') || (localStorage.getItem('rs-user-permissions') || '').includes('super_admin')));
        if (!isSuperAdmin) return <div className="p-6"><p className="text-sm">Acesso restrito. Esta área requer permissão de administrador.</p></div>;
        return <AdminConsultorPanelSettings />;
      }
      case 'Matriz SIGMA':
      case 'Top SIGME':
        return <SigmeSettingsPage />;
      case 'Tabela PINs':
        return <CareerPlanPage />;
      case 'Relatórios Carreira':
        return <CareerReportsPage />;
      case 'Bônus Fidelidade':
        return <FidelityBonusPage />;
      // WalletPay internal routes removed
      case 'Gerenciar CDs':
        return <ManageCDsPage navigateToCdStore={navigateToCdStore} />;
      case 'Loja do CD':
        return <CDStorePage cdId={selectedCDId} />;
      case 'Relatórios CD':
        return <div className="p-8"><h1 className="text-2xl text-yellow-500">Relatórios CD - Em desenvolvimento</h1></div>;
      // Marketplace internal routes removed
      case 'Comunicação':
      case 'Communication':
        return <CommunicationCenterPage credits={credits} setCredits={setCredits} />;
      case 'Configurações':
        return <SettingsPage />;
      case 'Admin Marketplace Visão Geral':
        return <MpOverview />;
      case 'Admin Marketplace Lojas':
        return <MpStores />;
      case 'Admin Marketplace Lojistas':
        return <MpSellers />;
      case 'Admin Marketplace Config':
        return <MpConfig />;
      case 'Admin Marketplace Permissões':
        return <MpPermissions />;
      default:
        return <Dashboard setActiveView={setActiveView} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <DashboardConfigProvider>
      <div className="flex h-screen bg-[#121212] text-[#E5E7EB]">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeView={activeView}
          setActiveView={setActiveView}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar toggleSidebar={toggleSidebar} setActiveView={setActiveView} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#121212]">
            {renderActiveView()}
          </main>
        </div>
        <FloatingChat credits={credits} />
      </div>
    </DashboardConfigProvider>
  );
};

export default App;
