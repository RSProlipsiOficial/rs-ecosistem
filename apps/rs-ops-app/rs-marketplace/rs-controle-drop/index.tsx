import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ProductProvider } from './contexts/ProductContext';
import { CartCheckoutProvider } from './contexts/CartCheckoutContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { User, AuditLog, MessageTemplate, AuditAction, AuditEntity, AuditChange } from './types';

// --- MOCK USER DATA ---
const INITIAL_USERS: User[] = [
  { id: 'admin', name: 'RS Prólipsi', role: 'Sede (Admin)', avatar: 'https://raw.githubusercontent.com/RS-Prolipsi/assets/main/logo_rs_gold.png' as any },
  { id: 'logista1', name: 'Logista Ana', role: 'Logista' },
  { id: 'logista2', name: 'Logista Bruno', role: 'Logista' },
];
const INITIAL_MESSAGE_TEMPLATES: MessageTemplate[] = [];

const Root = () => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default to Sede (Admin)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const role = params.get('role');
    const avatar = params.get('avatar');

    if (name || role) {
      setCurrentUser(prev => ({
        ...prev,
        name: name || prev.name,
        role: role || prev.role,
        avatar: avatar || prev.avatar
      } as any)); // as any to ignore User missing avatar type if it exists
    }
  }, []);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [whatsAppTemplates, setWhatsAppTemplates] = useState<MessageTemplate[]>(INITIAL_MESSAGE_TEMPLATES);

  const logAction = (action: AuditAction, entity: AuditEntity, entityId: string, details: string, changes?: AuditChange[]) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action, entity, entityId, details, changes
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
            users={INITIAL_USERS}
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
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);