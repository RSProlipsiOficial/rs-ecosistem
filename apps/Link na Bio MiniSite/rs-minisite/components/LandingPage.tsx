import React, { useState } from 'react';
import { PLANS } from '../constants';
import { UserPlan } from '../types';
import { CheckCircle2, ArrowRight, Layout, Smartphone, BarChart3, Zap, Crown, Star, Play, ShoppingBag, Instagram, Linkedin, Youtube, Globe, Palette, MessageCircle, Rocket, ChevronDown } from 'lucide-react';

interface LandingPageProps {
    onLogin: () => void;
    onGetStarted: (plan?: UserPlan) => void;
    plans: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onGetStarted, plans }) => {
    return (
        <div className="min-h-screen bg-rs-black text-white font-sans overflow-x-hidden selection:bg-rs-gold selection:text-black">
            <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-rs-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-rs-gold rounded-sm flex items-center justify-center font-serif font-bold text-black text-lg">R</div>
                        <span className="font-serif font-bold text-xl tracking-wide">RS MiniSite</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onLogin}
                            className="text-sm font-bold text-gray-300 hover:text-white transition-colors uppercase tracking-widest hidden md:block"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => onGetStarted('free')}
                            className="bg-rs-gold hover:bg-white text-black font-bold py-2 px-6 rounded transition-all duration-300 transform hover:scale-105"
                        >
                            Criar Grátis
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - HYBRID LAYOUT (Title Top, Content Side-by-Side) */}
            <section className="relative pt-28 pb-12 md:pt-36 md:pb-20 px-6 overflow-hidden">
                {/* Abstract Background Elements covering the whole unified section */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rs-gold/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rs-gold/5 blur-[100px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/4" />

                <div className="max-w-7xl mx-auto relative z-10">

                    {/* PART 1: TOP CENTERED TITLE */}
                    <div className="text-center max-w-5xl mx-auto mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rs-gold/30 bg-rs-gold/5 text-rs-gold text-[10px] font-bold uppercase tracking-widest mb-6 animate-fade-in">
                            <span className="w-1.5 h-1.5 rounded-full bg-rs-gold animate-pulse" />
                            RS Ecosystem
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
                            Crie seu site profissional <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rs-goldLight via-rs-gold to-rs-goldDark">
                                para bio em minutos
                            </span>
                        </h1>
                    </div>

                    {/* PART 2: SPLIT CONTENT (Left: Text/Buttons, Right: Phone) */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">

                        {/* Left Column: Description & Buttons */}
                        <div className="text-center lg:text-left flex flex-col items-center lg:items-start order-2 lg:order-1">
                            <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-8 max-w-xl">
                                Publique em 1 clique, sem domínio próprio. Editor visual, WhatsApp, vídeo, galeria e produtos. Tudo o que você precisa em um único lugar.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                <button
                                    onClick={() => onGetStarted('free')}
                                    className="w-full sm:w-auto px-8 py-4 bg-rs-gold hover:bg-rs-goldDark text-black font-bold rounded-lg text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transform hover:-translate-y-1"
                                >
                                    Começar Grátis
                                    <ArrowRight size={20} />
                                </button>
                                <a
                                    href="#planos"
                                    className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-rs-gold/50 hover:bg-white/5 text-white font-bold rounded-lg text-lg transition-all flex items-center justify-center"
                                >
                                    Ver Planos
                                </a>
                            </div>

                            <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-rs-black flex items-center justify-center text-xs font-bold text-white">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <p>Junte-se a +1.200 profissionais</p>
                            </div>
                        </div>

                        {/* Right Column: Phone Mockup */}
                        <div className="order-1 lg:order-2 flex justify-center lg:justify-end perspective-1000 relative">
                            {/* Phone Frame */}
                            <div className="relative border-gray-800 bg-gray-800 border-[10px] rounded-[2.5rem] h-[550px] w-[280px] shadow-2xl flex flex-col transform hover:-translate-y-2 transition-transform duration-500 ease-in-out lg:rotate-y-[-12deg] lg:hover:rotate-y-0 hover:shadow-rs-gold/20 z-20">
                                {/* Buttons on side */}
                                <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[13px] top-[72px] rounded-l-lg"></div>
                                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[124px] rounded-l-lg"></div>
                                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[13px] top-[142px] rounded-r-lg"></div>

                                {/* Screen */}
                                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-neutral-900 relative border border-gray-700">
                                    {/* Notch/Top Bar */}
                                    <div className="absolute top-0 w-full h-6 bg-black/40 z-20 flex justify-center items-center backdrop-blur-sm">
                                        <div className="w-14 h-3 bg-black rounded-b-lg"></div>
                                    </div>

                                    {/* Content Inside Phone */}
                                    <div className="w-full h-full flex flex-col items-center pt-12 px-4 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center">
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>

                                        {/* Profile */}
                                        <div className="relative z-10 flex flex-col items-center animate-fade-in">
                                            <div className="w-16 h-16 rounded-full border-2 border-rs-gold p-0.5 mb-3 bg-neutral-800">
                                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" className="w-full h-full rounded-full object-cover" alt="User" />
                                            </div>
                                            <h3 className="text-white font-serif font-bold text-lg">Dra. Isabella</h3>
                                            <p className="text-gray-300 text-[10px] mt-0.5">Harmonização Facial & Estética</p>
                                            <div className="flex gap-0.5 mt-2 text-rs-gold">
                                                <Star size={8} fill="currentColor" />
                                                <Star size={8} fill="currentColor" />
                                                <Star size={8} fill="currentColor" />
                                                <Star size={8} fill="currentColor" />
                                                <Star size={8} fill="currentColor" />
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="relative z-10 w-full space-y-2 mt-6">
                                            <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2.5 flex items-center justify-between hover:bg-white/20 transition-colors shadow-sm cursor-pointer">
                                                <span className="text-[10px] font-bold text-white pl-2">Agendar Avaliação</span>
                                                <div className="bg-rs-gold p-1 rounded-full text-black"><ArrowRight size={8} /></div>
                                            </div>
                                            <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2.5 flex items-center justify-between hover:bg-white/20 transition-colors shadow-sm cursor-pointer">
                                                <span className="text-[10px] font-bold text-white pl-2">Meus Resultados</span>
                                                <div className="bg-rs-gold p-1 rounded-full text-black"><ArrowRight size={8} /></div>
                                            </div>
                                            <div className="w-full bg-rs-gold rounded-lg p-2.5 flex items-center justify-center font-bold text-black text-[10px] shadow-[0_0_15px_rgba(212,175,55,0.4)] mt-2 cursor-pointer">
                                                Chamar no WhatsApp
                                            </div>
                                        </div>

                                        {/* Footer in phone */}
                                        <div className="relative z-10 mt-auto mb-6 flex flex-col items-center gap-2">
                                            <div className="flex gap-3">
                                                <div className="p-1.5 bg-white/10 rounded-full"><Instagram size={12} /></div>
                                                <div className="p-1.5 bg-white/10 rounded-full"><Youtube size={12} /></div>
                                                <div className="p-1.5 bg-white/10 rounded-full"><Linkedin size={12} /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Glow behind phone */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[550px] bg-rs-gold/15 blur-[60px] -z-10 rounded-full pointer-events-none"></div>
                        </div>

                    </div>
                </div>
            </section>

            {/* BENEFITS SECTION */}
            <section className="py-20 bg-neutral-900/50 border-y border-white/5 relative z-20">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">Benefícios do RS MiniSite</h2>
                        <p className="text-gray-400 text-sm">Ferramentas essenciais para destacar sua marca.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        {/* Benefit 1 */}
                        <div className="flex items-start gap-4 p-2 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                            <div className="p-3 bg-black rounded-lg border border-rs-gold/20 shrink-0 group-hover:border-rs-gold/50 transition-colors">
                                <Globe className="text-rs-gold" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg mb-1">Link Pronto</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Seu link exclusivo pronto para usar imediatamente, sem precisar comprar domínio ou configurar servidores complexos.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 2 */}
                        <div className="flex items-start gap-4 p-2 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                            <div className="p-3 bg-black rounded-lg border border-rs-gold/20 shrink-0 group-hover:border-rs-gold/50 transition-colors">
                                <Palette className="text-rs-gold" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg mb-1">Editor Visual</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Construa seu site com blocos arrastáveis estilo Canva. Interface intuitiva onde você vê o resultado em tempo real.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 3 */}
                        <div className="flex items-start gap-4 p-2 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                            <div className="p-3 bg-black rounded-lg border border-rs-gold/20 shrink-0 group-hover:border-rs-gold/50 transition-colors">
                                <MessageCircle className="text-rs-gold" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg mb-1">WhatsApp & Social</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Centralize sua comunicação. Botões de conversão direta para WhatsApp e links organizados para todas as redes sociais.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 4 */}
                        <div className="flex items-start gap-4 p-2 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                            <div className="p-3 bg-black rounded-lg border border-rs-gold/20 shrink-0 group-hover:border-rs-gold/50 transition-colors">
                                <Play className="text-rs-gold" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg mb-1">Mídia & Produtos</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Enriqueça seu site com vídeos do YouTube, galerias de fotos e venda produtos ou serviços diretamente na bio.
                                </p>
                            </div>
                        </div>

                        {/* Benefit 5 */}
                        <div className="flex items-start gap-4 p-2 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                            <div className="p-3 bg-black rounded-lg border border-rs-gold/20 shrink-0 group-hover:border-rs-gold/50 transition-colors">
                                <BarChart3 className="text-rs-gold" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg mb-1">SEO & Pixel</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Otimização para buscadores e integração com Pixels (Facebook, Google, TikTok) para campanhas de marketing (Pro/Agency).
                                </p>
                            </div>
                        </div>

                        {/* Benefit 6 */}
                        <div className="flex items-start gap-4 p-2 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                            <div className="p-3 bg-black rounded-lg border border-rs-gold/20 shrink-0 group-hover:border-rs-gold/50 transition-colors">
                                <Rocket className="text-rs-gold" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg mb-1">Publicação em 1 Clique</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Atualize informações, preços ou links instantaneamente. Suas alterações vão ao ar com um único clique.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className="py-24 bg-black relative border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Como funciona</h2>
                        <p className="text-gray-400">Três passos simples para sua presença digital.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center p-6 relative z-10">
                            <div className="w-16 h-16 rounded-full border-2 border-rs-gold text-rs-gold flex items-center justify-center text-2xl font-bold mb-6 shadow-[0_0_20px_rgba(212,175,55,0.2)] bg-black">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Crie seu MiniSite</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Defina o nome do seu projeto e garanta seu link exclusivo (ex: bio.rs/voce) em segundos.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center p-6 relative z-10">
                            <div className="w-16 h-16 rounded-full border-2 border-rs-gold text-rs-gold flex items-center justify-center text-2xl font-bold mb-6 shadow-[0_0_20px_rgba(212,175,55,0.2)] bg-black">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Edite com o Construtor</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Adicione sua foto, botões, galeria, vídeos e produtos arrastando blocos no editor visual.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center p-6 relative z-10">
                            <div className="w-16 h-16 rounded-full border-2 border-rs-gold text-rs-gold flex items-center justify-center text-2xl font-bold mb-6 shadow-[0_0_20px_rgba(212,175,55,0.2)] bg-black">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Publique na Bio</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Com um clique, seu site está no ar. Copie o link e cole na bio do Instagram, TikTok ou WhatsApp.
                            </p>
                        </div>

                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-14 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rs-gold/30 to-transparent -z-0"></div>
                    </div>

                    <div className="mt-16 text-center">
                        <button
                            onClick={() => onGetStarted('free')}
                            className="px-8 py-3 bg-white/5 hover:bg-rs-gold hover:text-black border border-rs-gold/30 text-rs-gold font-bold rounded-full transition-all duration-300 uppercase tracking-widest text-xs transform hover:scale-105"
                        >
                            Começar Grátis Agora
                        </button>
                    </div>
                </div>
            </section>

            {/* EXAMPLES SECTION */}
            <section className="py-24 bg-neutral-900/30 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Veja exemplos de MiniSites</h2>
                        <p className="text-gray-400">Versatilidade para qualquer nicho ou profissional.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ExampleCard
                            title="Consultor & Mentor"
                            category="Venda conhecimento"
                            image="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop"
                            color="border-blue-500/30"
                        />
                        <ExampleCard
                            title="Clínica & Saúde"
                            category="Agendamentos"
                            image="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=400&auto=format&fit=crop"
                            color="border-green-500/30"
                        />
                        <ExampleCard
                            title="Afiliado & Ofertas"
                            category="Links de produtos"
                            image="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop"
                            color="border-purple-500/30"
                        />
                        <ExampleCard
                            title="Prestador de Serviço"
                            category="Portfólio e Orçamentos"
                            image="https://images.unsplash.com/photo-1581578731117-104f2a8d275d?q=80&w=400&auto=format&fit=crop"
                            color="border-orange-500/30"
                        />
                    </div>
                </div>
            </section>

            {/* TEMPLATE CAROUSEL SECTION */}
            <section className="py-20 bg-black border-y border-white/5 relative overflow-hidden">
                <div className="text-center mb-12 px-6">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">Templates de Alta Conversão</h2>
                    <p className="text-gray-400 text-sm">Design profissional pronto para usar. Basta editar.</p>
                </div>

                {/* Gradient Masks */}
                <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

                {/* Marquee Track */}
                <div className="flex w-full overflow-hidden">
                    <div className="flex animate-scroll gap-10 px-10 w-max hover:pause">
                        {/* We duplicate the templates array to create an infinite loop effect */}
                        {[...TEMPLATES, ...TEMPLATES].map((template, idx) => (
                            <TemplateCard key={idx} template={template} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-neutral-900/30 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Poder de Agência. Simplicidade de App.</h2>
                        <p className="text-gray-400">Tudo o que você precisa para profissionalizar sua presença digital.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Layout className="text-rs-gold" size={32} />}
                            title="Editor Drag & Drop"
                            description="Construa páginas incríveis arrastando blocos. Galeria, Vídeos, Produtos e muito mais."
                        />
                        <FeatureCard
                            icon={<Smartphone className="text-rs-gold" size={32} />}
                            title="Mobile First Premium"
                            description="Seus sites carregam instantaneamente e parecem aplicativos nativos em qualquer celular."
                        />
                        <FeatureCard
                            icon={<Zap className="text-rs-gold" size={32} />}
                            title="Hospedagem Inclusa"
                            description="Não se preocupe com servidores. Seus links bio.rsprolipsi.com.br estão sempre online."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section (Added ID for scrolling) */}
            <section id="planos" className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Escolha seu nível de acesso</h2>
                        <p className="text-gray-400">Comece grátis e escale conforme seu império cresce.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {/* FREE */}
                        <PricingCard
                            plan={plans.free || PLANS.free}
                            onSelect={() => onGetStarted('free')}
                        />

                        {/* START */}
                        <PricingCard
                            plan={plans.start || PLANS.start}
                            onSelect={() => onGetStarted('start')}
                        />

                        {/* PRO - Highlighted */}
                        <div className="relative transform lg:-translate-y-4">
                            <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                <span className="bg-rs-gold text-black text-[10px] font-bold uppercase py-1 px-3 rounded-full shadow-lg flex items-center gap-1">
                                    <Crown size={12} />
                                    Mais Popular
                                </span>
                            </div>
                            <PricingCard
                                plan={plans.pro || PLANS.pro}
                                isHighlighted={true}
                                onSelect={() => onGetStarted('pro')}
                            />
                        </div>

                        {/* AGENCY */}
                        <PricingCard
                            plan={plans.agency || PLANS.agency}
                            onSelect={() => onGetStarted('agency')}
                        />
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="py-24 bg-neutral-900/30 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Perguntas Frequentes</h2>
                        <p className="text-gray-400">Tire suas dúvidas sobre o RS MiniSite.</p>
                    </div>

                    <div className="space-y-4">
                        <FaqItem
                            question="Preciso comprar domínio?"
                            answer="Não. Você recebe um link exclusivo (ex: bio.rsprolipsi.com.br/voce) imediatamente após o cadastro, com hospedagem segura inclusa."
                        />
                        <FaqItem
                            question="Posso usar na bio do Instagram?"
                            answer="Sim! O RS MiniSite foi desenhado especificamente para ser seu 'link na bio' do Instagram, TikTok, WhatsApp e LinkedIn, centralizando todos os seus canais."
                        />
                        <FaqItem
                            question="Posso colocar WhatsApp, vídeo e galeria?"
                            answer="Com certeza. Nosso editor arrasta-e-solta possui blocos dedicados para botões de WhatsApp, vídeos do YouTube e galerias de imagens."
                        />
                        <FaqItem
                            question="O que muda do Start para o Pro?"
                            answer="O plano Start é gratuito para 1 página com nossa marca no rodapé. O Pro remove a marca d'água, libera até 10 páginas e oferece suporte prioritário."
                        />
                        <FaqItem
                            question="Como funciona a revenda no Agency?"
                            answer="O plano Agency permite que você gerencie até 100 clientes em um único painel. Você cria os sites para eles e pode cobrar o valor que desejar pelo serviço. O lucro é 100% seu."
                        />
                        <FaqItem
                            question="Posso cancelar quando quiser?"
                            answer="Sim. Não exigimos fidelidade. Você pode cancelar sua assinatura a qualquer momento diretamente pelo seu painel."
                        />
                    </div>
                </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section className="py-24 bg-gradient-to-b from-rs-black to-neutral-900 border-t border-white/5 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rs-gold/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
                        Pronto para colocar seu <br />
                        <span className="text-rs-gold">MiniSite no ar hoje?</span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Comece grátis e evolua quando quiser. Publicação em 1 clique.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <button
                            onClick={() => onGetStarted('free')}
                            className="w-full sm:w-auto px-8 py-4 bg-rs-gold hover:bg-rs-goldDark text-black font-bold rounded-lg text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transform hover:-translate-y-1"
                        >
                            Começar Grátis
                            <ArrowRight size={20} />
                        </button>
                        <a
                            href="#planos"
                            className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-rs-gold/50 hover:bg-white/5 text-white font-bold rounded-lg text-lg transition-all flex items-center justify-center"
                        >
                            Ver Planos
                        </a>
                    </div>

                    <p className="text-sm text-gray-500 font-medium">
                        Sem domínio, sem complicação. Seu link pronto no seu domínio RS.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black pt-16 pb-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white/10 rounded-sm flex items-center justify-center font-serif font-bold text-rs-gold text-xs">R</div>
                        <span className="font-serif font-bold text-lg text-gray-300">RS MiniSite</span>
                    </div>

                    <div className="flex gap-8 text-sm text-gray-500">
                        <a href="#" className="hover:text-rs-gold transition-colors">Termos</a>
                        <a href="#" className="hover:text-rs-gold transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-rs-gold transition-colors">Suporte</a>
                    </div>

                    <p className="text-xs text-gray-600">
                        &copy; {new Date().getFullYear()} RS Prólipsi. Excellence in Digital.
                    </p>
                </div>
            </footer>

        </div>
    );
};

// -- SUBCOMPONENTS --

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/10 rounded-lg bg-black/40 overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-gray-200 hover:text-rs-gold transition-colors"
            >
                <span>{question}</span>
                <ChevronDown size={20} className={`text-rs-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-sm text-gray-400 leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

const TemplateCard: React.FC<{ template: any }> = ({ template }) => (
    <div className="relative w-[240px] h-[480px] bg-gray-900 border-[6px] border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col shrink-0 transform hover:scale-105 transition-transform duration-300 cursor-pointer group">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-b-lg z-20"></div>

        {/* Screen Content */}
        <div className="w-full h-full relative flex flex-col pt-8 px-3 pb-4" style={{ backgroundColor: template.bg, backgroundImage: template.bgImage ? `url(${template.bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* Overlay if image/video */}
            {(template.bgImage || template.isVideo) && <div className="absolute inset-0 bg-black/50 z-0"></div>}

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-12 h-12 rounded-full border-2 border-white/50 bg-gray-200 overflow-hidden mb-2">
                        <img src={template.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    {!template.hideText && (
                        <>
                            <div className="h-2 w-20 bg-white/80 rounded mb-1"></div>
                            <div className="h-1.5 w-12 bg-white/50 rounded"></div>
                        </>
                    )}
                </div>

                {/* Body Elements */}
                <div className="flex-1 space-y-2 overflow-hidden">
                    {/* Video Placeholder */}
                    {template.isVideo && (
                        <div className="w-full aspect-video bg-black/40 rounded-lg flex items-center justify-center border border-white/10 mb-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <Play size={12} fill="white" className="text-white ml-0.5" />
                            </div>
                        </div>
                    )}

                    {/* Products Grid */}
                    {template.isShop && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="aspect-square bg-white/10 rounded-lg border border-white/10 relative">
                                <div className="absolute bottom-1 right-1 bg-rs-gold text-[6px] text-black px-1 rounded">R$ 97</div>
                            </div>
                            <div className="aspect-square bg-white/10 rounded-lg border border-white/10 relative">
                                <div className="absolute bottom-1 right-1 bg-rs-gold text-[6px] text-black px-1 rounded">R$ 49</div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    {template.buttons.map((btn: any, i: number) => (
                        <div key={i} className={`w-full h-8 rounded-lg flex items-center justify-between px-3 ${btn.style === 'outline' ? 'border border-white/30 bg-transparent' : 'bg-white/10 backdrop-blur-sm'}`}>
                            <div className="w-16 h-1.5 bg-white/60 rounded"></div>
                            {btn.icon && <div className="w-3 h-3 bg-white/40 rounded-full"></div>}
                        </div>
                    ))}

                    {/* Gallery Grid */}
                    {template.gallery && (
                        <div className="grid grid-cols-3 gap-1 mt-2">
                            {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-white/20 rounded"></div>)}
                        </div>
                    )}
                </div>

                {/* Footer Socials */}
                <div className="mt-auto pt-2 flex justify-center gap-2 border-t border-white/10">
                    <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center"><Instagram size={10} /></div>
                    <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center"><Globe size={10} /></div>
                    <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center"><Youtube size={10} /></div>
                </div>
            </div>
        </div>
    </div>
);

const ExampleCard = ({ title, category, image, color }: { title: string, category: string, image: string, color: string }) => (
    <div className="flex flex-col items-center group cursor-pointer">
        <div className={`relative w-[220px] h-[400px] bg-gray-900 border-[8px] border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]`}>
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-lg z-20"></div>

            {/* Screen Image */}
            <div className="w-full h-full bg-cover bg-center relative" style={{ backgroundImage: `url(${image})` }}>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500"></div>

                {/* Mock UI Elements overlay */}
                <div className="absolute top-12 left-4 right-4 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-sm mb-3"></div>
                    <div className="h-2 w-24 bg-white/70 rounded-full mb-2"></div>
                    <div className="h-1.5 w-16 bg-white/40 rounded-full"></div>
                </div>

                <div className="absolute bottom-6 left-4 right-4 space-y-2">
                    <div className="h-8 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20"></div>
                    <div className="h-8 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20"></div>
                </div>
            </div>
        </div>

        <div className="mt-6 text-center">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-rs-gold transition-colors">{title}</h3>
            <p className="text-sm text-gray-500">{category}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-rs-gold/30 hover:bg-white/10 transition-all group">
        <div className="mb-4 p-3 bg-black rounded-lg w-fit group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
    </div>
);

const PricingCard = ({ plan, isHighlighted = false, onSelect }: { plan: any, isHighlighted?: boolean, onSelect: () => void }) => (
    <div className={`p-8 rounded-2xl flex flex-col h-full border transition-all duration-300 ${isHighlighted ? 'bg-gradient-to-b from-rs-gray to-black border-rs-gold shadow-[0_0_30px_rgba(212,175,55,0.15)]' : 'bg-black border-white/10 hover:border-white/20'}`}>
        <h3 className={`text-xl font-bold mb-2 ${isHighlighted ? 'text-rs-gold' : 'text-white'}`}>{plan.name}</h3>
        <div className="mb-6 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{plan.price.split('/')[0]}</span>
            <span className="text-sm text-gray-500">{plan.price.includes('/') ? '/mês' : ''}</span>
        </div>

        <ul className="space-y-4 mb-8 flex-1">
            {plan.features.map((feat: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle2 size={16} className={`mt-0.5 ${isHighlighted ? 'text-rs-gold' : 'text-gray-500'}`} />
                    {feat}
                </li>
            ))}
        </ul>

        <button
            onClick={onSelect}
            className={`w-full py-3 rounded-lg font-bold transition-all ${isHighlighted
                ? 'bg-rs-gold hover:bg-rs-goldDark text-black shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
        >
            {plan.price === 'Grátis' ? 'Começar Grátis' : 'Assinar Agora'}
        </button>
    </div>
);

// MOCK DATA FOR TEMPLATES CAROUSEL
const TEMPLATES = [
    { bg: '#000000', bgImage: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400&q=80', avatar: 'https://i.pravatar.cc/150?u=1', buttons: [{ style: 'solid' }, { style: 'outline' }, { style: 'solid' }], isVideo: false },
    { bg: '#1a1a1a', bgImage: '', avatar: 'https://i.pravatar.cc/150?u=2', buttons: [{ style: 'solid', icon: true }, { style: 'solid', icon: true }], isVideo: true, hideText: false },
    { bg: '#2b2b2b', bgImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80', avatar: 'https://i.pravatar.cc/150?u=3', buttons: [{ style: 'outline' }, { style: 'outline' }], isShop: true },
    { bg: '#D4AF37', bgImage: '', avatar: 'https://i.pravatar.cc/150?u=4', buttons: [{ style: 'solid' }, { style: 'solid' }, { style: 'solid' }, { style: 'solid' }], isVideo: false },
    { bg: '#000000', bgImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80', avatar: 'https://i.pravatar.cc/150?u=5', buttons: [{ style: 'outline' }], gallery: true },
    { bg: '#4a044e', bgImage: '', avatar: 'https://i.pravatar.cc/150?u=6', buttons: [{ style: 'solid' }, { style: 'solid' }], isVideo: true },
    { bg: '#1e3a8a', bgImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80', avatar: 'https://i.pravatar.cc/150?u=7', buttons: [{ style: 'solid', icon: true }, { style: 'outline' }, { style: 'outline' }], isShop: false },
    { bg: '#0f172a', bgImage: '', avatar: 'https://i.pravatar.cc/150?u=8', buttons: [{ style: 'outline' }, { style: 'outline' }, { style: 'outline' }], isShop: true },
    { bg: '#000000', bgImage: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&q=80', avatar: 'https://i.pravatar.cc/150?u=9', buttons: [{ style: 'solid' }, { style: 'solid' }], isVideo: true },
    { bg: '#78350f', bgImage: 'https://images.unsplash.com/photo-1519681393798-3828fb4090bb?w=400&q=80', avatar: 'https://i.pravatar.cc/150?u=10', buttons: [{ style: 'solid' }, { style: 'outline' }], gallery: true },
];