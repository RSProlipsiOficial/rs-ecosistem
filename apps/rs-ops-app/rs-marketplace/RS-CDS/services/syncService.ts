/**
 * SERVIÇO DE SINCRONIZAÇÃO - RS-CDS (MASTER SYNC)
 * Sincroniza dados de TODAS as plataformas (Central, Rota, Drop, Marketplace)
 * para garantir um perfil unificado e completo no CD.
 */

import { createClient } from '@supabase/supabase-js';
import { supabase as localSupabase, adminSupabase } from './supabaseClient';

// Configurações do Supabase Central (Usa Admin Client compartilhado)
const centralSupabase = adminSupabase;

interface SyncResult {
    success: boolean;
    message: string;
    data?: any;
}

export const syncService = {
    /**
     * Sincroniza o perfil do CD baseado no proprietário vinculado (userId).
     * Puxa dados de 'consultores' (Central), 'user_profiles' (Rota/Drop) e 'minisite_profiles' (CD/Central).
     * Consolidando a melhor informação de cada fonte.
     */
    async syncCDProfile(userId: string, options?: { email?: string; document?: string }): Promise<SyncResult> {
        try {
            console.log(`[SyncService RS-CDS] Iniciando Master Sync para: ${userId}`, options);

            if (!userId) {
                return { success: false, message: 'ID de usuário inválido.' };
            }

            // 1. Identificação Inicial (Email/Doc)
            let userEmail = options?.email;
            let userDoc = options?.document?.replace(/\D/g, '');

            if (!userEmail) {
                const { data: userData } = await localSupabase.auth.getUser();
                userEmail = userData?.user?.email;
            }

            if (!userEmail && userId === 'rsprolipsi') userEmail = 'rsprolipsioficial@gmail.com';

            // 2. BUSCA MULTI-FONTE (Parelelo para performance)
            console.log("[SyncService] Buscando dados em todas as plataformas...");

            // Promise 1: Tabela Consultores (Base Legal / MMN)
            const pConsultor = (async () => {
                let query = centralSupabase.from('consultores').select('*');
                if (userEmail) query = query.eq('email', userEmail);
                else if (userDoc) query = query.eq('cpf', userDoc);
                else if (userId) query = query.eq('user_id', userId);
                const { data } = await query.maybeSingle();
                return data;
            })();

            // Promise 2: Tabela User Profiles (Rota Fácil / App / Drop)
            const pUserProfile = (async () => {
                let query = centralSupabase.from('user_profiles').select('*');
                if (userId) query = query.eq('user_id', userId); // Priority
                else if (userEmail) query = query.eq('email', userEmail);
                const { data } = await query.maybeSingle();
                return data;
            })();

            // Promise 3: Tabela Minisite Profiles (CD Central / Marketplace)
            const pMinisite = (async () => {
                let query = centralSupabase.from('minisite_profiles').select('*');
                if (userId) query = query.or(`consultant_id.eq.${userId},id.eq.${userId}`);
                else if (userEmail) {
                    const emailPrefix = userEmail.split('@')[0];
                    query = query.ilike('email', `${emailPrefix}%`);
                }
                const { data } = await query.maybeSingle();
                return data;
            })();

            const [consultorData, userProfileData, minisiteData] = await Promise.all([pConsultor, pUserProfile, pMinisite]);

            // 3. CONSOLIDAÇÃO DE DADOS (Master Record)
            // Prioridade: Minisite (Já editado) > Consultor (Oficial) > UserProfile (App)

            const masterData = {
                name: minisiteData?.name || consultorData?.nome || userProfileData?.nome_completo || userProfileData?.name || 'CD Em Configuração',
                avatar_url: minisiteData?.avatar_url || userProfileData?.avatar_url || null,
                email: minisiteData?.email || consultorData?.email || userProfileData?.email || userEmail,
                phone: minisiteData?.phone || consultorData?.whatsapp || consultorData?.telefone || userProfileData?.telefone || userProfileData?.whatsapp || null,
                cpf: minisiteData?.cpf || consultorData?.cpf || userProfileData?.cpf || userDoc || null,

                // Endereço (Consolidado - tenta preencher buracos)
                address_zip: minisiteData?.address_zip || consultorData?.cep || userProfileData?.cep || '',
                address_street: minisiteData?.address_street || consultorData?.endereco || userProfileData?.endereco || '',
                address_number: minisiteData?.address_number || consultorData?.numero || userProfileData?.numero || '',
                address_neighborhood: minisiteData?.address_neighborhood || consultorData?.bairro || userProfileData?.bairro || '',
                address_city: minisiteData?.address_city || consultorData?.cidade || userProfileData?.cidade || '',
                address_state: minisiteData?.address_state || consultorData?.estado || userProfileData?.estado || '',

                updated_at: new Date().toISOString()
            };

            console.log("[SyncService] Dados Consolidados:", masterData);

            // 4. PERSISTÊNCIA NO SUPABASE (Minisite Profiles - Tabela Mestre do CD)
            // Usa upsert para garantir criação ou atualização

            // Garantir ID correto
            const targetId = minisiteData?.id || userId; // Se já existe usa o ID do registro, senão o userId
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

            const payload = {
                ...masterData,
                consultant_id: userId, // Vínculo crucial
                type: minisiteData?.type || 'cd' // Mantém tipo existente ou define como CD
            };

            // Upsert Logic
            const { data: savedData, error: saveError } = await adminSupabase
                .from('minisite_profiles')
                .upsert(payload, { onConflict: 'consultant_id' }) // Chave única recomendada
                .select()
                .single();

            if (saveError) {
                // Fallback se upsert falhar por constraints (ex: id duplicado diferente de consultant_id)
                console.warn("[SyncService] Upsert falhou, tentando update direto...", saveError);
                const { error: updateError } = await adminSupabase
                    .from('minisite_profiles')
                    .update(masterData)
                    .eq('consultant_id', userId);

                if (updateError) throw updateError;
            }

            console.log("[SyncService] ✅ Master Sync Concluído com Sucesso!");

            return {
                success: true,
                message: 'Sincronização Profunda Concluída! Dados de todas as plataformas foram unificados.',
                data: payload
            };

        } catch (error: any) {
            console.error('[SyncService RS-CDS] Erro Fatal no Sync:', error);
            return { success: false, message: 'Erro na sincronização: ' + error.message };
        }
    }
};
