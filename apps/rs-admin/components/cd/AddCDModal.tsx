import React, { useState, useEffect } from 'react';
import { supabase } from "../../src/services/supabase";
import { UserPlusIcon, SpinnerIcon, XMarkIcon, MagnifyingGlassIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, IdentificationIcon } from '../icons';
import { CDType } from '../../types';

interface AddCDModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface UserProfile {
    user_id: string;
    full_name: string;
    email: string;
    cpf: string;
    whatsapp: string;
    address_street?: string;
    address_number?: string;
    address_neighborhood?: string;
    address_city?: string;
    address_state?: string;
    address_zip?: string;
    avatar_url?: string;
}

const AddCDModal: React.FC<AddCDModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
    const [processing, setProcessing] = useState(false);

    // Form states for refinement
    const [cdName, setCdName] = useState('');
    const [cdType, setCdType] = useState<CDType>('FRANQUIA');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');

    useEffect(() => {
        if (foundUser) {
            setCdName(foundUser.full_name);
            setEmail(foundUser.email);
            setPhone(foundUser.whatsapp);
            setStreet(foundUser.address_street || '');
            setNumber(foundUser.address_number || '');
            setNeighborhood(foundUser.address_neighborhood || '');
            setCity(foundUser.address_city || '');
            setState(foundUser.address_state || '');
            setZip(foundUser.address_zip || '');
        }
    }, [foundUser]);

    if (!isOpen) return null;

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        setError(null);
        setFoundUser(null);

        const term = searchTerm.trim();
        const isEmail = term.includes('@');
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term);
        const cleanTerm = term.replace(/\D/g, '');

        try {
            // 1. Search in consultants
            let masterQuery = supabase.from('consultores').select('*');
            if (isUUID) masterQuery = masterQuery.eq('id', term);
            else if (isEmail) masterQuery = masterQuery.ilike('email', term);
            else if (cleanTerm.length >= 11) masterQuery = masterQuery.eq('cpf', cleanTerm);
            else throw new Error('Formato de busca inválido. Use ID, E-mail ou CPF/CNPJ.');

            const { data: masterData, error: masterError } = await masterQuery.maybeSingle();
            if (masterError) throw masterError;

            if (masterData) {
                setFoundUser({
                    user_id: masterData.id,
                    full_name: masterData.nome || '',
                    email: masterData.email || '',
                    cpf: masterData.cpf || '',
                    whatsapp: masterData.whatsapp || masterData.telefone || '',
                    address_street: masterData.endereco,
                    address_number: masterData.numero,
                    address_neighborhood: masterData.bairro,
                    address_city: masterData.cidade,
                    address_state: masterData.estado,
                    address_zip: masterData.cep,
                });
                return;
            }

            // 2. Fallback to minisite_profiles
            let query = supabase.from('minisite_profiles').select('*');
            if (isUUID) query = query.eq('id', term);
            else if (isEmail) query = query.ilike('email', term);
            else if (cleanTerm.length >= 11) query = query.eq('cpf', cleanTerm);

            const { data, error } = await query.maybeSingle();
            if (error) throw error;

            if (!data) {
                setError('Consultor não encontrado na base de dados.');
            } else {
                setFoundUser({
                    user_id: data.id,
                    full_name: data.name || '',
                    email: data.email || '',
                    cpf: data.cpf || '',
                    whatsapp: data.phone || '',
                    address_street: data.address_street,
                    address_number: data.address_number,
                    address_neighborhood: data.address_neighborhood,
                    address_city: data.address_city,
                    address_state: data.address_state,
                    address_zip: data.address_zip,
                    avatar_url: data.avatar_url
                });
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao buscar usuário.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!foundUser) return;
        setProcessing(true);
        try {
            const cdData = {
                id: foundUser.user_id,
                consultant_id: foundUser.user_id,
                name: cdName,
                email: email,
                phone: phone,
                cpf: foundUser.cpf,
                type: cdType.toLowerCase(), // Save normalized
                address_street: street,
                address_number: number,
                address_neighborhood: neighborhood,
                address_city: city,
                address_state: state,
                address_zip: zip,
                status: 'active'
            };

            const { error: upsertError } = await supabase
                .from('minisite_profiles')
                .upsert(cdData);

            if (upsertError) throw upsertError;

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar CD.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#1E1E1E] border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
                <div className="bg-[#2A2A2A] p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <UserPlusIcon className="w-6 h-6 text-yellow-500" />
                        Novo Cadastro de CD
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Search Field */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Buscar Consultor</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1 bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none placeholder-gray-600"
                                placeholder="ID, CPF ou E-mail..."
                            />
                            <button onClick={handleSearch} disabled={loading} className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 rounded-lg font-bold flex items-center gap-2">
                                {loading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <MagnifyingGlassIcon className="w-5 h-5" />}
                                BUSCAR
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>

                    {foundUser && (
                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <h3 className="text-yellow-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <IdentificationIcon className="w-4 h-4" /> Dados do CD
                                    </h3>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold">Nome do Centro de Distribuição</label>
                                        <input value={cdName} onChange={(e) => setCdName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase font-bold">Modelo</label>
                                            <select value={cdType} onChange={(e) => setCdType(e.target.value as CDType)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                                                <option value="FRANQUIA">Franquia</option>
                                                <option value="PROPRIO">Próprio</option>
                                                <option value="HIBRIDO">Híbrido</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase font-bold">WhatsApp</label>
                                            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold">E-mail de Contato</label>
                                        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-yellow-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <MapPinIcon className="w-4 h-4" /> Localização Completa
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-2">
                                            <label className="text-[10px] text-gray-500 uppercase font-bold">Rua / Logradouro</label>
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

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                <button onClick={onClose} className="px-6 py-2 text-gray-400 font-bold hover:text-white transition-colors">CANCELAR</button>
                                <button onClick={handleConfirm} disabled={processing} className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-2 rounded-lg font-bold shadow-lg shadow-yellow-500/20 active:scale-95 transition-all">
                                    {processing ? 'SALVANDO...' : 'FINALIZAR CADASTRO'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddCDModal;
