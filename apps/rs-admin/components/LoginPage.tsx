import React, { useState } from 'react';
import { EnvelopeIcon, KeyIcon, SpinnerIcon, EyeIcon, EyeSlashIcon } from './icons';

import { supabase } from '../src/services/supabase';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            if (data.session) {
                localStorage.setItem('adminToken', data.session.access_token);

                // Get user role from metadata if available
                const userRole = data.user?.user_metadata?.role || data.user?.app_metadata?.role || 'admin';
                localStorage.setItem('rs-role', userRole);

                onLoginSuccess();
            } else {
                setError('Erro ao iniciar sessão. Tente novamente.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Email ou senha incorretos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#121212]">
            <div className="w-full max-w-md p-8 space-y-8 bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] shadow-2xl shadow-black/30">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-[#FFD700]">RS Prólipsi</h1>
                    <p className="mt-2 text-gray-400">Painel Administrativo</p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#2A2A2A] border border-transparent text-[#E5E7EB] rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-colors placeholder-gray-500"
                                placeholder="seuemail@exemplo.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            Senha
                        </label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#2A2A2A] border border-transparent text-[#E5E7EB] rounded-lg py-2.5 pl-10 pr-10 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-colors placeholder-gray-500"
                                placeholder="********"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <a href="#" onClick={(e) => { e.preventDefault(); alert('Funcionalidade de recuperação de senha em desenvolvimento.'); }} className="font-medium text-yellow-500 hover:text-yellow-400">
                                Esqueceu a senha?
                            </a>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-[#FFD700] hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1E1E1E] focus:ring-[#FFD700] transition-all duration-300 disabled:bg-yellow-500/50 disabled:cursor-wait"
                        >
                            {isLoading ? (
                                <SpinnerIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;