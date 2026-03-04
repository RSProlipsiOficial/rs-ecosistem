import { createClient } from '@supabase/supabase-js';

const url = 'https://rptkhrboejbwexseikuo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';
const supabase = createClient(url, key);

const cdId = 'd107da44-0c66b2f2b9ef';

async function diagnose() {
    console.log("=== DIAGNÓSTICO RS-CDS ===");
    console.log("CD Target:", cdId);

    const tables = ['minisite_profiles', 'cd_products', 'cd_orders', 'cd_order_items', 'cd_transactions'];

    for (const table of tables) {
        process.stdout.write(`[\u231b] Testando ${table}... `);
        try {
            const { data, error, status } = await supabase.from(table).select('*').limit(1);

            if (error) {
                console.log(`\u274c FAILED (${status}) - ${error.message}`);
                if (error.details) console.log(`   Detalhes: ${error.details}`);
                if (error.hint) console.log(`   Dica: ${error.hint}`);
            } else {
                console.log(`\u2705 OK - Colunas: [${data && data.length > 0 ? Object.keys(data[0]).join(', ') : 'TABELA VAZIA'}]`);
            }
        } catch (e) {
            console.log(`\u274c ERRO FATAL: ${e.message}`);
        }
    }

    // Teste específico de busca de pedido para o CD
    console.log("\n--- Testando busca de pedidos para o CD ---");
    const { data: orders, error: oError } = await supabase.from('cd_orders').select('*').eq('cd_id', cdId);
    if (oError) {
        console.error("Erro ao buscar pedidos:", oError.message);
    } else {
        console.log(`Pedidos encontrados: ${orders?.length || 0}`);
        if (orders && orders.length > 0) {
            console.log("Status do primeiro pedido:", orders[0].status);
        }
    }
}

diagnose();
