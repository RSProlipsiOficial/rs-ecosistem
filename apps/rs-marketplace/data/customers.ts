import { Customer } from '../types';

export const customers: Customer[] = [
    {
        id: 'cust-1',
        name: 'Carlos Silva',
        email: 'carlos.silva@example.com',
        passwordHash: '123456', // Em uma aplicação real, isso seria um hash seguro.
    },
    {
        id: 'cust-2',
        name: 'Maria Oliveira',
        email: 'maria.oliveira@example.com',
        passwordHash: '123456',
    },
    {
        id: 'cust-admin',
        name: 'Admin RS Prólipsi',
        email: 'rsprolipsioficial@gmail.com',
        passwordHash: 'Yannis784512@',
    }
];