import { TrackingPixel, CustomerConsents, TrackingPixelPlatform } from './types';

declare global {
    interface Window {
        fbq: any;
        _fbq: any;
        gtag: any;
        dataLayer: any[];
    }
}

type PixelEvent = 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'AddPaymentInfo' | 'Purchase' | 'AddShippingInfo';

interface EventPayload {
    value?: number;
    currency?: string;
    content_ids?: string[];
    transaction_id?: string;
    [key: string]: any;
}

let currentConsents: CustomerConsents = { transactional: true, marketing: false };
let initializedPlatforms: Set<TrackingPixelPlatform> = new Set();

const getPixelId = (pixel: TrackingPixel): string | undefined => {
    switch (pixel.platform) {
        case 'meta': return pixel.config.pixelId;
        case 'google_ga4': return pixel.config.measurementId;
        case 'google_ads': return pixel.config.conversionId;
        case 'tiktok': return pixel.config.pixelId;
        default: return undefined;
    }
};

const injectMetaScript = (pixelId: string) => {
    if (window.fbq) {
        window.fbq('init', pixelId);
        return;
    }
    /* eslint-disable */
    (function(f:any,b:any,e:any,v:any,n?:any,t?:any,s?:any){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js'));
    /* eslint-enable */
    window.fbq('init', pixelId);
};

const injectGoogleScript = (measurementId: string) => {
    const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`);
    if (existingScript) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) { window.dataLayer.push(args); }
    window.gtag = window.gtag || gtag;
    
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
};

export const marketingTrackingService = {
    configure(pixels: TrackingPixel[]) {
        pixels.forEach(pixel => {
            const id = getPixelId(pixel);
            if (!id) return;

            if (pixel.platform === 'meta') {
                injectMetaScript(id);
                initializedPlatforms.add('meta');
            } else if (pixel.platform === 'google_ga4' || pixel.platform === 'google_ads') {
                injectGoogleScript(id);
                initializedPlatforms.add('google_ga4');
            }
        });
    },

    updateConsents(consents: CustomerConsents) {
        currentConsents = consents;
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'ad_storage': consents.marketing ? 'granted' : 'denied',
                'analytics_storage': consents.marketing ? 'granted' : 'denied'
            });
        }
    },

    track(event: PixelEvent, payload: EventPayload = {}) {
        if (!currentConsents.marketing) {
            console.warn(`[Tracking Blocked] Event '${event}' blocked due to lack of marketing consent.`);
            return;
        }

        console.log(`[Tracking] Firing '${event}'`, payload);

        // Meta (Facebook)
        if (initializedPlatforms.has('meta')) {
            try {
                window.fbq('track', event, payload);
            } catch (e) { console.error("Meta Pixel Error:", e); }
        }

        // Google (GA4)
        if (window.gtag) {
            try {
                const gaPayload = {
                    value: payload.value,
                    currency: payload.currency || 'BRL',
                    items: payload.content_ids?.map(id => ({ item_id: id })),
                    transaction_id: payload.transaction_id
                };
                
                const eventMap: Record<string, string> = {
                    'ViewContent': 'view_item',
                    'AddToCart': 'add_to_cart',
                    'InitiateCheckout': 'begin_checkout',
                    'AddPaymentInfo': 'add_payment_info',
                    'Purchase': 'purchase',
                    'AddShippingInfo': 'add_shipping_info'
                };

                const gaEvent = eventMap[event];
                if (gaEvent) window.gtag('event', gaEvent, gaPayload);
            } catch (e) { console.error("Google Tag Error:", e); }
        }
    }
};