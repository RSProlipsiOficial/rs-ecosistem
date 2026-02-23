import { createClient } from '@supabase/supabase-js';
import { supabase as localSupabase } from './supabaseClient';

const CENTRAL_SUPABASE_URL = 'https://rptkhrboejbwexseikuo.supabase.co';
const CENTRAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const centralSupabase = createClient(CENTRAL_SUPABASE_URL, CENTRAL_SUPABASE_ANON_KEY);
const adminSupabase = createClient(CENTRAL_SUPABASE_URL, SERVICE_ROLE_KEY);

export const syncService = {
    async syncProfile(userId: string) {
        try {
            console.log(`[SyncService] Sincronizando: ${userId}`);

            // 1. Buscar na central em consultores
            const { data: centralData, error: centralError } = await centralSupabase
                .from('consultores')
                .select('*')
                .or(`id.eq.${userId},user_id.eq.${userId}`)
                .maybeSingle();

            if (centralError || !centralData) {
                throw new Error('Consultor não encontrado na base central.');
            }

            // 2. Buscar no minisite_profiles (Fonte Real de Dados)
            const { data: mProfile } = await centralSupabase
                .from('minisite_profiles')
                .select('*')
                .eq('id', centralData.id)
                .maybeSingle();

            const finalData = {
                nome: mProfile?.name || centralData.nome,
                whatsapp: mProfile?.phone || centralData.whatsapp || centralData.telefone,
                cpf: mProfile?.cpf || centralData.cpf,
                cep: mProfile?.address_zip || centralData.cep,
                endereco: mProfile?.address_street || centralData.endereco,
                numero: mProfile?.address_number || centralData.numero,
                bairro: mProfile?.address_neighborhood || centralData.bairro,
                cidade: mProfile?.address_city || centralData.cidade,
                estado: mProfile?.address_state || centralData.estado,
                avatar_url: mProfile?.avatar_url || centralData.avatar_url,
                username: centralData.username
            };

            // 3. Atualizar localmente (admin)
            const { error: upd1 } = await adminSupabase
                .from('consultores')
                .update({
                    nome: finalData.nome,
                    whatsapp: finalData.whatsapp,
                    cep: finalData.cep,
                    endereco: finalData.endereco,
                    numero: finalData.numero,
                    bairro: finalData.bairro,
                    cidade: finalData.cidade,
                    estado: finalData.estado,
                    avatar_url: finalData.avatar_url
                })
                .eq('id', userId);

            const { error: upd2 } = await adminSupabase
                .from('user_profiles')
                .upsert({
                    user_id: userId,
                    nome_completo: finalData.nome,
                    telefone: finalData.whatsapp,
                    endereco_cep: finalData.cep,
                    endereco_rua: finalData.endereco,
                    endereco_numero: finalData.numero,
                    endereco_bairro: finalData.bairro,
                    endereco_cidade: finalData.cidade,
                    endereco_estado: finalData.estado,
                    avatar_url: finalData.avatar_url,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (upd1 || upd2) console.error('Erros no update:', { upd1, upd2 });

            // 4. [RS-SYNC-UNIFIED] PERSISTIR em minisite_profiles (vinculação permanente entre painéis)
            const minisitePayload = {
                name: finalData.nome,
                phone: finalData.whatsapp,
                cpf: finalData.cpf,
                avatar_url: finalData.avatar_url,
                address_zip: finalData.cep,
                address_street: finalData.endereco,
                address_number: finalData.numero,
                address_neighborhood: finalData.bairro,
                address_city: finalData.cidade,
                address_state: finalData.estado,
                consultant_id: finalData.username || userId,
                updated_at: new Date().toISOString()
            };

            const { error: minisiteError } = await adminSupabase
                .from('minisite_profiles')
                .upsert(minisitePayload, { onConflict: 'consultant_id' });

            if (minisiteError) {
                console.warn('[SyncService Consultor] Upsert minisite_profiles falhou (não-bloqueante):', minisiteError.message);
                // Fallback: tenta update por id
                if (centralData.id) {
                    await adminSupabase.from('minisite_profiles').update(minisitePayload).eq('id', centralData.id);
                }
            } else {
                console.log('[SyncService Consultor] ✅ minisite_profiles sincronizado!');
            }

            return { success: true, data: finalData };
        } catch (error: any) {
            console.error('[SyncService] Erro:', error);
            return { success: false, message: error.message };
        }
    }
};
