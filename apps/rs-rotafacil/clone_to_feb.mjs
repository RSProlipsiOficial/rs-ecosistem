import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const ROBERTO_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function cloneToFebruary() {
    console.log('--- REPLICANDO CUSTOS FIXOS PARA FEVEREIRO 2026 ---');

    // 1. Buscar Lançamentos de Janeiro (Despesas e Ganhos Extras)
    const { data: oldLancamentos } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .eq('competencia', '2026-01')
        .not('origem', 'eq', 'mensalidade'); // Não queremos clonar mensalidades, já geramos elas.

    console.log(`Encontrados ${oldLancamentos?.length || 0} registros base em Janeiro.`);

    if (!oldLancamentos) return;

    for (const item of oldLancamentos) {
        // Criar novo objeto sem o ID original
        const { id, created_at, updated_at, ...newData } = item;

        // Ajustar competência e data
        newData.competencia = '2026-02';
        if (newData.data_evento) {
            const day = newData.data_evento.substring(8, 10) || '01';
            newData.data_evento = `2026-02-${day}`;
        }

        // Se já estava pago, voltamos para pendente pois é um novo mês (exceto se o usuário disser o contrário)
        // Mas para "restaurar" o que ele tinha, vamos manter o status de 'previsto' / 'pendente' 
        newData.pagamento_status = 'pendente';
        newData.status = 'previsto';
        newData.pago_em = null;

        const { error } = await supabase.from('lancamentos_financeiros').insert([newData]);
        if (error) console.error(`Erro ao clonar ${newData.descricao}:`, error.message);
        else console.log(`Sucesso: ${newData.descricao}`);
    }

    // 2. Sincronizar também a tabela de 'gastos' (se usada separadamente pela UI)
    const { data: oldGastos } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .eq('competencia', '2026-01');

    for (const gasto of oldGastos || []) {
        const { id, created_at, ...newGasto } = gasto;
        newGasto.competencia = '2026-02';
        if (newGasto.data_gasto) {
            const day = newGasto.data_gasto.substring(8, 10) || '01';
            newGasto.data_gasto = `2026-02-${day}`;
        }
        newGasto.status = 'pendente';
        await supabase.from('gastos').insert([newGasto]);
    }

    // 3. Mesma coisa para 'ganhos_extras'
    const { data: oldGanhos } = await supabase
        .from('ganhos_extras')
        .select('*')
        .eq('user_id', ROBERTO_ID); // Aqui não tem competencia, vamos ver pela data

    // Filtro manual por data de Janeiro
    const janGanhos = oldGanhos?.filter(g => g.data_ganho.startsWith('2026-01')) || [];

    for (const ganho of janGanhos) {
        const { id, created_at, updated_at, ...newGanho } = ganho;
        const day = newGanho.data_ganho.substring(8, 10) || '01';
        newGanho.data_ganho = `2026-02-${day}`;
        await supabase.from('ganhos_extras').insert([newGanho]);
    }

    console.log('Clonagem concluída.');
}

cloneToFebruary();
