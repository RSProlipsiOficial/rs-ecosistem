
import React, { useState, useMemo } from 'react';
import { ScheduledPost, SocialPlatform } from '../types';
import { MediaUploader } from './MediaUploader';
import { FacebookIcon } from './icons/FacebookIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { TikTokIcon } from './icons/TikTokIcon';
import { PinterestIcon } from './icons/PinterestIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { KwaiIcon } from './icons/KwaiIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
// Fix: Added missing import for BotIcon to resolve module not found error.
import { BotIcon } from './icons/BotIcon';
import { GoogleGenAI, Type } from '@google/genai';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface PostSchedulerProps {
    posts: ScheduledPost[];
    onSave: (post: ScheduledPost) => void;
    onDelete: (postId: string) => void;
}

const platformIcons: Record<SocialPlatform, React.FC<any>> = {
    Facebook: FacebookIcon,
    Instagram: InstagramIcon,
    TikTok: TikTokIcon,
    Pinterest: PinterestIcon,
    YouTube: YouTubeIcon,
    Kwai: KwaiIcon,
    LinkedIn: LinkedInIcon,
};

type ConnectedAccount = {
    connected: boolean;
    username?: string;
    connectedAt?: string;
}

const ALL_PLATFORMS: SocialPlatform[] = ['Facebook', 'Instagram', 'TikTok', 'Pinterest', 'YouTube', 'Kwai', 'LinkedIn'];

const blobUrlToBase64AndMime = (blobUrl: string): Promise<{ data: string; mimeType: string }> => {
  return fetch(blobUrl)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result !== 'string') {
                return reject('File could not be read as a string.');
            }
            const base64data = reader.result.split(',')[1];
            resolve({ data: base64data, mimeType: blob.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    }));
};

const PostSchedulerModal: React.FC<{
    post: Partial<ScheduledPost> | null;
    onClose: () => void;
    onSave: (post: ScheduledPost) => void;
    connectedAccounts: Record<SocialPlatform, ConnectedAccount>;
}> = ({ post, onClose, onSave, connectedAccounts }) => {
    const [formData, setFormData] = useState<Partial<ScheduledPost> & { mediaFile?: File }>({
        platforms: [],
        content: '',
        mediaUrl: '',
        mediaType: undefined,
        linkUrl: '',
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString().substring(0, 16),
        facebookGroupIds: '',
        ...post
    });
    const [showAiPrompt, setShowAiPrompt] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    const handlePlatformToggle = (platform: SocialPlatform) => {
        if (!connectedAccounts[platform].connected) {
            alert(`Para agendar para o ${platform}, primeiro conecte sua conta na seção "Gerenciar Contas Conectadas".`);
            return;
        }
        setFormData(prev => {
            const platforms = prev.platforms || [];
            if (platforms.includes(platform)) {
                return { ...prev, platforms: platforms.filter(p => p !== platform) };
            }
            return { ...prev, platforms: [...platforms, platform] };
        });
    };
    
    const handleGenerateWithAi = async () => {
        if (!aiTopic.trim() && !formData.mediaUrl) {
            alert('Por favor, descreva o tópico da postagem ou anexe uma mídia para a IA.');
            return;
        }
        setIsGeneratingAi(true);
        alert('Usando 1 crédito de IA para gerar o conteúdo.');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            let promptParts: any[] = [];
            let promptText = `Gere uma legenda para postagem em redes sociais, com um tom de marketing para a marca de luxo "RS Prólipsi". O tópico é: "${aiTopic}". Inclua emojis e hashtags relevantes.`;

            if (formData.mediaUrl) {
                promptText = `Gere uma legenda para esta mídia, com um tom de marketing para a marca de luxo "RS Prólipsi". O tópico é: "${aiTopic}". A legenda deve ser criativa e descrever o que está na mídia. Inclua emojis e hashtags relevantes.`;
                const { data, mimeType } = await blobUrlToBase64AndMime(formData.mediaUrl);
                promptParts.push({ inlineData: { data, mimeType } });
            }
            
            promptParts.push({ text: promptText });
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: promptParts },
            });
            
            setFormData(p => ({ ...p, content: response.text ?? '' }));

        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Ocorreu um erro ao gerar o conteúdo com IA. Por favor, tente novamente.");
        } finally {
            setIsGeneratingAi(false);
            setShowAiPrompt(false);
            setAiTopic('');
        }
    };

    const handleSave = () => {
        if (!formData.content || formData.platforms?.length === 0) {
            alert('Por favor, adicione conteúdo e selecione ao menos uma plataforma conectada.');
            return;
        }
        onSave(formData as ScheduledPost);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-black border border-dark-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-dark-800">
                    <h2 className="text-xl font-bold text-white">{post?.id ? 'Editar Postagem' : 'Nova Postagem'}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Plataformas</label>
                        <div className="flex flex-wrap gap-2">
                            {ALL_PLATFORMS.map(p => {
                                const Icon = platformIcons[p];
                                const isSelected = formData.platforms?.includes(p);
                                const isConnected = connectedAccounts[p].connected;
                                return (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => handlePlatformToggle(p)}
                                        className={`relative p-3 rounded-lg border-2 transition-colors ${
                                            isSelected ? 'bg-gold-500/10 border-gold-500' : 'bg-dark-800 border-dark-700 hover:border-dark-700'
                                        } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        title={!isConnected ? `${p} - Conta não conectada` : p}
                                    >
                                        <Icon className={`w-6 h-6 ${isSelected ? 'text-gold-400' : (isConnected ? 'text-gray-300' : 'text-gray-500')}`} />
                                        {!isConnected && (
                                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-black flex items-center justify-center text-white text-[8px] font-bold" title="Não conectado">!</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="content" className="block text-sm font-medium text-white">Conteúdo</label>
                            <button type="button" onClick={() => setShowAiPrompt(!showAiPrompt)} className="flex items-center gap-1.5 text-sm font-semibold bg-gold-500/10 text-gold-400 py-1 px-3 rounded-md hover:bg-gold-500/20 transition-colors">
                                <BotIcon className="w-4 h-4" />
                                {isGeneratingAi ? 'Gerando...' : 'Gerar com IA'}
                            </button>
                        </div>
                         {showAiPrompt && (
                            <div className="flex gap-2 mb-2 p-3 bg-dark-800 rounded-lg border border-dark-700">
                                <input
                                    type="text"
                                    value={aiTopic}
                                    onChange={e => setAiTopic(e.target.value)}
                                    placeholder="Descreva sobre o que é o post..."
                                    className="flex-grow bg-dark-700 border border-dark-700 rounded-md py-1 px-2 text-white text-sm"
                                    disabled={isGeneratingAi}
                                />
                                <button type="button" onClick={handleGenerateWithAi} disabled={isGeneratingAi} className="text-sm font-bold bg-gold-500 text-black py-1 px-3 rounded-md hover:bg-gold-400 disabled:opacity-50 flex items-center gap-2">
                                    {isGeneratingAi && <SpinnerIcon className="w-4 h-4" />}
                                    Gerar
                                </button>
                            </div>
                        )}
                        <textarea id="content" value={formData.content} onChange={e => setFormData(p => ({...p, content: e.target.value}))} rows={5} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-white mb-2">Mídia (Opcional)</label>
                        <MediaUploader 
                            currentMedia={formData.mediaUrl ? { url: formData.mediaUrl, type: formData.mediaType! } : null}
                            onMediaUpload={(url, type, file) => setFormData(p => ({ ...p, mediaUrl: url, mediaType: type, mediaFile: file }))}
                            onMediaRemove={() => setFormData(p => ({ ...p, mediaUrl: undefined, mediaType: undefined, mediaFile: undefined }))}
                            placeholderText="Anexar imagem ou vídeo"
                        />
                    </div>
                     <div>
                        <label htmlFor="scheduledAt" className="block text-sm font-medium text-white mb-2">Agendar para</label>
                        <input type="datetime-local" id="scheduledAt" value={formData.scheduledAt?.substring(0, 16)} onChange={e => setFormData(p => ({...p, scheduledAt: new Date(e.target.value).toISOString()}))} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" />
                    </div>
                     <details className="bg-dark-900/50 p-3 rounded-lg">
                        <summary className="cursor-pointer text-sm font-semibold text-gold-400">Postar em múltiplos Grupos do Facebook (Avançado)</summary>
                        <div className="mt-4">
                            <label htmlFor="facebookGroupIds" className="block text-sm font-medium text-white mb-2">IDs dos Grupos do Facebook</label>
                            <textarea id="facebookGroupIds" value={formData.facebookGroupIds} onChange={e => setFormData(p => ({...p, facebookGroupIds: e.target.value}))} rows={3} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white" placeholder="Cole um ID por linha"/>
                            <p className="text-xs text-gray-500 mt-1">Para postagem em massa. Certifique-se de ter permissão para postar nos grupos.</p>
                        </div>
                    </details>
                </main>
                <footer className="p-4 bg-dark-900/50 border-t border-dark-800 flex justify-end gap-4">
                    <button onClick={onClose} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400">Salvar Agendamento</button>
                </footer>
            </div>
        </div>
    );
};

const PostCard: React.FC<{ post: ScheduledPost; onEdit: () => void; onDelete: () => void; }> = ({ post, onEdit, onDelete }) => {
    const statusInfo = {
        'Agendado': { icon: ClockIcon, color: 'text-cyan-400' },
        'Postado': { icon: CheckCircleIcon, color: 'text-green-400' },
        'Falhou': { icon: XCircleIcon, color: 'text-red-400' },
    };
    const StatusIcon = statusInfo[post.status].icon;

    return (
        <div className="bg-black border border-dark-800 rounded-lg p-4 flex gap-4">
            {post.mediaUrl && (
                <div className="w-24 h-24 flex-shrink-0 bg-dark-900 rounded-md">
                    {post.mediaType === 'video' ? (
                        <video src={post.mediaUrl} className="w-full h-full object-cover rounded-md" controls />
                    ) : (
                        <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover rounded-md" />
                    )}
                </div>
            )}
            <div className="flex-grow">
                <p className="text-sm text-gray-300 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-2 mt-2">
                    {post.platforms.map(p => {
                        const Icon = platformIcons[p];
                        return <Icon key={p} className="w-5 h-5 text-gray-500" title={p} />;
                    })}
                </div>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-sm">
                        <StatusIcon className={`w-5 h-5 ${statusInfo[post.status].color}`} />
                        <span className={statusInfo[post.status].color}>{post.status} em {new Date(post.scheduledAt).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onEdit} className="p-1 text-gray-400 hover:text-gold-400"><PencilIcon className="w-5 h-5" /></button>
                        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ConnectionModal: React.FC<{
    platform: SocialPlatform;
    onClose: () => void;
    onAuthorize: (platform: SocialPlatform, profile: {id: string, name: string}) => void;
}> = ({ platform, onClose, onAuthorize }) => {
    const Icon = platformIcons[platform];
    const [selectedProfile, setSelectedProfile] = useState('profile1');
    const [isLoading, setIsLoading] = useState(false);
    const profiles = [
        { id: 'profile1', name: 'Ana Carolina (Perfil Pessoal)' },
        { id: 'profile2', name: 'RS Prólipsi (Página da Empresa)' }
    ];

    const handleAuthorize = () => {
        setIsLoading(true);
        setTimeout(() => {
            const profile = profiles.find(p => p.id === selectedProfile) || profiles[0];
            onAuthorize(platform, profile);
            setIsLoading(false);
        }, 1500); // Simulate network delay
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-dark-900 border-2 border-yellow-600/30 rounded-lg w-full max-w-md flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-center gap-3 p-4 border-b border-dark-800">
                    <Icon className="w-8 h-8 text-gold-400" />
                    <h2 className="text-xl font-bold text-white">Conectar com o {platform}</h2>
                </header>
                <main className="p-6 space-y-4">
                    <p className="text-gray-300">A <span className="font-bold text-white">RS Prólipsi</span> solicita permissão para:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400 text-sm">
                        <li>Acessar seu perfil básico e e-mail.</li>
                        <li>Publicar conteúdo em seu nome.</li>
                        <li>Gerenciar as publicações feitas por este aplicativo.</li>
                    </ul>
                    <div className="pt-2">
                        <label htmlFor="profile-select" className="block text-sm font-medium text-white mb-2">Conectar como:</label>
                        <select id="profile-select" value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)} className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 px-3 text-white">
                            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </main>
                <footer className="p-4 bg-black/50 border-t border-dark-800 flex justify-end gap-4">
                    <button onClick={onClose} disabled={isLoading} className="text-sm font-semibold bg-dark-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50">Cancelar</button>
                    <button onClick={handleAuthorize} disabled={isLoading} className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400 w-28 flex justify-center items-center disabled:opacity-50">
                        {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Autorizar'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

const PostScheduler: React.FC<PostSchedulerProps> = ({ posts, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<ScheduledPost> | null>(null);
    const [isConnecting, setIsConnecting] = useState<SocialPlatform | null>(null);
    
    const [connectedAccounts, setConnectedAccounts] = useState<Record<SocialPlatform, ConnectedAccount>>(
        ALL_PLATFORMS.reduce((acc, p) => ({ ...acc, [p]: { connected: false } }), {} as Record<SocialPlatform, ConnectedAccount>)
    );

    const handleOpenModal = (post: Partial<ScheduledPost> | null = null) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
    };
    
    const handleAuthorize = (platform: SocialPlatform, profile: {id: string, name: string}) => {
        const username = profile.name.split(' ')[0].toLowerCase();
        setConnectedAccounts(prev => ({
            ...prev,
            [platform]: {
                connected: true,
                username: `@${username}`,
                connectedAt: new Date().toLocaleDateString('pt-BR'),
            }
        }));
        setIsConnecting(null);
        alert(`${platform} conectado com sucesso como ${profile.name}!`);
    };

    const handleDisconnect = (platform: SocialPlatform) => {
        if (window.confirm(`Tem certeza que deseja desconectar sua conta do ${platform}?`)) {
            setConnectedAccounts(prev => ({
                ...prev,
                [platform]: { connected: false, username: undefined, connectedAt: undefined }
            }));
        }
    };

    const handleSavePost = (postToSave: ScheduledPost) => {
        onSave(postToSave);
        alert(`Postagem agendada com sucesso para ${new Date(postToSave.scheduledAt).toLocaleString('pt-BR')}!`);
        handleCloseModal();
    };

    const upcomingPosts = useMemo(() => posts.filter(p => p.status === 'Agendado').sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()), [posts]);
    const pastPosts = useMemo(() => posts.filter(p => p.status !== 'Agendado').sort((a,b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()), [posts]);


    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Agendador de Posts</h1>
                    <p className="text-gray-400">Planeje e automatize suas publicações nas redes sociais.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="font-bold bg-gold-500 text-black py-2 px-5 rounded-md hover:bg-gold-400 transition-colors whitespace-nowrap"
                >
                    + Nova Postagem
                </button>
            </div>
            
             <div className="bg-black border border-dark-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Gerenciar Contas Conectadas</h3>
                <p className="text-sm text-gray-400 mb-4">Conecte suas redes sociais para poder agendar postagens.</p>
                <p className="text-xs text-gray-500 mb-4 -mt-3">Nota: A conexão é uma simulação para fins de demonstração. Uma integração real requer um backend para o fluxo de autorização OAuth.</p>
                <div className="space-y-3">
                    {ALL_PLATFORMS.map((platform) => {
                        const Icon = platformIcons[platform];
                        const account = connectedAccounts[platform];
                        return (
                            <div key={platform} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-md">
                                <div className="flex items-center gap-3">
                                    <Icon className="w-8 h-8 text-white" />
                                    <div>
                                        <span className="font-bold text-white">{platform}</span>
                                        {account.connected ? (
                                             <p className="text-xs text-green-400">{account.username} - Conectado em {account.connectedAt}</p>
                                        ) : (
                                            <p className="text-xs text-gray-500">Não Conectado</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => account.connected ? handleDisconnect(platform) : setIsConnecting(platform)}
                                    className={`text-sm font-semibold py-2 px-4 rounded-md transition-colors ${
                                        account.connected ? 'bg-red-600/20 text-red-300 hover:bg-red-600/40' : 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/40'
                                    }`}
                                >
                                    {account.connected ? 'Desconectar' : 'Conectar'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Próximos Posts ({upcomingPosts.length})</h2>
                    {upcomingPosts.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingPosts.map(post => (
                                <PostCard key={post.id} post={post} onEdit={() => handleOpenModal(post)} onDelete={() => onDelete(post.id)} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8 bg-black border border-dashed border-dark-800 rounded-lg">Nenhuma postagem agendada.</p>
                    )}
                </div>
                 <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Histórico ({pastPosts.length})</h2>
                     {pastPosts.length > 0 ? (
                        <div className="space-y-4">
                            {pastPosts.map(post => (
                                <PostCard key={post.id} post={post} onEdit={() => handleOpenModal(post)} onDelete={() => onDelete(post.id)} />
                            ))}
                        </div>
                    ) : (
                         <p className="text-gray-500 text-center py-8 bg-black border border-dashed border-dark-800 rounded-lg">Nenhuma postagem no histórico.</p>
                    )}
                </div>
            </div>
            
            {isModalOpen && <PostSchedulerModal post={editingPost} onClose={handleCloseModal} onSave={handleSavePost} connectedAccounts={connectedAccounts} />}
            {isConnecting && <ConnectionModal platform={isConnecting} onClose={() => setIsConnecting(null)} onAuthorize={handleAuthorize} />}
        </div>
    );
};

export default PostScheduler;