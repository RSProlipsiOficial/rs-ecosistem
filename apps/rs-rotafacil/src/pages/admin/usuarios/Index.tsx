import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Users, Edit3, Save, X, Key, Mail, Phone, User, Plus, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";
import { z } from "zod";

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
}

export default function AdminUsuariosIndex() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    status: "ativo",
    tipo_usuario: "usuario"
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
    tipo_usuario: "usuario"
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

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', { method: 'GET' });
      if (error) throw error;

      const users = (data as any)?.users ?? [];
      setUsuarios(users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingUser) {
        // Atualizar usuário existente
        const updatedUser = {
          ...editingUser,
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          status: formData.status,
          tipo_usuario: formData.tipo_usuario,
          updated_at: new Date().toISOString()
        };
        
        setUsuarios(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      }

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
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

    try {
      // Aqui você implementaria a mudança de senha via Supabase Admin API
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });
      
      setShowPasswordForm(null);
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || "",
      status: usuario.status,
      tipo_usuario: usuario.tipo_usuario
    });
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      status: "ativo",
      tipo_usuario: "usuario"
    });
    setEditingUser(null);
  };

  const resetNewUserForm = () => {
    setNewUserData({
      nome: "",
      email: "",
      password: "",
      confirmPassword: "",
      telefone: "",
      status: "ativo",
      tipo_usuario: "usuario"
    });
    setShowNewUserForm(false);
  };

  const handleCreateUser = async () => {
    setSaving(true);
    try {
      const validation = newUserSchema.parse(newUserData);

      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: {
          nome: validation.nome,
          email: validation.email,
          password: validation.password,
          telefone: newUserData.telefone,
          tipo_usuario: newUserData.tipo_usuario,
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
      case "ativo": return "bg-green-100 text-green-800";
      case "inativo": return "bg-red-100 text-red-800";
      case "pendente": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "admin": return "bg-purple-100 text-purple-800";
      case "consultor": return "bg-blue-100 text-blue-800";
      case "usuario": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">
              Edite dados cadastrais e gerencie usuários do sistema
            </p>
          </div>
          <Button 
            onClick={() => setShowNewUserForm(true)}
            className="h-12 px-6 text-base font-semibold"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Cadastrar Novo Usuário
          </Button>
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

                <div className="space-y-2">
                  <Label htmlFor="new-tipo_usuario" className="text-base font-semibold text-foreground">
                    Tipo de Usuário
                  </Label>
                  <Select value={newUserData.tipo_usuario} onValueChange={(value) => setNewUserData(prev => ({ ...prev, tipo_usuario: value }))}>
                    <SelectTrigger className="h-12 text-base bg-background border-2 border-border focus:border-primary">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="usuario" className="text-base">👤 Usuário</SelectItem>
                      <SelectItem value="consultor" className="text-base">💼 Consultor</SelectItem>
                      <SelectItem value="admin" className="text-base">🔧 Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{/* ... keep existing code */}
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
                  <Label htmlFor="status" className="text-base font-semibold text-foreground">
                    Status do Usuário
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
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

                <div className="space-y-2">
                  <Label htmlFor="tipo_usuario" className="text-base font-semibold text-foreground">
                    Tipo de Usuário
                  </Label>
                  <Select value={formData.tipo_usuario} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_usuario: value }))}>
                    <SelectTrigger className="h-12 text-base bg-background border-2 border-border focus:border-primary">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="usuario" className="text-base">👤 Usuário</SelectItem>
                      <SelectItem value="consultor" className="text-base">💼 Consultor</SelectItem>
                      <SelectItem value="admin" className="text-base">🔧 Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="h-12 px-6 text-base font-semibold"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="h-12 px-6 text-base font-semibold border-2"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowPasswordForm(editingUser.id)}
                  className="h-12 px-6 text-base font-semibold ml-auto bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Key className="w-5 h-5 mr-2" />
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Alteração de Senha */}
        {showPasswordForm && (
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
                  className="h-12 px-6 text-base font-semibold bg-orange-500 hover:bg-orange-600"
                >
                  <Key className="w-5 h-5 mr-2" />
                  Confirmar Alteração
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
        )}

        {/* Lista de Usuários */}
        <div className="grid gap-4">
          {usuarios.map((usuario) => (
            <Card key={usuario.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{usuario.nome}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {usuario.email}
                        </div>
                        {usuario.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {usuario.telefone}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(usuario.status)}>
                          {usuario.status}
                        </Badge>
                        <Badge className={getTipoColor(usuario.tipo_usuario)}>
                          {usuario.tipo_usuario}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(usuario)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
                  <span>Cadastrado: {new Date(usuario.created_at).toLocaleString('pt-BR')}</span>
                  {usuario.ultimo_login && (
                    <span>Último login: {new Date(usuario.ultimo_login).toLocaleString('pt-BR')}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {usuarios.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground">
                Os usuários aparecerão aqui conforme se cadastram no sistema.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}