
// FIX: Changed missing 'Franchisee' type to 'Distributor' to match the type definition in types.ts
import { Distributor } from '../types';

export const franchisees: Distributor[] = [
  {
    id: 'FRAN-001',
    name: 'Franquia Central Curitiba',
    ownerName: 'Roberto Silveira',
    cpfCnpj: '12.345.678/0001-99',
    email: 'roberto.silveira@rsprolipsi.com.br',
    phone: '(41) 99999-0001',
    stores: [
      {
        id: 'STORE-01',
        name: 'RS Prólipsi - Shopping Mueller',
        city: 'Curitiba',
        state: 'PR',
        consultantIds: ['C-001', 'C-002', 'C-003'],
      },
      {
        id: 'STORE-02',
        name: 'RS Prólipsi - ParkShoppingBarigüi',
        city: 'Curitiba',
        state: 'PR',
        consultantIds: ['C-004', 'C-005'],
      },
    ],
  },
  {
    id: 'FRAN-002',
    name: 'Franquia Litoral Catarinense',
    ownerName: 'Mariana Costa',
    cpfCnpj: '98.765.432/0001-11',
    email: 'mariana.costa@rsprolipsi.com.br',
    phone: '(47) 98888-0002',
    stores: [
      {
        id: 'STORE-03',
        name: 'RS Prólipsi - Balneário Shopping',
        city: 'Balneário Camboriú',
        state: 'SC',
        consultantIds: ['C-006', 'C-007', 'C-008', 'C-009'],
      },
      {
        id: 'STORE-04',
        name: 'RS Prólipsi - Itajaí Shopping',
        city: 'Itajaí',
        state: 'SC',
        consultantIds: ['C-010'],
      },
    ],
  },
  {
    id: 'FRAN-003',
    name: 'Franquia Norte do Paraná',
    ownerName: 'Carlos Andrade',
    cpfCnpj: '55.666.777/0001-22',
    email: 'carlos.andrade@rsprolipsi.com.br',
    phone: '(43) 97777-0003',
    stores: [
      {
        id: 'STORE-05',
        name: 'RS Prólipsi - Catuaí Shopping Londrina',
        city: 'Londrina',
        state: 'PR',
        consultantIds: ['C-011', 'C-012', 'C-013'],
      },
    ],
  },
];