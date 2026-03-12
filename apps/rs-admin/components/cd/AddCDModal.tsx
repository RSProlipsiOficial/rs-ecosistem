import React, { useEffect, useState } from 'react';
import { UserPlusIcon, SpinnerIcon, XMarkIcon, MagnifyingGlassIcon, MapPinIcon, IdentificationIcon } from '../icons';
import { CDType } from '../../types';
import { consultantsAPI } from '../../src/services/api';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface AddCDModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface UserProfile {
    user_id: string;
    auth_user_id?: string;
    full_name: string;
    numeric_id?: string;
    login_id?: string;
    email: string;
    cpf: string;
    whatsapp: string;
    address_street?: string;
    address_number?: string;
    address_neighborhood?: string;
    address_city?: string;
    address_state?: string;
    address_zip?: string;
}

const AddCDModal: React.FC<AddCDModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
    const [processing, setProcessing] = useState(false);

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
        if (!foundUser) return;
        setCdName(foundUser.full_name);
        setEmail(foundUser.email);
        setPhone(foundUser.whatsapp);
        setStreet(foundUser.address_street || '');
        setNumber(foundUser.address_number || '');
        setNeighborhood(foundUser.address_neighborhood || '');
        setCity(foundUser.address_city || '');
        setState(foundUser.address_state || '');
        setZip(foundUser.address_zip || '');
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

        try {
            if (!isUUID && !isEmail && term.length < 3) {
                throw new Error('Use ID CONTA, LOGIN/MMN, nome, CPF ou E-mail para buscar.');
            }

            const searchResponse: any = await consultantsAPI.search(term);
            const results = Array.isArray(searchResponse?.results)
                ? searchResponse.results
                : Array.isArray(searchResponse?.data?.results)
                    ? searchResponse.data.results
                    : [];
            const match = results[0];

            if (!match?.id) {
                setError('Consultor nao encontrado na base de dados.');
                return;
            }

            const fullResponse: any = await consultantsAPI.getFull(match.id);
            const full = fullResponse?.consultant || fullResponse?.data?.consultant;
            if (!full?.id) {
                throw new Error('Nao foi possivel carregar os dados completos do consultor.');
            }

            setFoundUser({
                user_id: full.id,
                auth_user_id: full.auth_user_id || full.user_id || full.id,
                full_name: full.name || match.nome || '',
                numeric_id: String(full.numeric_id || match.numericId || ''),
                login_id: String(full.consultant_id || match.loginId || ''),
                email: full.email || match.email || '',
                cpf: full.cpf_cnpj || match.cpfCnpj || '',
                whatsapp: full.phone || match.whatsapp || '',
                address_street: full.address?.street || '',
                address_number: full.address?.number || '',
                address_neighborhood: full.address?.neighborhood || '',
                address_city: full.address?.city || '',
                address_state: full.address?.state || '',
                address_zip: full.address?.cep || '',
            });
        } catch (err: any) {
            setError(err?.message || 'Erro ao buscar consultor.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!foundUser) return;
        setProcessing(true);
        setError(null);

        try {
            const response = await fetch(`${apiBaseUrl}/v1/cds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    consultant_id: foundUser.user_id,
                    auth_user_id: foundUser.auth_user_id || foundUser.user_id,
                    name: cdName,
                    owner_name: foundUser.full_name,
                    email,
                    phone,
                    cnpj_cpf: foundUser.cpf,
                    type: cdType.toLowerCase(),
                    address_street: street,
                    address_number: number,
                    address_neighborhood: neighborhood,
                    address_city: city,
                    address_state: state,
                    address_zip: zip,
                    status: 'active',
                }),
            });

            const json = await response.json().catch(() => ({}));
            if (!response.ok || json?.success === false) {
                throw new Error(json?.error || 'Erro ao salvar CD.');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Erro ao salvar CD.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-2xl overflow-hidden rounded-xl border border-gray-700 bg-[#1E1E1E] shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-700 bg-[#2A2A2A] p-4">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                        <UserPlusIcon className="h-6 w-6 text-yellow-500" />
                        Novo Cadastro de CD
                    </h2>
                    <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-gray-500">
                            Buscar Consultor
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1 rounded-lg border border-gray-700 bg-black/40 px-4 py-3 text-white outline-none placeholder-gray-600 focus:border-yellow-500"
                                placeholder="ID CONTA, LOGIN/MMN, nome, CPF ou E-mail..."
                            />
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-lg bg-yellow-500 px-6 font-bold text-black hover:bg-yellow-400"
                            >
                                {loading ? <SpinnerIcon className="h-5 w-5 animate-spin" /> : <MagnifyingGlassIcon className="h-5 w-5" />}
                                BUSCAR
                            </button>
                        </div>
                        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                        <p className="mt-2 text-xs text-gray-500">
                            Cada consultor possui um unico CD vinculado. Se ja existir um CD para esse consultor, este cadastro atualiza o registro atual.
                        </p>
                    </div>

                    {foundUser && (
                        <div className="animate-in slide-in-from-top-4 space-y-6 duration-300">
                            <div className="rounded-lg border border-yellow-500/20 bg-black/20 px-4 py-3">
                                <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
                                    {foundUser.numeric_id && (
                                        <span className="rounded-full border border-yellow-500/30 px-3 py-1 text-yellow-400">
                                            ID Conta: {foundUser.numeric_id}
                                        </span>
                                    )}
                                    {foundUser.login_id && (
                                        <span className="rounded-full border border-yellow-500/30 px-3 py-1 text-yellow-400">
                                            Login/MMN: {foundUser.login_id}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-yellow-500">
                                        <IdentificationIcon className="h-4 w-4" /> Dados do CD
                                    </h3>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-500">Nome do Centro de Distribuicao</label>
                                        <input value={cdName} onChange={(e) => setCdName(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-500">Modelo</label>
                                            <select value={cdType} onChange={(e) => setCdType(e.target.value as CDType)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
                                                <option value="FRANQUIA">Franquia</option>
                                                <option value="PROPRIO">Proprio</option>
                                                <option value="HIBRIDO">Hibrido</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-500">WhatsApp</label>
                                            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-500">E-mail de Contato</label>
                                        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-yellow-500">
                                        <MapPinIcon className="h-4 w-4" /> Localizacao Completa
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-bold uppercase text-gray-500">Rua / Logradouro</label>
                                            <input value={street} onChange={(e) => setStreet(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-500">Numero</label>
                                            <input value={number} onChange={(e) => setNumber(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-500">Bairro</label>
                                        <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-bold uppercase text-gray-500">Cidade</label>
                                            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-500">UF</label>
                                            <input value={state} onChange={(e) => setState(e.target.value)} maxLength={2} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-500">CEP</label>
                                        <input value={zip} onChange={(e) => setZip(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
                                <button onClick={onClose} className="px-6 py-2 font-bold text-gray-400 transition-colors hover:text-white">
                                    CANCELAR
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={processing}
                                    className="rounded-lg bg-yellow-500 px-8 py-2 font-bold text-black shadow-lg shadow-yellow-500/20 transition-all active:scale-95 hover:bg-yellow-400"
                                >
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
