import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { User, MapPin, Phone, CheckCircle2, AlertCircle, ArrowLeft, Save, School, GraduationCap, DoorOpen, Mail, Fingerprint, Lock, Eye, EyeOff } from "lucide-react";
import { Header } from "@/components/ui/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PublicUpdate() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [fetchingData, setFetchingData] = useState(true);
    const [alunoData, setAlunoData] = useState<any>(null);
    const [vans, setVans] = useState<any[]>([]);
    const [colegios, setColegios] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);

    const [formData, setFormData] = useState({
        nome_completo: "",
        nome_responsavel: "",
        whatsapp_responsavel: "",
        cpf: "",
        email: "",
        endereco_rua: "",
        endereco_numero: "",
        endereco_bairro: "",
        endereco_cidade: "",
        endereco_estado: "",
        endereco_cep: "",
        tipo_residencia: "casa",
        nome_colegio: "",
        serie: "",
        turno: "",
        sala: "",
    });

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        async function loadAlunoData() {
            if (!token) return;

            try {
                setFetchingData(true);
                setError(null);

                const { data, error } = await supabase.rpc('get_aluno_by_update_token', {
                    p_token: token
                });

                if (error) throw error;
                if (!(data as any).success) throw new Error((data as any).message);

                setAlunoData(data.aluno);
                setVans(data.vans || []);
                setColegios(data.colegios || []);
                setFormData({
                    nome_completo: data.aluno.nome_completo || "",
                    nome_responsavel: data.aluno.nome_responsavel || "",
                    whatsapp_responsavel: data.aluno.whatsapp_responsavel || "",
                    cpf: data.aluno.cpf || "",
                    email: data.aluno.email || "",
                    endereco_rua: data.aluno.endereco_rua || "",
                    endereco_numero: data.aluno.endereco_numero || "",
                    endereco_bairro: data.aluno.endereco_bairro || "",
                    endereco_cidade: data.aluno.endereco_cidade || "",
                    endereco_estado: data.aluno.endereco_estado || "",
                    endereco_cep: data.aluno.endereco_cep || "",
                    tipo_residencia: data.aluno.tipo_residencia || "casa",
                    nome_colegio: data.aluno.nome_colegio || "",
                    serie: data.aluno.serie || "",
                    turno: data.aluno.turno || "",
                    sala: data.aluno.sala || "",
                    van_id: data.aluno.van_id || "",
                });
            } catch (err: any) {
                console.error("Erro ao carregar dados:", err);
                setError(err.message || "Link inválido ou expirado.");
            } finally {
                setFetchingData(false);
            }
        }

        loadAlunoData();
    }, [token]);

    const handleCepBlur = async () => {
        const cep = formData.endereco_cep.replace(/\D/g, "");
        if (cep.length === 8) {
            setCepLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        endereco_rua: data.logradouro,
                        endereco_bairro: data.bairro,
                        endereco_cidade: data.localidade,
                        endereco_estado: data.uf
                    }));
                }
            } catch (err) {
                console.error("Erro ao buscar CEP:", err);
            } finally {
                setCepLoading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('update_aluno_via_token', {
                p_token: token,
                p_updates: formData
            });

            if (error) throw error;

            if (data && (data as any).success) {
                // Se uma senha foi fornecida, criar/atualizar conta do responsável
                if (password) {
                    try {
                        await supabase.functions.invoke('create-responsavel-account', {
                            body: {
                                email: formData.email,
                                password: password,
                                nome: formData.nome_responsavel,
                                aluno_id: alunoData.id,
                                cpf: formData.cpf
                            }
                        });
                    } catch (accErr) {
                        console.error("Erro ao criar/atualizar conta:", accErr);
                        // Não bloqueia o sucesso da atualização dos dados do aluno
                    }
                }

                setSuccess(true);
                toast({
                    title: "Sucesso!",
                    description: "Dados atualizados com sucesso.",
                    className: "bg-green-500 text-white"
                });
            } else {
                throw new Error((data as any)?.message || "Erro ao atualizar dados.");
            }
        } catch (err: any) {
            console.error("Erro ao atualizar:", err);
            toast({
                title: "Erro na atualização",
                description: err.message || "Não foi possível atualizar os dados.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="min-h-screen bg-black-primary flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-gold font-medium">Carregando dados...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-red-500/50 bg-black-secondary shadow-2xl shadow-red-500/10">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <CardTitle className="text-2xl text-red-500 italic uppercase">Link Inválido ou Expirado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        <p className="text-muted-foreground">
                            Este link de atualização já foi utilizado, está incorreto ou expirou (links duram 48 horas).
                        </p>
                        <Button
                            onClick={() => navigate('/familia/login')}
                            className="w-full bg-gold text-black-primary font-bold uppercase transition-all duration-300 h-14 rounded-2xl"
                        >
                            Fazer Login Agora
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
                <Card className="max-w-lg w-full border-gold/50 bg-black-secondary shadow-2xl shadow-gold/10">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-12 h-12 text-gold" />
                        </div>
                        <CardTitle className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent italic uppercase tracking-tighter">
                            Dados Atualizados!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        <p className="text-white font-medium">
                            Obrigado! As informações do aluno <strong>{formData.nome_completo}</strong> foram atualizadas com sucesso no sistema do transportador.
                        </p>
                        <div className="p-4 bg-gold/5 rounded-xl border border-gold/20 italic text-sm text-gold">
                            Este link de uso único foi desativado por segurança.
                        </div>
                        <Button
                            onClick={() => window.location.href = "/responsavel/login"}
                            className="w-full h-14 bg-gradient-gold text-black font-black uppercase tracking-widest italic shadow-xl shadow-gold/20 border-none hover:opacity-90"
                        >
                            <User className="w-6 h-6 mr-3 text-black" />
                            Acessar Área da Família
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black-primary pb-12 overflow-y-auto selection:bg-gold/30">
            <Header />

            <div className="max-w-3xl mx-auto px-4 pt-12">
                <div className="mb-8 flex items-center gap-4 p-6 rounded-2xl bg-black-secondary border border-gold/20 shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-lg shrink-0">
                        <User className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white italic uppercase leading-none">
                            Atualização Cadastral
                        </h2>
                        <p className="text-gold/70 text-xs font-bold uppercase tracking-widest mt-1">
                            Aluno: {alunoData?.nome_completo}
                        </p>
                    </div>
                </div>

                <Card className="border-gold/20 bg-black-secondary overflow-hidden rounded-2xl shadow-2xl">
                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gold/70">Nome do Aluno</Label>
                                        <Input
                                            required
                                            value={formData.nome_completo}
                                            onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                                            className="bg-black-primary border-gold/20 focus:border-gold h-12 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gold/70">Nome do Responsável</Label>
                                        <Input
                                            required
                                            value={formData.nome_responsavel}
                                            onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
                                            className="bg-black-primary border-gold/20 focus:border-gold h-12 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gold/70">WhatsApp do Responsável</Label>
                                        <Input
                                            required
                                            placeholder="(00) 00000-0000"
                                            value={formData.whatsapp_responsavel}
                                            onChange={(e) => setFormData({ ...formData, whatsapp_responsavel: e.target.value })}
                                            className="bg-black-primary border-gold/20 focus:border-gold h-12 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gold/70 flex items-center gap-2">
                                            <Fingerprint className="w-3 h-3" /> CPF do Responsável
                                        </Label>
                                        <Input
                                            required
                                            placeholder="000.000.000-00"
                                            value={formData.cpf}
                                            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                            className="bg-black-primary border-gold/20 focus:border-gold h-12 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gold/70 flex items-center gap-2">
                                            <Mail className="w-3 h-3" /> E-mail
                                        </Label>
                                        <Input
                                            required
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-black-primary border-gold/20 focus:border-gold h-12 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-4 md:col-span-2 pt-4 border-t border-white/5">
                                        <h3 className="text-sm font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                                            <School className="w-4 h-4" /> Dados Escolares
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sua Van (Transportador)</Label>
                                                <Select
                                                    value={formData.van_id}
                                                    onValueChange={(val) => setFormData({ ...formData, van_id: val })}
                                                >
                                                    <SelectTrigger className="bg-black-primary border-gold/10 h-11">
                                                        <SelectValue placeholder="Selecione a Van..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-black-secondary border-gold/20 text-white">
                                                        {vans.map(van => (
                                                            <SelectItem key={van.id} value={van.id}>{van.nome}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Colégio</Label>
                                                <Select
                                                    value={formData.nome_colegio}
                                                    onValueChange={(val) => setFormData({ ...formData, nome_colegio: val })}
                                                >
                                                    <SelectTrigger className="bg-black-primary border-gold/10 h-11">
                                                        <SelectValue placeholder="Selecione o Colégio..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-black-secondary border-gold/20 text-white max-h-[300px]">
                                                        {colegios.map(col => (
                                                            <SelectItem key={col.id} value={col.nome}>{col.nome}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Série / Ano</Label>
                                                <Input
                                                    required
                                                    value={formData.serie}
                                                    onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                                                    className="bg-black-primary border-gold/10 h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Turno</Label>
                                                <Select
                                                    value={formData.turno}
                                                    onValueChange={(val) => setFormData({ ...formData, turno: val })}
                                                >
                                                    <SelectTrigger className="bg-black-primary border-gold/10 h-11">
                                                        <SelectValue placeholder="Selecione..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-black-secondary border-gold/20 text-white">
                                                        <SelectItem value="manha">Manhã</SelectItem>
                                                        <SelectItem value="tarde">Tarde</SelectItem>
                                                        <SelectItem value="noite">Noite</SelectItem>
                                                        <SelectItem value="integral">Integral</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <DoorOpen className="w-3 h-3" /> Sala
                                                </Label>
                                                <Input
                                                    value={formData.sala}
                                                    onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                                                    className="bg-black-primary border-gold/10 h-11"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gold/70">CEP</Label>
                                        <div className="relative">
                                            <Input
                                                required
                                                value={formData.endereco_cep}
                                                onChange={(e) => setFormData({ ...formData, endereco_cep: e.target.value })}
                                                onBlur={handleCepBlur}
                                                className="bg-black-primary border-gold/20 focus:border-gold h-12 font-bold"
                                            />
                                            {cepLoading && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gold/70">Tipo de Residência</Label>
                                        <Select
                                            value={formData.tipo_residencia}
                                            onValueChange={(val) => setFormData({ ...formData, tipo_residencia: val })}
                                        >
                                            <SelectTrigger className="bg-black-primary border-gold/20 h-12 font-bold">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-black-secondary border-gold/20 text-white">
                                                <SelectItem value="casa">Casa</SelectItem>
                                                <SelectItem value="apartamento">Apartamento</SelectItem>
                                                <SelectItem value="condominio">Condomínio</SelectItem>
                                                <SelectItem value="outro">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h3 className="text-sm font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Endereço Residencial
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-3 space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rua</Label>
                                            <Input
                                                required
                                                value={formData.endereco_rua}
                                                onChange={(e) => setFormData({ ...formData, endereco_rua: e.target.value })}
                                                className="bg-black-primary border-gold/10 h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Número</Label>
                                            <Input
                                                required
                                                value={formData.endereco_numero}
                                                onChange={(e) => setFormData({ ...formData, endereco_numero: e.target.value })}
                                                className="bg-black-primary border-gold/10 h-11"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bairro</Label>
                                            <Input
                                                required
                                                value={formData.endereco_bairro}
                                                onChange={(e) => setFormData({ ...formData, endereco_bairro: e.target.value })}
                                                className="bg-black-primary border-gold/10 h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cidade</Label>
                                            <Input
                                                required
                                                value={formData.endereco_cidade}
                                                onChange={(e) => setFormData({ ...formData, endereco_cidade: e.target.value })}
                                                className="bg-black-primary border-gold/10 h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado</Label>
                                            <Input
                                                required
                                                value={formData.endereco_estado}
                                                onChange={(e) => setFormData({ ...formData, endereco_estado: e.target.value })}
                                                className="bg-black-primary border-gold/10 h-11"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gold/20">
                                    <h3 className="text-sm font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                                        <Lock className="w-4 h-4" /> Senha de Acesso (Escritório do Pai)
                                    </h3>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            Defina uma senha para acessar seu painel financeiro futuramente
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Senha de Acesso (Deixe em branco para usar 123456)"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-black-primary border-gold/30 h-12 font-bold pr-12 focus:border-gold placeholder:text-[10px]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">
                                            * A senha padrão para todos os pais agora é <strong>123456</strong>. Você pode definir uma nova ou usar a padrão.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-gradient-gold text-black font-black text-lg uppercase italic tracking-widest shadow-xl shadow-gold/10 hover:opacity-90 transition-all border-none"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        Salvando...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save className="w-6 h-6" />
                                        Confirmar Atualização
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                    </form>
                </Card>
            </div>
        </div>
    );
}
