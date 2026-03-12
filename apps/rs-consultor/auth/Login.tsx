
import React, { useState, FormEvent, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../consultant/ConsultantLayout';
import * as icons from '../components/icons';
import { dashboardApi } from '../consultant/services/dashboardApi';

const { IconLock, IconUser, IconEye, IconEyeOff } = icons;

const DEFAULT_SPONSOR_REF = 'rsprolipsi';

const resolveConsultorSignupUrl = () => {
    if (typeof window === 'undefined') return `http://localhost:3002/indicacao/${DEFAULT_SPONSOR_REF}#/signup`;

    const currentOrigin = window.location.origin;
    const isLocal = currentOrigin.includes('localhost');
    const consultorDomain = isLocal ? 'http://localhost:3002' : 'https://rotafacil.rsprolipsi.com.br';

    const searchParams = new URLSearchParams(window.location.search);
    const directRef = [
        searchParams.get('ref'),
        searchParams.get('sponsor'),
        searchParams.get('indicacao')
    ].find((value) => typeof value === 'string' && value.trim().length > 0);

    const pathMatch = window.location.pathname.match(/\/indicacao\/([a-zA-Z0-9-_]+)/i);
    const sponsorRef = String(directRef || pathMatch?.[1] || DEFAULT_SPONSOR_REF).trim().toLowerCase() || DEFAULT_SPONSOR_REF;

    return `${consultorDomain}/indicacao/${sponsorRef}#/signup`;
};

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [branding, setBranding] = useState<{ logo: string | null; companyName: string }>({
        logo: '/logo-rs.png',
        companyName: 'RS Prólipsi'
    });
    const context = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const signupUrl = resolveConsultorSignupUrl();

    const from = location.state?.from?.pathname || '/consultant/dashboard';

    React.useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await dashboardApi.getGeneralSettings();
                if (res.success && res.data) {
                    setBranding({
                        logo: res.data.logo || '/logo-rs.png',
                        companyName: res.data.companyName || 'RS Prólipsi'
                    });
                }
            } catch (err) {
                console.error("[Login] Failed to fetch branding:", err);
            }
        };
        fetchBranding();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (context && context.login) {
            const success = await context.login(email, password, () => {
                navigate(from, { replace: true });
            });

            if (!success) {
                setError('E-mail ou senha inválidos. Tente novamente.');
                setIsLoading(false);
            }
        } else {
            setError('Sistema de autenticação não inicializado.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
            {/* Background Orbs for Premium feel */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-10">
                    {branding.logo ? (
                        <img
                            src={branding.logo}
                            alt={branding.companyName}
                            className="h-20 mx-auto mb-4 object-contain animate-fade-in"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent && !parent.querySelector('.dynamic-title')) {
                                    const title = document.createElement('h1');
                                    title.className = 'text-6xl font-black text-gradient-gold tracking-tighter dynamic-title';
                                    title.innerText = branding.companyName;
                                    parent.prepend(title);
                                }
                            }}
                        />
                    ) : (
                        <h1 className="text-6xl font-black text-gradient-gold tracking-tighter">{branding.companyName}</h1>
                    )}
                    <p className="text-text-muted mt-3 uppercase tracking-[0.3em] text-[10px] font-bold opacity-70">Escritório do Consultor</p>
                </div>

                <div className="premium-glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#161A21] border border-white/10 rounded-2xl flex items-center justify-center shadow-gold/10 shadow-lg">
                        <IconUser className="text-gold" size={32} />
                    </div>

                    <h2 className="text-2xl font-black text-center text-white mt-4 mb-8">Acesse sua conta</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-text-muted mb-2 block uppercase tracking-widest px-1">E-mail de acesso</label>
                            <div className="group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="premium-input bg-black/60 group-hover:bg-black/80 transition-all"
                                    placeholder="seuemail@exemplo.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-text-muted mb-2 block uppercase tracking-widest px-1">Senha exclusiva</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="premium-input bg-black/60 group-hover:bg-black/80 transition-all"
                                    placeholder="••••••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-gold transition-colors focus:outline-none"
                                >
                                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-xs text-red-400 text-center py-2 px-4 rounded-lg bg-red-400/10 border border-red-400/20 animate-pulse">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="premium-btn-gold mt-4 disabled:opacity-50 disabled:scale-100 flex items-center justify-center font-black"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                "Entrar no ecossistema"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-white/5 pt-5 text-center">
                        <p className="text-sm text-text-muted">
                            Nao tem cadastro?{' '}
                            <a href={signupUrl} className="font-bold text-gold hover:underline">
                                Criar conta gratis
                            </a>
                        </p>
                        <a href="#" className="mt-4 inline-block text-[11px] font-bold text-text-muted hover:text-gold uppercase tracking-tighter transition-all opacity-50 hover:opacity-100">Esqueceu sua senha?</a>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] opacity-30">© 2025 RS Prólipsi Ecosystem</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
