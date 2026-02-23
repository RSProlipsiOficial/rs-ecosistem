import { supabaseAdmin } from '../lib/supabaseClient';
import { rules } from '../config';

/**
 * SERVIÇO DE FECHAMENTO DE CICLOS (RS PROLIPSI)
 * Gerencia o disparador manual para pagamentos mensais e graduações trimestrais.
 */
export const cycleClosingService = {
    /**
     * FECHAMENTO MENSAL
     * 1. Processa e paga Pool Top Sigma (4.5%)
     * 2. Processa e paga Pool Fidelidade (1.25%)
     * 3. Consolida bônus de profundidade (se houver pendentes)
     * 4. Paga Recompensa do PIN atual
     */
    async closeMonthlyCycle() {
        console.log('🏁 Iniciando Fechamento Mensal...');
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // 1. Calcular volume total do mês (Ciclos SIGMA)
        const { data: cycles } = await supabaseAdmin
            .from('cycle_events')
            .select('cycle_value')
            .gte('created_at', firstDayOfMonth);

        const totalVolume = cycles?.reduce((sum, c) => sum + (Number(c.cycle_value) || 0), 0) || 0;
        console.log(`📊 Volume Total do Mês: R$ ${totalVolume}`);

        // 2. Pool Top Sigma (4.5%)
        const topSigmaPool = totalVolume * (rules.topSigma.poolPct / 100);
        // TODO: Buscar o Top 10 e distribuir conforme pesos em rules.topSigma.top10Weights

        // 3. Pool Fidelidade (1.25%)
        const fidelityPool = totalVolume * (rules.fidelity.poolPct / 100);
        // TODO: Distribuir entre os qualificados (reentrada ativa)

        // 4. Registrar Log de Fechamento
        const { data: closingLog } = await supabaseAdmin
            .from('cycle_closings')
            .insert({
                type: 'MENSAL',
                period: `${now.getMonth() + 1}/${now.getFullYear()}`,
                total_volume: totalVolume,
                bonus_distributed: 0, // Soma total paga
                status: 'COMPLETADO',
                executed_at: now.toISOString()
            })
            .select()
            .single();

        return {
            success: true,
            summary: {
                volume: totalVolume,
                topSigmaPool,
                fidelityPool,
                logId: closingLog?.id
            }
        };
    },

    /**
     * FECHAMENTO TRIMESTRAL
     * 1. Avalia acúmulo de volume/ciclos dos últimos 3 meses
     * 2. Atualiza PIN (Graduação) de todos os consultores
     * 3. Processa Bônus Drop Afiliado
     */
    async closeQuarterlyCycle() {
        console.log('🏁 Iniciando Fechamento Trimestral...');
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1).toISOString();

        // 1. Buscar todos os acumuladores sigma
        const { data: accumulators } = await supabaseAdmin
            .from('sigma_accumulators')
            .select('*');

        // 2. Avaliar graduação para cada consultor
        // Lógica: Comparar cycles_total (ou cycles no trimestre) com a tabela career_levels_digital

        return {
            success: true,
            message: 'Fechamento trimestral processado (Simulação - Lógica em desenvolvimento)'
        };
    },

    /**
     * HISTÓRICO DE FECHAMENTOS
     */
    async getHistory() {
        const { data } = await supabaseAdmin
            .from('cycle_closings')
            .select('*')
            .order('executed_at', { ascending: false });
        return data || [];
    }
};
