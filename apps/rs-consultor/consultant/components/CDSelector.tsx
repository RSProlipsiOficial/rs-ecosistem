import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { IconMapPin, IconCheck, IconTruck } from '../../components/icons';
import Card from '../../components/Card';

interface CD {
    id: string;
    name: string;
    city: string;
    state: string;
}

export const CDSelector: React.FC = () => {
    const [cds, setCds] = useState<CD[]>([]);
    const [selectedCdId, setSelectedCdId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadCDs();
        loadUserCD();
    }, []);

    const loadCDs = async () => {
        try {
            // Fetch users with type='cd'
            const { data, error } = await supabase
                .from('minisite_profiles')
                .select('id, name, address_city, address_state')
                .eq('type', 'cd');

            if (error) throw error;

            if (data) {
                setCds(data.map(d => ({
                    id: d.id,
                    name: d.name || 'CD Sem Nome',
                    city: d.address_city || '-',
                    state: d.address_state || '-'
                })));
            }
        } catch (error) {
            console.error('Erro ao carregar CDs:', error);
        }
    };

    const loadUserCD = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);

            const { data, error } = await supabase
                .from('minisite_profiles')
                .select('cd_id')
                .eq('id', user.id)
                .single();

            if (data) {
                setSelectedCdId(data.cd_id);
            }
        } catch (error) {
            console.error('Erro ao carregar CD do usuário:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (cdId: string) => {
        if (!user) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('minisite_profiles')
                .update({ cd_id: cdId })
                .eq('id', user.id);

            if (error) throw error;
            setSelectedCdId(cdId);
            alert('CD de preferência atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar CD:', error);
            alert('Erro ao atualizar CD.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white">Carregando opções de CD...</div>;

    return (
        <Card className="mb-6 border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center gap-3 mb-4">
                <IconTruck className="w-6 h-6 text-yellow-500" />
                <div>
                    <h3 className="text-lg font-bold text-white">Vincular Centro de Distribuição (CD)</h3>
                    <p className="text-xs text-gray-400">Escolha o CD responsável pela sua logística e pontuação de matriz.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cds.map(cd => {
                    const isSelected = selectedCdId === cd.id;
                    const isSede = cd.name.toLowerCase().includes('prólipsi') || cd.name.toLowerCase().includes('sede');

                    return (
                        <div
                            key={cd.id}
                            onClick={() => handleSave(cd.id)}
                            className={`
                                cursor-pointer rounded-lg p-4 border transition-all relative
                                ${isSelected
                                    ? 'bg-yellow-500/20 border-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                    : 'bg-black/40 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-white/5'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-sm mb-1">{cd.name} {isSede && <span className="bg-yellow-500 text-black text-[9px] px-1.5 py-0.5 rounded font-bold ml-1">OFICIAL</span>}</h4>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <IconMapPin size={12} />
                                        {cd.city || 'N/A'} / {cd.state || 'UF'}
                                    </p>
                                </div>
                                {isSelected && <IconCheck className="text-yellow-500" size={18} />}
                            </div>
                        </div>
                    );
                })}
            </div>
            {!selectedCdId && (
                <p className="text-xs text-yellow-500/80 mt-3 flex items-center gap-2">
                    * Por padrão, sua conta está vinculada à Sede. Selecione outro CD se desejar alterar.
                </p>
            )}
        </Card>
    );
};
