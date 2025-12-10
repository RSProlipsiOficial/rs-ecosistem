import { Client } from 'pg';

// Configuração usando a connection string do arquivo de credenciais
const supabaseConfig = {
  host: 'db.rptkhrboejbwexseikuo.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres', // Usuário padrão do PostgreSQL
  password: 'Yannis784512@',
  ssl: { rejectUnauthorized: false }
};

async function listTables() {
  const client = new Client(supabaseConfig);

  try {
    await client.connect();
    console.log('✅ Conectado ao Supabase');

    // Listar tabelas do schema public
    const result = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 TABELAS DO SCHEMA PUBLIC:');
    console.log('='.repeat(50));
    result.rows.forEach((row: any) => {
      console.log(`${row.table_type.toUpperCase()}: ${row.table_name}`);
    });

    // Listar tabelas do schema auth
    const authResult = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'auth'
      ORDER BY table_name;
    `);

    console.log('\n🔐 TABELAS DO SCHEMA AUTH:');
    console.log('='.repeat(50));
    authResult.rows.forEach((row: any) => {
      console.log(`${row.table_type.toUpperCase()}: ${row.table_name}`);
    });

    console.log('\n✅ Inventário de tabelas concluído!');

  } catch (error: any) {
    console.error('❌ Erro ao conectar/listar tabelas:', error.message);
  } finally {
    await client.end();
  }
}

// Executar a função
listTables();