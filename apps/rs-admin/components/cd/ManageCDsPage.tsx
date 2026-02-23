import React, { useState, useEffect } from 'react';
import { supabase } from "../../src/services/supabase";
import { TruckIcon, UserPlusIcon, SpinnerIcon } from '../icons';
import AddCDModal from './AddCDModal';

interface DistributionCenter {
    id: string; // UUID from minisite_profiles
    consultantId: string; // Same ID
    responsible: string; // name
    cpf: string; // cpf
    whatsapp: string; // phone
    address: {
        cep: string;
        street: string;
        number: string;
        district: string;
        city: string;
        state: string;
    };
    balance: number; // wallet_balance
    status: 'Ativo' | 'Inativo';
    pixKeyType: string;
    pixKey: string;
    shippingMethod: string;
    shippingNotes: string;
}

const statusClasses = { Ativo: 'bg-green-600/20 text-green-400', Inativo: 'bg-red-600/20 text-red-400' };

const ManageCDsPage: React.FC<{ navigateToCdStore: (id: number) => void }> = ({ navigateToCdStore }) => {
    const [cds, setCds] = useState<DistributionCenter[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        loadCDs();
    }, []);

    const loadCDs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('minisite_profiles')
                .select('*')
                .eq('type', 'cd');

            if (error) throw error;

            if (data) {
                const mappedCDs: DistributionCenter[] = data.map(profile => ({
                    id: profile.id,
                    consultantId: profile.consultant_id || profile.id, // Fallback
                    responsible: profile.name,
                    cpf: profile.cpf || '',
                    whatsapp: profile.phone || '',
                    address: {
                        cep: profile.address_zip || '',
                        street: profile.address_street || '',
                        number: profile.address_number || '',
                        district: profile.address_neighborhood || '',
                        city: profile.address_city || '',
                        state: profile.address_state || ''
                    },
                    balance: parseFloat(profile.wallet_balance || '0'),
                    status: 'Ativo', // Default to active if present
                    pixKeyType: '', // Not in profile yet, or stored in JSON settings if needed
                    pixKey: '',
                    shippingMethod: '',
                    shippingNotes: ''
                }));
                setCds(mappedCDs);
            }
        } catch (error) {
            console.error('Erro ao carregar CDs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCD = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover o status de CD deste usuário?')) return;
        try {
            const { error } = await supabase
                .from('minisite_profiles')
                .update({ type: 'consultant' }) // Reverte para consultor padrão
                .eq('id', id);

            if (error) throw error;
            loadCDs();
        } catch (error) {
            console.error('Erro ao remover CD:', error);
            alert('Erro ao remover status de CD');
        }
    };


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <TruckIcon className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold text-yellow-500 ml-3">Gerenciar Centros de Distribuição</h1>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    Novo CD
                </button>
            </header>

            <AddCDModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    loadCDs();
                }}
            />

            <div className="bg-black/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-black/30 border-b border-gray-800">
                    <h2 className="text-xl font-semibold text-white">CDs Cadastrados</h2>
                </header>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-yellow-500 uppercase bg-black/30">
                            <tr>
                                <th className="px-6 py-4">Responsável</th>
                                <th className="px-6 py-4">Localização</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-8"><SpinnerIcon className="w-8 h-8 animate-spin mx-auto text-yellow-500" /></td></tr>
                            ) : cds.length > 0 ? (
                                cds.map(cd => (
                                    <tr key={cd.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{cd.responsible}</div>
                                            <div className="text-xs text-gray-500">{cd.whatsapp}</div>
                                        </td>
                                        <td className="px-6 py-4">{cd.address.city} - {cd.address.state}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses.Ativo}`}>Ativo</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleRemoveCD(cd.id)}
                                                className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider bg-red-900/20 px-3 py-1 rounded"
                                            >
                                                Remover
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">Nenhum Centro de Distribuição cadastrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageCDsPage;