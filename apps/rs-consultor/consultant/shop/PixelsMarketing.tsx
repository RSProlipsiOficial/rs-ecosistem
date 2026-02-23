import React, { useState, FormEvent, FC } from 'react';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { mockPixels } from '../data';
import { 
    IconFacebook, 
    IconGoogle, 
    IconPinterest, 
    IconPlus, 
    IconTrash,
    IconEdit,
    IconHelpCircle,
    IconTikTok,
    IconTaboola,
    IconSnapchat,
    IconTwitter,
    IconLinkedin,
} from '../../components/icons';

// Define types locally for this component
type PixelPlatform = 'facebook' | 'google' | 'pinterest' | 'tiktok' | 'taboola' | 'snapchat' | 'twitter' | 'linkedin';
interface Pixel {
    id: string;
    name: string;
    platform: PixelPlatform;
    status: 'active' | 'inactive';
    pixelId: string;
    accessToken?: string;
    conversionLabel?: string;
}

const platformConfig = {
    facebook: { 
        name: 'Facebook', 
        icon: IconFacebook, 
        color: 'text-blue-500',
        fields: [
            { id: 'pixelId', label: 'ID do Pixel', tooltip: 'O identificador único para o seu pixel do Facebook.' },
            { id: 'accessToken', label: 'Token de Acesso da API', tooltip: 'O token para a API de Conversões do Facebook.' }
        ]
    },
    google: { 
        name: 'Google Ads', 
        icon: IconGoogle, 
        color: 'text-red-500',
        fields: [
            { id: 'pixelId', label: 'Google Tag ID (AW-)', tooltip: 'Seu ID de acompanhamento do Google Ads (ex: AW-123456789).' },
            { id: 'conversionLabel', label: 'Rótulo de Conversão', tooltip: 'O rótulo específico para a ação de conversão que você quer rastrear.' }
        ]
    },
    tiktok: {
        name: 'TikTok',
        icon: IconTikTok,
        color: 'text-white',
        fields: [
            { id: 'pixelId', label: 'ID do Pixel do TikTok', tooltip: 'O identificador único para o seu pixel do TikTok.' }
        ]
    },
    taboola: {
        name: 'Taboola',
        icon: IconTaboola,
        color: 'text-orange-500',
        fields: [
            { id: 'pixelId', label: 'ID do Pixel do Taboola', tooltip: 'O seu ID de conta do Taboola para rastreamento.' }
        ]
    },
    pinterest: { 
        name: 'Pinterest', 
        icon: IconPinterest, 
        color: 'text-red-700',
        fields: [
            { id: 'pixelId', label: 'Pinterest Tag ID', tooltip: 'O ID da sua tag do Pinterest para rastreamento.' }
        ]
    },
    snapchat: {
        name: 'Snapchat',
        icon: IconSnapchat,
        color: 'text-yellow-400',
        fields: [
            { id: 'pixelId', label: 'ID do Snap Pixel', tooltip: 'O identificador único para o seu Snap Pixel.' }
        ]
    },
    twitter: {
        name: 'X (Twitter)',
        icon: IconTwitter,
        color: 'text-gray-300',
        fields: [
            { id: 'pixelId', label: 'ID do Pixel do X', tooltip: 'O identificador único para a sua tag do site do X.' }
        ]
    },
    linkedin: {
        name: 'LinkedIn',
        icon: IconLinkedin,
        color: 'text-blue-400',
        fields: [
            { id: 'pixelId', label: 'ID de Parceiro (Insight Tag)', tooltip: 'O seu ID de parceiro do LinkedIn Insight Tag.' }
        ]
    }
};

const statusMap = {
  active: { label: 'Ativo', color: 'bg-green-500/20 text-green-400' },
  inactive: { label: 'Inativo', color: 'bg-red-500/20 text-red-400' },
};

const Tooltip: FC<{text: string; children: React.ReactNode}> = ({ text, children }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-brand-dark text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            {text}
        </div>
    </div>
);

const PlatformIcon: React.FC<{platform: PixelPlatform}> = ({ platform }) => {
    const Icon = platformConfig[platform].icon;
    const color = platformConfig[platform].color;
    return <Icon className={`h-6 w-6 ${color}`} />;
}

// Pixel Form Component
const PixelForm: FC<{ 
    pixel: Omit<Pixel, 'id'> | null, 
    onSave: (pixel: Omit<Pixel, 'id'>) => void 
}> = ({ pixel, onSave }) => {
    const [formData, setFormData] = useState({
        name: pixel?.name || '',
        platform: pixel?.platform || 'facebook',
        status: pixel?.status || 'active',
        pixelId: pixel?.pixelId || '',
        accessToken: pixel?.accessToken || '',
        conversionLabel: pixel?.conversionLabel || '',
    });

    const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPlatform = e.target.value as PixelPlatform;
        // Reset specific fields when platform changes
        setFormData({
            ...formData,
            platform: newPlatform,
            pixelId: '',
            accessToken: '',
            conversionLabel: ''
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const currentPlatformConfig = platformConfig[formData.platform as PixelPlatform];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="text-sm text-gray-400 block mb-1">Apelido do Pixel</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Campanha Dia das Mães" required className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
            </div>
            <div>
                <label className="text-sm text-gray-400 block mb-1">Plataforma</label>
                <select value={formData.platform} onChange={handlePlatformChange} className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none h-[42px]">
                    {Object.entries(platformConfig).map(([key, { name }]) => (
                        <option key={key} value={key}>{name}</option>
                    ))}
                </select>
            </div>
            
            {currentPlatformConfig.fields.map(field => (
                <div key={field.id}>
                    <label className="text-sm text-gray-400 block mb-1 flex items-center">
                        {field.label}
                         <Tooltip text={field.tooltip}>
                            <IconHelpCircle size={16} className="ml-2 text-gray-500 hover:text-white cursor-help"/>
                        </Tooltip>
                    </label>
                    <input type="text" value={formData[field.id as keyof typeof formData]} onChange={e => setFormData({...formData, [field.id]: e.target.value})} required className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none"/>
                </div>
            ))}

            <div>
                <label className="text-sm text-gray-400 block mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})} className="w-full bg-brand-gray p-2 rounded-md border border-brand-gray-light focus:ring-2 focus:ring-brand-gold focus:outline-none h-[42px]">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                </select>
            </div>

            <button type="submit" className="w-full mt-4 font-bold py-3 px-4 rounded-lg transition-colors bg-brand-gold text-brand-dark hover:bg-yellow-400">
                Salvar Pixel
            </button>
        </form>
    );
};


const PixelsMarketing: React.FC = () => {
    const [pixels, setPixels] = useState<Pixel[]>(mockPixels);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPixel, setEditingPixel] = useState<Pixel | null>(null);
    const [pixelToDelete, setPixelToDelete] = useState<Pixel | null>(null);

    const handleAddNew = () => {
        setEditingPixel(null);
        setIsModalOpen(true);
    };

    const handleEdit = (pixel: Pixel) => {
        setEditingPixel(pixel);
        setIsModalOpen(true);
    };

    const handleSave = (pixelData: Omit<Pixel, 'id'>) => {
        if (editingPixel) {
            // Update existing pixel
            setPixels(pixels.map(p => p.id === editingPixel.id ? { ...p, ...pixelData } : p));
        } else {
            // Add new pixel
            const newPixel: Pixel = {
                id: `px-${Date.now()}`,
                ...pixelData,
            };
            setPixels([...pixels, newPixel]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (pixel: Pixel) => {
        setPixelToDelete(pixel);
    };

    const confirmDelete = () => {
        if (pixelToDelete) {
            setPixels(pixels.filter(p => p.id !== pixelToDelete.id));
            setPixelToDelete(null);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Pixels de Marketing</h2>
                    <button onClick={handleAddNew} className="flex items-center justify-center space-x-2 text-sm bg-brand-gold text-brand-dark font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors">
                        <IconPlus size={16} />
                        <span>Adicionar Pixel</span>
                    </button>
                </div>
                <div className="space-y-4">
                    {pixels.length > 0 ? pixels.map(pixel => (
                        <div key={pixel.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 bg-brand-gray-light rounded-lg">
                            <div className="flex items-center space-x-4">
                                <PlatformIcon platform={pixel.platform} />
                                <div>
                                    <p className="font-bold text-white capitalize">{pixel.name}</p>
                                    <p className="text-sm text-gray-400 font-mono">ID: {pixel.pixelId}</p>
                                    {pixel.conversionLabel && <p className="text-xs text-gray-500 font-mono">Label: {pixel.conversionLabel}</p>}
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-4">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusMap[pixel.status].color}`}>
                                    {statusMap[pixel.status].label}
                                </span>
                                <button onClick={() => handleEdit(pixel)} className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Editar Pixel">
                                    <IconEdit size={18} />
                                </button>
                                <button onClick={() => handleDelete(pixel)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Excluir Pixel">
                                    <IconTrash size={18} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>Nenhum pixel cadastrado.</p>
                            <p className="text-sm">Clique em "Adicionar Pixel" para começar.</p>
                        </div>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPixel ? "Editar Pixel" : "Adicionar Novo Pixel"}
            >
                <PixelForm 
                    pixel={editingPixel} 
                    onSave={handleSave} 
                />
            </Modal>

            <Modal
                isOpen={!!pixelToDelete}
                onClose={() => setPixelToDelete(null)}
                title="Confirmar Exclusão"
            >
                <div className="text-center">
                    <p className="text-gray-300">
                        Tem certeza que deseja excluir o pixel <strong className="text-white">{pixelToDelete?.name}</strong>?
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Esta ação não poderá ser desfeita.</p>
                    <div className="flex justify-center gap-4 mt-6">
                        <button onClick={() => setPixelToDelete(null)} className="bg-brand-gray hover:bg-brand-gray-light text-white font-semibold py-2 px-6 rounded-lg">
                            Cancelar
                        </button>
                        <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">
                            Excluir
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PixelsMarketing;