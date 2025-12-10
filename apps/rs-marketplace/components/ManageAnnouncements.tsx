import React, { useState, useMemo } from 'react';
import { Announcement, View } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PinIcon } from './icons/PinIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface ManageAnnouncementsProps {
    announcements: Announcement[];
    onNavigate: (view: View, data?: Announcement) => void;
    onDelete: (ids: string[]) => void;
}

const ManageAnnouncements: React.FC<ManageAnnouncementsProps> = ({ announcements, onNavigate, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    
    const filteredAnnouncements = useMemo(() => {
        return announcements
            .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
    }, [announcements, searchTerm]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelected(e.target.checked ? filteredAnnouncements.map(a => a.id) : []);
    };

    const handleSelectOne = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-4">
            <button onClick={() => onNavigate('communication')} className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-gold-400">
                <ArrowLeftIcon className="w-5 h-5"/>
                Voltar para a Central
            </button>
            <div className="bg-black border border-dark-800 rounded-lg">
                <div className="p-4 border-b border-dark-800 flex justify-between items-center">
                    <div className="relative max-w-lg">
                        <input
                            type="text"
                            placeholder="Buscar comunicados..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-800 border-2 border-dark-700 rounded-md py-2 pl-10 pr-4"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate('addEditAnnouncement')}
                        className="text-sm font-bold bg-gold-500 text-black py-2 px-4 rounded-md hover:bg-gold-400"
                    >
                        + Novo Comunicado
                    </button>
                </div>
                {selected.length > 0 && (
                    <div className="p-4 bg-dark-800/50">
                        <button onClick={() => onDelete(selected)} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
                            <TrashIcon className="w-5 h-5"/>
                            Excluir {selected.length} comunicado(s)
                        </button>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-400 uppercase bg-black">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selected.length > 0 && selected.length === filteredAnnouncements.length} /></th>
                                <th scope="col" className="px-6 py-3">Título</th>
                                <th scope="col" className="px-6 py-3">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAnnouncements.map(ann => (
                                <tr key={ann.id} className={`border-b border-dark-800 hover:bg-dark-800/50 ${ann.isPinned ? 'bg-gold-400/5' : ''}`}>
                                    <td className="w-4 p-4"><input type="checkbox" checked={selected.includes(ann.id)} onChange={() => handleSelectOne(ann.id)} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* FIX: Wrap icon in a span to provide a title tooltip, as the 'title' prop is not directly supported on the SVG component type. */}
                                            {ann.isPinned && <span title="Fixado"><PinIcon className="w-5 h-5 text-gold-400 flex-shrink-0"/></span>}
                                            <button onClick={() => onNavigate('addEditAnnouncement', ann)} className="font-medium text-white hover:text-gold-400">{ann.title}</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{new Date(ann.date).toLocaleDateString('pt-BR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageAnnouncements;