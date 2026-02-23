const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(URL, KEY);

async function seed() {
    const userId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
    let output = 'Starting seed for RS PRÓLIPSI...\n';

    // DADOS REAIS EXTRAÍDOS DA PLATAFORMA CENTRAL
    // Username: rsprolipsi
    // CPF: 23430313000185
    // WhatsApp: (41) 99286-3922
    const data = {
        user_id: userId,
        nome_completo: 'Rota Fácil Oficial',
        cpf: '23430313000185',
        telefone: '(41) 99286-3922',
        endereco_cep: '83314-326',
        endereco_rua: 'Rua Tereza Liberato Ricardo',
        endereco_numero: '13',
        endereco_bairro: 'Planta Vera Cruz',
        endereco_cidade: 'Piraquara',
        endereco_estado: 'PR',
        upline_id: 'RAIZ',
        upline_nome: 'SISTEMA RS',
        mmn_id: 'rsprolipsi',
        avatar_url: 'https://rptkhrboejbwexseikuo.supabase.co/storage/v1/object/public/rsia-uploads/avatars/d107da4e-e266-41b0-947a-0c66b2f2b9ef-avatar-1766669665711.jpg',
        updated_at: new Date().toISOString()
    };

    try {
        // Tenta salvar completo
        const { error } = await supabase
            .from('user_profiles')
            .upsert(data, { onConflict: 'user_id' });

        if (error) {
            output += 'FAILED: ' + JSON.stringify(error) + '\n';

            // Fallback: Tenta salvar sem upline_id/nome e CPF (caso schema não tenha atualizado)
            if (error.message.includes('column') || error.code === '42703') {
                const minimalData = {
                    user_id: userId,
                    nome_completo: data.nome_completo,
                    telefone: data.telefone,
                    updated_at: data.updated_at
                };
                const { error: error2 } = await supabase
                    .from('user_profiles')
                    .upsert(minimalData, { onConflict: 'user_id' });

                if (error2) output += 'FALLBACK FAILED TOO: ' + JSON.stringify(error2) + '\n';
                else output += 'SUCCESS (FALLBACK MODE): Profile seeded with partial data.\n';
            }
        } else {
            output += 'SUCCESS: Profile seeded FULLY with specific user data.\n';

            // Também tenta atualizar a tabela consultores para garantir consistência
            await supabase.from('consultores').update({
                nome: data.nome_completo,
                whatsapp: data.telefone,
                cpf: data.cpf,
                username: 'rsprolipsi' // ID CORRETO DO CONSULTOR
            }).eq('id', userId); // Corrigido de 'uid' para 'id'
        }

    } catch (err) {
        output += 'ERROR: ' + err.message + '\n';
    }
    fs.writeFileSync('seed_result.txt', output);
    console.log(output);
}

seed();
