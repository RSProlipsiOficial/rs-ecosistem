import React, { useState } from 'react';

// Prefer reuse: import components from Marketplace app
// If your build does not allow cross-app imports, copy these components locally.
// @ts-ignore
import CompensationPlanAdmin from './CompensationPlanAdmin';
import DashboardEditor from './DashboardEditorFull';
// @ts-ignore reutiliza editor do Marketplace (lojista)
import AdminMarketplaceEditor from './AdminMarketplaceEditor';
// @ts-ignore
import AdminCDManager from './AdminCDManager';

const AdminConsultorPanelSettings: React.FC = () => {
  const [tab, setTab] = useState<'comp' | 'editor' | 'mp' | 'cd'>(() => {
    const h = (typeof window !== 'undefined' ? (window.location.hash || '') : '').replace('#', '');
    if (h.includes('dashboard-editor')) return 'editor';
    if (h.includes('marketplace-admin')) return 'mp';
    return 'comp';
  });

  const isSuperAdmin = (typeof window !== 'undefined' && (['admin', 'super_admin'].includes(localStorage.getItem('rs-role') || '') || (localStorage.getItem('rs-user-permissions') || '').includes('super_admin')));

  if (!isSuperAdmin) return <div className="p-6"><p className="text-sm">Acesso restrito. Esta área requer permissão de administrador.</p></div>;
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Configurações do Painel</h1>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setTab('comp')} className={`px-4 py-2 rounded ${tab === 'comp' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-200'}`}>Plano de Compensação</button>
        <button onClick={() => setTab('editor')} className={`px-4 py-2 rounded ${tab === 'editor' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-200'}`}>Editor do Painel (Consultor)</button>
        <button onClick={() => setTab('mp')} className={`px-4 py-2 rounded ${tab === 'mp' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-200'}`}>Editor Dashboard (Marketplace)</button>
        <button onClick={() => setTab('cd')} className={`px-4 py-2 rounded ${tab === 'cd' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-200'}`}>Admin CD</button>
      </div>
      <div className="border border-gray-700 rounded p-4">
        {tab === 'comp' && (
          <CompensationPlanAdmin />
        )}
        {tab === 'editor' && (
          <DashboardEditor />
        )}
        {tab === 'mp' && (
          <AdminMarketplaceEditor />
        )}
        {tab === 'cd' && (
          <AdminCDManager />
        )}
      </div>
    </div>
  );
};

export default AdminConsultorPanelSettings;
