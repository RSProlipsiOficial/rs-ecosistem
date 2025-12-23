/**
 * Mock Pixel Service
 * In a real application, this would integrate with Facebook Pixel, Google Analytics, etc.
 * This simulation allows us to build the tracking logic into the app structure.
 */

type PixelEvent = 
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase';

interface PixelData {
  value?: number;
  currency?: string;
  content_name?: string;
  [key: string]: any;
}

const track = (eventName: PixelEvent, data?: PixelData) => {
  console.log(
    `%c[PIXEL TRACKING]%c ${eventName}`,
    'background-color: #C8A74E; color: black; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    'font-weight: bold;',
    data || ''
  );

  // Example of how a real implementation would look:
  // if (typeof window.fbq === 'function') {
  //   window.fbq('track', eventName, data);
  // }
  // if (typeof window.gtag === 'function') {
  //   window.gtag('event', eventName, data);
  // }
};

export const pixel = {
  track,
};
