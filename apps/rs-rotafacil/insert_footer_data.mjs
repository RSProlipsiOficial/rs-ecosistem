import fetch from 'node-fetch';

const SUPABASE_URL = 'https://rptbvexseikuo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGJdmV4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU0MjgxMSwiZXhwIjoyMDUwMTE4ODExfQ.r4oS3dtHPqW-VQqy8c4_CWBsJjYdEOm3qz6_2KCPlVU';

const footerData = [
    { section: 'footer', content_key: 'phone', content_value: '(41) 9928639-3922', content_type: 'text' },
    { section: 'footer', content_key: 'email', content_value: 'rsrotafacil@gmail.com', content_type: 'text' },
    { section: 'footer', content_key: 'address', content_value: 'Piraquara-Pr', content_type: 'text' }
];

console.log('🔄 Deletando dados antigos...');

// Delete dados antigos
const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/landing_content?section=eq.footer`, {
    method: 'DELETE',
    headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
    }
});

if (!deleteResponse.ok) {
    console.error('❌ Erro ao deletar:', await deleteResponse.text());
} else {
    console.log('✅ Dados antigos deletados');
}

console.log('\n📝 Inserindo dados novos...');

// Insert dados novos
const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/landing_content`, {
    method: 'POST',
    headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    },
    body: JSON.stringify(footerData)
});

if (!insertResponse.ok) {
    console.error('❌ Erro ao inserir:', await insertResponse.text());
} else {
    const result = await insertResponse.json();
    console.log(`✅ Inseridos ${result.length} registros:
`);
    result.forEach(r => console.log(`   ${r.content_key}: "${r.content_value}"`));
}

console.log('\n✅ CONCLUÍDO! Recarregue a landing page (Ctrl+F5)');
