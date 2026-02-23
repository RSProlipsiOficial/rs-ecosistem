const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const tenantId = '00000000-0000-0000-0000-000000000000'; // Local
const officialTenantId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'; // Sede

const products = [
    {
        name: 'GlicoLipsi - Equilíbrio Metabólico',
        sku: 'GLICO-RS-001',
        price: 140.00,
        compare_price: 267.00,
        stock_quantity: 150,
        category: 'Suplementos',
        description: '🔥 Recupere Sua Vitalidade e Mantenha Sua Glicose Sob Controle. Equilíbrio metabólico natural.',
        images: ['https://picsum.photos/seed/glicolipsi1/600/600'],
        pv_points: 100
    },
    {
        name: 'Inflamax - Anti-Inflamatório Natural',
        sku: 'INFLA-RS-001',
        price: 120.00,
        compare_price: 199.00,
        stock_quantity: 120,
        category: 'Suplementos',
        description: 'Combata inflamação e dores naturalmente com tecnologia RS Prólipsi.',
        images: ['https://picsum.photos/seed/inflamax1/600/600'],
        pv_points: 85
    },
    {
        name: 'Pró3+ - Probiótico Avançado',
        sku: 'PRO3-RS-001',
        price: 90.00,
        compare_price: 149.00,
        stock_quantity: 200,
        category: 'Suplementos',
        description: 'Melhore sua saúde intestinal e imunidade com 30 bilhões de UFC.',
        images: ['https://picsum.photos/seed/pro3plus1/600/600'],
        pv_points: 60
    },
    {
        name: 'AlphaLipsi - Performance Masculina',
        sku: 'ALPHA-RS-001',
        price: 120.00,
        compare_price: 219.00,
        stock_quantity: 110,
        category: 'Suplementos',
        description: 'Fórmula avançada para vitalidade e performance masculina.',
        images: ['https://picsum.photos/seed/alphalipsi1/600/600'],
        pv_points: 85
    },
    {
        name: 'DivaLipsi - Bem-Estar Feminino',
        sku: 'DIVA-RS-001',
        price: 126.00,
        compare_price: 199.00,
        stock_quantity: 180,
        category: 'Suplementos',
        description: 'O cuidado que a mulher merece. Equilíbrio hormonal e beleza.',
        images: ['https://picsum.photos/seed/divalipsi1/600/600'],
        pv_points: 90
    },
    {
        name: 'OzoniPro - Detox e Imunidade',
        sku: 'OZONI-RS-001',
        price: 78.00,
        compare_price: 129.00,
        stock_quantity: 95,
        category: 'Suplementos',
        description: 'Poder do ozônio encapsulado para detox e super imunidade.',
        images: ['https://picsum.photos/seed/ozonipro1/600/600'],
        pv_points: 50
    },
    {
        name: 'SlimLipsi - Emagrecimento Inteligente',
        sku: 'SLIM-RS-001',
        price: 140.00,
        compare_price: 249.00,
        stock_quantity: 165,
        category: 'Suplementos',
        description: 'Queime gordura de forma inteligente e natural.',
        images: ['https://picsum.photos/seed/slimlipsi1/600/600'],
        pv_points: 100
    }
];

async function migrate() {
    console.log('--- MIGRATON: REAL PRODUCTS (Corrected Schema) ---');

    // Inserir para ambos (Sede e Local)
    const targetTenants = [officialTenantId, tenantId];

    for (const tid of targetTenants) {
        console.log(`\nTenant: ${tid}`);

        const dataToInsert = products.map(p => ({
            tenant_id: tid,
            name: p.name,
            sku: p.sku,
            price: p.price,
            compare_price: p.compare_price,
            stock_quantity: p.stock_quantity,
            category: p.category,
            description: p.description,
            images: p.images,
            pv_points: p.pv_points,
            published: true,
            featured: p.sku.includes('GLICO') || p.sku.includes('SLIM'),
            is_active: true
        }));

        // NOTA: Usando insert ao invés de upsert pois id é UUID agora e não temos os IDs existentes
        // Mas para evitar duplicatas em cada rodada, poderíamos checar SKU primeiro.
        // Aqui, para ser seguro, vamos inserir.
        const { error } = await supabase.from('products').insert(dataToInsert);

        if (error) {
            console.error(`Erro:`, error.message);
        } else {
            console.log(`✅ ${products.length} produtos migrados.`);
        }
    }
}

migrate();
