
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables (trying multiple locations)
dotenv.config({ path: path.join(__dirname, '../apps/rs-api/.env') });
if (!process.env.SUPABASE_URL) {
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const FILE_PATH = "g:\\Rs  Ecosystem\\rs-ecosystem\\Documentação RS Prólipsi (Ver Sempre)\\Rede da RS Prólipsi Completo.xlsx";

async function importNetwork() {
    console.log('🚀 Starting Network Import (v2.4 - Schema Fixed)...');
    console.log(`📂 Reading file: ${FILE_PATH}`);

    if (!fs.existsSync(FILE_PATH)) {
        console.error('❌ File not found!');
        return;
    }

    const workbook = XLSX.readFile(FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    console.log(`📊 Found ${rawData.length} records in Excel.`);

    // 1. Map Data and Normalize
    const usersToImport = rawData.map((row) => ({
        legacy_id: String(row['ID'] || '').trim(),
        nome: String(row['Nome'] || '').trim(),
        login: String(row['Login'] || '').trim(),
        indicador_ref: String(row['Indicador'] || '').trim(),
        email: String(row['E-mail'] || '').trim().toLowerCase(),
        phone: String(row['Celular'] || '').trim(),
        cpf: String(row['CNPJ_CPF'] || '').replace(/\D/g, ''),
        city: String(row['Cidade'] || ''),
        state: String(row['Estado'] || ''),
        status: 'ativo',
        senha: 'RS123'
    }));

    // 2. Cache Auth Users
    const authMap = new Map();
    console.log('🔄 Fetching existing Auth Users...');
    try {
        const { data: { users }, error: listUsersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 10000 });
        if (users) {
            users.forEach(u => {
                if (u.email) authMap.set(u.email.toLowerCase(), u.id);
            });
            console.log(`🔐 Loaded ${users.length} existing Auth Users.`);
        }
    } catch (e) {
        console.warn('⚠️ Could not list auth users (Permission?), continuing...', e.message);
    }

    // 3. Cache Database Consultants
    const idMap = new Map();
    // Note: asking for columns that exist
    const { data: existing } = await supabase.from('consultores').select('id, nome, email');
    if (existing) {
        existing.forEach(c => {
            if (c.nome) idMap.set(c.nome.toLowerCase(), c.id);
            if (c.email) idMap.set(c.email.toLowerCase(), c.id);
            // We don't have username/code in DB, so we can't map them back from DB state easily if we restart.
            // But filtering by email/nome should be enough for re-runs.
        });
        console.log(`🧠 Loaded ${existing.length} existing consultants from DB.`);
    }

    let processedCount = 0;
    let skippedCount = 0;
    let pending = [...usersToImport];
    let lastPendingCount = -1;

    // 4. Iterative Insertion
    while (pending.length > 0) {
        if (pending.length === lastPendingCount) {
            console.warn('⚠️  Stalled! Remaining users cannot find their sponsors.');
            console.warn('Orphans:', pending.map(p => `${p.nome} (Sponsor: ${p.indicador_ref || 'None'})`).slice(0, 10));
            break;
        }
        lastPendingCount = pending.length;
        const nextBatch = [];

        for (const user of pending) {
            // Check duplicate in DB
            let existingId = idMap.get(user.email) || idMap.get(user.login.toLowerCase());

            if (existingId) {
                // ensure map has all keys including login from Excel for children
                idMap.set(user.nome.toLowerCase(), existingId);
                idMap.set(user.login.toLowerCase(), existingId);
                idMap.set(user.legacy_id, existingId);
                skippedCount++;
                continue;
            }

            let sponsorId = null;
            // "Raiz top da rede " or empty = ROOT
            const isRoot = !user.indicador_ref || user.indicador_ref.toLowerCase().includes('raiz');

            if (isRoot) {
                sponsorId = null;
            } else {
                const ref = user.indicador_ref.toLowerCase();
                if (idMap.has(ref)) {
                    sponsorId = idMap.get(ref);
                } else {
                    nextBatch.push(user);
                    continue;
                }
            }

            try {
                let userId = authMap.get(user.email);

                if (!userId) {
                    // Create Auth
                    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                        email: user.email,
                        password: user.senha,
                        email_confirm: true,
                        user_metadata: { name: user.nome }
                    });

                    if (authError) {
                        if (authError.message.includes('already registered')) {
                            console.warn(`   ⚠️ Auth claimed exists but not in map (skipped): ${user.email}`);
                        } else {
                            console.error(`   ❌ Auth Error for ${user.nome}: ${authError.message}`);
                        }
                        continue;
                    }
                    userId = authData?.user?.id;
                }

                if (userId) {
                    console.log(`➕ Importing: ${user.nome} (Sponsor ID: ${sponsorId || 'ROOT'})`);

                    const payload = {
                        user_id: userId,
                        nome: user.nome,
                        email: user.email,
                        telefone: user.phone,
                        cpf: user.cpf,
                        // username: user.login, // Missing in DB
                        // codigo_consultor: user.legacy_id, // Missing in DB
                        status: 'ativo',
                        patrocinador_id: sponsorId,
                        cidade: user.city,
                        estado: user.state,
                        pin_atual: 'Consultor'
                    };

                    const { data: dbData, error: dbError } = await supabase
                        .from('consultores')
                        .insert(payload)
                        .select()
                        .single();

                    if (dbError) {
                        if (dbError.code === '23505') { // Unique violation
                            console.warn(`   ⚠️ DB Conflict for ${user.nome}, fetching existing.`);
                            const { data: conflictData } = await supabase.from('consultores').select('id').eq('email', user.email).single();
                            if (conflictData) {
                                idMap.set(user.nome.toLowerCase(), conflictData.id);
                                idMap.set(user.email, conflictData.id);
                                idMap.set(user.legacy_id, conflictData.id);
                                idMap.set(user.login.toLowerCase(), conflictData.id);
                                processedCount++;
                            }
                        } else {
                            console.error(`   ❌ DB Insert Error for ${user.nome}: ${dbError.message}`);
                        }
                    } else {
                        processedCount++;
                        const newId = dbData.id;
                        idMap.set(user.nome.toLowerCase(), newId);
                        idMap.set(user.login.toLowerCase(), newId); // Important for children relying on login
                        idMap.set(user.legacy_id, newId);
                        idMap.set(user.email, newId);

                        await supabase.from('wallets').insert({
                            user_id: userId,
                            consultor_id: newId,
                            status: 'ativa',
                            balance: 0
                        }).catch(() => { }); // ignore wallet duplicate error
                    }
                }

            } catch (err) {
                console.error(`   💥 Unexpected error: ${err.message}`);
            }
        }

        pending = nextBatch;
    }

    console.log('✅ Import Completed!');
    console.log(`   Imported/Linked: ${processedCount}`);
    console.log(`   Skipped (Already Linked): ${skippedCount}`);
    console.log(`   Orphans: ${pending.length}`);
}

importNetwork();
