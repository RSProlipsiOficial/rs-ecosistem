import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { HOLIDAYS } from './holidays.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

        // 1. Determine Date Context
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1; // 0-indexed

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueDay = tomorrow.getDate();

        // Check for Holiday
        const holiday = HOLIDAYS.find(h => h.day === day && h.month === month);

        console.log(`Worker running. Today: ${day}/${month}. Holiday: ${holiday?.name || 'None'}. Due Check: ${dueDay}`);

        const results = [];

        // 2. Fetch Users (Consultants) who accept automation
        // For now, we fetch ALL active students and group by User to process efficient batching or user-level checks.
        // But to keep it simple and robust:

        // Scenario A: Billing (Due Tomorrow)
        const { data: billingStudents, error: billingError } = await supabase
            .from('alunos')
            .select('*, user_profiles:user_id(id, whatsapp)')
            .eq('ativo', true)
            .eq('dia_vencimento', dueDay);

        if (billingError) throw billingError;

        // Scenario B: Holiday (If today is holiday)
        let holidayStudents: any[] = [];
        if (holiday) {
            const { data: allStudents, error: holidayError } = await supabase
                .from('alunos')
                .select('*, user_profiles:user_id(id, whatsapp)')
                .eq('ativo', true);
            if (holidayError) throw holidayError;
            holidayStudents = allStudents || [];
        }

        // Merge lists? 
        // Strategy: Process Billing first. If a student gets a billing message, maybe skip holiday message to avoid spam?
        // Or send both? Let's prioritize Billing.

        // Use a Map to track processed students to avoid double sending if we decided to merge logic.
        // Actually, let's treat them as separate queues but avoid spamming the same student twice in one run.
        const processedStudents = new Set<string>();

        // --- PROCESS BILLING ---
        if (billingStudents && billingStudents.length > 0) {
            console.log(`Processing ${billingStudents.length} billing reminders...`);
            for (const student of billingStudents) {
                if (processedStudents.has(student.id)) continue;

                await processStudentMessage(supabase, openRouterApiKey, student, 'billing', null, results);
                processedStudents.add(student.id);
            }
        }

        // --- PROCESS HOLIDAY ---
        if (holiday && holidayStudents.length > 0) {
            console.log(`Processing ${holidayStudents.length} holiday messages for ${holiday.name}...`);
            for (const student of holidayStudents) {
                if (processedStudents.has(student.id)) {
                    console.log(`Skipping holiday msg for ${student.nome_completo} (already received billing msg)`);
                    continue;
                }

                await processStudentMessage(supabase, openRouterApiKey, student, 'holiday', holiday, results);
                processedStudents.add(student.id);
            }
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Worker Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

async function processStudentMessage(supabase: any, openRouterApiKey: string | undefined, student: any, type: 'billing' | 'holiday', holidayCtx: any, results: any[]) {
    const userId = student.user_id;
    const studentName = student.nome_completo;

    // 1. Credit Check
    const { data: creditData, error: creditError } = await supabase.rpc('has_sufficient_credits', {
        user_uuid: userId,
        required_credits: 1
    });

    if (creditError || !creditData) {
        results.push({ student: studentName, type, status: 'skipped_no_credits' });
        return;
    }

    // 2. Get User AI/WhatsApp Config
    const { data: aiConfig } = await supabase
        .from('ai_configuration')
        .select('*')
        .eq('user_id', userId) // FIX: Fetch specific user config
        .single();

    // Fallback: If no specific config, maybe check for a "global system" config? 
    // For now, strict: User must have config.
    if (!aiConfig || !aiConfig.whatsapp_phone_id || !aiConfig.whatsapp_access_token) {
        results.push({ student: studentName, type, status: 'skipped_no_whatsapp_config' });
        return;
    }

    if (!student.whatsapp_responsavel) {
        results.push({ student: studentName, type, status: 'skipped_no_student_phone' });
        return;
    }

    // 3. Generate Message
    let prompt = "";
    if (type === 'billing') {
        prompt = `
            Você é um assistente do Rota Fácil. O aluno ${studentName} tem mensalidade de R$ ${student.valor_mensalidade} vencendo amanhã.
            O responsável é ${student.nome_responsavel}.
            Gere uma mensagem curta, educada e amigável para o WhatsApp lembrando do vencimento e solicitando o pagamento.
            Seja direto e profissional.
        `;
    } else if (type === 'holiday' && holidayCtx) {
        prompt = `
            Você é um assistente do sistema de transporte escolar Rota Fácil.
            O aluno é ${studentName}, responsável: ${student.nome_responsavel}.
            Hoje é ${holidayCtx.name}.
            ${holidayCtx.prompt}
            Gere uma mensagem de WhatsApp curta, carinhosa e profissional.
        `;
    }

    const messageText = await generateAIResponse(openRouterApiKey, prompt);

    // 4. Send WhatsApp
    const whatsappResponse = await fetch(`https://graph.facebook.com/v17.0/${aiConfig.whatsapp_phone_id}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${aiConfig.whatsapp_access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: student.whatsapp_responsavel.replace(/\D/g, ""),
            text: { body: messageText },
        }),
    });

    if (whatsappResponse.ok) {
        // 5. Deduct Credit
        await supabase.rpc('consume_ai_credit', { user_uuid: userId, amount: 1 });
        results.push({ student: studentName, type, status: 'sent' });
    } else {
        const err = await whatsappResponse.json();
        console.error(`WhatsApp Error for ${studentName}:`, err);
        results.push({ student: studentName, type, status: 'failed_whatsapp', error: err });
    }
}

async function generateAIResponse(apiKey: string | undefined, prompt: string): Promise<string> {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo', // Cost-effective
                messages: [{ role: 'user', content: prompt }],
            }),
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Mensagem automática do Rota Fácil.";
    } catch (e) {
        console.error("AI Error:", e);
        return "Olá! Mensagem automática do Rota Fácil.";
    }
}
