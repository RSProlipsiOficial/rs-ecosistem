/**
 * RS PRÓLIPSI - VALIDAÇÃO DO PLANO DE CARREIRA
 * Valida career.json antes de usar no sistema
 */

import careerConfig from '../settings/carreira.json';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida a configuração completa do plano de carreira
 */
export function validateCareerConfig(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. Validar estrutura básica
  if (!careerConfig.meta) {
    errors.push('Campo "meta" ausente');
  }
  
  if (!careerConfig.window) {
    errors.push('Campo "window" ausente');
  }
  
  if (!careerConfig.pins || !Array.isArray(careerConfig.pins)) {
    errors.push('Campo "pins" ausente ou não é array');
  }
  
  // 2. Validar 13 PINs
  if (careerConfig.pins.length !== 13) {
    errors.push(`Devem existir 13 PINs. Encontrados: ${careerConfig.pins.length}`);
  }
  
  // 3. Validar pinOrder
  if (!careerConfig.display?.pinOrder || careerConfig.display.pinOrder.length !== 13) {
    errors.push('pinOrder deve ter 13 itens');
  }
  
  // 4. Validar quarters
  if (careerConfig.window?.type === 'quarterly') {
    if (!careerConfig.window.quarters || careerConfig.window.quarters.length !== 4) {
      errors.push('Deve haver 4 quarters (Q1, Q2, Q3, Q4)');
    }
    
    // Verificar se cobrem todos os meses
    const allMonths = careerConfig.window.quarters.flatMap(q => q.months);
    const expectedMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    for (const month of expectedMonths) {
      if (!allMonths.includes(month)) {
        errors.push(`Mês ${month} não está coberto pelos quarters`);
      }
    }
  }
  
  // 5. Validar cada PIN
  careerConfig.pins.forEach((pin, index) => {
    const pinNum = index + 1;
    
    // Código do PIN
    if (!pin.code || pin.code !== `PIN${String(pinNum).padStart(2, '0')}`) {
      errors.push(`PIN ${pinNum}: código inválido. Esperado: PIN${String(pinNum).padStart(2, '0')}, Encontrado: ${pin.code}`);
    }
    
    // Label
    if (!pin.label) {
      errors.push(`PIN ${pinNum}: label ausente`);
    }
    
    // Requirements
    if (!pin.requirements) {
      errors.push(`PIN ${pinNum}: requirements ausente`);
    } else {
      // minQuarterPoints deve ser número > 0
      if (typeof pin.requirements.minQuarterPoints !== 'number' || pin.requirements.minQuarterPoints <= 0) {
        errors.push(`PIN ${pinNum}: minQuarterPoints deve ser número > 0`);
      }
      
      // minActiveDirects deve ser número >= 0
      if (typeof pin.requirements.minActiveDirects !== 'number' || pin.requirements.minActiveDirects < 0) {
        errors.push(`PIN ${pinNum}: minActiveDirects deve ser número >= 0`);
      }
      
      // vmecPercentages deve ser array
      if (!Array.isArray(pin.requirements.vmecPercentages)) {
        errors.push(`PIN ${pinNum}: vmecPercentages deve ser array`);
      } else {
        // Se tem linhas requeridas, VMEC deve ter o mesmo tamanho
        if (pin.requirements.minLinesContributing > 0 && 
            pin.requirements.vmecPercentages.length !== pin.requirements.minLinesContributing) {
          warnings.push(`PIN ${pinNum}: vmecPercentages tem ${pin.requirements.vmecPercentages.length} itens mas minLinesContributing é ${pin.requirements.minLinesContributing}`);
        }
        
        // Soma dos percentuais VMEC deve ser <= 100
        const somaVmec = pin.requirements.vmecPercentages.reduce((a, b) => a + b, 0);
        if (somaVmec > 100) {
          errors.push(`PIN ${pinNum}: soma dos VMEC (${somaVmec}%) excede 100%`);
        }
      }
    }
    
    // Benefits
    if (!pin.benefits) {
      errors.push(`PIN ${pinNum}: benefits ausente`);
    } else {
      if (typeof pin.benefits.reward !== 'number' || pin.benefits.reward < 0) {
        errors.push(`PIN ${pinNum}: reward deve ser número >= 0`);
      }
    }
    
    // Retention
    if (!pin.retention) {
      errors.push(`PIN ${pinNum}: retention ausente`);
    }
  });
  
  // 6. Validar VMEC config
  if (careerConfig.vmec) {
    if (!careerConfig.vmec.enabled) {
      warnings.push('VMEC está desabilitado');
    }
    
    if (careerConfig.vmec.linesEligibleDepth !== 'unlimited') {
      warnings.push('linesEligibleDepth não é "unlimited" - pode limitar profundidade');
    }
    
    if (careerConfig.vmec.linesEligibleWidth !== 'unlimited') {
      warnings.push('linesEligibleWidth não é "unlimited" - pode limitar lateralidade');
    }
  }
  
  // 7. Validar pointsPerMatrixCycle
  if (careerConfig.window?.pointsPerMatrixCycle !== 1) {
    warnings.push(`pointsPerMatrixCycle é ${careerConfig.window?.pointsPerMatrixCycle}, esperado: 1`);
  }
  
  // 8. Validar eligibility
  if (careerConfig.eligibility) {
    if (!careerConfig.eligibility.activeStatusRequired) {
      warnings.push('activeStatusRequired está false - consultores inativos podem qualificar');
    }
    
    if (!careerConfig.eligibility.kycRequired) {
      warnings.push('kycRequired está false - pode haver problemas de compliance');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida se um consultor qualifica para um PIN específico
 */
export function validatePinQualification(
  consultorData: {
    quarterPoints: number;
    activeDirects: number;
    linesContributing: number;
    isActive: boolean;
    hasKyc: boolean;
    hasPersonalPurchase: boolean;
  },
  pinCode: string
): { qualifies: boolean; reasons: string[] } {
  const pin = careerConfig.pins.find(p => p.code === pinCode);
  
  if (!pin) {
    return { qualifies: false, reasons: ['PIN não encontrado'] };
  }
  
  const reasons: string[] = [];
  
  // Verificar elegibilidade geral
  if (careerConfig.eligibility.activeStatusRequired && !consultorData.isActive) {
    reasons.push('Consultor não está ativo');
  }
  
  if (careerConfig.eligibility.kycRequired && !consultorData.hasKyc) {
    reasons.push('KYC não aprovado');
  }
  
  if (careerConfig.eligibility.minPersonalPurchase > 0 && !consultorData.hasPersonalPurchase) {
    reasons.push('Sem reentrada no trimestre');
  }
  
  // Verificar requirements do PIN
  if (consultorData.quarterPoints < pin.requirements.minQuarterPoints) {
    reasons.push(`Pontos insuficientes: ${consultorData.quarterPoints}/${pin.requirements.minQuarterPoints}`);
  }
  
  if (consultorData.activeDirects < pin.requirements.minActiveDirects) {
    reasons.push(`Linhas diretas insuficientes: ${consultorData.activeDirects}/${pin.requirements.minActiveDirects}`);
  }
  
  if (consultorData.linesContributing < pin.requirements.minLinesContributing) {
    reasons.push(`Linhas contribuindo insuficientes: ${consultorData.linesContributing}/${pin.requirements.minLinesContributing}`);
  }
  
  return {
    qualifies: reasons.length === 0,
    reasons
  };
}

/**
 * Retorna o próximo PIN que o consultor pode alcançar
 */
export function getNextPin(currentPinCode: string): typeof careerConfig.pins[0] | null {
  const currentIndex = careerConfig.pins.findIndex(p => p.code === currentPinCode);
  
  if (currentIndex === -1 || currentIndex === careerConfig.pins.length - 1) {
    return null; // Não encontrado ou já está no máximo
  }
  
  return careerConfig.pins[currentIndex + 1];
}

/**
 * Calcula progresso para o próximo PIN
 */
export function calculateProgressToNextPin(
  currentPinCode: string,
  quarterPoints: number
): {
  currentPin: string;
  nextPin: string | null;
  currentPoints: number;
  requiredPoints: number;
  progress: number;
  remaining: number;
} {
  const currentPin = careerConfig.pins.find(p => p.code === currentPinCode);
  const nextPin = getNextPin(currentPinCode);
  
  if (!currentPin) {
    return {
      currentPin: 'Unknown',
      nextPin: null,
      currentPoints: quarterPoints,
      requiredPoints: 0,
      progress: 0,
      remaining: 0
    };
  }
  
  if (!nextPin) {
    return {
      currentPin: currentPin.label,
      nextPin: null,
      currentPoints: quarterPoints,
      requiredPoints: currentPin.requirements.minQuarterPoints,
      progress: 100,
      remaining: 0
    };
  }
  
  const required = nextPin.requirements.minQuarterPoints;
  const progress = Math.min((quarterPoints / required) * 100, 100);
  const remaining = Math.max(required - quarterPoints, 0);
  
  return {
    currentPin: currentPin.label,
    nextPin: nextPin.label,
    currentPoints: quarterPoints,
    requiredPoints: required,
    progress: Math.round(progress * 100) / 100,
    remaining
  };
}

// Export default
export default {
  validateCareerConfig,
  validatePinQualification,
  getNextPin,
  calculateProgressToNextPin
};
