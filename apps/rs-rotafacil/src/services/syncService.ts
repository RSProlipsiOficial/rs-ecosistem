import { createClient } from '@supabase/supabase-js';
import { supabase as localSupabase } from '@/integrations/supabase/client';

// Credenciais do Supabase Central (RS Prólipsi)
const CENTRAL_SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const CENTRAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

// Instância do cliente central
const centralSupabase = createClient(CENTRAL_SUPABASE_URL, CENTRAL_SUPABASE_ANON_KEY);

interface SyncResult {
    success: boolean;
    message: string;
}

/**
 * Serviço responsável por sincronizar os dados do consultor da plataforma central
 * para o banco de dados local do RotaFácil.
 */
export const syncService = {
    /**
     * Sincroniza os dados do perfil do usuário logado.
     */
    async syncProfile(userId: string): Promise<SyncResult> {
        try {
            // 1. Obter o MMN_ID do perfil local
            const { data: localProfile, error: localError } = await (localSupabase as any)
                .from('user_profiles')
                .select('mmn_id, email')
                .eq('user_id', userId)
                .maybeSingle();

            if (localError || !localProfile) {
                return { success: false, message: 'Perfil local não encontrado.' };
            }

            if (!localProfile.mmn_id) {
                return { success: false, message: 'MMN ID não configurado no perfil local.' };
            }

            // 2. Buscar dados na plataforma central usando o mmn_id (mapeado como 'login' na central?)
            // Baseado em sigma.routes.ts, 'login' é o identificador usado.
            const { data: centralData, error: centralError } = await centralSupabase
                .from('consultores')
                .select('*')
                .eq('username', (localProfile as any).mmn_id)
                .maybeSingle();

            if (centralError || !centralData) {
                return { success: false, message: 'Dados não encontrados na plataforma central.' };
            }

            // 3. Mapear e atualizar campos locais
            const updateData = {
                nome_completo: centralData.nome,
                telefone: centralData.telefone,
                cpf: centralData.cpf,
                updated_at: new Date().toISOString()
            };

            const { error: updateError } = await localSupabase
                .from('user_profiles')
                .update(updateData)
                .eq('user_id', userId);

            if (updateError) {
                throw updateError;
            }

            return { success: true, message: 'Dados sincronizados com sucesso!' };
        } catch (error: any) {
            console.error('Erro na sincronização:', error);
            return { success: false, message: 'Falha ao sincronizar dados: ' + error.message };
        }
    }
};
