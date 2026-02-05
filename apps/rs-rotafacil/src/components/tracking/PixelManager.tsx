import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PixelConfig {
    facebook_pixel_id: string;
    facebook_pixel_enabled: boolean;
    facebook_conversions_api_token: string;
    facebook_test_event_code?: string;
    google_analytics_id: string;
    google_analytics_enabled: boolean;
    google_ads_id: string;
    google_ads_enabled: boolean;
    tiktok_pixel_id: string;
    tiktok_pixel_enabled: boolean;
    custom_head_scripts: string;
    custom_body_scripts: string;
    track_page_views: boolean;
    track_signups: boolean;
    track_purchases: boolean;
    track_button_clicks: boolean;
    auto_injection_enabled?: boolean;
}

declare global {
    interface Window {
        fbq: any;
        _fbq: any;
        gtag: any;
        dataLayer: any[];
        ttq: any;
    }
}

// Componente que injeta e gerencia todos os pixels de rastreamento
export function PixelManager() {
    const [config, setConfig] = useState<PixelConfig | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    useEffect(() => {
        if (config) {
            initializePixels();
        }
    }, [config]);

    const loadConfig = async () => {
        try {
            const { data } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'pixels_config')
                .single();

            if (data?.value) {
                // Remove Sensitive Data (CAPI Token) from client-side config
                const fullConfig = data.value as any;
                const { facebook_conversions_api_token, ...publicConfig } = fullConfig;
                setConfig(publicConfig as PixelConfig);
            }
        } catch (error) {
            console.log('Pixels não configurados');
        }
    };

    const initializePixels = () => {
        if (!config) return;

        // Se a auto-injeção estiver desabilitada, não faz nada
        if (config.auto_injection_enabled === false) {
            console.log('🚫 Auto-injeção de pixels desativada');
            return;
        }

        // Facebook Pixel
        if (config.facebook_pixel_enabled && config.facebook_pixel_id) {
            initFacebookPixel(config.facebook_pixel_id);
        }

        // Google Analytics 4
        if (config.google_analytics_enabled && config.google_analytics_id) {
            initGoogleAnalytics(config.google_analytics_id);
        }

        // Google Ads
        if (config.google_ads_enabled && config.google_ads_id) {
            initGoogleAds(config.google_ads_id);
        }

        // TikTok Pixel
        if (config.tiktok_pixel_enabled && config.tiktok_pixel_id) {
            initTikTokPixel(config.tiktok_pixel_id);
        }

        // Scripts personalizados
        if (config.custom_head_scripts) {
            injectCustomScript(config.custom_head_scripts, 'head');
        }
        if (config.custom_body_scripts) {
            injectCustomScript(config.custom_body_scripts, 'body');
        }
    };

    const initFacebookPixel = (pixelId: string) => {
        // Evita reinicialização
        if (window.fbq) return;

        // Facebook Pixel Base Code
        (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
            if (f.fbq) return;
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        window.fbq('init', pixelId);

        // PageView automático
        if (config?.track_page_views) {
            trackPageView(); // Use the exportable function which now handles CAPI too
        }

        console.log('✅ Facebook Pixel inicializado:', pixelId);
    };

    const initGoogleAnalytics = (measurementId: string) => {
        // Evita reinicialização
        if (window.gtag) return;

        // Google Analytics Script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
            window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', measurementId);

        console.log('✅ Google Analytics inicializado:', measurementId);
    };

    const initGoogleAds = (conversionId: string) => {
        // Usa o mesmo gtag do Analytics
        if (!window.gtag) {
            initGoogleAnalytics(conversionId);
        }
        window.gtag('config', conversionId);
        console.log('✅ Google Ads inicializado:', conversionId);
    };

    const initTikTokPixel = (pixelId: string) => {
        // Evita reinicialização
        if (window.ttq) return;

        // TikTok Pixel Base Code
        (function (w: any, d: any, t: any) {
            w.TiktokAnalyticsObject = t;
            w[t] = w[t] || [];
            w[t].methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
            w[t].setAndDefer = function (t: any, e: any) {
                t[e] = function () {
                    t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                };
            };
            for (var i = 0; i < w[t].methods.length; i++) w[t].setAndDefer(w[t], w[t].methods[i]);
            w[t].instance = function (t: any) {
                var e = w[t]._i[t] || [];
                for (var n = 0; n < w[t].methods.length; n++) w[t].setAndDefer(e, w[t].methods[n]);
                return e;
            };
            w[t].load = function (e: any, n: any) {
                var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
                w[t]._i = w[t]._i || {};
                w[t]._i[e] = [];
                w[t]._i[e]._u = i;
                w[t]._t = w[t]._t || {};
                w[t]._t[e] = +new Date;
                w[t]._o = w[t]._o || {};
                w[t]._o[e] = n || {};
                var o = document.createElement("script");
                o.type = "text/javascript";
                o.async = true;
                o.src = i + "?sdkid=" + e + "&lib=" + t;
                var a = document.getElementsByTagName("script")[0];
                a.parentNode?.insertBefore(o, a);
            };
            w[t].load(pixelId);
            w[t].page();
        })(window, document, 'ttq');

        console.log('✅ TikTok Pixel inicializado:', pixelId);
    };

    const injectCustomScript = (script: string, location: 'head' | 'body') => {
        const container = document.createElement('div');
        container.innerHTML = script;
        const target = location === 'head' ? document.head : document.body;

        // Processa scripts e outros elementos
        Array.from(container.childNodes).forEach(node => {
            if (node.nodeName === 'SCRIPT') {
                const newScript = document.createElement('script');
                const oldScript = node as HTMLScriptElement;
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                target.appendChild(newScript);
            } else {
                target.appendChild(node.cloneNode(true));
            }
        });
    };

    return null; // Componente invisível
}

// ========== HELPERS INTERNOS ==========

// Geração de ID Único para Eventos (Deduplicação)
const generateEventId = () => {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Envia evento para API de Conversões (Server-Side)
const sendToCapi = async (eventName: string, eventId: string, userData?: any, customData?: any) => {
    try {
        // Sanitiza userData para remover campos null/undefined que causam 400 no Meta
        const sanitizedUserData = userData ? Object.fromEntries(
            Object.entries(userData).filter(([_, v]) => v != null && v !== '')
        ) : {};

        await supabase.functions.invoke('meta-capi', {
            body: {
                event_name: eventName,
                event_id: eventId,
                user_data: Object.keys(sanitizedUserData).length > 0 ? sanitizedUserData : undefined,
                custom_data: customData,
                url: window.location.href,
            }
        });

    } catch (e) {
        console.error('Erro ao enviar CAPI:', e);
    }
};

// ========== FUNÇÕES DE TRACKING EXPORTADAS ==========

// Rastreia cadastro/lead
export const trackSignup = (userData?: { email?: string; name?: string; phone?: string; first_name?: string; last_name?: string }) => {
    const eventId = generateEventId();

    // Facebook
    if (window.fbq) {
        window.fbq('track', 'Lead', userData, { eventID: eventId });
        window.fbq('track', 'CompleteRegistration', userData, { eventID: eventId });
    }

    // Google Analytics
    if (window.gtag) {
        window.gtag('event', 'sign_up', {
            method: 'email',
            ...userData
        });
    }

    // TikTok
    if (window.ttq) {
        window.ttq.track('CompleteRegistration', userData, { event_id: eventId });
    }

    // CAPI
    sendToCapi('CompleteRegistration', eventId, userData);

    console.log('📊 Evento: Cadastro rastreado', { eventId, userData });
};

// Rastreia compra/purchase com detalhes de pagamento
export const trackPurchase = (purchaseData: {
    value: number;
    currency?: string;
    payment_method?: 'pix' | 'cartao' | 'boleto' | string;
    plan_name?: string;
    transaction_id?: string;
    user_email?: string;
    user_phone?: string;
    first_name?: string;
    last_name?: string;
}) => {
    const { value, currency = 'BRL', payment_method, plan_name, transaction_id, ...userData } = purchaseData;
    const eventId = transaction_id || generateEventId(); // Use transaction_id as event_id if available for better deduplication

    // Facebook
    if (window.fbq) {
        window.fbq('track', 'Purchase', {
            value: value,
            currency: currency,
            content_name: plan_name,
            content_type: 'subscription',
            content_ids: [transaction_id],
            payment_method: payment_method, // PIX ou CARTÃO
            num_items: 1
        }, { eventID: eventId });

        // Evento adicional para método de pagamento
        window.fbq('trackCustom', 'PaymentMethod', {
            payment_method: payment_method,
            value: value
        }, { eventID: eventId });
    }

    // Google Analytics
    if (window.gtag) {
        window.gtag('event', 'purchase', {
            transaction_id: transaction_id,
            value: value,
            currency: currency,
            items: [{
                item_name: plan_name,
                price: value,
                quantity: 1
            }],
            payment_type: payment_method
        });
    }

    // TikTok
    if (window.ttq) {
        window.ttq.track('CompletePayment', {
            value: value,
            currency: currency,
            content_name: plan_name,
            content_type: 'product'
        }, { event_id: eventId });
    }

    // CAPI
    sendToCapi('Purchase', eventId, userData, {
        value,
        currency,
        content_name: plan_name,
        payment_method
    });

    console.log('💰 Evento: Compra rastreada', {
        eventId,
        valor: `R$ ${value}`,
        metodo: payment_method,
        plano: plan_name
    });
};

// Rastreia início de checkout
export const trackInitiateCheckout = (checkoutData: {
    value?: number;
    plan_name?: string;
    user_data?: any;
}) => {
    const eventId = generateEventId();

    // Facebook
    if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', checkoutData, { eventID: eventId });
    }

    // Google
    if (window.gtag) {
        window.gtag('event', 'begin_checkout', {
            value: checkoutData.value,
            items: [{ item_name: checkoutData.plan_name }]
        });
    }

    // TikTok
    if (window.ttq) {
        window.ttq.track('InitiateCheckout', checkoutData, { event_id: eventId });
    }

    // CAPI
    sendToCapi('InitiateCheckout', eventId, checkoutData.user_data, {
        value: checkoutData.value,
        content_name: checkoutData.plan_name
    });

    console.log('🛒 Evento: Checkout iniciado', { eventId, checkoutData });
};

// Rastreia visualização de página (para SPAs)
export const trackPageView = (pagePath?: string) => {
    const eventId = generateEventId();

    // Facebook
    if (window.fbq) {
        window.fbq('track', 'PageView', {}, { eventID: eventId });
    }

    // Google
    if (window.gtag) {
        window.gtag('event', 'page_view', {
            page_path: pagePath || window.location.pathname
        });
    }

    // TikTok
    if (window.ttq) {
        window.ttq.page();
    }

    // CAPI (Sending PageView to CAPI is heavy, but useful for full tracking)
    // We send minimal data for PageView
    sendToCapi('PageView', eventId);
};

// Rastreia clique em botão importante
export const trackButtonClick = (buttonName: string, extraData?: Record<string, any>) => {
    const eventId = generateEventId();

    // Facebook
    if (window.fbq) {
        window.fbq('trackCustom', 'ButtonClick', {
            button_name: buttonName,
            ...extraData
        }, { eventID: eventId });
    }

    // Google
    if (window.gtag) {
        window.gtag('event', 'click', {
            event_category: 'button',
            event_label: buttonName,
            ...extraData
        });
    }

    // CAPI (Maybe skip CAPI for button clicks unless critical?)
    // sendToCapi('ButtonClick', eventId, undefined, { button_name: buttonName, ...extraData });

    console.log('🖱️ Evento: Clique rastreado', { eventId, buttonName });
};

// Rastreia adição de forma de pagamento
export const trackAddPaymentInfo = (paymentData: {
    payment_type: 'pix' | 'cartao' | 'boleto' | string;
    value?: number;
    user_data?: any;
}) => {
    const eventId = generateEventId();

    // Facebook
    if (window.fbq) {
        window.fbq('track', 'AddPaymentInfo', paymentData, { eventID: eventId });
    }

    // Google
    if (window.gtag) {
        window.gtag('event', 'add_payment_info', paymentData);
    }

    // TikTok
    if (window.ttq) {
        window.ttq.track('AddPaymentInfo', paymentData, { event_id: eventId });
    }

    // CAPI
    sendToCapi('AddPaymentInfo', eventId, paymentData.user_data, paymentData);

    console.log('💳 Evento: Info de pagamento adicionada', { eventId, paymentData });
};

