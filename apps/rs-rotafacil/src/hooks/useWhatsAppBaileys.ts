import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppInstance {
  id: string;
  instance_name: string;
  status: 'disconnected' | 'creating' | 'awaiting_scan' | 'connected';
  qr_code?: string;
  phone_number?: string;
  created_at: string;
}

export interface WhatsAppMessage {
  id: string;
  to_number: string;
  message_content: string;
  status: string;
  ai_generated: boolean;
  context: any;
  created_at: string;
}

export interface AICredits {
  creditos_usados: number;
  limite_mensal: number;
  mes: number;
  ano: number;
}

export const useWhatsAppBaileys = () => {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [credits, setCredits] = useState<AICredits | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar instâncias do usuário
  const fetchInstances = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await supabase.functions.invoke('whatsapp-baileys', {
        body: {
          action: 'get_instances',
          payload: { user_id: user.id }
        }
      });

      if (response.data?.instances) {
        console.log('Instâncias WhatsApp carregadas:', response.data.instances);
        setInstances(response.data.instances);
      }
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
    }
  };

  // Buscar créditos IA do usuário
  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentDate = new Date();
      const mes = currentDate.getMonth() + 1;
      const ano = currentDate.getFullYear();

      const { data, error } = await supabase
        .from('user_ai_credits')
        .select('*')
        .eq('user_id', user.id)
        .eq('mes', mes)
        .eq('ano', ano)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCredits(data || {
        creditos_usados: 0,
        limite_mensal: 100,
        mes,
        ano
      });
    } catch (error) {
      console.error('Erro ao buscar créditos:', error);
    }
  };

  // Criar nova instância WhatsApp
  const createInstance = async (instanceName: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Criando instância WhatsApp:', {
        user_id: user.id,
        instance_name: instanceName
      });

      const response = await supabase.functions.invoke('whatsapp-baileys', {
        body: {
          action: 'create_instance',
          payload: {
            user_id: user.id,
            instance_name: instanceName
          }
        }
      });

      console.log('Resposta da edge function:', response);

      if (response.error) {
        console.error('Erro na edge function:', response.error, 'Body:', response.data);
        const serverMsg = (response.data as any)?.error;
        throw new Error(`Erro na função: ${serverMsg || response.error.message || response.error}`);
      }

      if (response.data?.success && response.data?.instance) {
        // Atualizar a lista de instâncias
        await fetchInstances();
        toast({
          title: "Instância criada!",
          description: "Escaneie o QR Code para conectar seu WhatsApp",
        });
        return response.data.instance;
      } else {
        throw new Error(response.data?.error || 'Erro desconhecido na criação da instância');
      }
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao criar instância",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensagem via IA
  const sendAIMessage = async (
    instanceId: string, 
    toNumber: string, 
    context: any
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await supabase.functions.invoke('whatsapp-baileys', {
        body: {
          action: 'send_message',
          payload: {
            user_id: user.id,
            instance_id: instanceId,
            to_number: toNumber,
            context
          }
        }
      });

      if (response.data?.message) {
        toast({
          title: "Mensagem enviada!",
          description: `Mensagem IA enviada para ${toNumber}`,
        });
        
        // Atualizar créditos
        await fetchCredits();
        
        return response.data.message;
      }
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Deletar instância
  const deleteInstance = async (instanceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      await supabase.functions.invoke('whatsapp-baileys', {
        body: {
          action: 'delete_instance',
          payload: {
            user_id: user.id,
            instance_id: instanceId
          }
        }
      });

      setInstances(prev => prev.filter(instance => instance.id !== instanceId));
      toast({
        title: "Instância removida",
        description: "Instância WhatsApp foi removida com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover instância",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Atualizar QR Code de uma instância
  const updateQRCode = async (instanceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await supabase.functions.invoke('whatsapp-baileys', {
        body: {
          action: 'update_qr',
          payload: {
            user_id: user.id,
            instance_id: instanceId
          }
        }
      });

      if (response.data?.success) {
        // Atualizar a lista de instâncias
        await fetchInstances();
        toast({
          title: "QR Code atualizado!",
          description: "O QR Code foi atualizado com sucesso",
        });
        return response.data.instance;
      } else {
        throw new Error(response.data?.error || 'Erro ao atualizar QR Code');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar QR Code",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Buscar mensagens
  const fetchMessages = async (instanceId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (instanceId) {
        query = query.eq('instance_id', instanceId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  useEffect(() => {
    fetchInstances();
    fetchCredits();
  }, []);

  return {
    instances,
    messages,
    credits,
    loading,
    createInstance,
    sendAIMessage,
    deleteInstance,
    fetchInstances,
    fetchMessages,
    fetchCredits,
    updateQRCode
  };
};