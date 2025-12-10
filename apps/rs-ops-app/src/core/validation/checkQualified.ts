/**
 * Verifica qualificações do consultor
 */

import { getConsultorById, getDownlines } from '../../services/supabaseService';
import { logEvent } from '../../utils/log';

export interface QualificationResult {
  isQualified: boolean;
  hasMinimumDirects: boolean;
  hasCycled: boolean;
  isActive: boolean;
}

export async function checkQualified(consultorId: string): Promise<QualificationResult> {
  try {
    const consultor = await getConsultorById(consultorId);
    const downlines = await getDownlines(consultorId);

    const result: QualificationResult = {
      isQualified: false,
      hasMinimumDirects: downlines.length >= 6,
      hasCycled: (consultor?.cycles_count || 0) > 0,
      isActive: consultor?.active === true,
    };

    result.isQualified = result.hasMinimumDirects && result.isActive;

    logEvent("validation.qualified", { 
      consultorId, 
      ...result 
    });

    return result;

  } catch (error: any) {
    logEvent("validation.qualified.error", { 
      consultorId, 
      error: error.message 
    });
    
    return {
      isQualified: false,
      hasMinimumDirects: false,
      hasCycled: false,
      isActive: false,
    };
  }
}
