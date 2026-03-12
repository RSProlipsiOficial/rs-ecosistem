import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Users,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

const DEFAULT_SPONSOR_REF = 'rsprolipsi';
const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:4000/v1').replace(/\/$/, '');

interface SignupProps {
  onBack: () => void;
  onSuccess: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
  branding?: { logo?: string; companyName?: string };
  sponsorRef?: string;
  sponsorSource?: 'default' | 'referral';
}

const formatCpfCnpjInput = (value: string) => {
  const clean = value.replace(/\D/g, '').slice(0, 14);

  if (clean.length <= 11) {
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  return clean
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

const formatPhoneInput = (value: string) => {
  const clean = value.replace(/\D/g, '').slice(0, 11);

  if (clean.length <= 10) {
    return clean
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return clean
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

const formatZipInput = (value: string) => {
  const clean = value.replace(/\D/g, '').slice(0, 8);
  return clean.replace(/(\d{5})(\d)/, '$1-$2');
};

export const Signup: React.FC<SignupProps> = ({
  onBack,
  onSuccess,
  onNavigateToLogin,
  branding,
  sponsorRef = DEFAULT_SPONSOR_REF,
  sponsorSource = 'default',
}) => {
  const [formData, setFormData] = useState({
    sponsorId: sponsorRef || DEFAULT_SPONSOR_REF,
    name: '',
    email: '',
    cpf: '',
    phone: '',
    birthDate: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isZipLoading, setIsZipLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      sponsorId: sponsorRef || DEFAULT_SPONSOR_REF
    }));
  }, [sponsorRef]);

  const setField = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | boolean = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    if (typeof value === 'string') {
      if (field === 'cpf') value = formatCpfCnpjInput(value);
      if (field === 'phone') value = formatPhoneInput(value);
      if (field === 'cep') value = formatZipInput(value);
      if (field === 'state') value = value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
    }

    setField(field, value);
  };

  const handleZipBlur = async () => {
    const zip = formData.cep.replace(/\D/g, '');
    if (zip.length !== 8) return;

    setIsZipLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
      const data = await response.json();

      if (!data?.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch (zipError) {
      console.error('[Signup] ViaCEP error:', zipError);
    } finally {
      setIsZipLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Você deve aceitar os termos para continuar.');
      return;
    }

    const cleanDocument = formData.cpf.replace(/\D/g, '');
    if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
      setError('Informe um CPF ou CNPJ válido.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          nome: formData.name.trim(),
          cpf: cleanDocument,
          telefone: formData.phone.replace(/\D/g, ''),
          sponsorId: formData.sponsorId || DEFAULT_SPONSOR_REF,
          birthDate: formData.birthDate || null,
          cep: formData.cep.replace(/\D/g, '') || null,
          street: formData.street.trim() || null,
          number: formData.number.trim() || null,
          complement: formData.complement.trim() || null,
          neighborhood: formData.neighborhood.trim() || null,
          city: formData.city.trim() || null,
          state: formData.state.trim().toUpperCase() || null,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || 'Não foi possível concluir o cadastro.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (signInError) {
        throw new Error(signInError.message || 'Cadastro criado, mas o login automático falhou.');
      }

      if (data.user) {
        onSuccess({
          id: data.user.id,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          plan: 'free',
          cpf: formData.cpf,
          phone: formData.phone,
          consultantId: result?.user?.login || '',
          referralCode: formData.sponsorId || DEFAULT_SPONSOR_REF,
          address: {
            street: formData.street,
            number: formData.number,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            zip: formData.cep,
          }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const sponsorLabel = sponsorSource === 'referral'
    ? `Cadastro vinculado ao ID ${formData.sponsorId}`
    : 'Cadastro direto vinculado automaticamente à RS Prólipsi';

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rs-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rs-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-5xl relative z-10 animate-fade-in">
        <button
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        <div className="bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="px-6 md:px-10 pt-10 pb-8 border-b border-white/5">
            <div className="text-center">
              <img
                src={branding?.logo || '/logo-rs.png'}
                alt={branding?.companyName || 'RS Prólipsi'}
                className="h-20 w-auto mx-auto mb-4 object-contain"
                onError={event => {
                  event.currentTarget.src = '/logo-rs.png';
                }}
              />
              <p className="text-gray-500 mt-3 uppercase tracking-[0.3em] text-[10px] font-bold opacity-70">Cadastro RS Prolipsi</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mt-4">Criar Conta Completa</h2>
              <p className="text-gray-400 text-sm md:text-base mt-3 max-w-2xl mx-auto">
                Preencha seu cadastro completo para entrar no ecossistema RS MiniSite já vinculado à rede certa.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
            <div className="bg-rs-gold/10 border border-rs-gold/30 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-black/50 border border-rs-gold/20 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-rs-gold" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-rs-gold font-bold mb-2">Patrocinador do Cadastro</p>
                  <p className="text-sm text-gray-300 mb-4">{sponsorLabel}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">ID Vinculado</label>
                      <input
                        type="text"
                        value={formData.sponsorId}
                        readOnly
                        className="w-full rounded-xl border border-rs-gold/20 bg-black/40 px-4 py-3 text-rs-gold font-semibold outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="w-full rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-gray-400">
                        Sem link de indicação, o cadastro entra automaticamente pela conta principal da RS.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-2xl text-sm flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <section className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-rs-gold/10 border border-rs-gold/20 flex items-center justify-center">
                    <User size={18} className="text-rs-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Dados Pessoais</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.16em]">Cadastro principal</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">Nome completo</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">CPF / CNPJ</label>
                      <input
                        type="text"
                        required
                        value={formData.cpf}
                        onChange={handleInputChange('cpf')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">Data de nascimento</label>
                      <div className="relative">
                        <input
                          type="date"
                          required
                          value={formData.birthDate}
                          onChange={handleInputChange('birthDate')}
                          className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pr-11 text-white outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                        />
                        <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">E-mail</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange('email')}
                          className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pl-11 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                          placeholder="seu@email.com"
                        />
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">Telefone / WhatsApp</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={formData.phone}
                          onChange={handleInputChange('phone')}
                          className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pl-11 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                          placeholder="(41) 99999-9999"
                        />
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-rs-gold/10 border border-rs-gold/20 flex items-center justify-center">
                    <MapPin size={18} className="text-rs-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Endereço</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.16em]">Dados para perfil completo</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">CEP</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={formData.cep}
                          onChange={handleInputChange('cep')}
                          onBlur={handleZipBlur}
                          className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                          placeholder="00000-000"
                        />
                        {isZipLoading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-rs-gold animate-spin" />}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">Rua / Logradouro</label>
                      <input
                        type="text"
                        required
                        value={formData.street}
                        onChange={handleInputChange('street')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                        placeholder="Rua, avenida, alameda..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">Número</label>
                      <input
                        type="text"
                        required
                        value={formData.number}
                        onChange={handleInputChange('number')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                        placeholder="123"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">Complemento</label>
                      <input
                        type="text"
                        value={formData.complement}
                        onChange={handleInputChange('complement')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                        placeholder="Apartamento, sala, bloco..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">Bairro</label>
                      <input
                        type="text"
                        required
                        value={formData.neighborhood}
                        onChange={handleInputChange('neighborhood')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                        placeholder="Seu bairro"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">Estado</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={handleInputChange('state')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                        placeholder="PR"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">Cidade</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleInputChange('city')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pl-11 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                        placeholder="Sua cidade"
                      />
                      <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-rs-gold/10 border border-rs-gold/20 flex items-center justify-center">
                  <Lock size={18} className="text-rs-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Acesso</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-[0.16em]">Senha do ecossistema</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      minLength={6}
                      className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pl-11 pr-12 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                      placeholder="••••••••"
                    />
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-rs-gold transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">Confirmar senha</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      minLength={6}
                      className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pl-11 pr-12 text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-rs-gold focus:ring-1 focus:ring-rs-gold/50"
                      placeholder="••••••••"
                    />
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-rs-gold transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
              <input
                type="checkbox"
                id="terms"
                checked={formData.termsAccepted}
                onChange={handleInputChange('termsAccepted')}
                className="mt-1 h-4 w-4 rounded border-gray-700 bg-black/50 text-rs-gold focus:ring-rs-gold"
              />
              <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
                Aceito os <a href="#" className="text-rs-gold hover:underline">Termos de Uso</a> e a <a href="#" className="text-rs-gold hover:underline">Política de Privacidade</a> do RS MiniSite.
              </label>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between border-t border-white/5 pt-6">
              <p className="text-sm text-gray-400">
                Já tem uma conta? <button type="button" onClick={onNavigateToLogin} className="text-rs-gold font-bold hover:underline">Fazer login</button>
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto min-w-[280px] bg-gradient-to-r from-rs-gold via-[#cfb45f] to-rs-gold text-black font-black py-4 px-8 rounded-xl shadow-lg shadow-rs-gold/10 hover:shadow-rs-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 uppercase tracking-widest text-sm disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Criar minha conta'}
                {!isLoading && <CheckCircle2 size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
