import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_financial_performance',
      description: 'Obtém o desempenho financeiro (lucro, receita, despesa) de um mês específico.',
      parameters: {
        type: 'object',
        properties: {
          competencia: { type: 'string', description: 'O mês/ano no formato YYYY-MM (ex: 2024-12).' }
        },
        required: ['competencia']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_overdue_analysis',
      description: 'Analisa mensalidades atrasadas e lista os alunos inadimplentes.'
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_van_performance',
      description: 'Obtém o desempenho e lotação de cada van para uma competência específica.',
      parameters: {
        type: 'object',
        properties: {
          competencia: { type: 'string', description: 'O mês/ano no formato YYYY-MM.' }
        },
        required: ['competencia']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_student_info',
      description: 'Busca informações detalhadas de alunos (nome, whatsapp, van, mensalidade).',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Nome parcial ou total do aluno para busca. Se vazio, lista os primeiros.' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_daily_cashflow',
      description: 'Obtém o fluxo de caixa detalhado de uma data específica (hoje por padrão).',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Data no formato YYYY-MM-DD.' }
        }
      }
    }
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) throw new Error('OPENROUTER_API_KEY não configurada');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; // Use Service Role for Tool Access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { messages, model, sessionId } = await req.json();

    // 1. Identificar Usuário pelo Token de Autorização
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Autorização necessária');

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) throw new Error('Usuário não autenticado ou token inválido');

    console.log(`RS-IA: Processando chat para usuário ${user.id}`);

    // Adicionar contexto de data atual no System Prompt
    const today = new Date();
    const dateContext = `Hoje é ${today.toLocaleDateString('pt-BR')}. Competência atual: ${today.toISOString().substring(0, 7)}.`;

    // 1.5 Fetch System Context (AI Memory)
    const { count: studentCount } = await supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { data: vans } = await supabase.from('vans').select('nome, modelo, placa').eq('user_id', user.id);

    // Obter saldo do mês atual
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

    const { data: gastos } = await supabase.from('gastos').select('valor, tipo').eq('user_id', user.id).gte('data', startOfMonth).lte('data', endOfMonth);
    const totalDespesas = gastos?.filter(g => g.tipo === 'despesa').reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;
    const totalReceitas = gastos?.filter(g => g.tipo === 'receita').reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;

    const vansList = vans?.map(v => `${v.nome} (${v.modelo})`).join(', ') || "Nenhuma van cadastrada";

    const systemContext = `
      CONTEXTO DO SISTEMA DO USUÁRIO:
      - Total de Alunos: ${studentCount || 0}
      - Vans Cadastradas: ${vansList}
      - Financeiro (Mês Atual): Receitas R$ ${totalReceitas.toFixed(2)} / Despesas R$ ${totalDespesas.toFixed(2)}
      
      Use estes dados para responder perguntas como "Quantos alunos eu tenho?" ou "Como está meu financeiro?".
    `;

    // Atualizar ou garantir que a primeira mensagem seja o system prompt atualizado
    const enhancedMessages = [
      {
        role: 'system',
        content: `Você é o cérebro da plataforma Rota Fácil. Você dá suporte TOTAL ao transportador escolar.
      Sempre use ferramentas para buscar dados precisos se o usuário perguntar algo específico.
      
      CONCEITOS IMPORTANTES:
      - ALUNOS: São seus CLIENTES. Eles geram a RENDA da empresa através das mensalidades.
      - COLABORADORES: São os seus FUNCIONÁRIOS (Sua Equipe). Inclui Motoristas e Monitoras.
      NUNCA confunda alunos com funcionários. Alunos pagam, Colaboradores trabalham.
      
      GUIA DE NAVEGAÇÃO (Forneça links se necessário):
      - Painel: /app | Alunos: /alunos | Financeiro: /financeiro | Mensalidades: /mensalidades | Colaboradores: /equipe | Vans: /alunos/gerenciar-van
      
      REGRAS:
      - Para detalhes de alunos/contatos/mensalidades: use 'get_student_info'.
      - Para fluxo de caixa de hoje: use 'get_daily_cashflow'.
      - Para desempenho mensal/anual: use 'get_financial_performance'.
      - Para inadimplentes: use 'get_overdue_analysis'.
      
      PERSONALIDADE/MODO DE OPERAÇÃO:
      ${"Seja um assistente profissional e prestativo."}
      
      RESUMO ATUAL: Alunos: ${studentCount || 0} | Vans: ${vansList} | ${dateContext}`
      },
      ...messages
    ];

    // 2. Primeira chamada ao OpenRouter com ferramentas
    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rotafacil.lovable.app',
        'X-Title': 'RS-IA Ecosystem'
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-3-haiku', // Haiku é excelente para ferramentas
        messages: enhancedMessages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0,
      }),
    });

    let data = await response.json();
    let message = data.choices[0].message;

    // 3. Loop de Execução de Ferramentas (se houver tool_calls)
    if (message.tool_calls) {
      console.log(`IA solicitou ${message.tool_calls.length} ferramentas`);
      enhancedMessages.push(message);

      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let result;

        console.log(`Executando ferramenta: ${functionName}`, args);

        try {
          if (functionName === 'get_financial_performance') {
            const { data: res } = await supabase.rpc('get_ai_financial_performance', {
              p_user_id: user.id,
              p_competencia: args.competencia
            });
            result = res;
          } else if (functionName === 'get_overdue_analysis') {
            const { data: res } = await supabase.rpc('get_ai_overdue_analysis', {
              p_user_id: user.id
            });
            result = res;
          } else if (functionName === 'get_van_performance') {
            const { data: res } = await supabase.rpc('get_ai_van_performance', {
              p_user_id: user.id,
              p_competencia: args.competencia
            });
            result = res;
          }

          enhancedMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: functionName,
            content: JSON.stringify(result || { message: 'Nenhum dado encontrado.' })
          });
        } catch (toolError) {
          console.error(`Erro ao executar ferramenta ${functionName}:`, toolError);
          enhancedMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: functionName,
            content: JSON.stringify({ error: toolError.message })
          });
        }
      }

      // Segunda chamada ao OpenRouter com os resultados das ferramentas
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'anthropic/claude-3-haiku',
          messages: enhancedMessages,
        }),
      });

      data = await response.json();
      message = data.choices[0].message;
    }

    const assistantContent = message.content;

    // 4. Consumir Crédito
    await supabase.rpc('consume_ai_credit', { user_uuid: user.id, amount: 2 }); // Tool calling consome slightly mais

    // 5. Salvar Log do Ecossistema
    await supabase.from('ai_ecosystem_logs').insert({
      user_id: user.id,
      action_type: 'chat_query',
      status: 'success',
      details: { model: data.model, tokens: data.usage }
    });

    // 6. Salvar Histórico se sessionId existir
    if (sessionId) {
      try {
        const userMsg = messages[messages.length - 1];
        await supabase.from('chat_messages').insert([
          { session_id: sessionId, role: 'user', content: userMsg.content },
          { session_id: sessionId, role: 'assistant', content: assistantContent }
        ]);
      } catch (e) { console.error('Erro ao salvar histórico'); }
    }

    return new Response(JSON.stringify({
      success: true,
      message: assistantContent,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro RS-IA:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});