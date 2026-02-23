require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function main() {
    // Verificar se ja existe
    const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const existing = authData.users.find(u => u.email === 'rsprolipsioficial@gmail.com');

    if (existing) {
        console.log('Conta ja existe no Auth:', existing.id);
    } else {
        console.log('Criando conta Auth para rsprolipsioficial@gmail.com...');
        const { data: newUser, error } = await supabase.auth.admin.createUser({
            email: 'rsprolipsioficial@gmail.com',
            password: '123456',
            email_confirm: true
        });

        if (error) {
            console.error('ERRO ao criar:', error.message);
            process.exit(1);
        }

        console.log('Conta Auth criada:', newUser.user.id);

        // Atualizar consultores.user_id
        const { error: updateErr } = await supabase
            .from('consultores')
            .update({ user_id: newUser.user.id })
            .eq('email', 'rsprolipsioficial@gmail.com');

        if (updateErr) {
            console.error('ERRO ao atualizar consultor:', updateErr.message);
        } else {
            console.log('consultores.user_id atualizado com sucesso!');
        }
    }

    // Verificar resultado final
    const { data: check } = await supabase
        .from('consultores')
        .select('id, nome, email, user_id, username')
        .eq('email', 'rsprolipsioficial@gmail.com')
        .maybeSingle();

    console.log('\nResultado final:');
    console.log('  consultor.id:', check.id);
    console.log('  user_id:', check.user_id);
    console.log('  username:', check.username);

    process.exit(0);
}

main();
