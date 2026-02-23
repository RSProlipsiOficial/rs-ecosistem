const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Carregar o mapeamento da planilha
const mappingPath = path.join(__dirname, 'src', 'routes', 'v1', 'detailed_id_mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

async function syncSigmaNetwork() {
    try {
        console.log('--- SINCRONIZANDO MATRIZ SIGME COM PLANILHA ---');

        // 1. Pegar todos os consultores atuais
        const { data: consultants } = await supabase.from('consultores').select('id, nome, email');

        // 2. Mapear nome da planilha para ID do DB
        const nameToId = new Map();
        consultants.forEach(c => {
            nameToId.set(c.nome.toLowerCase().trim(), c.id);
            if (c.email) nameToId.set(c.email.toLowerCase().trim(), c.id);
        });

        // 3. Reconstruir Hierarquia SIGME (Matriz 1+6)
        // A planilha define quem indica quem. Vamos percorrer o mapping.
        // O mapping está como { "nome/login": { order, name, code ... } }
        // Precisamos saber o PATROCINADOR correto no Excel.

        // IMPORTANTE: O mapping atual parece não ter o 'patrocinador' (upline) explícito.
        // Vou buscar na planilha .xlsx real para extrair a coluna 'Indicador'.

        console.log('Fase 1 completa: Mapeamento de IDs carregado.');
        console.log('Próximo passo: Extrair árvore (Upline -> Downline) da planilha Excel.');

    } catch (error) {
        console.error('Erro na sincronização:', error);
    }
}

syncSigmaNetwork();
