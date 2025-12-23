
import { createClient } from '@supabase/supabase-js';
import pkg from 'xlsx';
const { readFile, utils } = pkg;
import path from 'path';
import fs from 'fs';

// Manually load .env
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        console.log(`Loading .env from ${envPath}`);
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.join('=').trim().replace(/^['"]|['"]$/g, '');
            }
        });
    }
} catch (e) {
    console.warn('Failed to load .env manually', e);
}

const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY;
const IS_SERVICE_ROLE = true;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: SUPABASE_URL and KEY must be set.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

interface ExcelRow {
    ID: string | number;
    Nome: string;
    Indicador: string | number;
    'E-mail': string;
    Origem?: string;
}

interface ConsultantNode {
    id: string;
    name: string;
    email: string;
    username: string;
    sponsorUsername: string;
    children: ConsultantNode[];
    originalRowIndex: number;
}

const EXCEL_FILE_PATH = String.raw`g:\Rs  Ecosystem\rs-ecosystem\Documentação RS Prólipsi (Ver Sempre)\Rede RS Prólipsi.xlsx`;

async function importConsultants() {
    console.log(`🚀 Starting Excel import process (${IS_SERVICE_ROLE ? 'Service Role' : 'Anon'})...`);

    // Authenticate only if NOT service role
    if (!IS_SERVICE_ROLE) {
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: 'robertorjbc@gmail.com',
                password: 'RS0rcq31'
            });

            if (authError) {
                throw new Error(`Auth Failed: ${authError.message}`);
            }
            console.log('✅ Authenticated as Admin:', authData.user.email);
        } catch (e) {
            console.error('❌ Authentication failed.', e);
            return;
        }
    } else {
        console.log('⚡ Using Service Role Key (Bypassing Auth/RLS)');
    }

    try {
        const workbook = readFile(EXCEL_FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = utils.sheet_to_json<ExcelRow>(worksheet);

        await processConsultants(rows);

    } catch (error) {
        console.error('❌ Failed to read Excel file:', error);
    }
}

async function processConsultants(rows: ExcelRow[]) {
    const nodes: ConsultantNode[] = [];
    let lastNode: ConsultantNode | null = null;

    rows.forEach((row, index) => {
        if (row.ID) { // Data Row
            const newNode: ConsultantNode = {
                id: String(row.ID),
                name: row.Nome,
                email: row['E-mail'] || '',
                username: '',
                sponsorUsername: '',
                children: [],
                originalRowIndex: index
            };
            nodes.push(newNode);
            lastNode = newNode;
        } else if (row.Nome && lastNode) { // Username Row
            lastNode.username = String(row.Nome).trim();
            lastNode.sponsorUsername = row.Indicador ? String(row.Indicador).trim() : '';
        }
    });

    console.log(`✅ Parsed ${nodes.length} consultants.`);

    const usernameMap = new Map<string, ConsultantNode>();
    const idMap = new Map<string, ConsultantNode>();

    nodes.forEach(node => {
        if (node.username) usernameMap.set(node.username.toLowerCase(), node);
        idMap.set(node.id, node);
    });

    const rootNode = idMap.get('7838667');
    if (rootNode) {
        if (!rootNode.username) rootNode.username = 'rsprolipsi';
        usernameMap.set('rsprolipsi', rootNode);
    }

    const rootConsultants: ConsultantNode[] = [];

    nodes.forEach(node => {
        // Handle "admin" as root too
        const sponsorUser = node.sponsorUsername ? node.sponsorUsername.toLowerCase() : '';

        if (sponsorUser && usernameMap.has(sponsorUser)) {
            const parent = usernameMap.get(sponsorUser)!;
            parent.children.push(node);
        } else {
            rootConsultants.push(node);
        }
    });

    const sortNodes = (nodeList: ConsultantNode[]) => {
        nodeList.sort((a, b) => a.originalRowIndex - b.originalRowIndex);
        nodeList.forEach(c => sortNodes(c.children));
    }
    sortNodes(rootConsultants);

    console.log(`🌳 Hierarchy built. Found ${rootConsultants.length} top-level nodes.`);

    for (const root of rootConsultants) {
        await insertConsultantRecursive(root, null);
    }

    console.log('🏁 Import completed!');
}

async function insertConsultantRecursive(node: ConsultantNode, sponsorId: string | null) {
    const { data: existing } = await supabase
        .from('consultants')
        .select('id')
        .eq('code', node.id)
        .maybeSingle();

    let dbId: string;

    if (existing) {
        dbId = existing.id;
    } else {
        const email = node.email || `missing-${node.id}@example.com`;
        // Insert
        const { data: inserted, error } = await supabase
            .from('consultants')
            .insert({
                name: node.name,
                email: email,
                code: node.id,
                sponsor_id: sponsorId,
                username: node.username,
                status: 'active',
                role: node.username === 'rsprolipsi' || node.username === 'admin' ? 'admin' : 'consultant',
                registration_date: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            // If error is related to constraint, log it but don't stop?
            console.error(`   ❌ Insert failed for ${node.name}: ${error.message}`);
            return;
        }
        console.log(`   ✅ Inserted: ${node.name}`);
        dbId = inserted.id;
    }

    for (const child of node.children) {
        await insertConsultantRecursive(child, dbId);
    }
}

importConsultants();
