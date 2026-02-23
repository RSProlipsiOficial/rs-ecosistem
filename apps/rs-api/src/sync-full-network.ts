
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { supabase } from '../lib/supabaseClient';
import { adicionarNaMatriz } from './matrixService';

async function syncNetwork() {
    console.log('🚀 Iniciando Sincronização de Rede...');

    // 1. Limpar dados antigos (CUIDADO: Isso apaga a rede atual)
    console.log('🧹 Limpando dados antigos...');
    await supabase.from('downlines').delete().neq('upline_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matriz_cycles').delete().neq('status', 'non-existent');
    await supabase.from('matrix_accumulator').delete().neq('accumulated_value', -1);
    await supabase.from('cycle_events').delete().neq('event_type', 'none');

    // 2. Buscar todos os consultores ordenados por ID (assumindo que ID define a chegada)
    // Nota: Na planilha o ID é numérico. No banco pode ser UUID ou numérico.
    // Vamos buscar do banco para garantir que temos os IDs corretos do Supabase.
    const { data: consultores, error } = await supabase
        .from('consultores')
        .select('id, username, patrocinador_id')
        .order('created_at', { ascending: true }); // Usando created_at para ordem de chegada

    if (error) {
        console.error('❌ Erro ao buscar consultores:', error.message);
        return;
    }

    console.log(`📋 Encontrados ${consultores.length} consultores para processar.`);

    // 3. Processar cada consultor
    // O primeiro (root) deve ser o 'rsprolipsi'
    for (const consultor of consultores) {
        if (consultor.username === 'rsprolipsi') {
            console.log(`👑 Ignorando root: ${consultor.username}`);
            continue;
        }

        try {
            console.log(`👤 Processando: ${consultor.login} (ID: ${consultor.id})`);
            // Simular uma "ativação" de 60 reais para entrar na matriz
            // Isso internamente chama adicionarNaMatriz
            await adicionarNaMatriz(consultor.id);
        } catch (err) {
            console.error(`❌ Erro no consultor ${consultor.username || consultor.id}:`, err.message);
        }
    }

    console.log('✅ Sincronização concluída!');
}

syncNetwork();
