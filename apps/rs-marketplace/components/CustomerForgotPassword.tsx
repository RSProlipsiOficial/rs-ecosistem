import React, { useState } from 'react';

interface CustomerForgotPasswordProps {
  onForgotPasswordRequest: (email: string) => void;
  onBackToLogin: () => void;
}

const CustomerForgotPassword: React.FC<CustomerForgotPasswordProps> = ({ onForgotPasswordRequest, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
        onForgotPasswordRequest(email);
        setSubmitted(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-black border-2 border-yellow-600/30 rounded-lg shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold text-center font-display text-gold-400">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-gray-400">
            {submitted 
                ? "Verifique sua caixa de entrada." 
                : "Insira seu e-mail para receber o link de recuperação."
            }
          </p>
        </div>
        
        {submitted ? (
            <div className="text-center space-y-6">
                <p className="text-gray-300">Se uma conta com este e-mail existir em nosso sistema, um link para redefinição de senha foi enviado.</p>
                <button
                  onClick={onBackToLogin}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-black bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 transition-colors"
                >
                  Voltar para o Login
                </button>
            </div>
        ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-black bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 transition-colors"
                >
                  Enviar Link de Recuperação
                </button>
              </div>
              <div className="text-center">
                 <button onClick={onBackToLogin} type="button" className="font-medium text-sm text-gold-500 hover:text-gold-400">
                    Voltar para o Login
                </button>
              </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default CustomerForgotPassword;
