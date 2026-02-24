
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import { Platform, AIStatus, CampaignStatus } from './types';
import { MOCK_KPIS, MOCK_CAMPAIGNS, MOCK_OPTIMIZATIONS } from './constants';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activePlatform, setActivePlatform] = useState<Platform>(Platform.GOOGLE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [isMetaConnected, setIsMetaConnected] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // States para Alertas e Chat
  const [alertSubTab, setAlertSubTab] = useState<'report' | 'balance'>('report');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Configurações de exibição (Seu Projeto)
  const [projectName, setProjectName] = useState('Projeto Rs Prólipsi');
  const [projectEmail, setProjectEmail] = useState('robertorjbc@gmail.com');
  const [projectPhone, setProjectPhone] = useState('(41) 99286-3922');
  const [projectWebsite, setProjectWebsite] = useState('https://Rsprolipsi.com.br');
  const [projectSegment, setProjectSegment] = useState('Automotivo');
  const [projectObjective, setProjectObjective] = useState('Vendas Online');

  // Notificações
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [notifBalance, setNotifBalance] = useState(true);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    if (!isGoogleConnected) {
      setActiveTab('google');
    } else if (!isMetaConnected) {
      setActiveTab('meta');
    }
  };

  const handleSaveSettings = () => {
    setShowSaveFeedback(true);
    setTimeout(() => setShowSaveFeedback(false), 3000);
  };

  const handleCreateCampaign = () => {
    setShowCreateCampaignModal(true);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isThinking) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Você é o RS CHAT da plataforma RS-ADS. Especialista sênior em Google e Meta Ads. Ajude o usuário a configurar campanhas e entender métricas.`
        }
      });
      const aiResponse = response.text || "Erro no processamento.";
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Erro de conexão com o cérebro RS-AI." }]);
    } finally {
      setIsThinking(false);
    }
  };

  // --- RENDERS ---

  const renderConnectionPrompt = (platform: Platform) => {
    const isMeta = platform === Platform.META;
    const title = isMeta ? 'Meta Ads' : 'Google Ads';
    const accentColor = isMeta ? '#1877F2' : '#7c83fd';
    const icon = isMeta ? 'fa-facebook' : 'fa-google';

    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 animate-in fade-in duration-500">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <div className="space-y-4">
            <i className={`fab ${icon} text-6xl`} style={{ color: accentColor }}></i>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Conecte sua Conta {title}</h2>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              A integração com {title} já está disponível! Conecte sua conta para começar a gerenciar suas campanhas do {isMeta ? 'Facebook e Instagram' : 'Google Search e Display'}.
            </p>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-lg p-8 text-left space-y-6 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-white border-b border-white/5 pb-4">O que você pode fazer:</h3>
            <ul className="space-y-4">
              {[
                'Visualizar métricas de todas as campanhas',
                `Acompanhar performance do ${isMeta ? 'Facebook e Instagram' : 'Google Ads'}`,
                'Receber otimizações automáticas',
                'Gerar relatórios detalhados',
                'Gerenciar múltiplas contas em um só lugar'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-[#1877F2]/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-check text-[10px]" style={{ color: accentColor }}></i>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => isMeta ? setIsMetaConnected(true) : setIsGoogleConnected(true)}
            className="w-full py-6 flex items-center justify-center gap-4 rounded-lg font-black uppercase text-sm tracking-[0.2em] transition-all active:scale-95 shadow-2xl"
            style={{ backgroundColor: accentColor, color: 'white' }}
          >
            <i className={`fab ${icon} text-xl`}></i> {isMeta ? 'Conectar Meta Ads' : 'Entrar com Google'}
          </button>
        </div>
      </div>
    );
  };

  const renderEmptyState = (title: string, subtitle: string, icon: string) => (
    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-3xl mb-6 border border-white/5">
        <i className={`fas ${icon}`}></i>
      </div>
      <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2">{title}</h4>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest max-w-xs leading-relaxed">{subtitle}</p>
    </div>
  );

  const renderSubscriptions = () => (
    <div className="max-w-6xl mx-auto py-10 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-[#D4AF37] uppercase tracking-tighter mb-4">Planos e Assinaturas</h2>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Selecione o Kit de aceleração para seu projeto</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { kit: 'Básico', price: '50', features: ['1 Conta de Ads', 'Relatórios Diários', 'IA de Sugestão', 'Suporte via Ticket'] },
          { kit: 'Profissional', price: '100', features: ['Contas Ilimitadas', 'IA Autônoma Ativa', 'Ajuste de Lance 24/7', 'Suporte WhatsApp VIP', 'Análise Competitiva'], popular: true },
          { kit: 'Agência', price: 'Consulte', features: ['White Label', 'API de Integração', 'Dashboard Multi-Cliente', 'Gerente de Conta', 'Treinamento IA'] }
        ].map((p, idx) => (
          <div key={idx} className={`bg-[#121212] border ${p.popular ? 'border-2 border-[#D4AF37]' : 'border-white/5'} rounded-lg p-10 flex flex-col space-y-8 relative hover:border-[#D4AF37]/50 transition-all shadow-xl`}>
            {p.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Mais Vendido</div>}
            <div className="space-y-2">
              <h3 className="text-gray-400 font-black uppercase text-xs tracking-widest">Kit RS</h3>
              <p className="text-3xl font-black text-white uppercase tracking-tighter">{p.kit}</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#D4AF37]">{p.price === 'Consulte' ? p.price : `R$ ${p.price}`}</span>
              {p.price !== 'Consulte' && <span className="text-gray-500 font-bold uppercase text-[10px]">/mês</span>}
            </div>
            <ul className="space-y-4 flex-1">
              {p.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <i className="fas fa-check text-[#D4AF37] text-xs"></i> {feature}
                </li>
              ))}
            </ul>
            <button className={`w-full py-4 ${p.popular ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white'} rounded-lg font-black uppercase text-[10px] tracking-widest transition-all shadow-lg`}>Selecionar Plano</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjectDetails = () => (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      {showSaveFeedback && (
        <div className="fixed top-28 right-10 bg-[#D4AF37] text-black px-8 py-4 rounded-lg shadow-2xl z-[100] animate-in slide-in-from-right duration-300 flex items-center gap-3">
          <i className="fas fa-check-circle text-lg"></i>
          <span className="font-black uppercase text-xs tracking-widest">Configurações Atualizadas</span>
        </div>
      )}

      <div className="bg-[#121212] border border-white/5 rounded-lg p-10 space-y-10 shadow-sm">
        <div className="flex items-center gap-4 text-[#7c83fd]">
          <i className="fas fa-sliders text-lg"></i>
          <h3 className="text-lg font-black uppercase tracking-widest">Configuração do Ecossistema</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Nome do Projeto', val: projectName, set: setProjectName, type: 'text' },
            { label: 'Email de Auditoria', val: projectEmail, set: setProjectEmail, type: 'email' },
            { label: 'Contato WhatsApp', val: projectPhone, set: setProjectPhone, type: 'text' }
          ].map((field, i) => (
            <div key={i} className="space-y-3 relative p-6 bg-black/20 border border-white/5 rounded-lg">
              <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">{field.label}</label>
              <input
                type={field.type}
                value={field.val}
                onChange={(e) => field.set(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-6 py-4 text-sm text-white focus:border-[#D4AF37] outline-none transition-all font-medium"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#121212] border border-white/5 rounded-lg p-10 space-y-10 shadow-sm">
        <div className="flex items-center gap-4 text-gray-500">
          <i className="fas fa-globe text-lg"></i>
          <h3 className="text-lg font-black uppercase tracking-widest">Propriedade Digital</h3>
        </div>
        <div className="space-y-3 p-6 bg-black/20 border border-white/5 rounded-lg text-white">
          <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">Domínio Conectado</label>
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg overflow-hidden focus-within:border-[#D4AF37] transition-all">
            <span className="px-6 py-4 bg-white/5 text-gray-500 text-xs font-black uppercase tracking-widest border-r border-white/10">https://</span>
            <input type="text" value={projectWebsite.replace('https://', '')} onChange={(e) => setProjectWebsite('https://' + e.target.value)} className="w-full px-6 py-4 bg-transparent text-sm text-white outline-none font-medium" placeholder="seu-site.com.br" />
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-10">
        <button onClick={handleSaveSettings} className="bg-[#D4AF37] hover:bg-[#F1C75B] text-black px-24 py-6 rounded-lg font-black uppercase text-sm tracking-[0.3em] shadow-2xl shadow-[#D4AF37]/20 transition-all active:scale-95 flex items-center gap-4">
          <i className="fas fa-save text-xl"></i> Salvar Diretrizes
        </button>
      </div>
    </div>
  );

  const renderDashboard = (platform: Platform) => {
    const campaigns = MOCK_CAMPAIGNS.filter(c => c.platform === platform);
    const optimizations = MOCK_OPTIMIZATIONS.filter(o => o.platform === platform);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {!((platform === Platform.GOOGLE && isGoogleConnected) || (platform === Platform.META && isMetaConnected)) ? (
          renderConnectionPrompt(platform)
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {MOCK_KPIS.map((kpi, idx) => (
                <StatCard key={idx} {...kpi} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-[#121212] border border-white/5 rounded-lg overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Gerenciador de Campanhas {platform.toUpperCase()}</h3>
                  <button onClick={handleCreateCampaign} className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest hover:underline">+ Nova Campanha</button>
                </div>
                {campaigns.length === 0 ? (
                  renderEmptyState("Nenhuma campanha ativa", `Sincronize sua conta ${platform} ou crie um novo comando de tráfego.`, "fa-rectangle-ad")
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-black/20 text-[8px] font-black uppercase text-gray-600 tracking-widest">
                          <th className="px-6 py-4">Nome</th>
                          <th className="px-6 py-4">ROAS</th>
                          <th className="px-6 py-4">Spend</th>
                          <th className="px-6 py-4 text-center">Saúde IA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {campaigns.map((campaign) => (
                          <tr key={campaign.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-[11px] font-bold text-white uppercase tracking-tight">{campaign.name}</p>
                              <p className="text-[8px] text-gray-600 font-bold uppercase">{campaign.objective}</p>
                            </td>
                            <td className="px-6 py-4 font-black text-[11px] text-white">{campaign.currentROAS}x</td>
                            <td className="px-6 py-4 font-bold text-[11px] text-gray-500">R$ {campaign.spend.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#D4AF37]" style={{ width: `${campaign.healthScore}%` }}></div>
                                </div>
                                <span className="text-[8px] font-black text-[#D4AF37]">{campaign.healthScore}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="lg:col-span-4 bg-[#121212] border border-white/5 rounded-lg overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01]">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Histórico RS-AI</h3>
                </div>
                {optimizations.length === 0 ? (
                  renderEmptyState("Sem ações executadas", "RS-AI está monitorando anomalias no ecossistema de tráfego.", "fa-robot")
                ) : (
                  <div className="p-4 space-y-3">
                    {optimizations.slice(0, 5).map((opt) => (
                      <div key={opt.id} className="p-4 bg-black/40 border border-white/5 rounded-lg space-y-2 group transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] ${opt.actionType === 'budget_increase' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                              <i className={`fas ${opt.actionType === 'budget_increase' ? 'fa-arrow-up' : 'fa-pause'}`}></i>
                            </div>
                            <p className="text-[10px] font-bold text-white uppercase">{opt.campaignName.substring(0, 15)}...</p>
                          </div>
                          <span className="text-[7px] font-black text-gray-600 uppercase">{opt.executedAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderChat = () => (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-14rem)]">
      <div className="bg-[#121212] border border-white/10 rounded-lg flex-1 flex flex-col overflow-hidden shadow-2xl">
        <div className="px-8 py-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Núcleo Tático RS-CHAT</span>
          </div>
          <button className="text-gray-500 hover:text-white transition-colors"><i className="fas fa-ellipsis-v"></i></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-10">
              <i className="fas fa-brain text-5xl text-[#D4AF37] mb-6"></i>
              <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">Comando de IA Online</h3>
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Diga algo como: "Como está o ROAS do Google Ads?" ou "Sugira 3 variações de headlines para E-commerce".</p>
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-5 rounded-lg text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#D4AF37] text-black font-black shadow-lg shadow-[#D4AF37]/10' : 'bg-white/5 border border-white/5 text-gray-300'}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isThinking && (
            <div className="flex items-center gap-3 text-[10px] text-[#D4AF37] font-black uppercase tracking-widest animate-pulse">
              <i className="fas fa-microchip animate-spin"></i> RS-AI PROCESSANDO ESTRATÉGIA...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-6 bg-black/40 border-t border-white/5">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Digite sua diretriz estratégica aqui..."
              className="flex-1 bg-black/60 border border-white/5 rounded-lg px-8 py-5 text-sm outline-none focus:border-[#D4AF37] text-white transition-all"
            />
            <button type="submit" disabled={isThinking} className="w-16 h-16 bg-[#D4AF37] rounded-lg text-black flex items-center justify-center hover:bg-[#F1C75B] transition-all shadow-xl shadow-[#D4AF37]/20 active:scale-95 disabled:opacity-50">
              <i className="fas fa-paper-plane text-xl"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="min-h-screen w-full flex bg-[#0B0B0B] relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full"></div>

      <div className="hidden lg:flex flex-col justify-center w-1/2 p-24 space-y-12 z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-[#D4AF37] rounded-[24px] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.3)]">
              <i className="fas fa-microchip text-black text-4xl"></i>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase">RS-ADS</h1>
          </div>
          <h2 className="text-5xl font-black text-white leading-tight uppercase tracking-tighter">
            Tráfego Pago <br /><span className="text-[#D4AF37]">100% Autônomo.</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-lg leading-relaxed">
            Reduza custos operacionais e maximize o ROI com decisões em tempo real alimentadas pelo motor RS-AI.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-md space-y-12 bg-[#121212] p-16 rounded-lg border border-white/5 shadow-2xl relative">
          <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></div>
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Acessar</h2>
            <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Centro de Comando RS-ADS</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Identificação</label>
              <input type="email" defaultValue="robertorjbc@gmail.com" className="w-full bg-[#0B0B0B] border border-white/5 rounded-lg px-8 py-6 text-sm font-medium focus:border-[#D4AF37] outline-none text-white transition-all shadow-inner" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Senha de Comando</label>
              <input type="password" defaultValue="••••••••" className="w-full bg-[#0B0B0B] border border-white/5 rounded-lg px-8 py-6 text-sm font-medium focus:border-[#D4AF37] outline-none text-white transition-all shadow-inner" />
            </div>
            <button type="submit" className="w-full py-6 bg-[#D4AF37] text-black rounded-lg font-black uppercase text-sm tracking-[0.3em] hover:bg-[#F1C75B] transition-all shadow-2xl shadow-[#D4AF37]/10 active:scale-95">INICIAR SESSÃO</button>
          </form>

          <div className="flex flex-col items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-700">
            <button className="hover:text-[#D4AF37] transition-colors">Esqueceu as credenciais?</button>
            <div className="w-12 h-px bg-white/5"></div>
            <button className="hover:text-[#D4AF37] transition-colors">Solicitar Acesso VIP</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) return renderLogin();

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setShowProfileMenu(false);
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-[#0B0B0B]' : 'bg-[#F9FAFB]'} ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300 font-sans`}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDarkMode={isDarkMode}
        onCreateCampaign={handleCreateCampaign}
      />

      <main className="flex-1 ml-72 p-0 relative">
        <header className={`${isDarkMode ? 'bg-[#0B0B0B]' : 'bg-white'} border-b ${isDarkMode ? 'border-white/5' : 'border-gray-200'} h-24 flex items-center justify-between px-12 sticky top-0 z-40`}>
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-black uppercase tracking-tighter">{projectName}</h2>
          </div>

          <div className="flex items-center gap-8">
            <div className={`${isDarkMode ? 'bg-[#121212]' : 'bg-gray-100'} px-6 py-3 rounded-lg border ${isDarkMode ? 'border-white/5' : 'border-gray-200'} flex items-center gap-4 shadow-sm`}>
              <i className="fas fa-coins text-[#D4AF37] text-sm"></i>
              <span className="text-xs font-black uppercase tracking-widest">0,00 Cr</span>
            </div>

            <button className="text-gray-500 hover:text-[#D4AF37] transition-all p-2 relative">
              <i className="fas fa-bell text-xl"></i>
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B0B0B]"></div>
            </button>

            <button onClick={() => setActiveTab('subscriptions')} className="px-10 py-3.5 bg-[#D4AF37] text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#F1C75B] transition-all shadow-xl shadow-[#D4AF37]/10 active:scale-95">
              Iniciar Teste grátis
            </button>

            <div className="flex items-center gap-6 pl-8 border-l border-white/10 relative">
              <div className="text-right">
                <p className="text-[13px] font-black uppercase text-white tracking-tight">Roberto Camargo</p>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">robertorjbc@gmail.com</p>
              </div>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-14 h-14 bg-[#D4AF37] rounded-lg flex items-center justify-center relative group transition-transform active:scale-95 shadow-xl shadow-[#D4AF37]/10"
              >
                <i className="fas fa-user text-black text-2xl"></i>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#22c55e] border-[3px] border-[#0B0B0B] rounded-full"></div>
              </button>

              {showProfileMenu && (
                <div className="absolute top-18 right-0 w-64 bg-[#121212] border border-white/10 rounded-lg shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] p-5 z-50 animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="space-y-1">
                    <button onClick={() => { setActiveTab('details'); setShowProfileMenu(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-lg hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-white transition-all">
                      <i className="fas fa-cog text-gray-500"></i> CONFIGURAÇÕES
                    </button>
                    <button onClick={() => { setActiveTab('subscriptions'); setShowProfileMenu(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-lg hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-white transition-all">
                      <i className="fas fa-credit-card text-gray-500"></i> ASSINATURA
                    </button>
                    <button onClick={toggleTheme} className="w-full flex items-center gap-4 px-5 py-4 rounded-lg hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-white transition-all">
                      <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-gray-500`}></i> {isDarkMode ? 'MODO CLARO' : 'MODO ESCURO'}
                    </button>
                    <div className="h-px bg-white/5 my-3"></div>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-4 px-5 py-4 rounded-lg hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all">
                      <i className="fas fa-sign-out-alt"></i> SAIR
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-12 max-w-[1500px] mx-auto">
          {activeTab === 'chat' && renderChat()}
          {activeTab === 'google' && renderDashboard(Platform.GOOGLE)}
          {activeTab === 'meta' && renderDashboard(Platform.META)}
          {activeTab === 'details' && renderProjectDetails()}
          {activeTab === 'subscriptions' && renderSubscriptions()}

          {['connections', 'optimizations', 'alerts'].includes(activeTab) && (
            renderEmptyState(`Painel de ${activeTab.toUpperCase()}`, "Configure as integrações principais para habilitar este módulo de comando.", "fa-microchip")
          )}
        </div>

        {showCreateCampaignModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-black/80 animate-in fade-in duration-300">
            <div className="bg-[#121212] w-full max-w-lg rounded-lg border border-white/10 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-black/20">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37]">Novo Comando de Tráfego</h3>
                <button onClick={() => setShowCreateCampaignModal(false)} className="text-gray-600 hover:text-white transition-colors"><i className="fas fa-times text-2xl"></i></button>
              </div>
              <div className="p-12 space-y-10">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20">
                    <i className="fas fa-rocket text-3xl text-[#D4AF37]"></i>
                  </div>
                  <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">Defina os parâmetros estratégicos. O RS-AI assumirá o controle tático em tempo real.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest ml-2">Título do Comando</label>
                    <input type="text" className="w-full bg-black/40 border border-white/5 rounded-lg px-8 py-5 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" placeholder="Ex: Performance Vendas Inverno" />
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest ml-2">Objetivo Primário</label>
                    <select className="w-full bg-black/40 border border-white/5 rounded-lg px-8 py-5 text-sm text-white focus:border-[#D4AF37] outline-none appearance-none cursor-pointer">
                      <option>Conversão (ROAS Dinâmico)</option>
                      <option>Captação de Leads (CPA Baixo)</option>
                      <option>Maximização de Cliques</option>
                    </select>
                    <i className="fas fa-chevron-down absolute right-6 top-[54px] text-gray-600 pointer-events-none"></i>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowCreateCampaignModal(false)} className="flex-1 py-6 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-white/5 transition-all">Abortar</button>
                  <button onClick={() => setShowCreateCampaignModal(false)} className="flex-[1.5] py-6 bg-[#D4AF37] text-black rounded-lg text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#F1C75B] transition-all shadow-2xl shadow-[#D4AF37]/20 active:scale-95">Executar Setup</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <a
          href="https://wa.me/5541999286392"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-12 right-12 w-20 h-20 bg-[#25D366] rounded-lg flex items-center justify-center text-white text-4xl shadow-2xl hover:scale-110 transition-transform z-[100] border-4 border-black/30"
        >
          <i className="fab fa-whatsapp"></i>
        </a>
      </main>
    </div>
  );
};

export default App;
