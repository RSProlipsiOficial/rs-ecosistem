import { supabase } from '../lib/supabaseClient';

export interface WalletSession {
  token: string;
  userId: string;
  userName: string;
  userEmail: string;
  source: string;
}

type BridgePayload = Partial<WalletSession> & {
  accessToken?: string;
  token?: string;
  email?: string;
  name?: string;
  uid?: string;
};

const STORAGE_KEYS = {
  token: 'token',
  userId: 'userId',
  userName: 'userName',
  userEmail: 'userEmail',
  source: 'loginSource',
  autoLogin: 'autoLogin',
} as const;

const parseJson = (value: string): BridgePayload | null => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed as BridgePayload : null;
  } catch {
    return null;
  }
};

const decodeBase64Payload = (value: string): BridgePayload | null => {
  try {
    return parseJson(decodeURIComponent(escape(atob(value))));
  } catch {
    return null;
  }
};

const parseBridgePayload = (value: string): BridgePayload | null => {
  return parseJson(value) || decodeBase64Payload(value);
};

const toDisplayName = (email?: string | null) => {
  if (!email) {
    return 'Consultor';
  }

  const [localPart] = email.split('@');
  return localPart || 'Consultor';
};

export const readWalletSession = (): WalletSession => ({
  token: localStorage.getItem(STORAGE_KEYS.token) || '',
  userId: localStorage.getItem(STORAGE_KEYS.userId) || '',
  userName: localStorage.getItem(STORAGE_KEYS.userName) || '',
  userEmail: localStorage.getItem(STORAGE_KEYS.userEmail) || '',
  source: localStorage.getItem(STORAGE_KEYS.source) || '',
});

export const storeWalletSession = (session: Partial<WalletSession>) => {
  if (session.token) {
    localStorage.setItem(STORAGE_KEYS.token, session.token);
  }

  if (session.userId) {
    localStorage.setItem(STORAGE_KEYS.userId, session.userId);
  }

  if (session.userName) {
    localStorage.setItem(STORAGE_KEYS.userName, session.userName);
  }

  if (session.userEmail) {
    localStorage.setItem(STORAGE_KEYS.userEmail, session.userEmail);
  }

  if (session.source) {
    localStorage.setItem(STORAGE_KEYS.source, session.source);
    localStorage.setItem(STORAGE_KEYS.autoLogin, 'true');
  }
};

export const clearWalletSession = () => {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.userId);
  localStorage.removeItem(STORAGE_KEYS.userName);
  localStorage.removeItem(STORAGE_KEYS.userEmail);
  localStorage.removeItem(STORAGE_KEYS.source);
  localStorage.removeItem(STORAGE_KEYS.autoLogin);
};

export const getWalletUserId = () => readWalletSession().userId;

export const extractWalletTokenFromLocation = (search: string, hash: string): string | null => {
  const fromSearch = new URLSearchParams(search).get('token');
  if (fromSearch) {
    return fromSearch;
  }

  const hashQueryIndex = hash.indexOf('?');
  if (hashQueryIndex >= 0) {
    const params = new URLSearchParams(hash.slice(hashQueryIndex + 1));
    return params.get('token');
  }

  return null;
};

const enrichSessionWithSupabaseUser = async (
  accessToken: string,
  fallback: Partial<WalletSession>,
): Promise<WalletSession | null> => {
  let session: WalletSession = {
    token: accessToken,
    userId: fallback.userId || '',
    userName: fallback.userName || '',
    userEmail: fallback.userEmail || '',
    source: fallback.source || 'walletpay',
  };

  try {
    const authApi = supabase.auth as any;
    const response = await authApi.getUser(accessToken);
    const user = response?.data?.user;

    if (user) {
      session = {
        token: accessToken,
        userId: user.id || session.userId,
        userName:
          user.user_metadata?.nome ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          session.userName ||
          toDisplayName(user.email),
        userEmail: user.email || session.userEmail,
        source: session.source,
      };
    }
  } catch (error) {
    console.warn('[WalletPay] Nao foi possivel enriquecer a sessao via Supabase:', error);
  }

  if (!session.userId) {
    return null;
  }

  if (!session.userName) {
    session.userName = toDisplayName(session.userEmail);
  }

  return session;
};

export const hydrateWalletSessionFromToken = async (rawToken: string): Promise<WalletSession | null> => {
  const payload = parseBridgePayload(rawToken);
  const accessToken = String(payload?.accessToken || payload?.token || rawToken || '').trim();

  if (!accessToken) {
    clearWalletSession();
    return null;
  }

  const session = await enrichSessionWithSupabaseUser(accessToken, {
    userId: payload?.userId || payload?.uid || '',
    userName: payload?.userName || payload?.name || '',
    userEmail: payload?.userEmail || payload?.email || '',
    source: payload?.source || 'sso',
  });

  if (!session) {
    clearWalletSession();
    return null;
  }

  storeWalletSession(session);
  return session;
};

export const ensureWalletSession = async (): Promise<WalletSession | null> => {
  const stored = readWalletSession();

  if (!stored.token) {
    return null;
  }

  if (stored.userId) {
    return stored;
  }

  const hydrated = await enrichSessionWithSupabaseUser(stored.token, stored);
  if (!hydrated) {
    clearWalletSession();
    return null;
  }

  storeWalletSession(hydrated);
  return hydrated;
};
