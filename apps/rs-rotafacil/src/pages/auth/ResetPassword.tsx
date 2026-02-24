import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [branding, setBranding] = useState<{ logo_url?: string; company_name: string }>(() => {
        const cached = localStorage.getItem('app_branding');
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) { }
        }
        return { logo_url: "", company_name: "" };
    });
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
                const brandingData = data.value as any;
                setBranding(brandingData);
                localStorage.setItem('app_branding', JSON.stringify(brandingData));
            }
        };
        loadBranding();
    }, []);

    useEffect(() => {
        // Verificar se o usuário está logado (o Supabase loga automaticamente ao clicar no link de reset)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast({
                    title: "Sessão expirada",
                    description: "O link de recuperação pode ter expirado. Tente novamente.",
                    variant: "destructive",
                });
                navigate("/auth");
            }
        };
        checkSession();
    }, [navigate]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }
        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            toast({
                title: "Senha atualizada!",
                description: "Sua nova senha foi definida com sucesso.",
            });

            // Deslogar após mudar a senha para forçar novo login limpo
            await supabase.auth.signOut();
            navigate("/auth");
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black-primary flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-gold opacity-[0.02] pointer-events-none" />
            <div className="w-full max-w-md text-white">
                <div className="text-center mb-8">
                    <img
                        src={branding.logo_url || "/logo-rotafacil.png"}
                        alt={branding.company_name || "RotaFácil"}
                        className="h-20 mx-auto mb-4 object-contain"
                    />
                    <h1 className="text-3xl font-black text-gold uppercase tracking-tighter italic">
                        {branding.company_name || "RS Prólipsi"}
                    </h1>
                    <p className="text-muted-foreground uppercase text-xs tracking-widest font-bold">Recuperação de Acesso</p>
                </div>

                <Card className="bg-black-secondary border-gold/20">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center text-gold font-black uppercase tracking-tighter">Nova Senha</CardTitle>
                        <CardDescription className="text-center text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                            Defina sua nova credencial de acesso
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pr-10 bg-black-primary border-gold/20 text-white placeholder:text-muted-foreground"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-white">Confirmar Nova Senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-black-primary border-gold/20 text-white"
                                    required
                                />
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-gold hover:bg-gold/90 text-black-primary font-black uppercase tracking-widest"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar Senha"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
