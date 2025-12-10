/**
 * Motor de Compressão Dinâmica da Matriz SIGMA
 * RS Prólipsi - Matrix Compression Engine
 * 
 * Implementa compressão automática e redistribuição de overflow
 * conforme especificado no manual oficial
 */

import { createClient } from '@supabase/supabase-js';

interface MatrixSlot {
  id: string;
  matrix_id: string;
  position: number;
  user_id: string | null;
  filled_at: Date | null;
  status: 'empty' | 'filled' | 'completed';
}

interface Matrix {
  id: string;
  owner_id: string;
  level: number;
  status: 'active' | 'completed' | 'compressed';
  slots_filled: number;
  created_at: Date;
}

interface CompressionResult {
  success: boolean;
  matrices_compressed: number;
  slots_redistributed: number;
  new_matrices_created: number;
  errors: string[];
}

/**
 * Motor de Compressão Dinâmica
 */
export class MatrixCompressionEngine {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Executa compressão completa do sistema
   */
  public async executeFullCompression(): Promise<CompressionResult> {
    const result: CompressionResult = {
      success: true,
      matrices_compressed: 0,
      slots_redistributed: 0,
      new_matrices_created: 0,
      errors: []
    };

    try {
      // 1. Buscar todas as matrizes completadas
      const completedMatrices = await this.getCompletedMatrices();
      
      for (const matrix of completedMatrices) {
        try {
          await this.compressMatrix(matrix, result);
        } catch (error) {
          result.errors.push(`Erro ao comprimir matriz ${matrix.id}: ${error.message}`);
          result.success = false;
        }
      }

      // 2. Redistribuir overflow
      await this.redistributeOverflow(result);

      // 3. Criar reentradas automáticas
      await this.createAutomaticReentries(result);

    } catch (error) {
      result.success = false;
      result.errors.push(`Erro geral: ${error.message}`);
    }

    return result;
  }

  /**
   * Busca matrizes completadas
   */
  private async getCompletedMatrices(): Promise<Matrix[]> {
    const { data, error } = await this.supabase
      .from('matriz_cycles')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Comprime uma matriz específica
   */
  private async compressMatrix(matrix: Matrix, result: CompressionResult): Promise<void> {
    // 1. Marcar matriz como comprimida
    await this.supabase
      .from('matriz_cycles')
      .update({ 
        status: 'compressed',
        compressed_at: new Date().toISOString()
      })
      .eq('id', matrix.id);

    // 2. Processar bônus do ciclo
    await this.processCycleBonus(matrix);

    // 3. Registrar no ledger
    await this.registerCycleLedger(matrix);

    result.matrices_compressed++;
  }

  /**
   * Processa bônus do ciclo completado
   */
  private async processCycleBonus(matrix: Matrix): Promise<void> {
    const cycleBonus = 108.00; // 30% de R$ 360

    // Creditar bônus do ciclo
    await this.supabase.rpc('credit_wallet', {
      p_user_id: matrix.owner_id,
      p_amount: cycleBonus,
      p_type: 'cycle_bonus',
      p_description: `Bônus de ciclo completado - Matriz ${matrix.id}`
    });

    // Processar bônus de profundidade (L1-L6)
    await this.processDepthBonus(matrix);
  }

  /**
   * Processa bônus de profundidade
   */
  private async processDepthBonus(matrix: Matrix): Promise<void> {
    const depthBonuses = [
      { level: 1, percentage: 0.07, value: 1.716 },
      { level: 2, percentage: 0.08, value: 1.961 },
      { level: 3, percentage: 0.10, value: 2.452 },
      { level: 4, percentage: 0.15, value: 3.677 },
      { level: 5, percentage: 0.25, value: 6.129 },
      { level: 6, percentage: 0.35, value: 8.581 }
    ];

    // Buscar upline até L6
    const upline = await this.getUpline(matrix.owner_id, 6);

    for (let i = 0; i < upline.length && i < 6; i++) {
      const bonus = depthBonuses[i];
      const uplineUser = upline[i];

      // Verificar se upline está ativo
      const isActive = await this.isUserActive(uplineUser.id);
      if (!isActive) continue;

      // Creditar bônus
      await this.supabase.rpc('credit_wallet', {
        p_user_id: uplineUser.id,
        p_amount: bonus.value,
        p_type: 'depth_bonus',
        p_description: `Bônus L${bonus.level} - Downline ${matrix.owner_id}`
      });
    }
  }

  /**
   * Busca upline até N níveis
   */
  private async getUpline(userId: string, levels: number): Promise<any[]> {
    const upline = [];
    let currentUserId = userId;

    for (let i = 0; i < levels; i++) {
      const { data } = await this.supabase
        .from('consultores')
        .select('sponsor_id')
        .eq('id', currentUserId)
        .single();

      if (!data || !data.sponsor_id) break;

      const { data: sponsor } = await this.supabase
        .from('consultores')
        .select('*')
        .eq('id', data.sponsor_id)
        .single();

      if (sponsor) {
        upline.push(sponsor);
        currentUserId = sponsor.id;
      } else {
        break;
      }
    }

    return upline;
  }

  /**
   * Verifica se usuário está ativo
   */
  private async isUserActive(userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('consultores')
      .select('status')
      .eq('id', userId)
      .single();

    return data?.status === 'active';
  }

  /**
   * Registra ciclo no ledger
   */
  private async registerCycleLedger(matrix: Matrix): Promise<void> {
    await this.supabase
      .from('cycles_ledger')
      .insert({
        user_id: matrix.owner_id,
        cycle_type: 'matrix_complete',
        cycle_value: 360.00,
        bonus_paid: 108.00,
        period: new Date().toISOString().substring(0, 7), // YYYY-MM
        metadata: {
          matrix_id: matrix.id,
          level: matrix.level
        }
      });
  }

  /**
   * Redistribui overflow (spillover)
   */
  private async redistributeOverflow(result: CompressionResult): Promise<void> {
    // Buscar slots em overflow (derramamento)
    const { data: overflowSlots } = await this.supabase
      .from('matrix_overflow')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (!overflowSlots || overflowSlots.length === 0) return;

    for (const overflow of overflowSlots) {
      try {
        // Encontrar próxima posição disponível (linha ascendente)
        const nextSlot = await this.findNextAvailableSlot(overflow.user_id);

        if (nextSlot) {
          // Preencher slot
          await this.fillSlot(nextSlot.matrix_id, nextSlot.position, overflow.user_id);

          // Marcar overflow como processado
          await this.supabase
            .from('matrix_overflow')
            .update({ status: 'processed' })
            .eq('id', overflow.id);

          result.slots_redistributed++;
        }
      } catch (error) {
        result.errors.push(`Erro ao redistribuir overflow ${overflow.id}: ${error.message}`);
      }
    }
  }

  /**
   * Encontra próximo slot disponível (spillover ascendente)
   */
  private async findNextAvailableSlot(userId: string): Promise<any> {
    // Implementar lógica de spillover ascendente
    // 1. Buscar upline
    // 2. Verificar slots disponíveis na linha ascendente
    // 3. Retornar primeiro slot vazio

    const upline = await this.getUpline(userId, 999); // Ilimitado

    for (const sponsor of upline) {
      const { data: emptySlot } = await this.supabase
        .from('matrix_slots')
        .select('*')
        .eq('owner_id', sponsor.id)
        .eq('status', 'empty')
        .order('position', { ascending: true })
        .limit(1)
        .single();

      if (emptySlot) return emptySlot;
    }

    return null;
  }

  /**
   * Preenche um slot
   */
  private async fillSlot(matrixId: string, position: number, userId: string): Promise<void> {
    await this.supabase
      .from('matrix_slots')
      .update({
        user_id: userId,
        filled_at: new Date().toISOString(),
        status: 'filled'
      })
      .eq('matrix_id', matrixId)
      .eq('position', position);

    // Atualizar contador da matriz
    await this.supabase.rpc('increment_matrix_slots', {
      p_matrix_id: matrixId
    });

    // Verificar se completou
    await this.checkMatrixCompletion(matrixId);
  }

  /**
   * Verifica se matriz completou
   */
  private async checkMatrixCompletion(matrixId: string): Promise<void> {
    const { data: matrix } = await this.supabase
      .from('matriz_cycles')
      .select('slots_filled')
      .eq('id', matrixId)
      .single();

    if (matrix && matrix.slots_filled >= 6) {
      await this.supabase
        .from('matriz_cycles')
        .update({ status: 'completed' })
        .eq('id', matrixId);
    }
  }

  /**
   * Cria reentradas automáticas
   */
  private async createAutomaticReentries(result: CompressionResult): Promise<void> {
    // Buscar usuários que completaram ciclo e precisam de reentrada
    const { data: usersNeedingReentry } = await this.supabase
      .from('matriz_cycles')
      .select('owner_id')
      .eq('status', 'compressed')
      .eq('reentry_created', false);

    if (!usersNeedingReentry) return;

    for (const user of usersNeedingReentry) {
      try {
        // Verificar limite mensal (10 reentradas)
        const reentriesThisMonth = await this.getReentriesThisMonth(user.owner_id);
        
        if (reentriesThisMonth >= 10) {
          continue; // Limite atingido
        }

        // Criar nova matriz (reentrada)
        const { data: newMatrix } = await this.supabase
          .from('matriz_cycles')
          .insert({
            owner_id: user.owner_id,
            level: 1,
            status: 'active',
            slots_filled: 0,
            is_reentry: true
          })
          .select()
          .single();

        if (newMatrix) {
          // Criar 6 slots vazios
          const slots = Array.from({ length: 6 }, (_, i) => ({
            matrix_id: newMatrix.id,
            position: i + 1,
            status: 'empty'
          }));

          await this.supabase
            .from('matrix_slots')
            .insert(slots);

          result.new_matrices_created++;
        }
      } catch (error) {
        result.errors.push(`Erro ao criar reentrada para ${user.owner_id}: ${error.message}`);
      }
    }
  }

  /**
   * Conta reentradas do mês
   */
  private async getReentriesThisMonth(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, count } = await this.supabase
      .from('matriz_cycles')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('is_reentry', true)
      .gte('created_at', startOfMonth.toISOString());

    return count || 0;
  }

  /**
   * Gera relatório de compressão
   */
  public generateReport(result: CompressionResult): string {
    let report = '\n';
    report += '='.repeat(70) + '\n';
    report += '📊 RELATÓRIO DE COMPRESSÃO DINÂMICA\n';
    report += '='.repeat(70) + '\n\n';
    report += `Status: ${result.success ? '✅ Sucesso' : '❌ Falha'}\n`;
    report += `Matrizes Comprimidas: ${result.matrices_compressed}\n`;
    report += `Slots Redistribuídos: ${result.slots_redistributed}\n`;
    report += `Novas Matrizes (Reentrada): ${result.new_matrices_created}\n`;
    report += `Erros: ${result.errors.length}\n\n`;

    if (result.errors.length > 0) {
      report += 'ERROS:\n';
      result.errors.forEach(error => {
        report += `  ❌ ${error}\n`;
      });
    }

    report += '='.repeat(70) + '\n';

    return report;
  }
}

/**
 * Execução via cron
 */
export async function runCompressionCron() {
  const engine = new MatrixCompressionEngine(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const result = await engine.executeFullCompression();
  console.log(engine.generateReport(result));

  return result;
}

export default MatrixCompressionEngine;
