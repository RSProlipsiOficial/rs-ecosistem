
export interface OpenRouterMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface OpenRouterResponse {
    choices: {
        message: OpenRouterMessage;
    }[];
}

export async function callOpenRouter(messages: OpenRouterMessage[], model: string = 'google/gemini-2.0-flash-exp:free'): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('Chave da API do OpenRouter não encontrada no ambiente (VITE_OPENROUTER_API_KEY).');
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://robo.rsprolipsi.com.br', // Site URL
                'X-Title': 'RS Robo Kagi Binance', // Site Name
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Erro do OpenRouter: ${response.status}`);
        }

        const data: OpenRouterResponse = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Erro na chamada do OpenRouter:', error);
        throw error;
    }
}
