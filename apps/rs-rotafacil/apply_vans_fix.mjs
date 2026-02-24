import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Ler variáveis de ambiente do .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length) {
        envVars[key.trim()] = valueParts.join('=').trim()
    }
})

const supabaseUrl = envVars['VITE_SUPABASE_URL']
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Erro: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function applyMigration() {
    console.log('🔧 Aplicando correção de RLS nas vans...\n')

    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260112_fix_vans_rls_recursion.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    // Dividir em comandos individuais
    const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd && !cmd.startsWith('--') && cmd !== 'BEGIN' && cmd !== 'COMMIT')

    console.log(`📝 Executando ${commands.length} comandos SQL...\n`)

    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i]
        if (!cmd) continue

        try {
            const { error } = await supabase.rpc('exec_sql', { query: cmd })

            if (error) {
                console.error(`❌ Erro no comando ${i + 1}:`, error.message)
            } else {
                console.log(`✅ Comando ${i + 1}/${commands.length} executado com sucesso`)
            }
        } catch (err) {
            console.error(`❌ Exceção no comando ${i + 1}:`, err)
        }
    }

    console.log('\n✅ Migration aplicada! Testando acesso às vans...\n')

    // Testar se as vans agora carregam
    const { data: vans, error: vansError } = await supabase
        .from('vans')
        .select('id, nome, user_id')
        .limit(5)

    if (vansError) {
        console.error('❌ Erro ao buscar vans:', vansError.message)
    } else {
        console.log(`✅ Vans carregadas com sucesso! Total encontrado: ${vans?.length || 0}`)
        if (vans && vans.length > 0) {
            console.log('📋 Primeiras vans:')
            vans.forEach(van => console.log(`   - ${van.nome} (ID: ${van.id})`))
        }
    }
}

applyMigration().catch(console.error)
