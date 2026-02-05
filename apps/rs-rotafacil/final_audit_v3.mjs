import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const ROBERTO_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function finalAudit() {
    console.log('--- AUDITORIA DE FEVEREIRO: GASTOS E DUPLICIDADES ---');

    // 1. Listar e Somar Ganhos Avulsos (Não-Mensalidade) de Fevereiro
    const { data: ganhos } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .eq('competencia', '2026-02')
        .eq('tipo', 'receita')
        .not('origem', 'eq', 'mensalidade');

    console.log(`\n--- GANHOS AVULSOS (FEV/2026) ---`);
    ganhos?.forEach(g => console.log(`ID: ${g.id} | Desc: ${g.descricao} | Valor: ${g.valor}`));

    // 2. Listar e Somar TODAS as Despesas de Fevereiro
    const { data: despesas } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .eq('competencia', '2026-02')
        .eq('tipo', 'despesa');

    console.log(`\n--- DESPESAS (FEV/2026) ---`);
    const totalDespesas = despesas?.reduce((s, d) => s + d.valor, 0) || 0;
    despesas?.forEach(d => console.log(`ID: ${d.id} | Desc: ${d.descricao} | Valor: ${d.valor}`));
    console.log(`\nTotal Despesas Fevereiro: R$ ${totalDespesas.toFixed(2)}`);

    // 3. Buscar Gastos em Janeiro que NÃO estão em Fevereiro (para saber o que falta clonar)
    const { data: janDespesas } = await supabase
        .from('lancamentos_financeiros')
        .select('descricao, valor')
        .eq('user_id', ROBERTO_ID)
        .eq('competencia', '2026-01')
        .eq('tipo', 'despesa');

    const fevDespesasNames = new Set(despesas?.map(d => d.descricao));
    console.log(`\n--- DESPESAS EM JANEIRO QUE FALTAM EM FEVEREIRO ---`);
    janDespesas?.forEach(d => {
        if (!fevDespesasNames.has(d.descricao)) {
            console.log(`FALTANDO: ${d.descricao} | Valor: ${d.valor}`);
        }
    });

}

finalAudit();
