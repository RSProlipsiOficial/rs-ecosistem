import React, { useMemo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { MARKETPLACE_URL } from '../../src/config/urls';

type MarketplaceWorkspace = 'store' | 'dashboard';
type MarketplaceEditorTab = 'storeEditor' | 'storeBannerEditor';

const CENTRAL_STORE_SLUG = 'rsprolipsi';

const buildMarketplaceIframeUrl = (
  baseUrl: string,
  targetPath: string,
  searchParams: Record<string, string>,
) => {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const search = new URLSearchParams(searchParams);
  const searchString = search.toString();
  const accessToken = (
    typeof window !== 'undefined'
      ? (localStorage.getItem('adminToken') || localStorage.getItem('consultorToken') || '')
      : ''
  ).trim();

  if (!accessToken) {
    return `${normalizedBaseUrl}/${searchString ? `?${searchString}` : ''}#${targetPath}`;
  }

  const payload = {
    autoLogin: true,
    source: 'rs-admin',
    token: accessToken,
  };
  const encodedPayload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const hashParams = new URLSearchParams({
    token: encodedPayload,
    target: targetPath,
  });

  return `${normalizedBaseUrl}/${searchString ? `?${searchString}` : ''}#/sso?${hashParams.toString()}`;
};

const AdminMarketplaceEditor: React.FC = () => {
  const [workspace, setWorkspace] = useState<MarketplaceWorkspace>('store');
  const [editorTab, setEditorTab] = useState<MarketplaceEditorTab>('storeEditor');
  const [editorIframeKey, setEditorIframeKey] = useState(0);
  const [previewIframeKey, setPreviewIframeKey] = useState(0);

  const normalizedBaseUrl = useMemo(() => MARKETPLACE_URL.replace(/\/$/, ''), []);

  const editorUrl = useMemo(() => {
    if (workspace === 'dashboard') {
      return buildMarketplaceIframeUrl(normalizedBaseUrl, '/dashboard-editor', { embedMarketplaceAdmin: '1' });
    }

    const hashPath = editorTab === 'storeEditor' ? '/store-editor' : '/store-banners';
    return buildMarketplaceIframeUrl(normalizedBaseUrl, hashPath, { embedMarketplaceAdmin: '1' });
  }, [editorTab, normalizedBaseUrl, workspace]);

  const previewUrl = useMemo(() => {
    if (workspace === 'dashboard') {
      return buildMarketplaceIframeUrl(normalizedBaseUrl, '/seller', { previewDashboard: '1' });
    }

    return `${normalizedBaseUrl}/loja/${CENTRAL_STORE_SLUG}?previewStore=1`;
  }, [normalizedBaseUrl, workspace]);

  return (
    <div className="min-h-full bg-[#121212] text-[#E5E7EB] space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#FFD700]">Editor do Marketplace</h1>
        <p className="text-sm text-gray-400">
          Trabalhe separado entre o designer do e-commerce e o layout do painel do lojista, com preview real ao lado.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setWorkspace('store');
            setEditorTab('storeEditor');
            setEditorIframeKey((current) => current + 1);
            setPreviewIframeKey((current) => current + 1);
          }}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            workspace === 'store'
              ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
              : 'border-[#3A3A3A] bg-[#1E1E1E] text-[#E5E7EB] hover:border-[#FFD700] hover:text-[#FFD700]'
          }`}
        >
          Designer do E-commerce
        </button>
        <button
          type="button"
          onClick={() => {
            setWorkspace('dashboard');
            setEditorIframeKey((current) => current + 1);
            setPreviewIframeKey((current) => current + 1);
          }}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            workspace === 'dashboard'
              ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
              : 'border-[#3A3A3A] bg-[#1E1E1E] text-[#E5E7EB] hover:border-[#FFD700] hover:text-[#FFD700]'
          }`}
        >
          Editor do Dashboard
        </button>
        {workspace === 'store' && (
          <>
        <button
          type="button"
          onClick={() => {
            setEditorTab('storeEditor');
            setEditorIframeKey((current) => current + 1);
          }}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            editorTab === 'storeEditor'
              ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
              : 'border-[#3A3A3A] bg-[#1E1E1E] text-[#E5E7EB] hover:border-[#FFD700] hover:text-[#FFD700]'
          }`}
        >
          Aparencia da Loja
        </button>
        <button
          type="button"
          onClick={() => {
            setEditorTab('storeBannerEditor');
            setEditorIframeKey((current) => current + 1);
          }}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            editorTab === 'storeBannerEditor'
              ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
              : 'border-[#3A3A3A] bg-[#1E1E1E] text-[#E5E7EB] hover:border-[#FFD700] hover:text-[#FFD700]'
          }`}
        >
          Banners da Loja
        </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setEditorIframeKey((current) => current + 1)}
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
          Atualizar Loja
        </button>
        <a
          href={editorUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#121212] transition hover:opacity-90"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir Separado
        </a>
      </div>

      <div className="grid h-[calc(100vh-17rem)] gap-4 xl:grid-cols-[minmax(420px,0.95fr)_minmax(0,1.05fr)]">
        <div className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0B0B0B] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="border-b border-[#2A2A2A] px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFD700]">
              {workspace === 'dashboard' ? 'Editor do Dashboard do Lojista' : 'Editor do E-commerce'}
            </h2>
          </div>
          <iframe
            key={editorIframeKey}
            title="Editor do Marketplace"
            src={editorUrl}
            className="h-[calc(100%-3.25rem)] w-full border-0 bg-[#0B0B0B]"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0B0B0B] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="border-b border-[#2A2A2A] px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFD700]">
              {workspace === 'dashboard' ? 'Preview do Dashboard do Lojista' : 'Preview da Loja'}
            </h2>
          </div>
          <iframe
            key={previewIframeKey}
            title="Preview da Loja do Marketplace"
            src={previewUrl}
            className="h-[calc(100%-3.25rem)] w-full border-0 bg-[#0B0B0B]"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminMarketplaceEditor;
