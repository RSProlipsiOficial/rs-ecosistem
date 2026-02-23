import { createClient } from '@supabase/supabase-js';

// SUBSTITUA COM SUAS CHAVES REAIS DO SUPABASE
// Em um ambiente de produção real, use variáveis de ambiente (process.env.REACT_APP_...)
const SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

// Helper to detect if we are using the default placeholder strings
const isMock = SUPABASE_URL.includes('sua-url-do-projeto') || SUPABASE_ANON_KEY.includes('sua-chave-anonima');

// Mock implementation to allow UI to function without real backend credentials
const mockSupabase = {
  auth: {
    getSession: async () => {
      // Return no session by default for mock
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      // Return dummy subscription
      return { data: { subscription: { unsubscribe: () => { } } } };
    },
    signUp: async ({ email, password, options }: any) => {
      console.log('MOCK SIGNUP:', { email, password, options });
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        data: {
          user: {
            id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
            email: email,
            user_metadata: { full_name: options?.data?.full_name || 'Mock User' }
          },
          session: { access_token: 'mock-token' }
        },
        error: null
      };
    },
    signInWithPassword: async ({ email, password }: any) => {
      console.log('MOCK SIGNIN:', { email });
      await new Promise(resolve => setTimeout(resolve, 800));

      const emailClean = email.trim().toLowerCase();
      const passwordClean = password.trim();

      // Validação Específica para os usuários solicitados
      if (emailClean === 'robertorjbc@gmail.com' || emailClean === 'rsprolipsioficial@gmail.com' || passwordClean === 'Yannis784512@') {
        if (passwordClean !== 'Yannis784512@') {
          return { data: { user: null, session: null }, error: { message: 'Senha incorreta para este usuário.' } };
        }
      }

      // Allow testing error states if password is 'error' (generic fallback)
      if (passwordClean === 'error') {
        return { data: { user: null, session: null }, error: { message: 'Credenciais inválidas.' } };
      }

      return {
        data: {
          user: {
            id: emailClean === 'robertorjbc@gmail.com' ? 'user-admin-01' : 'user-consultor-02',
            email: email,
            user_metadata: {
              full_name: emailClean === 'robertorjbc@gmail.com' ? 'Roberto Admin' : 'Consultor RS'
            }
          },
          session: { access_token: 'mock-token' }
        },
        error: null
      };
    },
    signOut: async () => {
      return { error: null };
    }
  }
};

if (isMock) {
  console.warn("⚠️ RS MiniSite: Executando com cliente Supabase MOCK. Configure suas chaves reais em supabaseClient.ts para persistência de dados.");
}

// Export either the real client or the mock based on config
export const supabase = isMock
  ? (mockSupabase as any)
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);