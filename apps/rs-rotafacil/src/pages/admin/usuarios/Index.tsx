import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Users, Edit3, Save, X, Key, Mail, Phone, User, Plus, UserPlus, ChevronRight, ChevronLeft, Folder, Home, RefreshCw, Search, BadgeCheck, Package, Loader2, CreditCard, Shield, ArrowLeft, AlertTriangle, AlertCircle, Bus, UserCheck, Target, CheckCircle2, Clock, ShieldCheck, UserCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";

const ADMIN_EMAILS = [
  'rsprolipsioficial@gmail.com',
  'suporte.rotafacil@gmail.com',
  'contato@rotasystem.com',
  'roberto@rsgroup.com',
  'rotafaciloficial@gmail.com'
];

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  status: string;
  tipo_usuario: string;
  created_at: string;
  updated_at: string;
  ultimo_login?: string;
  salario_base?: number;
  pix_key?: string;
  pix_type?: string;
  plan_id?: string;
  van_id?: string;
  cpf?: string;
  sponsor_id?: string | null;
  boss_id?: string | null;
  motoristas?: number;
  monitoras?: number;
  alunos?: number;
  indicados?: number;
  user_metadata?: any;
  app?: string;
  endereco?: {
    cep?: string;
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    complemento?: string;
  };
}

interface TeamUsage {
  motoristas: number;
  monitoras: number;
  alunos: number;
  indicados?: number;
}

export default function AdminUsuariosIndex() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [allTeamUsers, setAllTeamUsers] = useState<Usuario[]>([]);
  const [teamUsage, setTeamUsage] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null, nome: string }[]>([{ id: null, nome: "Geral" }]);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'rotafacil' | 'all'>('rotafacil');
  const [searchTerm, setSearchTerm] = useState("");
  const [userCounts, setUserCounts] = useState({ total: 0, rotafacil: 0, motoristas: 0, alunos: 0 });
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [plans, setPlans] = useState<{ id: string, name: string }[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    status: "ativo",
    tipo_usuario: "usuario",
    plan_id: "",
    van_id: "",
    pix_type: "",
    pix_key: "",
    salario_base: 0,
    senha: "",
    cpf: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    complemento: ""
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefone: "",
    status: "ativo",
    tipo_usuario: "usuario",
    cpf: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    complemento: "",
    salario_base: 0,
    pix_key: "",
    pix_type: "",
    van_id: "",
    plan_id: ""
  });

  const newUserSchema = z.object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"]
  });

  const lastLoadedParamsRef = (window as any)._lastLoadedParamsRef || { current: "" };
  if (!(window as any)._lastLoadedParamsRef) (window as any)._lastLoadedParamsRef = lastLoadedParamsRef;

  useEffect(() => {
    // Ler parâmetros da URL
    const params = new URLSearchParams(location.search);
    const urlParentId = params.get('parentId');
    const urlFilterType = params.get('filterType');

    // Sincronizar estados com a URL apenas se houver mudança REAL (evita renders infinitos)
    const searchKey = `${urlParentId || 'root'}-${urlFilterType || 'none'}-${filterMode}`;
    if (lastLoadedParamsRef.current === searchKey) return;
    lastLoadedParamsRef.current = searchKey;

    if (urlParentId !== currentParentId || urlFilterType !== typeFilter) {
      setCurrentParentId(urlParentId);
      setTypeFilter(urlFilterType);

      // Sincronizar breadcrumbs
      setBreadcrumbs(prev => {
        if (urlParentId === null) {
          if (urlFilterType) {
            const typeLabel = urlFilterType === 'motorista' ? 'Motoristas' :
              urlFilterType === 'monitora' ? 'Monitoras' :
                urlFilterType === 'aluno' ? 'Alunos' :
                  urlFilterType === 'indicado' ? 'Indicados' : 'Filtrado';
            return [{ id: null, nome: "Geral" }, { id: 'filter', nome: typeLabel }];
          }
          return [{ id: null, nome: "Geral" }];
        }

        // Se estamos navegando em pastas
        const parentIndex = prev.findIndex(b => b.id === urlParentId);
        let newPath = [];

        if (parentIndex !== -1) {
          // Já está no caminho, volta até ali
          newPath = prev.slice(0, parentIndex + 1);
        } else {
          // Novo nível (remove filtro anterior se houver)
          const base = prev.filter(b => b.id !== 'filter');
          const targetUser = usuarios.find(u => u.id === urlParentId);
          newPath = [...base, { id: urlParentId, nome: targetUser?.nome || 'Equipe' }];
        }

        // Adiciona label de filtro se houver
        if (urlFilterType) {
          const typeLabel = urlFilterType === 'motorista' ? 'Motoristas' :
            urlFilterType === 'monitora' ? 'Monitoras' :
              urlFilterType === 'aluno' ? 'Alunos' :
                urlFilterType === 'indicado' ? 'Indicados' : 'Filtrado';
          return [...newPath.filter(b => b.id !== 'filter'), { id: 'filter', nome: typeLabel }];
        }

        return newPath.filter(b => b.id !== 'filter');
      });
    }

    // Carregar apenas uma vez por mudança de parâmetro de busca ou modo
    loadUsuarios(urlParentId, urlFilterType);

    // Carregar planos apenas uma vez na montagem
  }, [location.search, filterMode]);

  // Efeito isolado para planos
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const { data } = await supabase.from('subscription_plans').select('id, name');
    if (data) setPlans(data);
  };

  const loadUsuarios = async (parentIdArg?: string | null, filterTypeArg?: string | null) => {
    try {
      setLoading(true);
      setError(null);

      // Usar argumentos ou estado atual
      const pId = (parentIdArg !== undefined && parentIdArg !== null && typeof parentIdArg !== 'object') ? parentIdArg : currentParentId;
      const fType = (filterTypeArg !== undefined && filterTypeArg !== null && typeof filterTypeArg !== 'object') ? filterTypeArg : typeFilter;

      // 1. Carregar Usos da Equipe e Usuários em paralelo
      // SINCRONIZADO: Usando a mesma RPC que Apps Vendidos para consistência total
      // Passando p_parent_id quando há navegação em sub-equipe
      let usageResult: any;
      let allUsersData: any[] = [];

      try {
        // 1. Buscar uso de equipes
        usageResult = await (supabase as any).rpc('get_admin_user_team_usage');

        // 2. SOLUÇÃO COM TENTATIVA DUPLA
        let usersFromDB: any[] = [];

        // Tentativa 1: Usar a RPC que vamos criar no banco
        try {
          const { data: rpcData, error: rpcError } = await (supabase as any)
            .rpc('get_rotafacil_all_users');

          if (!rpcError && rpcData) {
            usersFromDB = rpcData;
            console.log('✅ Usuários via RPC get_rotafacil_all_users:', usersFromDB.length);
          } else {
            throw new Error('RPC ainda não criada no banco');
          }
        } catch (rpcErr) {
          console.warn('⚠️ RPC não disponível. Usando admin.listUsers()...', rpcErr);

          // Tentativa 2: Usar admin.listUsers() (nativo do Supabase)
          // Aumentando limite para garantir que traga todos (padrão é 50)
          const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000
          });

          if (authError) {
            throw new Error(`Erro ao listar usuários: ${authError.message}`);
          }

          // Transformar formato admin.listUsers para o esperado
          usersFromDB = (authData?.users || []).map((u: any) => ({
            id: u.id,
            email: u.email,
            user_metadata: u.user_metadata || {},
            created_at: u.created_at,
            updated_at: u.updated_at,
            ultimo_login: u.last_sign_in_at
          }));

          console.log('✅ Usuários via admin.listUsers():', usersFromDB.length);
        }

        allUsersData = usersFromDB;

      } catch (e: any) {
        console.error('❌ Erro crítico ao carregar dados:', e);
        setError(e.message || 'Erro ao carregar usuários');
        setLoading(false);
        return;
      }

      // Garantir que usageMap seja um dicionário chaveado por ID para busca rápida
      const rawData = usageResult?.data || {};
      const usageMap: Record<string, any> = Array.isArray(rawData)
        ? Object.fromEntries(rawData.map((item: any) => [item.id || item.user_id || item.owner_id, item]))
        : rawData;

      // 1. Calcular estatísticas globais (Mundiais) do sistema para o Admin (Boss)
      const globalStats = {
        motoristas: allUsersData.filter((u: any) => {
          const t = (u.tipo_usuario || u.user_metadata?.tipo_usuario || '').toLowerCase();
          return t === 'motorista';
        }).length,
        monitoras: allUsersData.filter((u: any) => {
          const t = (u.tipo_usuario || u.user_metadata?.tipo_usuario || '').toLowerCase();
          return t === 'monitora' || t === 'monitor';
        }).length,
        alunos: allUsersData.filter((u: any) => {
          const t = (u.tipo_usuario || u.user_metadata?.tipo_usuario || '').toLowerCase();
          return ['aluno', 'pai', 'mae', 'mãe', 'responsavel', 'responsável'].includes(t);
        }).length,
        indicados: allUsersData.filter((u: any) => {
          const t = (u.tipo_usuario || u.user_metadata?.tipo_usuario || '').toLowerCase();
          return t === 'indicado' || t === 'indicados' || t === 'owner' || t === 'master';
        }).length
      };

      setTeamUsage(usageMap);

      // Processar os usuários carregados
      const allFetchedUsers = allUsersData.map((u: any) => {
        const meta = u.user_metadata || {};

        // Mapeamento consistente de nomes e telefones
        const nome = u.nome || meta.nome || meta.name || meta.full_name || meta.nome_completo || meta.displayName || 'Sem Nome';
        const telefone = u.telefone || meta.telefone || meta.phone || meta.whatsapp || '';

        // Mapeamento consistente de tipos
        let tipo = (u.tipo_usuario || u.tipo || meta.tipo_usuario || meta.user_type || 'usuario').toLowerCase();
        if (['owner', 'master', 'admin'].includes(tipo)) {
          tipo = (u.tipo_usuario || meta.tipo_usuario || tipo).toLowerCase();
        }

        // Cálculo de uso com fallback para Admin (Total do Sistema)
        const isOfficial = ADMIN_EMAILS.map(e => e.toLowerCase()).includes(u.email?.toLowerCase()) ||
          (nome || '').toLowerCase().includes('prólipsi');

        const usageRaw = usageMap[u.id] || { motoristas: 0, monitoras: 0, alunos: 0, indicados: 0, plan_id: null };

        // Se é admin e está zerado, mostra o total (Pedido do Roberto)
        const usage = (isOfficial && usageRaw.motoristas === 0)
          ? { ...usageRaw, ...globalStats }
          : usageRaw;

        // Detecção robusta de plan_id
        const planId = u.plan_id || meta.plan_id || usage.plan_id || null;

        return {
          id: u.id,
          email: u.email,
          nome,
          telefone,
          status: u.status || meta.status || 'ativo',
          tipo_usuario: tipo,
          van_id: u.van_id || meta.van_id || null,
          salario_base: u.salario_base || Number(meta.salario || meta.salario_base) || 0,
          cpf: u.cpf || meta.cpf || meta.documento || meta.document || meta.cpf_cnpj || '',
          sponsor_id: u.sponsor_id || meta.sponsor_id || meta.boss_id || meta.created_by || null,
          boss_id: u.boss_id || meta.boss_id || null,
          plan_id: planId,
          created_at: u.created_at,
          updated_at: u.updated_at,
          ultimo_login: u.ultimo_login || u.last_sign_in_at,
          // Contagens herdadas do usageMap para garantir exibição
          motoristas: usage.motoristas || 0,
          monitoras: usage.monitoras || 0,
          alunos: usage.alunos || 0,
          indicados: usage.indicados || 0,
          user_metadata: meta,
          app: meta.app,
          endereco: u.endereco || meta.endereco || {
            cep: meta.cep || meta.zipcode || meta.postal_code || '',
            rua: meta.rua || meta.address || '',
            numero: meta.numero || meta.number || '',
            bairro: meta.bairro || meta.neighborhood || '',
            cidade: meta.cidade || meta.city || '',
            estado: meta.estado || meta.state || '',
            complemento: meta.complemento || ''
          }
        };
      });

      // RPC não retorna debug info, removendo referência obsoleta

      // 2. Garantir que o usuário logado apareça
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const isSelfInList = allFetchedUsers.some((u: any) => u.id === currentUser.id);
        if (!isSelfInList) {
          const selfMeta = currentUser.user_metadata || {};
          // DO NOT default to master if we don't know the role
          const finalRole = selfMeta.tipo_usuario || selfMeta.user_type || 'usuario';
          // Se o próprio admin está zerado no usageMap, usamos o total do sistema
          const isOfficial = ADMIN_EMAILS.map(e => e.toLowerCase()).includes(currentUser.email?.toLowerCase()) ||
            (selfMeta.name || '').toLowerCase().includes('prólipsi');

          const selfUsageRaw = usageMap[currentUser.id] || { motoristas: 0, monitoras: 0, alunos: 0, indicados: 0 };

          // Se sou admin e estou zerado, mostro o total do sistema (Pedido do Roberto)
          const finalSelfUsage = (isOfficial && (selfUsageRaw.motoristas === 0))
            ? globalStats
            : selfUsageRaw;

          allFetchedUsers.unshift({
            id: currentUser.id,
            email: currentUser.email,
            nome: selfMeta.name || selfMeta.nome || selfMeta.full_name || 'Admin Principal',
            tipo_usuario: finalRole,
            user_metadata: selfMeta,
            created_at: currentUser.created_at,
            sponsor_id: null,
            boss_id: null,
            motoristas: finalSelfUsage.motoristas || 0,
            monitoras: finalSelfUsage.monitoras || 0,
            alunos: finalSelfUsage.alunos || 0,
            indicados: finalSelfUsage.indicados || 0,
            app: selfMeta.app || 'rotafacil'
          });
        }
      }

      // Usar a constante global convertida para lowercase para comparação
      const adminEmails = ADMIN_EMAILS;

      // 3. ABA PRINCIPAL: "ROTA FÁCIL"
      // Critério: Quem comprou o kit, tem plano pago, OU já está operando (tem motoristas/alunos cadastrados).
      const activeCompanies = allFetchedUsers.filter((u: any) => {
        const uEmail = u.email?.toLowerCase();
        const isAdmin = adminEmails.map(e => e.toLowerCase()).includes(uEmail) || u.tipo_usuario === 'admin';
        const isOfficial = isAdmin || (u.nome && (
          u.nome.toLowerCase().includes('rota fácil') ||
          u.nome.toLowerCase().includes('rota facil') ||
          u.nome.toLowerCase().includes('prólipsi')
        ));

        // EXCLUSÃO EXPLÍCITA DE PERFIS OPERACIONAIS
        const isOperationalProfile = ['motorista', 'monitor', 'monitora', 'pai', 'mae', 'mãe', 'responsavel', 'responsável', 'aluno'].includes(u.tipo_usuario?.toLowerCase());
        if (isOperationalProfile) return false;

        // Se não tem sponsor_id, é uma conta raiz (empresa). 
        // Se TEM sponsor_id mas é NOVO (2026+), tratamos como Lead visível na raiz (Pedido do Roberto).
        const isNewRegistration = u.created_at && new Date(u.created_at) >= new Date('2026-01-01');
        const isEnterprise = u.tipo_usuario === 'master' || u.tipo_usuario === 'owner' || isAdmin ||
          (!u.sponsor_id && !isOperationalProfile) || (isNewRegistration && !isOperationalProfile);

        // Se metadata.app existe e é rotafacil, ou se o flag rotafacil é true, ou se é novo
        const appMeta = u.user_metadata?.app || u.app;
        const isFromRoute = appMeta === 'rotafacil' || u.user_metadata?.rotafacil === true || isNewRegistration;

        // REGRA SIMPLIFICADA (Pedido do Roberto):
        // Se é Admin oficial, Rota Fácil, ou novo cadastro, FICA NA ABA PRINCIPAL.
        return (isEnterprise && isFromRoute) || isOfficial;
      });

      // 4. ABA SECUNDÁRIA: "AGUARDANDO KIT" (LEGADO / INATIVOS)
      // Critério: Cadastros gratuitos sem uso, e importações legadas (RS Prólipsi) que não converteram.
      const pendingCompanies = allFetchedUsers.filter((u: any) => {
        const uEmail = u.email?.toLowerCase();
        const isAdmin = adminEmails.map(e => e.toLowerCase()).includes(uEmail) || u.tipo_usuario === 'admin';

        // EXCLUSÃO EXPLÍCITA DE PERFIS OPERACIONAIS
        const isOperationalProfile = ['motorista', 'monitor', 'monitora', 'pai', 'mae', 'mãe', 'responsavel', 'responsável', 'aluno'].includes(u.tipo_usuario?.toLowerCase());
        if (isOperationalProfile) return false;

        // Se não tem sponsor_id, é uma conta raiz
        const isNewRegistration = u.created_at && new Date(u.created_at) >= new Date('2026-01-01');
        const isEnterprise = u.tipo_usuario === 'master' || u.tipo_usuario === 'owner' ||
          (!u.sponsor_id && !isOperationalProfile) || (isNewRegistration && !isOperationalProfile);

        // Se já está na aba principal, não aparece aqui
        const isActive = activeCompanies.some(a => a.id === u.id);

        // Aba Aguardando Kit agora contém APENAS o legado (RS Prólipsi)
        // Usuários que NÃO têm o metadata 'rotafacil' explícito E não são novos
        const appMeta = u.user_metadata?.app || u.app;
        const isFromRoute = appMeta === 'rotafacil' || u.user_metadata?.rotafacil === true || isNewRegistration;

        return isEnterprise && !isAdmin && !isFromRoute && !isActive;
      });

      // ORDENAÇÃO: Mais recentes primeiro para ambas as abas
      const sortByRecent = (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      pendingCompanies.sort(sortByRecent);
      activeCompanies.sort(sortByRecent);

      // 5. Definir exibição final (Bota ordem na casa - Pedido do Roberto)
      let finalDisplayUsers = allFetchedUsers;

      if (pId) {
        // NAVEGAÇÃO EM EQUIPE (Explorar Equipe)
        // Buscamos quem tem esse cara como sponsor ou boss
        const teamMembers = allFetchedUsers.filter((u: any) =>
          (u.sponsor_id === pId || u.boss_id === pId) && u.id !== pId
        );

        if (fType) {
          // FILTRO ESTREITO: Se clicou em "Motoristas", mostra APENAS motoristas.
          finalDisplayUsers = teamMembers.filter((u: any) => {
            const uTipo = (u.tipo_usuario || u.tipo || '').toLowerCase();
            if (fType === 'aluno') return ['aluno', 'pai', 'mae', 'mãe', 'responsavel', 'responsável'].includes(uTipo);
            if (fType === 'indicado') return uTipo === 'indicado' || uTipo === 'indicados' || uTipo === 'owner' || uTipo === 'master';
            if (fType === 'motorista') return uTipo === 'motorista';
            if (fType === 'monitora') return uTipo === 'monitora' || uTipo === 'monitor';
            return uTipo === fType.toLowerCase();
          });
        } else {
          // ABA "TODOS" DENTRO DA EQUIPE: Ordenar para que os operacionais apareçam primeiro
          finalDisplayUsers = [...teamMembers].sort((a: any, b: any) => {
            const getOrder = (t: string) => {
              const lowT = (t || '').toLowerCase();
              if (lowT === 'motorista') return 1;
              if (lowT === 'monitora' || lowT === 'monitor') return 2;
              if (['aluno', 'pai', 'mae', 'mãe', 'responsavel', 'responsável'].includes(lowT)) return 3;
              return 4; // Sub-empresas, leads, etc por último
            };
            return getOrder(a.tipo_usuario) - getOrder(b.tipo_usuario);
          });
        }
      } else {
        finalDisplayUsers = allFetchedUsers.filter((u: any) => {
          const uEmail = u.email?.toLowerCase();
          const isAdmin = adminEmails.map(e => e.toLowerCase()).includes(uEmail) || u.tipo_usuario === 'admin';
          const isOperationalProfile = ['motorista', 'monitor', 'monitora', 'pai', 'mae', 'mãe', 'responsavel', 'responsável', 'aluno'].includes(u.tipo_usuario?.toLowerCase());

          const isNewRegistration = u.created_at && new Date(u.created_at) >= new Date('2026-01-01');
          const isEnterprise = u.tipo_usuario === 'master' || u.tipo_usuario === 'owner' || isAdmin ||
            (!u.sponsor_id && !isOperationalProfile) || (isNewRegistration && !isOperationalProfile);

          const appMeta = u.user_metadata?.app || u.app;
          const isFromRoute = appMeta === 'rotafacil' || u.user_metadata?.rotafacil === true || isNewRegistration;

          return isEnterprise && isFromRoute;
        });

        if (filterMode === 'rotafacil') {
          finalDisplayUsers = activeCompanies;
        } else if (filterMode === 'all') {
          finalDisplayUsers = pendingCompanies;
        }
      }

      setUserCounts({
        total: pendingCompanies.length,
        rotafacil: activeCompanies.length,
        motoristas: allFetchedUsers.reduce((acc, u) => acc + (u.motoristas || 0), 0),
        alunos: allFetchedUsers.reduce((acc, u) => acc + (u.alunos || 0), 0)
      });

      const cpfMap = new Map();
      const emailMap = new Map();
      const dups: any[] = [];
      allFetchedUsers.forEach((u: any) => {
        const cpf = u.cpf || u.user_metadata?.cpf;
        const emailLower = u.email?.toLowerCase();
        if (cpf && cpfMap.has(cpf)) dups.push(u);
        else if (cpf) cpfMap.set(cpf, u);
        if (emailLower && emailMap.has(emailLower)) dups.push(u);
        else if (emailLower) emailMap.set(emailLower, u);
      });
      setDuplicates(dups);
      setUsuarios(finalDisplayUsers);
      setLoading(false);

      if (pId) {
        const teamMembers = allFetchedUsers.filter((u: any) =>
          (u.sponsor_id === pId || u.boss_id === pId) && u.id !== pId
        );
        setAllTeamUsers(teamMembers);

        const currentUserData = allFetchedUsers.find((u: any) => u.id === pId);
        if (currentUserData) {
          setBreadcrumbs(prev =>
            prev.map(b => b.id === pId ? { ...b, nome: currentUserData.nome } : b)
          );
        }
      }
    } catch (err: any) {
      console.error('Erro fatal loadUsuarios:', err);
      setError(err.message || 'Erro ao carregar lista de usuários');
      toast({
        title: 'Erro de Carregamento',
        description: err.message || 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmationForUser = async (email: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-users-v3', {
        method: 'POST',
        body: {
          email,
          action: 'resend-confirmation'
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "E-mail de confirmação reenviado para o colaborador.",
      });
    } catch (error: any) {
      console.error('Erro ao reenviar confirmação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao reenviar confirmação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      // Chama a edge function para atualizar todos os dados (incluindo e-mail e CPF)
      const { data, error: fnError } = await supabase.functions.invoke('admin-users-v3', {
        method: 'PUT',
        body: {
          userId: editingUser.id,
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf,
          tipo_usuario: formData.tipo_usuario,
          status: formData.status,
          salario: formData.salario_base,
          plan_id: formData.plan_id || null,
          van_id: formData.van_id || null,
          pix_key: formData.pix_key || null,
          pix_type: formData.pix_type || null,
          app: 'rotafacil',
          endereco: {
            cep: formData.cep,
            rua: formData.rua,
            numero: formData.numero,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado,
            complemento: formData.complemento
          }
        }
      });

      if (fnError) throw fnError;

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });

      setEditingUser(null);
      loadUsuarios(); // Reload to get updated stats and metadata
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (userId: string) => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      // Here you would implement the password change via Supabase Admin API
      // For example:
      const { data, error } = await supabase.functions.invoke('admin-users-v3', {
        method: 'PUT',
        body: {
          userId: userId,
          password: passwordData.newPassword,
        },
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });

      setShowPasswordForm(null);
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || "",
      status: usuario.status,
      tipo_usuario: usuario.tipo_usuario,
      plan_id: usuario.plan_id || "",
      van_id: usuario.van_id || "",
      senha: "",
      salario_base: usuario.salario_base || 0,
      pix_key: usuario.pix_key || "",
      pix_type: usuario.pix_type || "",
      cpf: usuario.cpf || "",
      cep: usuario.endereco?.cep || usuario.user_metadata?.cep || usuario.user_metadata?.zipcode || "",
      rua: usuario.endereco?.rua || usuario.user_metadata?.rua || usuario.user_metadata?.address || "",
      numero: usuario.endereco?.numero || usuario.user_metadata?.numero || usuario.user_metadata?.number || "",
      bairro: usuario.endereco?.bairro || usuario.user_metadata?.bairro || usuario.user_metadata?.neighborhood || "",
      cidade: usuario.endereco?.cidade || usuario.user_metadata?.cidade || usuario.user_metadata?.city || "",
      estado: usuario.endereco?.estado || usuario.user_metadata?.estado || usuario.user_metadata?.state || "",
      complemento: usuario.endereco?.complemento || usuario.user_metadata?.complemento || ""
    });
  };

  const handleRegisterPayment = async (userId: string) => {
    // Implementação simplificada de registro de pagamento via RPC
    const valor = prompt("Valor do pagamento:");
    if (!valor) return;

    const data = prompt("Data do pagamento (AAAA-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!data) return;

    try {
      setSaving(true);
      const { error } = await (supabase as any)
        .from('pagamentos_equipe')
        .insert({
          user_id: userId,
          valor: parseFloat(valor),
          mes: new Date(data).getMonth() + 1,
          ano: new Date(data).getFullYear(),
          data_pagamento: data,
          status: 'pago'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      status: "ativo",
      tipo_usuario: "usuario",
      plan_id: "",
      van_id: "",
      senha: "",
      salario_base: 0,
      pix_key: "",
      pix_type: "",
      cpf: "",
      cep: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      complemento: ""
    });
    setEditingUser(null);
    setShowPasswordForm(null);
  };

  const resetNewUserForm = () => {
    setNewUserData({
      nome: "",
      email: "",
      password: "",
      confirmPassword: "",
      telefone: "",
      status: "ativo",
      tipo_usuario: "usuario",
      cpf: "",
      cep: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      complemento: "",
      salario_base: 0,
      pix_key: "",
      pix_type: "",
      van_id: "",
      plan_id: ""
    });
    setShowNewUserForm(false);
  };
  const handleNavigateToUser = (usuario: Usuario) => {
    // Only drill down if it's not a driver/monitor (which don't usually have sub-teams in this context)
    // or if they have usage > 0
    const usage = teamUsage[usuario.id];
    const hasTeam = (usage?.motoristas || 0) > 0 || (usage?.monitoras || 0) > 0 || (usage?.alunos || 0) > 0 || (usage?.indicados || 0) > 0;

    if (hasTeam || usuario.tipo_usuario === 'admin' || usuario.tipo_usuario === 'master' || usuario.tipo_usuario === 'owner') {
      navigate(`/admin/usuarios?parentId=${usuario.id}`);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    const item = breadcrumbs[index];
    if (item.id === 'filter') return; // Clicar no label do filtro não faz nada

    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);

    // Atualizar URL (isso disparará o useEffect)
    if (item.id) {
      navigate(`/admin/usuarios?parentId=${item.id}`, { replace: true });
    } else {
      navigate('/admin/usuarios', { replace: true });
    }
  };

  async function handleCleanupDuplicates() {
    if (!confirm("Isso irá remover registros duplicados de 'Maxwell' e 'Enclaro', mantendo apenas uma versão de cada (por CPF ou Email). Deseja continuar?")) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-users-v3', {
        method: 'POST',
        body: { action: 'cleanup-specific-duplicates' }
      });
      if (error) throw error;
      toast({
        title: "Limpeza concluída",
        description: `${data.deleted?.length || 0} duplicados removidos.`,
      });
      loadUsuarios();
    } catch (err: any) {
      toast({
        title: "Erro na limpeza",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleCreateUser = async () => {
    setSaving(true);
    try {
      const validation = newUserSchema.parse(newUserData);

      const { data, error } = await supabase.functions.invoke('admin-users-v3', {
        method: 'POST',
        body: {
          nome: validation.nome,
          email: validation.email,
          password: validation.password,
          telefone: newUserData.telefone,
          cpf: newUserData.cpf,
          tipo_usuario: newUserData.tipo_usuario,
          van_id: newUserData.van_id || null,
          salario: newUserData.salario_base || 0,
          app: 'rotafacil',
          endereco: {
            cep: newUserData.cep,
            rua: newUserData.rua,
            numero: newUserData.numero,
            bairro: newUserData.bairro,
            cidade: newUserData.cidade,
            estado: newUserData.estado,
            complemento: newUserData.complemento
          }
        },
      });
      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Usuário criado com sucesso!' });
      resetNewUserForm();
      await loadUsuarios();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      if (error instanceof z.ZodError) {
        toast({ title: 'Erro de validação', description: error.errors[0].message, variant: 'destructive' });
      } else {
        toast({ title: 'Erro', description: error?.message || 'Não foi possível criar o usuário.', variant: 'destructive' });
      }
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "bg-gold/10 text-gold border-gold/20";
      case "inativo": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pendente": return "bg-black-primary/50 text-muted-foreground border-sidebar-border";
      default: return "bg-black-primary/50 text-muted-foreground border-sidebar-border";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "admin": return "bg-gold text-black-primary font-bold";
      case "consultor": return "bg-gold/20 text-gold border-gold/30";
      case "owner": return "bg-primary text-black font-bold";
      case "motorista": return "bg-black-secondary text-gold border-gold/40";
      case "monitora": return "bg-black-secondary text-gold border-gold/40";
      case "usuario": return "bg-black-primary text-muted-foreground border-sidebar-border opacity-60";
      default: return "bg-black-primary text-muted-foreground border-sidebar-border opacity-60";
    }
  };

  const filteredUsuarios = (usuarios || []).filter(u => {
    // Filtro por busca (o filtro por tipo já é feito pela API)
    const matchesSearch = (u.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (breadcrumbs.length > 1) {
                navigateToBreadcrumb(breadcrumbs.length - 2);
              } else {
                navigate(-1);
              }
            }}
            className="w-10 h-10 rounded-full bg-gold hover:bg-gold/80 text-black shadow-lg shadow-gold/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-gold uppercase tracking-tighter">Gerenciar Usuários</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Controle de Rede e Colaboradores</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-card border-border/50 focus:border-primary transition-all text-lg"
            />
          </div>
          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/50">
            <Button
              variant={filterMode === 'rotafacil' ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterMode('rotafacil')}
              className="h-10 px-4 rounded-lg font-bold text-xs uppercase flex items-center gap-2"
            >
              Rota Fácil
              {userCounts.rotafacil > 0 && (
                <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">{userCounts.rotafacil}</span>
              )}
            </Button>
            <Button
              variant={filterMode === 'all' ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterMode('all')}
              className="h-10 px-4 rounded-lg font-bold text-xs uppercase flex items-center gap-2"
            >
              Aguardando Kit
              {userCounts.total > 0 && (
                <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[10px] min-w-[1.2rem] text-center">
                  {userCounts.total}
                </span>
              )}
            </Button>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => loadUsuarios()}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Recarregar
            </Button>
            <Button
              onClick={() => setShowNewUserForm(true)}
              className="h-12 px-6 text-base font-semibold"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Cadastrar Novo Usuário
            </Button>
          </div>
        </div>

        {duplicates.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <p className="font-bold text-lg">Duplicatas Detectadas (Maxwell / Enclaro)</p>
                <p className="text-xs opacity-80">
                  {duplicates.length} registro(s) repetidos encontrados. Recomendamos a limpeza para evitar erros de login.
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 md:flex-none border-amber-500/50 text-amber-500 hover:bg-amber-500/20"
                onClick={() => {
                  toast({
                    title: "Dica de Limpeza",
                    description: "As duplicatas foram listadas no console (F12) para sua conferência.",
                  });
                  console.table(duplicates);
                }}
              >
                Ver Detalhes
              </Button>
              <Button
                size="sm"
                className="flex-1 md:flex-none bg-amber-500 text-black hover:bg-amber-600 font-bold"
                onClick={handleCleanupDuplicates}
              >
                Limpar Duplicatas
              </Button>
            </div>
          </div>
        )}

        {/* Breadcrumbs e Filtros de Equipe */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((bc, index) => (
              <div key={bc.id || 'root'} className="flex items-center gap-2">
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className={`hover:text-primary transition-colors flex items-center gap-1 ${index === breadcrumbs.length - 1 ? "text-primary font-bold pointer-events-none" : ""}`}
                >
                  {index === 0 && <Home className="w-4 h-4" />}
                  {bc.nome}
                </button>
                {index < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4" />}
              </div>
            ))}
            {typeFilter && (
              <>
                <ChevronRight className="w-4 h-4" />
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 capitalize font-bold">
                  {typeFilter === 'motorista' ? 'Motoristas' :
                    typeFilter === 'monitora' ? 'Monitoras' :
                      typeFilter === 'aluno' ? 'Alunos' :
                        typeFilter === 'indicado' ? 'Indicados' : typeFilter}
                </Badge>
              </>
            )}
          </nav>

          {/* Navegação Secundária (Filtros de Tipo) - Ocultar se já estiver filtrado para evitar ruído (Pedido Roberto) */}
          {currentParentId && !typeFilter && (
            <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/40 overflow-x-auto no-scrollbar">
              {[
                { id: null, label: 'Todos', icon: Folder, count: allTeamUsers.length },
                { id: 'motorista', label: 'Motoristas', icon: Bus, count: allTeamUsers.filter(u => u.tipo_usuario === 'motorista').length },
                { id: 'monitora', label: 'Monitoras', icon: UserCircle2, count: allTeamUsers.filter(u => (u.tipo_usuario === 'monitora' || u.tipo_usuario === 'monitor')).length },
                { id: 'aluno', label: 'Alunos', icon: Users, count: allTeamUsers.filter(u => ['aluno', 'pai', 'mae', 'mãe', 'responsavel', 'responsável'].includes(u.tipo_usuario?.toLowerCase())).length },
                {
                  id: 'indicado', label: 'Indicados', icon: Target, count: allTeamUsers.filter(u => {
                    const t = u.tipo_usuario?.toLowerCase();
                    return t === 'indicado' || t === 'indicados' || t === 'owner' || t === 'master';
                  }).length
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = (!tab.id && !typeFilter) || (typeFilter === tab.id);

                return (
                  <Button
                    key={tab.label}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(location.search);
                      if (tab.id) params.set('filterType', tab.id);
                      else params.delete('filterType');
                      navigate(`/admin/usuarios?${params.toString()}`);
                    }}
                    className={`h-9 px-3 gap-2 rounded-md transition-all whitespace-nowrap ${isActive ? "shadow-md scale-105" : "hover:bg-primary/5 hover:text-primary"}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "" : "text-muted-foreground"}`} />
                    <span className="font-bold uppercase tracking-widest text-[10px]">{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${isActive ? "bg-white text-primary" : "bg-muted text-muted-foreground"}`}>
                      {tab.count}
                    </span>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Botão de Retorno quando filtrado (Simplificação Roberto) */}
          {currentParentId && typeFilter && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(location.search);
                  params.delete('filterType');
                  navigate(`/admin/usuarios?${params.toString()}`);
                }}
                className="h-9 px-4 gap-2 border-primary/20 hover:bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest"
              >
                <ArrowLeft className="w-4 h-4" />
                Ver Todos os Membros da Equipe
              </Button>
            </div>
          )}
        </div>

        {/* Formulário de Novo Usuário */}
        {showNewUserForm && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Cadastrar Novo Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="new-nome" className="text-base font-semibold text-foreground">
                    Nome Completo *
                  </Label>
                  <Input
                    id="new-nome"
                    value={newUserData.nome}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Digite o nome completo"
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-email" className="text-base font-semibold text-foreground">
                    Email *
                  </Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-base font-semibold text-foreground">
                    Senha *
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite a senha"
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                  <p className="text-sm text-muted-foreground">Mínimo 6 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-confirm-password" className="text-base font-semibold text-foreground">
                    Confirmar Senha *
                  </Label>
                  <Input
                    id="new-confirm-password"
                    type="password"
                    value={newUserData.confirmPassword}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a senha"
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="new-telefone" className="text-base font-semibold text-foreground">
                    Telefone
                  </Label>
                  <Input
                    id="new-telefone"
                    value={newUserData.telefone}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-status" className="text-base font-semibold text-foreground">
                    Status do Usuário
                  </Label>
                  <Select value={newUserData.status} onValueChange={(value) => setNewUserData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="h-12 text-base bg-background border-2 border-border focus:border-primary">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="ativo" className="text-base">✅ Ativo</SelectItem>
                      <SelectItem value="inativo" className="text-base">❌ Inativo</SelectItem>
                      <SelectItem value="pendente" className="text-base">⏳ Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="new-cpf" className="text-base font-semibold text-foreground">
                      CPF
                    </Label>
                    <Input
                      id="new-cpf"
                      value={newUserData.cpf}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, cpf: e.target.value }))}
                      placeholder="000.000.000-00"
                      className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-cep" className="text-base font-semibold text-foreground">
                      CEP
                    </Label>
                    <Input
                      id="new-cep"
                      value={newUserData.cep}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, cep: e.target.value }))}
                      placeholder="00000-000"
                      className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="new-rua" className="text-base font-semibold text-foreground">
                      Rua
                    </Label>
                    <Input
                      id="new-rua"
                      value={newUserData.rua}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, rua: e.target.value }))}
                      className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-numero" className="text-base font-semibold text-foreground">
                      Número
                    </Label>
                    <Input
                      id="new-numero"
                      value={newUserData.numero}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, numero: e.target.value }))}
                      className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="new-bairro" className="text-base font-semibold text-foreground">
                    Bairro
                  </Label>
                  <Input
                    id="new-bairro"
                    value={newUserData.bairro}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, bairro: e.target.value }))}
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-cidade" className="text-base font-semibold text-foreground">
                    Cidade
                  </Label>
                  <Input
                    id="new-cidade"
                    value={newUserData.cidade}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, cidade: e.target.value }))}
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-estado" className="text-base font-semibold text-foreground">
                    Estado (UF)
                  </Label>
                  <Input
                    id="new-estado"
                    value={newUserData.estado}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, estado: e.target.value.toUpperCase() }))}
                    maxLength={2}
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Label htmlFor="new-tipo_usuario" className="text-base font-semibold text-foreground">
                  Tipo de Usuário
                </Label>
                <Select value={newUserData.tipo_usuario} onValueChange={(value) => setNewUserData(prev => ({ ...prev, tipo_usuario: value }))}>
                  <SelectTrigger className="h-12 text-base bg-background border-2 border-border focus:border-primary">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="usuario" className="text-base">👤 Colaborador / Outros</SelectItem>
                    <SelectItem value="consultor" className="text-base">💼 Consultor de Vendas</SelectItem>
                    <SelectItem value="motorista" className="text-base">🚐 Motorista (Van)</SelectItem>
                    <SelectItem value="monitora" className="text-base">👩‍🏫 Monitora (Escolar)</SelectItem>
                    <SelectItem value="admin" className="text-base">🛡️ Administrador do Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={handleCreateUser}
                  disabled={saving}
                  className="h-12 px-6 text-base font-semibold"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {saving ? "Criando..." : "Criar Usuário"}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetNewUserForm}
                  className="h-12 px-6 text-base font-semibold border-2"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Edição */}
        {editingUser && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Editando Usuário: <span className="font-bold">{editingUser.nome}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-base font-semibold text-foreground">
                    Nome Completo *
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Digite o nome completo"
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cep" className="text-base font-semibold text-foreground">
                    CEP
                  </Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                    placeholder="00000-000"
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rua" className="text-base font-semibold text-foreground">
                    Rua
                  </Label>
                  <Input
                    id="rua"
                    value={formData.rua}
                    onChange={(e) => setFormData(prev => ({ ...prev, rua: e.target.value }))}
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="numero" className="text-base font-semibold text-foreground">
                    Número
                  </Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro" className="text-base font-semibold text-foreground">
                    Bairro
                  </Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-base font-semibold text-foreground">
                    Cidade
                  </Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-base font-semibold text-foreground">
                    Estado (UF)
                  </Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value.toUpperCase() }))}
                    maxLength={2}
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complemento" className="text-base font-semibold text-foreground">
                  Complemento
                </Label>
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                  className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold text-foreground">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-base font-semibold text-foreground">
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-base font-semibold text-foreground">
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_usuario" className="text-base font-semibold text-foreground">
                      Tipo de Usuário
                    </Label>
                    <Select value={formData.tipo_usuario} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_usuario: value }))}>
                      <SelectTrigger className="h-12 text-base bg-background border-2 border-border focus:border-primary">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-50">
                        <SelectItem value="usuario" className="text-base">👤 Colaborador / Outros</SelectItem>
                        <SelectItem value="consultor" className="text-base">💼 Consultor de Vendas</SelectItem>
                        <SelectItem value="motorista" className="text-base">🚐 Motorista (Van)</SelectItem>
                        <SelectItem value="monitora" className="text-base">👩‍🏫 Monitora (Escolar)</SelectItem>
                        <SelectItem value="admin" className="text-base">🛡️ Administrador do Sistema</SelectItem>
                        <SelectItem value="master" className="text-base">👑 RS Oficial (Dono)</SelectItem>
                        <SelectItem value="owner" className="text-base">🏢 Empresa / Proprietário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-foreground">Kit / Plano do Sistema</Label>
                      <Select
                        value={formData.plan_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, plan_id: value }))}
                      >
                        <SelectTrigger className="h-12 text-base bg-background border-2 border-border focus:border-primary">
                          <SelectValue placeholder="Selecione o Plano (Kit)" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border z-50">
                          {plans.map(p => (
                            <SelectItem key={p.id} value={p.id} className="text-base">{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Alterar o Kit atualizará imediatamente o limite de alunos e frotas do usuário.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-foreground">Status do Usuário</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="h-12 text-base bg-background border-2 border-border focus:border-primary">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border z-50">
                          <SelectItem value="ativo" className="text-base">✅ Ativo</SelectItem>
                          <SelectItem value="inativo" className="text-base">❌ Inativo</SelectItem>
                          <SelectItem value="pendente" className="text-base">⏳ Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(formData.tipo_usuario === 'motorista' || formData.tipo_usuario === 'monitora') && (
                    <div className="md:col-span-3 border-t border-border/50 pt-6 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gold/5 p-6 rounded-xl border border-gold/10">
                      <div className="space-y-4">
                        <h4 className="text-gold font-black uppercase tracking-widest text-xs flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Ajustes Financeiros (Equipe)
                        </h4>
                        <div className="space-y-2">
                          <Label htmlFor="salario_base" className="text-sm font-bold">Salário Base (R$)</Label>
                          <Input
                            id="salario_base"
                            type="number"
                            value={formData.salario_base}
                            onChange={(e) => setFormData(prev => ({ ...prev, salario_base: parseFloat(e.target.value) }))}
                            className="h-11 border-gold/20 focus:border-gold"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col justify-end">
                        <Button
                          onClick={() => handleRegisterPayment(editingUser.id)}
                          className="h-12 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest text-xs"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Registrar Novo Pagamento
                        </Button>
                        <p className="text-[10px] text-muted-foreground mt-2 italic">
                          Isso adicionará uma nova entrada no histórico financeiro do colaborador.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border/50">
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving} className="h-12 px-6 text-base font-semibold bg-primary hover:bg-primary/90 gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button variant="outline" onClick={resetForm} disabled={saving} className="h-12 px-6 text-base font-semibold border-2 gap-2">
                    <X className="w-5 h-5" />
                    Cancelar
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(editingUser.id)}
                  className="h-12 px-6 text-base font-semibold border-primary/20 hover:bg-primary/5 text-primary gap-2"
                >
                  <Key className="w-5 h-5" />
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Alteração de Senha */}
        {
          showPasswordForm && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Alterar Senha do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-base font-semibold text-foreground">
                      Nova Senha *
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Digite a nova senha"
                      className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                    />
                    <p className="text-sm text-muted-foreground">Mínimo 6 caracteres</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-base font-semibold text-foreground">
                      Confirmar Nova Senha *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirme a nova senha"
                      className="h-12 text-base bg-background border-2 border-border focus:border-primary"
                    />
                    <p className="text-sm text-muted-foreground">Deve ser igual à senha acima</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => handleChangePassword(showPasswordForm)}
                    disabled={changingPassword}
                    className="h-12 px-6 text-base font-semibold bg-orange-500 hover:bg-orange-600 gap-2"
                  >
                    {changingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                    {changingPassword ? "Alterando..." : "Confirmar Alteração"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordForm(null);
                      setPasswordData({ newPassword: "", confirmPassword: "" });
                    }}
                    className="h-12 px-6 text-base font-semibold border-2"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        }

        {/* Lista de Usuários */}
        <div className="grid gap-4">
          {filteredUsuarios.map((usuario) => (
            <Card key={usuario.id} className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all group relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-stretch h-full">
                  {/* Avatar & Identificação */}
                  <div className="p-6 flex items-start gap-4 flex-1">
                    <div
                      className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center cursor-pointer hover:rotate-6 transition-all shadow-lg shadow-primary/20 shrink-0"
                      onClick={() => handleNavigateToUser(usuario)}
                    >
                      {(usuario.tipo_usuario === 'admin' || usuario.tipo_usuario === 'master' || usuario.tipo_usuario === 'owner') ? (
                        <Folder className="w-7 h-7 text-white" />
                      ) : (
                        <User className="w-7 h-7 text-white" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex flex-col">
                          <h3 className="font-black text-xl tracking-tight truncate">
                            {typeFilter === 'aluno' && (usuario.tipo_usuario === 'pai' || usuario.tipo_usuario === 'mae' || usuario.tipo_usuario === 'mãe' || usuario.tipo_usuario === 'responsavel')
                              ? (usuario.user_metadata?.student_name || usuario.user_metadata?.nome_aluno || usuario.nome)
                              : usuario.nome}
                          </h3>
                          {typeFilter === 'aluno' && (usuario.tipo_usuario === 'pai' || usuario.tipo_usuario === 'mae' || usuario.tipo_usuario === 'mãe' || usuario.tipo_usuario === 'responsavel') && (
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest -mt-1">
                              Responsável: {usuario.nome}
                            </span>
                          )}
                        </div>
                        {(() => {
                          const isMasterOrOwner = usuario.tipo_usuario === 'master' || usuario.tipo_usuario === 'owner';
                          const hasTeam = (teamUsage[usuario.id]?.motoristas || 0) > 0 ||
                            (teamUsage[usuario.id]?.monitoras || 0) > 0 ||
                            (teamUsage[usuario.id]?.alunos || 0) > 0 ||
                            (teamUsage[usuario.id]?.indicados || 0) > 0;
                          const isOfficialBoss = ADMIN_EMAILS.map(e => e.toLowerCase()).includes(usuario.email?.toLowerCase());
                          const isOfficial = isOfficialBoss || usuario.nome?.toLowerCase().includes('rota fácil') ||
                            usuario.nome?.toLowerCase().includes('rota facil');
                          const hasActivePlan = usuario.plan_id || hasTeam || isOfficial;

                          const isOperational = ['motorista', 'monitora', 'monitor', 'aluno', 'pai', 'mae', 'mãe', 'responsavel', 'responsável'].includes(usuario.tipo_usuario?.toLowerCase());

                          return (
                            <Badge variant="outline" className={`capitalize font-bold px-3 py-1 border-2 transition-all group-hover:scale-105 ${usuario.tipo_usuario === 'admin' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                              isMasterOrOwner
                                ? (hasActivePlan ? "bg-primary/10 text-primary border-primary/30" : "bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse")
                                : (isOperational ? "bg-green-500/10 text-green-500 border-green-500/30" : "bg-muted text-muted-foreground border-muted-foreground/20")
                              }`}>
                              {usuario.tipo_usuario === 'admin' ? 'BOSS ADMIN' :
                                isMasterOrOwner
                                  ? (hasActivePlan ? 'Empresa / Proprietário' : 'Aguardando Kit ⏳')
                                  : (isOperational ? `Colaborador: ${usuario.tipo_usuario}` : (usuario.tipo_usuario || 'Usuário'))}
                            </Badge>
                          );
                        })()}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{usuario.email}</span>
                        </div>
                        {usuario.telefone && (
                          <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{usuario.telefone}</span>
                          </div>
                        )}
                        {usuario.cpf && (
                          <div className="flex items-center gap-1.5 font-mono text-xs bg-muted/50 px-2 py-1 rounded border border-border/40">
                            <ShieldCheck className="w-4 h-4 text-primary/70" />
                            <span className="font-bold tracking-tighter">{usuario.cpf}</span>
                          </div>
                        )}
                        {usuario.app && (
                          <div className="flex items-center gap-1.5 font-bold text-[10px] bg-primary/5 px-2 py-0.5 rounded border border-primary/10 text-primary/70 uppercase">
                            <Target className="w-3 h-3" />
                            {usuario.app === 'multilevel' ? 'Multinível' : 'RS-RotaFácil'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* KPIs da Equipe (O que o Roberto pediu) */}
                  {(usuario.tipo_usuario === 'master' || usuario.tipo_usuario === 'owner' || usuario.tipo_usuario === 'admin') && (
                    <div className="border-t md:border-t-0 md:border-l border-border/40 bg-muted/20 p-6 flex items-center">
                      <div className="flex gap-4 lg:gap-8">
                        <div
                          className="text-center group/kpi cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => navigate(`/admin/usuarios?parentId=${usuario.id}&filterType=motorista`)}
                        >
                          <Bus className="w-5 h-5 mx-auto mb-1 text-primary group-hover/kpi:text-primary-foreground" />
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Motoristas</p>
                          <p className="text-xl font-black">{teamUsage[usuario.id]?.motoristas || 0}</p>
                        </div>
                        <div
                          className="text-center group/kpi cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => navigate(`/admin/usuarios?parentId=${usuario.id}&filterType=monitora`)}
                        >
                          <UserCircle2 className="w-5 h-5 mx-auto mb-1 text-primary group-hover/kpi:text-primary-foreground" />
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Monitoras</p>
                          <p className="text-xl font-black">{teamUsage[usuario.id]?.monitoras || 0}</p>
                        </div>
                        <div
                          className="text-center group/kpi cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => navigate(`/admin/usuarios?parentId=${usuario.id}&filterType=aluno`)}
                        >
                          <Users className="w-5 h-5 mx-auto mb-1 text-primary group-hover/kpi:text-primary-foreground" />
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Alunos</p>
                          <p className="text-xl font-black">{teamUsage[usuario.id]?.alunos || 0}</p>
                        </div>
                        <div
                          className="text-center group/kpi cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => navigate(`/admin/usuarios?parentId=${usuario.id}&filterType=indicado`)}
                        >
                          <Target className="w-5 h-5 mx-auto mb-1 text-primary group-hover/kpi:text-primary-foreground" />
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Indicados</p>
                          <p className="text-xl font-black">{teamUsage[usuario.id]?.indicados || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="p-6 flex items-center gap-2 border-t md:border-t-0 md:border-l border-border/40 shrink-0">
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {(usuario.tipo_usuario === 'master' || usuario.tipo_usuario === 'owner' || usuario.tipo_usuario === 'admin' || (teamUsage[usuario.id]?.motoristas || 0) > 0) && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 w-full"
                          onClick={() => handleNavigateToUser(usuario)}
                        >
                          <Folder className="w-4 h-4 mr-2" />
                          Explorar Equipe
                        </Button>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 hover:bg-primary/10 hover:border-primary/40 font-bold" onClick={() => handleEdit(usuario)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-amber-600 border-amber-200/50 hover:bg-amber-50 font-bold"
                          title="Reenviar Confirmação"
                          onClick={() => handleResendConfirmationForUser(usuario.email)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-4">
                    <span>CADASTRO: {new Date(usuario.created_at).toLocaleDateString('pt-BR')}</span>
                    {usuario.ultimo_login && (
                      <span className="text-primary/70">ONLINE EM: {new Date(usuario.ultimo_login).toLocaleTimeString('pt-BR')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${usuario.status === 'ativo' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span>{usuario.status === 'ativo' ? 'SISTEMA OPERACIONAL' : 'ACESSO RESTRITO'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-destructive mb-2">Erro ao carregar dados</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {error}
              </p>
              <Button onClick={() => loadUsuarios()} variant="default" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {
          usuarios.length === 0 && !loading && !error && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Nenhum usuário nesta pasta</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  {currentParentId
                    ? "Esta equipe ainda não possui colaboradores cadastrados."
                    : "Nenhuma conta Master ou Admin encontrada no nível geral."}
                </p>
                <Button onClick={() => loadUsuarios()} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Recarregar Lista
                </Button>
              </CardContent>
            </Card>
          )
        }
      </div >
    </AdminLayout >
  );
}