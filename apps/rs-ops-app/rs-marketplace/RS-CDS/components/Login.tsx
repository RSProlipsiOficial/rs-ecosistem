import React, { useEffect, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface LoginProps {
    onLogin: (userId: string) => void;
}

function resolveBrandingUrl() {
    const rawBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    const normalizedBaseUrl = String(rawBaseUrl).replace(/\/+$/, '');

    if (normalizedBaseUrl.endsWith('/api')) {
        return `${normalizedBaseUrl.slice(0, -4)}/v1/admin/settings/general`;
    }

    if (normalizedBaseUrl.endsWith('/v1')) {
        return `${normalizedBaseUrl}/admin/settings/general`;
    }

    return `${normalizedBaseUrl}/v1/admin/settings/general`;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadLogo = async () => {
            try {
                const response = await fetch(resolveBrandingUrl());
                const payload = await response.json();

                if (!response.ok || !(payload?.success ?? payload?.ok)) {
                    return;
                }

                const branding = payload?.data || {};
                const nextLogoUrl = branding.logo || branding.avatar || branding.logoUrl || branding.logo_url;
                const nextFaviconUrl = branding.favicon || branding.logo || branding.avatar || branding.logoUrl || branding.logo_url;

                if (nextLogoUrl) {
                    setLogoUrl(String(nextLogoUrl));
                }

                if (nextFaviconUrl && typeof document !== 'undefined') {
                    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    link.href = String(nextFaviconUrl);
                }
            } catch {
                // Fallback local quando a configuracao central nao responde.
            }
        };

        loadLogo();
    }, []);

    useEffect(() => {
        document.title = 'RS Prolipsi - Gestao de CD';
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
                setError('E-mail ou senha invalidos. Verifique suas credenciais.');
                return;
            }

            if (data.user) {
                onLogin(data.user.id);
            }
        } catch {
            setError('Erro de conexao. Verifique sua internet e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rs-gold/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rs-gold/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-10">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt="Logo RS Prolipsi"
                            className="h-20 w-auto mx-auto mb-4 object-contain"
                            onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = '/logo-rs.png';
                            }}
                        />
                    ) : (
                        <h1 className="text-3xl font-black tracking-tight mb-4">
                            <span className="text-gold-400">RS</span>
                            <span className="text-white"> PROLIPSI</span>
                        </h1>
                    )}
                    <p className="text-gray-500 mt-3 uppercase tracking-[0.3em] text-[10px] font-bold opacity-70">
                        Painel Operacional do CD
                    </p>
                </div>

                <div className="bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] p-10 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#101010] border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.12)]">
                        <Lock className="text-gold-400" size={28} />
                    </div>

                    <h2 className="text-2xl font-black text-center text-white mt-4 mb-2">Acesse sua conta</h2>
                    <p className="text-center text-xs text-gray-500 mb-8">Area restrita ao administrador do CD</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest px-1">
                                E-mail de acesso
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={16} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    autoComplete="username"
                                    disabled={loading}
                                    className="w-full rounded-xl border border-white/5 bg-black/60 pl-11 pr-4 py-3 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 group-hover:bg-black/80 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest px-1">
                                Senha exclusiva
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    className="w-full rounded-xl border border-white/5 bg-black/60 pl-11 pr-12 py-3 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 group-hover:bg-black/80 disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-gold-400 transition-colors focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-xs text-red-400 text-center py-2 px-4 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center gap-2">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-gold-500 via-[#cfb45f] to-gold-400 text-black font-black py-4 rounded-xl shadow-lg shadow-gold-500/10 hover:shadow-gold-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 uppercase tracking-widest text-sm disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                'Entrar no sistema'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-white/5 pt-6 text-center">
                        <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] opacity-40">
                            © {new Date().getFullYear()} RS PROLIPSI - Sistema Interno
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
