import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Plus, Edit, Trash2, Search, MapPin, MessageCircle, Bus, Link } from "lucide-react";
import { AlunoForm } from "./aluno-form";
import { useAlunos } from "@/hooks/useAlunos";
import { useVans } from "@/hooks/useVans";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Aluno } from "@/types/alunos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { UserCheck, BusFront, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AlunoManager() {
  const { alunos, loading: alunosLoading, createAluno, updateAluno, deleteAluno } = useAlunos();
  const { vans, loading: vansLoading } = useVans();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [deletingAluno, setDeletingAluno] = useState<Aluno | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [selectedVanId, setSelectedVanId] = useState<string>("all");
  const [selectedTurno, setSelectedTurno] = useState<string>("all");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userVanId, setUserVanId] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const meta = session?.user?.user_metadata;
      setUserRole(meta?.tipo_usuario || meta?.user_type || 'usuario');
      setUserVanId(meta?.van_id || null);
      if (meta?.van_id) {
        setSelectedVanId(meta.van_id);
      }
    };
    getUserData();
  }, []);

  const isTeam = userRole === 'motorista' || userRole === 'monitora';

  const filteredAlunos = (alunos || []).filter(aluno => {
    if (!aluno) return false;

    // Filtro por Van
    if (selectedVanId !== "all" && aluno.van_id !== selectedVanId) return false;

    const nomeCompleto = aluno.nome_completo || "";
    const nomeResponsavel = aluno.nome_responsavel || "";
    const nomeColegio = aluno.nome_colegio || "";

    const normalizedTurno = (aluno.turno || "").toLowerCase().trim();
    const matchesTurno = selectedTurno === "all" || normalizedTurno === selectedTurno;

    return (nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nomeResponsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nomeColegio.toLowerCase().includes(searchTerm.toLowerCase())) &&
      matchesTurno;
  });

  // Agrupar por turno para facilitar visualização dentro da van
  const groupedByTurno = filteredAlunos.reduce((acc: any, aluno) => {
    // Se o filtro de turno for "Todos", agrupa tudo em uma única lista "Todos"
    if (selectedTurno === "all") {
      if (!acc["Todos"]) acc["Todos"] = [];
      acc["Todos"].push(aluno);
      return acc;
    }

    // Caso contrário, mantém o agrupamento original por turno
    const turno = aluno.turno || "Outros";
    if (!acc[turno]) acc[turno] = [];
    acc[turno].push(aluno);
    return acc;
  }, {});

  // Ordenar as chaves: se for "Todos", mantém assim. Se não, ordena alfabeticamente os turnos.
  const turnos = Object.keys(groupedByTurno).sort((a, b) => {
    if (a === "Todos") return -1;
    if (b === "Todos") return 1;
    return a.localeCompare(b);
  });

  const handleAlunoSubmit = async (data: any) => {
    try {
      if (editingAluno) {
        await updateAluno(editingAluno.id, data);
        toast({
          title: "Sucesso",
          description: "Aluno atualizado com sucesso!",
        });
      } else {
        await createAluno(data);
        toast({
          title: "Sucesso",
          description: "Aluno adicionado com sucesso!",
        });
      }
      setIsFormOpen(false);
      setEditingAluno(null);
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
    }
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingAluno) return;

    try {
      await deleteAluno(deletingAluno.id);
      toast({
        title: "Sucesso",
        description: "Aluno removido com sucesso!",
      });
      setDeletingAluno(null);
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
    }
  };

  const openWhatsApp = (phone: string, studentName: string) => {
    if (!phone) {
      toast({
        title: "Atenção",
        description: "Número de WhatsApp não informado.",
        variant: "destructive",
      });
      return;
    }
    const message = `Olá! Sou do transporte escolar. Gostaria de falar sobre o(a) ${studentName}.`;
    const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('mmn_id, slug')
        .eq('user_id', user.id)
        .single();

      const identifier = profile?.slug || profile?.mmn_id || user.id;
      const link = `${window.location.origin}/aluno/cadastro/${identifier}`;
      await navigator.clipboard.writeText(link);

      toast({
        title: "Link copiado!",
        description: "Link de cadastro copiado para a área de transferência.",
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error("Erro ao gerar link:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o link.",
        variant: "destructive"
      });
    }
  };

  const openMaps = (aluno: Aluno) => {
    if (!aluno.endereco_rua || !aluno.endereco_numero) {
      toast({
        title: "Atenção",
        description: "Endereço incompleto para abrir o mapa.",
        variant: "destructive",
      });
      return;
    }
    const address = `${aluno.endereco_rua}, ${aluno.endereco_numero}, ${aluno.endereco_bairro || ""}, ${aluno.endereco_cidade || ""}, ${aluno.endereco_estado || ""}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, "_blank");
  };

  const handleGenerateUpdateLink = async (alunoId: string, studentName: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_aluno_update_token', {
        p_aluno_id: alunoId
      });

      if (error) throw error;

      const link = `${window.location.origin}/aluno/atualizar/${data}`;
      await navigator.clipboard.writeText(link);

      toast({
        title: "Link de atualização gerado!",
        description: `O link para ${studentName} foi copiado. Envie para o responsável.`,
        className: "bg-gold text-black-primary font-bold"
      });
    } catch (error) {
      console.error("Erro ao gerar link de atualização:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o link de atualização.",
        variant: "destructive"
      });
    }
  };

  const getVanName = (vanId: string) => {
    if (!vans || !Array.isArray(vans)) return "Carregando...";
    const van = vans.find(v => v.id === vanId);
    return van ? van.nome : "Van não encontrada";
  };

  if (alunosLoading || vansLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Carregando alunos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">Gerenciar Alunos</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isTeam ? `${filteredAlunos.length} alunos vinculados à sua van` : `${alunos.length} alunos cadastrados em ${vans.length} vans`}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar alunos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          {!isTeam && (
            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                className="bg-gold text-black-primary hover:opacity-90 h-11 flex-1 sm:flex-none whitespace-nowrap"
              >
                <Link className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Link de Cadastro</span>
                <span className="sm:hidden">Link</span>
              </Button>
              <Button
                onClick={() => {
                  setEditingAluno(null);
                  setIsFormOpen(true);
                }}
                className="bg-gradient-gold text-black-primary hover:opacity-90 h-11 flex-1 sm:flex-none whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Novo Aluno</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          )}
        </div>
      </div>


      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border border-l-4 border-l-gold">
          <CardContent className="p-6 flex items-center gap-4 min-h-[120px]">
            <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total de Alunos</p>
              <h3 className="text-3xl font-bold text-foreground">{filteredAlunos.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border border-l-4 border-l-blue-500">
          <CardContent className="p-6 flex items-center gap-4 min-h-[120px]">
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <BusFront className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total de Vans</p>
              <h3 className="text-3xl font-bold text-foreground">{vans.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border border-l-4 border-l-green-500">
          <CardContent className="p-6 flex items-center gap-4 min-h-[120px]">
            <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Alunos Ativos</p>
              <h3 className="text-3xl font-bold text-foreground">
                {filteredAlunos.filter(a => a.ativo).length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Seletor de Van (Pastas) */}
        <div className="p-1 bg-accent/20 rounded-xl border border-border/50">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 p-1">
              {!isTeam && (
                <Button
                  variant={selectedVanId === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedVanId("all")}
                  className={selectedVanId === "all" ? "bg-gold text-black-primary font-bold shadow-md" : "text-muted-foreground"}
                >
                  Todos ({alunos.length})
                </Button>
              )}
              {(vans || [])
                .filter(van => !isTeam || van.id === userVanId)
                .map((van) => {
                  const count = (alunos || []).filter(a => a && a.van_id === van.id).length;
                  return (
                    <Button
                      key={van.id}
                      variant={selectedVanId === van.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => !isTeam && setSelectedVanId(van.id)}
                      className={cn(
                        selectedVanId === van.id ? "bg-gold text-black-primary font-bold shadow-md" : "text-muted-foreground hover:bg-gold/10 hover:text-gold",
                        isTeam && "cursor-default pointer-events-none"
                      )}
                    >
                      <Bus className="w-4 h-4 mr-2" />
                      {van.nome} ({count})
                    </Button>
                  );
                })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Seletor de Turno */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 flex-shrink-0">
            <Clock className="w-3 h-3" /> Turno:
          </span>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'manha', label: 'Manhã' },
              { id: 'tarde', label: 'Tarde' },
              { id: 'noite', label: 'Noite' },
              { id: 'integral', label: 'Integral' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTurno(t.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedTurno === t.id
                  ? "bg-gold/20 border-gold text-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                  : "bg-background border-border text-muted-foreground hover:border-gold/50"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredAlunos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? "Tente ajustar os termos da sua busca."
                : "Comece adicionando seu primeiro aluno ao sistema."
              }
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-gold text-black-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeiro aluno
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {turnos.map((turno) => (
            <div key={turno} className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-gold text-black-primary hover:bg-gold/80 px-4 py-1 text-sm font-bold uppercase tracking-wider">
                  {turno}
                </Badge>
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-xs text-muted-foreground uppercase font-medium">
                  {groupedByTurno[turno].length} {groupedByTurno[turno].length === 1 ? 'aluno' : 'alunos'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedByTurno[turno].map((aluno: Aluno) => (
                  <Card key={aluno.id} className="hover:bg-accent/50 transition-colors border-gold/10 overflow-hidden group">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-base group-hover:text-gold transition-colors">
                            <Users className="w-4 h-4" />
                            {aluno.nome_completo}
                          </CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-1">
                            Responsável: {aluno.nome_responsavel}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm space-y-2 bg-black/20 p-3 rounded-md">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Colégio:</span>
                          <span className="font-medium">{aluno.nome_colegio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Série:</span>
                          <span className="font-medium">{aluno.serie}</span>
                        </div>
                        {selectedVanId === 'all' && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Van:</span>
                            <span className="text-gold font-medium">{getVanName(aluno.van_id)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gold/10 pt-2 mt-2">
                          <span className="text-muted-foreground">Mensalidade:</span>
                          <span className="font-bold text-gold">R$ {(Number(aluno.valor_mensalidade) || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openWhatsApp(aluno.whatsapp_responsavel, aluno.nome_completo)}
                          className="flex-1 h-9 border-gold/20 hover:border-gold hover:bg-gold/10 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 mr-2 text-green-500" />
                          WhatsApp
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMaps(aluno)}
                          className="flex-1 h-9 border-gold/20 hover:border-gold hover:bg-gold/10 transition-all"
                        >
                          <MapPin className="w-3.5 h-3.5 mr-2 text-blue-500" />
                          Mapa
                        </Button>
                      </div>

                      {!isTeam && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateUpdateLink(aluno.id, aluno.nome_completo)}
                          className="w-full h-9 border-gold/30 bg-gold/5 hover:bg-gold/10 text-gold font-bold uppercase text-[10px] tracking-widest"
                        >
                          <Link className="w-3 h-3 mr-2" />
                          Gerar Link de Atualização
                        </Button>
                      )}

                      {!isTeam && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(aluno)}
                            className="flex-1 h-8 bg-accent/50 hover:bg-accent border-none transition-all"
                          >
                            <Edit className="w-3 h-3 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingAluno(aluno)}
                            className="h-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AlunoForm
        key={editingAluno?.id || "new"}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAluno(null);
        }}
        onSubmit={handleAlunoSubmit}
        vans={vans}
        editingAluno={editingAluno}
      />

      <AlertDialog open={!!deletingAluno} onOpenChange={() => setDeletingAluno(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o aluno "{deletingAluno?.nome_completo}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}