import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { email, password: rawPassword, nome, aluno_id, cpf } = await req.json();
        const password = rawPassword || "123456";

        if (!email) {
            return new Response(
                JSON.stringify({ success: false, error: "Email é obrigatório" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Usar service_role para criar usuário
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // Verificar se já existe usuário com esse email
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);

        let userId: string;

        if (existingUser) {
            // Usuário já existe, atualizar senha se fornecida e vincular ao aluno
            userId = existingUser.id;

            if (password) {
                const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                    password: password
                });
                if (updateError) {
                    console.error("Erro ao atualizar senha:", updateError);
                } else {
                    console.log("Senha do usuário atualizada com sucesso");
                }
            }

            console.log("Usuário já existe, vinculando ao aluno:", userId);
        } else {
            // Criar novo usuário
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true, // Auto-confirmar email
                user_metadata: {
                    user_type: "responsavel",
                    nome: nome,
                    cpf: cpf
                }
            });

            if (createError) {
                console.error("Erro ao criar usuário:", createError);
                return new Response(
                    JSON.stringify({ success: false, error: createError.message }),
                    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            userId = newUser.user.id;
            console.log("Novo usuário criado:", userId);
        }

        // Vincular responsável ao aluno
        if (aluno_id && userId) {
            const { error: linkError } = await supabaseAdmin
                .from("responsavel_alunos")
                .upsert({
                    responsavel_id: userId,
                    aluno_id: aluno_id
                }, { onConflict: "responsavel_id,aluno_id" });

            if (linkError) {
                console.error("Erro ao vincular responsável:", linkError);
            } else {
                console.log("Responsável vinculado ao aluno com sucesso");
            }
        }

        return new Response(
            JSON.stringify({ success: true, user_id: userId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error("Erro na Edge Function:", error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
