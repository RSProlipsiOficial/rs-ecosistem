/**
 * RS Prólipsi - Config System
 * Módulo Central de Configuração
 * 
 * Exporta configurações consolidadas para todo o ecossistema
 */

// Settings
import bonusConfig from './settings/bonus.json';
import planosConfig from './settings/planos.json';
import carreiraConfig from './settings/carreira.json';

// Version
import { currentVersion, getVersion, getVersionInfo, isCompatible } from './version/version';
import changelogData from './version/changelog.json';

// Environment
import { supabaseConfig, validateSupabaseConfig, getMaskedConfig } from './env/supabase.env';
import { walletPayConfig, validateWalletPayConfig, getMaskedWalletPayConfig } from './env/walletpay.env';
import { mercadopagoConfig, validateMercadoPagoConfig } from './env/mercadopago.env';
import { globalConfig, getGlobalConfig, isProduction, isMaintenanceMode } from './env/global.env';

// Utils
import {
  validateBonusConfig,
  validatePlanosConfig,
  validateCarreiraConfig,
  validateAllConfigs,
  isValidNumber,
  isValidPercentage,
  isValidMoneyValue,
} from './utils/validation';

import {
  formatMoney,
  formatPercentage,
  formatDateTime,
  formatCPF,
  formatCNPJ,
  formatPhone,
  truncate,
  capitalize,
  slugify,
} from './utils/formatters';

import {
  percentToDecimal,
  decimalToPercent,
  calculatePercentageValue,
  calculatePercentage,
  roundTo,
  safeParseNumber,
  safeParseInt,
  normalizeCPF,
  normalizeCNPJ,
  normalizePhone,
  objectToQueryString,
  queryStringToObject,
  deepClone,
  deepMerge,
} from './utils/converters';

/**
 * Interface do Sistema de Configuração
 */
export interface ConfigSystem {
  // Settings
  settings: {
    bonus: typeof bonusConfig;
    planos: typeof planosConfig;
    carreira: typeof carreiraConfig;
  };
  
  // Version
  version: {
    current: typeof currentVersion;
    changelog: typeof changelogData;
    getVersion: typeof getVersion;
    getInfo: typeof getVersionInfo;
    isCompatible: typeof isCompatible;
  };
  
  // Environment
  env: {
    supabase: typeof supabaseConfig;
    walletPay: typeof walletPayConfig;
    mercadopago: typeof mercadopagoConfig;
    global: typeof globalConfig;
    validate: {
      supabase: typeof validateSupabaseConfig;
      walletPay: typeof validateWalletPayConfig;
      mercadopago: typeof validateMercadoPagoConfig;
    };
  };
  
  // Utils
  utils: {
    validation: {
      validateBonus: typeof validateBonusConfig;
      validatePlanos: typeof validatePlanosConfig;
      validateCarreira: typeof validateCarreiraConfig;
      validateAll: typeof validateAllConfigs;
      isValidNumber: typeof isValidNumber;
      isValidPercentage: typeof isValidPercentage;
      isValidMoneyValue: typeof isValidMoneyValue;
    };
    formatters: {
      formatMoney: typeof formatMoney;
      formatPercentage: typeof formatPercentage;
      formatDateTime: typeof formatDateTime;
      formatCPF: typeof formatCPF;
      formatCNPJ: typeof formatCNPJ;
      formatPhone: typeof formatPhone;
      truncate: typeof truncate;
      capitalize: typeof capitalize;
      slugify: typeof slugify;
    };
    converters: {
      percentToDecimal: typeof percentToDecimal;
      decimalToPercent: typeof decimalToPercent;
      calculatePercentageValue: typeof calculatePercentageValue;
      calculatePercentage: typeof calculatePercentage;
      roundTo: typeof roundTo;
      safeParseNumber: typeof safeParseNumber;
      safeParseInt: typeof safeParseInt;
      normalizeCPF: typeof normalizeCPF;
      normalizeCNPJ: typeof normalizeCNPJ;
      normalizePhone: typeof normalizePhone;
      objectToQueryString: typeof objectToQueryString;
      queryStringToObject: typeof queryStringToObject;
      deepClone: typeof deepClone;
      deepMerge: typeof deepMerge;
    };
  };
  
  // Helpers
  helpers: {
    isProduction: typeof isProduction;
    isMaintenanceMode: typeof isMaintenanceMode;
    getGlobalConfig: typeof getGlobalConfig;
    getMaskedSupabaseConfig: typeof getMaskedConfig;
    getMaskedWalletPayConfig: typeof getMaskedWalletPayConfig;
  };
}

/**
 * Instância única do Sistema de Configuração
 */
export const ConfigSystem: ConfigSystem = {
  settings: {
    bonus: bonusConfig,
    planos: planosConfig,
    carreira: carreiraConfig,
  },
  
  version: {
    current: currentVersion,
    changelog: changelogData,
    getVersion,
    getInfo: getVersionInfo,
    isCompatible,
  },
  
  env: {
    supabase: supabaseConfig,
    walletPay: walletPayConfig,
    mercadopago: mercadopagoConfig,
    global: globalConfig,
    validate: {
      supabase: validateSupabaseConfig,
      walletPay: validateWalletPayConfig,
      mercadopago: validateMercadoPagoConfig,
    },
  },
  
  utils: {
    validation: {
      validateBonus: validateBonusConfig,
      validatePlanos: validatePlanosConfig,
      validateCarreira: validateCarreiraConfig,
      validateAll: validateAllConfigs,
      isValidNumber,
      isValidPercentage,
      isValidMoneyValue,
    },
    formatters: {
      formatMoney,
      formatPercentage,
      formatDateTime,
      formatCPF,
      formatCNPJ,
      formatPhone,
      truncate,
      capitalize,
      slugify,
    },
    converters: {
      percentToDecimal,
      decimalToPercent,
      calculatePercentageValue,
      calculatePercentage,
      roundTo,
      safeParseNumber,
      safeParseInt,
      normalizeCPF,
      normalizeCNPJ,
      normalizePhone,
      objectToQueryString,
      queryStringToObject,
      deepClone,
      deepMerge,
    },
  },
  
  helpers: {
    isProduction,
    isMaintenanceMode,
    getGlobalConfig,
    getMaskedSupabaseConfig: getMaskedConfig,
    getMaskedWalletPayConfig,
  },
};

/**
 * Export padrão
 */
export default ConfigSystem;

/**
 * Exports nomeados para acesso direto
 */
export { bonusConfig, planosConfig, carreiraConfig };
export { currentVersion, getVersion, getVersionInfo, isCompatible };
export { supabaseConfig, walletPayConfig, globalConfig, mercadopagoConfig };
export { validateSupabaseConfig, validateWalletPayConfig, validateMercadoPagoConfig };
export { isProduction, isMaintenanceMode, getGlobalConfig };

/**
 * Inicialização e validação
 */
export function initConfigSystem(): void {
  console.log('\n🧩 RS PRÓLIPSI - Config System');
  console.log(`Versão: ${getVersion()}`);
  console.log(`Environment: ${globalConfig.app.environment}`);
  
  // Validar configurações
  const validation = validateAllConfigs({
    bonus: bonusConfig,
    planos: planosConfig,
    carreira: carreiraConfig,
  });
  
  if (!validation.valid) {
    console.error('❌ Erros de validação:', validation.errors);
  } else {
    console.log('✅ Configurações validadas com sucesso');
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Avisos:', validation.warnings);
  }
}

/**
 * Auto-init se não estiver em modo library
 */
if (require.main === module) {
  initConfigSystem();
}
