
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { supabase } from '../lib/supabaseClient';

async function investigate() {
    console.log('🔍 Investigando tabela consultores...');
    const { data, error } = await supabase
        .from('consultores')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Erro:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log('✅ Colunas encontradas:', Object.keys(data[0]));
        console.log('📝 Amostra de dados:', data[0]);
    } else {
        console.log('⚠️ Tabela vazia ou não encontrada.');
    }
}

investigate();
