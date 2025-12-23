import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ProductProvider } from './contexts/ProductContext';
import { CartCheckoutProvider } from './contexts/CartCheckoutContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { User, AuditLog, MessageTemplate, AuditAction, AuditEntity, AuditChange } from './types';

// --- MOCK USER DATA ---
const INITIAL_USERS: User[] = [
  { id: 'admin', name: 'Admin RS', role: 'Admin' },
  { id: 'logista1', name: 'Logista Ana', role: 'Logista' },
  { id: 'logista2', name: 'Logista Bruno', role: 'Logista' },
];
const INITIAL_MESSAGE_TEMPLATES: MessageTemplate[] = [];

const Root = () => {
    const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[1]); // Default to Logista Ana
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