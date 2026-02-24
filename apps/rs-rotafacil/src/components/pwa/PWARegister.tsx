import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';

export function PWARegister() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);

            // Expor para o objeto window para uso global (conforme solicitado pelo usuário)
            (window as any).beforeinstallpromptevent = e;

            toast('Instalar Aplicativo', {
                description: 'Deseja adicionar o RS Prólipsi à sua tela de início para acesso rápido?',
                action: {
                    label: 'Instalar',
                    onClick: async () => {
                        if (e) {
                            e.prompt();
                            const { outcome } = await e.userChoice;
                            if (outcome === 'accepted') {
                                setInstallPrompt(null);
                                (window as any).beforeinstallpromptevent = null;
                                toast.success('Instalação iniciada!');
                            }
                        }
                    },
                },
                duration: 15000,
            });
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    useEffect(() => {
        if (offlineReady) {
            toast.success('App pronto para uso offline!');
            setOfflineReady(false);
        }
    }, [offlineReady, setOfflineReady]);

    useEffect(() => {
        if (needRefresh) {
            toast('Nova versão disponível!', {
                description: 'Deseja atualizar o aplicativo agora?',
                action: {
                    label: 'Atualizar',
                    onClick: () => updateServiceWorker(true),
                },
                duration: Infinity,
            });
        }
    }, [needRefresh, updateServiceWorker]);

    return null;
}
