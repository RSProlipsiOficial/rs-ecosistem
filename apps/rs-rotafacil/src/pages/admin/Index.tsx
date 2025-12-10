import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Video, BookOpen, MessageSquare, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/admin-layout";

export default function AdminIndex() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
            <p className="text-muted-foreground">
              Gerencie aplicativos, conteúdos e configurações do sistema
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Dashboard de Vendas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Apps Vendidos
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação ao mês passado
              </p>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/admin/apps">
                  Ver Todos os Apps
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Educação Financeira */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vídeos Educacionais
              </CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Vídeos ativos no sistema
              </p>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/admin/videos">
                  Gerenciar Vídeos
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Tutoriais */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tutoriais
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Tutoriais disponíveis
              </p>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/admin/tutoriais">
                  Gerenciar Tutoriais
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Suporte */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Configurações de Suporte
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                WhatsApp e mensagens de suporte
              </p>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/admin/suporte">
                  Configurar Suporte
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Site Principal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Site Principal
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Link exibido nos apps dos clientes
              </p>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/admin/site">
                  Configurar Site
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}