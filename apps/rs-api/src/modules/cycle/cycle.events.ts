import { onCycleComplete } from "../../core/trigger";

/**
 * Eventos de ciclo - dispara quando um consultor completa um ciclo
 */
export function handleCycleCompleted(userId: string, level: number) {
  const result = onCycleComplete(userId, level);
  
  // Aqui você pode adicionar lógica para:
  // - Salvar no banco
  // - Notificar outros sistemas
  // - Disparar webhooks
  // - Enviar notificações
  
  console.log(`[CYCLE] Usuário ${userId} completou ciclo no nível ${level}`);
  console.log(`[CYCLE] Bônus direto: R$ ${result.results.totalCycleBonus}`);
  console.log(`[CYCLE] Profundidade:`, result.results.depth);
  console.log(`[CYCLE] Pool Fidelidade: R$ ${result.results.fidelity}`);
  console.log(`[CYCLE] Pool Top SIGMA: R$ ${result.results.topSigma}`);
  
  return result;
}
