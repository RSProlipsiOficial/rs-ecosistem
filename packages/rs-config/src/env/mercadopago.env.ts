/// <reference types="node" />

/**
 * Configurações do Mercado Pago
 */

export interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
}

export const mercadopagoConfig: MercadoPagoConfig = {
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
};

export function validateMercadoPagoConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!mercadopagoConfig.accessToken) {
    errors.push('MERCADOPAGO_ACCESS_TOKEN não configurado');
  }
  if (!mercadopagoConfig.publicKey) {
    errors.push('MERCADOPAGO_PUBLIC_KEY não configurado');
  }
  return { valid: errors.length === 0, errors };
}
