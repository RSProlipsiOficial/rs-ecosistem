import React, { useState } from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { Customer } from '../types';

interface CustomerLoginProps {
  customers: Customer[];
  onLoginSuccess: (customer: Customer) => void;
  onBackToHome: () => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

const CustomerLogin: React.FC<CustomerLoginProps> = ({ customers, onLoginSuccess, onBackToHome, onNavigateToRegister, onNavigateToForgotPassword }) => {
  const [email, setEmail] = useState('rsprolipsioficial@gmail.com');
  const [password, setPassword] = useState('Yannis784512@');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const foundCustomer = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    
    // NOTE: In a real application, password comparison must be done with a secure hashing algorithm on the backend.
    if (foundCustomer && foundCustomer.passwordHash === password) {
      onLoginSuccess(foundCustomer);
    } else {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-black border-2 border-yellow-600/30 rounded-lg shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold text-center font-display text-gold-400">
            Login
          </h2>
          <p className="mt-2 text-center text-gray-400">
            Acesse sua conta para ver seus pedidos.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">E-mail</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border-2 border-slate-700 bg-slate-800 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="E-mail"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border-2 border-slate-700 bg-slate-800 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm pr-10"
                placeholder="Senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gold-400"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center !mt-4">{error}</p>
          )}
          <div className="text-right">
              <button onClick={onNavigateToForgotPassword} type="button" className="text-sm font-medium text-gold-500 hover:text-gold-400">Esqueceu sua senha?</button>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-black bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 transition-colors mt-2"
            >
              Entrar
            </button>
          </div>
        </form>
         <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
                Não tem uma conta?{' '}
                <button onClick={onNavigateToRegister} className="font-medium text-gold-500 hover:text-gold-400">
                    Cadastre-se
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

export default CustomerLogin;