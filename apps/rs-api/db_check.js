
const { supabase, supabaseAdmin } = require('./src/lib/supabaseClient');

async function check() {
    console.log('--- DIAGNÓSTICO DE BANCO ---');
    try {
        const { count, error } = await supabase.from('consultores').select('*', { count: 'exact', head: true });
        if (error) {
            console.error('Erro ao acessar consultores (supabase):', error.message);
        } else {
            console.log('Contagem de consultores (supabase):', count);
        }

        const { count: countAdmin, error: errorAdmin } = await supabaseAdmin.from('consultores').select('*', { count: 'exact', head: true });
        if (errorAdmin) {
            console.error('Erro ao acessar consultores (supabaseAdmin):', errorAdmin.message);
        } else {
            console.log('Contagem de consultores (supabaseAdmin):', countAdmin);
        }

        const { data: configs, error: configError } = await supabase.from('app_configs').select('key, value');
        if (configError) {
            console.error('Erro ao acessar app_configs:', configError.message);
        } else {
            console.log('Configurações encontradas:', configs?.length || 0);
        }

    } catch (e) {
        console.error('Erro inesperado no diagnóstico:', e);
    }
}

check();
