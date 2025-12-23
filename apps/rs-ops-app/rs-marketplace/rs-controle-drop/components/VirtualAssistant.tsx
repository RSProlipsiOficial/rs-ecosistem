import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, ShoppingBag } from 'lucide-react';
import { storefrontAIService, StorefrontAIContext } from '../services/storefrontAIService';
import { Product } from '../types';

interface VirtualAssistantProps {
    context: StorefrontAIContext;
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    data?: any;
    tool?: string | null;
}

export const VirtualAssistant: React.FC<VirtualAssistantProps> = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Olá! 👋 Sou seu assistente de compras. Como posso ajudar?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const history = [...messages, userMessage].map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const response = await storefrontAIService.getResponse(history, context);
            
            const modelMessage: ChatMessage = { role: 'model', text: response.text || "Não entendi, pode repetir?", data: response.data, tool: response.tool };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Virtual Assistant Error:", error);
            const errorMessage: ChatMessage = { role: 'model', text: 'Desculpe, estou com problemas técnicos. Tente novamente.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-rs-gold rounded-full text-rs-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
                aria-label="Abrir assistente virtual"
            >
                {isOpen ? <X size={32} /> : <Bot size={32} />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[60vh] bg-rs-card border border-rs-gold/50 rounded-xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
                    <header className="p-4 border-b border-white/10 flex items-center gap-3">
                        <Bot size={20} className="text-rs-gold"/>
                        <h3 className="font-bold text-slate-100">Vendedor Virtual</h3>
                    </header>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-rs-gold/20 text-slate-200 rounded-br-none' : 'bg-white/5 text-slate-300 rounded-bl-none'}`}>
                                    {msg.text}
                                    {msg.tool === 'suggestProducts' && Array.isArray(msg.data) && (
                                        <div className="mt-2 space-y-2">
                                            {msg.data.map((p: Product) => (
                                                <div key={p.id} className="flex gap-2 items-center bg-black/20 p-2 rounded">
                                                    <div className="w-10 h-10 bg-rs-dark rounded flex items-center justify-center"><ShoppingBag size={16}/></div>
                                                    <div>
                                                        <div className="text-xs font-bold">{p.name}</div>
                                                        {/* FIX: Changed `p.price` to `p.salePrice` to match the `Product` type. */}
                                                        <div className="text-xs text-rs-gold">R$ {p.salePrice.toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                         {isLoading && <div className="text-center text-xs text-slate-500">Digitando...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Pergunte sobre um produto..."
                                className="w-full bg-black/40 border border-white/10 rounded-full py-2 pl-4 pr-12 text-sm text-slate-200 focus:border-rs-gold outline-none"
                            />
                            <button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-rs-gold text-rs-black rounded-full disabled:opacity-50">
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <style>{`.animate-fade-in-up { animation: fadeInUp 0.3s ease-out; } @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }}`}</style>
        </>
    );
};