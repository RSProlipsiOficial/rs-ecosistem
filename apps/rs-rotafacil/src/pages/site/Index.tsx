import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/main-layout";
import { useAdmin } from "@/hooks/useAdmin";

interface SiteConfig {
  id: string;
  site_url: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export default function SiteIndex() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .eq('ativo', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Erro ao carregar configurações do site:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as informações do site.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Carregando informações do site...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Site Principal</h1>
            <p className="text-muted-foreground">
              Informações sobre o site oficial da empresa
            </p>
          </div>
          
          {isAdmin && (
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/admin/site'}
            >
              <Lock className="w-4 h-4 mr-2" />
              Configurar Site (Admin)
            </Button>
          )}
        </div>

        {!config ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Site não configurado</h3>
              <p className="text-muted-foreground mb-4">
                O site principal ainda não foi configurado pelo administrador.
              </p>
              {isAdmin && (
                <Button onClick={() => window.location.href = '/admin/site'}>
                  <Lock className="w-4 h-4 mr-2" />
                  Configurar Agora
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {/* Preview do Site */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Preview nos Apps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Como aparecerá nos apps:</h3>
                  
                  <div className="bg-background border rounded-lg p-4 max-w-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Site Oficial</h4>
                        <p className="text-sm text-muted-foreground">
                          {config.descricao || config.site_url}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {config.site_url}
                        </p>
                      </div>
                      <Button size="sm">
                        Acessar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Site */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Site Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    URL do Site Principal
                  </h4>
                  <div className="flex items-center gap-2">
                    <p className="text-sm bg-muted px-3 py-2 rounded flex-1">
                      {config.site_url}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(config.site_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este é o link que aparecerá nos apps dos clientes
                  </p>
                </div>

                {config.descricao && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      Descrição
                    </h4>
                    <p className="text-sm bg-muted px-3 py-2 rounded">
                      {config.descricao}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Status: Ativo nos apps</span>
                    <span>
                      Última atualização: {new Date(config.updated_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações para o usuário */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Como funciona?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    • O site configurado aqui é exibido automaticamente em todos os aplicativos dos clientes
                  </p>
                  <p>
                    • Os clientes podem acessar diretamente através do botão "Acessar" que aparece nos apps
                  </p>
                  <p>
                    • Apenas administradores podem alterar estas configurações
                  </p>
                  <p>
                    • As alterações são aplicadas imediatamente em todos os aplicativos ativos
                  </p>
                </div>
              </CardContent>
            </Card>

            {!isAdmin && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Lock className="w-4 h-4" />
                    <p className="text-sm">
                      <strong>Acesso restrito:</strong> Apenas administradores podem editar as configurações do site.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}