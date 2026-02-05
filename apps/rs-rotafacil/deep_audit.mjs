import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function deepAudit() {
    console.log('--- AUDITORIA PROFUNDA: BUSCANDO GASTOS E DUPLICIDADES ---');

    // 1. Verificar Duplicidades em Ganhos Avulsos para Fevereiro
    const { data: ganhosFev } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('competencia', '2026-02')
        .eq('tipo', 'receita')
        .not('origem', 'eq', 'mensalidade');

    console.log(`\nGanhos Avulsos em Fevereiro encontrados: ${ganhosFev?.length || 0}`);
    ganhosFev?.forEach(g => console.log(`- ${g.descricao} | Valor: ${g.valor} | ID: ${g.id} | User: ${g.user_id}`));

    // 2. Buscar por Gastos "Desaparecidos" (~25k) em TODO O BANCO
    // Roberto mencionou: colaboradores, parcelas dos carros, internet.
    const { data: allGastos } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('tipo', 'despesa')
        .limit(100);

    console.log(`\nAmostra de 100 Despesas no Banco:`);
    const totalDespesasGeral = allGastos?.reduce((acc, curr) => acc + curr.valor, 0) || 0;
    console.log(`Total Despesas (Amostra): R$ ${totalDespesasGeral.toFixed(2)}`);

    // Agrupar por user_id para ver se os 25k estão em outro lugar
    const statsByUser = {};
    allGastos?.forEach(g => {
        statsByUser[g.user_id] = (statsByUser[g.user_id] || 0) + g.valor;
    });
    console.log('\nDespesas por User ID (Amostra):', statsByUser);

    // 3. Verificar especificamente descrições citadas pelo Roberto
    const searchTerms = ['Internet', 'Parcela', 'Van', 'Salário', 'Mercado Pago'];
    for (const term of searchTerms) {
        const { data: matches } = await supabase
            .from('lancamentos_financeiros')
            .select('*')
            .ilike('descricao', `%${term}%`);
        console.log(`\nBusca por "${term}": ${matches?.length || 0} registros.`);
        if (matches && matches.length > 0) {
            console.log(`Exemplo: ${matches[0].descricao} | Valor: ${matches[0].valor} | User: ${matches[0].user_id}`);
        }
    }

    // 4. Verificar tabela de Vans (para achar o tal "ID da Empresa")
    const { data: vans } = await supabase.from('vans').select('*');
    console.log('\nConfiguração de Vans:', vans?.map(v => ({ id: v.id, nome: v.nome, user_id: v.user_id })));
}

deepAudit();
