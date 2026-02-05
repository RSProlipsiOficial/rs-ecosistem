
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Users, UserPlus, Mail, Phone, Lock, Trash2, Bus, UserCheck, Copy, Loader2, X, AlertTriangle, RefreshCw, Pencil, Eye, EyeOff, DollarSign, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Colaborador {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    tipo_usuario: 'motorista' | 'monitora' | 'usuario';
    van_id?: string;
    salario?: number;
    cpf?: string;
    data_nascimento?: string;
    endereco?: {
        cep: string;
        rua: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        complemento: string;
    };
    password?: string; // Temporário para edição
}

export default function EquipeIndex() {
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [vans, setVans] = useState<any[]>([]);
    const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        password: "",
        tipo_usuario: "motorista" as 'motorista' | 'monitora',
        van_id: "",
        salario: "",
        cpf: "",
        telefone: "",
        data_nascimento: "",
        endereco: {
            cep: "",
            rua: "",
            numero: "",
            bairro: "",
            cidade: "",
            estado: "",
            complemento: ""
        }
    });

    useEffect(() => {
        loadVans();
        loadEquipe();
    }, []);

    async function loadVans() {
        try {
            const { data: authData } = await supabase.auth.getUser();
            if (!authData.user) return;

            const { data } = await supabase
                .from('vans')
                .select('id, nome')
                .eq('user_id', authData.user.id);
            if (data) setVans(data);
        } catch (error) {
            console.error("Erro ao carregar vans:", error);
        }
    }

    const handleCepBlur = async (isEdit = false) => {
        const cepValue = isEdit ? editingColaborador?.endereco?.cep : formData.endereco.cep;
        const cep = (cepValue || "").replace(/\D/g, "");

        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    if (isEdit && editingColaborador) {
                        setEditingColaborador({
                            ...editingColaborador,
                            endereco: {
                                ...editingColaborador.endereco!,
                                rua: data.logradouro,
                                bairro: data.bairro,
                                cidade: data.localidade,
                                estado: data.uf
                            }
                        });
                    } else {
                        setFormData({
                            ...formData,
                            endereco: {
                                ...formData.endereco,
                                rua: data.logradouro,
                                bairro: data.bairro,
                                cidade: data.localidade,
                                estado: data.uf
                            }
                        });
                    }
                }
            } catch (err) {
                console.error("Erro ao buscar CEP:", err);
            }
        }
    };

    const cpfMask = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})/, "$1-$2")
            .replace(/(-\d{2})\d+?$/, "$1");
    };

    const phoneMask = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .replace(/(-\d{4})\d+?$/, "$1");
    };

    const cepMask = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .replace(/(-\d{3})\d+?$/, "$1");
    };

    async function loadEquipe() {
        setLoading(true);
        setErrorMessage(null);
        try {
            // Primeiro, pegar o usuário logado
            const { data: authData } = await supabase.auth.getUser();
            const currentUserId = authData.user?.id;

            if (!currentUserId) {
                throw new Error("Usuário não autenticado");
            }

            // Buscar colaboradores diretamente via RPC que retorna usuários vinculados ao dono
            const { data: teamData, error: teamError } = await (supabase as any).rpc('get_owner_team_members', {
                owner_id: currentUserId
            });

            console.log("CRITICAL DEBUG - Team response:", teamData, teamError);

            if (teamError) {
                // Fallback: buscar via Edge Function com filtro de sponsor_id
                console.log("Fallback: usando Edge Function");
                const { data, error } = await supabase.functions.invoke('admin-users-v3', {
                    method: 'GET'
                });

                if (error) throw error;

                let finalUsers = [];
                if (Array.isArray(data)) {
                    finalUsers = data;
                } else if (data && typeof data === 'object' && Array.isArray(data.users)) {
                    finalUsers = data.users;
                } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
                    finalUsers = data.data;
                }

                // Filtrar por colaboradores do usuário logado (sponsor_id ou boss_id)
                finalUsers = finalUsers.filter((u: any) => {
                    const tipo = (u.tipo_usuario || '').toLowerCase();
                    const sponsorId = u.sponsor_id || u.user_metadata?.sponsor_id || u.user_metadata?.boss_id;
                    return (tipo === 'motorista' || tipo === 'monitora') && sponsorId === currentUserId;
                });

                setColaboradores(finalUsers);
            } else {
                // RPC retornou dados
                const finalUsers = (teamData || []).filter((u: any) => {
                    const tipo = (u.tipo_usuario || '').toLowerCase();
                    return tipo === 'motorista' || tipo === 'monitora';
                });
                setColaboradores(finalUsers);
            }

            console.log("Debug - Equipe carregada:", colaboradores);
        } catch (err: any) {
            console.error("Erro ao carregar equipe:", err);
            setErrorMessage(err.message || "Erro ao conectar com o servidor.");
            toast({
                title: "Erro na lista",
                description: "Falha ao carregar equipe.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        if (!formData.nome || !formData.email || !formData.password) {
            toast({ title: "Atenção", description: "Preencha todos os campos.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            const { data, error } = await supabase.functions.invoke('admin-users-v3', {
                method: 'POST',
                body: formData
            });

            if (error) {
                // Tenta extrair a mensagem de erro do corpo da resposta se for JSON
                let errorMsg = error.message;
                try {
                    const errorData = await error.context?.json();
                    if (errorData?.error) errorMsg = errorData.error;
                } catch (e) {
                    // Se não for JSON, mantém a mensagem padrão do error
                }
                throw new Error(errorMsg);
            }

            toast({ title: "Sucesso!", description: "Novo acesso criado." });
            setFormData({
                nome: "", email: "", password: "", tipo_usuario: "motorista", van_id: "", salario: "",
                cpf: "", telefone: "", data_nascimento: "",
                endereco: { cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "", complemento: "" }
            });
            setShowAddForm(false);
            loadEquipe();
        } catch (err: any) {
            toast({ title: "Erro", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate() {
        if (!editingColaborador) return;
        setSaving(true);
        try {
            const { error } = await supabase.functions.invoke('admin-users-v3', {
                method: 'PUT',
                body: {
                    userId: editingColaborador.id,
                    nome: editingColaborador.nome,
                    email: editingColaborador.email,
                    tipo_usuario: editingColaborador.tipo_usuario,
                    van_id: editingColaborador.van_id,
                    salario: Number(editingColaborador.salario) || 0,
                    cpf: editingColaborador.cpf,
                    telefone: editingColaborador.telefone,
                    data_nascimento: editingColaborador.data_nascimento,
                    endereco: editingColaborador.endereco,
                    password: editingColaborador.password
                }
            });
            if (error) throw error;
            toast({ title: "Sucesso", description: "Colaborador atualizado com sucesso." });
            setEditingColaborador(null);
            loadEquipe();
        } catch (err: any) {
            toast({ title: "Erro", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    }

    async function handleRemove(userId: string, nome: string) {
        if (!confirm(`Excluir acesso de ${nome}?`)) return;
        try {
            const { error } = await supabase.functions.invoke('admin-users-v3', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: { userId: userId }
            });
            if (error) throw error;
            toast({ title: "Removido", description: "Usuário excluído." });
            loadEquipe();
        } catch (err: any) {
            toast({ title: "Erro", description: err.message, variant: "destructive" });
        }
    }

    async function handleSendResetEmail(email: string) {
        try {
            setSaving(true);
            const { error } = await supabase.functions.invoke('admin-users-v3', {
                method: 'POST',
                body: { action: 'reset-password', email: email }
            });
            if (error) throw error;
            toast({
                title: "Sucesso",
                description: "Link de recuperação enviado para o e-mail do colaborador."
            });
        } catch (err: any) {
            toast({
                title: "Erro",
                description: err.message || "Erro ao enviar e-mail de recuperação.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <MainLayout>
            <div className="space-y-6" translate="no">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold italic tracking-tight text-white uppercase" translate="no">COLABORADORES</h1>
                        <p className="text-gray-400">Gerencie seus motoristas e monitoras</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadEquipe}
                            className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
                            title="Recarregar lista"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all ${showAddForm ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary text-primary-foreground hover:scale-105'
                                }`}
                        >
                            {showAddForm ? <><X className="w-4 h-4" /> CANCELAR</> : <><UserPlus className="w-4 h-4" /> NOVO COLABORADOR</>}
                        </button>
                    </div>
                </div>

                {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">{errorMessage}</span>
                        <button onClick={loadEquipe} className="ml-auto underline text-sm">Tentar novamente</button>
                    </div>
                )}

                {showAddForm && (
                    <div className="bg-[#1A1F2C] border border-primary/20 rounded-xl p-6 shadow-2xl space-y-4">
                        <h2 className="text-xl font-black text-primary">CADASTRO DE COLABORADOR</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase opacity-60">Nome Completo</label>
                                <input
                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                    placeholder="Ex: Pedro Santos"
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase opacity-60">Email (Acesso)</label>
                                <input
                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                    placeholder="pedro@rotafacil.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase opacity-60">Senha de Acesso</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white pl-10 pr-10"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="No mínimo 6 caracteres"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <Lock className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase opacity-60">Vincular à Van</label>
                                <select
                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white appearance-none"
                                    value={formData.van_id}
                                    onChange={e => setFormData({ ...formData, van_id: e.target.value })}
                                >
                                    <option value="">Selecione uma van...</option>
                                    {vans.map(v => (
                                        <option key={v.id} value={v.id}>{v.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase opacity-60">Salário Base (Mensal)</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white pl-10"
                                        placeholder="Ex: 2500"
                                        type="number"
                                        value={formData.salario}
                                        onChange={e => setFormData({ ...formData, salario: e.target.value })}
                                    />
                                    <DollarSign className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase opacity-60">CPF</label>
                                <input
                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                    placeholder="000.000.000-00"
                                    value={formData.cpf}
                                    onChange={e => setFormData({ ...formData, cpf: cpfMask(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase opacity-60">WhatsApp</label>
                                <input
                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                    placeholder="(00) 00000-0000"
                                    value={formData.telefone}
                                    onChange={e => setFormData({ ...formData, telefone: phoneMask(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase opacity-60">Data de Nascimento</label>
                                <input
                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                    type="date"
                                    value={formData.data_nascimento}
                                    onChange={e => setFormData({ ...formData, data_nascimento: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 bg-black/20 p-4 rounded-lg border border-white/5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase opacity-60">CEP</label>
                                    <input
                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                        placeholder="00000-000"
                                        value={formData.endereco.cep}
                                        onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, cep: cepMask(e.target.value) } })}
                                        onBlur={() => handleCepBlur(false)}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-xs font-bold uppercase opacity-60">Logradouro (Rua/Av)</label>
                                    <input
                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                        placeholder="Ex: Rua das Flores"
                                        value={formData.endereco.rua}
                                        onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, rua: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase opacity-60">Número</label>
                                    <input
                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                        placeholder="Ex: 123"
                                        value={formData.endereco.numero}
                                        onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, numero: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase opacity-60">Bairro</label>
                                    <input
                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                        placeholder="Bairro"
                                        value={formData.endereco.bairro}
                                        onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, bairro: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase opacity-60">Cidade</label>
                                    <input
                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                        placeholder="Cidade"
                                        value={formData.endereco.cidade}
                                        onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, cidade: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase opacity-60">Estado</label>
                                    <input
                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                        placeholder="UF"
                                        maxLength={2}
                                        value={formData.endereco.estado}
                                        onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, estado: e.target.value.toUpperCase() } })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase opacity-60">Comp.</label>
                                    <input
                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-4 py-3 text-sm focus:border-primary outline-none text-white"
                                        placeholder="Apto/Sala"
                                        value={formData.endereco.complemento}
                                        onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, complemento: e.target.value } })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase opacity-60">Função do Membro</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 rounded-lg border-2 transition-all font-black text-xs ${formData.tipo_usuario === 'motorista' ? 'border-primary bg-primary text-black' : 'border-gray-800 text-gray-400'
                                            }`}
                                        onClick={() => setFormData({ ...formData, tipo_usuario: 'motorista' })}
                                    >
                                        <Bus className="w-6 h-6" /> MOTORISTA
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 rounded-lg border-2 transition-all font-black text-xs ${formData.tipo_usuario === 'monitora' ? 'border-primary bg-primary text-black' : 'border-gray-800 text-gray-400'
                                            }`}
                                        onClick={() => setFormData({ ...formData, tipo_usuario: 'monitora' })}
                                    >
                                        <UserCheck className="w-6 h-6" /> MONITORA
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleCreate}
                                disabled={saving}
                                className="bg-primary hover:bg-primary/90 text-black font-black py-4 px-10 rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl"
                            >
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> SALVANDO...</> : "FINALIZAR CADASTRO"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="font-bold text-gray-500 italic">CARREGANDO EQUIPE...</p>
                        </div>
                    ) : Array.isArray(colaboradores) && colaboradores.length === 0 ? (
                        <div className="col-span-full border-2 border-dashed border-gray-800 rounded-xl py-20 flex flex-col items-center text-center text-gray-500">
                            <Users className="w-12 h-12 mb-4 opacity-10" />
                            <p className="font-bold uppercase tracking-widest opacity-50">Sua equipe está vazia</p>
                            <p className="text-sm mt-2">Adicione seu primeiro motorista ou monitora acima.</p>
                        </div>
                    ) : Array.isArray(colaboradores) ? (
                        colaboradores.map(c => (
                            <div key={c.id} className="bg-[#1A1F2C] border border-gray-800 rounded-xl p-5 hover:border-primary/40 transition-all shadow-md group">
                                {editingColaborador?.id === c.id ? (
                                    <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-primary/20 animate-in fade-in zoom-in duration-200">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block text-primary">Nome</label>
                                                <input
                                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-3 py-2 text-sm focus:border-primary outline-none text-white"
                                                    value={editingColaborador.nome}
                                                    onChange={e => setEditingColaborador({ ...editingColaborador, nome: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block text-primary">Email</label>
                                                <input
                                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-3 py-2 text-sm focus:border-primary outline-none text-white"
                                                    value={editingColaborador.email}
                                                    onChange={e => setEditingColaborador({ ...editingColaborador, email: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block text-primary">Função</label>
                                                <select
                                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-3 py-2 text-sm focus:border-primary outline-none text-white"
                                                    value={editingColaborador.tipo_usuario}
                                                    onChange={e => setEditingColaborador({ ...editingColaborador, tipo_usuario: e.target.value as any })}
                                                >
                                                    <option value="motorista">Motorista</option>
                                                    <option value="monitora">Monitora</option>
                                                    <option value="usuario">Administrador</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block text-primary">Van Vinculada</label>
                                                <select
                                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-3 py-2 text-sm focus:border-primary outline-none text-white"
                                                    value={editingColaborador.van_id || ""}
                                                    onChange={e => setEditingColaborador({ ...editingColaborador, van_id: e.target.value })}
                                                >
                                                    <option value="">Sem Van</option>
                                                    {vans.map(v => (
                                                        <option key={v.id} value={v.id}>{v.nome}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block text-primary">Salário Mensal</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-3 py-2 text-sm focus:border-primary outline-none text-white"
                                                    value={editingColaborador.salario || ""}
                                                    onChange={e => setEditingColaborador({ ...editingColaborador, salario: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block text-primary">CPF</label>
                                                    <input
                                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-3 py-2 text-sm focus:border-primary outline-none text-white"
                                                        value={editingColaborador.cpf || ""}
                                                        onChange={e => setEditingColaborador({ ...editingColaborador, cpf: cpfMask(e.target.value) })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block text-primary">WhatsApp</label>
                                                    <input
                                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-3 py-2 text-sm focus:border-primary outline-none text-white"
                                                        value={editingColaborador.telefone || ""}
                                                        onChange={e => setEditingColaborador({ ...editingColaborador, telefone: phoneMask(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block text-primary">Data de Nascimento</label>
                                                <input
                                                    className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-3 py-2 text-sm focus:border-primary outline-none text-white"
                                                    type="date"
                                                    value={editingColaborador.data_nascimento || ""}
                                                    onChange={e => setEditingColaborador({ ...editingColaborador, data_nascimento: e.target.value })}
                                                />
                                            </div>
                                            <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2">
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="col-span-1">
                                                        <label className="text-[8px] font-bold uppercase opacity-50 mb-1 block">CEP</label>
                                                        <input
                                                            className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-2 py-1 text-xs outline-none text-white"
                                                            value={editingColaborador.endereco?.cep || ""}
                                                            onChange={e => setEditingColaborador({
                                                                ...editingColaborador,
                                                                endereco: { ...(editingColaborador.endereco || { cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "", complemento: "" }), cep: cepMask(e.target.value) }
                                                            })}
                                                            onBlur={() => handleCepBlur(true)}
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="text-[8px] font-bold uppercase opacity-50 mb-1 block">Rua</label>
                                                        <input
                                                            className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-2 py-1 text-xs outline-none text-white"
                                                            value={editingColaborador.endereco?.rua || ""}
                                                            onChange={e => setEditingColaborador({
                                                                ...editingColaborador,
                                                                endereco: { ...(editingColaborador.endereco || { cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "", complemento: "" }), rua: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block text-primary">Nova Senha (Opcional)</label>
                                                <div className="relative">
                                                    <input
                                                        type={showEditPassword ? "text" : "password"}
                                                        className="w-full bg-[#0F1117] border border-gray-800 rounded-md px-3 py-2 text-sm focus:border-primary outline-none text-white pl-10 pr-10"
                                                        placeholder="Mínimo 6 caracteres"
                                                        value={editingColaborador.password || ""}
                                                        onChange={e => setEditingColaborador({ ...editingColaborador, password: e.target.value })}
                                                    />
                                                    <Lock className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowEditPassword(!showEditPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                                                    >
                                                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs shadow-lg"
                                                onClick={handleUpdate}
                                                disabled={saving}
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "SALVAR ALTERAÇÕES"}
                                            </button>
                                            <button
                                                className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg flex items-center justify-center transition-all"
                                                onClick={() => setEditingColaborador(null)}
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-3 rounded-xl ${c.tipo_usuario === 'motorista' ? 'bg-orange-500/10 text-orange-500' : 'bg-pink-500/10 text-pink-500'}`}>
                                                    {c.tipo_usuario === 'motorista' ? <Bus className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-lg leading-tight text-white uppercase">{c.nome}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[10px] font-black tracking-tighter px-2 py-0.5 rounded-full ${c.tipo_usuario === 'motorista' ? 'bg-orange-500/20 text-orange-400' : 'bg-pink-500/20 text-pink-400'
                                                            }`}>
                                                            {c.tipo_usuario.toUpperCase()}
                                                        </span>
                                                        {c.salario ? (
                                                            <span className="text-green-500 text-[10px] font-black bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1">
                                                                <span className="opacity-50 text-[8px] uppercase">Salário:</span>
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.salario)}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEditingColaborador({ ...c })}
                                                className="p-2 text-gray-400 hover:text-primary transition-colors bg-white/5 rounded-lg border border-white/5 hover:border-primary/20 shadow-sm"
                                                title="Editar colaborador"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-2 text-xs text-gray-400 mb-6 bg-black/20 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 truncate font-medium">
                                                <Mail className="w-3.5 h-3.5 text-primary" /> {c.email}
                                            </div>
                                            {c.telefone && (
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Phone className="w-3.5 h-3.5 text-green-500" /> {c.telefone}
                                                </div>
                                            )}
                                            {c.cpf && (
                                                <div className="flex items-center gap-2 font-medium">
                                                    <CreditCard className="w-3.5 h-3.5 text-primary/60" /> {c.cpf}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 font-black text-primary pt-1 border-t border-white/5 mt-1">
                                                <Bus className="w-3.5 h-3.5" />
                                                {vans.find(v => v.id === c.van_id)?.nome || (c as any).user_metadata?.van_nome || "Van não vinculada"}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider shadow-sm group-hover:bg-gray-700 border border-white/5"
                                                    onClick={() => setEditingColaborador({ ...c })}
                                                >
                                                    <Pencil className="w-4 h-4 text-primary" /> EDITAR DADOS
                                                </button>
                                                <button
                                                    className="p-3 text-red-500 bg-red-500/5 hover:bg-red-500/20 rounded-lg transition-all border border-red-500/10 shadow-sm"
                                                    onClick={() => handleRemove(c.id, c.nome)}
                                                    title="Excluir Colaborador"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <button
                                                className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black py-2 rounded-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider border border-primary/20"
                                                onClick={() => handleSendResetEmail(c.email)}
                                                disabled={saving}
                                            >
                                                <Mail className="w-4 h-4" /> ENVIAR LINK DE RESET DE SENHA
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-red-500 font-bold uppercase">
                            Erro fatal no formato dos dados. Recarregue a página.
                        </div>
                    )}
                </div>
            </div>
        </MainLayout >
    );
}
