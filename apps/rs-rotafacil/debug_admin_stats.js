const { createClient } = require('@supabase/supabase-client');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminStats() {
    const adminId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
    const adminAlias = 'rsprolipsi';

    console.log('--- ADMIN STATS CHECK ---');

    // 1. Check direct motoristas
    const { count: motoristas } = await supabase
        .from('profiles_view') // Custom view or auth.users? Using a query that mirrors the RPC
        .select('*', { count: 'exact', head: true })
        .or(`raw_user_meta_data->>sponsor_id.eq.${adminId},raw_user_meta_data->>sponsor_id.eq.${adminAlias},raw_user_meta_data->>boss_id.eq.${adminId},raw_user_meta_data->>boss_id.eq.${adminAlias}`)
        .filter('raw_user_meta_data->>tipo_usuario', 'eq', 'motorista');

    console.log('Motoristas (Total):', motoristas);

    // 2. Check direct monitoras
    const { count: monitoras } = await supabase
        .from('profiles_view')
        .select('*', { count: 'exact', head: true })
        .or(`raw_user_meta_data->>sponsor_id.eq.${adminId},raw_user_meta_data->>sponsor_id.eq.${adminAlias},raw_user_meta_data->>boss_id.eq.${adminId},raw_user_meta_data->>boss_id.eq.${adminAlias}`)
        .filter('raw_user_meta_data->>tipo_usuario', 'eq', 'monitora');

    console.log('Monitoras (Total):', monitoras);

    // 3. Check indicados Owners/Indicados
    const { count: indicados } = await supabase
        .from('profiles_view')
        .select('*', { count: 'exact', head: true })
        .or(`raw_user_meta_data->>sponsor_id.eq.${adminId},raw_user_meta_data->>sponsor_id.eq.${adminAlias},raw_user_meta_data->>boss_id.eq.${adminId},raw_user_meta_data->>boss_id.eq.${adminAlias}`)
        .filter('raw_user_meta_data->>tipo_usuario', 'in', '("owner","indicado")');

    console.log('Indicados (Total):', indicados);

    // 4. Check Alunos
    const { count: alunos } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true })
        .or(`created_by.eq.${adminId},user_id.eq.${adminId}`);

    console.log('Alunos (Total):', alunos);
}

checkAdminStats();
