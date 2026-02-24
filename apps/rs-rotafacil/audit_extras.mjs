import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const TARGET_USER_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function auditExtras() {
    console.log('--- AUDITORIA DE GASTOS E GANHOS AVULSOS ---');

    // 1. Gastos
    const { data: gastos, error: errG } = await supabase.from('gastos').select('*').eq('user_id', TARGET_USER_ID);
    console.log(`\nGastos encontrados (${gastos?.length || 0}):`);
    if (gastos) gastos.slice(0, 5).forEach(g => console.log(`- ${g.descricao}: R$ ${g.valor} (Status: ${g.status})`));

    // 2. Ganhos Extras
    const { data: ganhos, error: errGE } = await supabase.from('ganhos_extras').select('*').eq('user_id', TARGET_USER_ID);
    console.log(`\nGanhos Extras encontrados (${ganhos?.length || 0}):`);
    if (ganhos) ganhos.slice(0, 5).forEach(g => console.log(`- ${g.descricao}: R$ ${g.valor}`));

    // 3. Pagamentos de Afiliados
    const { data: afil } = await supabase.from('pagamentos_afiliados').select('*').limit(5);
    console.log(`\nPagamentos Afiliados:`, afil?.length ? 'Presentes' : 'Vazio');

    // 4. Verificar se o Roberto está logado com este TARGET_USER_ID ou outro
    const { data: profiles } = await supabase.from('user_profiles').select('*').ilike('email', '%rsprolipsioficial%');
    console.log('\nPerfil do Roberto Oficial:', profiles);
}

auditExtras();
