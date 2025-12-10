/**
 * RS PRÓLIPSI - CÁLCULO TOP SIGMA
 * Sistema TOTALMENTE ABERTO - sem limite de lateralidade ou profundidade
 */

// ================================================
// TIPOS
// ================================================

interface ConsultorCycles {
  consultor_id: string;
  nome: string;
  pin_atual: string;
  total_ciclos_mes: number;
  total_volume: number;
}

interface TopSigmaResult {
  consultor_id: string;
  nome: string;
  posicao: number;
  total_ciclos: number;
  total_volume: number;
  elegivel: boolean;
  valor_pool?: number;
}

// ================================================
// CÁLCULO TOP SIGMA
// ================================================

/**
 * Calcula ranking para o pool Top SIGMA
 * 
 * REGRAS:
 * 1. SEM LIMITE de lateralidade (pode ter 1000 linhas)
 * 2. SEM LIMITE de profundidade (conta TODA a rede)
 * 3. Conta TODOS os ciclos de TODA a equipe
 * 4. Pool distribuído entre os Top 10 do mês
 * 
 * @param periodo - 'YYYY-MM' (ex: '2025-11')
 * @returns Array com Top 10 consultores
 */
export async function calculateTopSigmaRanking(
  periodo: string
): Promise<TopSigmaResult[]> {
  
  // 1. Buscar TODOS os ciclos do mês de TODA a rede
  const allCycles = await getAllCyclesForPeriod(periodo);
  
  // 2. Agrupar por consultor (soma TODA a equipe abaixo)
  const consultorTotals = await aggregateCyclesByConsultor(allCycles);
  
  // 3. Ordenar por total de ciclos (descendente)
  consultorTotals.sort((a, b) => {
    if (b.total_ciclos_mes !== a.total_ciclos_mes) {
      return b.total_ciclos_mes - a.total_ciclos_mes;
    }
    // Desempate por volume
    return b.total_volume - a.total_volume;
  });
  
  // 4. Pegar Top 10
  const top10 = consultorTotals.slice(0, 10);
  
  // 5. Calcular valor do pool (4.5% do total de ciclos)
  const totalCyclesValue = allCycles.reduce((sum, c) => sum + c.cycle_value, 0);
  const poolTotal = totalCyclesValue * 0.045; // 4.5%
  
  // 6. Distribuir pool conforme posição
  const distribuicao = {
    1: 20.00,  // 20%
    2: 15.00,  // 15%
    3: 12.00,  // 12%
    4: 10.00,
    5: 9.00,
    6: 8.00,
    7: 7.00,
    8: 6.00,
    9: 6.50,
    10: 6.50
  };
  
  const resultado: TopSigmaResult[] = top10.map((consultor, index) => {
    const posicao = index + 1;
    const percentual = distribuicao[posicao as keyof typeof distribuicao] || 0;
    const valor = poolTotal * (percentual / 100);
    
    return {
      consultor_id: consultor.consultor_id,
      nome: consultor.nome,
      posicao,
      total_ciclos: consultor.total_ciclos_mes,
      total_volume: consultor.total_volume,
      elegivel: true,
      valor_pool: valor
    };
  });
  
  return resultado;
}

/**
 * Calcula os ciclos de TODA a rede de um consultor
 * INCLUI:
 * - Ciclos próprios
 * - Ciclos de TODAS as linhas diretas
 * - Ciclos de TODOS os níveis de profundidade
 * 
 * Exemplo: Se consultor tem 1000 linhas e cada uma tem 10 níveis,
 * TODOS os ciclos de TODOS os membros contam!
 */
export async function calculateTotalNetworkCycles(
  consultorId: string,
  periodo: string
): Promise<{
  ciclos_proprios: number;
  ciclos_rede: number;
  total_ciclos: number;
  total_volume: number;
  linhas_ativas: number;
  niveis_profundidade: number;
}> {
  
  // 1. Ciclos próprios do consultor
  const ciclosProprios = await getConsultorCyclesForPeriod(consultorId, periodo);
  
  // 2. Buscar TODA a rede (sem limite de profundidade ou lateralidade)
  const redeCompleta = await getAllDownlines(consultorId);
  
  // 3. Buscar ciclos de TODOS os membros da rede
  let ciclosRede = 0;
  let volumeRede = 0;
  
  for (const membro of redeCompleta) {
    const ciclosMembro = await getConsultorCyclesForPeriod(membro.id, periodo);
    ciclosRede += ciclosMembro.total;
    volumeRede += ciclosMembro.volume;
  }
  
  // 4. Calcular estatísticas da rede
  const linhasAtivas = redeCompleta.filter(m => m.nivel === 1 && m.ativo).length;
  const nivelMaximo = Math.max(...redeCompleta.map(m => m.nivel), 0);
  
  return {
    ciclos_proprios: ciclosProprios.total,
    ciclos_rede: ciclosRede,
    total_ciclos: ciclosProprios.total + ciclosRede,
    total_volume: ciclosProprios.volume + volumeRede,
    linhas_ativas: linhasAtivas,
    niveis_profundidade: nivelMaximo
  };
}

/**
 * Distribui o pool Top SIGMA entre os elegíveis
 */
export async function distributeTopSigmaPool(
  periodo: string
): Promise<{
  pool_total: number;
  distribuido: number;
  top10: TopSigmaResult[];
}> {
  
  const ranking = await calculateTopSigmaRanking(periodo);
  
  const poolTotal = ranking.reduce((sum, r) => sum + (r.valor_pool || 0), 0);
  
  // Creditar valor na carteira de cada consultor
  for (const consultor of ranking) {
    if (consultor.valor_pool && consultor.valor_pool > 0) {
      await creditWalletTopSigma(
        consultor.consultor_id,
        consultor.valor_pool,
        periodo,
        consultor.posicao
      );
      
      // Registrar bônus
      await registerBonus({
        consultor_id: consultor.consultor_id,
        tipo: 'top_sigma',
        subtipo: `Posição ${consultor.posicao}`,
        percentual: 4.5,
        valor: consultor.valor_pool,
        status: 'pago',
        descricao: `Pool Top SIGMA ${periodo} - Posição #${consultor.posicao}`
      });
    }
  }
  
  return {
    pool_total: poolTotal,
    distribuido: poolTotal,
    top10: ranking
  };
}

// ================================================
// HELPERS - SUPABASE
// ================================================

async function getAllCyclesForPeriod(periodo: string): Promise<any[]> {
  // TODO: SELECT de matriz_cycles WHERE EXTRACT(MONTH) = periodo
  console.log(`📊 Buscando ciclos do período ${periodo}`);
  return [];
}

async function aggregateCyclesByConsultor(cycles: any[]): Promise<ConsultorCycles[]> {
  // TODO: GROUP BY consultor_id
  return [];
}

async function getConsultorCyclesForPeriod(consultorId: string, periodo: string): Promise<{
  total: number;
  volume: number;
}> {
  // TODO: COUNT cycles WHERE consultor_id AND periodo
  return { total: 0, volume: 0 };
}

async function getAllDownlines(consultorId: string): Promise<any[]> {
  // TODO: SELECT recursivo de downlines (TODA a rede)
  console.log(`👥 Buscando TODA a rede de ${consultorId}`);
  return [];
}

async function creditWalletTopSigma(
  consultorId: string,
  valor: number,
  periodo: string,
  posicao: number
): Promise<void> {
  console.log(`💰 Creditar R$ ${valor} para ${consultorId} (Top ${posicao})`);
}

async function registerBonus(bonus: any): Promise<void> {
  console.log(`💎 Registrar bônus:`, bonus);
}

// ================================================
// EXPORTS
// ================================================

export default {
  calculateTopSigmaRanking,
  calculateTotalNetworkCycles,
  distributeTopSigmaPool
};
