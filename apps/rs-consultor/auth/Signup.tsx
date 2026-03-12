import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as icons from '../components/icons';
import { dashboardApi } from '../consultant/services/dashboardApi';

const { IconEye, IconEyeOff, IconUser } = icons;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const DEFAULT_SPONSOR_REF = 'rsprolipsi';

const fmtDoc = (v: string) => {
  const c = v.replace(/\D/g, '').slice(0, 14);
  if (c.length <= 11) return c.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return c.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};
const fmtPhone = (v: string) => {
  const c = v.replace(/\D/g, '').slice(0, 11);
  return c.length <= 10 ? c.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2') : c.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};
const fmtCep = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
const getSponsorRef = () => {
  if (typeof window === 'undefined') return DEFAULT_SPONSOR_REF;
  const qs = new URLSearchParams(window.location.search);
  const hash = (window.location.hash || '').replace(/^#/, '');
  const [, hashQuery = ''] = hash.split('?');
  const hq = new URLSearchParams(hashQuery);
  const direct = [qs.get('ref'), qs.get('sponsor'), qs.get('indicacao'), hq.get('ref'), hq.get('sponsor'), hq.get('indicacao')].find(Boolean);
  if (direct) return String(direct).trim().toLowerCase();
  return String(window.location.pathname.match(/\/indicacao\/([a-zA-Z0-9-_]+)/i)?.[1] || DEFAULT_SPONSOR_REF).trim().toLowerCase();
};

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [branding, setBranding] = useState({ logo: '/logo-rs.png', companyName: 'RS Prólipsi' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    sponsorId: getSponsorRef(),
    name: '', email: '', cpf: '', phone: '', birthDate: '',
    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
    password: '', confirmPassword: '', termsAccepted: false,
  });

  useEffect(() => {
    dashboardApi.getGeneralSettings().then((res) => {
      if (res.success && res.data) setBranding({ logo: res.data.logo || '/logo-rs.png', companyName: res.data.companyName || 'RS Prólipsi' });
    }).catch(() => undefined);
  }, []);

  const onChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | boolean = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (typeof value === 'string') {
      if (field === 'cpf') value = fmtDoc(value);
      if (field === 'phone') value = fmtPhone(value);
      if (field === 'cep') value = fmtCep(value);
      if (field === 'state') value = value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onZipBlur = async () => {
    const zip = form.cep.replace(/\D/g, '');
    if (zip.length !== 8) return;
    setZipLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
      const data = await res.json();
      if (!data?.erro) setForm((p) => ({ ...p, street: data.logradouro || p.street, neighborhood: data.bairro || p.neighborhood, city: data.localidade || p.city, state: data.uf || p.state }));
    } finally {
      setZipLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('As senhas não coincidem.');
    if (!form.termsAccepted) return setError('Você deve aceitar os termos para continuar.');
    const doc = form.cpf.replace(/\D/g, '');
    if (doc.length !== 11 && doc.length !== 14) return setError('Informe um CPF ou CNPJ válido.');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(), password: form.password, nome: form.name.trim(), cpf: doc,
          telefone: form.phone.replace(/\D/g, ''), sponsorId: (form.sponsorId || DEFAULT_SPONSOR_REF).trim().toLowerCase(),
          birthDate: form.birthDate || null, cep: form.cep.replace(/\D/g, '') || null, street: form.street.trim() || null,
          number: form.number.trim() || null, complement: form.complement.trim() || null, neighborhood: form.neighborhood.trim() || null,
          city: form.city.trim() || null, state: form.state.trim().toUpperCase() || null,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result?.error || 'Não foi possível concluir o cadastro.');
      alert('Cadastro realizado com sucesso. Entre com seu e-mail e senha para continuar.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="w-full max-w-5xl relative z-10 animate-fade-in">
        <button onClick={() => navigate('/login')} className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-300 hover:text-white transition-colors" type="button">
          <span aria-hidden="true">&larr;</span>Voltar
        </button>
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/5 px-6 pb-8 pt-10 md:px-10 text-center">
            <img src={branding.logo || '/logo-rs.png'} alt={branding.companyName} className="mx-auto mb-4 h-20 w-auto object-contain" onError={(e) => { e.currentTarget.src = '/logo-rs.png'; }} />
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300 opacity-90">Cadastro RS Prolipsi</p>
            <h2 className="mt-4 text-3xl font-serif font-bold text-white md:text-4xl">Criar Conta Completa</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 md:text-base">Preencha seu cadastro completo para entrar no ecossistema RS Prolipsi já vinculado à rede correta.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-8 p-6 md:p-10">
            <div className="rounded-2xl border border-gold/30 bg-gold/10 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-black/50"><IconUser className="text-gold" size={20} /></div>
                <div className="flex-1">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gold">Patrocinador do cadastro</p>
                  <p className="mb-4 text-sm text-gray-300">{form.sponsorId === DEFAULT_SPONSOR_REF ? 'Seu cadastro será vinculado automaticamente à conta principal da RS.' : `Seu cadastro será vinculado ao ID ${form.sponsorId}.`}</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input type="text" value={form.sponsorId} readOnly className="w-full rounded-xl border border-gold/20 bg-black/40 px-4 py-3 font-semibold text-gold outline-none" />
                    <div className="rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-gray-400">Sem link de indicação, o cadastro entra automaticamente pela conta principal da RS.</div>
                  </div>
                </div>
              </div>
            </div>
            {error && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <section className="space-y-5">
                <div><h3 className="text-lg font-bold text-white">Dados Pessoais</h3><p className="text-xs uppercase tracking-[0.16em] text-gray-300/80">Cadastro principal</p></div>
                <div className="space-y-4">
                  <input type="text" required value={form.name} onChange={onChange('name')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="Seu nome completo" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input type="text" required value={form.cpf} onChange={onChange('cpf')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="CPF / CNPJ" />
                    <input type="date" required value={form.birthDate} onChange={onChange('birthDate')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/50" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input type="email" required value={form.email} onChange={onChange('email')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="seu@email.com" />
                    <input type="text" required value={form.phone} onChange={onChange('phone')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="(41) 99999-9999" />
                  </div>
                </div>
              </section>
              <section className="space-y-5">
                <div><h3 className="text-lg font-bold text-white">Endereço</h3><p className="text-xs uppercase tracking-[0.16em] text-gray-300/80">Dados para perfil completo</p></div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="relative"><input type="text" required value={form.cep} onChange={onChange('cep')} onBlur={onZipBlur} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="CEP" />{zipLoading && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gold">...</span>}</div>
                    <div className="md:col-span-2"><input type="text" required value={form.street} onChange={onChange('street')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="Rua, avenida, alameda..." /></div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <input type="text" required value={form.number} onChange={onChange('number')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="Número" />
                    <div className="md:col-span-2"><input type="text" value={form.complement} onChange={onChange('complement')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="Complemento" /></div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-2"><input type="text" required value={form.neighborhood} onChange={onChange('neighborhood')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="Bairro" /></div>
                    <input type="text" required value={form.state} onChange={onChange('state')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="UF" />
                  </div>
                  <input type="text" required value={form.city} onChange={onChange('city')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="Cidade" />
                </div>
              </section>
            </div>
            <section className="space-y-5">
              <div><h3 className="text-lg font-bold text-white">Acesso</h3><p className="text-xs uppercase tracking-[0.16em] text-gray-300/80">Senha do ecossistema</p></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={onChange('password')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pr-12 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="Crie sua senha" />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-gold">{showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}</button>
                </div>
                <div className="relative">
                  <input type={showConfirmPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={onChange('confirmPassword')} className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 pr-12 text-white outline-none placeholder:text-white/20 focus:border-gold focus:ring-1 focus:ring-gold/50" placeholder="Repita a senha" />
                  <button type="button" onClick={() => setShowConfirmPassword((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-gold">{showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}</button>
                </div>
              </div>
            </section>
            <label className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-gray-300">
              <input type="checkbox" checked={form.termsAccepted} onChange={onChange('termsAccepted')} className="mt-1 h-4 w-4 rounded border-white/20 bg-black text-gold focus:ring-gold" />
              <span>Aceito os Termos de Uso e Política de Privacidade da RS Prolipsi e confirmo que meu cadastro deve ficar vinculado ao patrocinador informado acima.</span>
            </label>
            <div className="flex flex-col gap-4 border-t border-white/5 pt-6 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-400">Já tem uma conta? <button type="button" onClick={() => navigate('/login')} className="font-bold text-gold hover:underline">Fazer login</button></p>
              <button type="submit" disabled={loading} className="premium-btn-gold disabled:opacity-50 disabled:scale-100 flex items-center justify-center font-black md:w-auto">
                {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : 'Criar minha conta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
