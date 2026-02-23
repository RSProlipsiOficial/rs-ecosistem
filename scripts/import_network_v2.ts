
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../apps/rs-api/.env') });

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
    console.log('🚀 Starting Network Import...');
    console.log(`📂 Reading file: ${FILE_PATH}`);

    if (!fs.existsSync(FILE_PATH)) {
        console.error('❌ File not found!');
        return;
    }

    const workbook = XLSX.readFile(FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    console.log(`📊 Found ${rawData.length} records.`);

    // Clear existing non-admin data? (Optional, maybe dangerous, let's skip for now or ask)
    // For this task, we assume we are populating an empty or partial list.
    // Ideally, we check if they exist first.

    // 1. Map Data and Normalize
    const usersToImport = rawData.map((row: any) => ({
        legacy_id: String(row['ID'] || '').trim(),
        nome: String(row['Nome'] || '').trim(),
        login: String(row['Login'] || '').trim(),
        indicador_ref: String(row['Indicador'] || '').trim(),
        email: String(row['E-mail'] || '').trim().toLowerCase(),
        phone: String(row['Celular'] || '').trim(),
        cpf: String(row['CNPJ_CPF'] || '').replace(/\D/g, ''),
        city: String(row['Cidade'] || ''),
        state: String(row['Estado'] || ''),
        status: 'ativo', // Default to active
        senha: 'RS123' // Default password
    }));

    // 2. Cache processed users to resolve IDs
    // Map: Key (Name/Login) -> Database ID
    const idMap = new Map<string, string>();

    // Pre-load existing consultants to avoid duplicates and resolve existing sponsors
    const { data: existing } = await supabase.from('consultores').select('id, nome, username, codigo_consultor');
    if (existing) {
        existing.forEach(c => {
            if (c.nome) idMap.set(c.nome.toLowerCase(), c.id);
            if (c.username) idMap.set(c.username.toLowerCase(), c.id);
            if (c.codigo_consultor) idMap.set(c.codigo_consultor, c.id);
        });
        console.log(`🧠 Loaded ${existing.length} existing consultants from DB.`);
    }

    let processedCount = 0;
    let skippedCount = 0;
    let pending = [...usersToImport];
    let lastPendingCount = -1;

    // 3. Iterative Insertion loop (Topological sort)
    while (pending.length > 0) {
        if (pending.length === lastPendingCount) {
            console.warn('⚠️  Stalled! Remaining users cannot find their sponsors.');
            console.warn('Orphans:', pending.map(p => `${p.nome} (Sponsor: ${p.indicador_ref})`).slice(0, 10));
            break;
        }
        lastPendingCount = pending.length;
        const nextBatch = [];

        for (const user of pending) {
            // Check if already exists
            if (idMap.has(user.email) || idMap.has(user.login.toLowerCase()) || idMap.has(user.nome.toLowerCase())) {
                // console.log(`⏩ Skipping ${user.nome} (Already exists)`);
                skippedCount++;
                continue;
            }

            // Resolve Sponsor
            let sponsorId: string | null = null;
            const isRoot = user.indicador_ref.toLowerCase().includes('raiz') || user.indicador_ref === '';

            if (isRoot) {
                sponsorId = null; // Root node
            } else {
                // Try to find sponsor by Name or Login (from Excel references)
                // Values in Excel: "RS Prólipsi Empresa" (Login), "Emanuel Mendes Claro" (Name)
                const ref = user.indicador_ref.toLowerCase();

                if (idMap.has(ref)) {
                    sponsorId = idMap.get(ref)!;
                } else {
                    // Check if sponsor is in the current processed batch (failsafe)
                    // If not found, push to next batch
                    nextBatch.push(user);
                    continue;
                }
            }

            // Only proceed if we have a sponsorId or it is root
            if (sponsorId || isRoot) {
                try {
                    console.log(`➕ Importing: ${user.nome} (Sponsor ID: ${sponsorId || 'ROOT'})`);

                    // 1. Create Auth User
                    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                        email: user.email,
                        password: user.senha,
                        email_confirm: true,
                        user_metadata: { name: user.nome }
                    });

                    let userId = authData.user?.id;

                    // Handle: "User already registered" error
                    if (authError) {
                        if (authError.message.includes('already registered')) {
                            // Try to find the user_id from auth if not in our map? 
                            // Creating a dummy user doesn't return ID. We assume if map didn't catch it, maybe we skip.
                            console.warn(`   ⚠️ Auth exists for ${user.email}, skipping auth creation.`);
                            // OPTIONAL: Fetch the user ID by email if we really need to link it
                            skippedCount++;
                            continue;
                        } else {
                            console.error(`   ❌ Auth Error for ${user.nome}: ${authError.message}`);
                            continue;
                        }
                    }

                    if (userId) {
                        // 2. Insert into Consultores
                        const payload = {
                            user_id: userId,
                            nome: user.nome,
                            email: user.email,
                            telefone: user.phone,
                            cpf: user.cpf,
                            username: user.login,
                            codigo_consultor: user.legacy_id,
                            status: 'ativo',
                            patrocinador_id: sponsorId,
                            address: {
                                city: user.city,
                                state: user.state
                            },
                            pin_atual: 'Consultor' // Default
                        };

                        const { data: dbData, error: dbError } = await supabase
                            .from('consultores')
                            .insert(payload)
                            .select()
                            .single();

                        if (dbError) {
                            console.error(`   ❌ DB Insert Error for ${user.nome}: ${dbError.message}`);
                            // Cleanup auth?
                            await supabase.auth.admin.deleteUser(userId);
                        } else {
                            // Success
                            processedCount++;
                            const newId = dbData.id;
                            // Add to Map for children
                            idMap.set(user.nome.toLowerCase(), newId);
                            idMap.set(user.login.toLowerCase(), newId);
                            idMap.set(user.legacy_id, newId);

                            // Create Wallet
                            await supabase.from('wallets').insert({
                                user_id: userId,
                                consultor_id: newId,
                                status: 'ativa',
                                balance: 0
                            });
                        }
                    }

                } catch (err: any) {
                    console.error(`   💥 Unexpected error: ${err.message}`);
                }
            }
        }

        pending = nextBatch;
    }

    console.log('✅ Import Completed!');
    console.log(`   Imported: ${processedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Orphans: ${pending.length}`);
}

importNetwork();
