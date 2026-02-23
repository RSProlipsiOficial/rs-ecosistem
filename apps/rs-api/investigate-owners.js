const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateOwners() {
    try {
        console.log('--- INVESTIGAÇÃO DE DONOS ROTA FÁCIL ---');

        // 1. Tabela apps_vendidos
        const { count: appsVendidos, error: err1 } = await supabase
            .from('apps_vendidos')
            .select('*', { count: 'exact', head: true });

        console.log('Apps Vendidos (count):', appsVendidos, err1 ? err1 : '');

        // 2. Donos de Vans únicos
        const { data: vans, error: err2 } = await supabase
            .from('vans')
            .select('user_id');

        const uniqueVanOwners = new Set(vans?.map(v => v.user_id).filter(id => id));
        console.log('Donos de Vans Únicos (user_id):', uniqueVanOwners.size);

        // 3. Verificar metadados de usuários se possível (via consulta simples)
        // No Supabase auth.users não é acessível via client comum, mas user_profiles sim
        const { data: profiles, error: err3 } = await supabase
            .from('user_profiles')
            .select('user_id, nome_completo');

        console.log('Total user_profiles:', profiles?.length || 0);

        // 4. Ver se existe algum administrador específico em admin_emails ou algo similar
        const { count: adminEmails, error: err4 } = await supabase
            .from('admin_emails')
            .select('*', { count: 'exact', head: true });

        console.log('Admin Emails (count):', adminEmails, err4 ? err4 : '');

        console.log('------------------------------------------');

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

investigateOwners();
