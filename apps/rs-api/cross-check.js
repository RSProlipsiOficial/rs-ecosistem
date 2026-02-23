const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function crossCheck() {
    try {
        // 1. Pegar todos de usuarios
        const { data: users } = await supabase.from('usuarios').select('id, patrocinador_id');
        const userIds = users?.map(u => u.id) || [];

        // 2. Pegar perfis desses IDs
        if (userIds.length > 0) {
            const { data: profs } = await supabase
                .from('user_profiles')
                .select('user_id, nome_completo')
                .in('user_id', userIds.slice(0, 10)); // Amostra

            console.log('--- AMOSTRA CRUZAMENTO ---');
            console.log('Usuarios Encontrados em Perfis:', profs);
        }

        // 3. Ver se "Rota Fácil Oficial" (d107da4e-e266-41b0-947a-0c66b2f2b9ef) 
        // ou "Rs Prólipsi" (89c000c0-7a39-4e1e-8dee-5978d846fa89) 
        // existem na tabela usuarios (mesmo que com outro ID?) 
        // Não, vamos ver pelo ID exato.

        console.log('\nTotal registros em Usuarios:', userIds.length);

    } catch (error) {
        console.error('Erro:', error);
    }
}

crossCheck();
