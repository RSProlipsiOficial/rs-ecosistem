import { Product, CartItem, Order } from '../types';

declare global {
    interface Window {
        dataLayer: any[];
        fbq?: any;
    }
}

/**
 * Utilitário central para todos os eventos de rastreamento (GTM, Meta, GA4).
 * Segue o padrão de e-commerce aprimorado do Google Analytics 4.
 */

const pushDataLayer = (event: string, data: any) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({ event, ...data });
    }
    // Fallback conversão console em dev
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Tracking] ${event}`, data);
    }
};

export const track = {
    // 1. Visualização de Produto (ViewItem)
    viewItem: (product: Product) => {
        pushDataLayer('view_item', {
            ecommerce: {
                currency: 'BRL',
                value: product.price,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    price: product.price,
                    item_brand: product.brand || product.seller,
                    item_category: product.type
                }]
            }
        });

        // Meta Pixel
        if (window.fbq) {
            window.fbq('track', 'ViewContent', {
                content_ids: [product.id],
                content_name: product.name,
                currency: 'BRL',
                value: product.price,
                content_type: 'product'
            });
        }
    },

    // 2. Adicionar ao Carrinho (AddToCart)
    addToCart: (product: Product, quantity: number, variant?: string) => {
        pushDataLayer('add_to_cart', {
            ecommerce: {
                currency: 'BRL',
                value: product.price * quantity,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    price: product.price,
                    quantity: quantity,
                    item_variant: variant,
                    item_brand: product.brand || product.seller
                }]
            }
        });

        if (window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_ids: [product.id],
                content_name: product.name,
                currency: 'BRL',
                value: product.price * quantity,
                content_type: 'product'
            });
        }
    },

    // 3. Iniciar Checkout (InitiateCheckout)
    initiateCheckout: (cartItems: CartItem[], total: number) => {
        pushDataLayer('begin_checkout', {
            ecommerce: {
                currency: 'BRL',
                value: total,
                items: cartItems.map(item => ({
                    item_id: item.productId,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }))
            }
        });

        if (window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
                content_ids: cartItems.map(i => i.productId),
                currency: 'BRL',
                value: total,
                num_items: cartItems.length
            });
        }
    },

    // 4. Compra (Purchase)
    purchase: (order: Order) => {
        pushDataLayer('purchase', {
            ecommerce: {
                transaction_id: order.id,
                value: order.total,
                tax: 0,
                shipping: order.shippingCost,
                currency: 'BRL',
                items: order.items.map(item => ({
                    item_id: item.productId,
                    item_name: item.productName,
                    price: item.price,
                    quantity: item.quantity
                }))
            }
        });

        if (window.fbq) {
            window.fbq('track', 'Purchase', {
                currency: 'BRL',
                value: order.total,
                content_ids: order.items.map(i => i.productId),
                content_type: 'product'
            });
        }
    }
};
