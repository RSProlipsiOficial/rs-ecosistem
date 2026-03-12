const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

const getBrowserHostname = () => {
  if (typeof window === 'undefined') {
    return 'localhost';
  }

  return window.location.hostname || 'localhost';
};

export const MINISITE_PUBLIC_ORIGIN = trimTrailingSlash(
  ((import.meta as any).env?.VITE_MINISITE_URL as string) || `http://${getBrowserHostname()}:3030`
);

export const MINISITE_API_BASE_URL = trimTrailingSlash(
  ((import.meta as any).env?.VITE_API_URL as string) || `http://${getBrowserHostname()}:4000/v1`
);

export const MINISITE_API_ORIGIN = trimTrailingSlash(
  MINISITE_API_BASE_URL.replace(/\/v1$/i, '')
);

export const buildMiniSiteSignupUrl = (sponsorRef?: string | null) => {
  const normalizedRef = String(sponsorRef || 'rsprolipsi').trim().toLowerCase() || 'rsprolipsi';
  return `${MINISITE_PUBLIC_ORIGIN}/indicacao/${encodeURIComponent(normalizedRef)}#/signup`;
};

export const buildMiniSiteCheckoutUrl = (kit: string) =>
  `${MINISITE_PUBLIC_ORIGIN}/checkout/${String(kit || '').trim().toLowerCase()}`;
