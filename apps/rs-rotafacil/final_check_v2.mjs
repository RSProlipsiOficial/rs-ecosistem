import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const ROBERTO_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function finalCheck() {
    console.log('--- VERIFICAÇÃO FINAL FEVEREIRO 2026 ---');

    const { data: lancamentos } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .eq('competencia', '2026-02');

    const entradas = lancamentos?.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0) || 0;
    const saidas = lancamentos?.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0) || 0;

    console.log(`Entradas Totais: R$ ${entradas.toFixed(2)}`);
    console.log(`Saídas Totais: R$ ${saidas.toFixed(2)}`);
    console.log(`Lançamentos Totais em Fev: ${lancamentos?.length || 0}`);
}

finalCheck();
