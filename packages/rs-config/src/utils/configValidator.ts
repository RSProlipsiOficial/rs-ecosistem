/**
 * Validador Automático de Configurações
 * RS Prólipsi - Config Validator
 * 
 * Valida todos os JSONs de configuração garantindo integridade
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  valid: boolean;
  file: string;
  errors: string[];
  warnings: string[];
}

interface ConfigMeta {
  version: string;
  updatedAt: string;
}

/**
 * Validador Principal
 */
export class ConfigValidator {
  private settingsPath: string;
  private results: ValidationResult[] = [];

  constructor(settingsPath: string = './src/settings') {
    this.settingsPath = settingsPath;
  }

  /**
   * Valida todos os configs
   */
  public validateAll(): ValidationResult[] {
    const configs = [
      'globals.json',
      'matrices.json',
      'security.json',
      'notifications.json',
      'carreira.json',
      'cycles.json',
      'topSigma.json',
      'ranking.json',
      'payments.json',
      'transfers.json',
      'multimodal.json',
      'sharedOrders.json',
      'orders.json',
      'logistics.json',
      'bonus.json',
      'produtos.json',
      'taxes.json',
      'affiliates.json'
    ];

    configs.forEach(file => {
      this.results.push(this.validateConfig(file));
    });

    return this.results;
  }

  /**
   * Valida um config específico
   */
  private validateConfig(filename: string): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      file: filename,
      errors: [],
      warnings: []
    };

    try {
      const filePath = path.join(this.settingsPath, filename);
      
      // Verifica se arquivo existe
      if (!fs.existsSync(filePath)) {
        result.valid = false;
        result.errors.push(`Arquivo não encontrado: ${filename}`);
        return result;
      }

      // Lê e parseia JSON
      const content = fs.readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content);

      // Validações específicas por tipo
      switch (filename) {
        case 'bonus.json':
          this.validateBonus(config, result);
          break;
        case 'matrices.json':
          this.validateMatrices(config, result);
          break;
        case 'carreira.json':
          this.validateCarreira(config, result);
          break;
        case 'payments.json':
          this.validatePayments(config, result);
          break;
        case 'security.json':
          this.validateSecurity(config, result);
          break;
        default:
          this.validateGeneric(config, result);
      }

    } catch (error: any) {
      result.valid = false;
      result.errors.push(`Erro ao processar: ${error?.message ?? String(error)}`);
    }

    return result;
  }

  /**
   * Valida bonus.json
   */
  private validateBonus(config: any, result: ValidationResult): void {
    // Valida meta
    if (!config.meta || !config.meta.version) {
      result.errors.push('Meta ou version ausente');
      result.valid = false;
    }

    // Valida percentuais
    const expectedTotal = 0.4895; // 48.95%
    const actualTotal = config.summary?.totalPercentage || 0;
    
    if (Math.abs(actualTotal - expectedTotal) > 0.0001) {
      result.errors.push(`Percentual total incorreto: ${actualTotal} (esperado: ${expectedTotal})`);
      result.valid = false;
    }

    // Valida ciclo
    if (config.ciclo?.valorBase !== 360.00) {
      result.errors.push('Valor base do ciclo deve ser R$ 360,00');
      result.valid = false;
    }

    if (config.ciclo?.percentual !== 0.30) {
      result.errors.push('Percentual do ciclo deve ser 30%');
      result.valid = false;
    }

    // Valida profundidade
    if (config.profundidade?.percentualTotal !== 0.0681) {
      result.errors.push('Percentual de profundidade deve ser 6,81%');
      result.valid = false;
    }

    // Valida fidelidade
    if (config.fidelidade?.percentualPool !== 0.0125) {
      result.errors.push('Percentual de fidelidade deve ser 1,25%');
      result.valid = false;
    }

    // Valida TOP SIGMA
    if (config.topSigma?.percentualPool !== 0.045) {
      result.errors.push('Percentual TOP SIGMA deve ser 4,5%');
      result.valid = false;
    }

    // Valida carreira
    if (config.carreira?.percentual !== 0.0639) {
      result.errors.push('Percentual de carreira deve ser 6,39%');
      result.valid = false;
    }
  }

  /**
   * Valida matrices.json
   */
  private validateMatrices(config: any, result: ValidationResult): void {
    if (config.matrix?.type !== '1x6') {
      result.errors.push('Tipo de matriz deve ser 1x6');
      result.valid = false;
    }

    if (config.slots?.total !== 6) {
      result.errors.push('Total de slots deve ser 6');
      result.valid = false;
    }

    if (config.cycle?.value !== 360.00) {
      result.errors.push('Valor do ciclo deve ser R$ 360,00');
      result.valid = false;
    }

    if (!config.compression?.enabled) {
      result.warnings.push('Compressão dinâmica está desabilitada');
    }

    if (!config.reentry?.automatic) {
      result.warnings.push('Reentrada automática está desabilitada');
    }
  }

  /**
   * Valida carreira.json
   */
  private validateCarreira(config: any, result: ValidationResult): void {
    if (!config.pins || config.pins.length !== 13) {
      result.errors.push('Deve ter exatamente 13 PINs');
      result.valid = false;
    }

    // Valida cada PIN
    const expectedPins = [
      { code: 'PIN01', label: 'Bronze', cycles: 5 },
      { code: 'PIN02', label: 'Prata', cycles: 15 },
      { code: 'PIN03', label: 'Ouro', cycles: 70 },
      { code: 'PIN04', label: 'Safira', cycles: 150 },
      { code: 'PIN05', label: 'Esmeralda', cycles: 300 },
      { code: 'PIN06', label: 'Topázio', cycles: 500 },
      { code: 'PIN07', label: 'Rubi', cycles: 750 },
      { code: 'PIN08', label: 'Diamante', cycles: 1500 },
      { code: 'PIN09', label: 'Duplo Diamante', cycles: 3000 },
      { code: 'PIN10', label: 'Triplo Diamante', cycles: 5000 },
      { code: 'PIN11', label: 'Diamante Red', cycles: 15000 },
      { code: 'PIN12', label: 'Diamante Blue', cycles: 25000 },
      { code: 'PIN13', label: 'Diamante Black', cycles: 50000 }
    ];

    config.pins?.forEach((pin: any, index: number) => {
      const expected = expectedPins[index];
      if (pin.code !== expected.code) {
        result.errors.push(`PIN ${index + 1}: código incorreto (${pin.code} vs ${expected.code})`);
        result.valid = false;
      }
      if (pin.requiredCycles !== expected.cycles) {
        result.errors.push(`PIN ${index + 1}: ciclos incorretos (${pin.requiredCycles} vs ${expected.cycles})`);
        result.valid = false;
      }
    });

    if (!config.vmec?.enabled) {
      result.warnings.push('VMEC está desabilitado');
    }
  }

  /**
   * Valida payments.json
   */
  private validatePayments(config: any, result: ValidationResult): void {
    if (!config.withdrawal?.enabled) {
      result.warnings.push('Saques estão desabilitados');
    }

    if (config.withdrawal?.fee?.percentage !== 0.02) {
      result.errors.push('Taxa de saque deve ser 2%');
      result.valid = false;
    }

    const requestWindow = config.withdrawal?.requestWindow;
    if (requestWindow?.startDay !== 1 || requestWindow?.endDay !== 5) {
      result.errors.push('Janela de solicitação deve ser dia 1-5');
      result.valid = false;
    }

    const payoutWindow = config.withdrawal?.payoutWindow;
    if (payoutWindow?.startDay !== 10 || payoutWindow?.endDay !== 15) {
      result.errors.push('Janela de pagamento deve ser dia 10-15');
      result.valid = false;
    }
  }

  /**
   * Valida security.json
   */
  private validateSecurity(config: any, result: ValidationResult): void {
    if (!config.authentication?.jwtSecret) {
      result.errors.push('JWT Secret não configurado');
      result.valid = false;
    }

    if (config.authentication?.jwtSecret === 'CHANGE_THIS_IN_PRODUCTION') {
      result.warnings.push('JWT Secret ainda está com valor padrão - ALTERAR EM PRODUÇÃO');
    }

    const expectedRoles = ['admin', 'manager', 'cd_operator', 'consultor', 'affiliate', 'customer'];
    const actualRoles = Object.keys(config.roles || {});
    
    expectedRoles.forEach(role => {
      if (!actualRoles.includes(role)) {
        result.errors.push(`Role ausente: ${role}`);
        result.valid = false;
      }
    });

    if (!config.rateLimiting?.enabled) {
      result.warnings.push('Rate limiting está desabilitado');
    }
  }

  /**
   * Validação genérica
   */
  private validateGeneric(config: any, result: ValidationResult): void {
    if (!config.meta && !config.$schema) {
      result.warnings.push('Falta meta ou $schema');
    }

    if (config.meta && !config.meta.version) {
      result.warnings.push('Falta versão no meta');
    }
  }

  /**
   * Gera relatório
   */
  public generateReport(): string {
    const total = this.results.length;
    const valid = this.results.filter(r => r.valid).length;
    const invalid = total - valid;
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = this.results.reduce((sum, r) => sum + r.warnings.length, 0);

    let report = '\n';
    report += '='.repeat(70) + '\n';
    report += '📊 RELATÓRIO DE VALIDAÇÃO - RS-CONFIG\n';
    report += '='.repeat(70) + '\n\n';
    report += `Total de configs: ${total}\n`;
    report += `✅ Válidos: ${valid}\n`;
    report += `❌ Inválidos: ${invalid}\n`;
    report += `🔴 Erros: ${totalErrors}\n`;
    report += `⚠️  Avisos: ${totalWarnings}\n\n`;

    this.results.forEach(result => {
      const icon = result.valid ? '✅' : '❌';
      report += `${icon} ${result.file}\n`;
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          report += `   🔴 ERRO: ${error}\n`;
        });
      }
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          report += `   ⚠️  AVISO: ${warning}\n`;
        });
      }
      
      report += '\n';
    });

    report += '='.repeat(70) + '\n';
    
    if (invalid === 0 && totalErrors === 0) {
      report += '🎉 TODOS OS CONFIGS ESTÃO VÁLIDOS!\n';
    } else {
      report += `⚠️  ATENÇÃO: ${invalid} config(s) inválido(s) com ${totalErrors} erro(s)\n`;
    }
    
    report += '='.repeat(70) + '\n';

    return report;
  }
}

/**
 * Execução direta
 */
if (require.main === module) {
  const validator = new ConfigValidator();
  validator.validateAll();
  console.log(validator.generateReport());
}

export default ConfigValidator;
