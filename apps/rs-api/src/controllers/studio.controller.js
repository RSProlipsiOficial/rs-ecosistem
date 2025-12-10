/**
 * RS STUDIO CONTROLLER
 * Lógica de negócio para IA e Treinamento
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ================================================
// CHAT IA
// ================================================

exports.sendMessage = async (req, res) => {
  try {
    const { user_id, message, conversation_id, role = 'coach' } = req.body;
    
    // Buscar contexto do usuário
    const { data: userData } = await supabase
      .from('consultores')
      .select('*, wallet:wallets(*)')
      .eq('id', user_id)
      .single();
    
    // Criar contexto para IA
    const context = `
      Usuário: ${userData.nome}
      Nível: ${userData.nivel_carreira}
      Ciclos: ${userData.ciclos_completados}
      Saldo: R$ ${userData.wallet.saldo_disponivel}
    `;
    
    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Você é o Pai Baluco, assistente da RS Prólipsi. Papel: ${role}. Contexto: ${context}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const response = completion.choices[0].message.content;
    
    // Salvar mensagem
    await supabase.rpc('log_assistant_message', {
      p_conversation_id: conversation_id,
      p_sender: 'user',
      p_content: message
    });
    
    await supabase.rpc('log_assistant_message', {
      p_conversation_id: conversation_id,
      p_sender: 'assistant',
      p_content: response
    });
    
    res.json({
      success: true,
      message: response,
      tokens_used: completion.usage.total_tokens
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('assistant_conversations')
      .select('*, messages:assistant_messages(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    res.json({ success: true, conversations: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const { error } = await supabase
      .from('assistant_conversations')
      .delete()
      .eq('id', conversationId);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Conversa deletada' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// TREINAMENTOS
// ================================================

exports.listTrainings = async (req, res) => {
  try {
    const { category, level } = req.query;
    
    let query = supabase
      .from('training_videos')
      .select('*')
      .eq('is_active', true);
    
    if (category) query = query.eq('category', category);
    if (level) query = query.eq('level', level);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, trainings: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTraining = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('training_videos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, training: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { user_id, video_id, progress_percent, last_position } = req.body;
    
    const { data, error } = await supabase.rpc('update_training_progress', {
      p_user_id: user_id,
      p_video_id: video_id,
      p_progress_percent: progress_percent,
      p_last_position: last_position
    });
    
    if (error) throw error;
    
    res.json({ success: true, progress: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('training_progress')
      .select('*, video:training_videos(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.json({ success: true, progress: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// QUIZZES
// ================================================

exports.submitQuiz = async (req, res) => {
  try {
    const { user_id, video_id, answers } = req.body;
    
    // Buscar quiz
    const { data: video } = await supabase
      .from('training_videos')
      .select('quiz_questions')
      .eq('id', video_id)
      .single();
    
    // Calcular score
    let correct = 0;
    const questions = video.quiz_questions;
    
    answers.forEach((answer, index) => {
      if (answer === questions[index].correct_answer) {
        correct++;
      }
    });
    
    const score = (correct / questions.length) * 100;
    const passed = score >= 70;
    
    // Atualizar progresso
    const { data, error } = await supabase
      .from('training_progress')
      .update({
        quiz_score: score,
        quiz_passed: passed,
        quiz_attempts: supabase.raw('quiz_attempts + 1')
      })
      .eq('user_id', user_id)
      .eq('video_id', video_id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      score,
      passed,
      correct,
      total: questions.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getQuizResults = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('training_progress')
      .select('quiz_score, quiz_passed, video:training_videos(title)')
      .eq('user_id', userId)
      .not('quiz_score', 'is', null);
    
    if (error) throw error;
    
    res.json({ success: true, results: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// CERTIFICADOS
// ================================================

exports.getUserCertificates = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('training_progress')
      .select('*, video:training_videos(*)')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .eq('quiz_passed', true);
    
    if (error) throw error;
    
    res.json({ success: true, certificates: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Gerar PDF do certificado
    // (implementar geração de PDF aqui)
    
    res.json({ success: true, message: 'Certificado em desenvolvimento' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// GERAÇÃO DE CONTEÚDO
// ================================================

exports.generateImage = async (req, res) => {
  try {
    const { user_id, prompt } = req.body;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "hd"
    });
    
    const image_url = response.data[0].url;
    
    // Salvar no banco
    const { data, error } = await supabase
      .from('generated_content')
      .insert({
        user_id,
        content_type: 'image',
        prompt,
        result_url: image_url,
        provider: 'OpenAI',
        model: 'dall-e-3',
        status: 'completed'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, image_url, content_id: data.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.generateAudio = async (req, res) => {
  try {
    const { user_id, text } = req.body;
    
    // Implementar ElevenLabs aqui
    
    res.json({ success: true, message: 'Áudio em desenvolvimento' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.generateText = async (req, res) => {
  try {
    const { user_id, prompt, use_case } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Você é um copywriter especialista em vendas."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });
    
    const text = completion.choices[0].message.content;
    
    // Salvar no banco
    const { data, error } = await supabase
      .from('generated_content')
      .insert({
        user_id,
        content_type: 'text',
        use_case,
        prompt,
        result_data: { text },
        provider: 'OpenAI',
        model: 'gpt-4-turbo-preview',
        status: 'completed'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, text, content_id: data.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getContentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, content: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// BASE DE CONHECIMENTO
// ================================================

exports.searchKnowledge = async (req, res) => {
  try {
    const { query } = req.query;
    
    // Busca simples (implementar busca vetorial depois)
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(5);
    
    if (error) throw error;
    
    res.json({ success: true, results: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFAQ = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('knowledge_faq')
      .select('*')
      .eq('is_active', true);
    
    if (category) query = query.eq('category', category);
    
    const { data, error } = await query.order('priority', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, faq: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markFAQHelpful = async (req, res) => {
  try {
    const { faq_id, helpful } = req.body;
    
    const field = helpful ? 'helpful_count' : 'not_helpful_count';
    
    const { error } = await supabase
      .from('knowledge_faq')
      .update({ [field]: supabase.raw(`${field} + 1`) })
      .eq('id', faq_id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Feedback registrado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ================================================
// NOTIFICAÇÕES
// ================================================

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    res.json({ success: true, notifications: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date() })
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Notificação marcada como lida' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Notificação deletada' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
