import React, { useEffect, useState } from 'react';
import { IconSparkles, MOCK_MARKETING_MODELS } from '../constants';
import {
    buildFallbackMarketingContent,
    getFallbackReferralLinks,
    personalizeMarketingText,
    ReferralLinks,
    resolveReferralLinks
} from '../src/utils/referralLinks';

const genai = (window as any).genai;

const IconCopy: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const IconCheck: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
            active ? 'border-gold text-gold' : 'border-transparent text-text-soft hover:text-text-body hover:border-border'
        }`}
    >
        {label}
    </button>
);

const getMarketingApiKey = () => {
    if (typeof process !== 'undefined') {
        return String((process as any)?.env?.API_KEY || '').trim();
    }

    return '';
};

const copyToClipboard = async (content: string) => {
    if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        return true;
    }

    return false;
};

const AIGenerator: React.FC<{ referralLinks: ReferralLinks }> = ({ referralLinks }) => {
    const [objective, setObjective] = useState('recrutar');
    const [product, setProduct] = useState('');
    const [tone, setTone] = useState('entusiasmado');
    const [audience, setAudience] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerateContent = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setNotice(null);
        setGeneratedContent(null);

        const fallbackContent = buildFallbackMarketingContent({ objective, product, tone, audience }, referralLinks);
        const apiKey = getMarketingApiKey();

        try {
            if (!apiKey || !genai?.GoogleGenAI) {
                setGeneratedContent(fallbackContent);
                setNotice('IA externa indisponivel no momento. Foi gerado um modelo local pronto para uso.');
                return;
            }

            const ai = new genai.GoogleGenAI({ apiKey });
            const objectiveMap: Record<string, string> = {
                recrutar: 'Recrutar novos consultores para a equipe',
                promover: 'Promover um produto nas redes sociais',
                afiliado: 'Divulgar um produto como afiliado',
            };

            const prompt = `
                Voce e um especialista em marketing digital da RS Prolipsi.
                Crie um texto para redes sociais com o objetivo: "${objectiveMap[objective]}".

                Produto em foco: "${product || 'Linha completa RS Prolipsi'}"
                Tom de voz: "${tone}"
                Publico-alvo: "${audience || 'Pessoas interessadas em saude, bem-estar e renda'}"

                Regras:
                - Texto claro, persuasivo e facil de postar.
                - Inclua de 3 a 5 hashtags ao final.
                - Use os placeholders {{link_cadastro}}, {{link_loja}} e {{link_produtos}} quando fizer sentido.
                - Formate em paragrafos curtos.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const content = personalizeMarketingText(response.text || fallbackContent, referralLinks);
            setGeneratedContent(content);
        } catch (error) {
            console.error('Erro ao gerar conteudo de marketing:', error);
            setGeneratedContent(fallbackContent);
            setNotice('IA externa indisponivel no momento. Foi gerado um modelo local pronto para uso.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!generatedContent) {
            return;
        }

        const copiedSuccessfully = await copyToClipboard(generatedContent);
        if (copiedSuccessfully) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
        }

        alert('Nao foi possivel copiar automaticamente. Selecione e copie o texto manualmente.');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
                <h3 className="text-xl font-bold text-text-title">Defina sua estrategia</h3>
                <p className="text-sm text-text-soft">Preencha os campos abaixo para gerar um texto pronto para publicar.</p>
                <form onSubmit={handleGenerateContent} className="space-y-4 pt-4">
                    <div>
                        <label htmlFor="objective" className="block text-sm font-medium text-text-body mb-2">Objetivo da campanha</label>
                        <select id="objective" value={objective} onChange={(event) => setObjective(event.target.value)} className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25">
                            <option value="recrutar">Recrutar para rede</option>
                            <option value="promover">Promover produto</option>
                            <option value="afiliado">Divulgar como afiliado</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="product" className="block text-sm font-medium text-text-body mb-2">Produto em foco</label>
                        <input type="text" id="product" value={product} onChange={(event) => setProduct(event.target.value)} placeholder="Ex: SlimLipsi" className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25" />
                    </div>
                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-text-body mb-2">Tom de voz</label>
                        <select id="tone" value={tone} onChange={(event) => setTone(event.target.value)} className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25">
                            <option value="entusiasmado">Entusiasmado</option>
                            <option value="profissional">Profissional</option>
                            <option value="inspirador">Inspirador</option>
                            <option value="informativo">Informativo</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="audience" className="block text-sm font-medium text-text-body mb-2">Publico-alvo</label>
                        <input type="text" id="audience" value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Ex: maes jovens, empreendedores" className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center text-center py-3 px-6 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Gerando...
                            </>
                        ) : (
                            <>
                                <IconSparkles className="w-5 h-5 mr-2" />
                                Gerar conteudo
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <IconSparkles className="w-12 h-12 text-gold animate-pulse" />
                        <p className="mt-4 text-text-body">Preparando seu material...</p>
                    </div>
                )}
                {!isLoading && notice && (
                    <div className="mb-4 rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
                        {notice}
                    </div>
                )}
                {generatedContent && !isLoading && (
                    <div className="flex flex-col h-full">
                        <h3 className="text-lg font-bold text-text-title mb-2">Conteudo gerado</h3>
                        <div className="bg-surface rounded-lg p-4 flex-1 overflow-y-auto max-h-[400px]">
                            <p className="text-sm text-text-body whitespace-pre-wrap">{generatedContent}</p>
                        </div>
                        <button onClick={handleCopy} className={`w-full flex items-center justify-center mt-4 py-2 px-4 font-semibold rounded-lg transition-colors ${copied ? 'bg-success/20 text-success' : 'bg-surface hover:bg-border'}`}>
                            {copied ? <><IconCheck className="mr-2" /> Copiado!</> : <><IconCopy className="mr-2" /> Copiar texto</>}
                        </button>
                    </div>
                )}
                {!isLoading && !generatedContent && !notice && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-text-soft">
                        <p>Preencha o formulario ao lado para gerar seu texto de divulgacao.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const MarketingModelCard: React.FC<{ model: typeof MOCK_MARKETING_MODELS[0]; referralLinks: ReferralLinks }> = ({ model, referralLinks }) => {
    const [copied, setCopied] = useState(false);
    const personalizedText = personalizeMarketingText(model.contentText, referralLinks);

    const handleCopy = async () => {
        const copiedSuccessfully = await copyToClipboard(personalizedText);
        if (copiedSuccessfully) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
        }

        alert('Nao foi possivel copiar automaticamente. Selecione e copie o texto manualmente.');
    };

    const displayText = personalizedText.split(/(\bhttps?:\/\/\S+\b)/g).map((part, index) => {
        if (part.startsWith('http')) {
            return <span key={index} className="text-gold font-semibold">{part}</span>;
        }

        return part;
    });

    return (
        <div className="bg-card rounded-2xl border border-border shadow-custom-lg overflow-hidden flex flex-col">
            <img src={model.imageUrl} alt={model.title} className="w-full h-48 object-cover" />
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-text-title">{model.title}</h3>
                <div className="my-4 p-4 bg-surface rounded-lg text-sm text-text-body whitespace-pre-wrap flex-1">
                    {displayText}
                </div>
                <button
                    onClick={handleCopy}
                    className={`w-full flex items-center justify-center text-center py-2 px-4 font-semibold rounded-lg transition-colors duration-200 ${copied ? 'bg-success/20 text-success border border-success' : 'bg-gold text-card hover:bg-gold-hover'}`}
                >
                    {copied ? (
                        <>
                            <IconCheck className="w-5 h-5 mr-2" />
                            Copiado!
                        </>
                    ) : (
                        <>
                            <IconCopy className="w-5 h-5 mr-2" />
                            Copiar texto
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const ReadyModels: React.FC<{ referralLinks: ReferralLinks }> = ({ referralLinks }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_MARKETING_MODELS.map((model) => (
            <MarketingModelCard key={model.id} model={model} referralLinks={referralLinks} />
        ))}
    </div>
);

const MarketingHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState('ia_generator');
    const [referralLinks, setReferralLinks] = useState<ReferralLinks>(getFallbackReferralLinks());

    useEffect(() => {
        let active = true;

        resolveReferralLinks().then((links) => {
            if (active) {
                setReferralLinks(links);
            }
        });

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Central de Marketing</h1>
                <p className="text-text-body mt-1">Use estas ferramentas para divulgar em suas redes sociais e contatos.</p>
            </div>

            <div className="border-b border-border">
                <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
                    <TabButton label="Gerador com IA" active={activeTab === 'ia_generator'} onClick={() => setActiveTab('ia_generator')} />
                    <TabButton label="Modelos prontos" active={activeTab === 'models'} onClick={() => setActiveTab('models')} />
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'ia_generator' && <AIGenerator referralLinks={referralLinks} />}
                {activeTab === 'models' && <ReadyModels referralLinks={referralLinks} />}
            </div>
        </div>
    );
};

export default MarketingHub;
