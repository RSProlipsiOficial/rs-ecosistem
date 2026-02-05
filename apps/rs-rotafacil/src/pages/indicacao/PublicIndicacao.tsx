import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    Users, Mail, Phone, User, MapPin, ArrowLeft,
    CreditCard, Shield, AlertCircle, CheckCircle2,
    ChevronDown, ChevronUp, ChevronRight, Package, Lock, Star,
    Sparkles, Globe, MapPinned, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Validação de CPF/CNPJ simplificada
function formatarDocumento(doc: string): string {
    const limpo = doc.replace(/\D/g, '');
    if (limpo.length <= 11) {
        return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export default function PublicIndicacao() {
    const { codigo } = useParams();
    const { toast } = useToast();
    const navigate = useNavigate();

    // Estados do Fluxo
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<'basico' | 'endereco' | 'kit'>('basico');
    const [indicador, setIndicador] = useState<{ name: string; id: string; email?: string; slug: string } | null>(null);
    const [branding, setBranding] = useState({ logo_url: "", company_name: "" });
    const [plans, setPlans] = useState<any[]>([]);

    // Form data centralizado
    const [formData, setFormData] = useState({
        nome_completo: '',
        email: '',
        whatsapp: '',
        cpf_cnpj: '',
        password: '',
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

    // Carregar dados iniciais
    useEffect(() => {
        const init = async () => {
            // 1. Branding
            const { data: brandData } = await supabase.from('app_settings').select('value').eq('key', 'branding').maybeSingle();
            if (brandData?.value) setBranding(brandData.value as any);

            // 2. Planos (Kits)
            const { data: plansData } = await supabase.from('subscription_plans').select('*').eq('active', true).order('price', { ascending: true });
            if (plansData) setPlans(plansData);

            // 3. Indicador (Patrocinador)
            const refCode = codigo || 'rsprolipsi';
            const { data: sponsorData } = await (supabase as any)
                .from('consultores')
                .select('user_id, nome, email, username')
                .eq('username', refCode)
                .maybeSingle();

            if (sponsorData) {
                setIndicador({
                    name: sponsorData.nome,
                    id: sponsorData.user_id,
                    email: sponsorData.email,
                    slug: sponsorData.username
                });
            } else if (refCode !== 'rsprolipsi') {
                // Fallback para rsprolipsi se o código for inválido
                const { data: defaultSponsor } = await (supabase as any)
                    .from('consultores')
                    .select('user_id, nome, email, username')
                    .eq('username', 'rsprolipsi')
                    .maybeSingle();

                if (defaultSponsor) {
                    setIndicador({
                        name: defaultSponsor.nome,
                        id: defaultSponsor.user_id,
                        email: defaultSponsor.email,
                        slug: defaultSponsor.username
                    });
                }
            }
        };
        init();
    }, [codigo]);

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

    const validateStep = (step: 'basico' | 'endereco' | 'kit') => {
        const errors: Record<string, string> = {};
        if (step === 'basico') {
            if (!formData.nome_completo) errors.nome = "Nome obrigatório";
            if (!formData.email.includes('@')) errors.email = "Email inválido";
            if (formData.cpf_cnpj.length < 11) errors.doc = "Documento incompleto";
            if (formData.password.length < 6) errors.pass = "Senha (mín. 6 chars)";
        }
        if (step === 'endereco') {
            if (!formData.cep) errors.cep = "CEP obrigatório";
            if (!formData.cidade) errors.cidade = "Cidade obrigatória";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSectionToggle = (section: 'basico' | 'endereco' | 'kit') => {
        // Só permite avançar se o passo atual estiver válido
        if (section === 'endereco' && !validateStep('basico')) return;
        if (section === 'kit' && !validateStep('endereco')) return;

        setActiveSection(activeSection === section ? section : section);
    };

    const handleSubmit = async (e: React.FormEvent) => {
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

        setLoading(true);

        try {
            // 0. Verificar existência na base total (via Edge Function para ignorar RLS e pegar metadados)
            const { data: checkData, error: checkError } = await supabase.functions.invoke('admin-users-v3', {
                method: 'POST',
                body: {
                    action: 'check-existence',
                    email: formData.email,
                    cpf: formData.cpf_cnpj
                }
            });

            if (checkError) throw checkError;

            if (checkData.exists) {
                const existing = checkData.user;
                const isRotaFacil = existing.user_metadata?.app === 'rotafacil';

                if (isRotaFacil) {
                    toast({
                        title: "E-mail ou CPF já cadastrados",
                        description: "Você já possui uma conta ativa no Rota Fácil. Vá para o login.",
                        variant: "destructive"
                    });
                    setTimeout(() => navigate('/auth'), 3000);
                    return;
                }

                // Usuário existe na RS mas não no Rota Fácil (Legacy)
                const confirmMigration = window.confirm(
                    "Identificamos que você já possui um cadastro no ecossistema RS Prólipsi.\n\nDeseja usar seus dados existentes para aderir ao Rota Fácil sob a indicação de " +
                    (indicador?.name || "RS Prólipsi") + "?"
                );

                if (confirmMigration) {
                    const { error: migrateError } = await supabase.functions.invoke('admin-users-v3', {
                        method: 'POST',
                        body: {
                            action: 'migrate-user',
                            userId: existing.id,
                            sponsor_id: indicador?.id || 'd107da4e-e266-41b0-947a-0c66b2f2b9ef'
                        }
                    });

                    if (migrateError) throw migrateError;

                    toast({
                        title: "✅ Migração Concluída!",
                        description: "Seus dados foram vinculados ao Rota Fácil. Você já pode acessar seu painel.",
                    });
                    setTimeout(() => navigate('/auth'), 2000);
                    return;
                } else {
                    toast({ title: "Atenção", description: "Para criar um novo cadastro, utilize um e-mail e CPF diferentes.", variant: "destructive" });
                    return;
                }
            }

            // 1. Criar Usuário no Auth (Se não existe)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.nome_completo,
                        nome: formData.nome_completo,
                        full_name: formData.nome_completo,
                        sponsor_id: indicador?.id || 'd107da4e-e266-41b0-947a-0c66b2f2b9ef',
                        sponsor_slug: indicador?.slug || 'rsprolipsi',
                        sponsor_user_id: indicador?.id,
                        boss_id: indicador?.id || 'd107da4e-e266-41b0-947a-0c66b2f2b9ef',
                        created_by: indicador?.id || 'd107da4e-e266-41b0-947a-0c66b2f2b9ef',
                        user_type: 'owner',
                        status: 'ativo',
                        app: 'rotafacil', // Tag for filtering in Admin Panel
                        cpf: formData.cpf_cnpj.length <= 11 ? formData.cpf_cnpj : null,
                        cnpj: formData.cpf_cnpj.length > 11 ? formData.cpf_cnpj : null,
                        plan_id: formData.plan_id
                    }
                }
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    toast({
                        title: 'E-mail já cadastrado',
                        description: 'Você já possui cadastro na RS Prólipsi. Vá em "Já sou Parceiro" para entrar e ativar seu kit.',
                        variant: 'destructive'
                    });
                    return;
                }
                throw authError;
            }
            if (!authData.user) throw new Error("Erro ao criar conta. Verifique os dados.");

            // 2. Criar perfil, assinatura e registro de consultor (Sincronização robusta)
            const fallbackUsername = formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
            const sponsorUserId = indicador?.id || 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

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
                    created_at: new Date().toISOString()
                }),
                supabase.from('consultores').insert({
                    user_id: authData.user.id,
                    nome: formData.nome_completo,
                    email: formData.email,
                    whatsapp: formData.whatsapp,
                    cpf: formData.cpf_cnpj,
                    username: fallbackUsername,
                    status: 'ativo',
                    patrocinador_id: sponsorUserId,
                    nivel_profundidade: 1
                }),
                supabase.from('indicados').insert({
                    nome_completo: formData.nome_completo,
                    email: formData.email,
                    whatsapp: formData.whatsapp,
                    indicado_por_id: sponsorUserId,
                    indicado_por_nome: indicador?.name || 'Sistema',
                    codigo_indicacao: indicador?.slug || 'rsprolipsi',
                    status: 'convertido',
                    origem: 'cadastro_direto'
                })
            ]);

            if (profileResult.error) console.error("Erro ao criar perfil:", profileResult.error);
            if (subResult.error) console.error("Erro ao criar assinatura:", subResult.error);
            if (consultorResult.error) console.error("Erro ao criar registro de consultor:", consultorResult.error);
            if (leadResult.error) console.error("Erro ao registrar lead:", leadResult.error);

            toast({
                title: '✅ Cadastro Finalizado!',
                description: "Seja bem-vindo ao ecossistema RS Prólipsi. Verifique seu e-mail para confirmar a conta.",
            });

            // Se tiver sessão, redireciona para o painel. Se não, para o login.
            if (authData.session) {
                setTimeout(() => navigate('/painel'), 2000);
            } else {
                setTimeout(() => navigate('/auth'), 3000);
            }

        } catch (error: any) {
            console.error("Erro submit:", error);
            toast({
                title: 'Erro no Cadastro',
                description: error.message || 'Tente novamente mais tarde',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Elementos Decorativos de Fundo */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.08)_0%,transparent_50%)] pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/5 blur-[120px] rounded-full opacity-30 pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold/5 blur-[120px] rounded-full opacity-30 pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10 py-12">
                {/* Header Profile */}
                <div className="text-center space-y-6 mb-12">
                    <div className="inline-block p-5 bg-black-secondary rounded-[40px] border border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)] animate-in zoom-in duration-700">
                        {branding.logo_url ? (
                            <img src={branding.logo_url} alt="Logo" className="h-20 w-auto object-contain mx-auto" />
                        ) : (
                            <Users className="w-14 h-14 text-gold mx-auto" />
                        )}
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black uppercase tracking-tighter italic text-gold leading-none">
                            RS Prólipsi
                        </h1>
                        <p className="text-muted-foreground font-black uppercase text-xs tracking-[0.5em] opacity-60">
                            Ecossistema de Transporte Escolar
                        </p>
                    </div>

                    {indicador && (
                        <div className="flex items-center justify-center gap-3 py-3 px-6 bg-gold/10 rounded-full border border-gold/20 w-fit mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <Star className="w-4 h-4 text-gold fill-gold" />
                            <span className="text-xs font-black uppercase tracking-widest text-gold/80">
                                Você foi convidado por: <span className="text-white ml-1">{indicador.name}</span>
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

                {/* Expandable Sections */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inicie seu Cadastro</p>
                    <button
                        type="button"
                        onClick={() => navigate('/auth')}
                        className="text-[10px] font-black text-gold uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                        Já sou parceiro RS <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* SEÇÃO 1: DADOS BÁSICOS */}
                    <div className={cn(
                        "bg-black-secondary rounded-[32px] border border-white/5 shadow-2xl transition-all duration-700",
                        activeSection === 'basico' ? "border-gold/30 ring-1 ring-gold/20" : "opacity-40 grayscale"
                    )}>
                        <div
                            onClick={() => handleSectionToggle('basico')}
                            className="p-8 flex items-center justify-between cursor-pointer group"
                        >
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "p-4 rounded-3xl transition-all duration-500",
                                    activeSection === 'basico' ? "bg-gold text-black shadow-gold" : "bg-white/5 text-muted-foreground"
                                )}>
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-black uppercase tracking-tighter text-white leading-none">Dados Pessoais</h3>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1 opacity-60">Sua identidade no ecossistema</p>
                                </div>
                            </div>
                            {activeSection === 'basico' ? <ChevronUp className="text-gold" /> : <ChevronDown className="opacity-40" />}
                        </div>

                        <div className={cn(
                            "px-8 pb-8 space-y-5 transition-all duration-700 origin-top overflow-hidden",
                            activeSection === 'basico' ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 invisible"
                        )}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black text-gold tracking-[0.2em] ml-1">Nome Completo</Label>
                                    <Input
                                        required
                                        placeholder="Ex: João Silva"
                                        value={formData.nome_completo}
                                        onChange={e => setFormData({ ...formData, nome_completo: e.target.value })}
                                        className="h-14 bg-white border-2 border-white/20 focus:border-black rounded-2xl transition-all !text-black font-bold placeholder:text-black/30"
                                        style={{ color: '#000000' }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black text-gold tracking-[0.2em] ml-1">Documento (CPF/CNPJ)</Label>
                                    <Input
                                        required
                                        placeholder="000.000.000-00"
                                        value={formatarDocumento(formData.cpf_cnpj)}
                                        onChange={e => setFormData({ ...formData, cpf_cnpj: e.target.value.replace(/\D/g, '') })}
                                        className="h-14 bg-white border-2 border-white/20 focus:border-black rounded-2xl transition-all !text-black font-bold"
                                        style={{ color: '#000000' }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black text-gold tracking-[0.2em] ml-1">WhatsApp</Label>
                                    <Input
                                        required
                                        placeholder="(00) 00000-0000"
                                        value={formData.whatsapp}
                                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="h-14 bg-white border-2 border-white/20 focus:border-black rounded-2xl transition-all !text-black font-bold"
                                        style={{ color: '#000000' }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black text-gold tracking-[0.2em] ml-1">Senha de Acesso</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-5 w-4 h-4 text-gold/40" />
                                        <Input
                                            required
                                            type="password"
                                            placeholder="Mínimo 6 dígitos"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="h-14 pl-12 bg-white border-2 border-white/20 focus:border-black rounded-2xl transition-all !text-black font-bold"
                                            style={{ color: '#000000' }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label className="uppercase text-[10px] font-black text-gold tracking-[0.2em] ml-1">Seu Melhor E-mail</Label>
                                    <Input
                                        required
                                        type="email"
                                        placeholder="cliente@exemplo.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="h-14 bg-white border-2 border-white/20 focus:border-black rounded-2xl transition-all !text-black font-bold"
                                        style={{ color: '#000000' }}
                                    />
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={() => handleSectionToggle('endereco')}
                                className="w-full h-14 bg-gold text-black hover:bg-gold/90 font-black uppercase tracking-widest text-xs rounded-2xl border border-gold/20 shadow-lg shadow-gold/20 mt-4 group"
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
                        <div
                            onClick={() => handleSectionToggle('endereco')}
                            className="p-8 flex items-center justify-between cursor-pointer group"
                        >
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "p-4 rounded-3xl transition-all duration-500",
                                    activeSection === 'endereco' ? "bg-gold text-black shadow-gold" : "bg-white/5 text-muted-foreground"
                                )}>
                                    <MapPinned className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-black uppercase tracking-tighter text-white leading-none">Endereço</h3>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1 opacity-60">Faturamento e Atendimento</p>
                                </div>
                            </div>
                            {activeSection === 'endereco' ? <ChevronUp className="text-gold" /> : <ChevronDown className="opacity-40" />}
                        </div>

                        <div className={cn(
                            "px-8 pb-8 space-y-5 transition-all duration-700 origin-top overflow-hidden",
                            activeSection === 'endereco' ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 invisible"
                        )}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black text-gold tracking-[0.2em] ml-1">CEP</Label>
                                    <Input
                                        required
                                        placeholder="00000-000"
                                        value={formData.cep}
                                        onChange={e => handleCEPLookup(e.target.value)}
                                        className="h-14 bg-white border-2 border-white/20 focus:border-black rounded-2xl transition-all !text-black font-bold font-mono"
                                        style={{ color: '#000000' }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black text-gold tracking-[0.2em] ml-1">Rua / Logradouro</Label>
                                    <Input
                                        required
                                        placeholder="Nome da sua rua"
                                        value={formData.rua}
                                        onChange={e => setFormData({ ...formData, rua: e.target.value })}
                                        className="h-14 bg-white border-2 border-white/20 focus:border-black rounded-2xl transition-all !text-black font-bold"
                                        style={{ color: '#000000' }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black text-gold tracking-[0.2em] ml-1">Número</Label>
                                    <Input
                                        required
                                        placeholder="123"
                                        value={formData.numero}
                                        onChange={e => setFormData({ ...formData, numero: e.target.value })}
                                        className="h-14 bg-white border-2 border-white/20 focus:border-black rounded-2xl transition-all !text-black font-bold"
                                        style={{ color: '#000000' }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black text-gold tracking-[0.2em] ml-1">Bairro</Label>
                                    <Input
                                        required
                                        placeholder="Seu bairro"
                                        value={formData.bairro}
                                        onChange={e => setFormData({ ...formData, bairro: e.target.value })}
                                        className="h-14 bg-white border-2 border-white/20 focus:border-black rounded-2xl transition-all !text-black font-bold"
                                        style={{ color: '#000000' }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black text-gold tracking-[0.2em] ml-1">Cidade</Label>
                                    <Input
                                        required
                                        placeholder="Sua cidade"
                                        value={formData.cidade}
                                        onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                                        className="h-14 bg-white border-2 border-white/20 focus:border-black rounded-2xl transition-all !text-black font-bold"
                                        style={{ color: '#000000' }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black text-gold tracking-[0.2em] ml-1">Estado (UF)</Label>
                                    <Input
                                        required
                                        placeholder="PR"
                                        maxLength={2}
                                        value={formData.estado?.toUpperCase()}
                                        onChange={e => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                                        className="h-14 bg-white border-2 border-white/20 focus:border-black rounded-2xl transition-all !text-black font-bold"
                                        style={{ color: '#000000' }}
                                    />
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={() => handleSectionToggle('kit')}
                                className="w-full h-14 bg-gold text-black hover:bg-gold/90 font-black uppercase tracking-widest text-xs rounded-2xl border border-gold/20 shadow-lg shadow-gold/20 mt-4"
                            >
                                Continuar: Escolha do Kit (Plano)
                            </Button>
                        </div>
                    </div>

                    {/* SEÇÃO 3: KITS - DESIGN OFFICE STYLE */}
                    <div className={cn(
                        "bg-black-secondary rounded-[32px] border border-white/5 shadow-2xl transition-all duration-700",
                        activeSection === 'kit' ? "border-gold/30 ring-1 ring-gold/20 bg-gold/[0.02]" : "opacity-40 grayscale"
                    )}>
                        <div
                            onClick={() => handleSectionToggle('kit')}
                            className="p-8 flex items-center justify-between cursor-pointer group"
                        >
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "p-4 rounded-3xl transition-all duration-500",
                                    activeSection === 'kit' ? "bg-gold text-black shadow-gold" : "bg-white/5 text-muted-foreground"
                                )}>
                                    <Package className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-black uppercase tracking-tighter text-white leading-none">Escolha seu Plano</h3>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1 opacity-60">O Motor do seu Negócio</p>
                                </div>
                            </div>
                            {activeSection === 'kit' ? <ChevronUp className="text-gold" /> : <ChevronDown className="opacity-40" />}
                        </div>

                        <div className={cn(
                            "px-4 sm:px-8 pb-10 space-y-8 transition-all duration-700 origin-top overflow-hidden",
                            activeSection === 'kit' ? "max-h-[2500px] opacity-100" : "max-h-0 opacity-0 invisible"
                        )}>
                            <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                                    {plans.map((plan) => {
                                        const isSelected = formData.plan_id === plan.id;
                                        const features = Array.isArray(plan.features) ? plan.features : [];
                                        const isPremium = plan.price > 0;
                                        const isHighlighted = plan.plan_type === 'profissional' || plan.plan_type === 'crescimento';

                                        return (
                                            <div
                                                key={plan.id}
                                                onClick={() => setFormData({ ...formData, plan_id: plan.id })}
                                                className={cn(
                                                    "relative p-6 rounded-[32px] border-2 transition-all duration-500 cursor-pointer flex flex-col group h-full",
                                                    isSelected
                                                        ? "border-gold bg-gold/[0.08] shadow-[0_0_40px_rgba(212,175,55,0.15)] scale-[1.03]"
                                                        : "border-white/5 bg-black/40 hover:border-gold/30 hover:bg-gold/[0.02]"
                                                )}
                                            >
                                                {isHighlighted && (
                                                    <div className="absolute -top-3 left-10 bg-gradient-gold text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                        Mais Popular
                                                    </div>
                                                )}

                                                <div className="flex items-start justify-between mb-6">
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700",
                                                        isSelected ? "bg-gold text-black shadow-gold" : "bg-gold/10 text-gold"
                                                    )}>
                                                        {plan.plan_type === 'gratis' ? <Globe className="w-7 h-7" /> :
                                                            plan.plan_type === 'profissional' || plan.plan_type === 'ilimitado' ? <Crown className="w-7 h-7" /> :
                                                                <Sparkles className="w-7 h-7" />}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-gold tracking-tighter">
                                                            {isPremium ? `R$ ${plan.price}` : 'FREE'}
                                                        </p>
                                                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">
                                                            {isPremium ? 'Mensal' : 'Teste 7 Dias'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mb-6">
                                                    <h4 className="font-black uppercase tracking-tighter text-white text-xl leading-none">{plan.name}</h4>
                                                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.1em] mt-2 opacity-80 leading-tight">
                                                        {plan.description}
                                                    </p>
                                                </div>

                                                <div className="space-y-3 mt-auto border-t border-white/5 pt-6 flex-grow">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Recursos Inclusos:</p>
                                                    {features.slice(0, 6).map((feature: string, idx: number) => (
                                                        <div key={idx} className="flex items-start gap-3 text-[11px] text-muted-foreground group-hover:text-white transition-colors duration-300">
                                                            <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                                                            <span className="font-bold tracking-tight leading-snug">{feature}</span>
                                                        </div>
                                                    ))}
                                                    {features.length > 6 && (
                                                        <p className="text-[10px] text-gold font-black uppercase tracking-widest mt-4 ml-7 animate-pulse">
                                                            + {features.length - 6} Recursos Premium
                                                        </p>
                                                    )}
                                                </div>

                                                {isSelected && (
                                                    <div className="absolute top-4 right-4 text-gold">
                                                        <CheckCircle2 className="w-6 h-6 fill-gold text-black animate-in zoom-in" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-8">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-gradient-gold hover:scale-[1.02] active:scale-[0.98] text-black font-black uppercase italic tracking-[0.2em] text-xl shadow-[0_0_50px_rgba(212,175,55,0.2)] transition-all duration-500 rounded-3xl group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-45deg]" />
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                                            Sincronizando...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            CONCLUIR MINHA ADESÃO
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                    )}
                                </Button>
                                <p className="text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-6 opacity-40">
                                    Ao continuar você aceita os termos de uso e privacidade.
                                </p>
                            </div>
                        </div>
                    </div>

                </form>

                {/* Footer Credits */}
                <div className="text-center space-y-4 pt-12 opacity-40 hover:opacity-100 transition-opacity duration-700">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gold">
                        Powered by RS Technology
                    </p>
                    <div className="flex items-center justify-center gap-6">
                        <Globe className="w-5 h-5 text-gold" />
                        <Lock className="w-5 h-5 text-gold" />
                        <Shield className="w-5 h-5 text-gold" />
                    </div>
                </div>
            </div>
        </div>
    );
}
