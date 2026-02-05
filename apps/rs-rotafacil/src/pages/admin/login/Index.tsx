import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Shield, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [branding, setBranding] = useState({ logo_url: "", company_name: "" });

  useEffect(() => {
    const loadBranding = async () => {
      // Limpar modo demo ao acessar login administrativo
      localStorage.removeItem('rs_demo_mode');

      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'branding')
        .maybeSingle();

      if (data?.value) {
        setBranding(data.value as any);
      }
    };
    loadBranding();
  }, []);

  useEffect(() => {
    let mounted = true;

    // Verificar se admin já está logado
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted || !session) return;

        // Verificar se é admin
        const { data: adminEmails, error } = await supabase
          .from('admin_emails')
          .select('email')
          .eq('email', session.user.email);

        if (!mounted) return;

        if (!error && adminEmails && adminEmails.length > 0) {
          navigate("/admin");
        } else {
          // Se não for admin, redirecionar para app normal
          navigate("/app");
        }
      } catch (err) {
        console.error("Error checking admin:", err);
      }
    };

    checkAdmin();
    return () => { mounted = false; };
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const validation = authSchema.parse({ email, password });

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: validation.email,
        password: validation.password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Confirme seu email antes de fazer login");
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
        return;
      }

      // Verificar se é admin
      const { data: adminEmails, error: adminError } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('email', validation.email);

      if (adminError || !adminEmails || adminEmails.length === 0) {
        setError("Acesso negado. Você não tem permissão para acessar o painel administrativo.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login administrativo realizado!",
        description: "Redirecionando para o painel admin...",
      });

      navigate("/admin");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Digite seu e-mail para recuperar a senha");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast({
        title: "E-mail enviado",
        description: "Link de recuperação enviado para " + email,
      });
      setError("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError("Digite seu e-mail para reenviar a confirmação");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`,
        },
      });
      if (error) throw error;
      toast({
        title: "Confirmação enviada",
        description: "O e-mail de confirmação foi reenviado com sucesso.",
      });
      setError("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-primary flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-gold opacity-[0.02] pointer-events-none" />
      <div className="w-full max-w-md">
        {/* Botão voltar */}
        <div className="text-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-gold"
          >
            ← Voltar para página inicial
          </Button>
        </div>

        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt={branding.company_name} className="h-16 object-contain" />
            ) : (
              <Shield className="h-12 w-12 text-gold" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gold">{branding.company_name}</h1>
          <p className="text-muted-foreground">Painel Administrativo</p>
        </div>

        <Card className="border-gold/20 bg-black-secondary">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl text-center text-gold font-black uppercase tracking-tighter">Acesso Restrito</CardTitle>
            <CardDescription className="text-center text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
              Painel Administrativo {branding.company_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black-primary border-gold/20"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-black-primary border-gold/20"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-gold transition-colors py-1"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </div>

              {error && (
                <div className="space-y-3">
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive text-xs uppercase font-bold text-center">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>

                  {error.toLowerCase().includes("confirme") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      className="w-full border-gold/50 text-gold hover:bg-gold/10 uppercase text-[10px] font-black tracking-widest gap-2 py-4 h-auto"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reenviar E-mail de Confirmação
                    </Button>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/80 text-black-primary font-bold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Acessar Painel Admin"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          🔒 Painel de Administração - Acesso Ultra Restrito
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;