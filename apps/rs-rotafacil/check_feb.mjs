import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);
const ROBERTO_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

async function checkFeb() {
    console.log('--- BUSCA POR REGISTROS EM FEVEREIRO 2026 ---');

    const { data: gastos } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .eq('competencia', '2026-02');

    console.log(`Gastos em Fevereiro: ${gastos?.length || 0}`);

    const { data: ganhos } = await supabase
        .from('ganhos_extras')
        .select('*')
        .eq('user_id', ROBERTO_ID)
        .filter('data_ganho', 'gte', '2026-02-01');

    console.log(`Ganhos Avulsos em Fevereiro (Data): ${ganhos?.length || 0}`);
}

checkFeb();
