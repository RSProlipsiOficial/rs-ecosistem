import React, { useState, useMemo, useEffect } from 'react';
import type { Consultant } from '../types';
import { MagnifyingGlassIcon, ShareIcon, UserCircleIcon, UsersIcon, ArrowLeftIcon } from './icons';

interface NetworkExplorerProps {
    consultants: Consultant[];
    selectedId: number | null;
    onSelectConsultant: (id: number) => void;
}

const NetworkExplorer: React.FC<NetworkExplorerProps> = ({ consultants, selectedId, onSelectConsultant }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'global' | 'focus'>('global');
    const [focusHistory, setFocusHistory] = useState<number[]>([]);
    
    // Sync external selection with internal focus
    useEffect(() => {
        if (selectedId && (focusHistory.length === 0 || focusHistory[focusHistory.length - 1] !== selectedId)) {
            setViewMode('focus');
            setFocusHistory([selectedId]);
        }
    }, [selectedId]);

    const focusId = viewMode === 'focus' && focusHistory.length > 0 ? focusHistory[focusHistory.length - 1] : null;

    const filteredConsultants = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return [];
        }

        const results = consultants.filter(c => 
            c.name.toLowerCase().includes(query) ||
            String(c.id).includes(query) ||
            c.contact.email.toLowerCase().includes(query) ||
            c.cpfCnpj.replace(/\D/g, '').includes(query.replace(/\D/g, ''))
        );
        
        // Sort results alphabetically by name
        return results.sort((a, b) => a.name.localeCompare(b.name));

    }, [searchTerm, consultants]);
    
    const globalNetworkData = useMemo(() => {
        return [...consultants]
            .sort((a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime())
            .map(c => ({
                ...c,
                directsCount: consultants.filter(d => d.sponsor?.id === c.id).length
            }));
    }, [consultants]);

    const focusData = useMemo(() => {
        if (viewMode !== 'focus' || !focusId) return null;
        
        const current = consultants.find(c => c.id === focusId);
        if (!current) return null;

        const sponsor = current.sponsor ? consultants.find(c => c.id === current.sponsor!.id) : null;
        const directs = consultants.filter(c => c.sponsor?.id === focusId).map(d => ({
            ...d,
            directsCount: consultants.filter(sub => sub.sponsor?.id === d.id).length
        }));
        
        return { current, sponsor, directs };
    }, [viewMode, focusId, consultants]);

    const handleSelectAndFocus = (id: number) => {
        onSelectConsultant(id);
        setViewMode('focus');
        setFocusHistory([id]);
        setSearchTerm('');
    };
    
    const handleDrillDown = (id: number) => {
        onSelectConsultant(id);
        setFocusHistory(prev => [...prev, id]);
    };

    const handleBreadcrumbClick = (index: number) => {
        const newHistory = focusHistory.slice(0, index + 1);
        setFocusHistory(newHistory);
        onSelectConsultant(newHistory[newHistory.length - 1]);
    };
    
    const resetToGlobal = () => {
        setViewMode('global');
        setFocusHistory([]);
        setSearchTerm('');
    };

    const tableHeader = (
         <thead className="text-xs text-yellow-500 uppercase bg-black/30">
            <tr>
                <th className="px-4 py-3">Consultor</th>
                <th className="px-4 py-3">Patrocinador</th>
                <th className="px-4 py-3 text-center">Diretos</th>
                <th className="px-4 py-3">PIN</th>
                <th className="px-4 py-3">Ativo SIGMA</th>
                <th className="px-4 py-3 text-center">Equipe</th>
                <th className="px-4 py-3">Data de Cadastro</th>
            </tr>
        </thead>
    );
    
    const consultantRow = (consultant: any, isFocus = false) => (
        <tr key={consultant.id} onClick={() => handleSelectAndFocus(consultant.id)} className={`border-b border-gray-800 transition-colors ${isFocus ? 'bg-yellow-500/10' : 'hover:bg-gray-800/50 cursor-pointer'}`}>
            <td className="px-4 py-3 font-medium flex items-center gap-3">
                <img src={consultant.avatar} alt={consultant.name} className="w-10 h-10 rounded-full object-cover"/>
                <div>
                    <p className="text-white">{consultant.name}</p>
                    <p className="text-xs text-gray-500">ID: {consultant.id}</p>
                </div>
            </td>
            <td className="px-4 py-3">{consultant.sponsor?.name || '—'}</td>
            <td className="px-4 py-3 text-center font-semibold">{consultant.directsCount}</td>
            <td className="px-4 py-3">{consultant.pin}</td>
            <td className="px-4 py-3">{consultant.sigmaActive ? <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400">Sim</span> : <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">Não</span>}</td>
            <td className="px-4 py-3 text-center font-semibold">{consultant.teamSize ?? 0}</td>
            <td className="px-4 py-3">{new Date(consultant.registrationDate).toLocaleDateString('pt-BR')}</td>
        </tr>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-black/50 border border-gray-800 rounded-xl">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Buscar por Nome, ID, CPF ou E-mail..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 pl-10"
                    />
                </div>
                 {searchTerm && (
                     <div className="mt-2 max-h-60 overflow-y-auto">
                         {filteredConsultants.length > 0 ? (
                            filteredConsultants.map(c => (
                                <button key={c.id} onClick={() => handleSelectAndFocus(c.id)} className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-gray-700/50">
                                    <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">{c.name}</p>
                                        <p className="text-xs text-gray-400">{c.contact.email}</p>
                                    </div>
                                </button>
                            ))
                         ) : <p className="text-sm text-gray-500 text-center p-3">Nenhum resultado encontrado.</p>}
                     </div>
                 )}
            </div>

            {viewMode === 'focus' && focusData ? (
                <div>
                     <div className="flex items-center justify-between mb-4">
                        <nav className="flex items-center text-sm font-medium text-gray-400 bg-black/50 px-2 py-1 rounded-lg border border-gray-800 flex-wrap">
                            <button onClick={resetToGlobal} className="hover:text-yellow-400 p-1">Rede Global</button>
                            {focusHistory.map((id, index) => {
                                const consultant = consultants.find(c => c.id === id);
                                return (
                                    <React.Fragment key={id}>
                                        <span className="mx-2">/</span>
                                        <button onClick={() => handleBreadcrumbClick(index)} className={`p-1 hover:text-yellow-400 ${index === focusHistory.length - 1 ? 'text-yellow-400 font-bold' : ''}`}>
                                            {consultant?.name || '...'}
                                        </button>
                                    </React.Fragment>
                                );
                            })}
                        </nav>
                     </div>
                     <div className="space-y-4">
                        {focusData.sponsor && (
                           <div className="space-y-2">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Patrocinador</h3>
                                <div onClick={() => handleBreadcrumbClick(focusHistory.length - 2)} className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-yellow-500/50">
                                     <div className="flex items-center gap-3">
                                        <img src={focusData.sponsor.avatar} alt={focusData.sponsor.name} className="w-10 h-10 rounded-full" />
                                        <div><p className="font-semibold text-white">{focusData.sponsor.name}</p><p className="text-xs text-yellow-400">{focusData.sponsor.pin}</p></div>
                                    </div>
                                    <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        )}
                         <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Foco Atual</h3>
                            <div className="bg-black/50 border-2 border-yellow-500 rounded-lg p-3 flex items-center gap-3 mt-2">
                                <img src={focusData.current.avatar} alt={focusData.current.name} className="w-10 h-10 rounded-full" />
                                <div><p className="font-semibold text-white">{focusData.current.name}</p><p className="text-xs text-yellow-400">{focusData.current.pin}</p></div>
                            </div>
                        </div>

                         {focusData.directs.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">Diretos ({focusData.directs.length})</h3>
                                <div className="mt-2 space-y-2">
                                {focusData.directs.map(d => (
                                    <div key={d.id} onClick={() => handleDrillDown(d.id)} className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-yellow-500/50">
                                        <div className="flex items-center gap-3">
                                            <img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-full" />
                                            <div><p className="font-semibold text-white">{d.name}</p><p className="text-xs text-yellow-400">{d.pin}</p></div>
                                        </div>
                                        <div className="text-right"><p className="text-sm font-semibold text-white">{d.directsCount}</p><p className="text-xs text-gray-400">Diretos</p></div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
                     </div>
                </div>

            ) : (
                <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            {tableHeader}
                            <tbody>
                                {globalNetworkData.map(c => consultantRow(c, c.id === focusId))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NetworkExplorer;
