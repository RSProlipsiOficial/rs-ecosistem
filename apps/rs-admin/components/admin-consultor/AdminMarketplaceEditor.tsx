import React from 'react';
import DashboardEditor from './DashboardEditorFull';

const AdminMarketplaceEditor: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Editor do Painel (Lojista / Marketplace)</h2>
        <p className="text-sm text-gray-400">Este editor controla o layout do painel do lojista consumido no Marketplace.</p>
      </div>
      <DashboardEditor context="marketplace" />
    </div>
  );
};

export default AdminMarketplaceEditor;
