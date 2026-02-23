import React, { useState, ChangeEvent, useRef, FC, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import {
    IconImage, IconMessage, IconSparkles,
    IconDashboard, IconAdjustments, IconEdit, IconCopy,
    IconTrash, IconPlus, IconUpload, IconChevronLeft, IconActive,
    IconDownload, IconRepeat, IconMinus, IconMaximize, IconMinimize,
    IconSend, IconX, IconBot, IconHelpCircle, IconWhatsapp, IconFacebook,
    IconTwitter, IconLinkedin, IconPinterest, IconSave, IconTikTok,
} from '../components/icons';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useUser } from './ConsultantLayout';
import { useLayout } from '../App';
import type { AppState, MediaResult, AspectRatio, MediaSubTool, Creation, SocialPlatform, Workflow, WorkflowNode } from '../types';

import MaskEditor from './studio/MaskEditor';
import ImageEditorWorkspace from './studio/ImageEditorWorkspace';
import MyCreationsView from './studio/MyCreationsView';
import AutomationsView from './studio/AutomationsView';
import WorkflowBuilder from './studio/WorkflowBuilder';


// --- Helper for UUID ---
const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

// --- Constants ---
const MODELS = {
    IMAGE_GEN: 'imagen-4.0-generate-001',
    IMAGE_EDIT: 'gemini-2.5-flash-image',
    VIDEO_GEN: 'veo-3.1-fast-generate-preview',
    TEXT: 'gemini-2.5-flash',
};
const ASPECT_RATIOS: { name: AspectRatio; w: number; h: number }[] = [{ name: '1:1', w: 1, h: 1 }, { name: '16:9', w: 16, h: 9 }, { name: '9:16', w: 9, h: 16 }, { name: '4:3', w: 4, h: 3 }, { name: '3:4', w: 3, h: 4 },];
const VIDEO_GENERATION_MESSAGES = ["Inicializando a síntese de vídeo...", "Aquecendo os motores de renderização...", "Aguardando o resultado inicial...", "Analisando a semântica do prompt...", "Construindo os quadros temporais...", "Verificando o status da operação...", "Aplicando efeitos visuais...", "Renderizando canais de áudio (se houver)...", "Aguardando a composição final...", "Quase lá, finalizando o vídeo...", "Unindo as cenas...", "Finalizando o fluxo de vídeo...",];
const INITIAL_APP_STATE: AppState = { prompt: '', negativePrompt: '', aspectRatio: '1:1', baseImage: null, baseImageMimeType: null, maskImage: null, maskImageMimeType: null, blendImage: null, blendImageMimeType: null, mediaSubTool: 'Image', };

// --- Gemini Service ---
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });


// --- Service Functions ---

const generateImageService = async (state: AppState): Promise<MediaResult> => {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: MODELS.IMAGE_GEN,
        prompt: state.prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: state.aspectRatio,
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    const mimeType = 'image/jpeg';
    const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;

    return {
        type: 'image',
        url: imageUrl,
        text: state.prompt,
        base64: base64ImageBytes,
        mimeType: mimeType,
    };
};

const editImageService = async (state: AppState): Promise<MediaResult> => {
    if (!state.baseImage || !state.baseImageMimeType) {
        throw new Error("Base image is required for editing.");
    }
    const ai = getAiClient();
    const parts: any[] = [
        {
            inlineData: {
                data: state.baseImage,
                mimeType: state.baseImageMimeType,
            },
        },
    ];

    if (state.maskImage && state.maskImageMimeType) {
        parts.push({
            inlineData: {
                data: state.maskImage,
                mimeType: state.maskImageMimeType,
            },
        });
    }

    parts.push({ text: state.prompt });

    const response = await ai.models.generateContent({
        model: MODELS.IMAGE_EDIT,
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;

            return {
                type: 'image',
                url: imageUrl,
                text: state.prompt,
                base64: base64ImageBytes,
                mimeType: mimeType,
            };
        }
    }
    throw new Error("Image generation failed, no image data in response.");
};

const generateVideoService = async (state: AppState) => {
    const ai = getAiClient();
    const payload: any = {
        model: MODELS.VIDEO_GEN,
        prompt: state.prompt,
        config: {
            numberOfVideos: 1,
            aspectRatio: state.aspectRatio,
            resolution: '720p',
        }
    };
    if (state.baseImage && state.baseImageMimeType) {
        payload.image = {
            imageBytes: state.baseImage,
            mimeType: state.baseImageMimeType,
        };
    }

    const operation = await ai.models.generateVideos(payload);
    return operation;
};

const pollVideoStatusService = async (operation: any) => {
    const ai = getAiClient();
    return await ai.operations.getVideosOperation({ operation: operation });
};

const fetchVideoService = async (uri: string): Promise<MediaResult> => {
    const response = await fetch(`${uri}&key=${process.env.API_KEY as string}`);
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1];
            resolve({
                type: 'video',
                url: URL.createObjectURL(blob),
                text: '',
                base64: base64data,
                mimeType: blob.type,
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const removeBackgroundService = async (base64Image: string, mimeType: string): Promise<MediaResult> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: MODELS.IMAGE_EDIT,
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: "remove the background, make it transparent" }
            ]
        },
        config: { responseModalities: [Modality.IMAGE] }
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64 = part.inlineData.data;
            const newMimeType = part.inlineData.mimeType;
            return {
                type: 'image',
                url: `data:${newMimeType};base64,${base64}`,
                text: 'background removed',
                base64: base64,
                mimeType: newMimeType,
            };
        }
    }
    throw new Error("Background removal failed.");
};

const enhanceImageService = async (base64Image: string, mimeType: string): Promise<MediaResult> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: MODELS.IMAGE_EDIT,
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: "enhance this image to high definition, improve quality, resolution, lighting, and details to make it look professional and photorealistic" }
            ]
        },
        config: { responseModalities: [Modality.IMAGE] }
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64 = part.inlineData.data;
            const newMimeType = part.inlineData.mimeType;
            return {
                type: 'image',
                url: `data:${newMimeType};base64,${base64}`,
                text: 'image enhanced',
                base64: base64,
                mimeType: newMimeType,
            };
        }
    }
    throw new Error("Image enhancement failed.");
};

// #region Estrategista de Conteúdo
interface ContentStrategistProps {
    imageForStrategy: MediaResult | null;
    clearImageForStrategy: () => void;
    onUsePrompt: (prompt: string) => void;
}

const ContentStrategistView: React.FC<ContentStrategistProps> = ({ imageForStrategy, clearImageForStrategy, onUsePrompt }) => {
    const { user } = useUser();
    const [image, setImage] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [objective, setObjective] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [visualStyle, setVisualStyle] = useState('Fotorealista');
    const [tone, setTone] = useState('Profissional');
    const [suggestions, setSuggestions] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (imageForStrategy) {
            setImageBase64(imageForStrategy.base64);
            // Convert base64 to File object if needed, or just use the base64
            clearImageForStrategy();
        }
    }, [imageForStrategy, clearImageForStrategy]);


    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64((reader.result as string).split(',')[1]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!objective.trim() && !imageBase64) {
            setError('Por favor, defina um objetivo ou envie uma imagem.');
            return;
        }
        setError('');
        setIsLoading(true);
        setSuggestions(null);

        try {
            const ai = getAiClient();
            const systemInstruction = `Você é um Diretor de Criação e Marketing de uma agência de publicidade de elite, especializado em marketing de rede e produtos de bem-estar para a marca RS Prólipsi.
            Sua tarefa é criar 3 conceitos de campanha completos para posts em redes sociais (Instagram, Facebook). Cada conceito deve ser magnético, profissional e altamente persuasivo, projetado para atingir um objetivo de marketing específico.
            
            INPUT DO USUÁRIO:
            - Meta de Marketing: ${objective}
            - Público-Alvo: ${targetAudience}
            - Imagem de Referência: ${imageBase64 ? 'Fornecida' : 'Não fornecida'}
            - Estilo Visual Desejado: ${visualStyle}
            - Tom da Comunicação: ${tone}
            
            SUA MISSÃO:
            1.  Analise a meta e o público. Se uma imagem for fornecida, use-a como INSPIRAÇÃO, não como uma descrição literal. Extraia o conceito, o produto ou a emoção. Se não houver imagem, crie o conceito do zero com base na meta.
            2.  Crie 3 conceitos de campanha distintos. Cada um DEVE seguir a estrutura JSON abaixo.
            3.  **Título Magnético:** Crie um título curto e de alto impacto que prenda a atenção imediatamente. Use emojis relevantes.
            4.  **Copy Persuasiva:** Escreva o corpo do post. Deve ser inspirador, focado nos benefícios e na transformação que a RS Prólipsi oferece (saúde, prosperidade, comunidade). Termine com uma chamada para ação sutil que direcione para o CTA final. Inclua hashtags estratégicas e relevantes. A copy deve ser formatada para leitura fácil em redes sociais.
            5.  **Prompt de Imagem (Diretor de Arte):** Crie um prompt para gerar uma imagem de IA (para a ferramenta Mídia IA). Seja EXTREMAMENTE detalhado, como um diretor de arte. Descreva a composição, o enquadramento, a iluminação, as cores, a atmosfera e os elementos da cena. O prompt deve refletir o Estilo Visual (${visualStyle}) e o Tom (${tone}) solicitados. Especifique o posicionamento de elementos-chave nos cantos da imagem se o prompt do usuário der a entender isso. Por exemplo: "um troféu de ouro no canto superior direito", "ícones de telefone e dinheiro no canto superior esquerdo". O prompt deve ser em português, mas otimizado para gerar imagens cinematográficas e profissionais.
            6.  **Sugestão de CTA (Call to Action):** Crie uma chamada para ação (CTA) magnética e pessoal que convide à interação. A CTA deve ser criativa e variar entre os 3 conceitos. Evite frases genéricas. Inspire-se em diferentes abordagens: despertar curiosidade, focar em um benefício, convidar para a comunidade ou fazer uma pergunta. **IMPORTANTE:** Use os placeholders {{WHATSAPP}} e {{LINK_CADASTRO}} onde for apropriado. O sistema substituirá esses placeholders pelos dados reais do consultor. Exemplo: "Quer saber como? Me chame no WhatsApp {{WHATSAPP}}" ou "Comece sua jornada de sucesso: {{LINK_CADASTRO}}".
            
            O JSON de saída DEVE ser um array de 3 objetos, cada um com as chaves: "titulo", "copy", "prompt_imagem", "cta".`;

            const contents = imageBase64
                ? { parts: [{ inlineData: { mimeType: image?.type || 'image/jpeg', data: imageBase64 } }, { text: `Meta: ${objective}, Público: ${targetAudience}` }] }
                : `Meta: ${objective}, Público: ${targetAudience}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contents,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                titulo: { type: Type.STRING },
                                copy: { type: Type.STRING },
                                prompt_imagem: { type: Type.STRING },
                                cta: { type: Type.STRING },
                            },
                        },
                    },
                },
            });

            const jsonStr = response.text.trim();
            let parsedSuggestions = JSON.parse(jsonStr);

            // Fetch and shorten URL
            const longUrl = user.linkIndicacao || 'https://rsprolipsi.com/register/default';
            const shortenerApiKey = process.env.API_KEY; // Using the same Gemini key for this service
            const shortenerUrl = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${shortenerApiKey}`;
            let shortUrl = longUrl;
            try {
                const shortenerResponse = await fetch(shortenerUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ longDynamicLink: `${longUrl}&utm_source=rsia&utm_medium=social` }),
                });
                if (shortenerResponse.ok) {
                    const shortenerData = await shortenerResponse.json();
                    shortUrl = shortenerData.shortLink || longUrl;
                }
            } catch (e) {
                console.error("Error shortening link, using long URL", e);
            }

            // Replace placeholders
            parsedSuggestions = parsedSuggestions.map((suggestion: any) => ({
                ...suggestion,
                copy: suggestion.copy.replace(/{{WHATSAPP}}/g, user.whatsapp).replace(/{{LINK_CADASTRO}}/g, shortUrl),
                cta: suggestion.cta.replace(/{{WHATSAPP}}/g, user.whatsapp).replace(/{{LINK_CADASTRO}}/g, shortUrl),
            }));

            setSuggestions(parsedSuggestions);

        } catch (e) {
            console.error(e);
            setError('Ocorreu um erro ao gerar as sugestões. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'linkedin', text: string) => {
        const encodedText = encodeURIComponent(text);
        let url = '';
        switch (platform) {
            case 'whatsapp':
                url = `https://api.whatsapp.com/send?text=${encodedText}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=https://rsprolipsi.com/&quote=${encodedText}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodedText}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/shareArticle?mini=true&url=https://rsprolipsi.com/&title=Oportunidade%20RS%20Prólipsi&summary=${encodedText}`;
                break;
        }
        window.open(url, '_blank');
        alert("Texto da publicação copiado! Lembre-se de anexar sua imagem manualmente.");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copiado para a área de transferência!');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            <Card className="space-y-6">
                <h2 className="text-xl font-bold text-white">1. Ponto de Partida</h2>
                <div>
                    <label className="block text-sm font-medium text-brand-text-dim mb-2">Imagem de Referência (Opcional)</label>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                    {imageBase64 ? (
                        <div className="relative group">
                            <img src={`data:image/jpeg;base64,${imageBase64}`} alt="Referência" className="rounded-md w-full h-auto max-h-60 object-cover" />
                            <button onClick={() => { setImage(null); setImageBase64(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 bg-red-600/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><IconX size={16} /></button>
                        </div>
                    ) : (
                        <button onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-brand-gray-light rounded-md flex flex-col items-center justify-center text-brand-text-dim hover:border-brand-gold hover:text-brand-gold transition-colors">
                            <IconUpload size={24} />
                            <span className="mt-2 text-sm">Enviar Imagem</span>
                        </button>
                    )}
                </div>
                <h2 className="text-xl font-bold text-white pt-4 border-t border-brand-gray-light">2. Direção Criativa</h2>
                <div>
                    <label className="block text-sm font-medium text-brand-text-dim mb-2">Meta de Marketing</label>
                    <select className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light" value={objective} onChange={e => setObjective(e.target.value)}>
                        <option value="">Selecione um objetivo...</option>
                        <option value="Gerar desejo por um produto específico">Gerar desejo por um produto</option>
                        <option value="Recrutar novos consultores para a rede">Recrutar novos consultores</option>
                        <option value="Celebrar uma conquista de PIN">Celebrar uma conquista de PIN</option>
                        <option value="Promover um estilo de vida saudável e próspero">Promover estilo de vida</option>
                        <option value="Criar um post motivacional para a equipe">Post motivacional</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text-dim mb-2">Público-Alvo</label>
                    <input type="text" placeholder="Ex: Mulheres de 30-50 anos, empreendedores" className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-text-dim mb-2">Estilo Visual</label>
                        <select className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light" value={visualStyle} onChange={e => setVisualStyle(e.target.value)}>
                            <option>Fotorealista</option>
                            <option>Cinematográfico</option>
                            <option>Minimalista</option>
                            <option>Arte Conceitual</option>
                            <option>Ilustração Digital</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-dim mb-2">Tom/Atmosfera</label>
                        <select className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light" value={tone} onChange={e => setTone(e.target.value)}>
                            <option>Profissional</option>
                            <option>Inspirador</option>
                            <option>Acolhedor</option>
                            <option>Energético</option>
                            <option>Exclusivo</option>
                        </select>
                    </div>
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 disabled:bg-gray-500 flex items-center justify-center">
                    {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-dark"></div> : 'Gerar Campanhas'}
                </button>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </Card>
            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Sugestões Estratégicas da RSIA</h2>
                {isLoading && <p className="text-center text-brand-text-dim">RSIA está criando as melhores estratégias para você...</p>}
                {suggestions ? (
                    <div className="space-y-6">
                        {suggestions.map((s, i) => (
                            <div key={i} className="p-4 bg-brand-gray-light rounded-lg space-y-3">
                                <h3 className="font-bold text-brand-gold">{s.titulo}</h3>
                                <p className="text-sm whitespace-pre-wrap">{s.copy}</p>
                                <div className="p-3 bg-brand-dark rounded-md">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase">PROMPT PARA IMAGEM IA:</h4>
                                    <p className="text-sm italic font-mono mt-1">{s.prompt_imagem}</p>
                                    <button onClick={() => onUsePrompt(s.prompt_imagem)} className="text-xs mt-2 bg-brand-gray px-3 py-1 rounded hover:bg-brand-dark font-semibold text-brand-gold">Usar este Prompt</button>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase">SUGESTÃO DE CTA:</h4>
                                    <p className="text-sm font-bold text-white">{s.cta}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-gray">
                                    <span className="text-xs text-gray-400 font-semibold">Publicar:</span>
                                    <button onClick={() => handleShare('whatsapp', `${s.titulo}\n\n${s.copy}`)} title="WhatsApp" className="p-2 rounded-full hover:bg-green-500/20"><IconWhatsapp className="text-green-400" /></button>
                                    <button onClick={() => handleShare('facebook', `${s.titulo}\n\n${s.copy}`)} title="Facebook" className="p-2 rounded-full hover:bg-blue-600/20"><IconFacebook className="text-blue-500" /></button>
                                    <button onClick={() => handleShare('twitter', `${s.titulo}\n\n${s.copy}`)} title="X / Twitter" className="p-2 rounded-full hover:bg-gray-400/20"><IconTwitter className="text-gray-300" /></button>
                                    <button onClick={() => handleShare('linkedin', `${s.titulo}\n\n${s.copy}`)} title="LinkedIn" className="p-2 rounded-full hover:bg-blue-500/20"><IconLinkedin className="text-blue-400" /></button>
                                    <button onClick={() => copyToClipboard(`${s.titulo}\n\n${s.copy}`)} title="Copiar Texto" className="p-2 rounded-full hover:bg-gray-400/20"><IconCopy className="text-gray-300" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !isLoading && (
                    <p className="text-center text-brand-text-dim pt-10">As sugestões de copy e prompts da RSIA aparecerão aqui.</p>
                )}
            </Card>
        </div>
    );
};
// #endregion

// #region Mídia IA

interface MediaStudioProps {
    setImageForStrategy: (image: MediaResult) => void;
    setActiveView: (view: any) => void;
    onSaveCreation: (creation: Creation) => void;
    initialPrompt?: string;
}

const MediaStudioView: React.FC<MediaStudioProps> = ({ setImageForStrategy, setActiveView, onSaveCreation, initialPrompt }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Gerando...');
    const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);
    const [mediaResult, setMediaResult] = useState<MediaResult | null>(null);
    const [isMasking, setIsMasking] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const aspectRatio = ASPECT_RATIOS.find(r => r.name === appState.aspectRatio) || { w: 1, h: 1 };

    useEffect(() => {
        if (initialPrompt) {
            handleStateChange('prompt', initialPrompt);
        }
    }, [initialPrompt]);

    const handleStateChange = <K extends keyof AppState>(key: K, value: AppState[K]) => setAppState(p => ({ ...p, [key]: value }));
    const clearAll = () => { setAppState(INITIAL_APP_STATE); setMediaResult(null); setIsMasking(false); setIsEditing(false); };

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        try {
            let result: MediaResult;
            if (appState.mediaSubTool === 'Image') {
                setLoadingMessage('Criando imagem...');
                result = appState.baseImage ? await editImageService(appState) : await generateImageService(appState);
            } else {
                // @ts-ignore - aistudio is globally available
                if (window.aistudio?.hasSelectedApiKey && !(await window.aistudio.hasSelectedApiKey())) {
                    alert("Para gerar vídeos com o Veo, é necessário selecionar uma chave de API com faturamento ativado. Saiba mais em ai.google.dev/gemini-api/docs/billing.");
                    // @ts-ignore
                    await window.aistudio.openSelectKey();
                }
                setLoadingMessage('Iniciando geração de vídeo...');
                let op = await generateVideoService(appState);
                let pollCount = 0;
                while (!op.done) {
                    await new Promise(r => setTimeout(r, 10000));
                    setLoadingMessage(VIDEO_GENERATION_MESSAGES[pollCount % VIDEO_GENERATION_MESSAGES.length]);
                    op = await pollVideoStatusService(op);
                    pollCount++;
                }
                const uri = op.response?.generatedVideos?.[0]?.video?.uri;
                if (!uri) throw new Error("A geração de vídeo falhou.");
                setLoadingMessage("Baixando vídeo...");
                result = await fetchVideoService(uri);
            }
            setMediaResult(result);
        } catch (e) {
            let msg = e instanceof Error ? e.message : 'Erro desconhecido';
            if (appState.mediaSubTool === 'Video' && msg.includes("Requested entity was not found")) {
                msg = "Chave de API inválida. Tente gerar novamente para selecionar uma nova chave.";
            }
            alert(`Ocorreu um erro: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    }, [appState]);

    const handleApplyMask = (maskBase64: string) => {
        handleStateChange('maskImage', maskBase64);
        handleStateChange('maskImageMimeType', 'image/png');
        setIsMasking(false);
    };

    const handleUseAsBase = () => { if (mediaResult?.type === 'image') { setAppState({ ...INITIAL_APP_STATE, baseImage: mediaResult.base64, baseImageMimeType: mediaResult.mimeType }); setMediaResult(null); } };
    const handleSaveFromWorkspace = (imageBase64: string, mimeType: string) => {
        handleStateChange('baseImage', imageBase64);
        handleStateChange('baseImageMimeType', mimeType);
        setMediaResult({ type: 'image', url: `data:${mimeType};base64,${imageBase64}`, text: 'Edited image', base64: imageBase64, mimeType });
        setIsEditing(false);
    };

    const handleCreatePost = () => {
        if (mediaResult) {
            setImageForStrategy(mediaResult);
            setActiveView('estrategista');
            setMediaResult(null); // Clear media from this view
        }
    };

    const handleDownload = () => {
        if (!mediaResult) return;
        const link = document.createElement('a');
        link.href = mediaResult.url;
        const fileExtension = mediaResult.mimeType.split('/')[1];
        link.download = `rs-studio-creation-${Date.now()}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveToGallery = () => {
        if (mediaResult) {
            const newCreation: Creation = {
                id: uuidv4(),
                prompt: appState.prompt,
                mediaResult,
                createdAt: new Date().toISOString(),
                appState: { ...appState },
            };
            onSaveCreation(newCreation);
            alert("Salvo em 'Minhas Criações'!");
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleStateChange('baseImage', (reader.result as string).split(',')[1]);
                handleStateChange('baseImageMimeType', file.type);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearBaseImage = () => {
        handleStateChange('baseImage', null);
        handleStateChange('baseImageMimeType', null);
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] animate-fade-in gap-4">
                <Card className="w-full lg:w-96 flex-shrink-0 flex flex-col space-y-4 overflow-y-auto">
                    <div className="flex bg-brand-gray-light p-1 rounded-lg">
                        <button onClick={() => handleStateChange('mediaSubTool', 'Image')} className={`w-1/2 py-2 rounded-md font-semibold text-sm ${appState.mediaSubTool === 'Image' ? 'bg-brand-gray text-white shadow-inner' : 'text-brand-text-dim'}`}>Imagem</button>
                        <button onClick={() => handleStateChange('mediaSubTool', 'Video')} className={`w-1/2 py-2 rounded-md font-semibold text-sm ${appState.mediaSubTool === 'Video' ? 'bg-brand-gray text-white shadow-inner' : 'text-brand-text-dim'}`}>Vídeo</button>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-brand-text-dim mb-1 block">Prompt</label>
                        <textarea
                            rows={4}
                            value={appState.prompt}
                            onChange={(e) => handleStateChange('prompt', e.target.value)}
                            placeholder={appState.mediaSubTool === 'Image' ? 'Ex: um gato astronauta em um fundo roxo...' : 'Ex: um carro voando sobre uma cidade futurista...'}
                            className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light"
                        />
                    </div>

                    {appState.mediaSubTool === 'Image' && (
                        <div>
                            <label className="text-sm font-medium text-brand-text-dim mb-1 block">Prompt Negativo (Opcional)</label>
                            <input
                                type="text"
                                value={appState.negativePrompt}
                                onChange={(e) => handleStateChange('negativePrompt', e.target.value)}
                                placeholder="Ex: texto, marca d'água..."
                                className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-brand-text-dim mb-1 block">Proporção</label>
                        <div className="grid grid-cols-5 gap-2">
                            {ASPECT_RATIOS.map(ratio => (
                                <button key={ratio.name} onClick={() => handleStateChange('aspectRatio', ratio.name)} className={`py-2 rounded-md text-sm font-semibold border-2 ${appState.aspectRatio === ratio.name ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' : 'border-brand-gray-light text-brand-text-dim'}`}>
                                    {ratio.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-brand-text-dim mb-1 block">Imagem Base (Opcional)</label>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        {appState.baseImage ? (
                            <div className="relative group">
                                <img src={`data:${appState.baseImageMimeType};base64,${appState.baseImage}`} alt="Base" className="w-full h-auto rounded-md" />
                                <button onClick={handleClearBaseImage} className="absolute top-1 right-1 bg-red-600/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><IconX size={14} /></button>
                            </div>
                        ) : (
                            <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-brand-gray-light rounded-md flex flex-col items-center justify-center text-brand-text-dim hover:text-brand-gold">
                                <IconUpload size={24} />
                                <span className="text-sm mt-1">Enviar Imagem</span>
                            </button>
                        )}
                    </div>

                    {appState.baseImage && appState.mediaSubTool === 'Image' && (
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setIsMasking(true)} className="py-2 bg-brand-gray-light rounded-md text-sm font-semibold hover:bg-brand-gray">Criar Máscara</button>
                            <button onClick={() => setIsEditing(true)} className="py-2 bg-brand-gray-light rounded-md text-sm font-semibold hover:bg-brand-gray">Editar Imagem</button>
                        </div>
                    )}

                    <div className="mt-auto pt-4 space-y-2">
                        <button onClick={handleGenerate} disabled={isLoading || !appState.prompt} className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                            <IconSparkles size={20} />
                            {isLoading ? loadingMessage : `Gerar ${appState.mediaSubTool === 'Image' ? 'Imagem' : 'Vídeo'}`}
                        </button>
                        <button onClick={clearAll} className="w-full bg-brand-gray-light text-white font-semibold py-2 rounded-lg">Limpar Tudo</button>
                    </div>
                </Card>
                <div className="flex-grow bg-brand-gray rounded-lg flex items-center justify-center p-4 relative">
                    {isLoading ? (
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-gold mx-auto"></div>
                            <p className="mt-4 text-white font-semibold">{loadingMessage}</p>
                        </div>
                    ) : mediaResult ? (
                        <div className="relative w-full h-full group flex items-center justify-center">
                            <div style={{ aspectRatio: `${aspectRatio.w} / ${aspectRatio.h}`, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {mediaResult.type === 'video' ? (
                                    <video src={mediaResult.url} controls className="object-contain w-full h-full" />
                                ) : (
                                    <img src={mediaResult.url} alt="Mídia Gerada" className="object-contain w-full h-full" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 flex-wrap p-2">
                                    <button onClick={handleDownload} className="flex items-center gap-2 bg-slate-700/80 text-white font-semibold py-2 px-4 rounded-md"><IconDownload size={16} /> Baixar</button>
                                    <button onClick={handleSaveToGallery} className="flex items-center gap-2 bg-slate-700/80 text-white font-semibold py-2 px-4 rounded-md"><IconSave size={16} /> Salvar na Galeria</button>
                                    {mediaResult.type === 'image' && <button onClick={handleUseAsBase} className="flex items-center gap-2 bg-slate-700/80 text-white font-semibold py-2 px-4 rounded-md"><IconEdit size={16} /> Usar como Base</button>}
                                    {mediaResult.type === 'image' && <button onClick={handleCreatePost} className="flex items-center gap-2 bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-md"><IconSparkles size={16} /> Criar Publicação</button>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="w-full h-full flex flex-col items-center justify-center text-center text-brand-text-dim p-8 border-2 border-dashed border-brand-gray-light rounded-lg"
                            style={{ aspectRatio: `${aspectRatio.w} / ${aspectRatio.h}` }}
                        >
                            <IconImage className="w-24 h-24 mx-auto text-brand-gray-light" />
                            <h3 className="mt-4 text-xl font-bold text-white">Sua criação aparecerá aqui</h3>
                            <p>Descreva sua visão para criar ou envie uma imagem para editar.</p>
                        </div>
                    )}
                </div>
            </div>
            {isMasking && appState.baseImage && (
                <MaskEditor
                    imageUrl={`data:${appState.baseImageMimeType};base64,${appState.baseImage}`}
                    onApply={handleApplyMask}
                    onClose={() => setIsMasking(false)}
                />
            )}
            {isEditing && appState.baseImage && (
                <ImageEditorWorkspace
                    imageUrl={`data:${appState.baseImageMimeType};base64,${appState.baseImage}`}
                    onSave={handleSaveFromWorkspace}
                    onCancel={() => setIsEditing(false)}
                    aiEnhance={enhanceImageService}
                    aiRemoveBg={removeBackgroundService}
                />
            )}
        </>
    );
};
// #endregion

// #region Social Post Composer
const platformIcons: { [key in SocialPlatform]: React.ElementType } = {
    Instagram: IconFacebook, // Using facebook for instagram
    Facebook: IconFacebook,
    X: IconTwitter,
    TikTok: IconTikTok,
    LinkedIn: IconLinkedin,
};

const SocialPostComposerView: FC<{ creations: Creation[] }> = ({ creations }) => {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Profissional');
    const [platform, setPlatform] = useState<SocialPlatform>('Instagram');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<MediaResult | null>(null);
    const [isPickerOpen, setPickerOpen] = useState(false);
    const { user } = useUser();

    const handleGenerate = async () => {
        if (!topic) {
            alert('Por favor, defina um tópico para o post.');
            return;
        }
        setIsLoading(true);
        setGeneratedText('');
        try {
            const ai = getAiClient();
            const prompt = `Crie uma legenda para um post na rede social '${platform}'.
            Tópico: ${topic}.
            Tom de voz: ${tone}.
            Inclua emojis relevantes e de 3 a 5 hashtags estratégicas.
            A legenda deve ser otimizada para engajamento.
            O consultor que está postando se chama ${user.name}.
            ${selectedImage ? 'A legenda deve ser inspirada ou descrever a imagem anexada.' : ''}
            `;
            const contents = selectedImage
                ? { parts: [{ inlineData: { mimeType: selectedImage.mimeType, data: selectedImage.base64 } }, { text: prompt }] }
                : prompt;

            const response = await ai.models.generateContent({
                model: MODELS.TEXT,
                contents,
            });
            setGeneratedText(response.text);
        } catch (error) {
            alert('Ocorreu um erro ao gerar o post. Tente novamente.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            <Card className="space-y-6">
                <h2 className="text-xl font-bold text-white">1. Defina seu Post</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Plataforma</label>
                        <select value={platform} onChange={e => setPlatform(e.target.value as SocialPlatform)} className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light">
                            {Object.keys(platformIcons).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Tom de Voz</label>
                        <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light">
                            <option>Profissional</option><option>Inspirador</option><option>Divertido</option><option>Informativo</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-sm text-gray-400 block mb-1">Sobre o que é o post?</label>
                    <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3} placeholder="Ex: Um novo produto para cuidados com a pele, uma dica de motivação, etc." className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray-light" />
                </div>
                <div>
                    <label className="text-sm text-gray-400 block mb-1">Imagem (Opcional)</label>
                    {selectedImage ? (
                        <div className="relative group aspect-square">
                            <img src={selectedImage.url} className="w-full h-full object-cover rounded-md" />
                            <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100"><IconX size={14} /></button>
                        </div>
                    ) : (
                        <button onClick={() => setPickerOpen(true)} className="w-full h-32 border-2 border-dashed border-brand-gray-light rounded-md flex items-center justify-center text-gray-400 hover:border-brand-gold">
                            <IconImage size={24} /> <span className="ml-2">Escolher da Galeria</span>
                        </button>
                    )}
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                    {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-dark"></div> : <><IconSparkles size={16} /> Gerar Legenda</>}
                </button>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Resultado</h2>
                {isLoading ? (
                    <p className="text-center text-gray-400">Gerando legenda com a RSIA...</p>
                ) : generatedText ? (
                    <div className="p-4 bg-brand-gray-light rounded-lg space-y-4">
                        <textarea value={generatedText} onChange={e => setGeneratedText(e.target.value)} rows={10} className="w-full bg-brand-dark p-2 rounded-md border border-brand-gray" />
                        <button onClick={() => navigator.clipboard.writeText(generatedText)} className="w-full bg-brand-gray font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-dark"><IconCopy /> Copiar Texto</button>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 pt-10">Sua legenda gerada por IA aparecerá aqui.</p>
                )}
            </Card>
            <Modal isOpen={isPickerOpen} onClose={() => setPickerOpen(false)} title="Escolher Imagem da Galeria">
                <div className="grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
                    {creations.filter(c => c.mediaResult.type === 'image').map(c => (
                        <img key={c.id} src={c.mediaResult.url} onClick={() => { setSelectedImage(c.mediaResult); setPickerOpen(false); }} className="w-full aspect-square object-cover rounded-md cursor-pointer hover:opacity-75" />
                    ))}
                </div>
            </Modal>
        </div>
    );
};
// #endregion

// --- Main Studio Component ---
const Studio: React.FC = () => {
    type StudioView = 'estrategista' | 'media-ia' | 'automacoes' | 'social' | 'minhas-criacoes' | 'workflow-builder';
    const [activeView, setActiveView] = useState<StudioView>('automacoes');
    const { user } = useUser();
    const { setLayoutMode } = useLayout();

    // State lifted from children to parent
    const [creations, setCreations] = useState<Creation[]>([]);
    const [imageForStrategy, setImageForStrategy] = useState<MediaResult | null>(null);
    const [promptForMedia, setPromptForMedia] = useState<string | undefined>(undefined);
    const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);

    // Effect to control full-screen layout mode for workflow builder
    useEffect(() => {
        if (activeView === 'workflow-builder') {
            setLayoutMode('focus');
        } else {
            setLayoutMode('default');
        }
        // Cleanup to reset layout mode when component unmounts or view changes
        return () => setLayoutMode('default');
    }, [activeView, setLayoutMode]);

    // Load from localStorage on initial render
    useEffect(() => {
        try {
            const savedCreations = localStorage.getItem('rs_studio_creations');
            if (savedCreations) setCreations(JSON.parse(savedCreations));
        } catch (error) {
            console.error("Failed to load from localStorage:", error);
        }
    }, []);

    const updateCreations = (newCreations: Creation[]) => {
        setCreations(newCreations);
        localStorage.setItem('rs_studio_creations', JSON.stringify(newCreations));
    };

    const handleSaveCreation = (creation: Creation) => {
        updateCreations([creation, ...creations]);
    };

    const handleDeleteCreation = (creationId: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta criação?")) {
            updateCreations(creations.filter(c => c.id !== creationId));
        }
    };

    const handleUsePromptFromStrategist = (prompt: string) => {
        setPromptForMedia(prompt);
        setActiveView('media-ia');
        setTimeout(() => setPromptForMedia(undefined), 100);
    };

    const processWorkflow = (workflow: Workflow): Workflow => {
        // Deep copy to avoid mutating templates
        const processedWorkflow = JSON.parse(JSON.stringify(workflow));

        processedWorkflow.nodes.forEach((node: WorkflowNode) => {
            node.parameters.forEach(param => {
                if (typeof param.value === 'string' && param.value.includes('{{USER_WHATSAPP}}')) {
                    param.value = param.value.replace('{{USER_WHATSAPP}}', user.whatsapp);
                }
            });
        });

        return processedWorkflow;
    };

    const handleSelectWorkflow = (workflow: Workflow) => {
        const processed = processWorkflow(workflow);
        setActiveWorkflow(processed);
        setActiveView('workflow-builder');
    };

    const handleCreateNewWorkflow = () => {
        const startNode: WorkflowNode = {
            id: 'start-node-new',
            type: 'start',
            label: 'Início',
            position: { x: 50, y: 150 },
            parameters: [
                { name: 'trigger', label: 'Gatilho', type: 'readonly', value: 'O ponto de partida da sua automação.', description: 'Clique no + para adicionar um gatilho.' }
            ]
        };
        const newWorkflow: Workflow = {
            id: `wf-${Date.now()}`,
            name: 'Novo Fluxo de Trabalho',
            description: 'Um novo fluxo de trabalho pronto para ser configurado.',
            nodes: [startNode],
            edges: [],
            isActive: false,
        };
        setActiveWorkflow(newWorkflow);
        setActiveView('workflow-builder');
    };

    const handleCloseWorkflow = () => {
        setActiveWorkflow(null);
        setActiveView('automacoes');
    };

    const NavButton: React.FC<{ view: StudioView; label: string; icon: React.ElementType }> = ({ view, label, icon: Icon }) => (
        <button onClick={() => setActiveView(view)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${activeView === view ? 'bg-brand-gray-light text-white' : 'text-brand-text-dim hover:bg-brand-gray-light'}`}>
            <Icon className="w-5 h-5" /> <span>{label}</span>
        </button>
    );

    const renderView = () => {
        switch (activeView) {
            case 'estrategista': return <ContentStrategistView imageForStrategy={imageForStrategy} clearImageForStrategy={() => setImageForStrategy(null)} onUsePrompt={handleUsePromptFromStrategist} />;
            case 'media-ia': return <MediaStudioView setImageForStrategy={setImageForStrategy} setActiveView={setActiveView} initialPrompt={promptForMedia} onSaveCreation={handleSaveCreation} />;
            case 'automacoes': return <AutomationsView onSelectWorkflow={handleSelectWorkflow} onCreateNew={handleCreateNewWorkflow} />;
            case 'workflow-builder': return activeWorkflow ? <WorkflowBuilder workflow={activeWorkflow} onClose={handleCloseWorkflow} /> : <AutomationsView onSelectWorkflow={handleSelectWorkflow} onCreateNew={handleCreateNewWorkflow} />;
            case 'social': return <SocialPostComposerView creations={creations} />;
            case 'minhas-criacoes': return <MyCreationsView creations={creations} onDelete={handleDeleteCreation} />;
            default: return <AutomationsView onSelectWorkflow={handleSelectWorkflow} onCreateNew={handleCreateNewWorkflow} />;
        }
    };

    const mainContent = (
        <div className="space-y-6">
            <Card className="p-3">
                <header className="flex flex-col sm:flex-row justify-between items-center">
                    <h1 className="text-xl font-bold text-brand-gold">RS Prólipsi - Studio</h1>
                    <nav className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
                        <NavButton view="automacoes" label="Automações" icon={IconRepeat} />
                        <NavButton view="estrategista" label="Estrategista" icon={IconEdit} />
                        <NavButton view="media-ia" label="Mídia IA" icon={IconImage} />
                        <NavButton view="social" label="Posts Sociais" icon={IconMessage} />
                        <NavButton view="minhas-criacoes" label="Minhas Criações" icon={IconDashboard} />
                    </nav>
                </header>
            </Card>
            <main>{renderView()}</main>
            <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );

    // Render only the builder in focus mode, otherwise render the full studio layout
    return activeView === 'workflow-builder' ? renderView() : mainContent;
};

export default Studio;