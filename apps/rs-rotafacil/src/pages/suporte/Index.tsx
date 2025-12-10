import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  HeadphonesIcon, 
  MessageCircle, 
  PhoneCall, 
  Video, 
  Search,
  Play,
  Bot,
  User,
  Send,
  Youtube,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Tutorial {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  youtube_url: string;
  thumbnail: string;
  duracao: string;
}

interface ChatMessage {
  id: string;
  tipo: 'user' | 'ia';
  conteudo: string;
  timestamp: Date;
}

interface MensagemPronta {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  ativa: boolean;
  created_at: Date;
}

export default function SuporteIndex() {
  const [mensagemChat, setMensagemChat] = useState('');
  const [mensagensChat, setMensagensChat] = useState<ChatMessage[]>([
    {
      id: '1',
      tipo: 'ia',
      conteudo: 'Olá! Sou a RS-IA, sua assistente de suporte. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [buscaTutorial, setBuscaTutorial] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  
  // Estados para Mensagens Prontas
  const [mensagensProntas, setMensagensProntas] = useState<MensagemPronta[]>([
    {
      id: '1',
      titulo: 'Bom dia - Início da rota',
      conteudo: 'Bom dia! Espero que esteja bem. Estamos saindo para buscar os alunos. Horário previsto de chegada: {horario}.',
      categoria: 'Rotina',
      ativa: true,
      created_at: new Date()
    },
    {
      id: '2',
      titulo: 'Atraso na rota',
      conteudo: 'Olá! Informo que a van está com um pequeno atraso de aproximadamente {tempo} minutos devido ao trânsito. Já estamos a caminho.',
      categoria: 'Avisos',
      ativa: true,
      created_at: new Date()
    },
    {
      id: '3',
      titulo: 'Lembrete - Mensalidade',
      conteudo: 'Olá! Este é um lembrete amigável de que a mensalidade de {aluno} vence em {dias} dias. Valor: R$ {valor}. Obrigado!',
      categoria: 'Cobrança',
      ativa: true,
      created_at: new Date()
    },
    {
      id: '4',
      titulo: 'Confirmação de presença',
      conteudo: 'Oi! {aluno} embarcou na van às {horario} e está a caminho da escola. Tenha um ótimo dia!',
      categoria: 'Rotina',
      ativa: true,
      created_at: new Date()
    },
    {
      id: '5',
      titulo: 'Ausência justificada',
      conteudo: 'Recebi a informação de que {aluno} não irá hoje. Obrigado por avisar!',
      categoria: 'Rotina',
      ativa: true,
      created_at: new Date()
    }
  ]);
  const [novaMensagem, setNovaMensagem] = useState({ titulo: '', conteudo: '', categoria: 'Rotina' });
  const [editandoMensagem, setEditandoMensagem] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Dados dos tutoriais (posteriormente virão do banco)
  const tutoriais: Tutorial[] = [
    {
      id: '1',
      titulo: 'Como cadastrar um aluno',
      descricao: 'Aprenda a registrar novos alunos no sistema',
      categoria: 'Alunos e Vans',
      youtube_url: 'https://youtube.com/watch?v=exemplo1',
      thumbnail: '/placeholder.svg',
      duracao: '3:45'
    },
    {
      id: '2',
      titulo: 'Como vincular alunos à van',
      descricao: 'Processo para organizar alunos por van e gerenciar rotas',
      categoria: 'Alunos e Vans',
      youtube_url: 'https://youtube.com/watch?v=exemplo2',
      thumbnail: '/placeholder.svg',
      duracao: '2:30'
    },
    {
      id: '3',
      titulo: 'Como gerar mensagem automática',
      descricao: 'Use a RS-IA para criar mensagens personalizadas',
      categoria: 'RS-IA',
      youtube_url: 'https://youtube.com/watch?v=exemplo3',
      thumbnail: '/placeholder.svg',
      duracao: '4:15'
    },
    {
      id: '4',
      titulo: 'Como controlar seus ganhos',
      descricao: 'Gerencie suas receitas mensais',
      categoria: 'Financeiro',
      youtube_url: 'https://youtube.com/watch?v=exemplo4',
      thumbnail: '/placeholder.svg',
      duracao: '5:20'
    },
    {
      id: '5',
      titulo: 'Como marcar presença dos alunos',
      descricao: 'Sistema de controle de presença',
      categoria: 'Monitora',
      youtube_url: 'https://youtube.com/watch?v=exemplo5',
      thumbnail: '/placeholder.svg',
      duracao: '3:10'
    },
    {
      id: '6',
      titulo: 'Preencher o checklist diário da van',
      descricao: 'Rotina de verificação e manutenção da van',
      categoria: 'Motorista',
      youtube_url: 'https://youtube.com/watch?v=exemplo6',
      thumbnail: '/placeholder.svg',
      duracao: '4:00'
    }
  ];

  const categorias = ['Todos', 'Alunos e Vans', 'RS-IA', 'Financeiro', 'Mensalidades', 'Motorista', 'Monitora', 'Educação Financeira'];
  const categoriasMensagens = ['Rotina', 'Avisos', 'Cobrança', 'Emergência', 'Outros'];

  const tutoriaisFiltrados = tutoriais.filter(tutorial => {
    const matchCategoria = categoriaFiltro === 'Todos' || tutorial.categoria === categoriaFiltro;
    const searchTerm = buscaTutorial.toLowerCase().trim();
    const matchBusca = searchTerm === '' || 
                      tutorial.titulo.toLowerCase().includes(searchTerm) ||
                      tutorial.descricao.toLowerCase().includes(searchTerm) ||
                      tutorial.categoria.toLowerCase().includes(searchTerm);
    return matchCategoria && matchBusca;
  });

  const enviarMensagem = () => {
    if (!mensagemChat.trim()) return;

    // Adicionar mensagem do usuário
    const novaMensagemUser: ChatMessage = {
      id: Date.now().toString(),
      tipo: 'user',
      conteudo: mensagemChat,
      timestamp: new Date()
    };

    setMensagensChat(prev => [...prev, novaMensagemUser]);

    // Simular resposta da IA
    setTimeout(() => {
      let respostaIA = '';
      
      if (mensagemChat.toLowerCase().includes('senha')) {
        respostaIA = 'Vou resetar sua senha agora! Sua nova senha temporária é: **12345678**\n\nPor segurança, você será direcionado para trocar sua senha assim que fizer login.';
      } else if (mensagemChat.toLowerCase().includes('financeiro')) {
        respostaIA = 'Para dúvidas sobre o módulo Financeiro, recomendo assistir este tutorial: [Como controlar seus ganhos](https://youtube.com/watch?v=exemplo4)';
      } else if (mensagemChat.toLowerCase().includes('aluno')) {
        respostaIA = 'Para cadastrar alunos, assista este vídeo: [Como cadastrar um aluno](https://youtube.com/watch?v=exemplo1)';
      } else {
        respostaIA = 'Entendi sua dúvida! Posso ajudar com:\n\n• Reset de senha\n• Tutoriais do app\n• Informações sobre planos\n• Redirecionamento para atendimento humano\n\nO que você precisa?';
      }

      const respostaMensagem: ChatMessage = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        conteudo: respostaIA,
        timestamp: new Date()
      };

      setMensagensChat(prev => [...prev, respostaMensagem]);
    }, 1000);

    setMensagemChat('');
  };

  const abrirWhatsApp = () => {
    const numeroWhatsApp = '5511999999999'; // Número do Roberto
    const mensagem = 'Olá! Preciso de suporte com o app RotaFácil.';
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const abrirVideo = (url: string) => {
    window.open(url, '_blank');
  };

  // Funções para Mensagens Prontas
  const adicionarMensagem = () => {
    if (!novaMensagem.titulo || !novaMensagem.conteudo) {
      toast({
        title: "Erro",
        description: "Preencha o título e conteúdo da mensagem.",
        variant: "destructive",
      });
      return;
    }

    const mensagem: MensagemPronta = {
      id: Date.now().toString(),
      ...novaMensagem,
      ativa: true,
      created_at: new Date()
    };

    setMensagensProntas(prev => [...prev, mensagem]);
    setNovaMensagem({ titulo: '', conteudo: '', categoria: 'Rotina' });
    
    toast({
      title: "Sucesso!",
      description: "Mensagem pronta adicionada com sucesso.",
    });
  };

  const removerMensagem = (id: string) => {
    setMensagensProntas(prev => prev.filter(msg => msg.id !== id));
    toast({
      title: "Mensagem removida",
      description: "A mensagem foi excluída com sucesso.",
    });
  };

  const copiarMensagem = (conteudo: string) => {
    navigator.clipboard.writeText(conteudo);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência.",
    });
  };

  const toggleAtivaMensagem = (id: string) => {
    setMensagensProntas(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, ativa: !msg.ativa } : msg
      )
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card border rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HeadphonesIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Central de Suporte</h1>
          </div>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl">
            Tire suas dúvidas e aprenda a usar o RotaFácil com nossos tutoriais e atendimento especializado.
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={abrirWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white font-medium gap-2"
            >
              <PhoneCall className="h-4 w-4" />
              Falar com Atendente
            </Button>
            <Button 
              variant="outline"
              className="gap-2"
            >
              <Bot className="h-4 w-4" />
              IA Disponível 24h
            </Button>
          </div>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat com RS-IA
            </TabsTrigger>
            <TabsTrigger value="mensagens" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensagens Prontas
            </TabsTrigger>
            <TabsTrigger value="tutoriais" className="gap-2">
              <Video className="h-4 w-4" />
              Tutoriais e Vídeos
            </TabsTrigger>
          </TabsList>

          {/* Tab: Chat com IA */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  RS-IA - Assistente de Suporte
                </CardTitle>
                <CardDescription>
                  Sua assistente virtual para dúvidas, reset de senha e orientações sobre o app
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Área de mensagens */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 h-96 overflow-y-auto space-y-4 border border-gray-200 dark:border-gray-700 shadow-inner">
                    {mensagensChat.map((mensagem, index) => (
                      <div
                        key={mensagem.id}
                        className={`flex ${mensagem.tipo === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className={`flex gap-3 max-w-md ${mensagem.tipo === 'user' ? 'flex-row-reverse' : 'flex-row'} group`}>
                          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-transform group-hover:scale-105 ${
                            mensagem.tipo === 'user' 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                              : 'bg-gradient-to-br from-amber-400 to-amber-500'
                          }`}>
                            {mensagem.tipo === 'user' ? (
                              <User className="h-5 w-5 text-white" />
                            ) : (
                              <Bot className="h-5 w-5 text-white" />
                            )}
                            {/* Status indicator */}
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                          </div>
                          
                          <div className={`relative rounded-2xl p-4 shadow-lg max-w-xs transition-all duration-300 group-hover:shadow-xl ${
                            mensagem.tipo === 'user' 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                          }`}>
                            {/* Message tail */}
                            <div className={`absolute top-4 w-0 h-0 ${
                              mensagem.tipo === 'user' 
                                ? 'right-full border-l-0 border-r-8 border-t-8 border-b-8 border-transparent border-r-blue-500' 
                                : 'left-full border-r-0 border-l-8 border-t-8 border-b-8 border-transparent border-l-white dark:border-l-gray-800'
                            }`}></div>
                            
                            <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{mensagem.conteudo}</p>
                            
                            <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
                              mensagem.tipo === 'user' 
                                ? 'border-blue-400/30' 
                                : 'border-gray-200 dark:border-gray-600'
                            }`}>
                              <span className={`text-xs font-medium ${
                                mensagem.tipo === 'user' 
                                  ? 'text-blue-100' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {mensagem.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              
                              {mensagem.tipo === 'user' && (
                                <div className="flex space-x-1">
                                  <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
                                  <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing indicator */}
                    <div className="flex justify-start animate-pulse">
                      <div className="flex gap-3 max-w-md">
                        <div className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg">
                          <Bot className="h-5 w-5 text-white" />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 shadow-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input de mensagem */}
                  <div className="flex gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                    <Input
                      value={mensagemChat}
                      onChange={(e) => setMensagemChat(e.target.value)}
                      placeholder="Digite sua dúvida aqui..."
                      onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                      className="flex-1 border border-amber-200 bg-amber-50 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 text-base text-gray-800 placeholder:text-gray-600 rounded-xl px-4 py-3 transition-all duration-300"
                    />
                    <Button 
                      onClick={enviarMensagem} 
                      disabled={!mensagemChat.trim()}
                      className="gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
                    >
                      <Send className="h-4 w-4" />
                      <span className="font-medium">Enviar</span>
                    </Button>
                  </div>
                </div>

                {/* Sugestões rápidas */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    Dúvidas Frequentes:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Esqueci minha senha',
                      'Como cadastrar aluno?',
                      'Como usar o financeiro?',
                      'Problemas com cobrança',
                      'Como funciona a IA?'
                    ].map((sugestao) => (
                      <Button
                        key={sugestao}
                        variant="outline"
                        size="sm"
                        onClick={() => setMensagemChat(sugestao)}
                        className="text-xs"
                      >
                        {sugestao}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Mensagens Prontas */}
          <TabsContent value="mensagens">
            <div className="space-y-6">
              {/* Header e Formulário */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Mensagens Prontas para Chatbot
                  </CardTitle>
                  <CardDescription>
                    Crie mensagens personalizadas que a IA pode usar para se comunicar com pais e responsáveis automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {/* Formulário para nova mensagem */}
                  <div className="grid gap-4 p-6 border rounded-xl bg-muted/30">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Plus className="h-4 w-4 text-primary" />
                      Adicionar Nova Mensagem
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Título da Mensagem</label>
                        <Input
                          value={novaMensagem.titulo}
                          onChange={(e) => setNovaMensagem({...novaMensagem, titulo: e.target.value})}
                          placeholder="Ex: Bom dia - Início da rota"
                          className="border-border/50 focus:border-primary/50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Categoria</label>
                        <select 
                          value={novaMensagem.categoria}
                          onChange={(e) => setNovaMensagem({...novaMensagem, categoria: e.target.value})}
                          className="w-full h-10 px-3 py-2 border border-border/50 rounded-md text-sm bg-background text-foreground focus:border-primary/50 focus:outline-none transition-colors"
                        >
                          {categoriasMensagens.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Conteúdo da Mensagem</label>
                      <Textarea
                        value={novaMensagem.conteudo}
                        onChange={(e) => setNovaMensagem({...novaMensagem, conteudo: e.target.value})}
                        placeholder="Digite o conteúdo da mensagem. Use {variavel} para campos dinâmicos como {aluno}, {horario}, {valor}, etc."
                        rows={3}
                        className="resize-none border-border/50 focus:border-primary/50"
                      />
                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-primary">💡</span>
                        Use variáveis como {"{aluno}"}, {"{horario}"}, {"{valor}"} para personalizar mensagens automaticamente
                      </p>
                    </div>
                    
                    <Button onClick={adicionarMensagem} className="gap-2 w-fit">
                      <Plus className="h-4 w-4" />
                      Adicionar Mensagem
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Mensagens */}
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Suas Mensagens Prontas
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {mensagensProntas.length} mensagem{mensagensProntas.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {mensagensProntas.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-foreground mb-2">Nenhuma mensagem cadastrada</h3>
                      <p className="text-muted-foreground">
                        Adicione sua primeira mensagem pronta para o chatbot usar.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {mensagensProntas.map((mensagem) => (
                      <Card 
                        key={mensagem.id} 
                        className={`transition-all duration-300 hover:shadow-lg ${
                          mensagem.ativa 
                            ? 'border-l-4 border-l-green-500' 
                            : 'border-l-4 border-l-gray-300'
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h4 className="font-semibold text-foreground text-base">{mensagem.titulo}</h4>
                                
                                <Badge 
                                  variant={mensagem.ativa ? "default" : "secondary"} 
                                  className="text-xs font-medium"
                                >
                                  {mensagem.categoria}
                                </Badge>
                                
                                {mensagem.ativa && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs font-medium">Ativa</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="bg-muted/30 p-4 rounded-lg border">
                                <p className="text-sm text-foreground leading-relaxed">
                                  {mensagem.conteudo}
                                </p>
                              </div>
                              
                              <p className="text-xs text-muted-foreground">
                                Criada em {mensagem.created_at.toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            
                            <div className="flex flex-col gap-2 min-w-fit">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copiarMensagem(mensagem.conteudo)}
                                className="gap-2"
                              >
                                <Copy className="h-3 w-3" />
                                Copiar
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAtivaMensagem(mensagem.id)}
                                className={`gap-2 ${
                                  mensagem.ativa 
                                    ? 'text-orange-600' 
                                    : 'text-green-600'
                                }`}
                              >
                                {mensagem.ativa ? 'Desativar' : 'Ativar'}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removerMensagem(mensagem.id)}
                                className="gap-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab: Tutoriais */}
          <TabsContent value="tutoriais">
            <div className="space-y-6">
              {/* Filtros e Busca */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Tutoriais e Vídeo-Aulas
                  </CardTitle>
                  <CardDescription>
                    Aprenda a usar cada módulo do RotaFácil com nossos vídeos explicativos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {/* Busca */}
                  <div className="relative">
                    <button
                      onClick={() => document.getElementById('tutorial-search')?.focus()}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer z-10"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                    <Input
                      id="tutorial-search"
                      type="text"
                      value={buscaTutorial}
                      onChange={(e) => setBuscaTutorial(e.target.value)}
                      placeholder="Digite para buscar tutorials..."
                      className="pl-10 pr-4 h-10 w-full border-border/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                      autoComplete="off"
                    />
                    {buscaTutorial && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBuscaTutorial('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                      >
                        ×
                      </Button>
                    )}
                  </div>

                  {/* Filtro por categoria */}
                  <div className="flex flex-wrap gap-2">
                    {categorias.map((categoria) => (
                      <Button
                        key={categoria}
                        variant={categoriaFiltro === categoria ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoriaFiltro(categoria)}
                      >
                        {categoria}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resultados */}
              {buscaTutorial && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" />
                  <span>
                    {tutoriaisFiltrados.length} tutorial{tutoriaisFiltrados.length !== 1 ? 's' : ''} encontrado{tutoriaisFiltrados.length !== 1 ? 's' : ''} para "{buscaTutorial}"
                  </span>
                </div>
              )}

              {/* Grid de Tutoriais */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tutoriaisFiltrados.map((tutorial) => (
                  <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Thumbnail */}
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
                          <Play className="h-12 w-12 text-muted-foreground" />
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            {tutorial.duracao}
                          </div>
                        </div>
                        
                        {/* Informações */}
                        <div className="space-y-2">
                          <Badge variant="secondary" className="text-xs">
                            {tutorial.categoria}
                          </Badge>
                          
                          <h3 className="font-semibold line-clamp-2">{tutorial.titulo}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{tutorial.descricao}</p>
                        </div>

                        {/* Botão */}
                        <Button 
                          onClick={() => abrirVideo(tutorial.youtube_url)}
                          className="w-full gap-2 bg-red-600 hover:bg-red-700"
                        >
                          <Youtube className="h-4 w-4" />
                          Assistir Tutorial
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sem resultados */}
              {tutoriaisFiltrados.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">Nenhum tutorial encontrado</h3>
                    <p className="text-muted-foreground">
                      Tente ajustar os filtros ou entre em contato conosco para sugerir novos conteúdos.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}