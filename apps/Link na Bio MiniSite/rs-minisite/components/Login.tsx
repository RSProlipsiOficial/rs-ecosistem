import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, LogIn, Loader2, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

interface LoginProps {
  onBack: () => void;
  onSuccess: (user: UserProfile) => void;
  onNavigateToSignup: () => void;
  onNavigateToAdmin?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBack, onSuccess, onNavigateToSignup, onNavigateToAdmin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for toggling password visibility
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
        // App.tsx has a listener (onAuthStateChange) that will detect this sign-in,
        // map the user, and redirect to dashboard.
        console.log("[Login] Sign-in successful, waiting for App listener...");
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rs-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gold/30 rounded-2xl shadow-2xl overflow-hidden relative animate-fade-in">

        <div className="p-8">
          <button onClick={onBack} className="text-gray-500 hover:text-white mb-6 flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Voltar
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-white mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-400 text-sm">Acesse seu painel RS MiniSite.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-xs text-blue-300 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-blue-400">
              <Shield size={14} /> Acesso Demo
            </div>
            <div className="space-y-1 opacity-80">
              <p><b>Admin:</b> robertorjbc@gmail.com</p>
              <p><b>Consultor:</b> rsprolipsioficial@gmail.com</p>
              <p><b>Senha:</b> Yannis784512@</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-rs-gold transition-colors"
                  placeholder="seu@email.com"
                />
                <Mail size={18} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Senha</label>
                <a href="#" className="text-xs text-rs-gold hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-10 py-3 text-white outline-none focus:border-rs-gold transition-colors"
                  placeholder="••••••"
                />
                <Lock size={18} className="absolute left-3 top-3.5 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-rs-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rs-gold hover:bg-rs-goldDark text-black font-bold py-3.5 rounded-lg shadow-lg shadow-rs-gold/20 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Entrar'}
              {!isLoading && <LogIn size={20} />}
            </button>
          </form>
        </div>

        <div className="bg-black/30 p-4 text-center border-t border-gray-800">
          <p className="text-sm text-gray-400">
            Não tem uma conta? <button onClick={onNavigateToSignup} className="text-rs-gold font-bold hover:underline">Criar conta grátis</button>
          </p>
          {onNavigateToAdmin && (
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <button
                onClick={onNavigateToAdmin}
                className="text-[10px] uppercase tracking-wider text-gray-600 hover:text-red-500 transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <Shield size={12} /> Acesso Master
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};