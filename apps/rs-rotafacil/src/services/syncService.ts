import { createClient } from '@supabase/supabase-js';
import { supabase as localSupabase } from '@/integrations/supabase/client';

// Credenciais do Supabase Central (RS Prólipsi)
const CENTRAL_SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const CENTRAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

// Instância do cliente central
const centralSupabase = createClient(CENTRAL_SUPABASE_URL, CENTRAL_SUPABASE_ANON_KEY);
const adminSupabase = createClient(CENTRAL_SUPABASE_URL, SERVICE_ROLE_KEY);

interface SyncResult {
    success: boolean;
    message: string;
}

/**
 * Serviço responsável por sincronizar os dados do consultor da plataforma central
 * para o banco de dados local do RotaFácil e PERSISTIR em minisite_profiles.
 */
export const syncService = {
    /**
     * Sincroniza os dados do perfil do usuário logado.
     * [v2] — Agora persiste também em minisite_profiles para vinculação entre painéis.
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

            // 2. Buscar dados na plataforma central (consultores)
            const { data: centralData, error: centralError } = await centralSupabase
                .from('consultores')
                .select('*')
                .eq('username', (localProfile as any).mmn_id)
                .maybeSingle();

            if (centralError || !centralData) {
                return { success: false, message: 'Dados não encontrados na plataforma central.' };
            }

            // 3. Buscar minisite_profiles (dados mais completos)
            let minisiteData: any = null;
            if (centralData.id) {
                const { data: mp } = await centralSupabase
                    .from('minisite_profiles')
                    .select('*')
                    .or(`consultant_id.eq.${centralData.username},id.eq.${centralData.id}`)
                    .maybeSingle();
                if (mp) minisiteData = mp;
            }

            // 4. Consolidar dados (minisite > consultor)
            const masterName = minisiteData?.name || centralData.nome;
            const masterPhone = minisiteData?.phone || centralData.telefone || centralData.whatsapp;
            const masterCpf = minisiteData?.cpf || centralData.cpf;
            const masterCep = minisiteData?.address_zip || centralData.cep;
            const masterStreet = minisiteData?.address_street || centralData.endereco;
            const masterNumber = minisiteData?.address_number || centralData.numero;
            const masterNeighborhood = minisiteData?.address_neighborhood || centralData.bairro;
            const masterCity = minisiteData?.address_city || centralData.cidade;
            const masterState = minisiteData?.address_state || centralData.estado;

            // 5. Atualizar user_profiles local
            const updateData = {
                nome_completo: masterName,
                telefone: masterPhone,
                cpf: masterCpf,
                endereco_cep: masterCep,
                endereco_rua: masterStreet,
                endereco_numero: masterNumber,
                endereco_bairro: masterNeighborhood,
                endereco_cidade: masterCity,
                endereco_estado: masterState,
                updated_at: new Date().toISOString()
            };

            const { error: updateError } = await localSupabase
                .from('user_profiles')
                .update(updateData)
                .eq('user_id', userId);

            if (updateError) {
                throw updateError;
            }

            // 6. [RS-SYNC-UNIFIED] PERSISTIR em minisite_profiles (vinculação permanente)
            const minisitePayload = {
                name: masterName,
                email: centralData.email || localProfile.email,
                phone: masterPhone,
                cpf: masterCpf,
                address_zip: masterCep,
                address_street: masterStreet,
                address_number: masterNumber,
                address_neighborhood: masterNeighborhood,
                address_city: masterCity,
                address_state: masterState,
                consultant_id: centralData.username || localProfile.mmn_id,
                updated_at: new Date().toISOString()
            };

            const { error: minisiteError } = await adminSupabase
                .from('minisite_profiles')
                .upsert(minisitePayload, { onConflict: 'consultant_id' });

            if (minisiteError) {
                console.warn('[SyncService RotaFácil] Upsert minisite_profiles falhou (não-bloqueante):', minisiteError.message);
            } else {
                console.log('[SyncService RotaFácil] ✅ minisite_profiles sincronizado!');
            }

            return { success: true, message: 'Dados sincronizados e vinculados permanentemente!' };
        } catch (error: any) {
            console.error('Erro na sincronização:', error);
            return { success: false, message: 'Falha ao sincronizar dados: ' + error.message };
        }
    }
};

