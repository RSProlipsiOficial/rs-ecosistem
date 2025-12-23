
import { TrackingPixelPlatform } from '../types';

export const PIXEL_PLATFORMS: { id: TrackingPixelPlatform; name: string; fields: { key: string; label: string }[] }[] = [
    { id: 'meta', name: 'Meta (Facebook)', fields: [{ key: 'pixelId', label: 'Pixel ID' }] },
    { id: 'google_ga4', name: 'Google GA4', fields: [{ key: 'measurementId', label: 'Measurement ID (G-XXXX)' }] },
    { id: 'google_ads', name: 'Google Ads', fields: [{ key: 'conversionId', label: 'Conversion ID (AW-XXXX)' }] },
    { id: 'tiktok', name: 'TikTok', fields: [{ key: 'pixelId', label: 'Pixel ID' }] },
    { id: 'taboola', name: 'Taboola', fields: [{ key: 'accountId', label: 'Account ID' }] },
    { id: 'pinterest', name: 'Pinterest', fields: [{ key: 'tagId', label: 'Tag ID' }] },
    { id: 'linkedin', name: 'LinkedIn', fields: [{ key: 'partnerId', label: 'Partner ID' }] },
];

export const PIXEL_TEMPLATES: { [key in TrackingPixelPlatform]: { base: string; events: { [key: string]: string } } } = {
    meta: {
        base: `
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '{pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id={pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`,
        events: {
            Purchase: `fbq('track', 'Purchase', {value: {VALUE}, currency: '{CURRENCY}'});`,
            InitiateCheckout: `fbq('track', 'InitiateCheckout', {value: {VALUE}, currency: '{CURRENCY}'});`,
            AddToCart: `fbq('track', 'AddToCart', {value: {VALUE}, currency: '{CURRENCY}'});`,
            ViewContent: `fbq('track', 'ViewContent', {value: {VALUE}, currency: '{CURRENCY}'});`,
            Lead: `fbq('track', 'Lead');`,
            CompleteRegistration: `fbq('track', 'CompleteRegistration');`,
            Contact: `fbq('track', 'Contact');`,
            Search: `fbq('track', 'Search');`
        }
    },
    google_ga4: {
        base: `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id={measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '{measurementId}');
</script>`,
        events: {
            purchase: `gtag('event', 'purchase', {'value': {VALUE}, 'currency': '{CURRENCY}'});`,
            begin_checkout: `gtag('event', 'begin_checkout', {'value': {VALUE}, 'currency': '{CURRENCY}'});`,
            add_to_cart: `gtag('event', 'add_to_cart', {'value': {VALUE}, 'currency': '{CURRENCY}'});`,
            view_item: `gtag('event', 'view_item', {'value': {VALUE}, 'currency': '{CURRENCY}'});`,
            generate_lead: `gtag('event', 'generate_lead');`,
            sign_up: `gtag('event', 'sign_up');`,
            search: `gtag('event', 'search');`
        }
    },
    google_ads: {
        base: `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id={conversionId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '{conversionId}');
</script>`,
        events: {
            conversion_purchase: `gtag('event', 'conversion', {'send_to': '{conversionId}/{CONVERSION_LABEL}', 'value': {VALUE}, 'currency': '{CURRENCY}'});`,
            begin_checkout: `gtag('event', 'begin_checkout', {'send_to': '{conversionId}/{CONVERSION_LABEL}', 'value': {VALUE}, 'currency': '{CURRENCY}'});`,
            add_to_cart: `gtag('event', 'add_to_cart', {'send_to': '{conversionId}/{CONVERSION_LABEL}', 'value': {VALUE}, 'currency': '{CURRENCY}'});`,
            submit_lead_form: `gtag('event', 'submit_lead_form', {'send_to': '{conversionId}/{CONVERSION_LABEL}'});`,
            view_item: `gtag('event', 'view_item', {'send_to': '{conversionId}/{CONVERSION_LABEL}'});`,
            contact: `gtag('event', 'contact', {'send_to': '{conversionId}/{CONVERSION_LABEL}'});`,
            sign_up: `gtag('event', 'sign_up', {'send_to': '{conversionId}/{CONVERSION_LABEL}'});`
        }
    },
    tiktok: {
        base: `
<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  
  ttq.load('{pixelId}');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel Code -->`,
        events: {
            CompletePayment: `ttq.track('CompletePayment', {value: {VALUE}, currency: '{CURRENCY}'});`,
            InitiateCheckout: `ttq.track('InitiateCheckout', {value: {VALUE}, currency: '{CURRENCY}'});`,
            AddToCart: `ttq.track('AddToCart', {value: {VALUE}, currency: '{CURRENCY}'});`,
            ViewContent: `ttq.track('ViewContent', {value: {VALUE}, currency: '{CURRENCY}'});`,
            Search: `ttq.track('Search');`,
            Contact: `ttq.track('Contact');`,
            SubmitForm: `ttq.track('SubmitForm');`,
            Download: `ttq.track('Download');`
        }
    },
    taboola: {
        base: `
<!-- Taboola Pixel Code -->
<script type='text/javascript'>
  window._tfa = window._tfa || [];
  window._tfa.push({notify: 'event', name: 'page_view', id: {accountId}});
  !function (t, f, a, x) {
         if (!document.getElementById(x)) {
            t.async = 1;t.src = a;t.id=x;f.parentNode.insertBefore(t, f);
         }
  }(document.createElement('script'),
  document.getElementsByTagName('script')[0],
  '//cdn.taboola.com/libtrc/{accountId}/tfa.js',
  'tb_tfa_script');
</script>
<!-- End Taboola Pixel Code -->`,
        events: {
            purchase: `window._tfa.push({notify: 'event', name: 'purchase', id: {accountId}, revenue: '{VALUE}', currency: '{CURRENCY}'});`,
            start_checkout: `window._tfa.push({notify: 'event', name: 'start_checkout', id: {accountId}});`,
            add_to_cart: `window._tfa.push({notify: 'event', name: 'add_to_cart', id: {accountId}});`,
            lead: `window._tfa.push({notify: 'event', name: 'lead', id: {accountId}});`,
            search: `window._tfa.push({notify: 'event', name: 'search', id: {accountId}});`
        }
    },
    pinterest: {
        base: `
<!-- Pinterest Tag -->
<script>
!function(e){if(!window.pintrk){window.pintrk = function () {
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
  n=window.pintrk;n.queue=[],n.version="3.0";var
  t=document.createElement("script");t.async=!0,t.src=e;var
  r=document.getElementsByTagName("script")[0];
  r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', '{tagId}');
pintrk('page');
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt=""
  src="https://ct.pinterest.com/v3/?event=init&tid={tagId}&noscript=1" />
</noscript>
<!-- End Pinterest Tag -->`,
        events: {
            checkout: `pintrk('track', 'checkout', {value: {VALUE}, currency: '{CURRENCY}'});`,
            add_to_cart: `pintrk('track', 'add_to_cart', {value: {VALUE}, currency: '{CURRENCY}'});`,
            page_visit: `pintrk('track', 'page_visit');`,
            signup: `pintrk('track', 'signup');`,
            lead: `pintrk('track', 'lead');`,
            search: `pintrk('track', 'search');`
        }
    },
    linkedin: {
        base: `
<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
_linkedin_partner_id = "{partnerId}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script><script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid={partnerId}&fmt=gif" />
</noscript>
<!-- End LinkedIn Insight Tag -->`,
        events: {
            conversion: `lintrk('track', { conversion_id: {CONVERSION_ID} });`,
            signup: `lintrk('track', { conversion_id: {CONVERSION_ID} }); /* Use specific ID for Signup */`,
            lead: `lintrk('track', { conversion_id: {CONVERSION_ID} }); /* Use specific ID for Lead */`,
            view_content: `lintrk('track', { conversion_id: {CONVERSION_ID} }); /* Use specific ID for ViewContent */`
        }
    }
};
