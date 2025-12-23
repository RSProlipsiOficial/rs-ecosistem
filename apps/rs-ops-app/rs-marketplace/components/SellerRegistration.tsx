import React, { useState } from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';

interface SellerRegistrationProps {
  onRegisterSuccess: () => void;
  onBackToHome: () => void;
}

const SellerRegistration: React.FC<SellerRegistrationProps> = ({ onRegisterSuccess, onBackToHome }) => {
    const [formData, setFormData] = useState({
        sponsorId: 'RS Prólipsi',
        nomeCompleto: '',
        cpfCnpj: '',
        email: '',
        telefone: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        nomeLoja: '',
        codigoIndicacao: '',
        senha: '',
        confirmarSenha: '',
        termos: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.senha !== formData.confirmarSenha) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!formData.termos) {
            setError('Você deve aceitar os termos e condições.');
            return;
        }

        console.log('Dados do formulário:', formData);
        alert('Cadastro realizado com sucesso! Em breve, nossa equipe da sede entrará em contato para finalizar seu credenciamento.');
        onRegisterSuccess();
    };
    
    const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    );

    const FormField: React.FC<{ name: string; label: string; type?: string; required?: boolean; fullWidth?: boolean; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; children?: React.ReactNode }> = ({ name, label, type = 'text', required = false, fullWidth = false, value, onChange, children }) => (
      <div className={fullWidth ? 'sm:col-span-2' : ''}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
          type={type}
          name={name}
          id={name}
          required={required}
          value={value}
          onChange={onChange}
          className="appearance-none block w-full px-3 py-2 border-2 border-dark-700 bg-dark-800 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-gold-500 sm:text-sm"
        />
        {children}
      </div>
    );

    return (
        <div className="bg-black min-h-screen py-12 px-4">
            <div className="w-full max-w-4xl mx-auto p-8 space-y-8 bg-black border-2 border-yellow-600/30 rounded-lg shadow-2xl">
                <div>
                    <h2 className="text-3xl font-bold text-center font-display text-gold-400">
                        Cadastro de Lojista
                    </h2>
                    <p className="mt-2 text-center text-gray-400">
                        Faça parte do nosso marketplace premium.
                    </p>
                </div>
                <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
                    {/* Patrocinador */}
                     <fieldset className="space-y-4">
                        <legend className="text-lg font-semibold text-white mb-4">Patrocinador</legend>
                        <FormRow>
                            <FormField 
                                name="sponsorId" 
                                label="ID ou Nome do Patrocinador" 
                                required 
                                value={formData.sponsorId} 
                                onChange={handleInputChange} 
                                fullWidth
                            >
                                <p className="text-xs text-gray-500 mt-1">
                                    Seu cadastro deve ser vinculado a um patrocinador. Se não tiver um, mantenha o ID da empresa. O link de indicação preencherá este campo automaticamente.
                                </p>
                            </FormField>
                        </FormRow>
                    </fieldset>

                    {/* Dados Pessoais */}
                    <fieldset className="space-y-4 border-t-2 border-dark-800 pt-6">
                        <legend className="text-lg font-semibold text-white px-2 -mt-10 bg-black">Dados Pessoais</legend>
                        <FormRow>
                            <FormField name="nomeCompleto" label="Nome Completo" required value={formData.nomeCompleto} onChange={handleInputChange} fullWidth />
                            <FormField name="cpfCnpj" label="CPF / CNPJ" required value={formData.cpfCnpj} onChange={handleInputChange} />
                            <FormField name="email" label="E-mail" type="email" required value={formData.email} onChange={handleInputChange} />
                            <FormField name="telefone" label="Telefone / WhatsApp" type="tel" required value={formData.telefone} onChange={handleInputChange} />
                        </FormRow>
                    </fieldset>

                    {/* Endereço */}
                    <fieldset className="space-y-4 border-t-2 border-dark-800 pt-6">
                        <legend className="text-lg font-semibold text-white px-2 -mt-10 bg-black">Endereço</legend>
                        <FormRow>
                            <FormField name="cep" label="CEP" required value={formData.cep} onChange={handleInputChange} />
                            <FormField name="logradouro" label="Logradouro (Rua, Av.)" required value={formData.logradouro} onChange={handleInputChange} />
                            <FormField name="numero" label="Número" required value={formData.numero} onChange={handleInputChange} />
                            <FormField name="complemento" label="Complemento" value={formData.complemento} onChange={handleInputChange} />
                            <FormField name="bairro" label="Bairro" required value={formData.bairro} onChange={handleInputChange} />
                            <FormField name="cidade" label="Cidade" required value={formData.cidade} onChange={handleInputChange} />
                            <FormField name="estado" label="Estado (UF)" required value={formData.estado} onChange={handleInputChange} />
                        </FormRow>
                    </fieldset>
                    
                     {/* Dados da Loja */}
                    <fieldset className="space-y-4 border-t-2 border-dark-800 pt-6">
                        <legend className="text-lg font-semibold text-white px-2 -mt-10 bg-black">Dados da Loja</legend>
                        <FormRow>
                            <FormField name="nomeLoja" label="Nome da Loja" required value={formData.nomeLoja} onChange={handleInputChange} fullWidth />
                             <FormField name="codigoIndicacao" label="Código de Indicação" required value={formData.codigoIndicacao} onChange={handleInputChange} fullWidth>
                                 <p className="text-xs text-gray-500 mt-1">Este cadastro deve ser feito através de um indicador da Sede.</p>
                             </FormField>
                        </FormRow>
                    </fieldset>

                     {/* Acesso */}
                    <fieldset className="space-y-4 border-t-2 border-dark-800 pt-6">
                        <legend className="text-lg font-semibold text-white px-2 -mt-10 bg-black">Dados de Acesso</legend>
                        <FormRow>
                           <div className="relative">
                                <label htmlFor="senha" className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
                                <input id="senha" name="senha" type={showPassword ? 'text' : 'password'} required value={formData.senha} onChange={handleInputChange} className="appearance-none block w-full px-3 py-2 border-2 border-dark-700 bg-dark-800 text-white rounded-md pr-10" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute bottom-2 right-3 text-gray-400">
                                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                           </div>
                           <div className="relative">
                                <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-300 mb-1">Confirmar Senha</label>
                                <input id="confirmarSenha" name="confirmarSenha" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmarSenha} onChange={handleInputChange} className="appearance-none block w-full px-3 py-2 border-2 border-dark-700 bg-dark-800 text-white rounded-md pr-10" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute bottom-2 right-3 text-gray-400">
                                    {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                           </div>
                        </FormRow>
                    </fieldset>

                    {error && (
                        <p className="text-red-500 text-sm text-center !mt-4">{error}</p>
                    )}
                    
                    <div className="pt-4">
                        <div className="flex items-center">
                            <input id="termos" name="termos" type="checkbox" checked={formData.termos} onChange={handleInputChange} className="h-4 w-4 text-gold-500 bg-dark-700 border-dark-700 rounded focus:ring-yellow-600"/>
                            <label htmlFor="termos" className="ml-2 block text-sm text-gray-300">
                                Eu li e aceito os <a href="#" className="font-medium text-gold-500 hover:text-gold-400">Termos e Condições</a>
                            </label>
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-gold-500 hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-500 transition-colors mt-6">
                            Finalizar Cadastro
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button onClick={onBackToHome} className="font-medium text-sm text-gold-500 hover:text-gold-400">
                        Voltar para a loja
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellerRegistration;