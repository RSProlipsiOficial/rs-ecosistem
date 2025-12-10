
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useLanguage } from '../context/LanguageContext';
import { useProductContext } from '../context/ProductContext';
import { usePageBuilder } from '../context/PageBuilderContext';
import { useNavigation } from '../context/NavigationContext';
import { useAISettings } from '../context/AISettingsContext';

type Message = {
  role: 'user' | 'model';
  text: string;
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { settings: aiSettings } = useAISettings();
  const { t, language } = useLanguage();
  const { products } = useProductContext();
  const { pages } = usePageBuilder();
  const { setPage } = useNavigation();

  const systemInstruction = useMemo(() => {
    const productInfo = products.map(p => `- ${p.translations[language]?.name || p.translations.pt.name}: ${p.translations[language]?.description || p.translations.pt.description.replace(/<[^>]+>/g, '')}`).join('\n');
    const pageInfo = pages.map(p => `- ${p.title} (available at /${p.slug})`).join('\n');
    
    return `${aiSettings.chatbotSystemPrompt}\n\n**Our Products:**\n${productInfo}\n\n**Available Pages:**\n${pageInfo}`;
  }, [products, pages, language, aiSettings.chatbotSystemPrompt]);

  useEffect(() => {
    if (isOpen) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
            setMessages([{ role: 'model', text: t('chatbot_greeting').replace('{chatbotName}', aiSettings.chatbotName) }]);
        } catch (error) {
            console.error("Failed to initialize Gemini Chat:", error);
            setMessages([{ role: 'model', text: 'Sorry, I am unable to connect right now.' }]);
        }
    } else {
        chatRef.current = null;
        setMessages([]);
    }
  }, [isOpen, systemInstruction, t, aiSettings.chatbotName]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        if (!chatRef.current) throw new Error("Chat not initialized");
        const response = await chatRef.current.sendMessage({ message: input });
        const modelMessage: Message = { role: 'model', text: response.text };
        setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error("Gemini API error:", error);
        const errorMessage: Message = { role: 'model', text: "I'm sorry, I encountered an error. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const parseAction = (text: string) => {
      const match = text.match(/\[ACTION:(GO_TO_PAGE|OPEN_LINK):([^\]]+)\]/);
      if (!match) return null;
      return { type: match[1], payload: match[2] };
  };

  const performAction = (action: { type: string; payload: string }) => {
    if (action.type === 'GO_TO_PAGE') {
      setPage(action.payload);
      setIsOpen(false);
    } else if (action.type === 'OPEN_LINK') {
      window.open(action.payload, '_blank');
    }
  };
  
  const ChatbotIcon = () => {
    if (aiSettings.chatbotIcon === 'robot2') return <RobotIcon2 />;
    return <RobotIcon1 />;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-accent text-button-text w-16 h-16 rounded-full shadow-lg z-50 flex items-center justify-center hover:opacity-90 transition-all transform hover:scale-110"
        aria-label="Open Chat"
      >
        {isOpen ? <CloseIcon /> : <ChatbotIcon />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 w-full max-w-sm h-full max-h-[600px] bg-background border border-border rounded-lg shadow-2xl z-50 flex flex-col animate-fade-in-up">
          <header className="p-4 border-b border-border text-center">
            <h3 className="font-bold text-accent">{aiSettings.chatbotName}</h3>
          </header>
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-accent text-button-text' : 'bg-surface'}`}>
                  {msg.text.split(/(\[ACTION:[^\]]+\])/).map((part, i) => {
                      const action = parseAction(part);
                      if (action) {
                          return <button key={i} onClick={() => performAction(action)} className="mt-2 w-full text-left bg-button-bg text-button-text font-bold py-2 px-4 rounded-md hover:opacity-80">Take Action</button>;
                      }
                      return <p key={i} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: part.replace(/\[ACTION:[^\]]+\]/, '') }} />;
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="max-w-xs rounded-lg px-4 py-2 bg-surface flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse [animation-delay:0.4s]"></div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <footer className="p-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('chatbot_placeholder')}
                className="flex-grow bg-gray-800 border border-gray-600 rounded-full py-2 px-4 text-text-primary focus:ring-accent focus:border-accent"
              />
              <button onClick={handleSend} disabled={isLoading} className="bg-accent text-button-text rounded-full p-3 disabled:opacity-50"><SendIcon/></button>
            </div>
          </footer>
        </div>
      )}
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

const RobotIcon1 = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.12a2.25 2.25 0 002.15 2.88h12.1c.966 0 1.799-.633 2.15-1.587l2.412-7.743A2.25 2.25 0 0017.088 3.75H15M4.5 3.75V2.25A2.25 2.25 0 016.75 0h10.5A2.25 2.25 0 0119.5 2.25v1.5M4.5 16.5v.75a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25v-.75M9 12.75h6" /></svg>;
const RobotIcon2 = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;


export default Chatbot;