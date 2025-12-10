/**
 * Configurações Supabase (rs-core)
 * ATENÇÃO: Não commitar com credenciais reais
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  databaseUrl: string;
  jwtSecret: string;
  projectId: string;
}

/**
 * Template de configuração Supabase
 * Substituir com valores do arquivo CREDENCIAIS.md
 */
export const supabaseConfig: SupabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  databaseUrl: process.env.SUPABASE_DATABASE_URL || '',
  jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  projectId: process.env.SUPABASE_PROJECT_ID || '',
};

/**
 * Valida se as credenciais estão configuradas
 */
export function validateSupabaseConfig(): boolean {
  const required = [
    supabaseConfig.url,
    supabaseConfig.anonKey,
    supabaseConfig.serviceRoleKey,
  ];
  
  return required.every(field => field && field.length > 0);
}

/**
 * Retorna config mascarada para logs
 */
export function getMaskedConfig() {
  return {
    url: supabaseConfig.url,
    projectId: supabaseConfig.projectId,
    keysConfigured: validateSupabaseConfig(),
  };
}
