/**
 * Validação de integridade de configurações
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida estrutura de bônus
 */
export function validateBonusConfig(config: any): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };
  
  // Validar campos obrigatórios
  if (!config.ciclo || config.ciclo.percentual === null) {
    result.errors.push('Percentual do ciclo não configurado');
    result.valid = false;
  }
  
  if (!config.profundidade || !config.profundidade.niveis) {
    result.errors.push('Níveis de profundidade não configurados');
    result.valid = false;
  }
  
  // Validar soma de percentuais
  if (config.totais && config.totais.percentualGeral !== null) {
    const expected = 48.95;
    const actual = config.totais.percentualGeral;
    
    if (Math.abs(actual - expected) > 0.01) {
      result.warnings.push(`Percentual total (${actual}%) difere do esperado (${expected}%)`);
    }
  }
  
  return result;
}

/**
 * Valida estrutura de planos
 */
export function validatePlanosConfig(config: any): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };
  
  // Validar matriz
  if (!config.matriz || !config.matriz.estrutura) {
    result.errors.push('Estrutura da matriz não configurada');
    result.valid = false;
  }
  
  // Validar carreira
  if (!config.carreira || !config.carreira.vme) {
    result.errors.push('VME não configurado');
    result.valid = false;
  }
  
  return result;
}

/**
 * Valida estrutura de carreira
 */
export function validateCarreiraConfig(config: any): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };
  
  // Validar graduações
  if (!config.graduacoes || !Array.isArray(config.graduacoes)) {
    result.errors.push('Graduações não configuradas');
    result.valid = false;
    return result;
  }
  
  if (config.graduacoes.length !== 13) {
    result.errors.push(`Esperado 13 PINs, encontrado ${config.graduacoes.length}`);
    result.valid = false;
  }
  
  return result;
}

/**
 * Valida todas as configurações
 */
export function validateAllConfigs(configs: {
  bonus?: any;
  planos?: any;
  carreira?: any;
}): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };
  
  // Validar cada módulo
  if (configs.bonus) {
    const bonusResult = validateBonusConfig(configs.bonus);
    result.errors.push(...bonusResult.errors);
    result.warnings.push(...bonusResult.warnings);
    result.valid = result.valid && bonusResult.valid;
  }
  
  if (configs.planos) {
    const planosResult = validatePlanosConfig(configs.planos);
    result.errors.push(...planosResult.errors);
    result.warnings.push(...planosResult.warnings);
    result.valid = result.valid && planosResult.valid;
  }
  
  if (configs.carreira) {
    const carreiraResult = validateCarreiraConfig(configs.carreira);
    result.errors.push(...carreiraResult.errors);
    result.warnings.push(...carreiraResult.warnings);
    result.valid = result.valid && carreiraResult.valid;
  }
  
  return result;
}

/**
 * Verifica se valor é número válido
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Verifica se percentual está no range válido
 */
export function isValidPercentage(value: number): boolean {
  return isValidNumber(value) && value >= 0 && value <= 100;
}

/**
 * Verifica se valor monetário é válido
 */
export function isValidMoneyValue(value: number): boolean {
  return isValidNumber(value) && value >= 0;
}
