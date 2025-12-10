import { Supplier } from '../types';

export const suppliers: Supplier[] = [
    {
        id: 'SUP-001',
        name: 'TechSupplier Inc.',
        contactPerson: 'Roberto Almeida',
        email: 'contato@techsupplier.com',
        phone: '11 5555-1234',
        address: 'Rua da Tecnologia, 100, São Paulo, SP',
        productCategories: ['Eletrônicos', 'Acessórios de Celular'],
    },
    {
        id: 'SUP-002',
        name: 'HealthGadgets',
        contactPerson: 'Fernanda Lima',
        email: 'vendas@healthgadgets.com.br',
        phone: '21 5555-5678',
        address: 'Avenida da Saúde, 200, Rio de Janeiro, RJ',
        productCategories: ['Eletrônicos', 'Artigos Esportivos'],
    },
    {
        id: 'SUP-003',
        name: 'UrbanGear',
        contactPerson: 'Marcos Andrade',
        email: 'parcerias@urbangear.com',
        phone: '41 5555-9012',
        address: 'Alameda dos Viajantes, 300, Curitiba, PR',
        productCategories: ['Acessórios', 'Mochilas', 'Vestuário'],
    },
];
