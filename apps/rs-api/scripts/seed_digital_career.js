
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DEFAULT_DIGITAL_LEVELS = [
    {
        name: "RS One Star",
        display_order: 1,
        required_volume: 10000,
        commission_physical_rs: 27,
        commission_rs_digital: 30,
        commission_physical_affiliate: 8,
        commission_affiliate_digital_essential: 35,
        commission_affiliate_digital_professional: 35,
        commission_affiliate_digital_premium: 35,
        award: "Placa RS One Star",
        pin_image: null,
        active: true
    },
    {
        name: "RS Two Star",
        display_order: 2,
        required_volume: 100000,
        commission_physical_rs: 30,
        commission_rs_digital: 35,
        commission_physical_affiliate: 9,
        commission_affiliate_digital_essential: 36,
        commission_affiliate_digital_professional: 36,
        commission_affiliate_digital_premium: 36,
        award: "Headset Gamer Premium + Placa RS Two Star",
        pin_image: null,
        active: true
    },
    {
        name: "RS Three Star",
        display_order: 3,
        required_volume: 250000,
        commission_physical_rs: 33,
        commission_rs_digital: 40,
        commission_physical_affiliate: 10,
        commission_affiliate_digital_essential: 37,
        commission_affiliate_digital_professional: 37,
        commission_affiliate_digital_premium: 37,
        award: "Kit Creator Light (Teclado/Mouse/Mic/Ring Light) + Placa RS Three Star",
        pin_image: null,
        active: true
    },
    {
        name: "RS Pro Star",
        display_order: 4,
        required_volume: 500000,
        commission_physical_rs: 35,
        commission_rs_digital: 45,
        commission_physical_affiliate: 11,
        commission_affiliate_digital_essential: 38,
        commission_affiliate_digital_professional: 38,
        commission_affiliate_digital_premium: 38,
        award: "PC i9 PRO BUILDER (i9/16GB/SSD) + Placa RS Pro Star",
        pin_image: null,
        active: true
    },
    {
        name: "RS Prime Star",
        display_order: 5,
        required_volume: 1000000,
        commission_physical_rs: 36,
        commission_rs_digital: 50,
        commission_physical_affiliate: 12,
        commission_affiliate_digital_essential: 39,
        commission_affiliate_digital_professional: 40,
        commission_affiliate_digital_premium: 40,
        award: "Cruzeiro RS Premium Pack + Kit RS Prime + Placa RS Prime Star",
        pin_image: null,
        active: true
    },
    {
        name: "RS Elite Star",
        display_order: 6,
        required_volume: 2000000,
        commission_physical_rs: 37,
        commission_rs_digital: 55,
        commission_physical_affiliate: 13,
        commission_affiliate_digital_essential: 40,
        commission_affiliate_digital_professional: 43,
        commission_affiliate_digital_premium: 45,
        award: "Elite Travel Pack (Viagem Int) + Kit Elite + Placa RS Elite Star",
        pin_image: null,
        active: true
    },
    {
        name: "RS Legend Star",
        display_order: 7,
        required_volume: 5000000,
        commission_physical_rs: 38,
        commission_rs_digital: 60,
        commission_physical_affiliate: 15,
        commission_affiliate_digital_essential: 40,
        commission_affiliate_digital_professional: 45,
        commission_affiliate_digital_premium: 50,
        award: "THE LEGEND PACK (Carro 0km) + Placa RS Legend Star",
        pin_image: null,
        active: true
    }
];

async function setup() {
    console.log('🚀 Iniciando Setup da Carreira Digital...');

    // 1. Verificar se a tabela já existe (e se tem dados)
    const { data: existingData, error: checkError } = await supabase
        .from('career_levels_digital')
        .select('id')
        .limit(1);

    if (checkError && checkError.code === '42P01') {
        console.log('⚠️ Tabela não existe. Por favor, aplique o SQL manualmente no SQL Editor do Supabase antes de rodar o seed.');
        console.log('Path do SQL:', path.join(__dirname, '../career_levels_digital_setup.sql'));
        process.exit(1);
    }

    if (existingData && existingData.length > 0) {
        console.log('⚠️ Tabela já contém dados. Abortando seed para evitar duplicatas.');
        process.exit(0);
    }

    // 2. Insert Seed Data
    console.log('Inserting Star levels seed data...');
    const { error: insertError } = await supabase
        .from('career_levels_digital')
        .insert(DEFAULT_DIGITAL_LEVELS);

    if (insertError) {
        console.error('❌ Erro no seed:', insertError.message);
    } else {
        console.log('✅ Seed completo! 7 níveis Star inseridos.');
    }
}

setup();
