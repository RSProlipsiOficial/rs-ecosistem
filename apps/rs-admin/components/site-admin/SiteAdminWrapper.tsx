import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, MousePointerClick, RefreshCw } from 'lucide-react';
import { SITE_URL } from '../../src/config/urls';

const SiteAdminWrapper: React.FC = () => {
  const [adminIframeKey, setAdminIframeKey] = useState(0);
  const [previewIframeKey, setPreviewIframeKey] = useState(0);
  const [isPreviewEditEnabled, setIsPreviewEditEnabled] = useState(true);

  const siteAdminUrl = useMemo(() => {
    const normalizedBaseUrl = SITE_URL.replace(/\/$/, '');
    return `${normalizedBaseUrl}/?embedAdmin=1&adminTab=home`;
  }, []);

  const sitePreviewUrl = useMemo(() => {
    const normalizedBaseUrl = SITE_URL.replace(/\/$/, '');
    return isPreviewEditEnabled
      ? `${normalizedBaseUrl}/?previewEditor=1`
      : normalizedBaseUrl;
  }, [isPreviewEditEnabled]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleMessage = (event: MessageEvent) => {
      if (
        typeof event.data !== 'object' ||
        !['rs-site:refresh-preview', 'rs-site:content-updated'].includes(String(event.data?.type || ''))
      ) {
        return;
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setPreviewIframeKey((current) => current + 1);
      }, 150);
    };

    window.addEventListener('message', handleMessage);
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="min-h-full bg-[#121212] text-[#E5E7EB] p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FFD700]">Admin Site</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Gerencie o painel administrativo do RS Site e acompanhe a visualização pública no mesmo lugar.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setAdminIframeKey((current) => current + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] px-4 py-2 text-sm font-medium text-[#E5E7EB] transition hover:border-[#FFD700] hover:text-[#FFD700]"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar Painel
          </button>
          <button
            type="button"
            onClick={() => setPreviewIframeKey((current) => current + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] px-4 py-2 text-sm font-medium text-[#E5E7EB] transition hover:border-[#FFD700] hover:text-[#FFD700]"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar Site
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPreviewEditEnabled((current) => !current);
              setPreviewIframeKey((current) => current + 1);
            }}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              isPreviewEditEnabled
                ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                : 'border-[#3A3A3A] bg-[#1E1E1E] text-[#E5E7EB] hover:border-[#FFD700] hover:text-[#FFD700]'
            }`}
          >
            <MousePointerClick className="h-4 w-4" />
            {isPreviewEditEnabled ? 'Clique para editar: ativo' : 'Ativar clique para editar'}
          </button>
          <a
            href={sitePreviewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#121212] transition hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir Site Separado
          </a>
        </div>
      </div>

      <div className="grid h-[calc(100vh-10rem)] gap-4 lg:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)]">
        <div className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0B0B0B] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="border-b border-[#2A2A2A] px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFD700]">Painel Administrativo</h2>
          </div>
          <iframe
            key={adminIframeKey}
            title="Admin Site RS"
            src={siteAdminUrl}
            className="h-[calc(100%-3.25rem)] w-full border-0 bg-[#0B0B0B]"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0B0B0B] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="border-b border-[#2A2A2A] px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFD700]">Visualização do Site</h2>
          </div>
          <iframe
            key={previewIframeKey}
            title="Preview Site RS"
            src={sitePreviewUrl}
            className="h-[calc(100%-3.25rem)] w-full border-0 bg-[#0B0B0B]"
          />
        </div>
      </div>
    </div>
  );
};

export default SiteAdminWrapper;
