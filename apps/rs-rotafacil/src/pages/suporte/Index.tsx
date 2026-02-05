import { useState, useEffect } from 'react';
import { DynamicLayout } from '@/components/layout/dynamic-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  HeadphonesIcon,
  MessageCircle,
  PhoneCall,
  Video,
  Search,
  Play,
  Bot,
  User,
  Send,
  Youtube,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  Truck,
  Sun,
  Moon,
  Users,
  Sparkles,
  ExternalLink,
  Loader2,
  Smartphone,
  Save,
  Settings,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OcorrenciasOwner } from '@/components/suporte/ocorrencias-owner';
import { SuggestionList } from '@/components/suporte/SuggestionList';
import { SuggestionModal } from '@/components/suporte/SuggestionModal';
import { SuggestionChat } from '@/components/suporte/SuggestionChat';


interface Tutorial {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  youtube_url: string;
  thumbnail: string;
  duracao: string;
}

interface ChatMessage {
  id: string;
  tipo: 'user' | 'ia';
  conteudo: string;
  timestamp: Date;
}

interface MensagemPronta {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  ativa: boolean;
  created_at: Date;
}

export default function SuporteIndex() {
  const [mensagemChat, setMensagemChat] = useState('');
  const [mensagensChat, setMensagensChat] = useState<ChatMessage[]>([
    {
      id: '1',
      tipo: 'ia',
      conteudo: 'Olá! Sou a RS-IA, sua assistente de suporte. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [buscaTutorial, setBuscaTutorial] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');

  // Estados para Mensagens Prontas
  const [mensagensProntas, setMensagensProntas] = useState<MensagemPronta[]>([
    {
      id: '1',
      titulo: 'Bom dia - Início da rota',
      conteudo: 'Bom dia! Espero que esteja bem. Estamos saindo para buscar os alunos. Horário previsto de chegada na sua residência em breve.',
      categoria: 'Rotina',
      ativa: true,
      created_at: new Date()
    },
    {
      id: '2',
      titulo: 'Atraso na rota',
      conteudo: 'Olá! Informo que a van está com um pequeno atraso de aproximadamente 10-15 minutos devido ao trânsito. Já estamos a caminho e chegaremos o quanto antes.',
      categoria: 'Avisos',
      ativa: true,
      created_at: new Date()
    },
    {
      id: '3',
      titulo: 'Lembrete - Mensalidade',
      conteudo: 'Olá! Este é um lembrete amigável sobre o vencimento da mensalidade escolar. Caso já tenha realizado o pagamento, por favor desconsidere. Obrigado!',
      categoria: 'Cobrança',
      ativa: true,
      created_at: new Date()
    }
  ]);

  const [novaMensagem, setNovaMensagem] = useState({ titulo: '', conteudo: '', categoria: 'Rotina' });
  const [editandoMensagem, setEditandoMensagem] = useState<string | null>(null);

  // Novos Estados para Van e Filtros
  const [vans, setVans] = useState<any[]>([]);
  const [selectedVanId, setSelectedVanId] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [alunos, setAlunos] = useState<any[]>([]);
  const [isImprovingAI, setIsImprovingAI] = useState<string | null>(null);
  const [isLoadingAlunos, setIsLoadingAlunos] = useState(false);
  const [showNewModelModal, setShowNewModelModal] = useState(false);

  // Custom Support Config
  const [ownerSupportConfig, setOwnerSupportConfig] = useState<{
    whatsapp_number: string;
    support_name: string;
    welcome_message: string;
    whatsapp_group_link?: string;
  } | null>(null);

  const [whatsappSupport, setWhatsappSupport] = useState('5511999999999');
  const [supportName, setSupportName] = useState('Suporte via WhatsApp');
  const [whatsappMessage, setWhatsappMessage] = useState('Olá! Preciso de suporte com o app RotaFácil.');
  const [whatsappGroupLink, setWhatsappGroupLink] = useState('');
  const [aiSystemPrompt, setAiSystemPrompt] = useState('Você é um assistente profissional de transporte escolar. Seu objetivo é tornar a mensagem mais clara, gentil e profissional, sem alterar o sentido original. Mantenha curto.');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);

  // Estados para Comunicados
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [loadingComunicados, setLoadingComunicados] = useState(false);
  const [novoComunicado, setNovoComunicado] = useState({
    titulo: '',
    conteudo: '',
    tipo: 'EVENTO',
    data_publicacao: new Date().toISOString().split('T')[0],
    van_id: null as string | null
  });
  const [editandoComunicadoId, setEditandoComunicadoId] = useState<string | null>(null);
  const [salvandoComunicado, setSalvandoComunicado] = useState(false);


  const { toast } = useToast();

  useEffect(() => {
    checkRoleAndFetchData();
    fetchTutoriais();
    fetchSettings();
  }, []);

  const checkRoleAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch profile to get sponsor_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('sponsor_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // 2. Determine Role (Priority: Metadata -> Default)
    const metadata = (user.user_metadata || {}) as any;
    let role = metadata.tipo_usuario || metadata.user_type || 'usuario';

    // Se a role do metadata for genérica ('usuario'), verificamos se ele existe na tabela de consultores
    if (role === 'usuario' || !role) {
      const { data: consultor } = await (supabase as any)
        .from('consultores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (consultor) {
        role = 'consultor';
      }
    }

    // Normalize string
    const roleLower = String(role).toLowerCase().trim();

    // 3. Define isStaff / isOwner
    // Se for admin, motorista, monitora ou colaborador, consideramos staff para fins de suporte
    const isStaff = ['motorista', 'monitora', 'colaborador'].includes(roleLower);
    const isActuallyOwner = roleLower === 'admin' || roleLower === 'consultor' || !isStaff;

    setUserRole(roleLower);
    setIsOwner(isActuallyOwner);
    setIsLoadingProfile(false);

    if (isActuallyOwner) {
      fetchVans();
    }

    // 4. Set Tabs
    if (!activeTab) {
      setActiveTab(isActuallyOwner ? "mensagens" : "contato");
    }

    // 5. Fetch Support Config based on WHO is the owner
    let targetOwnerId = user.id; // Default: user is owner

    if (!isActuallyOwner) {
      // If staff, valid sponsor_id is REQUIRED
      const sponsorId = profile?.sponsor_id || metadata?.sponsor_id || metadata?.boss_id;

      console.log('[SUPORTE] Motorista/Monitora detectado. Buscando config do dono:', {
        userId: user.id,
        sponsorId,
        profileSponsorId: profile?.sponsor_id,
        metadataSponsorId: metadata?.sponsor_id,
        metadataBossId: metadata?.boss_id
      });

      if (!sponsorId) {
        console.error("[SUPORTE] Staff user without Sponsor ID detected.");
        setHasLoadedConfig(true);
        return;
      }
      targetOwnerId = sponsorId;
    }

    console.log('[SUPORTE] Buscando configurações de suporte para owner_id:', targetOwnerId);

    // Fetch config for the target owner (the recruiter/owner)
    const { data: configData, error: configError } = await (supabase as any)
      .from('owner_support_config')
      .select('*')
      .eq('owner_id', targetOwnerId)
      .maybeSingle();

    if (configError) {
      console.error('[SUPORTE] Erro ao buscar config:', configError);
    }

    console.log('[SUPORTE] Config recebida do banco:', configData);

    if (configData) {
      // Update local state for display/links
      if (configData.whatsapp_number) {
        console.log('[SUPORTE] Atualizando WhatsApp para:', configData.whatsapp_number);
        setWhatsappSupport(configData.whatsapp_number);
      }
      if (configData.support_name) setSupportName(configData.support_name);
      if (configData.welcome_message) setWhatsappMessage(configData.welcome_message);

      // Also update object state
      setOwnerSupportConfig({
        whatsapp_number: configData.whatsapp_number,
        support_name: configData.support_name,
        welcome_message: configData.welcome_message,
        whatsapp_group_link: configData.whatsapp_group_link
      });
      if (configData.whatsapp_group_link) setWhatsappGroupLink(configData.whatsapp_group_link);
    } else {
      console.warn('[SUPORTE] Nenhuma config encontrada para owner_id:', targetOwnerId);
    }
    setHasLoadedConfig(true);
  };

  const saveSupportConfig = async () => {
    try {
      setSavingConfig(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
        return;
      }

      console.log('Iniciando upsert de suporte:', {
        owner_id: user.id,
        whatsapp_number: whatsappSupport,
        support_name: supportName,
        welcome_message: whatsappMessage
      });

      const { error: upsertError } = await supabase
        .from('owner_support_config' as any)
        .upsert({
          owner_id: user.id,
          whatsapp_number: whatsappSupport,
          support_name: supportName,
          welcome_message: whatsappMessage,
          whatsapp_group_link: whatsappGroupLink,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'owner_id'
        });

      if (upsertError) {
        console.error('Erro no upsert do Supabase:', upsertError);
        throw upsertError;
      }

      toast({
        title: "Sucesso!",
        description: "Configuração de suporte salva com sucesso.",
      });

      // Atualizar cache local
      setHasLoadedConfig(false);
      checkRoleAndFetchData();
    } catch (error: any) {
      console.error('Catch error saving support config:', error);
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar a configuração.",
        variant: "destructive"
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'support_config')
        .single();

      if (data?.value) {
        const config = data.value as any;
        // Solo aplicar se não houver config específica do owner ou se for admin do sistema
        if (config.ai_prompt) setAiSystemPrompt(config.ai_prompt);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  useEffect(() => {
    if (selectedVanId && isOwner) {
      fetchAlunos();
    }
  }, [selectedVanId, selectedShift, isOwner]);

  const fetchVans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vans')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setVans(data || []);
    } catch (error) {
      console.error('Error fetching vans:', error);
    }
  };

  const fetchAlunos = async () => {
    setIsLoadingAlunos(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase.from('alunos').select('*').eq('user_id', user.id).eq('ativo', true);

      if (selectedVanId && selectedVanId !== 'all') {
        query = query.eq('van_id', selectedVanId);
      }

      if (selectedShift && selectedShift !== 'all') {
        query = query.eq('turno', selectedShift);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAlunos(data || []);
    } catch (error) {
      console.error('Error fetching alunos:', error);
    } finally {
      setIsLoadingAlunos(false);
    }
  };

  const [tutoriais, setTutoriais] = useState<Tutorial[]>([]);
  const [loadingTutoriais, setLoadingTutoriais] = useState(true);

  const fetchTutoriais = async () => {
    try {
      const { data, error } = await supabase
        .from('tutoriais')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: Tutorial[] = data.map(t => ({
          id: t.id,
          titulo: t.titulo,
          descricao: t.descricao || '',
          categoria: (t as any).categoria || 'Geral',
          youtube_url: t.link_tutorial,
          thumbnail: '/placeholder.svg',
          duracao: ''
        }));
        setTutoriais(formatted);
      }
    } catch (error) {
      console.error('Error fetching tutoriais:', error);
    } finally {
      setLoadingTutoriais(false);
    }
  };

  const melhorarComIA = async (msgId: string, originalContent: string) => {
    setIsImprovingAI(msgId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openrouter-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: aiSystemPrompt },
            { role: 'user', content: `Melhore esta mensagem para os pais dos alunos: "${originalContent}"` }
          ]
        })
      });

      const data = await response.json();
      if (data.message) {
        setMensagensProntas(prev => prev.map(m =>
          m.id === msgId ? { ...m, conteudo: data.message } : m
        ));
        toast({ title: "IA: Mensagem Melhorada", description: "O conteúdo foi refinado com sucesso!" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao usar IA para melhorar a mensagem.", variant: "destructive" });
    } finally {
      setIsImprovingAI(null);
    }
  };

  const enviarParaTodos = async (conteudo: string) => {
    const validAlunos = alunos.filter(a => a.whatsapp_responsavel);
    if (validAlunos.length === 0) {
      toast({ title: "Nenhum contato", description: "Não há alunos com WhatsApp cadastrado para este filtro.", variant: "destructive" });
      return;
    }

    validAlunos.forEach((aluno, index) => {
      setTimeout(() => {
        const text = conteudo.replace(/{aluno}/g, aluno.nome_completo || aluno.nome_responsavel);
        const url = `https://wa.me/${aluno.whatsapp_responsavel.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }, index * 1000);
    });
  };

  const abrirWhatsApp = () => {
    const url = `https://wa.me/${whatsappSupport.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const adicionarMensagem = () => {
    if (!novaMensagem.titulo || !novaMensagem.conteudo) {
      toast({ title: "Erro", description: "Preencha o título e conteúdo.", variant: "destructive" });
      return;
    }

    const mensagem: MensagemPronta = {
      id: Date.now().toString(),
      ...novaMensagem,
      ativa: true,
      created_at: new Date()
    };

    setMensagensProntas(prev => [...prev, mensagem]);
    setNovaMensagem({ titulo: '', conteudo: '', categoria: 'Rotina' });
    setShowNewModelModal(false);
    toast({ title: "Sucesso!", description: "Modelo de mensagem adicionado." });
  };

  const removerMensagem = (id: string) => {
    setMensagensProntas(prev => prev.filter(msg => msg.id !== id));
  };

  const copiarMensagem = (conteudo: string) => {
    navigator.clipboard.writeText(conteudo);
    toast({ title: "Copiado!", description: "Mensagem copiada para a área de transferência." });
  };

  const enviarParaGrupo = (vanId: string, conteudo: string) => {
    const van = vans.find(v => v.id === vanId);
    if (van?.whatsapp_group_url) {
      const url = `${van.whatsapp_group_url}?text=${encodeURIComponent(conteudo)}`;
      window.open(url, '_blank');
    } else {
      toast({ title: "Link não configurado", description: "O link do grupo desta van não foi cadastrado.", variant: "destructive" });
    }
  }

  // ==================== FUNÇÕES DE COMUNICADOS ====================

  const fetchComunicados = async () => {
    try {
      setLoadingComunicados(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('comunicados')
        .select('*')
        .eq('owner_id', user.id)
        .order('data_publicacao', { ascending: false });

      if (error) throw error;
      setComunicados(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar comunicados:', error);
      toast({ title: "Erro", description: "Não foi possível carregar os comunicados.", variant: "destructive" });
    } finally {
      setLoadingComunicados(false);
    }
  };

  const salvarComunicado = async () => {
    if (!novoComunicado.titulo || !novoComunicado.conteudo) {
      toast({ title: "Erro", description: "Preencha o título e conteúdo.", variant: "destructive" });
      return;
    }

    try {
      setSalvandoComunicado(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editandoComunicadoId) {
        // Atualizar comunicado existente
        const { error } = await supabase
          .from('comunicados')
          .update({
            titulo: novoComunicado.titulo,
            conteudo: novoComunicado.conteudo,
            tipo: novoComunicado.tipo,
            data_publicacao: novoComunicado.data_publicacao,
            van_id: novoComunicado.van_id
          })
          .eq('id', editandoComunicadoId);

        if (error) throw error;
        toast({ title: "Sucesso!", description: "Comunicado atualizado com sucesso." });
        setEditandoComunicadoId(null);
      } else {
        // Criar novo comunicado
        const { error } = await supabase
          .from('comunicados')
          .insert([{
            owner_id: user.id,
            titulo: novoComunicado.titulo,
            conteudo: novoComunicado.conteudo,
            tipo: novoComunicado.tipo,
            data_publicacao: novoComunicado.data_publicacao,
            van_id: novoComunicado.van_id,
            ativo: true
          }]);

        if (error) throw error;
        toast({ title: "Sucesso!", description: "Comunicado publicado com sucesso." });
      }

      // Limpar formulário e recarregar lista
      setNovoComunicado({
        titulo: '',
        conteudo: '',
        tipo: 'EVENTO',
        data_publicacao: new Date().toISOString().split('T')[0],
        van_id: null
      });
      fetchComunicados();
    } catch (error: any) {
      console.error('Erro ao salvar comunicado:', error);
      toast({ title: "Erro", description: "Não foi possível salvar o comunicado.", variant: "destructive" });
    } finally {
      setSalvandoComunicado(false);
    }
  };

  const editarComunicado = (comunicado: any) => {
    setNovoComunicado({
      titulo: comunicado.titulo,
      conteudo: comunicado.conteudo,
      tipo: comunicado.tipo,
      data_publicacao: comunicado.data_publicacao,
      van_id: comunicado.van_id
    });
    setEditandoComunicadoId(comunicado.id);
    // Scroll para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const excluirComunicado = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este comunicado?')) return;

    try {
      const { error } = await supabase
        .from('comunicados')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Sucesso!", description: "Comunicado excluído com sucesso." });
      fetchComunicados();
    } catch (error: any) {
      console.error('Erro ao excluir comunicado:', error);
      toast({ title: "Erro", description: "Não foi possível excluir o comunicado.", variant: "destructive" });
    }
  };

  const enviarComunicadoWhatsApp = (comunicado: any) => {
    const mensagem = `*${comunicado.titulo}*\n\n${comunicado.conteudo}\n\n_Enviado via RotaFácil_`;
    const texto = encodeURIComponent(mensagem);

    // Se tiver van específica, busca alunos dessa van
    // Senão, envia para todos
    if (comunicado.van_id) {
      const alunosDaVan = alunos.filter(a => a.van_id === comunicado.van_id && a.whatsapp_responsavel);
      if (alunosDaVan.length === 0) {
        toast({ title: "Nenhum contato", description: "Não há alunos com WhatsApp nesta van.", variant: "destructive" });
        return;
      }
      alunosDaVan.forEach((aluno, index) => {
        setTimeout(() => {
          const url = `https://wa.me/${aluno.whatsapp_responsavel.replace(/\D/g, '')}?text=${texto}`;
          window.open(url, '_blank');
        }, index * 1000);
      });
      toast({ title: "Enviando...", description: `Abrindo WhatsApp para ${alunosDaVan.length} responsáveis.` });
    } else {
      enviarParaTodos(mensagem);
    }
  };

  // Carregar comunicados quando abrir a aba
  useEffect(() => {
    if (activeTab === 'comunicados' && isOwner) {
      fetchComunicados();
    }
    if (isOwner) {
      fetchVans();
    }
  }, [activeTab, isOwner]);

  return (
    <DynamicLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[#121212] border border-white/5 rounded-[24px] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="p-3 bg-gradient-gold rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <HeadphonesIcon className="h-8 w-8 text-black" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">Central de Suporte</h1>
              </div>
              <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                {isOwner
                  ? "Gerencie seu canal de atendimento e modelos de mensagens para sua equipe e clientes."
                  : "Precisa de ajuda? Entre em contato com o responsável pela sua empresa."}
              </p>
            </div>

            {isOwner && (
              <div className="flex flex-col gap-3 min-w-[240px]">
                <Button
                  onClick={abrirWhatsApp}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold h-14 rounded-2xl gap-3 shadow-[0_8px_16px_rgba(34,197,94,0.3)] hover:translate-y-[-2px] transition-all"
                >
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  Falar com {supportName}
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 relative z-10">
          <TabsList className="bg-[#121212] border border-white/5 p-1 h-auto sm:h-14 rounded-2xl overflow-x-auto scrollbar-hide flex">
            {isOwner && (
              <>
                <TabsTrigger value="mensagens" className="rounded-xl data-[state=active]:bg-gradient-gold data-[state=active]:text-black font-bold gap-1 sm:gap-2 transition-all whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Mensagens Prontas</span>
                  <span className="sm:hidden">Msgs</span>
                </TabsTrigger>
                <TabsTrigger value="config" className="rounded-xl data-[state=active]:bg-gradient-gold data-[state=active]:text-black font-bold gap-1 sm:gap-2 transition-all whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                  <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Configurar Atendimento</span>
                  <span className="sm:hidden">Config</span>
                </TabsTrigger>
                <TabsTrigger value="ocorrencias" className="rounded-xl data-[state=active]:bg-gradient-gold data-[state=active]:text-black font-bold gap-1 sm:gap-2 transition-all whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                  <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Ocorrências / Reclamações</span>
                  <span className="sm:hidden">Ocorrências</span>
                </TabsTrigger>
                <TabsTrigger value="sugestoes" className="rounded-xl data-[state=active]:bg-gradient-gold data-[state=active]:text-black font-bold gap-1 sm:gap-2 transition-all whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Sugestões de Melhoria</span>
                  <span className="sm:hidden">Sugestões</span>
                </TabsTrigger>
                <TabsTrigger value="comunicados" className="rounded-xl data-[state=active]:bg-gradient-gold data-[state=active]:text-black font-bold gap-1 sm:gap-2 transition-all whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Comunicados</span>
                  <span className="sm:hidden">Avisos</span>
                </TabsTrigger>
              </>

            )}
            {!isOwner && (
              <TabsTrigger value="contato" className="rounded-xl data-[state=active]:bg-gradient-gold data-[state=active]:text-black font-bold gap-1 sm:gap-2 transition-all whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
                <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Contato Direto
              </TabsTrigger>
            )}
          </TabsList>

          {/* Tab: Configuração (Só para Dono) */}
          {isOwner && (
            <TabsContent value="config" className="relative z-[100] outline-none">
              <Card className="bg-[#121212] border-white/5 rounded-[24px] overflow-visible shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <HeadphonesIcon className="h-5 w-5 text-gold" />
                    Canal de Suporte da sua Empresa
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Defina para onde seus motoristas e monitoras serão direcionados ao pedir ajuda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300">WhatsApp de Atendimento</Label>
                      <input
                        type="tel"
                        id="whatsappSupport"
                        autoFocus
                        value={whatsappSupport}
                        onChange={(e) => setWhatsappSupport(e.target.value)}
                        placeholder="Ex: 5511999999999"
                        className="w-full bg-[#1A1A1A] border border-white/20 text-white h-12 px-4 rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-gray-500 relative z-[110] cursor-text pointer-events-auto"
                        autoComplete="off"
                      />
                      <p className="text-[10px] text-gray-500">Inclua o código do país e DDD (apenas números).</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Nome de Exibição</Label>
                      <input
                        type="text"
                        id="supportName"
                        value={supportName}
                        onChange={(e) => setSupportName(e.target.value)}
                        placeholder="Ex: Suporte RS RotaFácil"
                        className="w-full bg-[#1A1A1A] border border-white/20 text-white h-12 px-4 rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-gray-500 relative z-[110] cursor-text pointer-events-auto"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-300">Link do Grupo de WhatsApp da Central</Label>
                    <input
                      type="url"
                      id="whatsappGroupLink"
                      value={whatsappGroupLink}
                      onChange={(e) => setWhatsappGroupLink(e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full bg-[#1A1A1A] border border-white/20 text-white h-12 px-4 rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-gray-500 relative z-[110] cursor-text pointer-events-auto"
                      autoComplete="off"
                    />
                    <p className="text-[10px] text-gray-500">Link para o grupo geral onde todos podem entrar.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Mensagem de Boas-vindas</Label>
                    <textarea
                      id="whatsappMessage"
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      placeholder="Mensagem que chegará para você quando clicarem no botão..."
                      className="w-full bg-[#1A1A1A] border border-white/20 text-white min-h-[100px] p-4 rounded-xl focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-gray-500 relative z-[110] cursor-text pointer-events-auto"
                    />
                  </div>

                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      saveSupportConfig();
                    }}
                    disabled={savingConfig}
                    className="bg-gradient-gold text-black font-bold h-12 px-8 rounded-xl hover:scale-105 transition-transform relative z-50 pointer-events-auto"
                  >
                    {savingConfig ? "Salvando..." : "Salvar Configurações"}
                    <Save className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Tab: Mensagens Prontas (Só para Dono) */}
          {isOwner && (
            <TabsContent value="mensagens">
              <div className="space-y-6">
                <Card className="bg-[#121212] border-white/5 rounded-[24px] overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2 text-white">
                          <Users className="h-5 w-5 text-gold" />
                          Público Alvo
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Selecione os destinatários para o envio rápido
                        </CardDescription>
                      </div>
                      {alunos.length > 0 && (
                        <Badge className="bg-gold/10 text-gold border-gold/20 font-black">
                          {alunos.length} ALUNOS
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gold" />
                          Van Específica
                        </Label>
                        <select
                          className="w-full h-12 px-4 bg-[#0A0A0A] border border-white/10 rounded-xl text-white outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors relative z-30 pointer-events-auto"
                          value={selectedVanId}
                          onChange={(e) => setSelectedVanId(e.target.value)}
                        >
                          <option value="all">Todas as Vans</option>
                          {vans.map(van => (
                            <option key={van.id} value={van.id}>{van.nome}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Sun className="h-4 w-4 text-gold" />
                          Turno de Atendimento
                        </Label>
                        <div className="flex gap-2">
                          <Button
                            variant={selectedShift === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedShift('all')}
                            className={`flex-1 h-12 rounded-xl font-bold ${selectedShift === 'all' ? 'bg-gold text-black' : 'border-white/10 text-white'}`}
                          >
                            Todos
                          </Button>
                          <Button
                            variant={selectedShift === 'manha' ? 'default' : 'outline'}
                            onClick={() => setSelectedShift('manha')}
                            className={`flex-1 h-12 rounded-xl font-bold gap-2 ${selectedShift === 'manha' ? 'bg-gold text-black' : 'border-white/10 text-white'}`}
                          >
                            <Sun className="h-4 w-4" /> Manhã
                          </Button>
                          <Button
                            variant={selectedShift === 'tarde' ? 'default' : 'outline'}
                            onClick={() => setSelectedShift('tarde')}
                            className={`flex-1 h-12 rounded-xl font-bold gap-2 ${selectedShift === 'tarde' ? 'bg-gold text-black' : 'border-white/10 text-white'}`}
                          >
                            <Moon className="h-4 w-4" /> Tarde
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-gold" />
                    Modelos de Mensagens
                  </h3>
                  <Button onClick={() => setShowNewModelModal(true)} className="bg-gradient-gold text-black font-bold rounded-xl h-10 px-6">
                    <Plus className="h-4 w-4 mr-2" /> Novo Modelo
                  </Button>
                </div>

                <Dialog open={showNewModelModal} onOpenChange={setShowNewModelModal}>
                  <DialogContent className="bg-[#121212] border-white/10 text-white rounded-3xl sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black flex items-center gap-2">
                        <Plus className="h-6 w-6 text-gold" />
                        Novo Modelo de Mensagem
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Crie um modelo para agilizar o envio de mensagens frequentes.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Título do Modelo</Label>
                        <Input
                          value={novaMensagem.titulo}
                          onChange={(e) => setNovaMensagem({ ...novaMensagem, titulo: e.target.value })}
                          placeholder="Ex: Bom dia - Início da Rota"
                          className="bg-[#1A1A1A] border-white/10 text-white rounded-xl h-12 focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Categoria</Label>
                        <select
                          value={novaMensagem.categoria}
                          onChange={(e) => setNovaMensagem({ ...novaMensagem, categoria: e.target.value })}
                          className="w-full h-12 px-4 bg-[#1A1A1A] border border-white/10 rounded-xl text-white outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 appearance-none"
                        >
                          <option value="Rotina" className="bg-[#121212]">Rotina</option>
                          <option value="Avisos" className="bg-[#121212]">Avisos</option>
                          <option value="Cobrança" className="bg-[#121212]">Cobrança</option>
                          <option value="Outros" className="bg-[#121212]">Outros</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Conteúdo da Mensagem</Label>
                        <Textarea
                          value={novaMensagem.conteudo}
                          onChange={(e) => setNovaMensagem({ ...novaMensagem, conteudo: e.target.value })}
                          placeholder="Digite a mensagem aqui. Use {aluno} para personalizar com o nome do aluno."
                          className="bg-[#1A1A1A] border-white/10 text-white rounded-xl min-h-[150px] focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
                        />
                        <p className="text-[10px] text-gray-500">Dica: {`{aluno}`} será substituído pelo nome do aluno/responsável.</p>
                      </div>
                    </div>

                    <DialogFooter className="gap-2">
                      <Button variant="ghost" onClick={() => setShowNewModelModal(false)} className="text-gray-400 hover:text-white">
                        Cancelar
                      </Button>
                      <Button onClick={adicionarMensagem} className="bg-gradient-gold text-black font-bold px-8 rounded-xl">
                        Adicionar Modelo
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {mensagensProntas.map((mensagem) => (
                    <Card key={mensagem.id} className="bg-[#121212] border-white/5 hover:border-gold/30 transition-all duration-300 rounded-[24px] overflow-hidden group">
                      <CardHeader className="p-6 pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-gold/5 text-gold border-gold/10 text-[10px] uppercase font-black">
                            {mensagem.categoria}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/50 hover:text-gold hover:bg-gold/10"
                              onClick={() => melhorarComIA(mensagem.id, mensagem.conteudo)}
                              disabled={isImprovingAI === mensagem.id}
                            >
                              {isImprovingAI === mensagem.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/50 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => removerMensagem(mensagem.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-white mt-2 font-bold">{mensagem.titulo}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-4 relative group/content">
                          <p className="text-gray-400 text-sm italic leading-relaxed line-clamp-3">"{mensagem.conteudo}"</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover/content:opacity-100 text-white/50 hover:text-gold"
                            onClick={() => copiarMensagem(mensagem.conteudo)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button onClick={() => enviarParaTodos(mensagem.conteudo)} className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl h-12 text-xs gap-2">
                            <Smartphone className="h-4 w-4" /> Enviar p/ Todos
                          </Button>
                          <Button onClick={() => enviarParaGrupo(selectedVanId, mensagem.conteudo)} variant="outline" className="border-white/10 text-white hover:bg-white/5 font-bold rounded-xl h-12 text-xs gap-2">
                            <MessageCircle className="h-4 w-4" /> Grupo da Van
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {isOwner && (
            <TabsContent value="ocorrencias">
              <OcorrenciasOwner />
            </TabsContent>
          )}

          {isOwner && (
            <TabsContent value="sugestoes">
              <div className="space-y-6">
                {!selectedSuggestionId ? (
                  <SuggestionList
                    onNew={() => setShowSuggestionModal(true)}
                    onSelect={(id) => setSelectedSuggestionId(id)}
                  />
                ) : (
                  <SuggestionChat
                    suggestionId={selectedSuggestionId}
                    onBack={() => setSelectedSuggestionId(null)}
                  />
                )}

                <SuggestionModal
                  open={showSuggestionModal}
                  onOpenChange={setShowSuggestionModal}
                  onSuccess={() => {
                    // Refresh current view if list is visible
                    setActiveTab("sugestoes");
                  }}
                />
              </div>
            </TabsContent>
          )}

          {/* Tab: Comunicados (Só para Dono) */}
          {isOwner && (
            <TabsContent value="comunicados">
              <div className="space-y-6">
                <Card className="bg-[#121212] border-white/5 rounded-[24px] overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-gold" />
                      Criar Novo Comunicado
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Crie comunicados que aparecerão para os responsáveis (pais) na área da família.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Título do Comunicado</Label>
                        <Input
                          value={novoComunicado.titulo}
                          onChange={(e) => setNovoComunicado(prev => ({ ...prev, titulo: e.target.value }))}
                          placeholder="Ex: Reunião de Pais e Mestres"
                          className="bg-[#1A1A1A] border-white/20 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Tipo</Label>
                        <select
                          value={novoComunicado.tipo}
                          onChange={(e) => setNovoComunicado(prev => ({ ...prev, tipo: e.target.value }))}
                          className="w-full h-12 px-4 bg-[#1A1A1A] border border-white/20 rounded-xl text-white outline-none focus:border-gold/50"
                        >
                          <option value="EVENTO">EVENTO</option>
                          <option value="AVISO">AVISO</option>
                          <option value="SISTEMA">SISTEMA</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Data de Publicação</Label>
                        <Input
                          type="date"
                          value={novoComunicado.data_publicacao}
                          onChange={(e) => setNovoComunicado(prev => ({ ...prev, data_publicacao: e.target.value }))}
                          className="bg-[#1A1A1A] border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Van Específica (Opcional)</Label>
                      <select
                        value={novoComunicado.van_id || ''}
                        onChange={(e) => setNovoComunicado(prev => ({ ...prev, van_id: e.target.value || null }))}
                        className="w-full h-12 px-4 bg-[#1A1A1A] border border-white/20 rounded-xl text-white outline-none focus:border-gold/50"
                      >
                        <option value="">Todos os Responsáveis</option>
                        {vans.map(van => (
                          <option key={van.id} value={van.id}>{van.nome}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Deixe em branco para enviar a todos os responsáveis</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Conteúdo do Comunicado</Label>
                      <Textarea
                        value={novoComunicado.conteudo}
                        onChange={(e) => setNovoComunicado(prev => ({ ...prev, conteudo: e.target.value }))}
                        placeholder="Digite o conteúdo completo do comunicado aqui. Seja claro e objetivo."
                        className="bg-[#1A1A1A] border-white/20 text-white min-h-[250px] resize-none"
                      />
                      <p className="text-xs text-gray-500">{novoComunicado.conteudo.length} caracteres</p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={salvarComunicado}
                        disabled={salvandoComunicado}
                        className="bg-gradient-gold text-black font-bold h-12 px-8 rounded-xl hover:scale-105 transition-transform"
                      >
                        {salvandoComunicado ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</>
                        ) : editandoComunicadoId ? (
                          <><Save className="h-4 w-4 mr-2" /> Atualizar Comunicado</>
                        ) : (
                          <><Plus className="h-4 w-4 mr-2" /> Publicar Comunicado</>
                        )}
                      </Button>

                      {editandoComunicadoId && (
                        <Button
                          onClick={() => {
                            setEditandoComunicadoId(null);
                            setNovoComunicado({
                              titulo: '',
                              conteudo: '',
                              tipo: 'EVENTO',
                              data_publicacao: new Date().toISOString().split('T')[0],
                              van_id: null
                            });
                          }}
                          variant="outline"
                          className="border-white/20 text-white h-12 px-8 rounded-xl"
                        >
                          Cancelar Edição
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Comunicados Publicados */}
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                    <MessageSquare className="h-6 w-6 text-gold" />
                    Comunicados Publicados
                  </h3>

                  <div className="space-y-4">
                    {loadingComunicados ? (
                      <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto" />
                        <p className="text-gray-500 mt-4">Carregando comunicados...</p>
                      </div>
                    ) : comunicados.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm py-12">
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Nenhum comunicado publicado</p>
                        <p className="text-sm mt-2">Crie comunicados para manter os responsáveis informados.</p>
                      </div>
                    ) : (
                      comunicados.map(comunicado => {
                        const tipoCores = {
                          'EVENTO': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                          'AVISO': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                          'SISTEMA': 'bg-blue-500/10 text-blue-500/20'
                        };

                        return (
                          <Card key={comunicado.id} className="bg-[#121212] border-white/5 hover:border-gold/30 transition-all">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <Badge className={tipoCores[comunicado.tipo as keyof typeof tipoCores]}>
                                      {comunicado.tipo}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {new Date(comunicado.data_publicacao).toLocaleDateString('pt-BR')}
                                    </span>
                                    {comunicado.van_id && (
                                      <span className="text-xs text-gold bg-gold/10 px-2 py-1 rounded">
                                        Van Específica
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-lg font-bold text-white mb-2 truncate">{comunicado.titulo}</h4>
                                  <p className="text-gray-400 text-sm line-clamp-2">
                                    {comunicado.conteudo}
                                  </p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                  <Button
                                    onClick={() => enviarComunicadoWhatsApp(comunicado)}
                                    variant="ghost"
                                    size="icon"
                                    className="text-white/50 hover:text-green-500"
                                    title="Enviar via WhatsApp"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => editarComunicado(comunicado)}
                                    variant="ghost"
                                    size="icon"
                                    className="text-white/50 hover:text-gold"
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => excluirComunicado(comunicado.id)}
                                    variant="ghost"
                                    size="icon"
                                    className="text-white/50 hover:text-red-500"
                                    title="Excluir"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Tab: Contato para Equipe */}

          {!isOwner && (
            <TabsContent value="contato">
              <Card className="bg-[#121212] border-white/5 rounded-[24px] overflow-hidden p-8 text-center space-y-8">
                <div className="w-24 h-24 bg-gradient-gold rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <HeadphonesIcon className="h-12 w-12 text-black" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-white">Central de Atendimento</h2>
                  <p className="text-gray-400 text-lg max-w-md mx-auto">
                    Precisa de suporte ou reportar um problema? Entre em contato agora mesmo com seu gestor via WhatsApp.
                  </p>
                </div>
                <Button
                  onClick={abrirWhatsApp}
                  className="bg-green-500 hover:bg-green-600 text-white font-black h-16 px-12 rounded-[24px] text-xl gap-4 shadow-[0_12px_24px_rgba(34,197,94,0.4)] hover:translate-y-[-4px] transition-all"
                >
                  <MessageCircle className="h-6 w-6" />
                  Falar com {supportName}
                </Button>
                <div className="pt-8 border-t border-white/5">
                  <p className="text-gray-500 text-sm">
                    Horário de atendimento definido pelo seu gestor.
                  </p>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DynamicLayout>
  );
}