import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

/**
 * [RS-SYNC] Sincronia Mestre do Ecossistema RS Prólipsi
 * Busca dados reais do Supabase Central e sincroniza com o perfil local do Marketplace.
 */
export const syncProfile = async (): Promise<UserProfile | null> => {
    try {
        console.log('[RS-SYNC] Iniciando sincronia mestre...');

        // 1. Obter usuário autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.warn('[RS-SYNC] Nenhum usuário autenticado encontrado.');
            return null;
        }

        // 2. Buscar perfil no user_profiles (Fonte da Verdade)
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('[RS-SYNC] Erro ao buscar user_profiles:', profileError);
            return null;
        }

        // 3. Buscar dados de consultor para merge (opcional, mas recomendado)
        const { data: consultor } = await supabase
            .from('consultores')
            .select('id_consultor, graduacao, status_conta')
            .eq('id_auth', user.id)
            .single();

        // 4. Mapear para o formato UserProfile da interface
        const mappedProfile: UserProfile = {
            id: user.id || '',
            name: profile?.full_name || user.user_metadata?.full_name || 'Usuário RS',
            graduation: consultor?.graduacao || profile?.graduation || 'CONSULTOR',
            accountStatus: consultor?.status_conta || 'Ativo',
            monthlyActivity: 'Ativo',
            category: profile?.role || 'CLIENTE',
            referralLink: profile?.referral_code || '',
            affiliateLink: `https://marketplace.rsprolipsi.com.br/?ref=${profile?.id?.split('-')[0]}`,
            avatarUrl: profile?.avatar_url || '',
            email: user.email || '',
            cpfCnpj: profile?.document_id || '',
            phone: profile?.phone_number || '',
            idNumerico: profile?.sequential_id || 1000,
        };

        console.log('[RS-SYNC] Sincronia concluída com sucesso para:', mappedProfile.name);
        return mappedProfile;

    } catch (error) {
        console.error('[RS-SYNC] Erro crítico na sincronia:', error);
        return null;
    }
};
