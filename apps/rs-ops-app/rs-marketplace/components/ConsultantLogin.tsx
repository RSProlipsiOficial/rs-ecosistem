import React, { useState } from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { supabase } from '../services/supabase';

interface ConsultantLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
  onNavigateToRegister: () => void;
  branding?: { logo?: string; companyName?: string };
}

const ConsultantLogin: React.FC<ConsultantLoginProps> = ({
  onLoginSuccess,
  onBackToHome,
  onNavigateToRegister,
  branding,
}) => {
  const [email, setEmail] = useState('rsprolipsioficial@gmail.com');
  const [password, setPassword] = useState('Yannis784512@');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!data.session) {
        setError('Erro ao iniciar sessao. Tente novamente.');
        return;
      }

      const role = data.user?.user_metadata?.role || data.user?.app_metadata?.role || 'consultor';
      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('rs-role', role);

      try {
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3003';
        const isLocal = currentOrigin.includes('localhost');
        const marketplaceDomain = isLocal ? 'http://localhost:3003' : 'https://marketplace.rsprolipsi.com.br';
        const [profileRes, consultorRes] = await Promise.all([
          supabase.from('user_profiles').select('*').eq('user_id', data.user.id).maybeSingle(),
          supabase.from('consultores').select('*').eq('user_id', data.user.id).maybeSingle(),
        ]);

        const realProfile = profileRes.data;
        const realConsultor = consultorRes.data;
        const slug = realConsultor?.slug || realProfile?.slug || email.split('@')[0];
        const storedProfile = (() => {
          try {
            return JSON.parse(localStorage.getItem('rs-consultant-profile') || '{}');
          } catch {
            return {};
          }
        })();

        const normalizedRole = String(role || '').trim().toLowerCase();
        const localProfile = {
          ...storedProfile,
          id: data.user.id,
          email: data.user.email || email,
          name: realProfile?.full_name || realConsultor?.nome_completo || storedProfile?.name || 'Consultor RS',
          avatarUrl: realProfile?.avatar_url || realConsultor?.avatar_url || storedProfile?.avatarUrl || '',
          graduation: realConsultor?.graduacao || realProfile?.graduation || storedProfile?.graduation || 'CONSULTOR',
          accountStatus: realConsultor?.status_conta || realProfile?.account_status || storedProfile?.accountStatus || 'Ativo',
          monthlyActivity: realConsultor?.atividade_mensal || realProfile?.monthly_activity || storedProfile?.monthlyActivity || 'Ativo',
          category: realConsultor?.categoria || realProfile?.category || (
            ['lojista', 'seller', 'marketplace_admin', 'super_admin', 'admin'].includes(normalizedRole)
              ? 'LOJISTA'
              : storedProfile?.category || ''
          ),
          cpfCnpj: realProfile?.cpf_cnpj || realConsultor?.cpf_cnpj || storedProfile?.cpfCnpj || '',
          idConsultor: realConsultor?.id_consultor || storedProfile?.idConsultor || '',
          slug,
          referralLink: `${marketplaceDomain}/indicacao/${slug}#/signup`,
          affiliateLink: `${marketplaceDomain}/loja/${slug}`,
        };

        localStorage.setItem('rs-consultant-profile', JSON.stringify(localProfile));
        localStorage.setItem('rs-consultant-full-profile', JSON.stringify(localProfile));
        window.dispatchEvent(new Event('rs-consultant-profile-updated'));
      } catch (profileError) {
        console.warn('[ConsultantLogin] Failed to sync local profile:', profileError);
      }

      window.dispatchEvent(new Event('rs-marketplace-auth-updated'));
      onLoginSuccess();
    } catch (err) {
      console.error('[ConsultantLogin] Login failed:', err);
      setError('E-mail ou senha invalidos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#000000] px-4 py-10 text-white">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[38%] w-[38%] rounded-full bg-[rgba(212,175,55,0.05)] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[38%] w-[38%] rounded-full bg-[rgba(212,175,55,0.05)] blur-[120px]" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <button
          onClick={onBackToHome}
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 transition-colors hover:text-white"
          type="button"
        >
          <span aria-hidden="true">&larr;</span>
          Voltar
        </button>

        <div className="mb-10 text-center">
          <img
            src={branding?.logo || '/logo-rs.png'}
            alt={branding?.companyName || 'RS Prolipsi'}
            className="mx-auto mb-4 h-20 w-auto object-contain"
            onError={(event) => {
              event.currentTarget.src = '/logo-rs.png';
            }}
          />
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 opacity-70">
            Painel do Marketplace
          </p>
        </div>

        <div className="relative rounded-[2.5rem] border border-white/10 bg-black/80 p-10 shadow-2xl backdrop-blur-xl">
          <div className="absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-[#101010] shadow-[0_10px_30px_rgba(212,175,55,0.12)]">
            <svg className="h-7 w-7 text-[#d4af37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 20a6.5 6.5 0 0 1 13 0" />
            </svg>
          </div>

          <h2 className="mb-8 mt-4 text-center text-2xl font-black text-white">Acesse sua conta</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block px-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                E-mail de acesso
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between px-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Senha exclusiva
                </label>
                <button
                  type="button"
                  className="text-[11px] font-bold uppercase tracking-tight text-gray-500 opacity-60 transition-all hover:text-[#d4af37] hover:opacity-100"
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pr-12 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                  placeholder="************"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-[#d4af37]"
                  aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-2 text-center text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#d4af37] via-[#cfb45f] to-[#d4af37] py-4 text-sm font-black uppercase tracking-widest text-black shadow-lg shadow-[#d4af37]/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[#d4af37]/30 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? 'Entrando...' : 'Entrar no ecossistema'}
            </button>
          </form>

          <div className="mt-8 border-t border-white/5 pt-6 text-center">
            <p className="text-sm text-gray-400">
              Nao tem cadastro?{' '}
              <button onClick={onNavigateToRegister} className="font-bold text-[#d4af37] hover:underline" type="button">
                Criar conta gratis
              </button>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 opacity-40">(c) 2026 RS Prolipsi Ecosystem</p>
        </div>
      </div>
    </div>
  );
};

export default ConsultantLogin;
