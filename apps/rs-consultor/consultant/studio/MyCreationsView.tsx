import React, { FC, useState } from 'react';
import type { Creation } from '../../types';
import { IconTrash, IconRepeat, IconEdit, IconMoreVertical } from '../../components/icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MyCreationsViewProps {
    creations: Creation[];
    onDelete: (id: string) => void;
    // Add more handlers for other actions if needed
}

const MyCreationsView: FC<MyCreationsViewProps> = ({ creations, onDelete }) => {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        setActiveDropdown(null);
    }

    if (creations.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                <h2 className="text-2xl font-bold text-white">Sua Galeria está Vazia</h2>
                <p>Crie uma imagem ou vídeo na aba "Mídia IA" e salve para vê-la aqui.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
            {creations.map(creation => (
                <div key={creation.id} className="relative group aspect-square bg-brand-gray-light rounded-lg overflow-hidden shadow-lg">
                    {creation.mediaResult.type === 'image' ? (
                         <img src={creation.mediaResult.url} alt={creation.prompt} className="w-full h-full object-cover" />
                    ) : (
                        <video src={creation.mediaResult.url} className="w-full h-full object-cover" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                        <div className="text-right">
                             <button onClick={() => setActiveDropdown(activeDropdown === creation.id ? null : creation.id)} className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80">
                                <IconMoreVertical size={20}/>
                            </button>
                             {activeDropdown === creation.id && (
                                <div className="absolute top-12 right-4 w-48 bg-brand-gray-dark border border-brand-gray rounded-lg shadow-2xl z-10 py-1 text-left">
                                    <button onClick={(e) => handleAction(e, () => {})} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-brand-gray-light"><IconRepeat size={16}/> Usar Prompt</button>
                                    <button onClick={(e) => handleAction(e, () => {})} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-brand-gray-light"><IconEdit size={16}/> Usar como Base</button>
                                    <div className="my-1 h-px bg-brand-gray-light"></div>
                                    <button onClick={(e) => handleAction(e, () => onDelete(creation.id))} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-brand-gray-light"><IconTrash size={16}/> Excluir</button>
                                </div>
                             )}
                        </div>
                        <div>
                            <p className="text-sm text-white font-semibold truncate">{creation.prompt}</p>
                            <p className="text-xs text-gray-400">{format(new Date(creation.createdAt), "dd MMM, yyyy 'às' HH:mm", { locale: ptBR })}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyCreationsView;