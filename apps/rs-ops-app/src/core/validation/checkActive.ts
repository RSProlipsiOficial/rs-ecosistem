/**
 * Verifica se consultor está ativo
 */

import { getConsultorById } from '../../services/supabaseService';
import { logEvent } from '../../utils/log';

export async function checkActive(consultorId: string): Promise<boolean> {
  try {
    const consultor = await getConsultorById(consultorId);
    
    if (!consultor) {
      logEvent("validation.not_found", { consultorId });
      return false;
    }

    const isActive = consultor.active === true;
    
    logEvent("validation.active", { 
      consultorId, 
      isActive 
    });

    return isActive;

  } catch (error: any) {
    logEvent("validation.active.error", { 
      consultorId, 
      error: error.message 
    });
    return false;
  }
}
