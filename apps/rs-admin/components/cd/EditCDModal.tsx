import React, { useState, useEffect } from 'react';
import { PencilIcon, SpinnerIcon, XMarkIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, IdentificationIcon } from '../icons';
import { CDRegistry, CDType } from '../../types';
import { headquartersService } from '../../src/services/headquartersService';

interface EditCDModalProps {
    isOpen: boolean;
    cd: CDRegistry | null;
    onClose: () => void;
    onSuccess: () => void;
}

const EditCDModal: React.FC<EditCDModalProps> = ({ isOpen, cd, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [type, setType] = useState<CDType>('FRANQUIA');
    const [status, setStatus] = useState<'ATIVO' | 'BLOQUEADO'>('ATIVO');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');

    useEffect(() => {
        if (cd) {
            setName(cd.name);
            setType(cd.type);
            setStatus(cd.status === 'BLOQUEADO' ? 'BLOQUEADO' : 'ATIVO');
            setEmail(cd.email || '');
            setPhone(cd.phone || '');
            setStreet(cd.addressStreet || '');
            setNumber(cd.addressNumber || '');
            setNeighborhood(cd.addressNeighborhood || '');
            setCity(cd.city || '');
            setState(cd.state || '');
            setZip(cd.addressZip || '');
        }
    }, [cd]);

    if (!isOpen || !cd) return null;

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const updates: Partial<CDRegistry> = {
                name,
                type,
                status,
                email,
                phone,
                addressStreet: street,
                addressNumber: number,
                addressNeighborhood: neighborhood,
                city,
                state,
                addressZip: zip
            };

            const success = await headquartersService.updateCDRegistry(cd.id, updates);
            if (success) {
                onSuccess();
                onClose();
            } else {
                throw new Error('Falha ao atualizar dados do CD.');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar alterações.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#1E1E1E] border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
                <div className="bg-[#2A2A2A] p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <PencilIcon className="w-6 h-6 text-blue-500" />
                        Editar CD: {cd.name}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* General Info */}
                            <div className="space-y-4">
                                <h3 className="text-blue-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <IdentificationIcon className="w-4 h-4" /> Dados Cadastrais
                                </h3>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Nome do Centro de Distribuição</label>
                                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold">Status do CD</label>
                                        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                                            <option value="ATIVO">Ativo</option>
                                            <option value="BLOQUEADO">Bloqueado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold">Tipo / Modelo</label>
                                        <select value={type} onChange={(e) => setType(e.target.value as CDType)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                                            <option value="FRANQUIA">Franquia</option>
                                            <option value="PROPRIO">Próprio</option>
                                            <option value="HIBRIDO">Híbrido</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">WhatsApp</label>
                                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">E-mail</label>
                                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-4">
                                <h3 className="text-blue-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <MapPinIcon className="w-4 h-4" /> Endereço de Operação
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <label className="text-[10px] text-gray-500 uppercase font-bold">Rua</label>
                                        <input value={street} onChange={(e) => setStreet(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold">Número</label>
                                        <input value={number} onChange={(e) => setNumber(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Bairro</label>
                                    <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <label className="text-[10px] text-gray-500 uppercase font-bold">Cidade</label>
                                        <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold">UF</label>
                                        <input value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" maxLength={2} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">CEP</label>
                                    <input value={zip} onChange={(e) => setZip(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                            <button onClick={onClose} className="px-6 py-2 text-gray-400 font-bold hover:text-white transition-colors">CANCELAR</button>
                            <button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/10 active:scale-95 transition-all">
                                {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCDModal;
