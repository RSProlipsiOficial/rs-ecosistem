const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function repairStorage() {
    console.log('--- Tentando Criar Buckets Faltantes ---');

    const buckets = ['avatars', 'public', 'geral', 'images'];

    for (const bucketName of buckets) {
        console.log(`Verificando bucket: ${bucketName}...`);
        try {
            const { data, error } = await supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: 5242880 // 5MB
            });

            if (error) {
                if (error.message.includes('already exists')) {
                    console.log(`Bucket ${bucketName} já existe.`);
                } else {
                    console.error(`Erro ao criar bucket ${bucketName}:`, error.message);
                }
            } else {
                console.log(`Bucket ${bucketName} criado com sucesso!`);
            }
        } catch (err) {
            console.error(`Exceção ao processar bucket ${bucketName}:`, err.message);
        }
    }
}

repairStorage();
