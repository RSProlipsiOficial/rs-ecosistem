import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const ROBERTO_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function finalVerification() {
    console.log('--- VERIFICAÇÃO FINAL DE DADOS ---');

    // 1. Mensalidades
    const { data: mensalidades } = await supabase.from('pagamentos_mensais').select('id').eq('user_id', ROBERTO_ID).eq('mes', 2).eq('ano', 2026);
    console.log(`Total Mensalidades Fevereiro: ${mensalidades?.length}`);

    // 2. Lançamentos Financeiros (Fluxo de Caixa)
    const { data: lancamentos } = await supabase.from('lancamentos_financeiros').select('valor').eq('user_id', ROBERTO_ID).eq('competencia', '2026-02').eq('tipo', 'receita');
    const totalEntradas = lancamentos?.reduce((acc, curr) => acc + curr.valor, 0) || 0;
    console.log(`Total Entradas Fevereiro: R$ ${totalEntradas.toFixed(2)}`);

    // 3. Gastos e Ganhos Extras
    const { data: gastos } = await supabase.from('gastos').select('id').eq('user_id', ROBERTO_ID);
    const { data: extras } = await supabase.from('ganhos_extras').select('id').eq('user_id', ROBERTO_ID);
    console.log(`Total Gastos: ${gastos?.length}, Total Ganhos Avulsos: ${extras?.length}`);

    if (mensalidades?.length === 59 && totalEntradas > 12000) {
        console.log('STATUS: SUCESSO TOTAL');
    } else {
        console.log('STATUS: VERIFICAR DISCREPÂNCIAS');
    }
}

finalVerification();
