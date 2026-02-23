const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const admins = [
    'rsprolipsioficial@gmail.com',
    'robertojbcamargo@gmail.com',
    'robertocamargooficial@gmail.com'
];

async function checkAdminsInConsultores() {
    try {
        console.log('--- BUSCANDO ADMINS EM CONSULTORES ---');

        const { data, error } = await supabase
            .from('consultores')
            .select('id, nome, email')
            .in('email', admins);

        if (error) throw error;
        console.log('Encontrados:', data);
        console.log('--------------------------------------');

    } catch (error) {
        console.error('Erro Fatal:', error);
    }
}

checkAdminsInConsultores();
