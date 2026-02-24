
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function BrandingManager() {
    useEffect(() => {
        const loadBranding = async () => {
            try {
                const { data } = await supabase
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'branding')
                    .maybeSingle();

                if (data?.value) {
                    const branding = data.value as any;
                    localStorage.setItem('app_branding', JSON.stringify(branding));

                    const companyName = branding.company_name?.trim() || "";
                    const falconUrl = branding.falcon_url || "/logo-rotafacil.png";

                    if (companyName) {
                        document.title = `${companyName} - Sistema de Gestão`;
                    }

                    const head = document.getElementsByTagName('head')[0];
                    if (head) {
                        // Favicon
                        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
                        if (!link) {
                            link = document.createElement('link');
                            link.rel = 'icon';
                            head.appendChild(link);
                        }
                        link.href = falconUrl;

                        // Apple Icon
                        let appleIcon: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
                        if (!appleIcon) {
                            appleIcon = document.createElement('link');
                            appleIcon.rel = 'apple-touch-icon';
                            head.appendChild(appleIcon);
                        }
                        appleIcon.href = falconUrl;
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar branding global:", err);
            }
        };

        loadBranding();
    }, []);

    return null;
}
