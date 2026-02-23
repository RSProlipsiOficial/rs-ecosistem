
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Hardcoded para diagnóstico rápido (Valores copiados do .env lido anteriormente)
const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

if (!supabaseKey) {
    console.error('ERRO: NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRoot() {
    console.log('--- Verificando Root Oficial ---');

    // 1. Verificar por email
    const { data: byEmail, error: errEmail } = await supabase
        .from('consultores')
        .select('id, nome, email, username, pin_atual')
        .eq('email', 'rsprolipsioficial@gmail.com')
        .maybeSingle();

    if (byEmail) {
        console.log('✅ SUCESSO! Encontrado por email:', byEmail);
        return;
    } else {
        console.log('❌ NÃO ENCONTRADO por email: rsprolipsioficial@gmail.com');
    }

    // 2. Verificar por nome parcial
    const { data: byName, error: errName } = await supabase
        .from('consultores')
        .select('id, nome, email, username')
        .ilike('nome', '%PRÓLIPSI%OFICIAL%')
        .maybeSingle();

    if (byName) {
        console.log('⚠️ AVISO! Encontrado por nome, mas email difere:', byName);
        console.log('Sugestão: Atualizar email para rsprolipsioficial@gmail.com');
    } else {
        console.log('❌ NÃO ENCONTRADO por nome parecido com RS PRÓLIPSI OFICIAL');
    }

    // 3. Listar os 5 primeiros criados para diagnóstico
    console.log('\n--- Top 5 Usuários Mais Antigos (Candidatos a Root) ---');
    const { data: oldest } = await supabase
        .from('consultores')
        .select('id, nome, email, created_at')
        .order('created_at', { ascending: true })
        .limit(5);

    console.table(oldest);
}

checkRoot();
