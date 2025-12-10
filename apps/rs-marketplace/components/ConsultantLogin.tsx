

import React, { useState } from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';

interface ConsultantLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

const ConsultantLogin: React.FC<ConsultantLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [email, setEmail] = useState('rsprolipsioficial@gmail.com');
  const [password, setPassword] = useState('Yannis784512@');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Mock login logic
    if (email === 'rsprolipsioficial@gmail.com' && password === 'Yannis784512@') {
      onLoginSuccess();
    } else {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[rgb(var(--color-brand-dark))] py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gold))]/[.30] rounded-lg shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold text-center font-display text-[rgb(var(--color-brand-gold))]">
            Acesso Restrito
          </h2>
          <p className="mt-2 text-center text-[rgb(var(--color-brand-text-dim))]">
            Faça login para acessar os painéis de gerenciamento.
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
                className="appearance-none relative block w-full px-3 py-3 border-2 border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] placeholder-[rgb(var(--color-brand-text-dim))] rounded-md focus:outline-none focus:ring-[rgb(var(--color-brand-gold))] focus:border-[rgb(var(--color-brand-gold))] sm:text-sm"
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
                className="appearance-none relative block w-full px-3 py-3 border-2 border-[rgb(var(--color-brand-gray-light))] bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] placeholder-[rgb(var(--color-brand-text-dim))] rounded-md focus:outline-none focus:ring-[rgb(var(--color-brand-gold))] focus:border-[rgb(var(--color-brand-gold))] sm:text-sm pr-10"
                placeholder="Senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-[rgb(var(--color-brand-text-dim))] hover:text-[rgb(var(--color-brand-gold))]"
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
            <p className="text-[rgb(var(--color-error))] text-sm text-center !mt-4">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-[rgb(var(--color-brand-dark))] bg-[rgb(var(--color-brand-gold))] hover:bg-[rgb(var(--color-warning))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-brand-dark))] focus:ring-[rgb(var(--color-brand-gold))] transition-colors mt-6"
            >
              Entrar
            </button>
          </div>
        </form>
         <div className="text-center">
            <button onClick={onBackToHome} className="font-medium text-sm text-[rgb(var(--color-brand-gold))] hover:text-[rgb(var(--color-warning))]">
                Voltar para a loja
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultantLogin;