import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://rptbvexseikuo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGJ2ZXhzZWlrdW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDU0MjgxMSwiZXhwIjoyMDUwMTE4ODExfQ.NNZxmC6-R3lF8nqmwLTqVmCrqG3fIvIcJhzaHY9lJ7Q'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Buscando dados de footer em landing_content...\n')

const { data, error } = await supabase
    .from('landing_content')
    .select('*')
    .eq('section', 'footer')
    .order('content_key')

if (error) {
    console.error('❌ Erro:', error)
} else if (!data || data.length === 0) {
    console.log('⚠️ NENHUM DADO encontrado para section="footer"')
} else {
    console.log(`✅ Encontrados ${data.length} registros:\n`)
    data.forEach(item => {
        console.log(`   ${item.content_key}: "${item.content_value}"`)
    })
}
