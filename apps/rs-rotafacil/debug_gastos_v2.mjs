import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const ROBERTO_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function debugGastos() {
    console.log('--- DEBUG DETALHADO GASTOS ---');

    const { data: gastos, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', ROBERTO_ID);

    if (error) console.error(error);

    console.log(`Encontrados ${gastos?.length || 0} gastos para o Roberto.`);

    gastos?.forEach(g => {
        console.log(`ID: ${g.id} | Desc: ${g.descricao} | Valor: ${g.valor} | Data: ${g.data_gasto} | Competência: ${g.competencia} | Categoria: ${g.categoria}`);
    });

    const { data: lancamentosGastos } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .eq('tipo', 'despesa');

    console.log(`\nLançamentos Financeiros (Despesas): ${lancamentosGastos?.length || 0}`);
    lancamentosGastos?.forEach(l => {
        console.log(`Desc: ${l.descricao} | Valor: ${l.valor} | Competência: ${l.competencia} | Status: ${l.pagamento_status}`);
    });
}

debugGastos();
