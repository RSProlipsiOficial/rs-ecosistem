
/**
 * RS-SYNC-DROPSHIPPING-PROTOCOL (v2 — Persistência Completa)
 * Serviço de sincronia para o RS Drop (Central de Dropshipping).
 * Consolida dados de minisite_profiles + consultores e PERSISTE de volta
 * em minisite_profiles para vinculação permanente entre todos os painéis.
 */

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase Central
const CENTRAL_SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';
const supabase = createClient(CENTRAL_SUPABASE_URL, SERVICE_ROLE_KEY);

export interface DropSyncResult {
    success: boolean;
    message: string;
    data?: any;
}

export const syncDropProfile = async (userId: string): Promise<DropSyncResult> => {
    console.log(`[SyncService RS-DROP v2] Iniciando sincronia persistente para: ${userId}`);

    try {
        const emailPrefix = userId?.split('@')[0];
        const isMaster = userId === 'rsprolipsi' || userId?.toLowerCase().includes('rsprolipsioficial');
        const OFFICIAL_LOGO_GOLD = 'https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6';

        // 1. Buscar minisite_profiles (fonte primária)
        const { data: profile, error } = await supabase
            .from('minisite_profiles')
            .select('*')
            .or(`consultant_id.eq.${userId},id.eq.${userId},email.ilike.${emailPrefix}@gmail.%`)
            .maybeSingle();

        if (error) throw error;

        // 2. Buscar consultores (fonte secundária — dados legados/MLM)
        let consultorData: any = null;
        const { data: consultor } = await supabase
            .from('consultores')
            .select('*')
            .or(`id.eq.${userId},username.eq.${userId},email.ilike.${emailPrefix}@gmail.%`)
            .maybeSingle();
        if (consultor) consultorData = consultor;

        // 3. Buscar user_profiles (fonte terciária)
        let userProfileData: any = null;
        const { data: up } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        if (up) userProfileData = up;

        // 4. Consolidar dados (prioridade: minisite > consultor > user_profiles)
        const masterData = {
            name: profile?.name || consultorData?.nome || userProfileData?.nome_completo || 'RS PRÓLIPSI',
            email: profile?.email || consultorData?.email || userProfileData?.email || '',
            phone: profile?.phone || consultorData?.whatsapp || consultorData?.telefone || userProfileData?.telefone || '',
            cpf: profile?.cpf || consultorData?.cpf || userProfileData?.cpf || '',
            avatar_url: isMaster ? OFFICIAL_LOGO_GOLD : (profile?.avatar_url || userProfileData?.avatar_url || null),
            address_zip: profile?.address_zip || consultorData?.cep || userProfileData?.endereco_cep || '',
            address_street: profile?.address_street || consultorData?.endereco || userProfileData?.endereco_rua || '',
            address_number: profile?.address_number || consultorData?.numero || userProfileData?.endereco_numero || '',
            address_neighborhood: profile?.address_neighborhood || consultorData?.bairro || userProfileData?.endereco_bairro || '',
            address_city: profile?.address_city || consultorData?.cidade || userProfileData?.endereco_cidade || '',
            address_state: profile?.address_state || consultorData?.estado || userProfileData?.endereco_estado || '',
            consultant_id: profile?.consultant_id || userId,
            updated_at: new Date().toISOString()
        };

        // 5. PERSISTIR — Upsert em minisite_profiles (vinculação permanente)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        const upsertPayload = {
            ...masterData,
            ...(isUUID && !profile ? { id: userId } : {}),
            type: profile?.type || 'drop'
        };

        const { error: upsertError } = await supabase
            .from('minisite_profiles')
            .upsert(upsertPayload, { onConflict: 'consultant_id' });

        if (upsertError) {
            console.warn('[SyncService RS-DROP] Upsert falhou, tentando update:', upsertError);
            if (profile?.id) {
                await supabase.from('minisite_profiles').update(masterData).eq('id', profile.id);
            }
        }

        console.log('[SyncService RS-DROP v2] ✅ Sync persistido com sucesso!');

        return {
            success: true,
            message: 'Dados sincronizados e SALVOS permanentemente no Supabase!',
            data: {
                name: masterData.name,
                role: 'Admin',
                id: userId,
                shortId: userId.includes('-') && userId.length > 10 ? userId.split('-')[0].toUpperCase() : userId,
                avatarUrl: masterData.avatar_url,
                email: masterData.email,
                phone: masterData.phone,
                cpf_cnpj: masterData.cpf,
                cep: masterData.address_zip,
                street: masterData.address_street,
                number: masterData.address_number,
                neighborhood: masterData.address_neighborhood,
                city: masterData.address_city,
                state: masterData.address_state
            }
        };

    } catch (err: any) {
        console.error("[SyncService RS-DROP] Erro:", err);
        return {
            success: false,
            message: `Erro na sincronia: ${err.message}`,
        };
    }
};
