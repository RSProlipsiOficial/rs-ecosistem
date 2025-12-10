import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
    perfil_completo: false
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const validateCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.length === 11;
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
    }) && validateCPF(profile.cpf || '') && validateCEP(profile.endereco_cep || '');
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!isProfileComplete()) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios corretamente.",
          variant: "destructive",
        });
        return;
      }

      const profileData = {
        ...profile,
        user_id: user.id,
        perfil_completo: true
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      setProfile(prev => ({ ...prev, perfil_completo: true }));

      toast({
        title: "Sucesso!",
        description: "Seu perfil foi salvo com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o perfil. Tente novamente.",
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

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return formatted;
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
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
          </div>
          <p className="text-blue-100 text-lg mb-4">
            Gerencie seus dados pessoais, avatar e configurações de segurança.
          </p>
          
          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status do Perfil */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 cursor-pointer hover:bg-white/15 transition-colors">
              <Link to="/upgrade" className="flex items-center gap-3">
                {profile.perfil_completo ? (
                  <CheckCircle className="h-5 w-5 text-green-300" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-300" />
                )}
                <div>
                  <p className="font-medium">
                    {profile.perfil_completo ? 'Perfil Completo' : 'Perfil Incompleto'}
                  </p>
                  <p className="text-sm text-blue-200">
                    {profile.perfil_completo 
                      ? 'Todos os dados foram preenchidos' 
                      : 'Complete para fazer upgrade de plano'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Status da Assinatura */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 cursor-pointer hover:bg-white/15 transition-colors">
              <Link to="/upgrade" className="flex items-center gap-3">
                {subscription?.plan?.plan_type === 'premium' ? (
                  <Crown className="h-5 w-5 text-yellow-300" />
                ) : (
                  <Shield className="h-5 w-5 text-blue-300" />
                )}
                <div>
                  <p className="font-medium">
                    {subscription?.plan?.name || 'Plano Básico'}
                  </p>
                  <p className="text-sm text-blue-200">
                    Status: {subscription?.status === 'trial' ? 'Teste' : 
                             subscription?.status === 'active' ? 'Ativo' : 'Básico'}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Abas do Perfil */}
        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="perfil" className="gap-2">
              <User className="h-4 w-4" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="avatar" className="gap-2">
              <Camera className="h-4 w-4" />
              Foto do Perfil
            </TabsTrigger>
            <TabsTrigger value="senha" className="gap-2">
              <Key className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Aba: Dados Pessoais */}
          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Dados Pessoais
                </CardTitle>
                <CardDescription>
                  Mantenha suas informações atualizadas para uma melhor experiência
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
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
                          variant={profile.perfil_completo ? "default" : "secondary"}
                          className={`px-4 py-2 text-sm font-medium ${
                            profile.perfil_completo 
                              ? 'bg-green-900/40 text-green-300 border-green-600/50' 
                              : 'bg-yellow-900/40 text-yellow-300 border-yellow-600/50'
                          }`}
                        >
                          {profile.perfil_completo ? 'Verificada' : 'Pendente'}
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
                        placeholder="Seu nome completo"
                        className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="cpf" className="text-sm font-medium text-foreground">
                        CPF *
                      </Label>
                      <Input
                        id="cpf"
                        value={profile.cpf}
                        onChange={(e) => setProfile(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                        placeholder="000.000.000-00"
                        maxLength={14}
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
                        Telefone *
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

                {/* Endereço */}
                <div className="space-y-6">
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
                          onChange={(e) => setProfile(prev => ({ ...prev, endereco_cep: formatCEP(e.target.value) }))}
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
                          onChange={(e) => setProfile(prev => ({ ...prev, endereco_numero: e.target.value }))}
                          placeholder="123"
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

                {/* Botão Salvar */}
                <div className="flex justify-end pt-8 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    onClick={saveProfile}
                    disabled={saving}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 h-12 text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Save className="h-5 w-5" />
                    {saving ? 'Salvando...' : 'Salvar Perfil'}
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

          {/* Aba: Segurança */}
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
                          className="gap-2 w-full md:w-auto"
                        >
                          <Shield className="h-4 w-4" />
                          {changingPassword ? 'Alterando...' : 'Alterar Senha'}
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
    </MainLayout>
  );
}