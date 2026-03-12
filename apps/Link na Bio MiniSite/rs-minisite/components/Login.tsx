import React, { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Eye, EyeOff, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

interface LoginProps {
  onBack: () => void;
  onSuccess: (user: UserProfile) => void;
  onNavigateToSignup: () => void;
  onNavigateToAdmin?: () => void;
  branding?: { logo?: string; companyName?: string };
}

export const Login: React.FC<LoginProps> = ({ onBack, onSuccess, onNavigateToSignup, onNavigateToAdmin, branding }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password.trim(),
      });

      if (signInError) throw signInError;

      if (data.user) {
        console.log('[Login] Sign-in successful, waiting for App listener...');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rs-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rs-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <button
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        <div className="text-center mb-10">
          <img
            src={branding?.logo || '/logo-rs.png'}
            alt={branding?.companyName || 'RS Prólipsi'}
            className="h-20 w-auto mx-auto mb-4 object-contain"
            onError={event => {
              event.currentTarget.src = '/logo-rs.png';
            }}
          />
          <p className="text-gray-500 mt-3 uppercase tracking-[0.3em] text-[10px] font-bold opacity-70">Painel do MiniSite</p>
        </div>

        <div className="bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] p-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#101010] border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.12)]">
            <User className="text-rs-gold" size={28} />
          </div>

          <h2 className="text-2xl font-black text-center text-white mt-4 mb-8">Acesse sua conta</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest px-1">E-mail de acesso</label>
              <div className="group">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50 group-hover:bg-black/80"
                  placeholder="seuemail@exemplo.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Senha exclusiva</label>
                <a href="#" className="text-[11px] font-bold text-gray-500 hover:text-rs-gold uppercase tracking-tight transition-all opacity-60 hover:opacity-100">Esqueceu sua senha?</a>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pr-12 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50 group-hover:bg-black/80"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-rs-gold transition-colors focus:outline-none"
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
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rs-gold via-[#cfb45f] to-rs-gold text-black font-black py-4 rounded-xl shadow-lg shadow-rs-gold/10 hover:shadow-rs-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 uppercase tracking-widest text-sm disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Entrar no ecossistema'}
            </button>
          </form>

          <div className="text-center mt-8 border-t border-white/5 pt-6">
            <p className="text-sm text-gray-400">
              Não tem uma conta? <button onClick={onNavigateToSignup} className="text-rs-gold font-bold hover:underline">Criar conta grátis</button>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] opacity-40">© 2026 RS Prólipsi Ecosystem</p>
        </div>
      </div>
    </div>
  );
};
