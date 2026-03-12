const API_URL = 'http://localhost:4000';
const PRODUCT_ID = '486f290d-500f-4c1c-8889-f8d2db87c2bc'; // INFLAMAXI

async function testSync() {
    console.log('--- Iniciando Teste de Sincronização de Imagem (Fetch) ---');

    const testImages = [
        'https://rs-prolipsi.s3.amazonaws.com/test-image-1.jpg',
        'https://rs-prolipsi.s3.amazonaws.com/test-image-2.jpg'
    ];

    try {
        console.log(`1. Atualizando produto ${PRODUCT_ID} com novas imagens...`);
        const updateRes = await fetch(`${API_URL}/v1/marketplace/products/${PRODUCT_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: testImages })
        });

        const updateData = await updateRes.json();

        if (updateData.success) {
            console.log('✅ Update enviado com sucesso.');

            console.log('2. Verificando persistência no banco via API...');
            const getRes = await fetch(`${API_URL}/v1/marketplace/products/${PRODUCT_ID}`);
            const getData = await getRes.json();
            const product = getData.data;

            console.log('DEBUG Dados Produto:', {
                images_count: product.images?.length,
                featured_image: product.featured_image
            });

            if (product.featured_image === testImages[0]) {
                console.log('✅ SUCESSO: featured_image sincronizado corretamente!');
            } else {
                console.error('❌ FALHA: featured_image não corresponde ao esperado.');
                console.error(`Esperado: ${testImages[0]}`);
                console.error(`Recebido: ${product.featured_image}`);
                process.exit(1);
            }
        } else {
            console.error('❌ Erro na resposta da API:', updateData.error);
            process.exit(1);
        }

        console.log('3. Testando limpeza de imagem (array vazio)...');
        const clearRes = await fetch(`${API_URL}/v1/marketplace/products/${PRODUCT_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: [] })
        });

        const clearData = await clearRes.json();

        const finalGetRes = await fetch(`${API_URL}/v1/marketplace/products/${PRODUCT_ID}`);
        const finalGetData = await finalGetRes.json();

        if (finalGetData.data.featured_image === null) {
            console.log('✅ SUCESSO: featured_image limpo corretamente.');
        } else {
            console.error('❌ FALHA: featured_image não foi limpo.');
            process.exit(1);
        }

        console.log('\n--- TESTE CONCLUÍDO COM 100% DE SUCESSO ---');

    } catch (error) {
        console.error('❌ Erro crítico no teste:', error.message);
        process.exit(1);
    }
}

testSync();
