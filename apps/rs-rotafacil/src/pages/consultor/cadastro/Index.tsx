import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Mail, Phone, User, MapPin, ArrowLeft,
  CreditCard, Shield, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, ChevronRight, Package, Lock, Star,
  Sparkles, Globe, MapPinned, Crown, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Validação de Documento simplificada
function formatarDocumento(doc: string): string {
  const limpo = doc.replace(/\D/g, '');
  if (limpo.length <= 11) {
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

const ConsultorCadastroPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados do Fluxo
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'basico' | 'endereco' | 'kit'>('basico');
  const [sponsorName, setSponsorName] = useState<string | null>(null);
  const [branding, setBranding] = useState({ company_name: "", logo_url: "", falcon_url: "" });
  const [plans, setPlans] = useState<any[]>([]);

  // Form data centralizado
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    whatsapp: '',
    cpf_cnpj: '',
    password: '',
    sponsor_id: '',
    // Endereço
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
    // Kit
    plan_id: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLegacyUser, setIsLegacyUser] = useState(false);
  const [legacyData, setLegacyData] = useState<any>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const init = async () => {
      // 1. Branding
      const { data: brandData } = await supabase.from('app_settings').select('value').eq('key', 'branding').maybeSingle();
      if (brandData?.value) setBranding(brandData.value as any);

      // 2. Planos (Kits)
      const { data: plansData } = await supabase.from('subscription_plans').select('*').eq('active', true).order('price', { ascending: true });
      if (plansData) setPlans(plansData);

      // 3. Patrocinador inicial (via URL)
      const ref = searchParams.get("ref") || "rsprolipsi";
      const name = searchParams.get("name") || "";
      const email = searchParams.get("email") || "";

      setFormData(prev => ({
        ...prev,
        sponsor_id: ref,
        nome_completo: name || prev.nome_completo,
        email: email || prev.email
      }));
      if (ref) buscarSponsor(ref);
    };
    init();
  }, [searchParams]);

  const buscarSponsor = async (id: string) => {
    if (!id || id.length < 3) {
      setSponsorName(null);
      return;
    }
    try {
      const { data } = await supabase
        .from('consultores')
        .select('nome')
        .eq('username', id)
        .maybeSingle();

      if (data) setSponsorName(data.nome);
      else setSponsorName(null);
    } catch (err) {
      console.error("Erro ao buscar patrocinador:", err);
    }
  };

  // Busca de CEP
  const handleCEPLookup = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep: cleaned }));

    if (cleaned.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }));
        }
      } catch (err) {
        console.error("Erro CEP:", err);
      }
    }
  };

  const checkLegacyCPF = async (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      const { data, error } = await (supabase.from('consultores' as any) as any)
        .select('*')
        .eq('cpf', cleaned)
        .maybeSingle();

      if (data) {
        setIsLegacyUser(true);
        setLegacyData(data);
        // Preencher dados automaticamente
        setFormData(prev => ({
          ...prev,
          nome_completo: data.nome || prev.nome_completo,
          email: data.email || prev.email,
          whatsapp: data.whatsapp || prev.whatsapp,
          sponsor_id: data.patrocinador_uid || prev.sponsor_id
        }));

        toast({
          title: "🚀 Cadastro Encontrado!",
          description: "Detectamos seu registro na base SubBase. Conclua o cadastro para migrar sua conta automaticamente.",
          className: "bg-gold text-black border-none font-bold"
        });
      } else {
        setIsLegacyUser(false);
        setLegacyData(null);
      }
    }
  };

  const validateStep = (step: 'basico' | 'endereco' | 'kit') => {
    const errors: Record<string, string> = {};
    if (step === 'basico') {
      if (!formData.nome_completo) errors.nome = "Nome obrigatório";
      if (!formData.email.includes('@')) errors.email = "Email inválido";
      if (formData.cpf_cnpj.replace(/\D/g, '').length < 11) errors.doc = "Documento incompleto (mín. 11 dígitos)";
      if (formData.password.length < 6) errors.pass = "Senha deve ter no mínimo 6 caracteres";
      // Só valida patrocinador se foi preenchido e não foi encontrado
      if (formData.sponsor_id.length >= 3 && !sponsorName) {
        errors.sponsor = "Patrocinador não encontrado no sistema";
      }
    }
    if (step === 'endereco') {
      if (!formData.cep) errors.cep = "CEP obrigatório";
      if (!formData.cidade) errors.cidade = "Cidade obrigatória";
    }

    // Log de debug para desenvolvimento
    if (Object.keys(errors).length > 0) {
      console.log('Erros de validação:', errors);
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSectionToggle = (section: 'basico' | 'endereco' | 'kit') => {
    if (section === 'endereco' && !validateStep('basico')) {
      const errorMessages = Object.values(formErrors).join(', ');
      toast({
        title: "Verifique os dados",
        description: errorMessages || "Preencha corretamente os dados básicos primeiro.",
        variant: "destructive"
      });
      return;
    }
    if (section === 'kit' && !validateStep('endereco')) {
      toast({ title: "Verifique os dados", description: "Preencha o endereço completo primeiro.", variant: "destructive" });
      return;
    }
    setActiveSection(section);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep('basico') || !validateStep('endereco')) {
      toast({ title: "Atenção", description: "Preencha todos os dados obrigatórios", variant: "destructive" });
      return;
    }

    if (!formData.plan_id) {
      setActiveSection('kit');
      toast({ title: "Escolha seu Kit", description: "Você precisa selecionar um plano para continuar", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // 0. Buscar dados do Patrocinador (ID real do usuário)
      const { data: sponsorData } = await (supabase
        .from('consultores')
        .select('user_id, nome')
        .eq('username', formData.sponsor_id)
        .maybeSingle() as any);

      const sponsorUserId = sponsorData?.user_id || 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

      // 1. Criar conta no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            name: formData.nome_completo,
            full_name: formData.nome_completo,
            sponsor_id: formData.sponsor_id,
            sponsor_user_id: sponsorUserId,
            user_type: 'owner',
            app: 'rotafacil',
            cpf: formData.cpf_cnpj.length <= 11 ? formData.cpf_cnpj : null,
            cnpj: formData.cpf_cnpj.length > 11 ? formData.cpf_cnpj : null,
            plan_id: formData.plan_id
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Erro ao criar conta");

      // 2. Criar perfil, assinatura e registro de consultor
      const fallbackUsername = formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);

      const [profileResult, subResult, consultorResult, leadResult] = await Promise.all([
        supabase.from('user_profiles').upsert({
          user_id: authData.user.id,
          nome_completo: formData.nome_completo,
          cpf: formData.cpf_cnpj.length <= 11 ? formData.cpf_cnpj : null,
          perfil_completo: true,
          sponsor_id: sponsorUserId
        }),
        supabase.from('user_subscriptions').insert({
          user_id: authData.user.id,
          plan_id: formData.plan_id,
          status: 'trial',
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }),
        isLegacyUser
          ? (supabase.from('consultores') as any).update({
            uid: authData.user.id,
            nome: formData.nome_completo,
            email: formData.email,
            whatsapp: formData.whatsapp,
            status: 'ativo',
            updated_at: new Date().toISOString()
          }).eq('cpf', formData.cpf_cnpj.replace(/\D/g, ''))
          : (supabase.from('consultores') as any).insert({
            uid: authData.user.id,
            nome: formData.nome_completo,
            email: formData.email,
            whatsapp: formData.whatsapp,
            cpf: formData.cpf_cnpj.replace(/\D/g, ''),
            username: fallbackUsername,
            status: 'ativo',
            patrocinador_uid: sponsorUserId,
            nivel_profundidade: 1
          }),
        (supabase.from('indicados' as any) as any).insert({
          nome_completo: formData.nome_completo,
          email: formData.email,
          whatsapp: formData.whatsapp,
          indicado_por_id: sponsorUserId,
          indicado_por_nome: sponsorData?.nome || 'Sistema',
          codigo_indicacao: formData.sponsor_id || 'rsprolipsi',
          status: 'convertido',
          origem: 'cadastro_interno'
        })
      ]);

      if (profileResult.error) console.error("Erro ao criar perfil:", profileResult.error);
      if (subResult.error) console.error("Erro ao criar assinatura:", subResult.error);
      if (consultorResult.error) console.error("Erro ao criar registro de consultor:", consultorResult.error);
      if (leadResult.error) console.error("Erro ao registrar lead:", leadResult.error);



      toast({
        title: "✅ Cadastro realizado com sucesso!",
        description: `Bem-vindo à RS Prólipsi! Verifique seu e-mail para confirmação e aguarde o redirecionamento...`,
      });

      setTimeout(() => {
        navigate("/painel");
      }, 2000);

    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no Cadastro",
        description: error.message || "Erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.08)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/5 blur-[120px] rounded-full opacity-30 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold/5 blur-[120px] rounded-full opacity-30 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 py-8">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-2 text-white/60 hover:text-gold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider">Voltar</span>
        </button>

        {/* Logo and title */}
        <div className="text-center space-y-4 mb-8">
          <div
            className="inline-block p-4 bg-black-secondary rounded-[32px] border border-gold/20 shadow-elegant cursor-pointer transform transition-all hover:scale-105"
            onClick={() => navigate('/')}
          >
            <img
              src={branding.falcon_url || branding.logo_url || "/assets/branding/falcon-icon.png"}
              alt="Logo"
              className="h-16 w-auto object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/assets/branding/falcon-icon.png"; }}
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic text-gold leading-none">CRIAR CONTA</h1>
            <p className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.4em] opacity-60">
              Entre para o time de consultores{branding.company_name ? ` ${branding.company_name}` : ''}
            </p>
          </div>

          {sponsorName && (
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gold/10 rounded-full border border-gold/20 w-fit mx-auto animate-in fade-in slide-in-from-bottom-2">
              <Star className="w-3 h-3 text-gold fill-gold" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gold/80">
                Convidado por: <span className="text-white ml-1">{sponsorName}</span>
              </span>
            </div>
          )}
        </div>

        {/* Stepper Progress */}
        <div className="flex justify-between items-center mb-8 px-4 max-w-sm mx-auto">
          {['basico', 'endereco', 'kit'].map((step, idx) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 border-2",
                activeSection === step
                  ? "bg-gold border-gold text-black shadow-gold scale-110"
                  : "border-white/10 text-white/20 bg-white/[0.02]"
              )}>
                {idx + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4 px-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inicie seu Cadastro</p>
          <Link to="/auth" className="text-[10px] font-black text-gold uppercase tracking-widest hover:underline flex items-center gap-1">
            Já sou parceiro <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          {/* SEÇÃO 1: DADOS BÁSICOS */}
          <div className={cn(
            "bg-black-secondary rounded-[32px] border border-white/5 shadow-2xl transition-all duration-700",
            activeSection === 'basico' ? "border-gold/30 ring-1 ring-gold/20" : "opacity-40 grayscale"
          )}>
            <div onClick={() => handleSectionToggle('basico')} className="p-6 flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl transition-all duration-500", activeSection === 'basico' ? "bg-gold text-black shadow-gold" : "bg-white/5 text-muted-foreground")}>
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-black uppercase tracking-tighter text-white leading-none">Dados Pessoais</h3>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1 opacity-60">Sua identidade no sistema</p>
                </div>
              </div>
              {activeSection === 'basico' ? <ChevronUp className="text-gold w-5 h-5" /> : <ChevronDown className="opacity-40 w-5 h-5" />}
            </div>

            <div className={cn("px-6 pb-6 space-y-4 transition-all duration-700 origin-top overflow-hidden", activeSection === 'basico' ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 invisible")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1 flex items-center gap-1">
                    Patrocinador (ID)
                    {searchParams.get("ref") && <Lock className="w-3 h-3 text-gold/60" />}
                  </Label>
                  <Input
                    placeholder="Username"
                    value={formData.sponsor_id}
                    onChange={e => {
                      // Só permite edição se NÃO veio da URL
                      if (!searchParams.get("ref")) {
                        const val = e.target.value.toLowerCase().trim();
                        setFormData({ ...formData, sponsor_id: val });
                        buscarSponsor(val);
                      }
                    }}
                    readOnly={!!searchParams.get("ref")}
                    className={cn(
                      "h-12 border-2 rounded-xl font-bold",
                      searchParams.get("ref")
                        ? "bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-white border-white/20 focus:border-black !text-black placeholder:text-black/30"
                    )}
                    style={{ color: searchParams.get("ref") ? '#666666' : '#000000' }}
                  />
                  {searchParams.get("ref") && (
                    <p className="text-[8px] text-gold/60 ml-1 uppercase font-bold tracking-wider">
                      Patrocinador definido pelo link de indicação
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1">Nome Completo</Label>
                  <Input
                    placeholder="Seu nome completo"
                    value={formData.nome_completo}
                    onChange={e => setFormData({ ...formData, nome_completo: e.target.value })}
                    className="h-12 bg-white border-2 border-white/20 focus:border-black rounded-xl !text-black font-bold"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1">CPF ou CNPJ</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={formatarDocumento(formData.cpf_cnpj)}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, cpf_cnpj: val });
                      if (val.length === 11) checkLegacyCPF(val);
                    }}
                    className={cn(
                      "h-12 bg-white border-2 border-white/20 focus:border-black rounded-xl !text-black font-bold",
                      isLegacyUser && "border-gold ring-2 ring-gold/20"
                    )}
                    style={{ color: '#000000' }}
                  />
                  {isLegacyUser && (
                    <div className="flex items-center gap-1.5 mt-1 animate-in slide-in-from-left-2 transition-all">
                      <Sparkles className="w-3 h-3 text-gold" />
                      <span className="text-[9px] font-black text-gold uppercase tracking-widest">Usuário SubBase Detectado - Migração Ativa</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1">E-mail Profissional</Label>
                  <Input
                    type="email"
                    placeholder="voce@email.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 bg-white border-2 border-white/20 focus:border-black rounded-xl !text-black font-bold"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1">WhatsApp</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="h-12 bg-white border-2 border-white/20 focus:border-black rounded-xl !text-black font-bold"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1">Senha</Label>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 bg-white border-2 border-white/20 focus:border-black rounded-xl !text-black font-bold"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={() => handleSectionToggle('endereco')}
                className="w-full h-12 bg-gold text-black hover:bg-gold/90 font-black uppercase tracking-widest text-[10px] rounded-xl border border-gold/20 shadow-lg mt-4"
              >
                Continuar: Endereço
              </Button>
            </div>
          </div>

          {/* SEÇÃO 2: ENDEREÇO */}
          <div className={cn(
            "bg-black-secondary rounded-[32px] border border-white/5 shadow-2xl transition-all duration-700",
            activeSection === 'endereco' ? "border-gold/30 ring-1 ring-gold/20" : "opacity-40 grayscale"
          )}>
            <div onClick={() => handleSectionToggle('endereco')} className="p-6 flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl transition-all duration-500", activeSection === 'endereco' ? "bg-gold text-black shadow-gold" : "bg-white/5 text-muted-foreground")}>
                  <MapPinned className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-black uppercase tracking-tighter text-white leading-none">Endereço</h3>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1 opacity-60">Sua localização</p>
                </div>
              </div>
              {activeSection === 'endereco' ? <ChevronUp className="text-gold w-5 h-5" /> : <ChevronDown className="opacity-40 w-5 h-5" />}
            </div>

            <div className={cn("px-6 pb-6 space-y-4 transition-all duration-700 origin-top overflow-hidden", activeSection === 'endereco' ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 invisible")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1">CEP</Label>
                  <Input
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={e => handleCEPLookup(e.target.value)}
                    className="h-12 bg-white border-2 border-white/20 focus:border-black rounded-xl !text-black font-bold"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1">Rua</Label>
                  <Input
                    placeholder="Logradouro"
                    value={formData.rua}
                    onChange={e => setFormData({ ...formData, rua: e.target.value })}
                    className="h-12 bg-white border-2 border-white/20 focus:border-black rounded-xl !text-black font-bold"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1">Número</Label>
                  <Input
                    placeholder="123"
                    value={formData.numero}
                    onChange={e => setFormData({ ...formData, numero: e.target.value })}
                    className="h-12 bg-white border-2 border-white/20 focus:border-black rounded-xl !text-black font-bold"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1">Bairro</Label>
                  <Input
                    placeholder="Sua vizinhança"
                    value={formData.bairro}
                    onChange={e => setFormData({ ...formData, bairro: e.target.value })}
                    className="h-12 bg-white border-2 border-white/20 focus:border-black rounded-xl !text-black font-bold"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1">Cidade</Label>
                  <Input
                    placeholder="Cidade"
                    value={formData.cidade}
                    onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                    className="h-12 bg-white border-2 border-white/20 focus:border-black rounded-xl !text-black font-bold"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="uppercase text-[9px] font-black text-gold tracking-[0.2em] ml-1">Estado (UF)</Label>
                  <Input
                    maxLength={2}
                    placeholder="UF"
                    value={formData.estado.toUpperCase()}
                    onChange={e => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                    className="h-12 bg-white border-2 border-white/20 focus:border-black rounded-xl !text-black font-bold"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={() => handleSectionToggle('kit')}
                className="w-full h-12 bg-gold text-black hover:bg-gold/90 font-black uppercase tracking-widest text-[10px] rounded-xl border border-gold/20 shadow-lg mt-4"
              >
                Continuar: Escolha do Kit (Plano)
              </Button>
            </div>
          </div>

          {/* SEÇÃO 3: KITS */}
          <div className={cn(
            "bg-black-secondary rounded-[32px] border border-white/5 shadow-2xl transition-all duration-700",
            activeSection === 'kit' ? "border-gold/30 ring-1 ring-gold/20 bg-gold/[0.02]" : "opacity-40 grayscale"
          )}>
            <div onClick={() => handleSectionToggle('kit')} className="p-6 flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl transition-all duration-500", activeSection === 'kit' ? "bg-gold text-black shadow-gold" : "bg-white/5 text-muted-foreground")}>
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-black uppercase tracking-tighter text-white leading-none">Escolha seu Plano</h3>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1 opacity-60">Seu kit de ferramentas</p>
                </div>
              </div>
              {activeSection === 'kit' ? <ChevronUp className="text-gold w-5 h-5" /> : <ChevronDown className="opacity-40 w-5 h-5" />}
            </div>

            <div className={cn("px-4 pb-6 space-y-6 transition-all duration-700 origin-top overflow-hidden", activeSection === 'kit' ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 invisible")}>
              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.map((plan) => {
                    const isSelected = formData.plan_id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setFormData({ ...formData, plan_id: plan.id })}
                        className={cn(
                          "relative p-5 rounded-3xl border-2 transition-all duration-500 cursor-pointer flex flex-col group h-full",
                          isSelected
                            ? "border-gold bg-gold/[0.08] shadow-[0_0_30px_rgba(212,175,55,0.1)] scale-[1.02]"
                            : "border-white/5 bg-black/40 hover:border-gold/30 hover:bg-gold/[0.01]"
                        )}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-700", isSelected ? "bg-gold text-black shadow-gold" : "bg-gold/10 text-gold")}>
                            {plan.plan_type === 'gratis' ? <Globe className="w-5 h-5" /> : plan.plan_type === 'ilimitado' ? <Crown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-gold tracking-tight">R$ {plan.price}</p>
                            <p className="text-[8px] uppercase font-black text-muted-foreground tracking-widest opacity-60">Mensal</p>
                          </div>
                        </div>
                        <h4 className="font-black uppercase tracking-tighter text-white text-base leading-none mb-2">{plan.name}</h4>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-80 leading-tight mb-4">{plan.description}</p>
                        <div className="space-y-2 mt-auto border-t border-white/5 pt-4">
                          {Array.isArray(plan.features) && plan.features.slice(0, 4).map((f: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-[9px] text-muted-foreground group-hover:text-white transition-colors">
                              <CheckCircle2 className="w-3 h-3 text-gold shrink-0 mt-0.5" />
                              <span className="font-bold tracking-tight">{f}</span>
                            </div>
                          ))}
                        </div>
                        {isSelected && <div className="absolute top-3 right-3 text-gold"><CheckCircle2 className="w-5 h-5 fill-gold text-black animate-in zoom-in" /></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-gold hover:scale-[1.02] active:scale-[0.98] text-black font-black uppercase italic tracking-[0.2em] text-lg shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-500 rounded-2xl group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-45deg]" />
                  {isLoading ? (
                    <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processando...</div>
                  ) : (
                    <div className="flex items-center gap-2">CONCLUIR ADESÃO <Sparkles className="w-5 h-5" /></div>
                  )}
                </Button>
                <p className="text-center text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-4 opacity-40">
                  Ao clicar em concluir, você concorda com nossos termos.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center space-y-3 pt-8 opacity-30">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gold">Powered by RS Technology</p>
          <div className="flex items-center justify-center gap-4">
            <Globe className="w-4 h-4 text-gold" />
            <Lock className="w-4 h-4 text-gold" />
            <Shield className="w-4 h-4 text-gold" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultorCadastroPage;
