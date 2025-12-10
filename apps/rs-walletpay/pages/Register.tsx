
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Modal from '../components/Modal';

interface FormData {
    sponsorId: string;
    sponsorName: string;
    fullName: string;
    email: string;
    whatsapp: string;
    cpf: string;
    birthDate: string;
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    password: string;
    confirmPassword: string;
}

const PlaceholderAvatar = () => (
    <div className="w-24 h-24 rounded-full border-4 border-surface bg-surface flex items-center justify-center">
        <svg className="w-12 h-12 text-text-soft" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    </div>
);


const Register: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState<FormData>({
        sponsorId: '', sponsorName: 'Carregando...', fullName: '', email: '', whatsapp: '',
        cpf: '', birthDate: '', cep: '', street: '', number: '', complement: '',
        neighborhood: '', city: '', state: '', password: '', confirmPassword: ''
    });
    const [isRegistered, setIsRegistered] = useState(false);
    const [newUser, setNewUser] = useState({ id: '', link: '' });
    const [cepLoading, setCepLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const sponsorId = searchParams.get('sponsor');
        if (sponsorId) {
            // Mock sponsor lookup - in a real app, this would be an API call
            setFormData(prev => ({ ...prev, sponsorId, sponsorName: 'Patrocinador não encontrado' }));
        } else {
            setFormData(prev => ({ ...prev, sponsorName: 'Nenhum patrocinador informado' }));
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setCepLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error('CEP não encontrado');
            const data = await response.json();
            if (data.erro) throw new Error('CEP inválido');

            setFormData(prev => ({
                ...prev,
                street: data.logradouro,
                neighborhood: data.bairro,
                city: data.localidade,
                state: data.uf
            }));
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            alert("Não foi possível encontrar o CEP informado. Verifique e tente novamente.");
        } finally {
            setCepLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('As senhas não conferem.');
            return;
        }
        // Mock registration success
        const newId = `RS${Math.floor(100000 + Math.random() * 900000)}`;
        const newLink = `${window.location.origin}/#/register?sponsor=${newId}`;
        setNewUser({ id: newId, link: newLink });
        setIsRegistered(true);
    };

    const InputField: React.FC<{ name: keyof FormData, label: string, type?: string, placeholder?: string, required?: boolean, disabled?: boolean }> =
     ({ name, label, type = 'text', placeholder, required = false, disabled = false }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-text-body mb-2">{label}</label>
            <input
                type={type}
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                onBlur={name === 'cep' ? handleCepBlur : undefined}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all disabled:opacity-50"
            />
        </div>
    );
    
    return (
        <div className="bg-base min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gold">RS WalletPay</h1>
                    <p className="text-text-body mt-2">Crie sua conta de consultor</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Sponsor Data */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-custom-lg">
                        <h2 className="text-xl font-semibold text-text-title mb-4">Dados do Patrocinador</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField name="sponsorId" label="ID do Patrocinador" placeholder="Opcional"/>
                            <div>
                                <label className="block text-sm font-medium text-text-body mb-2">Nome do Patrocinador</label>
                                <div className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-text-soft">
                                    {formData.sponsorName}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Data */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-custom-lg">
                        <h2 className="text-xl font-semibold text-text-title mb-6">Dados Pessoais</h2>
                        
                        <div className="flex flex-col items-center mb-6">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div onClick={handleAvatarClick} className="relative cursor-pointer group">
                                {avatarPreview ? (
                                     <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-surface object-cover" />
                                ) : (
                                    <PlaceholderAvatar />
                                )}
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                            </div>
                            <p className="text-sm text-text-soft mt-2">Anexar foto do consultor</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField name="fullName" label="Nome Completo" required />
                            <InputField name="email" label="E-mail" type="email" required />
                            <InputField name="whatsapp" label="WhatsApp" type="tel" placeholder="(99) 99999-9999" required />
                            <InputField name="cpf" label="CPF" placeholder="000.000.000-00" required />
                            <InputField name="birthDate" label="Data de Nascimento" type="date" required />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-custom-lg">
                        <h2 className="text-xl font-semibold text-text-title mb-4">Endereço</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <InputField name="cep" label="CEP" required />
                            </div>
                            <div className="md:col-span-2">
                                <InputField name="street" label="Logradouro" disabled={cepLoading} required />
                            </div>
                            <InputField name="number" label="Número" required />
                            <InputField name="complement" label="Complemento" />
                            <InputField name="neighborhood" label="Bairro" disabled={cepLoading} required />
                            <InputField name="city" label="Cidade" disabled={cepLoading} required />
                            <InputField name="state" label="Estado" disabled={cepLoading} required />
                        </div>
                    </div>
                    
                    {/* Access Data */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-custom-lg">
                        <h2 className="text-xl font-semibold text-text-title mb-4">Dados de Acesso</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <InputField name="password" label="Senha" type="password" required />
                             <InputField name="confirmPassword" label="Confirmar Senha" type="password" required />
                        </div>
                    </div>

                    <button type="submit" className="w-full text-center py-4 px-6 bg-gold text-lg text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors duration-200">
                        Finalizar Cadastro
                    </button>
                </form>
            </div>
            <Modal isOpen={isRegistered} onClose={() => setIsRegistered(false)} title="Cadastro Realizado com Sucesso!">
                <div className="text-center p-4">
                    {avatarPreview && (
                        <img src={avatarPreview} alt="Novo consultor" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-surface object-cover" />
                    )}
                    <p className="text-lg text-text-body mb-4">
                        Bem-vindo(a) à RS Prólipsi! Seu cadastro foi concluído.
                    </p>
                    <div className="bg-surface p-4 rounded-lg border border-border space-y-3 my-6">
                        <div>
                            <p className="text-sm text-text-soft">Seu ID de Consultor:</p>
                            <p className="font-bold text-gold text-xl">{newUser.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-text-soft">Seu link de cadastro para compartilhar:</p>
                            <input
                                readOnly
                                value={newUser.link}
                                className="w-full text-center bg-card border border-border rounded-md p-2 mt-1 text-sm text-text-body"
                            />
                        </div>
                    </div>
                    <button onClick={() => setIsRegistered(false)} className="mt-4 w-full sm:w-auto text-center py-2 px-8 bg-gold text-base text-card hover:bg-gold-hover font-semibold rounded-lg">
                        Fechar
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Register;
