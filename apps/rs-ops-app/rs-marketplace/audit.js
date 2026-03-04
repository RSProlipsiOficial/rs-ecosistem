import { createClient } from '@supabase/supabase-js';

const url = 'https://rptkhrboejbwexseikuo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

const supabase = createClient(url, key);

async function audit() {
    try {
        console.log("\n--- CDs (minisite_profiles) ---");
        const { data: cds, error: cdError } = await supabase.from("minisite_profiles").select("id, name");
        if (cdError) throw cdError;

        for (const cd of cds) {
            console.log(`\nCD: ${cd.name} (${cd.id})`);

            // 1. Produtos
            const { data: prods, error: pError } = await supabase.from("cd_products").select("*").eq("cd_id", cd.id);
            console.log(`  Produtos no estoque: ${prods?.length || 0}`);
            (prods || []).forEach(p => console.log(`    - ${p.name} (SKU: ${p.sku}): ${p.stock_level}`));

            // 2. Pedidos
            const { data: orders, error: oError } = await supabase.from("cd_orders").select("*").eq("cd_id", cd.id);
            console.log(`  Pedidos (cd_orders): ${orders?.length || 0}`);
            for (const o of (orders || [])) {
                console.log(`    - Pedido ${o.id} | Status: ${o.status} | Total: ${o.total}`);
                const { data: items, error: iError } = await supabase.from("cd_order_items").select("*").eq("order_id", o.id);
                console.log(`      Itens (${items?.length || 0}):`);
                (items || []).forEach(i => console.log(`        Item: ${i.product_name} | Qtd: ${i.quantity} | ProdID: ${i.product_id}`));
            }
        }
    } catch (err) {
        console.error("Erro na auditoria:", err);
    }
}

audit();
