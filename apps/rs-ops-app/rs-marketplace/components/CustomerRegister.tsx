import React, { useState } from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { Customer } from '../types';

interface CustomerRegisterProps {
  onRegister: (customerData: Omit<Customer, 'id'>) => void;
  onBackToHome: () => void;
  onNavigateToLogin: () => void;
  existingCustomers: Customer[];
}

const CustomerRegister: React.FC<CustomerRegisterProps> = ({ onRegister, onBackToHome, onNavigateToLogin, existingCustomers }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
        setError('Por favor, preencha todos os campos.');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem.');
        return;
    }

    if (existingCustomers.some(c => c.email.toLowerCase() === formData.email.toLowerCase())) {
        setError('Este e-mail já está em uso.');
        return;
    }

    onRegister({ name: formData.name, email: formData.email, passwordHash: formData.password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-black border-2 border-yellow-600/30 rounded-lg shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold text-center font-display text-gold-400">
            Criar Conta
          </h2>
          <p className="mt-2 text-center text-gray-400">
            Crie sua conta para uma experiência de compra mais rápida.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
             <div>
              <label htmlFor="name" className="sr-only">Nome Completo</label>
              <input id="name" name="name" type="text" required value={formData.name} onChange={handleInputChange} className="appearance-none relative block w-full px-3 py-3 border-2 border-slate-700 bg-slate-800 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" placeholder="Nome Completo" />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">E-mail</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleInputChange} className="appearance-none relative block w-full px-3 py-3 border-2 border-slate-700 bg-slate-800 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" placeholder="E-mail" />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Senha</label>
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleInputChange} className="appearance-none relative block w-full px-3 py-3 border-2 border-slate-700 bg-slate-800 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm pr-10" placeholder="Senha" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400"><EyeIcon className="h-5 w-5" /></button>
            </div>
             <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">Confirmar Senha</label>
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleInputChange} className="appearance-none relative block w-full px-3 py-3 border-2 border-slate-700 bg-slate-800 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm pr-10" placeholder="Confirmar Senha" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400"><EyeIcon className="h-5 w-5" /></button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center !mt-4">{error}</p>}

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-black bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 transition-colors mt-6">
              Cadastrar
            </button>
          </div>
        </form>
        <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
                Já tem uma conta?{' '}
                <button onClick={onNavigateToLogin} className="font-medium text-gold-500 hover:text-gold-400">
                    Entrar
                </button>
            </p>
            <button onClick={onBackToHome} className="font-medium text-sm text-gold-500 hover:text-gold-400">
                Voltar para a loja
            </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;