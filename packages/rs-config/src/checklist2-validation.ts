import { Client } from 'pg';

// Configuração do Supabase
const supabaseConfig = {
  host: 'db.rptkhrboejbwexseikuo.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Yannis784512@',
  ssl: { rejectUnauthorized: false }
};

// Requisitos V1 do LINHA_DE_PRODUCAO_V1.md
const v1Requirements = {
  core: ['users', 'profiles', 'roles', 'permissions', 'system_config'],
  consultant: ['consultants', 'consultant_info', 'consultant_referrals', 'referral_links'],
  admin: ['admin_users', 'admin_logs', 'admin_configs'],
  walletpay: ['wallet_accounts', 'wallet_transactions', 'wallet_withdraw_requests', 'bank_accounts', 'commission_rules']
};

// Mapeamento de tabelas existentes para requisitos V1
const tableMappings = {
  users: ['users', 'unified_users'],
  profiles: ['consultores'],
  roles: ['user_roles'],
  permissions: ['user_roles', 'role_permissions'],
  system_config: ['store_settings', 'sigma_settings', 'theme_settings'],
  consultants: ['consultores'],
  consultant_info: ['consultores', 'consultant_badges', 'consultant_bonuses'],
  consultant_referrals: ['referrals'],
  referral_links: ['referral_links'],
  admin_users: ['users'],
  admin_logs: ['audit_logs', 'logs_operations'],
  admin_configs: ['store_settings', 'system_configs'],
  wallet_accounts: ['wallets', 'consultant_wallets'],
  wallet_transactions: ['wallet_transactions'],
  wallet_withdraw_requests: ['withdrawal_requests'],
  bank_accounts: ['wallet_bank_accounts'],
  commission_rules: ['commission_rules']
};

async function validateChecklist2() {
  const client = new Client(supabaseConfig);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao Supabase para validação do Checklist 2');
    
    // Verificar tabelas existentes
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const existingTables = result.rows.map((row: any) => row.table_name);
    
    console.log('\n📋 VALIDAÇÃO DO CHECKLIST 2 - SUPABASE & BANCO V1');
    console.log('='.repeat(80));
    
    let totalRequirements = 0;
    let fulfilledRequirements = 0;
    
    // Validar cada categoria
    for (const [category, requirements] of Object.entries(v1Requirements)) {
      console.log(`\n${category.toUpperCase()}:`);
      console.log('-'.repeat(40));
      
      for (const requirement of requirements) {
        totalRequirements++;
        const mappedTables = tableMappings[requirement as keyof typeof tableMappings] || [];
        const exists = mappedTables.some(table => existingTables.includes(table));
        
        if (exists) {
          fulfilledRequirements++;
          console.log(`✅ ${requirement} -> ${mappedTables.join(', ')}`);
        } else {
          console.log(`❌ ${requirement} -> FALTANDO`);
        }
      }
    }
    
    // Estatísticas
    const completionRate = (fulfilledRequirements / totalRequirements) * 100;
    
    console.log('\n📊 ESTATÍSTICAS:');
    console.log('-'.repeat(40));
    console.log(`Requisitos V1: ${totalRequirements}`);
    console.log(`Implementados: ${fulfilledRequirements}`);
    console.log(`Taxa de conclusão: ${completionRate.toFixed(1)}%`);
    
    if (completionRate >= 95) {
      console.log('\n🎉 CHECKLIST 2 - SUPABASE VALIDADO COM SUCESSO!');
      console.log('O banco está pronto para o V1 do RS-PROLIPSI');
    } else {
      console.log('\n⚠️  ATENÇÃO: Alguns requisitos do V1 estão faltando');
      console.log('Recomenda-se criar as tabelas missing antes do deploy');
    }
    
  } catch (error: any) {
    console.error('❌ Erro na validação:', error.message);
  } finally {
    await client.end();
  }
}

// Executar validação
validateChecklist2();