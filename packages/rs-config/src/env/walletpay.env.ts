/**
 * Configurações WalletPay (rs-walletpay)
 * ATENÇÃO: Não commitar com credenciais reais
 */

export interface WalletPayConfig {
  apiUrl: string;
  apiKey: string;
  webhookSecret: string;
  merchantId: string;
  environment: 'development' | 'staging' | 'production';
}

/**
 * Template de configuração WalletPay
 * Substituir com valores do arquivo CREDENCIAIS.md
 */
export const walletPayConfig: WalletPayConfig = {
  apiUrl: process.env.WALLETPAY_API_URL || '',
  apiKey: process.env.WALLETPAY_API_KEY || '',
  webhookSecret: process.env.WALLETPAY_WEBHOOK_SECRET || '',
  merchantId: process.env.WALLETPAY_MERCHANT_ID || '',
  environment: (process.env.WALLETPAY_ENV as any) || 'development',
};

/**
 * Valida se as credenciais estão configuradas
 */
export function validateWalletPayConfig(): boolean {
  const required = [
    walletPayConfig.apiUrl,
    walletPayConfig.apiKey,
    walletPayConfig.merchantId,
  ];
  
  return required.every(field => field && field.length > 0);
}

/**
 * Retorna config mascarada para logs
 */
export function getMaskedWalletPayConfig() {
  return {
    apiUrl: walletPayConfig.apiUrl,
    merchantId: walletPayConfig.merchantId,
    environment: walletPayConfig.environment,
    configured: validateWalletPayConfig(),
  };
}
