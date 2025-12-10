import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Client para ler usuário autenticado a partir do JWT do request
  const authClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

  // Client com service role para operações administrativas
  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 1) Verifica usuário logado
  const { data: userData, error: userErr } = await authClient.auth.getUser();
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: "Não autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // 2) Verifica se é admin usando a tabela admin_emails
  const email = userData.user.email ?? "";
  const { data: adminRows, error: adminErr } = await service
    .from("admin_emails")
    .select("email")
    .eq("email", email);

  if (adminErr || !adminRows || adminRows.length === 0) {
    return new Response(JSON.stringify({ error: "Acesso negado" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    if (req.method === "GET") {
      // Lista até 200 usuários por página (poderia paginar depois)
      const { data, error } = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (error) throw error;

      const users = (data?.users ?? []).map((u: any) => ({
        id: u.id,
        nome: u.user_metadata?.name ?? "",
        email: u.email,
        telefone: u.user_metadata?.phone ?? "",
        status: u.user_metadata?.status ?? "ativo",
        tipo_usuario: u.user_metadata?.user_type ?? "usuario",
        created_at: u.created_at,
        updated_at: u.updated_at,
        ultimo_login: u.last_sign_in_at ?? null,
      }));

      return new Response(JSON.stringify({ users }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { nome, email: newEmail, password, telefone, tipo_usuario, metadata } = body ?? {};

      if (!newEmail || !password || password.length < 6) {
        return new Response(JSON.stringify({ error: "Email e senha (>=6) são obrigatórios" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const { data, error } = await service.auth.admin.createUser({
        email: newEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name: metadata?.name || nome || "",
          phone: metadata?.phone || telefone || "",
          user_type: metadata?.user_type || tipo_usuario || "user",
          status: "ativo",
        },
      });
      if (error) throw error;

      return new Response(JSON.stringify({ user: data.user }), {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const { userId, password, metadata } = body ?? {};

      if (!userId) {
        return new Response(JSON.stringify({ error: "ID do usuário é obrigatório" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const updateData: any = {};

      // Se tem senha, atualiza a senha
      if (password && password.length >= 6) {
        updateData.password = password;
      }

      // Se tem metadata, atualiza os metadados do usuário
      if (metadata) {
        updateData.user_metadata = metadata;
      }

      const { data, error } = await service.auth.admin.updateUserById(userId, updateData);
      if (error) throw error;

      return new Response(JSON.stringify({ 
        message: password ? "Senha resetada com sucesso" : "Usuário atualizado com sucesso",
        user: data.user 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: "Método não suportado" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("admin-users error", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Erro interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});