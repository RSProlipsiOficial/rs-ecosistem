import React, { useEffect, useState } from 'react';
import { IconSparkles } from '../constants';
import {
    buildFallbackMarketingContent,
    getFallbackReferralLinks,
    personalizeMarketingText,
    ReferralLinks,
    resolveReferralLinks
} from '../src/utils/referralLinks';

const genai = (window as any).genai;

const IconCopy = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const IconCheck = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const PointOfSale: React.FC = () => {
    const [objective, setObjective] = useState('recrutar');
    const [product, setProduct] = useState('');
    const [tone, setTone] = useState('entusiasmado');
    const [audience, setAudience] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
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

    const handleGenerateContent = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setNotice(null);
        setGeneratedContent(null);

        const fallbackContent = buildFallbackMarketingContent({ objective, product, tone, audience }, referralLinks);
        const apiKey = typeof process !== 'undefined' ? String((process as any)?.env?.API_KEY || '').trim() : '';

        try {
            if (!apiKey || !genai?.GoogleGenAI) {
                setGeneratedContent(fallbackContent);
                setNotice('IA externa indisponivel no momento. Foi gerado um modelo local pronto para uso.');
                return;
            }

            const ai = new genai.GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `
                    Gere um texto para divulgacao de "${product || 'linha completa RS Prolipsi'}"
                    com objetivo "${objective}", tom "${tone}" e publico "${audience || 'saude, bem-estar e renda'}".
                    Use os placeholders {{link_cadastro}}, {{link_loja}} e {{link_produtos}} quando fizer sentido.
                `,
            });

            setGeneratedContent(personalizeMarketingText(response.text || fallbackContent, referralLinks));
        } catch (error) {
            console.error('Erro ao gerar material do PDV:', error);
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

        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(generatedContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
        }

        alert('Nao foi possivel copiar automaticamente. Selecione e copie o texto manualmente.');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Ponto de Venda Digital</h1>
                <p className="text-text-body mt-1">Gere conteudo de marketing personalizado para impulsionar sua divulgacao.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={handleGenerateContent} className="bg-card p-6 rounded-2xl border border-border space-y-4">
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
                        <input type="text" id="product" value={product} onChange={(event) => setProduct(event.target.value)} placeholder="Ex: AlphaLipsi" className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25" />
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

                <div className="bg-card p-6 rounded-2xl border border-border">
                    {!isLoading && notice && (
                        <div className="mb-4 rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
                            {notice}
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <IconSparkles className="w-12 h-12 text-gold animate-pulse" />
                            <p className="mt-4 text-text-body">Preparando seu material...</p>
                        </div>
                    )}
                    {generatedContent && !isLoading && (
                        <div className="flex flex-col h-full">
                            <h3 className="text-lg font-bold text-text-title mb-2">Conteudo gerado</h3>
                            <div className="bg-surface rounded-lg p-4 flex-1 overflow-y-auto">
                                <p className="text-sm text-text-body whitespace-pre-wrap">{generatedContent}</p>
                            </div>
                            <button onClick={handleCopy} className={`w-full flex items-center justify-center mt-4 py-2 px-4 font-semibold rounded-lg transition-colors ${copied ? 'bg-success/20 text-success' : 'bg-surface hover:bg-border'}`}>
                                {copied ? <><IconCheck className="mr-2" /> Copiado!</> : <><IconCopy className="mr-2" /> Copiar texto</>}
                            </button>
                        </div>
                    )}
                    {!isLoading && !generatedContent && !notice && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-text-soft">
                            <p>Preencha o formulario ao lado para criar seu conteudo de divulgacao.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PointOfSale;
