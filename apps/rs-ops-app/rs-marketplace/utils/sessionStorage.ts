// Utility para gerenciar sessão do usuário no localStorage

export interface Session {
    customer: {
        id: string;
        name: string;
        email: string;
    } | null;
    isConsultant: boolean;
    timestamp: number;
}

const SESSION_KEY = 'marketplace_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export const sessionStorage = {
    save(session: Omit<Session, 'timestamp'>): void {
        const sessionData: Session = {
            ...session,
            timestamp: Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    },

    load(): Session | null {
        try {
            const stored = localStorage.getItem(SESSION_KEY);
            if (!stored) return null;

            const session: Session = JSON.parse(stored);
            
            // Verificar se a sessão expirou
            if (Date.now() - session.timestamp > SESSION_DURATION) {
                this.clear();
                return null;
            }

            return session;
        } catch (error) {
            console.error('Erro ao carregar sessão:', error);
            return null;
        }
    },

    clear(): void {
        localStorage.removeItem(SESSION_KEY);
    },

    isValid(): boolean {
        const session = this.load();
        return session !== null && session.customer !== null;
    },

    getCustomer(): Session['customer'] | null {
        const session = this.load();
        return session?.customer || null;
    },

    isConsultant(): boolean {
        const session = this.load();
        return session?.isConsultant || false;
    }
};
