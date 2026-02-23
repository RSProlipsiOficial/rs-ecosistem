const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixPasswords() {
    console.log('\n🔐 ATUALIZANDO SENHAS PARA 123456\n');
    console.log('='.repeat(70));

    // 1. Listar todos os usuários (limite 50 por página, paginação simplificada)
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });

    if (error) {
        console.error('❌ Erro ao listar usuários:', error.message);
        return;
    }

    console.log(`📋 Encontrados ${users.length} usuários.`);
    console.log('');

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
        console.log(`🔹 Processando: ${user.email} (ID: ${user.id})`);

        const { error: updateErr } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: '123456' }
        );

        if (updateErr) {
            console.log(`   ❌ Erro: ${updateErr.message}`);
            failCount++;
        } else {
            console.log(`   ✅ Senha atualizada com sucesso!`);
            successCount++;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`🎉 CONCLUÍDO!`);
    console.log(`   ✅ Sucessos: ${successCount}`);
    console.log(`   ❌ Falhas:   ${failCount}`);
}

fixPasswords()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Erro fatal:', err);
        process.exit(1);
    });
