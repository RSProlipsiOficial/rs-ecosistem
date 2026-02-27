
import { NetworkNode } from '../types';

export const mockDeepNetwork: NetworkNode = {
    id: 'rsprolipsi',
    name: 'RS PRÓLIPSI',
    email: 'comercial@rsprolipsi.com.br',
    phone: '11999998888',
    avatarUrl: 'https://i.imgur.com/8Km9t7S.png',
    level: 0,
    graduation: 'Royal Diamond',
    accountStatus: 'active',
    monthlyActivity: 'active',
    category: 'Master',
    referralLink: '',
    affiliateLink: '',
    children: [
        {
            id: 'user-1',
            name: 'Ana Silva',
            email: 'ana@example.com',
            phone: '11988887777',
            avatarUrl: 'https://i.pravatar.cc/150?u=ana',
            birthDate: `1985-${new Date().getMonth() + 1}-15`, // Aniversário hoje/este mês
            level: 1,
            graduation: 'Ouro',
            accountStatus: 'active',
            monthlyActivity: 'active',
            category: 'Consultor',
            referralLink: '',
            affiliateLink: '',
            children: [
                {
                    id: 'user-3',
                    name: 'Carlos Oliveira',
                    email: 'carlos@example.com',
                    phone: '11977776666',
                    avatarUrl: 'https://i.pravatar.cc/150?u=carlos',
                    birthDate: `1992-${new Date().getMonth() + 1}-20`, // Também este mês
                    level: 2,
                    graduation: 'Prata',
                    accountStatus: 'active',
                    monthlyActivity: 'active',
                    category: 'Consultor',
                    referralLink: '',
                    affiliateLink: '',
                    children: []
                }
            ]
        },
        {
            id: 'user-2',
            name: 'Bruno Souza',
            email: 'bruno@example.com',
            phone: '11966665555',
            avatarUrl: 'https://i.pravatar.cc/150?u=bruno',
            birthDate: '1988-12-25',
            level: 1,
            graduation: 'Diamante',
            accountStatus: 'active',
            monthlyActivity: 'active',
            category: 'Consultor',
            referralLink: '',
            affiliateLink: '',
            children: []
        }
    ]
};
