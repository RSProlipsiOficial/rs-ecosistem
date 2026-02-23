const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('--- VERIFICAÇÃO FINAL: PRODUTOS E API ---');

    const tenantId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'; // Sede

    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenantId);

    if (error) {
        console.error('Erro ao buscar produtos:', error.message);
        return;
    }

    console.log(`Encontrados ${products.length} produtos.`);

    products.forEach(p => {
        console.log(`- [${p.sku}] ${p.name}: R$ ${p.price} (Original: R$ ${p.compare_price}) | Estoque: ${p.stock_quantity} | PV: ${p.pv_points}`);
    });

    console.log('\n--- TESTE DE MAPEAMENTO FRONTEND ---');
    const mapped = products.map((p) => {
        const price = Number(p.price || 0);
        const compare = Number(p.compare_price || price);
        const discount = compare > price ? Math.round(((compare - price) / compare) * 100) : 0;

        return {
            id: String(p.id),
            name: p.name,
            fullPrice: compare,
            discount: discount,
            pv: p.pv_points
        };
    });
    console.log('Exemplo mapeado:', mapped[0]);
}

verify();
