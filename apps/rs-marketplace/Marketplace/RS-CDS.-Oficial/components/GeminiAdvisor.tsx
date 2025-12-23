
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, Send, Bot, ShoppingCart, TrendingUp, Calendar, User, Mic, ArrowRight, Package, StopCircle, Info, BarChart2 } from 'lucide-react';
import { generateCDAnalysis } from '../services/geminiService';
import { CDProfile, Order, Product } from '../types';

interface GeminiAdvisorProps {
  profile: CDProfile;
  orders: Order[];
  products: Product[];
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isAudio?: boolean;
}

const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ profile, orders, products }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: `Olá, ${profile.managerName}. \nSou a **RS-IA**, sua assistente logística. \n\nPosso analisar seu estoque, sugerir reposições ou prever demandas. Como posso ajudar hoje?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // KPIs rápidos
  const lowStockCount = products.filter(p => p.stockLevel <= p.minStock).length;
  const expiringCount = products.filter(p => p.batches?.some(b => new Date(b.expirationDate) < new Date('2025-12-31'))).length;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- AUDIO HANDLERS ---
  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(',')[1];
                await handleSendMessage(undefined, base64Audio, 'audio/webm');
            };
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Erro ao acessar microfone:", err);
        alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  // --- MESSAGE HANDLER ---
  const handleSendMessage = async (customText?: string, audioBase64?: string, mimeType?: string) => {
    const textToSend = customText || input;
    
    if (!textToSend.trim() && !audioBase64) return;

    // Add User Message UI
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: audioBase64 ? "🎤 (Mensagem de Áudio Enviada)" : textToSend,
      timestamp: new Date(),
      isAudio: !!audioBase64
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Call API
    try {
        const responseText = await generateCDAnalysis(
            profile, 
            orders, 
            products, 
            { text: audioBase64 ? undefined : textToSend, audio: audioBase64, mimeType }
        );
        
        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            text: responseText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
        const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            text: "Desculpe, tive um problema de conexão. Tente novamente.",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setLoading(false);
    }
  };

  const SuggestionCard = ({ title, count, icon, colorClass, query, subtext }: any) => (
    <div 
        onClick={() => handleSendMessage(query)}
        className="bg-dark-900 p-4 rounded-xl border border-dark-800 hover:border-gold-500/50 hover:bg-dark-800 transition-all cursor-pointer group"
    >
        <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
                {icon}
            </div>
            {count > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {count}
                </span>
            )}
        </div>
        <h4 className="text-white font-bold text-sm mb-1 group-hover:text-gold-400 transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 mb-3">{subtext}</p>
        <div className="flex items-center text-xs text-gold-500 font-bold gap-1">
            Analisar agora <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/>
        </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 animate-fade-in">
      
      {/* LEFT COLUMN: CHAT AREA */}
      <div className="flex-1 bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-4 max-w-[90%] lg:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-dark-800 text-gray-400' : 'bg-gradient-to-br from-gold-600 to-gold-400 text-black font-bold'}`}>
                            {msg.role === 'user' ? <User size={20} /> : <Bot size={24} />}
                        </div>
                        
                        {/* Bubble */}
                        <div className={`p-5 rounded-2xl text-base leading-relaxed shadow-md ${
                            msg.role === 'user' 
                            ? 'bg-dark-800 text-white rounded-tr-none' 
                            : 'bg-dark-950 border border-dark-800 text-gray-300 rounded-tl-none'
                        }`}>
                            {msg.isAudio && msg.role === 'user' && (
                                <div className="flex items-center gap-2 mb-2 text-gold-400 font-bold text-sm">
                                    <Mic size={16} /> Áudio enviado para análise
                                </div>
                            )}
                            <div className="prose prose-invert prose-p:leading-relaxed max-w-none whitespace-pre-wrap">
                                {msg.text}
                            </div>
                            <span className="text-[10px] text-gray-600 mt-2 block opacity-70 text-right">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            
            {loading && (
                 <div className="flex justify-start animate-fade-in">
                    <div className="flex gap-4 max-w-[85%]">
                        <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center shrink-0 border border-dark-700">
                             <Loader2 size={20} className="animate-spin text-gold-400" />
                        </div>
                        <div className="bg-dark-950 border border-dark-800 px-6 py-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-gray-400">
                            <span className="text-sm">Analisando dados...</span>
                            <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Cleaner Input Area */}
        <div className="p-4 md:p-6 bg-dark-950/80 backdrop-blur border-t border-dark-800">
             <div className="relative flex items-center gap-3">
                <input 
                    type="text" 
                    placeholder={isRecording ? "Gravando áudio..." : "Digite sua mensagem..."}
                    className={`flex-1 bg-dark-900 border ${isRecording ? 'border-red-500/50' : 'border-dark-700'} text-white rounded-xl pl-5 pr-14 py-4 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all shadow-inner text-base`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={loading || isRecording}
                    autoFocus
                />
                
                {/* Voice Input Button */}
                <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={loading}
                    className={`absolute right-16 p-2 transition-all duration-300 rounded-full ${
                        isRecording 
                        ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                        : 'text-gray-500 hover:text-gold-400 hover:bg-dark-800'
                    }`}
                    title={isRecording ? "Parar Gravação" : "Gravar Áudio"}
                >
                    {isRecording ? <StopCircle size={22} /> : <Mic size={22} />}
                </button>

                <button 
                    onClick={() => handleSendMessage()}
                    disabled={loading || (!input.trim() && !isRecording)}
                    className="p-3 bg-gold-500 text-black rounded-xl hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gold-500/20"
                >
                    <Send size={20} />
                </button>
             </div>
             {isRecording && <p className="text-xs text-red-500 text-center mt-2 font-bold animate-pulse">Gravando... Fale agora.</p>}
        </div>
      </div>

      {/* RIGHT COLUMN: SUGGESTIONS & WIDGETS */}
      <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          
          {/* AI Info Card */}
          <div className="bg-gradient-to-br from-dark-800 to-dark-900 p-4 rounded-xl border border-dark-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-gold-400" />
                  <h3 className="text-white font-bold text-sm">Capacidades RS-IA</h3>
              </div>
              <ul className="text-xs text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                      <span className="text-gold-500">•</span>
                      <span>Analisa estoque e sugere compras baseadas no consumo real.</span>
                  </li>
                  <li className="flex items-start gap-2">
                      <span className="text-gold-500">•</span>
                      <span>Monitora lotes e validades para evitar perdas (FEFO).</span>
                  </li>
                  <li className="flex items-start gap-2">
                      <span className="text-gold-500">•</span>
                      <span>Ouve e responde mensagens de áudio sobre a operação.</span>
                  </li>
              </ul>
          </div>

          <div className="mb-2 mt-2">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                  <TrendingUp size={16} className="text-gold-400" />
                  Ações Rápidas
              </h3>
          </div>

          <SuggestionCard 
             title="Reposição Crítica"
             subtext="Itens abaixo do estoque mínimo."
             count={lowStockCount}
             icon={<ShoppingCart size={20} className="text-blue-400"/>}
             colorClass="text-blue-400"
             query="Quais produtos estão com estoque crítico (abaixo do mínimo) e o que você sugere comprar?"
          />

          <SuggestionCard 
             title="Lotes & Validade"
             subtext="Produtos próximos do vencimento."
             count={expiringCount}
             icon={<Calendar size={20} className="text-red-400"/>}
             colorClass="text-red-400"
             query="Liste os lotes que vencem até o final do ano e sugira uma promoção para liquidá-los."
          />

           <SuggestionCard 
             title="Simular Cenário"
             subtext="Projeção de vendas para o mês."
             count={0}
             icon={<BarChart2 size={20} className="text-purple-400"/>}
             colorClass="text-purple-400"
             query="Com base no histórico recente de pedidos, faça uma projeção de vendas para o próximo mês e me diga quanto preciso investir em estoque."
          />

          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4 mt-auto">
             <div className="flex items-center gap-3 mb-2">
                 <Package size={20} className="text-gray-500"/>
                 <h4 className="text-gray-300 font-bold text-sm">Resumo Rápido</h4>
             </div>
             <ul className="text-xs text-gray-500 space-y-2">
                 <li className="flex justify-between"><span>Itens Cadastrados:</span> <span className="text-gray-300">{products.length}</span></li>
                 <li className="flex justify-between"><span>Pedidos Hoje:</span> <span className="text-gray-300">{orders.filter(o => o.date === new Date().toISOString().split('T')[0]).length}</span></li>
                 <li className="flex justify-between"><span>Status IA:</span> <span className="text-green-500">Online</span></li>
             </ul>
          </div>
      </div>

    </div>
  );
};

export default GeminiAdvisor;
