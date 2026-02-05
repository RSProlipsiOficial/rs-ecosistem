/**
 * Configurações centralizadas da aplicação
 * Todas as variáveis de ambiente devem ser acessadas através deste arquivo
 * 
 * IMPORTANTE: Nunca exponha chaves secretas (Service Keys) no frontend!
 * Use apenas chaves públicas (Publishable/Anon Keys)
 */

export const ENV = {
    // Supabase
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

    // API
    API_URL: import.meta.env.VITE_API_URL || window.location.origin,

    // Ambiente
    ENVIRONMENT: import.meta.env.MODE || 'development',
    IS_PRODUCTION: import.meta.env.MODE === 'production',
    IS_DEVELOPMENT: import.meta.env.MODE === 'development',

    // Porta (para desenvolvimento)
    PORT: import.meta.env.VITE_PORT ? parseInt(import.meta.env.VITE_PORT) : 8080,
} as const;

// Validação de variáveis obrigatórias
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;

requiredEnvVars.forEach((key) => {
    if (!ENV[key]) {
        console.error(`❌ Variável de ambiente obrigatória não encontrada: ${key}`);
        if (ENV.IS_PRODUCTION) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
});

// Log de configuração (apenas em desenvolvimento)
if (ENV.IS_DEVELOPMENT) {
    console.log('🔧 Environment Configuration:', {
        mode: ENV.ENVIRONMENT,
        supabaseUrl: ENV.SUPABASE_URL,
        apiUrl: ENV.API_URL,
        port: ENV.PORT,
    });
}
