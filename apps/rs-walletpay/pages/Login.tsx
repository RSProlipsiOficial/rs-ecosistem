import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../src/services/api';
import { supabase } from '../src/lib/supabaseClient';

import { Eye, EyeOff } from 'lucide-react';

const InputField: React.FC<{ name: string, label: string, type?: string, placeholder?: string, required?: boolean, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> =
    ({ name, label, type = 'text', placeholder, required = false, value, onChange }) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';

        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-text-body mb-2">{label}</label>
                <div className="relative">
                    <input
                        type={isPassword ? (showPassword ? 'text' : 'password') : type}
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        className={`w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all ${isPassword ? 'pr-12' : ''}`}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-body hover:text-gold transition-colors p-1"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    )}
                </div>
            </div>
        );
    };

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // AUTO-LOGIN quando vem do Marketplace ou Escritório
    useEffect(() => {
        const getTokenFromUrl = (): string | null => {
            const search = window.location.search;
            if (search && search.includes('token=')) {
                return new URLSearchParams(search).get('token');
            }
            const hash = window.location.hash;
            if (hash && hash.includes('?')) {
                const qs = hash.substring(hash.indexOf('?') + 1);
                return new URLSearchParams(qs).get('token');
            }
            return null;
        };

        const token = getTokenFromUrl();

        if (token) {
            try {
                const authData = JSON.parse(atob(token));

                if (authData.autoLogin === true) {
                    console.log('🔓 Auto-login detectado:', authData.source);

                    // Salvar dados no localStorage (modo demo)
                    localStorage.setItem('token', token);
                    localStorage.setItem('userId', authData.userId || 'auto-' + Date.now());
                    localStorage.setItem('userName', 'Consultor');
                    localStorage.setItem('userEmail', authData.email || 'consultor@rsprolipsi.com.br');
                    localStorage.setItem('autoLogin', 'true');
                    localStorage.setItem('loginSource', authData.source);

                    // Redirecionar para dashboard
                    navigate('/app/dashboard', { replace: true });
                }
            } catch (e) {
                console.error('Token inválido:', e);
            }
        }
    }, [navigate]);

    const handleForgotPassword = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Por favor, digite seu email primeiro para recuperar a senha');
            return;
        }

        try {
            setLoading(true);
            await authAPI.forgotPassword(email);
            alert('Email de recuperação enviado! Verifique sua caixa de entrada.');
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao enviar email de recuperação');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // LOGIN DIRETO VIA SUPABASE (Mais robusto que via API Proxy)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (data.session) {
                // Salvar token e dados do usuário
                localStorage.setItem('token', data.session.access_token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userName', data.user.user_metadata?.nome || 'Consultor');
                localStorage.setItem('userEmail', data.user.email || '');

                // Navegar para dashboard
                navigate('/app/dashboard');
            } else {
                throw new Error('Sessão não criada');
            }
        } catch (err: any) {
            console.error('Erro no login:', err);

            // Tratamento de erros específicos do Supabase
            if (err.message.includes('Invalid login')) {
                setError('Email ou senha incorretos.');
            } else if (err.message.includes('Email not confirmed')) {
                setError('Por favor, confirme seu email antes de entrar.');
            } else {
                setError(err.message || 'Erro ao fazer login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-base min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gold">RS WalletPay</h1>
                    <p className="text-text-body mt-2">Acesse sua conta de consultor</p>
                </div>

                <div className="bg-card p-8 rounded-2xl border border-border shadow-custom-lg">
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <InputField
                            name="email"
                            label="ID de Consultor ou Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu.email@exemplo.com"
                            required
                        />
                        <InputField
                            name="password"
                            label="Senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-gold bg-surface border-border rounded focus:ring-gold" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-body">
                                    Lembrar-me
                                </label>
                            </div>
                            <div className="text-sm">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="font-medium text-gold hover:text-gold-hover bg-transparent border-none p-0 cursor-pointer"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-center py-3 px-6 bg-gold text-lg text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>
                    <p className="mt-8 text-center text-sm text-text-body">
                        Ainda não tem uma conta?{' '}
                        <Link to="/register" className="font-medium text-gold hover:text-gold-hover">
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
