import React, { useEffect, useState } from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';

const DEFAULT_SPONSOR_REF = 'rsprolipsi';
const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:4000').replace(/\/$/, '');

interface CustomerRegisterProps {
  onRegister: () => void;
  onBackToHome: () => void;
  onNavigateToLogin: () => void;
  sponsorRef?: string;
  sponsorSource?: 'default' | 'referral';
  branding?: { logo?: string; companyName?: string };
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

const CustomerRegister: React.FC<CustomerRegisterProps> = ({
  onRegister,
  onBackToHome,
  onNavigateToLogin,
  sponsorRef = DEFAULT_SPONSOR_REF,
  sponsorSource = 'default',
  branding,
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
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      sponsorId: sponsorRef || DEFAULT_SPONSOR_REF,
    }));
  }, [sponsorRef]);

  const setField = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    setZipLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
      const data = await response.json();

      if (!data?.erro) {
        setFormData((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch {
      // noop
    } finally {
      setZipLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Voce deve aceitar os termos para continuar.');
      return;
    }

    const cleanDocument = formData.cpf.replace(/\D/g, '');
    if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
      setError('Informe um CPF ou CNPJ valido.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          nome: formData.name.trim(),
          cpf: cleanDocument,
          telefone: formData.phone.replace(/\D/g, ''),
          sponsorId: (formData.sponsorId || DEFAULT_SPONSOR_REF).trim().toLowerCase(),
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
        throw new Error(result?.error || 'Nao foi possivel concluir o cadastro.');
      }

      alert('Cadastro realizado com sucesso. Entre com seu e-mail e senha para continuar.');
      onRegister();
    } catch (err: any) {
      setError(err.message || 'Falha de conexao. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const sponsorLabel =
    sponsorSource === 'referral'
      ? `Cadastro vinculado ao ID ${formData.sponsorId}`
      : 'Cadastro direto vinculado automaticamente a RS Prolipsi';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#000000] px-4 py-8 text-white">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[38%] w-[38%] rounded-full bg-[rgba(212,175,55,0.05)] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[38%] w-[38%] rounded-full bg-[rgba(212,175,55,0.05)] blur-[120px]" />

      <div className="relative z-10 w-full max-w-5xl animate-fade-in">
        <button
          onClick={onBackToHome}
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 transition-colors hover:text-white"
          type="button"
        >
          <span aria-hidden="true">←</span>
          Voltar
        </button>

        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/5 px-6 pb-8 pt-10 md:px-10">
            <div className="text-center">
              <img
                src={branding?.logo || '/logo-rs.png'}
                alt={branding?.companyName || 'RS Prolipsi'}
                className="mx-auto mb-4 h-20 w-auto object-contain"
                onError={(event) => {
                  event.currentTarget.src = '/logo-rs.png';
                }}
              />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 opacity-70">
                Cadastro do Marketplace
              </p>
              <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Criar Conta Completa</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 md:text-base">
                Preencha seu cadastro completo para entrar no ecossistema RS Marketplace ja vinculado a rede correta.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-6 md:p-10">
            <div className="rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-black/50">
                  <svg className="h-5 w-5 text-[#d4af37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#d4af37]">Patrocinador do cadastro</p>
                  <p className="mb-4 text-sm text-gray-300">{sponsorLabel}</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">ID vinculado</label>
                      <input
                        type="text"
                        value={formData.sponsorId}
                        readOnly
                        className="w-full rounded-xl border border-[#d4af37]/20 bg-black/40 px-4 py-3 font-semibold text-[#d4af37] outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="w-full rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-gray-400">
                        Sem link de indicacao, o cadastro entra automaticamente pela conta principal da RS.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <section className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Dados Pessoais</h3>
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Cadastro principal</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Nome completo</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">CPF / CNPJ</label>
                      <input
                        type="text"
                        required
                        value={formData.cpf}
                        onChange={handleInputChange('cpf')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Data de nascimento</label>
                      <input
                        type="date"
                        required
                        value={formData.birthDate}
                        onChange={handleInputChange('birthDate')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">E-mail</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={handleInputChange('phone')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                        placeholder="(41) 99999-9999"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Endereco</h3>
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Dados para perfil completo</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">CEP</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={formData.cep}
                          onChange={handleInputChange('cep')}
                          onBlur={handleZipBlur}
                          className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                          placeholder="00000-000"
                        />
                        {zipLoading && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#d4af37]">...</span>}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Rua / Logradouro</label>
                      <input
                        type="text"
                        required
                        value={formData.street}
                        onChange={handleInputChange('street')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                        placeholder="Rua, avenida ou travessa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Numero</label>
                      <input
                        type="text"
                        required
                        value={formData.number}
                        onChange={handleInputChange('number')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Complemento</label>
                      <input
                        type="text"
                        value={formData.complement}
                        onChange={handleInputChange('complement')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                        placeholder="Apto, bloco, sala"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Bairro</label>
                      <input
                        type="text"
                        required
                        value={formData.neighborhood}
                        onChange={handleInputChange('neighborhood')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                        placeholder="Seu bairro"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Cidade</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleInputChange('city')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                        placeholder="Sua cidade"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">UF</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={handleInputChange('state')}
                        className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                        placeholder="PR"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">Seguranca de acesso</h3>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Defina sua senha do ecossistema</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pr-12 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                      placeholder="Crie sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-[#d4af37]"
                    >
                      {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Confirmar senha</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pr-12 text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50"
                      placeholder="Repita a senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-[#d4af37]"
                    >
                      {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <label className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/30 p-4 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleInputChange('termsAccepted')}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-black text-[#d4af37] focus:ring-[#d4af37]"
              />
              <span>
                Aceito os Termos de Uso e Politica de Privacidade da RS Marketplace e confirmo que meu cadastro deve ficar vinculado ao patrocinador informado acima.
              </span>
            </label>

            <div className="flex flex-col items-stretch justify-between gap-4 border-t border-white/5 pt-6 md:flex-row md:items-center">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                Ja tem uma conta? Entrar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-[#d4af37] via-[#cfb45f] to-[#d4af37] px-8 py-4 text-sm font-black uppercase tracking-widest text-black shadow-lg shadow-[#d4af37]/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[#d4af37]/30 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Cadastrando...' : 'Criar minha conta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
