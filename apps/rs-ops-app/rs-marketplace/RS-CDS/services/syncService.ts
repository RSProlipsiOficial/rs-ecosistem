/**
 * SERVIÇO DE SINCRONIZAÇÃO - RS-CDS (MASTER SYNC)
 * Agora delegando a lógica para o Backend RS-API para segurança.
 */

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

interface SyncResult {
    success: boolean;
    message: string;
    data?: any;
}

export const syncService = {
    /**
     * Sincroniza o perfil do CD baseado no proprietário vinculado (userId).
     * Chama o endpoint centralizado na RS-API.
     */
    async syncCDProfile(userId: string, options?: { email?: string; document?: string }): Promise<SyncResult> {
        try {
            console.log(`[SyncService RS-CDS] Solicitando Master Sync via API para: ${userId}`);

            const res = await fetch(`${apiBaseUrl}/v1/cds/${userId}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: options?.email,
                    document: options?.document
                })
            });

            const json = await res.json();
            return {
                success: json.success,
                message: json.success ? 'Sincronização concluída com sucesso via API!' : (json.error || 'Erro na sincronização'),
                data: json.data
            };

        } catch (error: any) {
            console.error('[SyncService RS-CDS] Erro ao sincronizar via API:', error);
            return { success: false, message: 'Erro de conexão com o servidor de sincronização.' };
        }
    }
};
