import React, { useState } from 'react';
// import * as genai from '@google/genai';
import { USER_REFERRAL_LINKS, MOCK_MARKETING_MODELS, IconSparkles } from '../constants';

// --- Reusable Components ---

const IconCopy: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);
  
const IconCheck: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors
            ${active ? 'border-gold text-gold' : 'border-transparent text-text-soft hover:text-text-body hover:border-border'
        }`}
    >
        {label}
    </button>
);

// --- Tab 1: AI Generator Content ---

const AIGenerator: React.FC = () => {
    const [objective, setObjective] = useState('recrutar');
    const [product, setProduct] = useState('');
    const [tone, setTone] = useState('entusiasmado');
    const [audience, setAudience] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerateContent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);

        try {
            if (!process.env.API_KEY) {
                throw new Error("A chave da API não foi configurada.");
            }
            const ai = new genai.GoogleGenAI({ apiKey: process.env.API_KEY });

            const objectiveMap: { [key: string]: string } = {
                'recrutar': 'Recrutar novos consultores para a equipe (Marketing Multinível)',
                'promover': 'Promover um produto nas redes sociais (Marketing Digital)',
                'afiliado': 'Divulgar um produto como afiliado (Marketing de Afiliado)',
            };
            
            const prompt = `
                Você é um especialista em marketing digital para a empresa RS Prólipsi, que vende produtos de bem-estar.
                Crie um texto de post para redes sociais com o seguinte objetivo: "${objectiveMap[objective]}".
                
                Detalhes da campanha:
                - Produto em foco: "${product || 'Linha completa de produtos RS Prólipsi'}"
                - Tom de voz: "${tone}"
                - Público-alvo: "${audience || 'Público geral interessado em saúde e bem-estar'}"

                Instruções:
                - O texto deve ser envolvente, persuasivo e claro.
                - Inclua 3 a 5 hashtags relevantes ao final.
                - Se o objetivo for recrutar ou promover, use o placeholder '{{link_cadastro}}' para o link de cadastro.
                - Se o objetivo for divulgar como afiliado, use o placeholder '{{link_loja}}' para o link da loja.
                - Formate o texto com parágrafos para facilitar a leitura.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            let content = response.text;
            content = content
                .replace(/{{link_cadastro}}/g, USER_REFERRAL_LINKS.cadastro)
                .replace(/{{link_loja}}/g, USER_REFERRAL_LINKS.loja);
            
            setGeneratedContent(content);

        } catch (err: any) {
            console.error(err);
            setError("Não foi possível gerar o conteúdo. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (generatedContent) {
            navigator.clipboard.writeText(generatedContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
                <h3 className="text-xl font-bold text-text-title">Defina sua Estratégia</h3>
                <p className="text-sm text-text-soft">Preencha os campos abaixo para que a IA crie o texto perfeito para sua postagem.</p>
                <form onSubmit={handleGenerateContent} className="space-y-4 pt-4">
                     <div>
                        <label htmlFor="objective" className="block text-sm font-medium text-text-body mb-2">Objetivo da Campanha</label>
                        <select id="objective" value={objective} onChange={e => setObjective(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25">
                            <option value="recrutar">Recrutar para Rede (M. Multinível)</option>
                            <option value="promover">Promover nas Redes Sociais (M. Digital)</option>
                            <option value="afiliado">Divulgar como Afiliado (M. de Afiliado)</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="product" className="block text-sm font-medium text-text-body mb-2">Produto em Foco (Opcional)</label>
                        <input type="text" id="product" value={product} onChange={e => setProduct(e.target.value)} placeholder="Ex: Kit Prólipsi Essencial" className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25" />
                    </div>
                     <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-text-body mb-2">Tom de Voz</label>
                        <select id="tone" value={tone} onChange={e => setTone(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25">
                            <option value="entusiasmado">Entusiasmado</option>
                            <option value="profissional">Profissional</option>
                            <option value="inspirador">Inspirador</option>
                            <option value="informativo">Informativo</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="audience" className="block text-sm font-medium text-text-body mb-2">Público-Alvo (Opcional)</label>
                        <input type="text" id="audience" value={audience} onChange={e => setAudience(e.target.value)} placeholder="Ex: Mães jovens, empreendedores" className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25" />
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
                                Gerar Conteúdo com IA
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <IconSparkles className="w-12 h-12 text-gold animate-pulse" />
                        <p className="mt-4 text-text-body">Aguarde, a IA está criando seu post...</p>
                    </div>
                )}
                {error && <p className="text-danger text-center">{error}</p>}
                {generatedContent && (
                    <div className="flex flex-col h-full">
                        <h3 className="text-lg font-bold text-text-title mb-2">Conteúdo Gerado</h3>
                        <div className="bg-surface rounded-lg p-4 flex-1 overflow-y-auto max-h-[400px]">
                            <p className="text-sm text-text-body whitespace-pre-wrap">{generatedContent}</p>
                        </div>
                        <button onClick={handleCopy} className={`w-full flex items-center justify-center mt-4 py-2 px-4 font-semibold rounded-lg transition-colors ${copied ? 'bg-success/20 text-success' : 'bg-surface hover:bg-border'}`}>
                            {copied ? <><IconCheck className="mr-2"/> Copiado!</> : <><IconCopy className="mr-2"/> Copiar Texto</>}
                        </button>
                    </div>
                )}
                {!isLoading && !error && !generatedContent && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-text-soft">
                        <p>Preencha o formulário ao lado para criar seu conteúdo de marketing personalizado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Tab 2: Ready-made Models Content ---

const MarketingModelCard: React.FC<{ model: typeof MOCK_MARKETING_MODELS[0] }> = ({ model }) => {
    const [copied, setCopied] = useState(false);

    const processText = (text: string) => {
        return text
            .replace(/{{link_cadastro}}/g, USER_REFERRAL_LINKS.cadastro)
            .replace(/{{link_loja}}/g, USER_REFERRAL_LINKS.loja)
            .replace(/{{link_produtos}}/g, USER_REFERRAL_LINKS.produtos);
    };

    const personalizedText = processText(model.contentText);

    const handleCopy = () => {
        navigator.clipboard.writeText(personalizedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                    className={`w-full flex items-center justify-center text-center py-2 px-4 font-semibold rounded-lg transition-colors duration-200 ${
                        copied
                        ? 'bg-success/20 text-success border border-success'
                        : 'bg-gold text-card hover:bg-gold-hover'
                    }`}
                >
                    {copied ? (
                        <>
                            <IconCheck className="w-5 h-5 mr-2" />
                            Copiado!
                        </>
                    ) : (
                        <>
                            <IconCopy className="w-5 h-5 mr-2" />
                            Copiar Texto
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const ReadyModels: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {MOCK_MARKETING_MODELS.map(model => (
                <MarketingModelCard key={model.id} model={model} />
            ))}
        </div>
    );
};


// --- Main Hub Component ---

const MarketingHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState('ia_generator');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-title">Central de Marketing</h1>
                <p className="text-text-body mt-1">Use estas ferramentas para divulgar em suas redes sociais e contatos.</p>
            </div>
            
            <div className="border-b border-border">
                <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
                    <TabButton label="Gerador com IA" active={activeTab === 'ia_generator'} onClick={() => setActiveTab('ia_generator')} />
                    <TabButton label="Modelos Prontos" active={activeTab === 'models'} onClick={() => setActiveTab('models')} />
                </nav>
            </div>
            
            <div className="mt-6">
                {activeTab === 'ia_generator' && <AIGenerator />}
                {activeTab === 'models' && <ReadyModels />}
            </div>
        </div>
    );
};

export default MarketingHub;
