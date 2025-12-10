import React, { useState, useRef, useEffect } from 'react';
import { RobotIcon, PaperAirplaneIcon, CloseIcon } from './icons';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

interface FloatingChatProps {
    credits: number;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ credits }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const userName = "Roberto Camargo";

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    sender: 'bot',
                    text: `Olá, ${userName}! Que bom ter você por aqui. Sou a RSIA, sua coach virtual, pronta para te dar total assistência.`,
                },
            ]);
        }
    }, [isOpen, messages.length, userName]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim() === '') return;

        const newMessages: Message[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');

        // Mock bot response for demonstration
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'bot', text: 'Estou processando sua solicitação... Essa é uma resposta simulada.' }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {/* Chat Window */}
            <div className={`absolute bottom-[88px] right-0 w-[360px] h-[520px] bg-[#1E1E1E]/90 backdrop-blur-sm border border-[#2A2A2A] rounded-2xl shadow-2xl flex flex-col origin-bottom-right transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <header className="flex items-center justify-between p-4 border-b border-[#2A2A2A] flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-[#E5E7EB]">RSIA - Sua Coach Virtual</h3>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-green-400">Online</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold text-[#FFD700]">{credits}</span>
                        <p className="text-xs text-[#9CA3AF]">Créditos</p>
                    </div>
                </header>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'bot' && (
                                <div className="w-8 h-8 flex-shrink-0 bg-[#2A2A2A] rounded-full flex items-center justify-center border border-gray-600">
                                    <RobotIcon className="w-5 h-5 text-[#FFD700]" />
                                </div>
                            )}
                            <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow ${msg.sender === 'bot' ? 'bg-[#2A2A2A] text-[#E5E7EB] rounded-tl-none' : 'bg-[#FFD700] text-black rounded-br-none'}`}>
                                <p className="text-sm leading-snug">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 border-t border-[#2A2A2A]">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e as any);
                                }
                            }}
                            placeholder="Converse com sua coach..."
                            className="flex-1 bg-[#2A2A2A] border border-[#2A2A2A] text-[#E5E7EB] rounded-lg p-2.5 resize-none focus:ring-[#FFD700] focus:border-[#FFD700] transition-all min-h-[40px] max-h-[120px]"
                        />
                        <button type="submit" className="w-10 h-10 flex-shrink-0 bg-[#FFD700] text-black rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors">
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                </footer>
            </div>

            {/* FAB / Close Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center text-black shadow-lg shadow-[#FFD700]/30 hover:bg-yellow-600 transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none relative"
                aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
            >
                <RobotIcon className={`w-8 h-8 transition-all duration-300 ${isOpen ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                <CloseIcon className={`w-8 h-8 absolute transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`} />
            </button>
        </div>
    );
};

export default FloatingChat;