import { EditablePage, ContentContainer, Theme, BannerSettings, SiteSettings } from '../types';

type SiteBuilderBootstrap = {
  siteKey?: string;
  pages?: EditablePage[];
  globalContent?: {
    header?: ContentContainer;
    footer?: ContentContainer;
  };
  theme?: Theme;
  bannerSettings?: BannerSettings;
  siteSettings?: SiteSettings;
};

const DEFAULT_SITE_KEY = 'rs-site';

const resolveSiteBuilderUrl = () => {
  const rawBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
  const normalizedBaseUrl = String(rawBaseUrl).replace(/\/+$/, '');

  if (normalizedBaseUrl.endsWith('/api')) {
    return `${normalizedBaseUrl.slice(0, -4)}/v1/site-builder/bootstrap`;
  }

  if (normalizedBaseUrl.endsWith('/v1')) {
    return `${normalizedBaseUrl}/site-builder/bootstrap`;
  }

  return `${normalizedBaseUrl}/v1/site-builder/bootstrap`;
};

const resolveSiteBuilderUploadUrl = () => resolveSiteBuilderUrl().replace(/\/bootstrap$/, '/upload');

const parsePayload = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const siteBuilderApi = {
  getBootstrap: async (siteKey = DEFAULT_SITE_KEY) => {
    try {
      const response = await fetch(`${resolveSiteBuilderUrl()}?siteKey=${encodeURIComponent(siteKey)}`);
      const payload = await parsePayload(response);

      return {
        success: response.ok && Boolean(payload?.success ?? payload?.ok),
        data: (payload?.data || null) as SiteBuilderBootstrap | null,
        source: payload?.source,
        error: payload?.error,
      };
    } catch (error) {
      console.error('[siteBuilderApi] Failed to load bootstrap:', error);
      return { success: false, data: null, error };
    }
  },

  saveBootstrap: async (data: SiteBuilderBootstrap) => {
    try {
      const response = await fetch(resolveSiteBuilderUrl(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteKey: data.siteKey || DEFAULT_SITE_KEY,
          ...(data.pages !== undefined ? { pages: data.pages } : {}),
          ...(data.globalContent !== undefined ? { globalContent: data.globalContent } : {}),
          ...(data.theme !== undefined ? { theme: data.theme } : {}),
          ...(data.bannerSettings !== undefined ? { bannerSettings: data.bannerSettings } : {}),
          ...(data.siteSettings !== undefined ? { siteSettings: data.siteSettings } : {}),
        }),
      });

      const payload = await parsePayload(response);

      return {
        success: response.ok && Boolean(payload?.success ?? payload?.ok),
        data: payload?.data || null,
        source: payload?.source,
        error: payload?.error,
      };
    } catch (error) {
      console.error('[siteBuilderApi] Failed to save bootstrap:', error);
      return { success: false, data: null, error };
    }
  },

  uploadImage: async (file: File, options?: { siteKey?: string; folder?: string }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('siteKey', options?.siteKey || DEFAULT_SITE_KEY);
      if (options?.folder) {
        formData.append('folder', options.folder);
      }

      const response = await fetch(resolveSiteBuilderUploadUrl(), {
        method: 'POST',
        body: formData,
      });

      const payload = await parsePayload(response);

      return {
        success: response.ok && Boolean(payload?.success ?? payload?.ok),
        url: payload?.url as string | undefined,
        path: payload?.path as string | undefined,
        error: payload?.error,
      };
    } catch (error) {
      console.error('[siteBuilderApi] Failed to upload image:', error);
      return { success: false, error };
    }
  },
};
