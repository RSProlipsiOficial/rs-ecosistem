import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const ROBERTO_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function finalClone() {
    console.log('--- CORRIGINDO CLONAGEM FINANCEIRA ---');

    // 1. Buscar os que falharam (Salários e outros baseados em jan)
    const { data: oldLancamentos } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .eq('competencia', '2026-01')
        .not('origem', 'eq', 'mensalidade');

    for (const item of oldLancamentos || []) {
        const { id, created_at, updated_at, ...newData } = item;

        // Competencia e Datas
        newData.competencia = '2026-02';
        if (newData.data_evento) {
            const day = newData.data_evento.substring(8, 10) || '01';
            newData.data_evento = `2026-02-${day}`;
        }

        // Corrigir Referencia_id
        if (newData.referencia_id) {
            newData.referencia_id = newData.referencia_id.replace('2026-01', '2026-02');
        }

        newData.pagamento_status = 'pendente';
        newData.status = 'previsto';
        newData.pago_em = null;

        const { error } = await supabase.from('lancamentos_financeiros').insert([newData]);
        if (error) {
            if (error.code === '23505') {
                console.log(`Skipping (Already exists): ${newData.descricao}`);
            } else {
                console.error(`Erro:`, error.message);
            }
        } else {
            console.log(`Sucesso: ${newData.descricao}`);
        }
    }

    // 2. Garantir 'gastos' (Aluguel, etc) - No script anterior Aluguel tinha ID de referencia?
    // Vamos checar o que falta em 'gastos'
    const { data: existingFebGastos } = await supabase.from('gastos').select('descricao').eq('user_id', ROBERTO_ID).eq('competencia', '2026-02');
    const existingDesc = new Set(existingFebGastos?.map(g => g.descricao));

    const { data: oldGastos } = await supabase.from('gastos').select('*').eq('user_id', ROBERTO_ID).eq('competencia', '2026-01');

    for (const gasto of oldGastos || []) {
        if (existingDesc.has(gasto.descricao)) continue;

        const { id, created_at, ...newGasto } = gasto;
        newGasto.competencia = '2026-02';
        if (newGasto.data_gasto) {
            const day = newGasto.data_gasto.substring(8, 10) || '01';
            newGasto.data_gasto = `2026-02-${day}`;
        }
        newGasto.status = 'pendente';
        await supabase.from('gastos').insert([newGasto]);
        console.log(`Gasto clonado: ${newGasto.descricao}`);
    }

    console.log('Fim da restauração.');
}

finalClone();
