import { useEffect } from 'react';
import { supabase } from '../services/supabase';

interface ReferralHandlerProps {
    onReferralDetected: (consultant: { name: string; id: string; slug: string }) => void;
}

export const ReferralHandler: React.FC<ReferralHandlerProps> = ({ onReferralDetected }) => {
    useEffect(() => {
        const checkReferral = async () => {
            // Suporta hash router (#/indicacao/codigo) e path normal (/indicacao/codigo)
            const path = window.location.hash.replace('#', '') || window.location.pathname;

            // Regex para capturar /indicacao/CODIGO ou /loja/CODIGO
            const match = path.match(/\/(?:indicacao|loja)\/([a-zA-Z0-9-_]+)/);

            if (match && match[1]) {
                const code = match[1];
                console.log('[ReferralHandler] Código detectado:', code);

                try {
                    // Busca consultor
                    let { data, error } = await supabase
                        .from('consultores')
                        .select('user_id, nome, username')
                        .eq('username', code)
                        .maybeSingle();

                    // Fallback para 'rsprolipsi' se não encontrar ou der erro
                    if (!data) {
                        console.warn('[ReferralHandler] Consultor não encontrado, usando padrão.');
                        const { data: defaultData } = await supabase
                            .from('consultores')
                            .select('user_id, nome, username')
                            .eq('username', 'rsprolipsi')
                            .maybeSingle();
                        data = defaultData;
                    }

                    if (data) {
                        const consultantData = {
                            name: data.nome,
                            id: data.user_id, // UUID
                            slug: data.username
                        };

                        // Persiste no LocalStorage
                        localStorage.setItem('rs-referrer', JSON.stringify(consultantData));

                        // Notifica App (para mostrar banner)
                        onReferralDetected(consultantData);

                        console.log('[ReferralHandler] Referência salva:', consultantData);
                    }
                } catch (err) {
                    console.error('[ReferralHandler] Erro ao validar indicação:', err);
                }
            } else {
                // Se não tem na URL, verifica se já tem salvo no storage
                const saved = localStorage.getItem('rs-referrer');
                if (saved) {
                    try {
                        onReferralDetected(JSON.parse(saved));
                    } catch (e) {
                        localStorage.removeItem('rs-referrer');
                    }
                }
            }
        };

        checkReferral();
    }, []);

    return null; // Componente lógico, sem renderização visual direta
};
