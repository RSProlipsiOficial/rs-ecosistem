
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const XLSX = require('xlsx');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

const filePath = path.join('g:\\Rs  Ecosystem\\rs-ecosystem\\Documentação RS Prólipsi (Ver Sempre)\\Rede da RS Prólipsi Completo.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// Map "Nome" and "Login" to "ID" (from Excel) for parent resolution
const lookup = new Map();
data.forEach(row => {
    if (row.ID) {
        const idStr = String(row.ID).trim();
        if (row.Nome) lookup.set(row.Nome.trim().toLowerCase(), idStr);
        if (row.Login) lookup.set(row.Login.trim().toLowerCase(), idStr);
    }
});

const ROOT_INT_ID = 7838667;
const ROOT_UUID = 'ab3c3567-69f4-4af8-9261-6d452d7a96dc';

function intToUUID(id) {
    if (parseInt(id) === ROOT_INT_ID) return ROOT_UUID;
    const hex = parseInt(id).toString(16).padStart(12, '0');
    return `00000000-0000-4000-a000-${hex}`;
}

async function generate() {
    console.log('Fetching existing consultants to preserve IDs...');
    const { data: existing, error } = await supabase.from('consultores').select('id, email, cpf');
    if (error) {
        console.error('Failed to fetch existing:', error);
        process.exit(1);
    }

    const emailToID = new Map();
    const cpfToID = new Map();

    existing.forEach(row => {
        if (row.email) emailToID.set(row.email.trim().toLowerCase(), row.id);
        if (row.cpf) {
            const clean = row.cpf.replace(/\D/g, '').slice(0, 14);
            cpfToID.set(clean, row.id);
        }
    });

    const consultants = [];
    const processedIDs = new Set();
    const idToUUID = new Map();

    // Pass 1: Map IDs (Excel ID -> UUID)
    data.forEach(row => {
        if (row.ID) {
            const id = parseInt(String(row.ID).trim());
            if (!isNaN(id)) {
                // Check if email exists in DB
                const email = (row['E-mail'] || `consultor${id}@rsprolipsi.com.br`).trim().toLowerCase();
                const cpf = (row.CNPJ_CPF || '').replace(/\D/g, '').slice(0, 14);

                let uuid = emailToID.get(email);
                if (!uuid) uuid = cpfToID.get(cpf);

                if (uuid) {
                    // console.log(`Matched existing UUID for ${email} / ${cpf}: ${uuid}`);
                } else {
                    // Generate deterministic
                    uuid = intToUUID(id);
                }

                idToUUID.set(id, uuid);
                idToUUID.set(String(id), uuid);
            }
        }
    });

    // Pass 2: Build Consultant Objects
    data.forEach(row => {
        if (!row.ID) return;

        const id = parseInt(String(row.ID).trim());
        if (isNaN(id) || processedIDs.has(id)) return;
        processedIDs.add(id);

        let indicadorInput = (row.Indicador || '').trim();
        let sponsorUUID = null;

        if (id === ROOT_INT_ID || indicadorInput.toLowerCase().includes('raiz')) {
            sponsorUUID = null;
        } else {
            let parentIntId = lookup.get(indicadorInput.toLowerCase());
            if (parentIntId) {
                sponsorUUID = idToUUID.get(parseInt(parentIntId));
            } else {
                sponsorUUID = ROOT_UUID; // Default to Root
            }
        }

        const uuid = idToUUID.get(id);
        const cpfClean = (row.CNPJ_CPF || '').replace(/\D/g, '').slice(0, 14);

        consultants.push({
            id: uuid,
            nome: (row.Nome || '').trim(),
            email: (row['E-mail'] || `consultor${id}@rsprolipsi.com.br`).trim(),
            cpf: cpfClean,
            whatsapp: (row.Celular || '').trim(),
            cidade: (row.Cidade || '').trim(),
            estado: (row.Estado || '').trim(),
            status: (row.Situacao || 'Ativo').toLowerCase() === 'ativo' ? 'ativo' : 'inativo',
            patrocinador_id: sponsorUUID,
            pin_atual: ((row.Nome || '').toLowerCase().includes('empresa') || id === ROOT_INT_ID) ? 'Presidente' : 'Consultor',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    });

    // Sort Logic (Topological)
    console.log('Sorting by dependency...');
    let sorted = [];
    let pending = [...consultants];
    const insertedUUIDs = new Set();

    // Seed with Root 
    // We assume ROOT_UUID is already in DB or will be inserted
    // Since Upsert might process Root in the JSON, we don't necessarily enable it yet unless it's in the sorted list.
    // BUT we know Root exists, so any child of Root CAN be inserted.
    insertedUUIDs.add(ROOT_UUID);

    let madeProgress = true;
    while (pending.length > 0 && madeProgress) {
        madeProgress = false;
        const nextPending = [];

        for (const c of pending) {
            // Check Parent
            // If parent is null -> OK
            // If parent is ROOT -> OK (seeded)
            // If parent is in inserted -> OK

            if (!c.patrocinador_id || insertedUUIDs.has(c.patrocinador_id)) {
                sorted.push(c);
                insertedUUIDs.add(c.id);
                madeProgress = true;
            } else {
                nextPending.push(c);
            }
        }
        pending = nextPending;
    }

    if (pending.length > 0) {
        console.warn('Cyclic dependency or missing parents detected for ' + pending.length + ' items. Appending them at end.');
        sorted = sorted.concat(pending);
    }

    fs.writeFileSync(path.join(__dirname, 'import_network.json'), JSON.stringify(sorted, null, 2));
    console.log('JSON generated at scripts/import_network.json');
}

generate();
