import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface LoginProps {
    onLogin: (userId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // Carrega logo do painel central (app_configs)
    useEffect(() => {
        const loadLogo = async () => {
            try {
                const { data } = await supabase
                    .from('app_configs')
                    .select('value')
                    .eq('key', 'general_branding_settings')
                    .maybeSingle();

                if (data?.value?.logoUrl) {
                    setLogoUrl(data.value.logoUrl);
                } else if (data?.value?.logo_url) {
                    setLogoUrl(data.value.logo_url);
                }
            } catch {
                // silencioso — usa fallback
            }
        };
        loadLogo();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Preencha o e-mail e a senha.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (authError) {
                setError('E-mail ou senha inválidos. Verifique suas credenciais.');
                return;
            }

            if (data.user) {
                onLogin(data.user.id);
            }
        } catch (err) {
            setError('Erro de conexão. Verifique sua internet e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
            {/* Background animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-dark-950 to-black" />
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(212,175,55,0.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(212,175,55,0.15) 0%, transparent 50%)'
                }}
            />
            {/* Partículas decorativas */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-gold-500/10 rounded-full animate-spin" style={{ animationDuration: '25s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 border border-gold-500/5 rounded-full animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }} />

            {/* Card de login */}
            <div className="relative z-10 w-full max-w-sm px-4">
                <div className="bg-dark-950/95 backdrop-blur-xl border border-dark-800 rounded-2xl p-8 shadow-2xl shadow-black/80">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Logo RS Prólipsi"
                                className="h-16 w-auto object-contain mb-3 drop-shadow-lg"
                            />
                        ) : (
                            <div className="mb-3">
                                <h1 className="text-3xl font-black tracking-tight">
                                    <span className="text-gold-400">RS</span>
                                    <span className="text-white"> PRÓLIPSI</span>
                                </h1>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-medium">
                            Gestão de CD — Painel Operacional
                        </p>
                    </div>

                    {/* Ícone */}
                    <div className="flex justify-center mb-6">
                        <div className="w-14 h-14 rounded-full bg-dark-900 border border-dark-700 flex items-center justify-center shadow-lg">
                            <Lock className="text-gold-400" size={24} />
                        </div>
                    </div>

                    <h2 className="text-center text-xl font-bold text-white mb-1">Acesse sua conta</h2>
                    <p className="text-center text-xs text-gray-500 mb-6">Área restrita ao administrador do CD</p>

                    {/* Formulário */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                E-mail de acesso
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    autoComplete="username"
                                    disabled={loading}
                                    className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                Senha exclusiva
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-12 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Erro */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
                                <p className="text-red-400 text-xs">{error}</p>
                            </div>
                        )}

                        {/* Botão */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-black font-bold py-3.5 rounded-xl text-sm tracking-wider uppercase transition-all duration-200 shadow-lg shadow-gold-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                'Entrar no Sistema'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[10px] text-gray-600 mt-6">
                        © {new Date().getFullYear()} RS PRÓLIPSI — SISTEMA INTERNO
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
