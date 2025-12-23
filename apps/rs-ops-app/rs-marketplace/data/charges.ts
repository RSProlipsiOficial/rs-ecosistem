import { Charge } from '../types';

export const initialCharges: Charge[] = [
  {
    id: 'CHG-001',
    customerName: 'Fernanda Lima',
    customerEmail: 'fernanda.lima@example.com',
    customerCpf: '111.222.333-44',
    customerPhone: '21987654321',
    customerAddress: {
      street: 'Avenida Atlântica',
      number: '1702',
      neighborhood: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22021-001',
    },
    items: [
      { id: '1', description: 'Relógio de Pulso Clássico de Couro', quantity: 1, price: 1250.00 },
      { id: 'custom-1', description: 'Gravação Personalizada', quantity: 1, price: 150.00 }
    ],
    shipping: 25.00,
    total: 1425.00,
    status: 'Pago',
    createdAt: '2024-07-28T10:00:00Z',
    dueDate: '2024-08-05T23:59:59Z',
    paymentLink: 'https://rs.shp/pay/ab12cd34',
  },
  {
    id: 'CHG-002',
    customerName: 'Ricardo Alves',
    customerEmail: 'ricardo.alves@example.com',
    customerCpf: '222.333.444-55',
    customerPhone: '11912345678',
    items: [
      { id: '2', description: 'Bolsa de Ombro de Designer em Couro', quantity: 1, price: 2100.00 }
    ],
    shipping: 0,
    total: 2100.00,
    status: 'Pendente',
    createdAt: '2024-07-29T14:30:00Z',
    dueDate: '2024-08-08T23:59:59Z',
    paymentLink: 'https://rs.shp/pay/ef56gh78',
  },
  {
    id: 'CHG-003',
    customerName: 'Mariana Costa',
    customerEmail: 'mariana.costa@example.com',
    customerCpf: '333.444.555-66',
    items: [
      { id: 'custom-2', description: 'Consultoria de Estilo', quantity: 2, price: 300.00 }
    ],
    shipping: 0,
    total: 600.00,
    status: 'Vencido',
    createdAt: '2024-07-15T11:00:00Z',
    dueDate: '2024-07-22T23:59:59Z',
    paymentLink: 'https://rs.shp/pay/ij90kl12',
  },
];