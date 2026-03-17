import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ProductProvider } from './contexts/ProductContext';
import { CartCheckoutProvider } from './contexts/CartCheckoutContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { User, AuditLog, MessageTemplate, AuditAction, AuditEntity, AuditChange } from './types';
import { syncDropProfile } from './services/syncService';

const DEFAULT_AVATAR_URL = 'https://raw.githubusercontent.com/RS-Prolipsi/assets/main/logo_rs_gold.png';

const INITIAL_USERS: User[] = [
  { id: 'admin', name: 'RS Prolipsi', role: 'Admin', avatar: DEFAULT_AVATAR_URL },
  { id: 'logista1', name: 'Logista Ana', role: 'Logista' },
  { id: 'logista2', name: 'Logista Bruno', role: 'Logista' },
];

const INITIAL_MESSAGE_TEMPLATES: MessageTemplate[] = [];

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeAvatarUrl = (value: unknown) => {
  const normalized = normalizeText(value);
  if (!normalized || ['null', 'undefined', '[object Object]'].includes(normalized)) {
    return '';
  }
  return normalized;
};

const resolveUserRole = (value: unknown): User['role'] => {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized.includes('admin') || normalized.includes('sede') || normalized.includes('cd')) {
    return 'Admin';
  }
  return 'Logista';
};

const decodeBridgePayload = (rawToken: string) => {
  const normalizedToken = normalizeText(rawToken);
  if (!normalizedToken) return null;

  const tryDecode = (token: string, decodeEscaped = false) => {
    const padded = token.padEnd(token.length + ((4 - (token.length % 4)) % 4), '=');
    const decoded = atob(padded);
    return JSON.parse(decodeEscaped ? decodeURIComponent(escape(decoded)) : decoded);
  };

  try {
    return tryDecode(decodeURIComponent(normalizedToken));
  } catch {
    try {
      return tryDecode(normalizedToken.replace(/-/g, '+').replace(/_/g, '/'), true);
    } catch {
      return null;
    }
  }
};

const getHashToken = () => {
  const hash = window.location.hash || '';
  if (!hash.includes('?')) return '';
  const query = hash.slice(hash.indexOf('?') + 1);
  return new URLSearchParams(query).get('token') || '';
};

const Root = () => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [whatsAppTemplates, setWhatsAppTemplates] = useState<MessageTemplate[]>(INITIAL_MESSAGE_TEMPLATES);

  useEffect(() => {
    let isMounted = true;

    const hydrateCurrentUser = async () => {
      const params = new URLSearchParams(window.location.search);
      const rawToken = getHashToken();
      const payload = decodeBridgePayload(rawToken);

      const nextUser: User = {
        ...INITIAL_USERS[0],
        id:
          normalizeText(payload?.userId) ||
          normalizeText(payload?.uid) ||
          normalizeText(payload?.userEmail) ||
          INITIAL_USERS[0].id,
        name:
          normalizeText(payload?.userName) ||
          normalizeText(payload?.name) ||
          normalizeText(params.get('name')) ||
          INITIAL_USERS[0].name,
        role: resolveUserRole(payload?.userRole || payload?.role || params.get('role')),
        email:
          normalizeText(payload?.userEmail) ||
          normalizeText(payload?.email) ||
          normalizeText(params.get('email')),
        avatar:
          normalizeAvatarUrl(payload?.avatarUrl) ||
          normalizeAvatarUrl(payload?.avatar_url) ||
          normalizeAvatarUrl(payload?.avatar) ||
          normalizeAvatarUrl(params.get('avatar')) ||
          DEFAULT_AVATAR_URL,
      };

      if (rawToken) {
        const accessToken = normalizeText(payload?.token) || normalizeText(payload?.accessToken) || rawToken;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('userId', nextUser.id);
        localStorage.setItem('userName', nextUser.name);
        if (nextUser.email) {
          localStorage.setItem('userEmail', nextUser.email);
        }
      }

      if (isMounted) {
        setCurrentUser(nextUser);
      }

      const lookupKey = nextUser.id || nextUser.email || '';
      if (!lookupKey) return;

      const syncResult = await syncDropProfile(lookupKey);
      if (!isMounted || !syncResult.success || !syncResult.data) return;

      setCurrentUser(prev => ({
        ...prev,
        id: normalizeText(syncResult.data.id) || prev.id,
        name: normalizeText(syncResult.data.name) || prev.name,
        role: resolveUserRole(syncResult.data.role || prev.role),
        email: normalizeText(syncResult.data.email) || prev.email,
        avatar: normalizeAvatarUrl(syncResult.data.avatarUrl) || prev.avatar || DEFAULT_AVATAR_URL,
      }));
    };

    void hydrateCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const logAction = (action: AuditAction, entity: AuditEntity, entityId: string, details: string, changes?: AuditChange[]) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      entity,
      entityId,
      details,
      changes,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  return (
    <NotificationProvider>
      <ProductProvider currentUser={currentUser} onLogAction={logAction}>
        <CartCheckoutProvider currentUser={currentUser}>
          <App
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            users={[currentUser, ...INITIAL_USERS.filter(user => user.id !== currentUser.id)]}
            auditLogs={auditLogs}
            logAction={logAction}
            whatsAppTemplates={whatsAppTemplates}
            setWhatsAppTemplates={setWhatsAppTemplates}
          />
        </CartCheckoutProvider>
      </ProductProvider>
    </NotificationProvider>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
