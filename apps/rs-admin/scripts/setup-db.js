/**
 * Script Node.js para configurar o banco de dados Supabase
 * Executa o SQL via API REST do Supabase
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNjkyNTIsImV4cCI6MjA0Njg0NTI1Mn0.KxLqKgZ8N5Q6kXhPbKj7gT3dC4mB1wV9zR2eS8fN6jI';

console.log('🚀 Iniciando configuração do banco de dados...\n');

// Ler o arquivo SQL
const sqlPath = path.join(__dirname, '..', '..', 'SQL-COMUNICACAO-SUPABASE.sql');

try {
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('✅ SQL carregado com sucesso!');
    console.log(`📊 Tamanho: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);
    
    console.log('📋 INSTRUÇÕES:\n');
    console.log('1. Abra: https://rptkhrboejbwexseikuo.supabase.co');
    console.log('2. Clique em "SQL Editor" no menu lateral');
    console.log('3. Clique em "+ New Query"');
    console.log('4. Cole o conteúdo do arquivo: SQL-COMUNICACAO-SUPABASE.sql');
    console.log('5. Clique em "RUN" (ou pressione Ctrl+Enter)\n');
    
    console.log('📝 Após executar, as seguintes tabelas serão criadas:\n');
    console.log('   ✓ announcements - Comunicados');
    console.log('   ✓ agenda_items - Agenda Comemorativa');
    console.log('   ✓ trainings - Treinamentos');
    console.log('   ✓ training_lessons - Lições');
    console.log('   ✓ training_progress - Progresso');
    console.log('   ✓ catalogs - Catálogos');
    console.log('   ✓ download_materials - Materiais');
    console.log('   ✓ download_logs - Logs');
    console.log('   ✓ content_tags - Tags');
    console.log('   ✓ content_tag_relations - Relacionamentos\n');
    
    // Copiar SQL para clipboard se possível
    const clipboardy = require('clipboardy');
    clipboardy.writeSync(sqlContent);
    console.log('📋 SQL copiado para a área de transferência!\n');
    console.log('✨ Agora basta colar no SQL Editor do Supabase e clicar em RUN!\n');
    
} catch (error) {
    if (error.code === 'ENOENT') {
        console.error('❌ Arquivo SQL não encontrado:', sqlPath);
    } else if (error.message.includes('clipboardy')) {
        // Clipboardy não disponível, continuar sem copiar
        console.log('⚠️  Copiar para clipboard não disponível. Abra o arquivo manualmente.\n');
    } else {
        console.error('❌ Erro:', error.message);
    }
}

console.log('🏁 Script de instrução concluído!\n');
