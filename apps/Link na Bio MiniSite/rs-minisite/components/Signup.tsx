import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, CheckCircle2, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

interface SignupProps {
  onBack: () => void;
  onSuccess: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onBack, onSuccess, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Você deve aceitar os termos de serviço.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        console.log("[Signup] Registration successful. Creating profiles...");

        // 2. Create MiniSite Profile
        const { error: profileError } = await supabase.from('minisite_profiles').insert({
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          plan: 'free',
          referral_link: `https://rsprolipsi.com.br/invite/rsprolipsi`,
          consultant_id: `rsprolipsi`
        });

        if (profileError) console.error("[Signup] MiniSite Profile Error:", profileError);

        // 3. Create RS Consultor Profile (MLM Link)
        // We link this user to the master sponsor as requested if no other is provided
        const { error: mlmError } = await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          full_name: formData.name,
          email: formData.email,
          status: 'active',
          patrocinador_id: 'rsprolipsi', // Master ID (email used as ref in this system)
          id_consultor: `RS-${data.user.id.substr(0, 5).toUpperCase()}`
        });

        if (mlmError) console.error("[Signup] MLM Profile Error:", mlmError);

        // 4. Create record in 'consultores' table for legacy/MLM compatibility
        const { error: consultorError } = await supabase.from('consultores').insert({
          id: data.user.id,
          nome: formData.name,
          email: formData.email,
          status: 'ativo',
          graduacao: 'Consultor'
        });

        if (consultorError) console.error("[Signup] Consultores Table Error:", consultorError);

        console.log("[Signup] All profiles created. Proceeding to App...");

        // Finalize
        if (typeof window !== 'undefined') {
          window.alert("Conta criada com sucesso e integrada à rede RS Prólipsi!");
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rs-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gold/30 rounded-2xl shadow-2xl overflow-hidden relative animate-fade-in">

        {/* Decorative Gold Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-rs-gold to-transparent"></div>

        <div className="p-8">
          <button onClick={onBack} className="text-gray-500 hover:text-white mb-6 flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Voltar
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-white mb-2">Criar Conta</h2>
            <p className="text-gray-400 text-sm">Junte-se ao ecossistema RS MiniSite.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome Completo</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-rs-gold transition-colors"
                  placeholder="Seu nome"
                />
                <User size={18} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-10 py-3 text-white outline-none focus:border-rs-gold transition-colors"
                    placeholder="••••••"
                    minLength={6}
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
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Confirmar</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-10 py-3 text-white outline-none focus:border-rs-gold transition-colors"
                    placeholder="••••••"
                    minLength={6}
                  />
                  <Lock size={18} className="absolute left-3 top-3.5 text-gray-500" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-rs-gold transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.termsAccepted}
                onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-gray-700 bg-black/50 text-rs-gold focus:ring-rs-gold"
              />
              <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer">
                Aceito os <a href="#" className="text-rs-gold hover:underline">Termos de Uso</a> e <a href="#" className="text-rs-gold hover:underline">Política de Privacidade</a> da RS MiniSite.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rs-gold hover:bg-rs-goldDark text-black font-bold py-3.5 rounded-lg shadow-lg shadow-rs-gold/20 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Criar Minha Conta'}
              {!isLoading && <CheckCircle2 size={20} />}
            </button>
          </form>
        </div>

        <div className="bg-black/30 p-4 text-center border-t border-gray-800">
          <p className="text-sm text-gray-400">
            Já tem uma conta? <button onClick={onNavigateToLogin} className="text-rs-gold font-bold hover:underline">Fazer Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};