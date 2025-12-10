import { ShippingSettings } from '../types';

export const initialShippingSettings: ShippingSettings = {
  frenet: {
    enabled: false,
    apiKey: '',
    apiSecret: '',
  },
  melhorEnvio: {
    enabled: true,
    apiToken: 'SEU_TOKEN_MELHOR_ENVIO',
  },
  correios: {
    enabled: true,
    contrato: '9912345678',
    senha: 'SUA_SENHA',
  },
  superFrete: {
    enabled: false,
    apiToken: '',
  },
  jadlog: {
    enabled: false,
    apiToken: '',
  },
  loggi: {
    enabled: false,
    apiKey: '',
  },
};
