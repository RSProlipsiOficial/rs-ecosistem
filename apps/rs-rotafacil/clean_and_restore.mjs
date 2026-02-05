import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const ROBERTO_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function finalFix() {
    console.log('--- LIMPANDO DUPLICIDADES E RESTAURANDO GASTOS ---');

    // 1. Limpar Ganhos Avulsos Duplicados em Fevereiro
    const { data: fevGanhos } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .eq('competencia', '2026-02')
        .eq('tipo', 'receita')
        .not('origem', 'eq', 'mensalidade');

    const seenGanhos = new Set();
    for (const g of fevGanhos || []) {
        const key = `${g.descricao}-${g.valor}`;
        if (seenGanhos.has(key)) {
            console.log(`Deletando Duplicidade Ganho: ${g.descricao}`);
            await supabase.from('lancamentos_financeiros').delete().eq('id', g.id);
        } else {
            seenGanhos.add(key);
        }
    }

    // 2. Limpar Lançamentos de Despesa Duplicados (se houver algum do script anterior)
    const { data: fevDespesas } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .eq('competencia', '2026-02')
        .eq('tipo', 'despesa');

    // 3. Pegar TODAS as despesas de Janeiro para replicar as que faltam
    const { data: janDespesas } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .eq('competencia', '2026-01')
        .eq('tipo', 'despesa');

    const currentFevNames = new Set(fevDespesas?.map(d => d.descricao));

    console.log(`\nReplicando gastos faltantes...`);
    for (const d of janDespesas || []) {
        if (!currentFevNames.has(d.descricao)) {
            const { id, created_at, updated_at, ...newData } = d;
            newData.competencia = '2026-02';
            if (newData.data_evento) {
                const day = newData.data_evento.substring(8, 10) || '01';
                newData.data_evento = `2026-02-${day}`;
            }
            if (newData.referencia_id) {
                newData.referencia_id = newData.referencia_id.replace('2026-01', '2026-02');
            }
            newData.pagamento_status = 'pendente';
            newData.status = 'previsto';
            newData.pago_em = null;

            const { error } = await supabase.from('lancamentos_financeiros').insert([newData]);
            if (error) console.error(`Erro ao clonar ${newData.descricao}:`, error.message);
            else console.log(`Sucesso: ${newData.descricao} | R$ ${newData.valor}`);
        }
    }

    console.log('Fim do processamento.');
}

finalFix();
