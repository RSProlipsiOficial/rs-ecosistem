import React, { useMemo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import DashboardEditor from './DashboardEditorFull';
import { CONSULTOR_DASHBOARD_URL } from '../../src/config/urls';

const AdminConsultorPanelSettings: React.FC = () => {
  const [previewIframeKey, setPreviewIframeKey] = useState(0);

  const isSuperAdmin = (
    typeof window !== 'undefined' &&
    (
      ['admin', 'super_admin'].includes(localStorage.getItem('rs-role') || '') ||
      (localStorage.getItem('rs-user-permissions') || '').includes('super_admin')
    )
  );

  const previewUrl = useMemo(() => {
    const normalizedBaseUrl = CONSULTOR_DASHBOARD_URL.replace(/\/$/, '');
    const accessToken = (
      typeof window !== 'undefined'
        ? (localStorage.getItem('adminToken') || localStorage.getItem('consultorToken') || '')
        : ''
    ).trim();

    if (accessToken) {
      const payload = {
        autoLogin: true,
        source: 'rs-admin',
        token: accessToken,
      };
      const encodedPayload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      return `${normalizedBaseUrl}/#/sso?token=${encodeURIComponent(encodedPayload)}`;
    }

    return `${normalizedBaseUrl}/#/consultant/dashboard`;
  }, []);

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-300">
          Acesso restrito. Esta area requer permissao de administrador.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#121212] text-[#E5E7EB] space-y-5 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#FFD700]">Editor do Painel do Consultor</h1>
        <p className="text-sm text-gray-400">
          Edite o dashboard do consultor e acompanhe o preview real do escritorio ao lado.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setPreviewIframeKey((current) => current + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] px-4 py-2 text-sm font-medium text-[#E5E7EB] transition hover:border-[#FFD700] hover:text-[#FFD700]"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar Preview
        </button>
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#121212] transition hover:opacity-90"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir Painel Separado
        </a>
      </div>

      <div className="grid h-[calc(100vh-17rem)] gap-4 xl:grid-cols-[minmax(420px,0.95fr)_minmax(0,1.05fr)]">
        <div className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0B0B0B] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="border-b border-[#2A2A2A] px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFD700]">
              Configuracao do Painel
            </h2>
          </div>
          <div className="h-[calc(100%-3.25rem)] overflow-y-auto p-4">
            <DashboardEditor onSaveSuccess={() => setPreviewIframeKey((current) => current + 1)} />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0B0B0B] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="border-b border-[#2A2A2A] px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFD700]">
              Preview Real do Consultor
            </h2>
          </div>
          <iframe
            key={previewIframeKey}
            title="Preview do painel do consultor"
            src={previewUrl}
            className="h-[calc(100%-3.25rem)] w-full border-0 bg-[#0B0B0B]"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminConsultorPanelSettings;
