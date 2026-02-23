
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Hardcoded para diagnóstico rápido (Valores copiados do .env lido anteriormente)
const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugChildren() {
    const TARGET_EMAIL = 'rsprolipsioficial@gmail.com';
    console.log(`--- Buscando Filhos de ${TARGET_EMAIL} ---`);

    // 1. Pegar dados do alvo
    const { data: target } = await supabase
        .from('consultores')
        .select('id, username')
        .eq('email', TARGET_EMAIL)
        .single();

    if (!target) {
        console.error('ALVO NÃO ENCONTRADO!');
        return;
    }

    console.log('Dados do Alvo:', target);

    // 2. Buscar quem aponta para ele (Apenas UUID válido)
    const { data: children, error } = await supabase
        .from('consultores')
        .select('id, nome, email, patrocinador_id, created_at')
        .eq('patrocinador_id', target.id) // Simplificado para evitar erro de tipo
        .order('created_at');

    if (error) {
        console.error('Erro ao buscar filhos:', error);
        return;
    }

    console.log(`\nEncontrados ${children.length} filhos diretos:`);
    console.table(children);

    // 3. Verificar inconsistências
    const { data: all } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id')
        .limit(50);

    console.log('\n--- Amostra de Patrocinadores (50) para verificar padrão ---');
    console.log(all.map(c => `${c.nome} -> Parent: ${c.patrocinador_id}`).slice(0, 10));
}

debugChildren();
