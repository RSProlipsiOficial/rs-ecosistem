/**
 * IMPORTAÇÃO COMPLETA DA REDE - PLANILHA → SUPABASE
 * Versão TypeScript para compatibilidade com matrixService
 */

import dotenv from 'dotenv';
import path from 'path';
import XLSX from 'xlsx';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { supabase } from '../lib/supabaseClient';
import { adicionarNaMatriz } from '../services/matrixService';

const PLANILHA_PATH = "d:/Rs  Ecosystem/rs-ecosystem/Documentação RS Prólipsi (Ver Sempre)/Rede da RS Prólipsi Completo.xlsx";

async function importAndSync() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🚀 IMPORTAÇÃO E SINCRONIZAÇÃO - PLANILHA → MATRIZ 6x6');
    console.log('═══════════════════════════════════════════════════\n');

    // ETAPA 1: Ler planilha
    console.log('📖 ETAPA 1: Lendo planilha...');
    const workbook = XLSX.readFile(PLANILHA_PATH);
    const planilhaData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    console.log(`  ✅ ${planilhaData.length} registros\n`);

    // ETAPA 2: Sincronizar consultores
    console.log('💾 ETAPA 2: Sincronizando consultores...');
    const loginToId = new Map<string, string>();

    let criados = 0;
    let encontrados = 0;

    for (const row of planilhaData as any[]) {
        const nome = row.Nome;
        const email = row['E-mail'] || `${row.ID}@temp.com`;
        const cpf = (row.CNPJ_CPF?.replace(/[^0-9]/g, '') || row.ID);

        // Buscar existente
        const { data: existing } = await supabase
            .from('consultores')
            .select('id')
            .or(`email.eq.${email},cpf.eq.${cpf}`)
            .maybeSingle();

        if (existing) {
            loginToId.set(row.Login || nome, existing.id);
            encontrados++;
        } else {
            // Criar novo
            const { data: novo, error } = await supabase
                .from('consultores')
                .insert({
                    nome,
                    email,
                    cpf,
                    whatsapp: row.Celular || '',
                    cidade: row.Cidade || '',
                    estado: row.Estado || '',
                    status: row.Situacao?.toLowerCase() === 'ativo' ? 'ativo' : 'inativo',
                    data_nascimento: '1990-01-01',
                    pin_atual: 'Consultor'
                })
                .select('id')
                .single();

            if (!error && novo) {
                loginToId.set(row.Login || nome, novo.id);
                criados++;
            }
        }
    }

    console.log(`  ✅ ${criados} criados, ${encontrados} encontrados\n`);

    // ETAPA 3: Configurar hierarquia
    console.log('👥 ETAPA 3: Configurando patrocínios...');

    for (const row of planilhaData as any[]) {
        const indicador = row.Indicador;
        if (!indicador || indicador.includes('Raiz')) continue;

        const consultorId = loginToId.get(row.Login || row.Nome);
        const patrocinadorId = loginToId.get(indicador);

        if (consultorId && patrocinadorId) {
            await supabase
                .from('consultores')
                .update({ patrocinador_id: patrocinadorId })
                .eq('id', consultorId);
        }
    }

    console.log('  ✅ Hierarquia configurada\n');

    // ETAPA 4: Limpar matriz
    console.log('🧹 ETAPA 4: Limpando matriz antiga...');
    await supabase.from('downlines').delete().neq('upline_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matriz_cycles').delete().neq('status', 'non-existent');
    await supabase.from('matrix_accumulator').delete().neq('accumulated_value', -999);
    console.log('  ✅ Limpeza concluída\n');

    // ETAPA 5: Reconstruir matriz
    console.log('🔄 ETAPA 5: Reconstruindo matriz 6x6...');

    const { data: todos } = await supabase
        .from('consultores')
        .select('id, nome, patrocinador_id, created_at')
        .order('created_at', { ascending: true });

    let processados = 0;
    for (const c of todos || []) {
        if (!c.patrocinador_id) continue;

        try {
            await adicionarNaMatriz(c.id);
            processados++;
            if (processados % 20 === 0) {
                console.log(`  ✓ ${processados} processados...`);
            }
        } catch (err: any) {
            console.error(`  ❌ ${c.nome}: ${err.message}`);
        }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ SINCRONIZAÇÃO CONCLUÍDA!');
    console.log(`   - Consultores: ${criados + encontrados}`);
    console.log(`   - Na matriz: ${processados}`);
    console.log('═══════════════════════════════════════════════════\n');
}

importAndSync().catch(console.error);
