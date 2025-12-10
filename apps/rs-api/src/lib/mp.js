/**
 * Mercado Pago SDK - Configuração Centralizada
 * RS Prólipsi Marketplace
 */

const { MercadoPagoConfig } = require('mercadopago');

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

module.exports = { mp };
