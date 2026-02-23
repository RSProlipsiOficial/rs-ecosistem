/**
 * SERVIÇO DE SINCRONIZAÇÃO - RS WALLETPAY
 * Responsável por sincronizar dados entre a plataforma central e o WalletPay.
 */

import { createClient } from '@supabase/supabase-js';
import { supabase as localSupabase } from '../lib/supabaseClient';

// Configurações do Supabase Central (RS Prólipsi)
const CENTRAL_SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const CENTRAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

// Instância do cliente Supabase para a plataforma central
const centralSupabase = createClient(CENTRAL_SUPABASE_URL, CENTRAL_SUPABASE_ANON_KEY);

// CHAVE DE SERVIÇO ( Bypass RLS para Demo/MVP )
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

// Instância admin para operações locais (ignora RLS)
const LOCAL_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || CENTRAL_SUPABASE_URL;
const adminSupabase = createClient(LOCAL_SUPABASE_URL, SERVICE_ROLE_KEY);

interface SyncResult {
    success: boolean;
    message: string;
    data?: any;
}

/**
 * Serviço de sincronização para manter os dados dos consultores atualizados.
 */
export const syncService = {
    /**
     * Sincroniza o perfil do consultor logado com os dados da plataforma central.
     */
    async syncProfile(userId: string): Promise<SyncResult> {
        try {
            console.log(`[SyncService] Iniciando sincronização para user: ${userId}`);

            // 1. Validar UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isValidUUID = uuidRegex.test(userId);

            const targetId = isValidUUID ? userId : 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

            // 2. Identificar Consultor Local
            let usernameToSync = null;
            let emailToSync = 'rsprolipsioficial@gmail.com';

            const { data: consultorLocal } = await localSupabase
                .from('consultores')
                .select('username, email')
                .eq('id', targetId)
                .maybeSingle();

            if (consultorLocal) {
                usernameToSync = consultorLocal.username;
                emailToSync = consultorLocal.email || emailToSync;
            }

            // 3. Buscar dados atualizados na plataforma central
            console.log(`[SyncService] Buscando na central: ${usernameToSync || emailToSync}`);
            let centralQuery = centralSupabase.from('consultores').select('*');

            if (usernameToSync) {
                centralQuery = centralQuery.eq('username', usernameToSync);
            } else {
                centralQuery = centralQuery.eq('email', emailToSync);
            }

            const { data: centralData, error: centralError } = await centralQuery.maybeSingle();

            if (centralError || !centralData) {
                console.error('[SyncService] Erro na query central:', centralError);
                return { success: false, message: 'Consultor não encontrado na plataforma central.' };
            }

            // 4. Buscar Patrocinador (Upline) na plataforma central
            let uplineInfo = { name: 'SISTEMA RS', username: 'RAIZ', whatsapp: '' };
            if (centralData.patrocinador_uid) {
                const { data: sponsor } = await centralSupabase
                    .from('consultores')
                    .select('nome, username, whatsapp')
                    .eq('id', centralData.patrocinador_uid)
                    .maybeSingle();

                if (sponsor) {
                    uplineInfo = {
                        name: sponsor.nome,
                        username: sponsor.username,
                        whatsapp: sponsor.whatsapp || ''
                    };
                }
            }

            // 5. Buscar Dados Adicionais na tabela minisite_profiles central (Fonte da Verdade para Endereço/Nome)
            let minisiteData = null;
            if (centralData.id) {
                const { data: mProfile } = await centralSupabase
                    .from('minisite_profiles')
                    .select('*')
                    .eq('id', centralData.id)
                    .maybeSingle();
                if (mProfile) minisiteData = mProfile;
            }

            // 6. Mapear e Atualizar dados no perfil local (user_profiles)
            const updatePayload = {
                nome_completo: minisiteData?.name || centralData.nome,
                telefone: minisiteData?.phone || centralData.whatsapp || centralData.telefone,
                cpf: minisiteData?.cpf || centralData.cpf,
                endereco_cep: minisiteData?.address_zip || centralData.cep,
                endereco_rua: minisiteData?.address_street || centralData.endereco,
                endereco_numero: minisiteData?.address_number || centralData.numero,
                endereco_bairro: minisiteData?.address_neighborhood || centralData.bairro,
                endereco_cidade: minisiteData?.address_city || centralData.cidade,
                endereco_estado: minisiteData?.address_state || centralData.estado,
                avatar_url: minisiteData?.avatar_url || null,
                upline_id: uplineInfo.username,
                upline_nome: uplineInfo.name,
                mmn_id: minisiteData?.consultant_id || centralData.username
            };

            const syncUpdateResult = await syncService.updateProfile(targetId, updatePayload);
            if (!syncUpdateResult.success) throw new Error(syncUpdateResult.message);

            // 7. Sincronizar também a tabela de consultores local
            const { error: consultorUpdateError } = await adminSupabase
                .from('consultores')
                .update({
                    nome: minisiteData?.name || centralData.nome,
                    email: centralData.email,
                    whatsapp: minisiteData?.phone || centralData.whatsapp || centralData.telefone,
                    patrocinador_uid: centralData.patrocinador_uid,
                    cep: minisiteData?.address_zip || centralData.cep,
                    endereco: minisiteData?.address_street || centralData.endereco,
                    numero: minisiteData?.address_number || centralData.numero,
                    bairro: minisiteData?.address_neighborhood || centralData.bairro,
                    cidade: minisiteData?.address_city || centralData.cidade,
                    estado: minisiteData?.address_state || centralData.estado,
                    username: minisiteData?.consultant_id || centralData.username
                })
                .eq('id', targetId);

            if (consultorUpdateError) throw consultorUpdateError;

            // 8. [RS-SYNC-UNIFIED] PERSISTIR em minisite_profiles (vinculação permanente entre painéis)
            const minisitePayload = {
                name: updatePayload.nome_completo,
                email: centralData.email,
                phone: updatePayload.telefone,
                cpf: updatePayload.cpf,
                avatar_url: updatePayload.avatar_url,
                address_zip: updatePayload.endereco_cep,
                address_street: updatePayload.endereco_rua,
                address_number: updatePayload.endereco_numero,
                address_neighborhood: updatePayload.endereco_bairro,
                address_city: updatePayload.endereco_cidade,
                address_state: updatePayload.endereco_estado,
                consultant_id: centralData.username || targetId,
                updated_at: new Date().toISOString()
            };

            // Tenta upsert por consultant_id
            const { error: minisiteError } = await adminSupabase
                .from('minisite_profiles')
                .upsert(minisitePayload, { onConflict: 'consultant_id' });

            if (minisiteError) {
                console.warn('[SyncService] Upsert minisite_profiles falhou (não-bloqueante):', minisiteError.message);
                // Fallback: tenta update por id se existir
                await adminSupabase
                    .from('minisite_profiles')
                    .update(minisitePayload)
                    .eq('id', targetId);
            } else {
                console.log('[SyncService] ✅ minisite_profiles sincronizado com sucesso!');
            }

            return {
                success: true,
                message: 'Perfil e Endereço sincronizados com sucesso (incluindo vínculo permanente)!',
                data: { ...centralData, upline: uplineInfo }
            };
        } catch (error: any) {
            console.error('[SyncService] Erro na sincronização:', error);
            return { success: false, message: 'Falha ao sincronizar dados: ' + error.message };
        }
    },

    /**
     * Busca dados de um consultor na plataforma central para auto-preenchimento no cadastro.
     */
    async pullFromPlatform(identifier: string): Promise<SyncResult> {
        try {
            const isEmail = identifier.includes('@');
            const queryField = isEmail ? 'email' : 'cpf';
            const cleanIdentifier = isEmail ? identifier.trim() : identifier.replace(/\D/g, '');

            const { data, error } = await centralSupabase
                .from('consultores')
                .select('nome, email, telefone, cpf, username')
                .eq(queryField, cleanIdentifier)
                .maybeSingle();

            if (error || !data) {
                return { success: false, message: 'Nenhum consultor encontrado na plataforma central.' };
            }

            return {
                success: true,
                message: 'Consultor encontrado!',
                data: {
                    fullName: data.nome,
                    email: data.email,
                    whatsapp: data.telefone,
                    cpf: data.cpf,
                    sponsorId: data.username
                }
            };
        } catch (error: any) {
            console.error('[SyncService] Erro ao buscar dados na central:', error);
            return { success: false, message: 'Erro ao conectar plataforma central: ' + error.message };
        }
    },

    /**
     * Salva o perfil localmente usando a chave de serviço (ignora RLS)
     */
    async updateProfile(userId: string, data: any): Promise<SyncResult> {
        try {
            console.log(`[SyncService] Solicitando atualização via ADMIN para: ${userId}`, data);

            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const targetId = uuidRegex.test(userId) ? userId : 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
            const timestamp = new Date().toISOString();

            const { error } = await adminSupabase
                .from('user_profiles')
                .upsert({
                    user_id: targetId,
                    ...data,
                    updated_at: timestamp
                }, { onConflict: 'user_id' });

            if (error) {
                console.error('[SyncService] Erro ao salvar perfil completo:', error);

                if (error.message?.includes('column') || error.code === '42703') {
                    const { error: minimalError } = await adminSupabase
                        .from('user_profiles')
                        .upsert({
                            user_id: targetId,
                            nome_completo: data.nome_completo,
                            telefone: data.telefone,
                            updated_at: timestamp
                        }, { onConflict: 'user_id' });
                    if (minimalError) throw minimalError;
                    return { success: true, message: 'Perfil salvo em modo básico.' };
                }
                throw error;
            }

            return { success: true, message: 'Perfil e Endereço sincronizados com sucesso!' };
        } catch (error: any) {
            console.error('[SyncService] Erro fatal ao salvar perfil:', error);
            return { success: false, message: 'Erro ao salvar perfil: ' + (error.message || JSON.stringify(error)) };
        }
    },

    /**
    * Atualiza dados na tabela de consultores (ignora RLS)
    */
    async updateConsultor(userId: string, data: any): Promise<SyncResult> {
        try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const targetId = uuidRegex.test(userId) ? userId : 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

            const { error } = await adminSupabase
                .from('consultores')
                .update(data)
                .eq('id', targetId);

            if (error) throw error;
            return { success: true, message: 'Consultor atualizado com sucesso!' };
        } catch (error: any) {
            console.error('[SyncService] Erro ao atualizar consultor:', error);
            return { success: false, message: 'Erro ao atualizar consultor: ' + error.message };
        }
    }
};
