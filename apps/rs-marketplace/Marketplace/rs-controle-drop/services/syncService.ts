/**
 * SERVIÇO DE SINCRONIZAÇÃO - RS CONTROLE DROP
 * Sincroniza dados da plataforma central (RS Prólipsi) com o Controle Drop.
 */

import { createClient } from '@supabase/supabase-js';
import { supabase as localSupabase } from './supabaseClient';

// Configurações do Supabase Central
const CENTRAL_SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const CENTRAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

// CHAVE DE SERVIÇO ( Bypass RLS para Demo/MVP )
// ATENÇÃO: Em produção real, o Sync deve ser feito via API segura.
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const centralSupabase = createClient(CENTRAL_SUPABASE_URL, CENTRAL_SUPABASE_ANON_KEY);
const adminSupabase = createClient(CENTRAL_SUPABASE_URL, SERVICE_ROLE_KEY);

interface SyncResult {
    success: boolean;
    message: string;
    data?: any;
}

export const syncService = {
    /**
     * Sincroniza o perfil do consultor logado.
     */
    async syncProfile(userId?: string): Promise<SyncResult> {
        try {
            console.log('[Sync Controle Drop] Iniciando sincronização...', { userId });

            // 1. Identificar Usuário (Fallback para Admin na Demo)
            let userEmail = 'rsprolipsioficial@gmail.com';

            // Na Demo, tentamos pegar o email do auth local se existir
            const { data: userData } = await localSupabase.auth.getUser();
            if (userData?.user?.email) {
                userEmail = userData.user.email;
            }

            // 2. Buscar dados na plataforma central via Email (Chave Global)
            const { data: centralData, error: centralError } = await centralSupabase
                .from('consultores')
                .select('*')
                .eq('email', userEmail)
                .maybeSingle();

            if (centralError || !centralData) {
                return { success: false, message: 'Conta não encontrada na RS Prólipsi.' };
            }

            // 3. Buscar Avatar Central
            let avatarUrl = null;
            if (centralData.user_id) {
                const { data: centralProfile } = await centralSupabase
                    .from('user_profiles')
                    .select('avatar_url')
                    .eq('user_id', centralData.user_id)
                    .maybeSingle();
                if (centralProfile) avatarUrl = centralProfile.avatar_url;
            }

            // 4. Mapear Payload
            const updatePayload = {
                nome_completo: centralData.nome,
                telefone: centralData.telefone || centralData.whatsapp,
                cpf: centralData.cpf,
                endereco_cep: centralData.cep,
                endereco_rua: centralData.endereco,
                endereco_numero: centralData.numero,
                endereco_bairro: centralData.bairro,
                endereco_cidade: centralData.cidade,
                endereco_estado: centralData.estado,
                avatar_url: avatarUrl,
                mmn_id: centralData.username,
                updated_at: new Date().toISOString()
            };

            // 5. Salvar localmente (usando adminSupabase para evitar Permission Denied no central em modo demo)
            // Se tivermos um userId real, usamos ele. Se não, usamos um placeholder fixo para o Admin na demo.
            const targetId = userId || centralData.user_id || 'admin-demo-id';

            const { error: updateError } = await adminSupabase
                .from('user_profiles')
                .upsert({ user_id: targetId, ...updatePayload }, { onConflict: 'user_id' });

            if (updateError) throw updateError;

            return {
                success: true,
                message: 'Dados sincronizados com a RS Prólipsi com sucesso!',
                data: updatePayload
            };

        } catch (error: any) {
            console.error('[Sync Controle Drop] Erro:', error);
            return { success: false, message: 'Falha na sincronização: ' + error.message };
        }
    }
};
