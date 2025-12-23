import React, { useState } from 'react';
import App from './App';
import { ProductProvider } from './contexts/ProductContext';
import { CartCheckoutProvider } from './contexts/CartCheckoutContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { User, AuditLog, MessageTemplate, AuditAction, AuditEntity, AuditChange } from './types';

const INITIAL_USERS: User[] = [
    { id: 'admin', name: 'Admin RS', role: 'Admin' },
    { id: 'logista1', name: 'Logista Ana', role: 'Logista' },
    { id: 'logista2', name: 'Logista Bruno', role: 'Logista' },
];

const AppWrapper: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[1]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [whatsAppTemplates, setWhatsAppTemplates] = useState<MessageTemplate[]>([]);

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

export default AppWrapper;
