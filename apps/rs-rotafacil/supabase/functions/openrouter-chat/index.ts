import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY não configurada');
    }

    const { messages, model, sessionId } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Chama a API do OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rotafacil.lovable.app',
        'X-Title': 'RotaFácil Chat IA'
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-3-sonnet',
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      throw new Error(`Erro da API OpenRouter: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Resposta inválida da API OpenRouter');
    }

    const assistantMessage = data.choices[0].message.content;

    // Salvar mensagens no Supabase se sessionId fornecido
    if (sessionId) {
      try {
        // Salvar mensagem do usuário
        const userMessage = messages[messages.length - 1];
        if (userMessage.role === 'user') {
          await supabase.from('chat_messages').insert({
            session_id: sessionId,
            role: 'user',
            content: userMessage.content,
            tokens: data.usage?.prompt_tokens || 0
          });
        }

        // Salvar mensagem do assistente
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'assistant', 
          content: assistantMessage,
          tokens: data.usage?.completion_tokens || 0
        });

        // Atualizar título da sessão se for a primeira mensagem
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', sessionId);

        if (count === 2) { // Primeira troca (user + assistant)
          const title = userMessage.content.length > 50 
            ? userMessage.content.substring(0, 50) + '...'
            : userMessage.content;
          
          await supabase
            .from('chat_sessions')
            .update({ title })
            .eq('id', sessionId);
        }
      } catch (dbError) {
        console.error('Erro ao salvar no banco:', dbError);
        // Continua mesmo se falhar ao salvar no banco
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: assistantMessage,
      usage: data.usage,
      model: data.model
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no OpenRouter chat:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});