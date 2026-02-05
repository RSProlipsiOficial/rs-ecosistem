import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap,
  Calculator,
  Video,
  Save,
  FileDown,
  Youtube,
  DollarSign,
  Home,
  Coffee,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PlanejamentoFinanceiro {
  id?: string;
  user_id: string;
  renda_mensal: number;
  gastos_casa: number;
  lazer: number;
  educacao: number;
  investimentos: number;
  created_at?: string;
  updated_at?: string;
}

interface VideoEducativo {
  id: string;
  titulo: string;
  descricao: string;
  thumbnail: string;
  youtube_url: string;
  categoria: string;
  duracao?: string;
}

export default function EducacaoFinanceiraIndex() {
  const [rendaMensal, setRendaMensal] = useState<number>(3000);
  const [planejamento, setPlanejamento] = useState<PlanejamentoFinanceiro | null>(null);
  const [videosEducativos, setVideosEducativos] = useState<VideoEducativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [editandoPorcentagens, setEditandoPorcentagens] = useState(false);
  const [porcentagens, setPorcentagens] = useState({
    gastos_casa: 50,
    lazer: 10,
    educacao: 10,
    investimentos: 20,
    dizimos: 10
  });
  const [simulacao, setSimulacao] = useState({
    valorInicial: 0,
    taxaAnual: 12,
    anos: 10
  });
  const { toast } = useToast();

  // Carregar vídeos educativos do banco
  const carregarVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos_educacao')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedVideos: VideoEducativo[] = data.map(v => ({
          id: v.id,
          titulo: v.titulo,
          descricao: v.descricao || '',
          thumbnail: v.thumbnail_url || '/placeholder.svg',
          youtube_url: v.link_video,
          categoria: v.categoria || 'Geral',
          duracao: '' // Não temos essa coluna, pode ficar vazia ou ser adicionada depois
        }));
        setVideosEducativos(formattedVideos);
      } else {
        // Fallback quando não há vídeos no banco
        setVideosEducativos([
          {
            id: '1',
            titulo: 'Como dividir seu salário todo mês',
            descricao: 'Aprenda a organizar sua renda mensal de forma inteligente',
            thumbnail: '/placeholder.svg',
            youtube_url: 'https://youtube.com/watch?v=exemplo1',
            categoria: 'Fundamentos',
            duracao: '15 min'
          }
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    }
  };

  const categorias = ['Todos', 'Fundamentos', 'Planejamento', 'Redução de Gastos', 'Investimento básico', 'Mentalidade financeira'];
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');

  const videosFiltrados = categoriaAtiva === 'Todos'
    ? videosEducativos
    : videosEducativos.filter(video => video.categoria === categoriaAtiva);

  // Cálculo automático da distribuição
  const calcularDistribuicao = (renda: number) => {
    return {
      gastos_casa: renda * (porcentagens.gastos_casa / 100),
      lazer: renda * (porcentagens.lazer / 100),
      educacao: renda * (porcentagens.educacao / 100),
      investimentos: renda * (porcentagens.investimentos / 100),
      dizimos: renda * (porcentagens.dizimos / 100)
    };
  };

  // Cálculo de simulação de investimento (juros compostos)
  const calcularSimulacao = () => {
    const { valorInicial, taxaAnual, anos } = simulacao;
    const taxaMensal = taxaAnual / 100 / 12;
    const totalMeses = anos * 12;
    const montante = valorInicial * Math.pow(1 + taxaMensal, totalMeses);
    return {
      valorFinal: montante,
      rendimento: montante - valorInicial
    };
  };

  const resultadoSimulacao = calcularSimulacao();

  const distribuicao = calcularDistribuicao(rendaMensal);

  const salvarPlanejamento = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para salvar seu planejamento.",
          variant: "destructive",
        });
        return;
      }

      const planejamentoData = {
        user_id: user.id,
        renda_mensal: rendaMensal,
        ...distribuicao
      };

      // Usar upsert para inserir ou atualizar
      const { error } = await supabase
        .from('planejamentos_financeiros')
        .upsert(planejamentoData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Seu planejamento financeiro foi salvo com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao salvar planejamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu planejamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarPlanejamento = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('planejamentos_financeiros')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPlanejamento(data as PlanejamentoFinanceiro);
        setRendaMensal(data.renda_mensal);
      }
    } catch (error) {
      console.error('Erro ao carregar planejamento:', error);
    }
  };

  const abrirVideoYoutube = (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    carregarPlanejamento();
    carregarVideos();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold">Treinamentos</h1>
          </div>
          <p className="text-slate-300 text-lg mb-6">
            Comece agora a cuidar da sua vida financeira com orientações práticas e simples.
          </p>
          <Button
            onClick={() => abrirVideoYoutube('https://youtube.com/watch?v=exemplo-intro')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium gap-2"
          >
            <Youtube className="h-4 w-4" />
            Assistir Aula Introdutória
          </Button>
        </div>

        <Tabs defaultValue="planejamento" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="planejamento" className="gap-2">
              <Calculator className="h-4 w-4" />
              Planejamento Financeiro
            </TabsTrigger>
            <TabsTrigger value="videoaulas" className="gap-2">
              <Video className="h-4 w-4" />
              Videoaulas
            </TabsTrigger>
          </TabsList>

          {/* Tab: Planejamento Financeiro */}
          <TabsContent value="planejamento">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  Planejamento de Renda Mensal
                </CardTitle>
                <CardDescription>
                  Organize sua renda de forma inteligente seguindo a regra 50-20-10-10-10
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Input da Renda */}
                <div className="space-y-2">
                  <Label htmlFor="renda">Quanto você ganha por mês?</Label>
                  <Input
                    id="renda"
                    type="number"
                    placeholder="Ex: 3000"
                    value={rendaMensal || ''}
                    onChange={(e) => setRendaMensal(Number(e.target.value))}
                    className="text-lg"
                  />
                </div>

                {/* Tabela de Distribuição */}
                {rendaMensal > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-white">Distribuição Recomendada:</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditandoPorcentagens(!editandoPorcentagens)}
                        className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        {editandoPorcentagens ? 'Salvar' : 'Editar %'}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <Home className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">Gastos com Casa</p>
                              <p className="text-sm text-gray-300">Aluguel, luz, água, comida</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            {editandoPorcentagens ? (
                              <Input
                                type="number"
                                value={porcentagens.gastos_casa}
                                onChange={(e) => setPorcentagens({ ...porcentagens, gastos_casa: Number(e.target.value) })}
                                className="w-16 h-8 text-center bg-green-500/10 border-green-500/30"
                                min="0"
                                max="100"
                              />
                            ) : (
                              <div>
                                <p className="text-xl font-bold text-green-400">
                                  R$ {distribuicao.gastos_casa.toFixed(2)}
                                </p>
                                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                                  {porcentagens.gastos_casa}%
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <Coffee className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">Lazer / Passeios</p>
                              <p className="text-sm text-gray-300">Cinema, saídas, presentes</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            {editandoPorcentagens ? (
                              <Input
                                type="number"
                                value={porcentagens.lazer}
                                onChange={(e) => setPorcentagens({ ...porcentagens, lazer: Number(e.target.value) })}
                                className="w-16 h-8 text-center bg-blue-500/10 border-blue-500/30"
                                min="0"
                                max="100"
                              />
                            ) : (
                              <div>
                                <p className="text-xl font-bold text-blue-400">
                                  R$ {distribuicao.lazer.toFixed(2)}
                                </p>
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                  {porcentagens.lazer}%
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">Educação / Aprendizado</p>
                              <p className="text-sm text-gray-300">Cursos, livros, formações</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            {editandoPorcentagens ? (
                              <Input
                                type="number"
                                value={porcentagens.educacao}
                                onChange={(e) => setPorcentagens({ ...porcentagens, educacao: Number(e.target.value) })}
                                className="w-16 h-8 text-center bg-purple-500/10 border-purple-500/30"
                                min="0"
                                max="100"
                              />
                            ) : (
                              <div>
                                <p className="text-xl font-bold text-purple-400">
                                  R$ {distribuicao.educacao.toFixed(2)}
                                </p>
                                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                  {porcentagens.educacao}%
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">Investimentos / Futuro</p>
                              <p className="text-sm text-gray-300">Poupança, reserva, previdência</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            {editandoPorcentagens ? (
                              <Input
                                type="number"
                                value={porcentagens.investimentos}
                                onChange={(e) => setPorcentagens({ ...porcentagens, investimentos: Number(e.target.value) })}
                                className="w-16 h-8 text-center bg-yellow-500/10 border-yellow-500/30"
                                min="0"
                                max="100"
                              />
                            ) : (
                              <div>
                                <p className="text-xl font-bold text-yellow-400">
                                  R$ {distribuicao.investimentos.toFixed(2)}
                                </p>
                                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                  {porcentagens.investimentos}%
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-orange-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">Dízimos / Doações</p>
                              <p className="text-sm text-gray-300">Contribuições, caridade, igreja</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            {editandoPorcentagens ? (
                              <Input
                                type="number"
                                value={porcentagens.dizimos}
                                onChange={(e) => setPorcentagens({ ...porcentagens, dizimos: Number(e.target.value) })}
                                className="w-16 h-8 text-center bg-orange-500/10 border-orange-500/30"
                                min="0"
                                max="100"
                              />
                            ) : (
                              <div>
                                <p className="text-xl font-bold text-orange-400">
                                  R$ {distribuicao.dizimos?.toFixed(2) || '0.00'}
                                </p>
                                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                  {porcentagens.dizimos}%
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total da Distribuição */}
                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">Total Distribuído</p>
                          <p className="text-sm text-gray-300">Soma de todas as categorias</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-white">
                            R$ {Object.values(distribuicao).reduce((a, b) => a + b, 0).toFixed(2)}
                          </p>
                          <Badge variant="secondary" className="bg-gray-600/20 text-gray-300 border-gray-600/30">
                            {Object.values(porcentagens).reduce((a, b) => a + b, 0)}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Simulação de Investimento */}
                    <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-400">
                          <Calculator className="h-5 w-5" />
                          Simulação de Investimento
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          Veja quanto seu investimento pode render ao longo do tempo
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-gray-300">Valor Inicial (R$)</Label>
                            <Input
                              type="number"
                              value={simulacao.valorInicial}
                              onChange={(e) => setSimulacao({ ...simulacao, valorInicial: Number(e.target.value) })}
                              placeholder="Ex: 1000"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Taxa Anual (%)</Label>
                            <Input
                              type="number"
                              value={simulacao.taxaAnual}
                              onChange={(e) => setSimulacao({ ...simulacao, taxaAnual: Number(e.target.value) })}
                              placeholder="Ex: 12"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Período (anos)</Label>
                            <Input
                              type="number"
                              value={simulacao.anos}
                              onChange={(e) => setSimulacao({ ...simulacao, anos: Number(e.target.value) })}
                              placeholder="Ex: 10"
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                        </div>

                        {simulacao.valorInicial > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                              <p className="text-sm text-gray-300">Valor Final</p>
                              <p className="text-2xl font-bold text-green-400">
                                R$ {resultadoSimulacao.valorFinal.toFixed(2)}
                              </p>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                              <p className="text-sm text-gray-300">Rendimento Total</p>
                              <p className="text-2xl font-bold text-blue-400">
                                R$ {resultadoSimulacao.rendimento.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={salvarPlanejamento}
                        disabled={loading}
                        className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                      >
                        <Save className="h-4 w-4" />
                        Salvar Plano Mensal
                      </Button>
                      <Button variant="outline" className="gap-2 border-gray-600 text-gray-300 hover:bg-gray-800">
                        <FileDown className="h-4 w-4" />
                        Gerar PDF
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Videoaulas */}
          <TabsContent value="videoaulas">
            <div className="space-y-6">
              {/* Filtros por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categorias.map((categoria) => (
                      <Button
                        key={categoria}
                        variant={categoriaAtiva === categoria ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoriaAtiva(categoria)}
                      >
                        {categoria}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Grid de Vídeos */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {videosFiltrados?.length > 0 ? (
                  videosFiltrados.filter(v => !!v).map((video) => (
                    <Card key={video.id || Math.random()} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Thumbnail */}
                          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {video.thumbnail && video.thumbnail !== '/placeholder.svg' ? (
                              <img src={video.thumbnail} alt={video.titulo} className="w-full h-full object-cover" onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                const icon = document.createElement('div');
                                icon.innerHTML = '<svg class="h-12 w-12 text-gray-400" ...><path ... /></svg>'; // Simplified
                              }} />
                            ) : (
                              <Video className="h-12 w-12 text-gray-400" />
                            )}
                          </div>

                          {/* Informações */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <Badge variant="secondary" className="text-xs truncate max-w-[70%]">
                                {video.categoria || 'Geral'}
                              </Badge>
                              {video.duracao && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">{video.duracao}</span>
                              )}
                            </div>

                            <h3 className="font-semibold line-clamp-2" title={video.titulo}>{video.titulo}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2" title={video.descricao}>{video.descricao}</p>
                          </div>

                          {/* Botão */}
                          <Button
                            onClick={() => video.youtube_url && abrirVideoYoutube(video.youtube_url)}
                            className="w-full gap-2 bg-red-600 hover:bg-red-700"
                            disabled={!video.youtube_url}
                          >
                            <Youtube className="h-4 w-4" />
                            Assistir no YouTube
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum vídeo encontrado nesta categoria.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}