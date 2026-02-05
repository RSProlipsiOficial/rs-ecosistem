import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DynamicLayout } from '@/components/layout/dynamic-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Crown,
  Camera,
  Upload,
  Key,
  RefreshCw,
  Copy,
  Share2,
  Scale,
  MessageSquare,
  Brain,
  Sparkles,
  Bell,
  CreditCard,
  Bus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatToPascalCase } from '@/lib/utils';

interface UserProfile {
  id?: string;
  user_id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  telefone: string;
  avatar_url?: string;
  perfil_completo: boolean;
  mercadopago_access_token?: string;
  mercadopago_public_key?: string;
  juros_tipo?: 'valor' | 'percentual';
  juros_valor_multa?: number;
  juros_valor_dia?: number;
  juros_percentual_multa?: number;
  juros_percentual_mes?: number;
  sponsor_id?: string;
  mmn_id?: string;
  mmn_active?: boolean;
  slug?: string;
  pix_key?: string;
  pix_type?: string;
  salario_base?: number;
  contract_template?: string;
  empresa?: string;
}

interface UserSubscription {
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  plan: {
    name: string;
    plan_type: 'free' | 'premium';
  };
}

export default function PerfilIndex() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    nome_completo: '',
    cpf: '',
    data_nascimento: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_estado: '',
    endereco_cep: '',
    telefone: '',
    avatar_url: '',
    perfil_completo: false,
    mercadopago_access_token: '',
    mercadopago_public_key: '',
    sponsor_id: '',
    mmn_id: '',
    mmn_active: false,
    slug: '',
    pix_key: '',
    pix_type: '',
    salario_base: 0,
    empresa: ''
  });
  const [userEmail, setUserEmail] = useState('');
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [vans, setVans] = useState<{ id: string; nome: string }[]>([]);
  const [vanId, setVanId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserRole(session?.user?.user_metadata?.tipo_usuario || session?.user?.user_metadata?.user_type || 'usuario');
    };
    checkRole();
  }, []);

  const isTeam = userRole === 'motorista' || userRole === 'monitora';


  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || '');

      // Carregar perfil
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);

        // Se for motorista ou monitora, carregar a van e salário
        const userType = user.user_metadata?.tipo_usuario || user.user_metadata?.user_type;
        if (userType === 'motorista' || userType === 'monitora') {
          const vanIdFromMetadata = user.user_metadata?.van_id;
          if (vanIdFromMetadata) {
            setVanId(vanIdFromMetadata);
          }

          // Carregar salário do metadata
          const salarioFromMetadata = user.user_metadata?.salario;
          if (salarioFromMetadata) {
            setProfile(prev => ({ ...prev, salario_base: Number(salarioFromMetadata) }));
          }
        }

        // Buscar username da tabela consultores
        const { data: consultorData } = await (supabase as any)
          .from('consultores')
          .select('username')
          .eq('user_id', user.id)
          .maybeSingle();

        if (consultorData?.username) {
          setProfile(prev => ({ ...prev, mmn_id: consultorData.username }));
        } else {
          // AUTO-CORREÇÃO (Self-healing): Se não existe registro em consultores, criar um
          console.log("Self-healing: Criando registro em consultores para o usuário", user.id);
          const autoUsername = (user.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 100);

          const { error: insertError } = await (supabase as any)
            .from('consultores')
            .insert({
              user_id: user.id,
              username: autoUsername,
              email: user.email,
              nome: profileData.nome_completo || user.email?.split('@')[0],
              status: 'ativo'
            } as any);

          if (!insertError) {
            setProfile(prev => ({ ...prev, mmn_id: autoUsername }));
          }
        }
      } else {
        // Criar perfil vazio
        setProfile(prev => ({ ...prev, user_id: user.id }));
      }


      // Carregar assinatura
      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select(`
          status,
          plan:subscription_plans(name, plan_type)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionData) {
        setSubscription(subscriptionData as UserSubscription);
      }

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userType = user.user_metadata?.tipo_usuario || user.user_metadata?.user_type;
      const isTeam = userType === 'motorista' || userType === 'monitora';

      // Se for equipe, buscar vans do patrão (boss_id ou sponsor_id)
      // Se for dono, buscar suas próprias vans
      const ownerId = isTeam
        ? (user.user_metadata?.boss_id || user.user_metadata?.sponsor_id)
        : user.id;

      console.log("loadVans: Buscando vans para ownerId:", ownerId);

      const query = supabase
        .from('vans')
        .select('id, nome')
        .order('nome');

      // Se tivermos um ownerId claro, filtramos por ele. 
      // Caso contrário (equipe sem vínculo claro), mostramos todas (RLS permite)
      if (ownerId) {
        query.eq('user_id', ownerId);
      }

      // Se for equipe e tiver van específica vinculada, filtrar para mostrar apenas ela
      const vanIdFromMetadata = user.user_metadata?.van_id;
      if (isTeam && vanIdFromMetadata) {
        query.eq('id', vanIdFromMetadata);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVans(data || []);
    } catch (error) {
      console.error("Erro ao carregar vans:", error);
    }
  };

  const validateDocumento = (doc: string) => {
    const cleaned = doc.replace(/\D/g, '');
    return cleaned.length === 11 || cleaned.length === 14;
  };

  const validateCEP = (cep: string) => {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.length === 8;
  };

  const isProfileComplete = () => {
    const requiredFields = [
      'nome_completo', 'cpf', 'data_nascimento', 'endereco_rua',
      'endereco_numero', 'endereco_bairro', 'endereco_cidade',
      'endereco_estado', 'endereco_cep', 'telefone'
    ];

    return requiredFields.every(field => {
      const value = profile[field as keyof UserProfile];
      return value && value.toString().trim() !== '';
    }) && validateDocumento(profile.cpf || '') && validateCEP(profile.endereco_cep || '');
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const complete = isProfileComplete();

      // Limpar e preparar os dados para o banco
      const profileToSave = {
        user_id: user.id,
        nome_completo: profile.nome_completo || null,
        cpf: profile.cpf || null,
        data_nascimento: profile.data_nascimento === '' ? null : profile.data_nascimento,
        endereco_rua: profile.endereco_rua || null,
        endereco_numero: profile.endereco_numero || null,
        endereco_bairro: profile.endereco_bairro || null,
        endereco_cidade: profile.endereco_cidade || null,
        endereco_estado: profile.endereco_estado || null,
        endereco_cep: profile.endereco_cep || null,
        telefone: profile.telefone || null,
        avatar_url: profile.avatar_url || null,
        perfil_completo: complete,
        mercadopago_access_token: profile.mercadopago_access_token || null,
        mercadopago_public_key: profile.mercadopago_public_key || null,
        juros_tipo: profile.juros_tipo || 'valor',
        juros_valor_multa: profile.juros_valor_multa || 10,
        juros_valor_dia: profile.juros_valor_dia || 2,
        juros_percentual_multa: profile.juros_percentual_multa || 2,
        juros_percentual_mes: profile.juros_percentual_mes || 1,
        sponsor_id: profile.sponsor_id || null,
        mmn_id: profile.mmn_id || null,
        mmn_active: profile.mmn_active || false,
        slug: profile.slug || null,
        pix_key: profile.pix_key || null,
        pix_type: profile.pix_type || null,
        empresa: profile.empresa || null
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileToSave, { onConflict: 'user_id' });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // 📝 ATUALIZAÇÃO SÊNIOR: Sincronizar Tudo com Metadados do Usuário
      const metadataToUpdate: any = {
        name: profile.nome_completo,
        nome: profile.nome_completo,
        full_name: profile.nome_completo,
        nome_completo: profile.nome_completo,
        phone: profile.telefone,
        telefone: profile.telefone,
        whatsapp: profile.telefone,
        cpf: profile.cpf,
        data_nascimento: profile.data_nascimento
      };

      if (isTeam && vanId) {
        metadataToUpdate.van_id = vanId;
      }

      await supabase.auth.updateUser({
        data: metadataToUpdate
      });
      console.log("✅ Metadados do usuário sincronizados:", metadataToUpdate);

      setProfile(prev => ({ ...prev, perfil_completo: complete }));

      toast({
        title: "Sucesso!",
        description: complete
          ? "Seu perfil foi todo atualizado com sucesso."
          : "Dados salvos e sincronizados com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o perfil. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Função para redimensionar imagem
  const resizeImage = (file: File, maxSize: number = 400): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        const ratio = Math.min(maxSize / width, maxSize / height);

        canvas.width = width * ratio;
        canvas.height = height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Upload de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Redimensionar imagem para economizar espaço
      const resizedFile = await resizeImage(file);
      const fileName = `${user.id}-avatar-${Date.now()}.jpg`;

      // Upload para o bucket de avatares
      const { error: uploadError } = await supabase.storage
        .from('rsia-uploads')
        .upload(`avatars/${fileName}`, resizedFile);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('rsia-uploads')
        .getPublicUrl(`avatars/${fileName}`);

      // Atualizar perfil com nova URL do avatar
      const profileData = {
        user_id: user.id,
        avatar_url: publicUrl,
        nome_completo: profile.nome_completo || '',
        cpf: profile.cpf || '',
        data_nascimento: profile.data_nascimento || null,
        endereco_rua: profile.endereco_rua || '',
        endereco_numero: profile.endereco_numero || '',
        endereco_bairro: profile.endereco_bairro || '',
        endereco_cidade: profile.endereco_cidade || '',
        endereco_estado: profile.endereco_estado || '',
        endereco_cep: profile.endereco_cep || '',
        telefone: profile.telefone || '',
        perfil_completo: profile.perfil_completo || false
      };

      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: "Sucesso!",
        description: "Avatar atualizado com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o avatar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Mudança de senha direta
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos de senha.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setChangingPassword(true);

      // Primeiro, verificar a senha atual fazendo login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        toast({
          title: "Erro",
          description: "Senha atual incorreta.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar para nova senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast({
        title: "Sucesso!",
        description: "Senha alterada com sucesso.",
      });

      // Limpar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Reset de senha
  const handlePasswordReset = async () => {
    try {
      setResettingPassword(true);

      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });

    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email de reset. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const formatDocumento = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleaned.length <= 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cleaned.substring(0, 14);
  };

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    return formatted;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    return formatted;
  };

  useEffect(() => {
    loadProfile();
    if (isTeam) {
      loadVans();
    }
  }, [isTeam]);

  if (loading) {
    return (
      <DynamicLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </DynamicLayout>
    );
  }

  return (
    <DynamicLayout>
      <div className="space-y-6">
        {/* Alerta de Perfil Incompleto */}
        {!profile.perfil_completo && (
          <Alert className="bg-amber-500/10 border-amber-500/50 text-amber-200 animate-pulse">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <AlertDescription className="font-bold uppercase text-xs tracking-widest ml-2">
              Atenção: Seu cadastro está incompleto. Por favor, preencha todos os campos obrigatórios (*) para liberar o acesso total ao seu Escritório Virtual.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        {/* Header - Simplified for Team */}
        <div className="bg-black-secondary border border-sidebar-border shadow-elegant rounded-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-gold opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />
          <div className="p-5 md:p-8 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 md:p-3 bg-gold/10 rounded-xl border border-gold/20">
                <User className="h-6 w-6 md:h-8 md:w-8 text-gold" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-black text-gold uppercase tracking-tight italic">Meu Perfil</h1>
                <p className="text-muted-foreground font-black uppercase text-[9px] md:text-[10px] tracking-widest mt-1">
                  {isTeam ? "Identidade e Acesso" : "Gestão de Dados e Segurança IA"}
                </p>
              </div>
            </div>

            {!isTeam && (
              <div className="grid gap-4 md:grid-cols-2 mt-6">
                <div className="bg-black-primary/50 backdrop-blur-sm rounded-xl p-5 border border-sidebar-border hover:border-gold/30 transition-all group">
                  <Link to="/upgrade" className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${profile.perfil_completo ? 'bg-green-500/10' : 'bg-gold/10'}`}>
                      {profile.perfil_completo ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-gold" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground uppercase tracking-tight">
                        {profile.perfil_completo ? 'Perfil Verificado' : 'Perfil Pendente'}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        {profile.perfil_completo
                          ? 'Identificação padrão ouro'
                          : 'Complete para novos recursos'}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="bg-black-primary/50 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-sidebar-border hover:border-gold/30 transition-all group">
                  <Link to="/upgrade" className="flex items-center gap-3">
                    <div className="p-1.5 md:p-2 bg-gold/10 rounded-lg">
                      {subscription?.plan?.plan_type === 'premium' ? (
                        <Crown className="h-4 w-4 md:h-5 md:w-5 text-gold" />
                      ) : (
                        <Shield className="h-4 w-4 md:h-5 md:w-5 text-gold/60" />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-xs md:text-sm text-gold uppercase tracking-tight">
                        {subscription?.plan?.name || 'Standard'}
                      </p>
                      <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                        Assinatura IA
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Abas do Perfil */}
        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="bg-black-lighter border border-gold/40 p-1 flex gap-1 overflow-x-auto custom-scrollbar mb-8">
            <TabsTrigger value="perfil" className="flex-1 min-w-[90px] data-[state=active]:bg-gold data-[state=active]:text-black text-white font-black uppercase text-[9px] md:text-xs tracking-widest gap-1.5 py-2.5">
              <User className="h-3.5 w-3.5" />
              Identidade
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex-1 min-w-[90px] data-[state=active]:bg-gold data-[state=active]:text-black text-white font-black uppercase text-[9px] md:text-xs tracking-widest gap-1.5 py-2.5">
              <Camera className="h-3.5 w-3.5" />
              Avatar
            </TabsTrigger>
            {isTeam && (
              <TabsTrigger value="financeiro" className="flex-1 min-w-[90px] data-[state=active]:bg-gold data-[state=active]:text-black text-white font-black uppercase text-[9px] md:text-xs tracking-widest gap-1.5 py-2.5">
                <CreditCard className="h-3.5 w-3.5" />
                Financeiro
              </TabsTrigger>
            )}
            {!isTeam && (
              <TabsTrigger value="integracao" className="flex-1 min-w-[90px] data-[state=active]:bg-gold data-[state=active]:text-black text-white font-black uppercase text-[9px] md:text-xs tracking-widest gap-1.5 py-2.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Integração
              </TabsTrigger>
            )}
            <TabsTrigger value="senha" className="flex-1 min-w-[90px] data-[state=active]:bg-gold data-[state=active]:text-black text-white font-black uppercase text-[9px] md:text-xs tracking-widest gap-1.5 py-2.5">
              <Key className="h-3.5 w-3.5" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Aba: Dados Pessoais */}
          <TabsContent value="perfil">
            <Card className="bg-black-secondary border-sidebar-border shadow-elegant">
              <CardHeader className="border-b border-sidebar-border/50">
                <CardTitle className="flex items-center gap-2 text-gold uppercase tracking-tight italic font-black">
                  <User className="h-5 w-5" />
                  Identificação do Usuário
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                  Gestão de informações fundamentais do perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 md:space-y-8 p-4 md:p-8">
                {/* Dados de Login */}
                <div className="bg-gray-800/20 dark:bg-gray-900/40 rounded-xl p-6 border border-gray-600/30 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
                  <h3 className="font-semibold text-gray-200 dark:text-gray-100 text-lg mb-6 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    Dados de Acesso
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-300 dark:text-gray-200">
                        E-mail de Login
                      </Label>
                      <Input
                        value={userEmail}
                        disabled
                        className="bg-gray-700/30 dark:bg-gray-800/50 border-gray-500/40 dark:border-gray-600/50 text-gray-200 dark:text-gray-100 h-11 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-300 dark:text-gray-200">
                        Status da Conta
                      </Label>
                      <div className="flex items-center gap-3 h-11">
                        <Badge
                          variant={isTeam || profile.perfil_completo ? "default" : "secondary"}
                          className={`px-4 py-2 text-sm font-medium ${isTeam || profile.perfil_completo
                            ? 'bg-green-900/40 text-green-300 border-green-600/50'
                            : 'bg-yellow-900/40 text-yellow-300 border-yellow-600/50'
                            }`}
                        >
                          {isTeam || profile.perfil_completo ? 'Verificada' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dados Pessoais */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informações Pessoais
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="nome_completo" className="text-sm font-medium text-foreground">
                        Nome Completo *
                      </Label>
                      <Input
                        id="nome_completo"
                        value={profile.nome_completo}
                        onChange={(e) => setProfile(prev => ({ ...prev, nome_completo: e.target.value }))}
                        onBlur={(e) => setProfile({ ...profile, nome_completo: formatToPascalCase(e.target.value) })}
                        placeholder="Seu nome completo"
                        className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="empresa" className="text-sm font-medium text-foreground">
                        Nome da Empresa (Nome Fantasia)
                      </Label>
                      <Input
                        id="empresa"
                        value={profile.empresa || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, empresa: e.target.value }))}
                        onBlur={(e) => setProfile({ ...profile, empresa: formatToPascalCase(e.target.value) })}
                        placeholder="Ex: Rota Fácil Transportes"
                        className="h-11 border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                      />
                    </div>
                    {/* Campos habilitados para todos (incluindo equipe) */}
                    <div className="space-y-3">
                      <Label htmlFor="documento" className="text-sm font-medium text-foreground">
                        CPF *
                      </Label>
                      <Input
                        id="documento"
                        value={profile.cpf}
                        onChange={(e) => setProfile(prev => ({ ...prev, cpf: formatDocumento(e.target.value) }))}
                        placeholder="000.000.000-00"
                        maxLength={18}
                        className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="data_nascimento" className="text-sm font-medium text-foreground">
                        Data de Nascimento *
                      </Label>
                      <Input
                        id="data_nascimento"
                        type="date"
                        value={profile.data_nascimento}
                        onChange={(e) => setProfile(prev => ({ ...prev, data_nascimento: e.target.value }))}
                        className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="telefone" className="text-sm font-medium text-foreground">
                        Telefone / WhatsApp *
                      </Label>
                      <Input
                        id="telefone"
                        value={profile.telefone}
                        onChange={(e) => setProfile(prev => ({ ...prev, telefone: formatPhone(e.target.value) }))}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>

                  </div>
                </div>

                {/* Seção Van - Apenas para Motoristas e Monitoras */}
                {isTeam && (
                  <div className="space-y-6 pt-4 border-t">
                    <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                      <Bus className="h-5 w-5 text-primary" />
                      Van Vinculada
                    </h3>
                    <div className="space-y-3">
                      <Label htmlFor="van_id" className="text-sm font-medium text-foreground">
                        Selecione sua Van
                      </Label>
                      <select
                        id="van_id"
                        value={vanId}
                        onChange={(e) => setVanId(e.target.value)}
                        className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      >
                        <option value="">Nenhuma van</option>
                        {vans.map(van => (
                          <option key={van.id} value={van.id}>{van.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-6 pt-4 border-t">
                  <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Endereço Completo
                  </h3>
                  <div className="grid gap-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-3">
                        <Label htmlFor="endereco_cep" className="text-sm font-medium text-foreground">
                          CEP *
                        </Label>
                        <Input
                          id="endereco_cep"
                          value={profile.endereco_cep}
                          onChange={(e) => setProfile({ ...profile, endereco_cep: e.target.value })}
                          onBlur={async (e) => {
                            const cep = e.target.value.replace(/\D/g, '');
                            if (cep.length === 8) {
                              try {
                                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                                const data = await response.json();
                                if (!data.erro) {
                                  setProfile(prev => ({
                                    ...prev,
                                    endereco_rua: data.logradouro,
                                    endereco_bairro: data.bairro,
                                    endereco_cidade: data.localidade,
                                    endereco_estado: data.uf
                                  }));
                                }
                              } catch (error) {
                                console.error('Erro ao buscar CEP:', error);
                              }
                            }
                          }}
                          placeholder="00000-000"
                          maxLength={9}
                          className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="endereco_rua" className="text-sm font-medium text-foreground">
                          Rua/Logradouro *
                        </Label>
                        <Input
                          id="endereco_rua"
                          value={profile.endereco_rua}
                          onChange={(e) => setProfile(prev => ({ ...prev, endereco_rua: e.target.value }))}
                          onBlur={(e) => setProfile({ ...profile, endereco_rua: formatToPascalCase(e.target.value) })}
                          placeholder="Nome da rua"
                          className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4">
                      <div className="space-y-3">
                        <Label htmlFor="endereco_numero" className="text-sm font-medium text-foreground">
                          Número *
                        </Label>
                        <Input
                          id="endereco_numero"
                          value={profile.endereco_numero}
                          onChange={(e) => setProfile({ ...profile, endereco_numero: e.target.value })}
                          placeholder="Nº"
                          className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="endereco_bairro" className="text-sm font-medium text-foreground">
                          Bairro *
                        </Label>
                        <Input
                          id="endereco_bairro"
                          value={profile.endereco_bairro}
                          onChange={(e) => setProfile(prev => ({ ...prev, endereco_bairro: e.target.value }))}
                          onBlur={(e) => setProfile({ ...profile, endereco_bairro: formatToPascalCase(e.target.value) })}
                          placeholder="Nome do bairro"
                          className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="endereco_cidade" className="text-sm font-medium text-foreground">
                          Cidade *
                        </Label>
                        <Input
                          id="endereco_cidade"
                          value={profile.endereco_cidade}
                          onChange={(e) => setProfile(prev => ({ ...prev, endereco_cidade: e.target.value }))}
                          onBlur={(e) => setProfile({ ...profile, endereco_cidade: formatToPascalCase(e.target.value) })}
                          placeholder="Nome da cidade"
                          className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="endereco_estado" className="text-sm font-medium text-foreground">
                          Estado *
                        </Label>
                        <select
                          id="endereco_estado"
                          value={profile.endereco_estado}
                          onChange={(e) => setProfile(prev => ({ ...prev, endereco_estado: e.target.value }))}
                          className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        >
                          <option value="">Selecione o estado</option>
                          {estados.map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rede e Afiliação */}
                {!isTeam && (
                  <div className="space-y-6 pt-4 border-t">
                    <h3 className="font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Rede e Afiliação
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="mmn_id" className="text-sm font-medium text-foreground">
                          Seu ID na Rede (MMN ID) *
                        </Label>
                        <Input
                          id="mmn_id"
                          value={profile.mmn_id || ''}
                          onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                            setProfile(prev => ({ ...prev, mmn_id: val }));
                          }}
                          placeholder="Seu código único"
                          className="h-11 border-gold/30 focus:border-gold transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="sponsor_id" className="text-sm font-medium text-foreground opacity-50">
                          ID do Patrocinador (Sponsor ID)
                        </Label>
                        <Input
                          id="sponsor_id"
                          value={profile.sponsor_id || ''}
                          disabled
                          placeholder="Patrocinador vinculado"
                          className="h-11 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Botão Salvar */}
                <div className="flex justify-end pt-8 border-t border-gold/20">
                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="w-full md:w-auto gap-2 bg-gold hover:bg-gold/90 text-black px-10 py-4 h-auto text-sm md:text-lg font-black shadow-gold hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                  >
                    <Save className="h-5 w-5" />
                    {saving ? 'Gravando...' : 'Salvar Perfil'}
                  </Button>
                </div>

                {/* Aviso - Perfil Incompleto */}
                {!profile.perfil_completo && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-400 rounded-lg p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="bg-yellow-100 dark:bg-yellow-900/50 rounded-full p-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 text-lg mb-2">
                          Complete seu perfil para desbloquear recursos
                        </h4>
                        <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed">
                          Preencha todos os campos obrigatórios (*) para ter acesso completo ao RotaFácil,
                          incluindo a possibilidade de fazer <Link to="/upgrade" className="underline font-medium hover:text-yellow-600 dark:hover:text-yellow-200">upgrade para o plano premium</Link> e desbloquear
                          todas as funcionalidades avançadas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Avatar */}
          <TabsContent value="avatar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-500" />
                  Foto do Perfil
                </CardTitle>
                <CardDescription>
                  Adicione uma foto para personalizar seu perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col items-center space-y-6">
                  {/* Avatar atual */}
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                      <AvatarImage src={profile.avatar_url} alt="Avatar" />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {profile.nome_completo?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Indicador de upload */}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Informações sobre upload */}
                  <div className="text-center space-y-2">
                    <p className="text-foreground font-medium">
                      {profile.avatar_url ? 'Alterar foto do perfil' : 'Adicionar foto do perfil'}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      A imagem será redimensionada automaticamente para 400x400px para economizar espaço
                    </p>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploadingAvatar ? 'Enviando...' : 'Escolher Arquivo'}
                    </Button>

                    {profile.avatar_url && (
                      <Button
                        variant="outline"
                        onClick={async () => {
                          setProfile(prev => ({ ...prev, avatar_url: '' }));
                          // Também remover do banco
                          const { data: { user } } = await supabase.auth.getUser();
                          if (user) {
                            await supabase
                              .from('user_profiles')
                              .update({ avatar_url: null })
                              .eq('user_id', user.id);
                          }
                        }}
                        className="gap-2"
                      >
                        Remover Foto
                      </Button>
                    )}
                  </div>

                  {/* Input de arquivo oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />

                  {/* Dicas de upload */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md">
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">💡 Dicas para melhor resultado:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                      <li>• Use imagens quadradas (1:1)</li>
                      <li>• Prefira fotos com boa iluminação</li>
                      <li>• Evite imagens muito pequenas ou borradas</li>
                      <li>• Formatos aceitos: JPG, PNG, WebP</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Integração */}
          <TabsContent value="integracao">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                  Integração Pagamentos
                </CardTitle>
                <CardDescription>
                  Configure suas chaves de API para receber pagamentos diretamente em sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Importante:</strong> Ao configurar sua chave do MercadoPago, todos os Pix gerados para seus alunos cairão diretamente na sua conta bancária vinculada.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="mp_public_key">MercadoPago Public Key</Label>
                        <div className="relative">
                          <Input
                            id="mp_public_key"
                            value={profile.mercadopago_public_key || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, mercadopago_public_key: e.target.value }))}
                            placeholder="APP_USR-..."
                            className="pr-10"
                          />
                          <Key className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mp_token">MercadoPago Access Token</Label>
                        <div className="relative">
                          <Input
                            id="mp_token"
                            type="password"
                            value={profile.mercadopago_access_token || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, mercadopago_access_token: e.target.value }))}
                            placeholder="APP_USR-..."
                            className="pr-10"
                          />
                          <Key className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Obtenha suas chaves no portal <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">MercadoPago Developers</a>.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                      <Button
                        onClick={saveProfile}
                        disabled={saving}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Salvar Chaves
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          if (!profile.mercadopago_access_token) {
                            toast({
                              title: "Atenção",
                              description: "Informe o Access Token para testar.",
                              variant: "destructive"
                            });
                            return;
                          }

                          setSaving(true);
                          try {
                            const { data, error } = await supabase.functions.invoke('mercado-pago-test', {
                              body: { accessToken: profile.mercadopago_access_token }
                            });

                            if (error) throw error;

                            if (data.success) {
                              toast({
                                title: "✅ Conexão Ativa!",
                                description: `Conta: ${data.user.email} (${data.user.site_id}). Pix: ${data.pix.available ? 'Disponível' : 'Indisponível'}`,
                              });
                            } else {
                              toast({
                                title: "❌ Erro na Conexão",
                                description: `${data.error} (Passo: ${data.step})`,
                                variant: "destructive"
                              });
                            }
                          } catch (err: any) {
                            toast({
                              title: "Erro ao testar",
                              description: err.message,
                              variant: "destructive"
                            });
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={saving}
                        className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <RefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                        Testar Conexão
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-dashed">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Scale className="h-5 w-5 text-blue-500" />
                      Configuração de Juros por Atraso
                    </h4>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Tipo de Cobrança de Juros</Label>
                        <div className="flex gap-4 p-1 bg-muted rounded-lg w-fit">
                          <Button
                            variant={profile.juros_tipo === 'valor' ? 'default' : 'ghost'}
                            size="sm"
                            type="button"
                            onClick={() => setProfile(prev => ({ ...prev, juros_tipo: 'valor' }))}
                            className="px-6"
                          >
                            Valor Fixo (R$)
                          </Button>
                          <Button
                            variant={profile.juros_tipo === 'percentual' ? 'default' : 'ghost'}
                            size="sm"
                            type="button"
                            onClick={() => setProfile(prev => ({ ...prev, juros_tipo: 'percentual' }))}
                            className="px-6"
                          >
                            Percentual (%)
                          </Button>
                        </div>
                      </div>

                      {profile.juros_tipo === 'valor' ? (
                        <div className="grid gap-4 md:grid-cols-2 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                          <div className="space-y-2">
                            <Label htmlFor="multa_fixa">Multa Fixa (R$)</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                              <Input
                                id="multa_fixa"
                                type="number"
                                value={profile.juros_valor_multa || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, juros_valor_multa: Number(e.target.value) }))}
                                className="pl-9"
                                placeholder="10.00"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">Valor cobrado uma única vez após o vencimento.</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="juros_dia">Juros por Dia (R$)</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                              <Input
                                id="juros_dia"
                                type="number"
                                value={profile.juros_valor_dia || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, juros_valor_dia: Number(e.target.value) }))}
                                className="pl-9"
                                placeholder="2.00"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">Valor somado diariamente após o vencimento.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2 bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                          <div className="space-y-2">
                            <Label htmlFor="multa_perc">Multa (%)</Label>
                            <div className="relative">
                              <Input
                                id="multa_perc"
                                type="number"
                                value={profile.juros_percentual_multa || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, juros_percentual_multa: Number(e.target.value) }))}
                                className="pr-9"
                                placeholder="2.00"
                              />
                              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Percentual sobre o valor total (limitado por lei).</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="juros_mes">Juros ao Mês (%)</Label>
                            <div className="relative">
                              <Input
                                id="juros_mes"
                                type="number"
                                value={profile.juros_percentual_mes || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, juros_percentual_mes: Number(e.target.value) }))}
                                className="pr-9"
                                placeholder="1.00"
                              />
                              <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Percentual de juros mora simples ao mês.</p>
                          </div>
                        </div>
                      )}

                      <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <strong>Dica Legal:</strong> Segundo o Código de Defesa do Consumidor, a multa por atraso é limitada a <strong>2%</strong>. Os juros de mora costumam ser de <strong>1% ao mês</strong>. Verifique a legislação vigente.
                        </div>
                      </div>

                      <Button
                        onClick={saveProfile}
                        disabled={saving}
                        className="gap-2 w-full md:w-auto mt-2"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? 'Salvando...' : 'Salvar Configurações'}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 border-t pt-6">
                    <h4 className="font-semibold mb-4">Como obter sua chave:</h4>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                      <li>Acesse o <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Painel do Desenvolvedor</a> do MercadoPago.</li>
                      <li>Vá em <strong>Suas Aplicações</strong> e selecione sua aplicação (ou crie uma nova).</li>
                      <li>No menu lateral, clique em <strong>Credenciais de Produção</strong>.</li>
                      <li>Copie o campo <strong>Access Token</strong> e cole aqui.</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro">
            <Card className="bg-black-secondary border-sidebar-border shadow-elegant">
              <CardHeader className="border-b border-sidebar-border/50">
                <CardTitle className="flex items-center gap-2 text-gold uppercase tracking-tight italic font-black">
                  <CreditCard className="h-5 w-5" />
                  Portal Financeiro da Equipe
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                  Gestão de recebimentos, PIX e histórico de pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 md:space-y-8 p-4 md:p-8">
                {/* Dados Bancários */}
                <div className="bg-gray-800/20 rounded-xl p-6 border border-gold/10">
                  <h3 className="font-semibold text-gold text-lg mb-6 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Dados para Recebimento (PIX)
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-300">Tipo de Chave PIX</Label>
                      <select
                        value={profile.pix_type}
                        onChange={(e) => setProfile(prev => ({ ...prev, pix_type: e.target.value }))}
                        className="w-full bg-black-primary border-sidebar-border text-white h-11 rounded-md px-3 border border-gold/20 focus:border-gold transition-all"
                      >
                        <option value="">Selecione...</option>
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="email">E-mail</option>
                        <option value="celular">Celular</option>
                        <option value="aleatoria">Chave Aleatória</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-300">Chave PIX</Label>
                      <Input
                        value={profile.pix_key}
                        onChange={(e) => setProfile(prev => ({ ...prev, pix_key: e.target.value }))}
                        placeholder="Insira sua chave PIX aqui"
                        className="bg-black-primary border-gold/20 text-white h-11"
                      />
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gold/5 rounded-lg border border-gold/10">
                    <div className="flex items-center gap-3">
                      <Scale className="h-5 w-5 text-gold" />
                      <div>
                        <p className="text-sm font-bold text-gold uppercase tracking-tight text-xs">Salário Base Cadastrado</p>
                        <p className="text-xl font-black text-white italic">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(profile.salario_base || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Histórico de Pagamentos */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground text-lg mb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Histórico de Pagamentos
                  </h3>
                  <div className="border border-gold/10 rounded-xl overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[500px]">
                      <thead className="bg-black-lighter text-[9px] uppercase font-black tracking-widest text-gold/60 border-b border-gold/10">
                        <tr>
                          <th className="px-4 py-3">Mês/Ano</th>
                          <th className="px-4 py-3">Valor</th>
                          <th className="px-4 py-3">Data Pagto</th>
                          <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gold/5 italic">
                          <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground uppercase text-[10px] font-bold">
                            Nenhum pagamento registrado ainda.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="senha">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-500" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription>
                  Gerencie a segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Informações atuais */}
                  <div className="bg-gray-800/30 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-600/30 dark:border-gray-700">
                    <h3 className="font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Dados de Acesso
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-300 dark:text-gray-200">
                          E-mail de Login
                        </Label>
                        <Input
                          value={userEmail}
                          disabled
                          className="bg-gray-700/30 dark:bg-gray-800/50 border-gray-500/40 dark:border-gray-600/50 text-gray-200 dark:text-gray-100 h-11 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-300 dark:text-gray-200">
                          Status da Conta
                        </Label>
                        <div className="flex items-center gap-3 h-11">
                          <Badge
                            variant="secondary"
                            className="px-4 py-2 text-sm font-medium bg-green-900/40 text-green-300 border-green-600/50"
                          >
                            Verificada
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alterar Senha */}
                  <div className="space-y-6">
                    <h3 className="font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Alterar Senha
                    </h3>
                    <div className="bg-gray-800/30 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-600/30 dark:border-gray-700">
                      <div className="grid gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="current-password" className="text-sm font-medium text-gray-300 dark:text-gray-200">
                            Senha Atual *
                          </Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Digite sua senha atual"
                            className="bg-gray-700/30 dark:bg-gray-800/50 border-gray-500/40 dark:border-gray-600/50 text-gray-200 dark:text-gray-100 h-11"
                          />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-3">
                            <Label htmlFor="new-password" className="text-sm font-medium text-gray-300 dark:text-gray-200">
                              Nova Senha *
                            </Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Digite a nova senha"
                              className="bg-gray-700/30 dark:bg-gray-800/50 border-gray-500/40 dark:border-gray-600/50 text-gray-200 dark:text-gray-100 h-11"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-300 dark:text-gray-200">
                              Confirmar Nova Senha *
                            </Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirme a nova senha"
                              className="bg-gray-700/30 dark:bg-gray-800/50 border-gray-500/40 dark:border-gray-600/50 text-gray-200 dark:text-gray-100 h-11"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={handlePasswordChange}
                          disabled={changingPassword}
                          className="w-full md:w-auto gap-2 bg-gold hover:bg-gold/90 text-black px-10 py-4 h-auto text-sm md:text-lg font-black shadow-gold hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                        >
                          <Shield className="h-5 w-5" />
                          {changingPassword ? 'Gravando...' : 'Alterar Senha'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Opção alternativa - Reset por email */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground text-lg mb-2 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Esqueceu a Senha?
                    </h3>
                    <div className="bg-gray-800/30 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-600/30 dark:border-gray-700">
                      <p className="text-gray-300 dark:text-gray-200 mb-4">
                        Se você esqueceu sua senha atual, enviaremos um email com instruções para redefinir.
                      </p>
                      <Button
                        onClick={handlePasswordReset}
                        disabled={resettingPassword}
                        variant="outline"
                        className="gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        {resettingPassword ? 'Enviando...' : 'Enviar Email de Reset'}
                      </Button>
                    </div>
                  </div>

                  {/* Dicas de segurança */}
                  <div className="bg-gray-800/30 dark:bg-gray-900/50 border border-gray-600/30 dark:border-gray-700 rounded-xl p-6">
                    <h4 className="font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Dicas de Segurança
                    </h4>
                    <ul className="text-sm text-gray-300 dark:text-gray-200 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        Use uma senha forte com pelo menos 8 caracteres
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        Combine letras maiúsculas, minúsculas, números e símbolos
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        Não compartilhe suas credenciais com terceiros
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        Faça logout em dispositivos compartilhados
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DynamicLayout>
  );
}