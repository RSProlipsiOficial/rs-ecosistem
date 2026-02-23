
import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Building, Smartphone, FileText, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { CheckoutProfile } from '../../types';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (profile: CheckoutProfile) => void;
    productName: string;
    productPrice: string;
    theme: any;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onComplete, productName, productPrice, theme }) => {
    const [step, setStep] = useState(1); // 1: Personal, 2: Address, 3: Review
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CheckoutProfile>({
        nome_completo: '',
        cpf: '',
        data_nascimento: '',
        telefone: '',
        email: '',
        empresa: '',
        endereco_cep: '',
        endereco_rua: '',
        endereco_numero: '',
        endereco_bairro: '',
        endereco_cidade: '',
        endereco_estado: ''
    });

    if (!isOpen) return null;

    const handleInputChange = (field: keyof CheckoutProfile, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Formatters
    const formatCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14);
    const formatPhone = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15);
    const formatCEP = (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2').substring(0, 9);

    const handleCepBlur = async () => {
        const cep = formData.endereco_cep.replace(/\D/g, '');
        if (cep.length === 8) {
            setLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        endereco_rua: data.logradouro,
                        endereco_bairro: data.bairro,
                        endereco_cidade: data.localidade,
                        endereco_estado: data.uf
                    }));
                }
            } catch (error) {
                // Security: Don't reveal internal error details to the user
                console.warn('CEP lookup failed');
            } finally {
                setLoading(false);
            }
        }
    };

    const isStep1Valid = formData.nome_completo && formData.cpf.length >= 11 && formData.telefone.length >= 10 && formData.data_nascimento;
    const isStep2Valid = formData.endereco_cep.length >= 8 && formData.endereco_rua && formData.endereco_numero && formData.endereco_bairro && formData.endereco_cidade && formData.endereco_estado;

    const handleSubmit = () => {
        onComplete(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.primaryColor }}>
                            <Lock size={20} /> Checkout Seguro
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Finalize seu cadastro para adquirir: <span className="font-semibold">{productName}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    {/* Steps Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-sm ${step >= 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>1</div>
                            <span className="text-[10px] uppercase font-bold tracking-wider">Pessoal</span>
                        </div>
                        <div className={`h-[2px] w-12 mx-2 ${step >= 2 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-sm ${step >= 2 ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>2</div>
                            <span className="text-[10px] uppercase font-bold tracking-wider">Endereço</span>
                        </div>
                        <div className={`h-[2px] w-12 mx-2 ${step >= 3 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        <div className={`flex flex-col items-center flex-1 ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-sm ${step >= 3 ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>3</div>
                            <span className="text-[10px] uppercase font-bold tracking-wider">Revisão</span>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                            <h3 className="text-sm font-bold uppercase text-gray-500 flex items-center gap-2 mb-4">
                                <User size={16} /> Dados Pessoais
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Nome Completo *</label>
                                    <input
                                        type="text"
                                        value={formData.nome_completo}
                                        onChange={e => handleInputChange('nome_completo', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => handleInputChange('email', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">CPF *</label>
                                    <input
                                        type="text"
                                        maxLength={14}
                                        value={formData.cpf}
                                        onChange={e => handleInputChange('cpf', formatCPF(e.target.value))}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Data de Nascimento *</label>
                                    <input
                                        type="date"
                                        value={formData.data_nascimento}
                                        onChange={e => handleInputChange('data_nascimento', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">WhatsApp / Celular *</label>
                                    <input
                                        type="text"
                                        maxLength={15}
                                        value={formData.telefone}
                                        onChange={e => handleInputChange('telefone', formatPhone(e.target.value))}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Empresa (Opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.empresa}
                                        onChange={e => handleInputChange('empresa', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Nome da sua empresa"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
                            <h3 className="text-sm font-bold uppercase text-gray-500 flex items-center gap-2 mb-4">
                                <MapPin size={16} /> Endereço Completo
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">CEP *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={9}
                                            value={formData.endereco_cep}
                                            onChange={e => handleInputChange('endereco_cep', formatCEP(e.target.value))}
                                            onBlur={handleCepBlur}
                                            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="00000-000"
                                        />
                                        {loading && <span className="absolute right-3 top-3 text-xs text-gray-400">Buscando...</span>}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Rua / Logradouro *</label>
                                    <input
                                        type="text"
                                        value={formData.endereco_rua}
                                        onChange={e => handleInputChange('endereco_rua', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Número *</label>
                                    <input
                                        type="text"
                                        value={formData.endereco_numero}
                                        onChange={e => handleInputChange('endereco_numero', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Bairro *</label>
                                    <input
                                        type="text"
                                        value={formData.endereco_bairro}
                                        onChange={e => handleInputChange('endereco_bairro', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Cidade *</label>
                                    <input
                                        type="text"
                                        value={formData.endereco_cidade}
                                        onChange={e => handleInputChange('endereco_cidade', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Estado (UF) *</label>
                                    <input
                                        type="text"
                                        maxLength={2}
                                        value={formData.endereco_estado}
                                        onChange={e => handleInputChange('endereco_estado', e.target.value.toUpperCase())}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-dotted border-gray-200 dark:border-gray-700 text-center">
                                <p className="text-gray-500 text-sm mb-2">Você está adquirindo:</p>
                                <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">{productName}</h3>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{productPrice}</p>
                            </div>

                            <div className="text-xs text-gray-500 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg flex gap-3">
                                <CheckCircle className="shrink-0 text-blue-500" size={16} />
                                <p>Ao continuar, você confirma que seus dados estão corretos. Suas informações estão protegidas.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-6 flex justify-between">
                    <button
                        onClick={() => setStep(prev => Math.max(1, prev - 1))}
                        disabled={step === 1}
                        className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                    >
                        Voltar
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(prev => prev + 1)}
                            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                            className={`px-8 py-3 rounded-xl text-sm font-bold text-white transition-all transform active:scale-95 shadow-lg ${(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)
                                ? 'bg-gray-300 dark:bg-gray-800 cursor-not-allowed text-gray-500'
                                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'
                                }`}
                        >
                            Continuar
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-500 transition-all transform active:scale-95 shadow-lg flex items-center gap-2"
                        >
                            <CreditCard size={18} /> Finalizar Compra
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
