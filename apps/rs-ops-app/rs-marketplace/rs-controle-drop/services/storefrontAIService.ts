import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { Product, Order, Customer } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- CONTEXT INTERFACE ---
export interface StorefrontAIContext {
    products: Product[];
    orders: Order[];
    customers: Customer[];
    browsingHistory: Product[]; // Products the user has looked at
}

// --- TOOLS for the Storefront AI ---

const storefrontTools: FunctionDeclaration[] = [
    {
        name: 'getProductInfo',
        description: 'Obtém informações detalhadas sobre um ou mais produtos, como descrição, preço e categoria.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                productName: { type: Type.STRING, description: 'O nome do produto sobre o qual o cliente está perguntando.' },
            },
            required: ['productName'],
        },
    },
    {
        name: 'getOrderStatus',
        description: 'Verifica o status de um pedido do cliente.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                orderId: { type: Type.STRING, description: 'O número do pedido fornecido pelo cliente.' },
                customerEmail: { type: Type.STRING, description: 'O e-mail do cliente para verificação.' },
            },
            required: ['orderId', 'customerEmail'],
        },
    },
    {
        name: 'suggestProducts',
        description: 'Sugere produtos para o cliente com base em seu interesse ou histórico de navegação.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING, description: 'A categoria de produtos para sugerir.' },
                basedOnProductId: { type: Type.STRING, description: 'ID de um produto que o cliente demonstrou interesse.' },
            },
        },
    },
];


// --- SERVICE IMPLEMENTATION ---

export const storefrontAIService = {
    async getResponse(history: { role: string, parts: { text: string }[] }[], context: StorefrontAIContext) {
        const systemInstruction = `
            Você é um Vendedor Virtual especialista da loja RS Drop. Sua personalidade é amigável, prestativa e focada em ajudar o cliente a tomar a melhor decisão de compra.
            Seu objetivo é responder dúvidas, ajudar com pedidos e sugerir produtos para aumentar as vendas, sem ser insistente.
            
            DIRETRIZES:
            - Responda em Português (PT-BR).
            - Seja conciso e claro.
            - Se o cliente perguntar sobre um produto sem especificar o nome, use o contexto do produto que ele está vendo (último item do histórico de navegação).
            - Para verificar um pedido, SEMPRE peça o número do pedido e o e-mail para segurança.
            - Se for sugerir produtos, use a ferramenta 'suggestProducts' e apresente-os de forma atraente.
            - Se não souber a resposta, peça para o cliente contatar o suporte humano.
        `;

        const model = "gemini-2.5-flash";

        const response = await ai.models.generateContent({
            model,
            contents: history,
            config: {
                systemInstruction,
                tools: [{ functionDeclarations: storefrontTools }],
            }
        });

        const functionCalls = response.functionCalls;
        
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0]; // Handle one call for simplicity
            const { name, args } = call;
            
            let toolResult: any;

            if (name === 'getProductInfo') {
                const productName = (args as any).productName?.toLowerCase();
                let product: Product | undefined;
                if (productName) {
                    product = context.products.find(p => p.name.toLowerCase().includes(productName));
                } else if (context.browsingHistory.length > 0) {
                    // Fallback to the last viewed product
                    product = context.browsingHistory[context.browsingHistory.length - 1];
                }
                
                if (product) {
                    // FIX: Changed `price` property to `salePrice` for consistency with the Product type.
                    toolResult = { name: product.name, salePrice: product.salePrice, category: product.category, stock: product.currentStock };
                } else {
                    toolResult = { error: 'Produto não encontrado.' };
                }
            } else if (name === 'getOrderStatus') {
                const { orderId, customerEmail } = args as any;
                const order = context.orders.find(o => o.id.slice(0, 8) === orderId.slice(0, 8)); // Match partial ID
                const customer = context.customers.find(c => c.id === order?.customerId);

                if (order && customer && customer.email?.toLowerCase() === customerEmail.toLowerCase()) {
                    toolResult = { status: order.status, trackingCode: order.trackingCode, estimatedDelivery: order.estimatedDeliveryDate };
                } else {
                    toolResult = { error: 'Pedido não encontrado ou e-mail não corresponde. Verifique os dados.' };
                }
            } else if (name === 'suggestProducts') {
                // Simplified suggestion logic
                const refProduct = context.products.find(p => p.id === (args as any).basedOnProductId);
                const category = (args as any).category || refProduct?.category;
                
                if(category) {
                    toolResult = context.products
                        .filter(p => p.category === category && p.id !== refProduct?.id)
                        .slice(0, 3)
                        // FIX: Changed `price` property to `salePrice` for consistency with the Product type.
                        .map(p => ({ id: p.id, name: p.name, salePrice: p.salePrice }));
                } else {
                    // FIX: Changed `price` property to `salePrice` for consistency with the Product type.
                    toolResult = context.products.slice(0, 3).map(p => ({ id: p.id, name: p.name, salePrice: p.salePrice }));
                }
            }
            
            // Send result back to AI
            const secondResponse = await ai.models.generateContent({
                model,
                contents: [ ...history, { role: 'model', parts: [{ functionCall: call }] }, { role: 'tool', parts: [{ functionResponse: { name, response: toolResult } }] }],
                 config: {
                    systemInstruction
                 }
            });

            return { text: secondResponse.text, data: toolResult, tool: name };
        }

        return { text: response.text, data: null, tool: null };
    }
};