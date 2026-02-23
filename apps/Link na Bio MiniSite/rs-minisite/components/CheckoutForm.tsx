import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShoppingBag, MapPin, User, Mail, Calendar, Phone, Hash, Loader2, ShieldCheck } from 'lucide-react';
import { UserProfile, UserPlan, PlanDefinition } from '../types';

interface CheckoutFormProps {
    user: UserProfile;
    plan: PlanDefinition;
    platformSettings?: { mpPublicKey?: string; platformName?: string };
    onClose: () => void;
    onSuccess: (data: any) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ user, plan, platformSettings, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isZipLoading, setIsZipLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        cpf: user.cpf || '',
        phone: user.phone || '',
        birthDate: '',
        zip: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: ''
    });

    const handleZipBlur = async () => {
        const zip = formData.zip.replace(/\D/g, '');
        if (zip.length !== 8) return;

        setIsZipLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    street: data.logradouro || '',
                    neighborhood: data.bairro || '',
                    city: data.localidade || '',
                    state: data.uf || ''
                }));
            }
        } catch (error) {
            console.error("ViaCEP Error:", error);
        } finally {
            setIsZipLoading(true);
            setTimeout(() => setIsZipLoading(false), 500);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulation of Payment / Data Save
        setTimeout(() => {
            setIsLoading(false);
            onSuccess(formData);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-rs-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
                {/* Header */}
                <div className="p-6 border-b border-rs-gold/10 flex justify-between items-center bg-rs-gold/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rs-gold/10 rounded-lg text-rs-gold">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-serif font-bold text-white uppercase tracking-wider">Finalizar Assinatura</h3>
                            <p className="text-xs text-rs-gold font-bold">Plano: {plan.name} • {plan.price}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {platformSettings?.mpPublicKey && (
                            <div className="hidden sm:flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                                <ShieldCheck size={14} className="text-blue-400" />
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Mercado Pago Secure</span>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[70vh]">

                    {/* PERSONAL DATA */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-rs-gold mb-4 border-b border-rs-gold/10 pb-2">
                            <User size={18} />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Dados Pessoais</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg text-white outline-none focus:border-rs-gold transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: João Silva"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CPF</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg text-white outline-none focus:border-rs-gold transition-all"
                                    value={formData.cpf}
                                    onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                    placeholder="000.000.000-00"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Data de Nascimento</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg text-white outline-none focus:border-rs-gold transition-all"
                                    value={formData.birthDate}
                                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">E-mail</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg text-white outline-none focus:border-rs-gold transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Telefone / WhatsApp</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg text-white outline-none focus:border-rs-gold transition-all"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ADDRESS DATA */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-rs-gold mb-4 border-b border-rs-gold/10 pb-2">
                            <MapPin size={18} />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Endereço de Entrega / Cobrança</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CEP</label>
                                <div className="relative">
                                    <input
                                        required
                                        className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg text-white outline-none focus:border-rs-gold transition-all"
                                        value={formData.zip}
                                        onChange={e => setFormData({ ...formData, zip: e.target.value })}
                                        onBlur={handleZipBlur}
                                        placeholder="00000-000"
                                    />
                                    {isZipLoading && <Loader2 className="absolute right-3 top-3 animate-spin text-rs-gold" size={18} />}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Rua / Logradouro</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg text-white outline-none focus:border-rs-gold transition-all"
                                    value={formData.street}
                                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                                    placeholder="Ex: Av. Paulista"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Número</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg text-white outline-none focus:border-rs-gold transition-all"
                                    value={formData.number}
                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    placeholder="123"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bairro</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg text-white outline-none focus:border-rs-gold transition-all"
                                    value={formData.neighborhood}
                                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                    placeholder="Ex: Centro"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cidade</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg text-white outline-none focus:border-rs-gold transition-all"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Ex: São Paulo"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Estado (UF)</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-rs-gray p-3 rounded-lg text-white outline-none focus:border-rs-gold transition-all"
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="SP"
                                    maxLength={2}
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer / CTA */}
                <div className="p-8 border-t border-rs-gold/10 bg-rs-gold/5 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 border border-rs-gray hover:border-white/30 text-white font-bold rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-[2] py-4 bg-rs-gold hover:bg-rs-goldDark text-black font-bold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                <ShoppingBag size={24} />
                                {platformSettings?.mpPublicKey ? 'PAGAR VIA MERCADO PAGO' : 'PAGAR E ATIVAR AGORA'}
                            </>
                        )}
                    </button>
                </div>
                {platformSettings?.mpPublicKey && (
                    <div className="px-8 pb-4 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        <Lock size={12} className="text-rs-gold" />
                        Processado por {platformSettings?.platformName || 'RS MiniSite'} Gateway
                    </div>
                )}
            </div>
        </div>
    );
};
