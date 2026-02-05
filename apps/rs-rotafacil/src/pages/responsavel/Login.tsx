import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Baby, ArrowLeft, Shield } from "lucide-react";

export default function ResponsavelLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [branding, setBranding] = useState({ logo_url: "", company_name: "" });
    const navigate = useNavigate();
    const { toast } = useToast();

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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        console.log('[FamiliaLogin] Tentando login com:', trimmedEmail);

        try {
            // Fazer logout primeiro para limpar qualquer sessão existente
            await supabase.auth.signOut();

            const { data, error } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password: trimmedPassword,
            });

            if (error) {
                console.error('[FamiliaLogin] Erro de autenticação:', error);
                throw error;
            }

            if (!data.user) throw new Error("Usuário não encontrado após login");

            // Permitir qualquer usuário que tenha filhos vinculados, independente da role
            const { data: hasKids, error: vinculoError } = await supabase
                .rpc('check_user_has_students', { p_user_id: data.user.id });

            console.log('[FamiliaLogin] Tem filhos?', hasKids, 'Erro:', vinculoError);

            if (vinculoError) {
                console.error('[FamiliaLogin] Erro ao verificar vínculos:', vinculoError);
                // Se der erro no RPC, tentamos uma busca direta via SELECT (fallback de segurança)
                const { data: directCheck } = await supabase
                    .from('responsavel_alunos')
                    .select('id')
                    .eq('responsavel_id', data.user.id)
                    .limit(1);

                if (!directCheck || directCheck.length === 0) {
                    // Check if there is an aluno with this email that hasn't been linked yet
                    const { data: studentMatch } = await supabase
                        .from('alunos')
                        .select('id')
                        .eq('email', trimmedEmail)
                        .limit(1);

                    if (!studentMatch || studentMatch.length === 0) {
                        await supabase.auth.signOut();
                        toast({
                            title: "Acesso Negado",
                            description: "Você não possui filhos cadastrados ou vinculados à sua conta. Entre em contato com o transporte escolar.",
                            variant: "destructive",
                        });
                        setLoading(false);
                        return;
                    }
                }
            } else if (!hasKids) {
                // Check if there is an aluno with this email that hasn't been linked yet (manual fallback)
                const { data: studentMatch } = await supabase
                    .from('alunos')
                    .select('id')
                    .eq('email', trimmedEmail)
                    .limit(1);

                if (!studentMatch || studentMatch.length === 0) {
                    await supabase.auth.signOut();
                    toast({
                        title: "Acesso Negado",
                        description: "Você não possui filhos cadastrados no sistema. Verifique se o e-mail está correto.",
                        variant: "destructive",
                    });
                    setLoading(false);
                    return;
                }
            }

            toast({
                title: "Bem-vindo(a)!",
                description: "Login realizado com sucesso.",
            });

            navigate("/responsavel");
        } catch (error: any) {
            console.error("[FamiliaLogin] Erro completo:", error);
            toast({
                title: "Erro de Login",
                description: error.message || "Email ou senha incorretos.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: "Email necessário",
                description: "Digite seu email para receber o link de recuperação.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            toast({
                title: "Email enviado!",
                description: "Verifique sua caixa de entrada para redefinir sua senha.",
            });

            setShowForgotPassword(false);
        } catch (error: any) {
            console.error("Erro ao enviar email:", error);
            toast({
                title: "Erro",
                description: error.message || "Não foi possível enviar o email de recuperação.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        {branding.logo_url ? (
                            <img src={branding.logo_url} alt={branding.company_name || "Logo"} className="h-20 object-contain" />
                        ) : (
                            <img src="/logo-rotafacil.png" alt="RotaFácil" className="h-20 object-contain" />
                        )}
                    </div>
                    <h1 className="text-2xl font-black text-white">Área da Família</h1>
                    <p className="text-muted-foreground mt-1">Acompanhe seu filho no transporte escolar</p>
                </div>

                <Card className="bg-zinc-900/50 border-gold/20 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">
                            {showForgotPassword ? "Recuperar Senha" : "Entrar"}
                        </CardTitle>
                        <CardDescription>
                            {showForgotPassword
                                ? "Digite seu email para receber o link de recuperação."
                                : "Use o email e senha informados no cadastro do seu filho."}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={showForgotPassword ? handleForgotPassword : handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                                />
                            </div>
                            {!showForgotPassword && (
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-white">Senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-gold to-yellow-600 text-black font-bold hover:from-yellow-500 hover:to-yellow-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {showForgotPassword ? "Enviando..." : "Entrando..."}
                                    </>
                                ) : (
                                    showForgotPassword ? "Enviar Email" : "Entrar"
                                )}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(!showForgotPassword)}
                                className="text-sm text-gold hover:text-yellow-500 transition-colors"
                            >
                                {showForgotPassword ? "Voltar para o login" : "Esqueci minha senha"}
                            </button>

                            <Link
                                to="/"
                                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar para o site
                            </Link>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Não tem acesso? Entre em contato com o transporte escolar do seu filho.
                </p>
            </div>
        </div>
    );
}
