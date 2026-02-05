import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const openAIApiKey = Deno.env.get('OPENROUTER_API_KEY')!;
let evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')!;
const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')!;

// Ensure Evolution API URL has protocol
if (!evolutionApiUrl.startsWith('http://') && !evolutionApiUrl.startsWith('https://')) {
  evolutionApiUrl = `https://${evolutionApiUrl}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido');
    }

    const { action, payload } = await req.json();
    console.log('WhatsApp Baileys action:', action, payload);

    switch (action) {
      case 'create_instance':
        return await createInstance(payload, authHeader);
      case 'send_message':
        return await sendMessage(payload, authHeader);
      case 'get_instances':
        return await getInstances(payload, authHeader);
      case 'delete_instance':
        return await deleteInstance(payload, authHeader);
      case 'update_qr':
        return await updateQRCode(payload, authHeader);
      default:
        throw new Error(`Ação não suportada: ${action}`);
    }
  } catch (error) {
    console.error('Erro no WhatsApp Baileys:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function createInstance(payload: any, authHeader: string) {
  const { user_id, instance_name } = payload;

  console.log('Criando instância WhatsApp para user_id:', user_id);

  // Test Evolution API connection first
  console.log('=== TESTING EVOLUTION API CONNECTION ===');
  console.log('Evolution API URL:', evolutionApiUrl);
  console.log('Evolution API Key exists:', !!evolutionApiKey);
  console.log('Evolution API Key length:', evolutionApiKey?.length || 0);

  try {
    const testResponse = await fetch(evolutionApiUrl, {
      method: 'GET',
      headers: {
        'apikey': evolutionApiKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Evolution API test response status:', testResponse.status);
    const testText = await testResponse.text();
    console.log('Evolution API test response body:', testText);

    if (!testResponse.ok) {
      console.error('Evolution API test failed with status:', testResponse.status);
      throw new Error(`Evolution API não está respondendo (status: ${testResponse.status}). Verifique a URL e chave API.`);
    }
  } catch (testError) {
    console.error('Evolution API connection test error:', testError);
    throw new Error(`Erro ao conectar com Evolution API: ${testError instanceof Error ? testError.message : 'Erro desconhecido'}`);
  }
  console.log('=== EVOLUTION API CONNECTION OK ===');

  // Criar cliente Supabase com token do usuário
  const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  });

  // Verificar se usuário tem créditos disponíveis
  const { data: creditData, error: creditError } = await userSupabase.rpc('consume_ai_credit', {
    p_user_id: user_id,
    p_credits: 0 // Apenas verificar, não consumir ainda
  });

  if (creditError) {
    console.error('Erro ao verificar créditos:', creditError);
    throw new Error('Erro ao verificar créditos IA');
  }

  if (!creditData) {
    throw new Error('Limite de créditos IA atingido');
  }

  console.log('Criando instância na Evolution API...');
  console.log('Evolution API URL:', evolutionApiUrl);
  console.log('Evolution API Key (primeiros 10 chars):', evolutionApiKey?.substring(0, 10));

  // Criar instância na Evolution API
  const evolutionResponse = await fetch(`${evolutionApiUrl}/instance/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey
    },
    body: JSON.stringify({
      instanceName: instance_name,
      token: `token_${user_id}_${Date.now()}`,
      qrcode: true
    })
  });

  if (!evolutionResponse.ok) {
    const errorData = await evolutionResponse.json();
    console.error('Erro na Evolution API:', errorData);
    throw new Error(`Erro ao criar instância na Evolution API: ${errorData.message || 'Erro desconhecido'}`);
  }

  const evolutionData = await evolutionResponse.json();
  console.log('Instância criada na Evolution API:', evolutionData);

  // Obter QR Code da instância
  let qrCode = null;
  try {
    const qrResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instance_name}`, {
      headers: {
        'apikey': evolutionApiKey
      }
    });

    if (qrResponse.ok) {
      const qrData = await qrResponse.json();
      qrCode = qrData.base64 || qrData.qrcode;
    }
  } catch (qrError) {
    console.error('Erro ao obter QR Code:', qrError);
  }

  // Criar instância no banco usando o cliente autenticado
  const { data, error } = await userSupabase
    .from('whatsapp_instances')
    .insert({
      user_id,
      instance_name,
      status: 'awaiting_scan',
      qr_code: qrCode
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir instância:', error);
    throw new Error(`Erro ao criar instância: ${error.message}`);
  }

  console.log('Instância criada com sucesso:', data);

  return new Response(
    JSON.stringify({
      success: true,
      instance: data,
      evolution_data: evolutionData
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendMessage(payload: any, authHeader: string) {
  const { user_id, instance_id, to_number, context } = payload;

  // Criar cliente Supabase com token do usuário
  const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  });

  // Verificar se instância existe
  const { data: instance, error: instanceError } = await userSupabase
    .from('whatsapp_instances')
    .select('*')
    .eq('id', instance_id)
    .eq('user_id', user_id)
    .single();

  if (instanceError || !instance) {
    throw new Error('Instância WhatsApp não encontrada');
  }

  // Verificar e consumir crédito
  const { data: creditData, error: creditError } = await userSupabase.rpc('consume_ai_credit', {
    p_user_id: user_id,
    p_credits: 1
  });

  if (creditError || !creditData) {
    throw new Error('Limite de créditos IA atingido. Faça upgrade do seu plano.');
  }

  // Cliente administrativo para buscar configurações globais se necessário
  const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

  // Gerar mensagem com IA
  const aiMessage = await generateAIMessage(context, user_id, serviceSupabase);

  // Enviar mensagem via Evolution API
  console.log(`Enviando mensagem via Evolution API para ${to_number}: ${aiMessage}`);

  const sendResponse = await fetch(`${evolutionApiUrl}/message/sendText/${instance.instance_name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey
    },
    body: JSON.stringify({
      number: to_number,
      text: aiMessage
    })
  });

  if (!sendResponse.ok) {
    const errorData = await sendResponse.json();
    console.error('Erro ao enviar mensagem via Evolution API:', errorData);
    throw new Error(`Erro ao enviar mensagem: ${errorData.message || 'Erro desconhecido'}`);
  }

  const sendData = await sendResponse.json();
  console.log('Mensagem enviada via Evolution API:', sendData);

  // Salvar mensagem no banco
  const { data: messageData, error } = await userSupabase
    .from('whatsapp_messages')
    .insert({
      user_id,
      instance_id,
      to_number,
      message_content: aiMessage,
      message_type: 'text',
      status: 'sent',
      ai_generated: true,
      context
    })
    .select()
    .single();

  if (error) throw error;

  console.log('Mensagem WhatsApp salva:', messageData);

  return new Response(
    JSON.stringify({
      success: true,
      message: messageData,
      evolution_response: sendData,
      credits_consumed: 1
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateAIMessage(context: any, user_id: string, serviceSupabase: any) {
  const { tipo, aluno_nome, valor, dias_vencimento, chave_pix } = context;

  // Buscar configuração da IA do usuário
  const { data: config } = await serviceSupabase
    .from('ai_configuration')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle();

  const systemPrompt = config?.system_prompt || 'Você é um assistente que gera mensagens profissionais para escolas sobre mensalidades. Seja sempre educado, claro e inclua todas as informações fornecidas.';
  const aiMemory = config?.ai_memory ? `\n\nInformações Adicionais (Memória da sua IA):\n${config.ai_memory}` : '';

  let userPrompt = '';

  switch (tipo) {
    case 'antes_vencimento':
      userPrompt = `Gere uma mensagem amigável e profissional para lembrar sobre o pagamento da mensalidade que vence em ${dias_vencimento} dias. 
      Dados: Aluno: ${aluno_nome}, Valor: R$ ${valor}, Chave PIX: ${chave_pix}
      Seja cordial e inclua todas as informações importantes.`;
      break;
    case 'no_vencimento':
      userPrompt = `Gere uma mensagem amigável e profissional lembrando que a mensalidade vence hoje.
      Dados: Aluno: ${aluno_nome}, Valor: R$ ${valor}, Chave PIX: ${chave_pix}
      Seja cordial e inclua todas as informações importantes.`;
      break;
    case 'apos_vencimento':
      userPrompt = `Gere uma mensagem profissional mas firme sobre mensalidade em atraso há ${Math.abs(dias_vencimento)} dias.
      Dados: Aluno: ${aluno_nome}, Valor: R$ ${valor}, Chave PIX: ${chave_pix}
      Seja respeitoso mas deixe claro que o pagamento está atrasado.`;
      break;
    case 'saudacao':
      userPrompt = `Gere uma mensagem curta e simpática de saudação (ex: Bom dia ou Boa tarde) para os pais do aluno ${aluno_nome}.`;
      break;
    case 'data_festiva':
      userPrompt = `Gere uma mensagem curta e carinhosa para uma data festiva ou feriado dedicada aos pais do aluno ${aluno_nome}.`;
      break;
    default:
      userPrompt = `Gere uma mensagem profissional sobre mensalidade escolar.
      Dados: Aluno: ${aluno_nome}, Valor: R$ ${valor}, Chave PIX: ${chave_pix}`;
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}${aiMemory}`
        },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.7
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Desculpe, não consegui gerar a mensagem no momento.';
}

async function getInstances(payload: any, authHeader: string) {
  const { user_id } = payload;

  // Criar cliente Supabase com token do usuário
  const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  });

  const { data: dbInstances, error } = await userSupabase
    .from('whatsapp_instances')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Verificar status de cada instância na Evolution API
  const instancesWithStatus = await Promise.all(
    dbInstances.map(async (instance) => {
      try {
        const statusResponse = await fetch(`${evolutionApiUrl}/instance/connectionState/${instance.instance_name}`, {
          headers: {
            'apikey': evolutionApiKey
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();

          // Atualizar status se diferente
          if (statusData.instance?.state && statusData.instance.state !== instance.status) {
            await userSupabase
              .from('whatsapp_instances')
              .update({
                status: statusData.instance.state,
                phone_number: statusData.instance.owner || instance.phone_number
              })
              .eq('id', instance.id);

            return {
              ...instance,
              status: statusData.instance.state,
              phone_number: statusData.instance.owner || instance.phone_number
            };
          }
        }
      } catch (err) {
        console.error(`Erro ao verificar status da instância ${instance.id}:`, err);
      }

      return instance;
    })
  );

  return new Response(
    JSON.stringify({ success: true, instances: instancesWithStatus }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteInstance(payload: any, authHeader: string) {
  const { user_id, instance_id } = payload;

  // Criar cliente Supabase com token do usuário
  const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  });

  // Obter detalhes da instância antes de deletar
  const { data: instance, error: fetchError } = await userSupabase
    .from('whatsapp_instances')
    .select('instance_name')
    .eq('id', instance_id)
    .eq('user_id', user_id)
    .single();

  if (fetchError || !instance) {
    throw new Error('Instância não encontrada');
  }

  // Deletar instância da Evolution API
  try {
    const deleteResponse = await fetch(`${evolutionApiUrl}/instance/delete/${instance.instance_name}`, {
      method: 'DELETE',
      headers: {
        'apikey': evolutionApiKey
      }
    });

    if (deleteResponse.ok) {
      console.log(`Instância ${instance.instance_name} deletada da Evolution API`);
    } else {
      console.error('Erro ao deletar da Evolution API:', await deleteResponse.text());
    }
  } catch (evolutionError) {
    console.error('Erro ao deletar da Evolution API:', evolutionError);
    // Continua com a deleção do banco mesmo se falhar na Evolution API
  }

  // Deletar do banco de dados
  const { error } = await userSupabase
    .from('whatsapp_instances')
    .delete()
    .eq('id', instance_id)
    .eq('user_id', user_id);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateQRCode(payload: any, authHeader: string) {
  const { user_id, instance_id } = payload;

  // Criar cliente Supabase com token do usuário
  const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  });

  // Obter detalhes da instância
  const { data: instance, error: fetchError } = await userSupabase
    .from('whatsapp_instances')
    .select('*')
    .eq('id', instance_id)
    .eq('user_id', user_id)
    .single();

  if (fetchError || !instance) {
    throw new Error('Instância não encontrada');
  }

  try {
    // Tentar obter QR Code atualizado da Evolution API
    const qrResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instance.instance_name}`, {
      headers: {
        'apikey': evolutionApiKey
      }
    });

    let qrCode = instance.qr_code; // Manter o QR atual se não conseguir atualizar

    if (qrResponse.ok) {
      const qrData = await qrResponse.json();
      qrCode = qrData.base64 || qrData.qrcode || instance.qr_code;
    }

    // Atualizar no banco
    const { data: updatedInstance, error: updateError } = await userSupabase
      .from('whatsapp_instances')
      .update({ qr_code: qrCode })
      .eq('id', instance_id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        instance: updatedInstance
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao atualizar QR Code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    throw new Error(`Erro ao atualizar QR Code: ${errorMessage}`);
  }
}