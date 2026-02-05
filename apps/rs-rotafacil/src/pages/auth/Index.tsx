import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Shield, Eye, EyeOff, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Link } from "react-router-dom";

const authSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

interface AuthPageProps {
  restrictedTo?: 'consultor';
}

const ConsultorLoginPage = ({ restrictedTo }: AuthPageProps) => {
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

    // Verificar se usuário já está logado e redirecionar
    const checkUserAndRedirect = async (session: any) => {
      if (!session || !mounted) return;

      const user = session.user;
      const metadata = user.user_metadata || {};
      const userType = metadata.user_type || 'usuario';
      const tipoUsuario = metadata.tipo_usuario;

      if (!mounted) return;

      const effectiveRole = tipoUsuario || userType;

      // DEBUG
      console.log('Auth Check:', { restrictedTo, userType, tipoUsuario, effectiveRole });

      // Converte para minúsculo para garantir comparação segura
      const roleLower = (effectiveRole || '').toLowerCase();



      if (restrictedTo === 'consultor') {
        console.log("Contexto Escritório do Dono detectado. Redirecionando para área de indicações...");
        navigate("/consultor/indicacao");
        return;
      }

      if (roleLower === 'admin' || roleLower === 'master' || userType === 'master' || roleLower === 'owner') {
        console.log("Contexto Geral: Admin/Master/Owner detectado.");
        // Destino padrão se não for restrito
        if (roleLower === 'owner') {
          navigate("/painel");
        } else {
          navigate("/admin");
        }
      } else if (roleLower === 'consultor') {
        navigate("/consultor/indicacao");
      } else if (roleLower === 'motorista') {
        if (restrictedTo === 'consultor') {
          await supabase.auth.signOut();
          setError("Motoristas devem usar o login geral.");
          return;
        }
        navigate("/motorista");
      } else if (roleLower === 'monitora') {
        if (restrictedTo === 'consultor') {
          await supabase.auth.signOut();
          setError("Monitoras devem usar o login geral.");
          return;
        }
        navigate("/monitora");
      } else if (roleLower === 'responsavel') {
        if (restrictedTo === 'consultor') {
          await supabase.auth.signOut();
          setError("Responsáveis devem usar o login geral.");
          return;
        }
        navigate("/responsavel");
      } else {
        if (restrictedTo === 'consultor') {
          // Fallback para qualquer outro que possa ser consultor (ex: suporte)
          navigate("/consultor/indicacao");
          return;
        }
        navigate("/painel");
      }
    };



    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) checkUserAndRedirect(session);
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && event === 'SIGNED_IN' && session) {
        checkUserAndRedirect(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, restrictedTo]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const validation = authSchema.parse({ email, password });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validation.email,
        password: validation.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Confirme seu email antes de fazer login");
        } else {
          setError(error.message);
        }
        return;
      }

      // VERIFICACAO POS-LOGIN IMEDIATA
      if (data.session) {
        const user = data.session.user;
        const metadata = user.user_metadata || {};
        const userType = (metadata.tipo_usuario || metadata.user_type || 'usuario').toLowerCase();

        if (restrictedTo === 'consultor') {
          const allowedRoles = ['consultor', 'owner', 'master', 'admin'];
          if (!allowedRoles.includes(userType)) {
            console.warn("Bloqueando login pós-submit: role incorreto", userType);
            await supabase.auth.signOut();
            setError("Acesso Negado: Esta área é exclusiva para Consultores e Parceiros (Owners/Masters).");
            setIsLoading(false);
            return;
          }
        }
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
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
        description: `Enviamos um link de recuperação para ${email}. Verifique também sua caixa de spam.`,
      });
      setError("");
    } catch (error: any) {
      console.error("Erro no Reset de Senha:", error);
      setError(error.message || "Falha ao enviar e-mail de recuperação");
      toast({
        title: "Erro no Reset",
        description: error.message,
        variant: "destructive"
      });
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
          emailRedirectTo: `${window.location.origin}/auth`,
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
            className="text-muted-foreground hover:text-gold uppercase text-xs font-bold tracking-widest flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Início
          </Button>
        </div>

        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt={branding.company_name} className="h-14 md:h-20 object-contain shadow-lg rounded-lg" />
            ) : (
              <img src="/logo-rotafacil.png" alt="RotaFácil" className="h-14 md:h-20 object-contain" />
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gold uppercase tracking-tighter italic">{branding.company_name || "RS Prólipsi"}</h1>
          <p className="text-muted-foreground uppercase text-xs tracking-widest font-bold">
            Portal de Acesso
          </p>
        </div>

        <Card className="bg-black-secondary border-gold/20 shadow-shadow-elegant">
          <CardHeader className="space-y-1 p-6 md:p-8">
            <CardTitle className="text-2xl md:text-3xl text-center text-gold font-black uppercase tracking-tighter">
              Identifique-se
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground uppercase text-[10px] md:text-xs tracking-widest font-bold">
              Identifique-se para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-0 md:pt-0">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black-primary border-gold/20 focus:border-gold transition-all"
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
                    className="pl-10 pr-10 bg-black-primary border-gold/20 focus:border-gold transition-all"
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

                  {(error.toLowerCase().includes("confirme") || error.toLowerCase().includes("confirm")) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      className="w-full border-gold/50 text-gold hover:bg-gold/10 uppercase text-[10px] font-black tracking-widest gap-2 py-4 h-auto mt-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reenviar E-mail de Confirmação
                    </Button>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-black-primary font-black uppercase tracking-widest shadow-gold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>


        <p className="text-center text-sm text-muted-foreground mt-6">
          Portal do Consultor - Acesso Seguro
        </p>
      </div>
    </div>
  );
};

export default ConsultorLoginPage;