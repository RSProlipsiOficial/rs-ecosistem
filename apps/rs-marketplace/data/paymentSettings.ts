import { PaymentSettings } from '../types';

export const initialPaymentSettings: PaymentSettings = {
  mercadoPago: {
    enabled: true,
    publicKey: 'TEST-12345678-ABCD-1234-ABCD-1234567890AB',
    accessToken: 'APP_USR-1234567890123456-123456-abcdefghijklmnopqrstuvwxyz123456',
  },
  pagSeguro: {
    enabled: false,
    email: 'seuemail@pagseguro.com.br',
    token: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
  },
  pix: {
    enabled: true,
    pixKeyType: 'Chave Aleatória',
    pixKey: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  },
  appmax: {
    enabled: false,
    apiKey: '',
  },
  asaas: {
    enabled: true,
    apiKey: 'mock_asaas_api_key_12345',
  },
  pagarme: {
    enabled: false,
    apiKey: '',
    encryptionKey: '',
  },
  stripe: {
    enabled: false,
    publishableKey: '',
    secretKey: '',
  }
};
