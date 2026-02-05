import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditWarningCard } from '@/components/ia/credit-warning-card';
import {
  Send,
  Plus,
  MessageSquare,
  Bot,
  User,
  Trash2,
  Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  created_at: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface AIModel {
  id: string;
  provider: string;
  model_id: string;
  display_name: string;
  description: string;
  max_tokens: number;
  supports_vision: boolean;
}

const ChatIA = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('anthropic/claude-3-sonnet');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [aiConfig, setAiConfig] = useState<any>(null);

  // Check authentication
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .order('provider, display_name');

      if (error) {
        console.error('Erro ao carregar modelos:', error);
        return;
      }

      setModels(data || []);
    };

    loadModels();
  }, []);

  // Load AI Config
  useEffect(() => {
    const loadAiConfig = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'support_config')
        .maybeSingle();

      if (data?.value) {
        setAiConfig(data.value);
      }
    };
    loadAiConfig();
  }, []);

  // Load sessions
  useEffect(() => {
    if (!user) return;

    const loadSessions = async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar sessões:', error);
        return;
      }

      setSessions(data || []);
    };

    loadSessions();
  }, [user]);

  // Load messages for current session
  useEffect(() => {
    console.log('Model changed to:', selectedModel);
    if (!currentSession) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', currentSession)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        return;
      }

      setMessages((data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        tokens: msg.tokens,
        created_at: msg.created_at
      })));
    };

    loadMessages();
  }, [currentSession]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewSession = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        title: 'Nova conversa'
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar nova sessão',
        variant: 'destructive'
      });
      return;
    }

    setCurrentSession(data.id);
    setSessions(prev => [data, ...prev]);
    setMessages([]);
  };

  const deleteSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a sessão',
        variant: 'destructive'
      });
      return;
    }

    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession === sessionId) {
      setCurrentSession(null);
      setMessages([]);
    }

    toast({
      title: 'Sucesso',
      description: 'Sessão excluída com sucesso'
    });
  };

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    console.log('Modelo alterado para:', newModel);
    toast({
      title: 'Modelo alterado',
      description: `Agora usando ${models.find(m => m.model_id === newModel)?.display_name || newModel}`,
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    let sessionId = currentSession;

    // Create new session if none exists
    if (!sessionId) {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: inputMessage.length > 50 ? inputMessage.substring(0, 50) + '...' : inputMessage
        })
        .select()
        .single();

      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível criar sessão',
          variant: 'destructive'
        });
        return;
      }

      sessionId = data.id;
      setCurrentSession(sessionId);
      setSessions(prev => [data, ...prev]);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: allMessages,
          model: selectedModel,
          sessionId: sessionId
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro na API');
      }

      const { data } = response;

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        tokens: data.usage?.completion_tokens,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao enviar mensagem',
        variant: 'destructive'
      });

      // Remove user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md w-full text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">RS-IA</h2>
          <p className="text-muted-foreground mb-4">
            Faça login para acessar o chat com IA
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Fazer Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r flex flex-col">
        <div className="p-4 border-b">
          <Button
            onClick={createNewSession}
            className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-600 text-slate-800 font-semibold shadow-lg border border-amber-300 rounded-xl transition-all duration-200 hover:shadow-xl"
          >
            <Plus className="h-5 w-5 text-slate-700" />
            <span className="text-base">Nova conversa</span>
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-accent group ${currentSession === session.id ? 'bg-accent' : ''
                  }`}
                onClick={() => setCurrentSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageSquare className="h-4 w-4 text-slate-600 flex-shrink-0" />
                    <span className="text-sm truncate text-slate-800 font-medium">{session.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs text-slate-700 mt-1 font-medium">
                  {new Date(session.updated_at).toLocaleDateString('pt-BR')}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-card">
          <div className="space-y-4">
            {/* Card de Aviso de Créditos */}
            <CreditWarningCard />

            <div
              className="flex items-center gap-2 mb-3 cursor-pointer hover:bg-accent p-2 rounded-lg transition-colors"
              onClick={() => navigate('/ia/configuracao')}
            >
              <Edit3 className="h-5 w-5 text-primary" />
              <span className="text-base font-bold text-foreground">Configurar IA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">RS-IA</h1>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] uppercase font-bold">
                  Memória Ativa
                </Badge>
                {aiConfig?.ai_prompt && (
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-purple-100 text-purple-800">
                    Prompt Customizado
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="min-w-[200px]">
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger className="w-full h-10 text-sm bg-background border-border">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px] bg-background border-border">
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.model_id} className="cursor-pointer hover:bg-accent focus:bg-accent">
                        <div className="flex flex-col py-2 w-full">
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-semibold text-foreground text-sm">{model.display_name || 'Modelo'}</span>
                            {model.supports_vision && (
                              <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800">
                                Visão
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {model.provider || 'AI'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {model.max_tokens ? model.max_tokens.toLocaleString() : 'N/A'} tokens
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <Bot className="h-8 w-8 text-slate-800 font-bold" />
                </div>
                <p className="text-muted-foreground">
                  Converse com a IA mais inteligente. Inicie digitando sua mensagem abaixo.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {message.role === 'user' ? 'Você' : 'Assistente'}
                      </span>
                      {message.tokens && (
                        <Badge variant="outline" className="text-xs">
                          {message.tokens} tokens
                        </Badge>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-2">Assistente</div>
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">Digitando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4 bg-card/50">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              placeholder="Digite sua mensagem para o RS-IA..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatIA;