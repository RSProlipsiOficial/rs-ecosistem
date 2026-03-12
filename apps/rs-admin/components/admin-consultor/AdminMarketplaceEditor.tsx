import React, { useMemo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { MARKETPLACE_URL } from '../../src/config/urls';

type MarketplaceEditorTab = 'storeEditor' | 'storeBannerEditor';

const CENTRAL_STORE_SLUG = 'rsprolipsi';

const AdminMarketplaceEditor: React.FC = () => {
  const [editorTab, setEditorTab] = useState<MarketplaceEditorTab>('storeEditor');
  const [editorIframeKey, setEditorIframeKey] = useState(0);
  const [previewIframeKey, setPreviewIframeKey] = useState(0);

  const normalizedBaseUrl = useMemo(() => MARKETPLACE_URL.replace(/\/$/, ''), []);

  const editorUrl = useMemo(() => {
    const hashPath = editorTab === 'storeEditor' ? '/store-editor' : '/store-banners';
    return `${normalizedBaseUrl}/#${hashPath}`;
  }, [editorTab, normalizedBaseUrl]);

  const previewUrl = useMemo(() => `${normalizedBaseUrl}/loja/${CENTRAL_STORE_SLUG}`, [normalizedBaseUrl]);

  return (
    <div className="min-h-full bg-[#121212] text-[#E5E7EB] space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#FFD700]">Editor do Marketplace</h1>
        <p className="text-sm text-gray-400">
          Este painel abre a personalizacao real da loja do marketplace. Tudo que for salvo aqui precisa refletir na
          loja publicada da sede.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
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
              Painel Real do Marketplace
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
              Visualizacao da Loja
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
