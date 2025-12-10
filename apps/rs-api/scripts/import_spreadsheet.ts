
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import * as XLSX from 'xlsx';
import fs from 'fs';

// Load env vars
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ROOT_EMAIL = 'rsprolipsioficial@gmail.com';
const DEFAULT_FILE_PATH = 'g:\\Rs  Ecosystem\\rs-ecosystem\\Documentação RS Prólipsi (Ver Sempre)\\Rede RS Prólipsi.xlsx';
const ROOT_NUMERIC_ID = '7838667';
const ROOT_USERNAME = 'rsprolipsi';

interface ImportStats {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  details: string[];
}

const stats: ImportStats = {
  total: 0,
  created: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  details: []
};

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/\s+/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getCell(row: any, patterns: RegExp[]): any {
  const keys = Object.keys(row);
  for (const p of patterns) {
    const key = keys.find(k => p.test(normalizeHeader(k)));
    if (key) return row[key];
  }
  return undefined;
}

async function findSponsor(sponsorIdentifier: string): Promise<string | null> {
  if (!sponsorIdentifier) return null;

  // Try by ID (if UUID)
  if (sponsorIdentifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    const { data } = await supabase.from('consultores').select('id').eq('id', sponsorIdentifier).single();
    if (data) return data.id;
  }

  // Try by Email
  const { data: byEmail } = await supabase.from('consultores').select('id').eq('email', sponsorIdentifier).maybeSingle();
  if (byEmail) return byEmail.id;

  // Try by CPF (strip punctuation)
  const cleanCpf = sponsorIdentifier.replace(/\D/g, '');
  if (cleanCpf.length === 11) {
    const { data: byCpf } = await supabase.from('consultores').select('id').eq('cpf', cleanCpf).maybeSingle();
    if (byCpf) return byCpf.id;
  }

  // Try by Name (fuzzy or exact)
  const { data: byName } = await supabase.from('consultores').select('id').ilike('nome', sponsorIdentifier).maybeSingle();
  if (byName) return byName.id;

  // Try by Username
  const { data: byUsername } = await supabase.from('consultores').select('id').eq('username', sponsorIdentifier).maybeSingle();
  if (byUsername) return byUsername.id;

  // Try by Login/Username if we had that column, but we don't.
  // Maybe the identifier matches the 'email' prefix?
  const { data: byEmailPrefix } = await supabase.from('consultores').select('id').ilike('email', `${sponsorIdentifier}%`).maybeSingle();
  if (byEmailPrefix) return byEmailPrefix.id;

  return null;
}

function generateDummyCpf(): string {
  // Generate valid-looking CPF (11 digits)
  const rnd = Math.floor(Math.random() * 10000000000).toString().padStart(11, '0');
  return rnd;
}

function generateDummyEmail(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean}.${Date.now()}@prolipsi.temp`;
}

async function processFile(filePath: string) {
  console.log(`Processing file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet);

  // Preflight: ensure columns exist
  try {
    await supabase.from('consultores').select('codigo_consultor, username').limit(1);
  } catch (err) {
    console.error('Missing columns codigo_consultor/username in consultores. Execute SQL migration 008_consultores_code_username.sql in Supabase.');
    process.exit(1);
  }

  stats.total = rawData.length;
  console.log(`Found ${stats.total} rows.`);

  // Verify Root exists or create minimal root with fixed numeric id and username
  let rootId: string | null = null;
  {
    const { data: rootByCode } = await supabase.from('consultores').select('id').eq('codigo_consultor', ROOT_NUMERIC_ID).maybeSingle();
    if (rootByCode) {
      rootId = rootByCode.id;
    } else {
      const { data: rootByEmail } = await supabase.from('consultores').select('id').eq('email', ROOT_EMAIL).maybeSingle();
      rootId = rootByEmail?.id || null;
      if (!rootId) {
        const { data: authData } = await supabase.auth.admin.createUser({
          email: ROOT_EMAIL,
          password: 'ChangeMe@123456',
          email_confirm: true,
          user_metadata: { name: 'RS Prólipsi' }
        });
        const userId = authData?.user?.id || null;
        if (userId) {
          const { error: insErr } = await supabase.from('consultores').insert({
            user_id: userId,
            nome: 'RS Prólipsi',
            email: ROOT_EMAIL,
            cpf: generateDummyCpf(),
            status: 'ativo',
            pin_atual: 'Diamante',
            codigo_consultor: ROOT_NUMERIC_ID,
            username: ROOT_USERNAME
          });
          if (!insErr) {
            const { data: rootRow } = await supabase.from('consultores').select('id').eq('user_id', userId).maybeSingle();
            rootId = rootRow?.id || null;
          }
          await supabase.from('wallets').insert({ user_id: userId, consultor_id: userId, status: 'ativa', balance: 0 });
        }
      } else {
        await supabase.from('consultores').update({ codigo_consultor: ROOT_NUMERIC_ID, username: ROOT_USERNAME }).eq('id', rootId);
      }
    }
  }
  if (!rootId) {
    console.error('CRITICAL: Unable to create or locate Root RS Prólipsi');
    process.exit(1);
  }
  // Normalize rootId to consultores.id
  {
    const { data: rootRowFinal } = await supabase.from('consultores').select('id').eq('codigo_consultor', ROOT_NUMERIC_ID).maybeSingle();
    if (rootRowFinal?.id) rootId = rootRowFinal.id;
  }

  // Map for dependency resolution: Identifier -> Row
  const rowMap = new Map<string, any>();
  const rowsToProcess: any[] = [];

  // Pre-process to build map
  for (const row of rawData as any[]) {
    const origem = getCell(row, [/origem/]);
    const codigo = getCell(row, [/^id$/i, /id_num|id_numerico|codigo/]);
    const nome = getCell(row, [/^nome$|name/]);
    const indicadorNome = getCell(row, [/indicador/]);
    const username = getCell(row, [/id_em_claro|login|username|usuario/]);
    const indicadorUsername = getCell(row, [/id_em_claro_do_indicador|login_indicador|username_indicador/]);
    const email = getCell(row, [/email|e-mail/]);

    if (email) rowMap.set(String(email).toLowerCase().trim(), row);
    if (nome) rowMap.set(String(nome).toLowerCase().trim(), row);
    if (codigo) rowMap.set(String(codigo).toString().toLowerCase().trim(), row);
    if (username) rowMap.set(String(username).toLowerCase().trim(), row);

    (row as any)._std_origem = origem;
    (row as any)._std_codigo = codigo ? String(codigo).trim() : undefined;
    (row as any)._std_nome = nome;
    (row as any)._std_username = username ? String(username).trim() : undefined;
    (row as any)._std_indicador_nome = indicadorNome ? String(indicadorNome).trim() : undefined;
    (row as any)._std_indicador_username = indicadorUsername ? String(indicadorUsername).trim() : undefined;
    (row as any)._std_email = email;
    (row as any)._std_cpf = getCell(row, [/cpf|documento/]);
    (row as any)._std_phone = getCell(row, [/celular|telefone|phone|whatsapp/]);

    rowsToProcess.push(row);
  }

  const processedCache = new Set<string>();
  const createdByKey = new Map<string, string>();
  const recursionStack = new Set<string>();

  // Function to process a single row (with recursion)
  async function processRow(row: any): Promise<string | null> {
    const nome = row._std_nome;
    let email = row._std_email;
    const codigo = row._std_codigo as string | undefined;
    const username = row._std_username as string | undefined;

    if (!nome) return null;

    // Generate dummy email if missing
    if (!email) {
      email = generateDummyEmail(String(nome));
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const key = codigo || username || cleanEmail;

    if (processedCache.has(key)) {
      const { data } = await supabase.from('consultores').select('id').eq('email', cleanEmail).maybeSingle();
      return data ? data.id : null;
    }

    if (recursionStack.has(key)) {
      console.warn(`Circular dependency detected for ${key}. Linking to Root to break cycle.`);
      return rootId;
    }

    recursionStack.add(key);

    try {
      // 1. Check if exists by codigo_consultor or username or email
      let { data: existingUser } = await supabase.from('consultores').select('*').eq('codigo_consultor', codigo || '').maybeSingle();
      if (!existingUser && username) {
        const { data: byUser } = await supabase.from('consultores').select('*').eq('username', username).maybeSingle();
        if (byUser) existingUser = byUser;
      }
      if (!existingUser) {
        const { data: byEmail2 } = await supabase.from('consultores').select('*').eq('email', cleanEmail).maybeSingle();
        if (byEmail2) existingUser = byEmail2;
      }
      if (existingUser) {
        stats.updated++;
        processedCache.add(key);
        recursionStack.delete(key);
        return existingUser.id;
      }

      // 2. Resolve Sponsor
      let sponsorId = rootId;
      const sponsorRef = row._std_indicador_username || row._std_indicador_nome;

      if (sponsorRef) {
        const cleanRef = String(sponsorRef).trim();

        // a) Check DB
        let foundId = await findSponsor(cleanRef);
        if (!foundId) {
          const { data: byCodeSponsor } = await supabase.from('consultores').select('id').eq('codigo_consultor', cleanRef).maybeSingle();
          if (byCodeSponsor) foundId = byCodeSponsor.id;
        }
        if (!foundId && rowMap.has(cleanRef.toLowerCase())) {
          const sponsorRow = rowMap.get(cleanRef.toLowerCase());
          foundId = await processRow(sponsorRow);
        }

        if (foundId) {
          sponsorId = foundId;
        } else {
          stats.details.push(`Sponsor '${cleanRef}' not found for ${cleanEmail}. Linking to Root.`);
          sponsorId = rootId;
        }
      }

      // 3. Create
      const cleanCpf = row._std_cpf ? String(row._std_cpf).replace(/\D/g, '') : generateDummyCpf();
      const finalCpf = (cleanCpf.length > 11) ? cleanCpf.substring(0, 11) : cleanCpf;

      // Create Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: 'ChangeMe@123456',
        email_confirm: true,
        user_metadata: { name: nome }
      });

      if (authError) {
        stats.errors++;
        stats.details.push(`Auth error for ${cleanEmail}: ${authError.message}`);
        recursionStack.delete(key);
        return null;
      }

      const userId = authData.user.id;

      const { error: dbError } = await supabase.from('consultores').insert({
        user_id: userId,
        nome: String(nome).trim(),
        email: cleanEmail,
        cpf: finalCpf,
        patrocinador_id: null,
        status: 'ativo',
        telefone: row._std_phone ? String(row._std_phone).replace(/\D/g, '') : null,
        pin_atual: 'Consultor',
        codigo_consultor: codigo || undefined,
        username: username || undefined
      });

      if (dbError) {
        stats.errors++;
        stats.details.push(`DB create error for ${cleanEmail}: ${dbError.message}`);
        await supabase.auth.admin.deleteUser(userId);
        recursionStack.delete(key);
        return null;
      }

      const { data: consRow } = await supabase.from('consultores').select('id').eq('user_id', userId).maybeSingle();
      if (consRow?.id) {
        createdByKey.set(key, consRow.id);
        const { error: walletError } = await supabase.from('wallets').insert({
          user_id: userId,
          consultor_id: consRow.id,
          status: 'ativa',
          balance: 0
        });
        if (walletError) {
          console.error(`Error creating wallet for ${cleanEmail}:`, walletError);
        }
      }

      stats.created++;
      processedCache.add(key);
      recursionStack.delete(key);
      return userId;

    } catch (err: any) {
      stats.errors++;
      stats.details.push(`Exception for ${cleanEmail}: ${err.message}`);
      recursionStack.delete(key);
      return null;
    }
  }

  for (const row of rowsToProcess) {
    await processRow(row);
  }

  for (const row of rowsToProcess) {
    const nome = row._std_nome;
    const email = row._std_email;
    const codigo = row._std_codigo as string | undefined;
    const username = row._std_username as string | undefined;
    const key = codigo || username || String(email).toLowerCase().trim();
    const consultorId = createdByKey.get(key || '');
    if (!consultorId) continue;
    let sponsorId = rootId;
    const sponsorRef = row._std_indicador_username || row._std_indicador_nome;
    if (sponsorRef) {
      const cleanRef = String(sponsorRef).trim();
      let foundId = await findSponsor(cleanRef);
      if (!foundId) {
        const { data: byCodeSponsor } = await supabase.from('consultores').select('id').eq('codigo_consultor', cleanRef).maybeSingle();
        if (byCodeSponsor) foundId = byCodeSponsor.id;
      }
      if (!foundId && createdByKey.has(cleanRef)) {
        foundId = createdByKey.get(cleanRef) || null;
      }
      if (foundId) sponsorId = foundId;
    }
    await supabase.from('consultores').update({ patrocinador_id: sponsorId || null }).eq('id', consultorId);
  }

  console.log('--- IMPORT REPORT ---');
  console.log(`Total Rows: ${stats.total}`);
  console.log(`Created: ${stats.created}`);
  console.log(`Updated/Exists: ${stats.updated}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);

  if (stats.details.length > 0) {
    console.log('\n--- Details ---');
    stats.details.forEach(d => console.log(d));
  }
}

// Check args
const args = process.argv.slice(2);
const fileToProcess = args.find(a => !a.startsWith('--')) || DEFAULT_FILE_PATH;
const shouldReset = args.includes('--reset');

async function resetDevData() {
  console.log('Resetting development data (consultores, wallets, cycles_history, bonuses, transactions)...');
  await supabase.from('transactions').delete().neq('id', '');
  await supabase.from('bonuses').delete().neq('id', '');
  await supabase.from('cycles_history').delete().neq('id', '');
  await supabase.from('wallets').delete().neq('id', '');
  await supabase.from('consultores').delete().neq('id', '');
}

(async () => {
  if (shouldReset) await resetDevData();
  await processFile(fileToProcess);
})();
