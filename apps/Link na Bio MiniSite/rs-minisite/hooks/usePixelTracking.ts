import { useEffect } from 'react';
import { TrackingPixels } from '../types';

export const usePixelTracking = (tracking: TrackingPixels | undefined, isPreview: boolean = false) => {
    useEffect(() => {
        // Only inject if not in preview mode and tracking is configured
        if (isPreview || !tracking) return;

        // Helper to append script
        const injectScript = (id: string, content: string, type = 'text/javascript') => {
            if (document.getElementById(id)) return; // prevent duplicate
            const script = document.createElement('script');
            script.id = id;
            script.type = type;
            script.innerHTML = content;
            document.head.appendChild(script);
        };

        // 1. Meta Pixel (Facebook)
        if (tracking.metaPixelId) {
            injectScript('meta-pixel', `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${tracking.metaPixelId}');
            fbq('track', 'PageView');
        `);
        }

        // 2. Google Analytics (GA4)
        if (tracking.googleAnalyticsId) {
            // Load the external script first
            if (!document.getElementById('ga-external')) {
                const script = document.createElement('script');
                script.id = 'ga-external';
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtag/js?id=${tracking.googleAnalyticsId}`;
                document.head.appendChild(script);
            }

            injectScript('ga-init', `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${tracking.googleAnalyticsId}');
        `);
        }

        // 3. Google Ads
        if (tracking.googleAdsId) {
            // Assuming global site tag is used (similar to GA4)
            injectScript('gads-init', `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${tracking.googleAdsId}');
        `);
        }

        // 4. TikTok Pixel
        if (tracking.tiktokPixelId) {
            injectScript('tiktok-pixel', `
            !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${tracking.tiktokPixelId}');
            ttq.page();
            }(window, document, 'ttq');
        `);
        }

        // 5. Pinterest
        if (tracking.pinterestPixelId) {
            injectScript('pinterest-pixel', `
            !function(e){if(!window.pintrk){window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
            n=window.pintrk;n.queue=[],n.version="3.0";var
            t=document.createElement("script");t.async=!0,t.src=e;var
            r=document.getElementsByTagName("script")[0];
            r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            pintrk('load', '${tracking.pinterestPixelId}');
            pintrk('page');
        `);
        }

        // 6. Taboola
        if (tracking.taboolaPixelId) {
            injectScript('taboola-pixel', `
            window._tfa = window._tfa || [];
            window._tfa.push({notify: 'event', name: 'page_view', id: ${tracking.taboolaPixelId}});
            !function (t, f, a, x) {
                   if (!document.getElementById(x)) {
                      t.async = 1;t.src = a;t.id=x;f.parentNode.insertBefore(t, f);
                   }
            }(document.createElement('script'),
            document.getElementsByTagName('script')[0],
            '//cdn.taboola.com/libtrc/unip/${tracking.taboolaPixelId}/tfa.js',
            'tb_tfa_script');
        `);
        }

    }, [tracking, isPreview]);
};
