import { createClient } from '@supabase/supabase-client'

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixEverything() {
    console.log('Iniciando correção total...')

    // 1. Inserir dados corretos (Garante que existam)
    const { error: insertError } = await supabase
        .from('landing_content')
        .upsert([
            { section: 'footer', content_key: 'phone', content_value: '(41) 99928-63922', content_type: 'text' },
            { section: 'footer', content_key: 'email', content_value: 'rsrotafacil@gmail.com', content_type: 'text' },
            { section: 'footer', content_key: 'address', content_value: 'Piraquara-Pr', content_type: 'text' }
        ], { onConflict: 'section,content_key' })

    if (insertError) {
        console.error('Erro ao inserir dados:', insertError)
    } else {
        console.log('Dados inseridos/atualizados com sucesso!')
    }

    // 2. Tentar liberar RLS via RPC (se existir) ou informar necessidade
    console.log('Nota: Verifique se o RLS está liberado para SELECT público na tabela landing_content.')
}

fixEverything()
