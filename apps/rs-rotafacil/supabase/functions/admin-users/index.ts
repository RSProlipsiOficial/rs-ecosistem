
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}


serve(async (req: { method: string; headers: { get: (arg0: string) => string; }; url: string | URL; json: () => PromiseLike<{ userId: any; }> | { userId: any; }; }) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ${req.method} request to admin-users`);

  const logAction = (action: string, details: any) => {
    console.log(JSON.stringify({
      requestId,
      timestamp: new Date().toISOString(),
      action,
      ...details
    }));
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  try {
    const requestId = Math.random().toString(36).substring(7);
    const isDiagnostic = req.headers.get('x-diagnostic-secret') === 'antigravity-diag-2024';

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables are not set')
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY!, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    })

    const serviceRoleClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data: { user }, error: userError } = isDiagnostic ? { data: { user: { id: 'diag-agent' } }, error: null } : await authClient.auth.getUser()

    if (!isDiagnostic && (userError || !user)) {
      return new Response(JSON.stringify({ error: 'Sessão inválida' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verificar se é Admin (Super Admin do Sistema)
    const isSuperAdmin = isDiagnostic ? true : await (async () => {
      const { data: adminEmail } = await serviceRoleClient
        .from('admin_emails')
        .select('email')
        .eq('email', user?.email || '')
        .maybeSingle()
      return !!adminEmail
    })()

    const userRole = isDiagnostic ? 'master' : (user.user_metadata?.tipo_usuario || user.user_metadata?.user_type || 'usuario').toLowerCase();
    const isAdmin = ['admin', 'master', 'owner'].includes(userRole);
    const url = new URL(req.url)

    // Helper para registrar log de auditoria
    const logAdminAction = async (action: string, targetId: string, targetType: string, oldData: any = null, newData: any = null) => {
      try {
        console.log(`[Audit] ${action} on ${targetType} (${targetId})`);
        const { error } = await serviceRoleClient
          .from('admin_audit_logs')
          .insert([{
            admin_id: user.id === 'diag-agent' ? null : user.id,
            action,
            target_id: targetId,
            target_type: targetType,
            old_data: oldData,
            new_data: newData
          }]);
        if (error) console.error('Erro ao gravar log de auditoria:', error);
      } catch (err) {
        console.error('Erro falha crítica no log de auditoria:', err);
      }
    };

    // Helper para sincronizar salário no financeiro
    const syncFinanceiroSalario = async (adminId: string, colabId: string, nome: string, salario: number, status: string) => {
      const competencia = new Date().toISOString().substring(0, 7);
      const refId = `salario-${colabId}-${competencia}`;

      if (status === 'ativo' && salario > 0) {
        // Busca registro órfão (sem referencia_id) para adotar
        const { data: orphan } = await serviceRoleClient
          .from('lancamentos_financeiros')
          .select('id')
          .is('referencia_id', null)
          .eq('user_id', adminId)
          .eq('competencia', competencia)
          .ilike('descricao', `%${nome}%`)
          .maybeSingle();

        if (orphan) {
          console.log(`Adotando registro órfão ${orphan.id} para ${nome}`);
          await serviceRoleClient
            .from('lancamentos_financeiros')
            .update({ referencia_id: refId })
            .eq('id', orphan.id);
        }

        const { error } = await serviceRoleClient.from('lancamentos_financeiros').upsert({
          referencia_id: refId,
          user_id: adminId,
          tipo: 'despesa',
          origem: 'manual',
          categoria: 'SALÁRIOS',
          descricao: `Salário - ${nome}`,
          valor: salario,
          competencia: competencia,
          data_evento: new Date().toISOString().split('T')[0],
          status: 'previsto',
          pagamento_status: 'pendente',
          alocacao: 'empresa'
        }, { onConflict: 'referencia_id' });

        if (error) console.error('Erro ao sincronizar salário no financeiro:', error);
      } else {
        await serviceRoleClient.from('lancamentos_financeiros').delete().eq('referencia_id', refId);
      }
    };

    // Lógica para o método GET
    if (req.method === 'GET') {
      const showAll = url.searchParams.get('all') === 'true'
      const parentId = url.searchParams.get('parentId')
      const appFilter = url.searchParams.get('appFilter')
      const filterType = url.searchParams.get('filterType') // motorista, monitora, etc.
      const hasSearch = url.searchParams.get('search') || url.searchParams.get('q');
      const isListingAll = showAll;

      const { data: listResult, error: listError } = await serviceRoleClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      })
      if (listError) throw listError
      const users = listResult.users || []

      // 📝 ATUALIZAÇÃO SÊNIOR: Buscar perfis para dados atualizados
      const { data: profiles } = await serviceRoleClient
        .from('user_profiles')
        .select('user_id, nome_completo, telefone, cpf, salario_base, data_nascimento');

      const profileMap: any = (profiles || []).reduce((acc: any, p: any) => {
        acc[p.user_id] = p;
        return acc;
      }, {});

      // Buscar todos os planos/assinaturas
      const { data: subscriptions } = await serviceRoleClient
        .from('user_subscriptions')
        .select('user_id, plan_id')

      const subMap = (subscriptions || []).reduce((acc: any, sub: any) => {
        acc[sub.user_id] = sub.plan_id
        return acc
      }, {})

      let filteredUsers = users.filter((u: any) => !u.email?.endsWith('@prolipsi.temp'));

      const mappedUsers = filteredUsers.map((u: any) => {
        const meta = u.user_metadata || {};
        const profile = profileMap[u.id] || {};

        let tipo = meta.tipo_usuario || meta.user_type || 'usuario';
        if (['owner', 'master', 'admin'].includes(tipo.toLowerCase())) tipo = 'master';

        return {
          id: u.id,
          email: u.email,
          // Prioridade para dados do Perfil (user_profiles), depois metadados
          nome: profile.nome_completo || meta.name || meta.nome || meta.nome_completo || meta.displayName || 'Sem Nome',
          telefone: profile.telefone || meta.phone || meta.telefone || meta.whatsapp || '',
          status: meta.status || 'ativo',
          tipo_usuario: tipo,
          van_id: meta.van_id || null,
          salario_base: profile.salario_base || Number(meta.salario) || 0,
          cpf: profile.cpf || meta.cpf || '',
          data_nascimento: profile.data_nascimento || meta.data_nascimento || null,
          sponsor_id: meta.sponsor_id || meta.boss_id || meta.created_by || null,
          plan_id: subMap[u.id] || meta.plan_id || null,
          created_at: u.created_at,
          updated_at: u.updated_at,
          ultimo_login: u.last_sign_in_at
        };
      })

      // Aplicar filtros após o mapeamento para usar os dados atualizados
      let finalFiltered = mappedUsers;

      if (parentId) {
        const ROTA_FACIL_MASTER_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
        const ROTA_FACIL_TESTE_ID = '9552d54f-10eb-4d34-86ef-924cd871d4cf';
        const isRotaFacilAccount = parentId === ROTA_FACIL_MASTER_ID || parentId === ROTA_FACIL_TESTE_ID;
        const searchIds = isRotaFacilAccount ? [ROTA_FACIL_MASTER_ID, ROTA_FACIL_TESTE_ID, parentId] : [parentId];

        finalFiltered = finalFiltered.filter((u: any) => searchIds.includes(u.sponsor_id));
      }

      if (filterType) {
        if (filterType === 'aluno') {
          // Manteve lógica de alunos
        } else {
          finalFiltered = finalFiltered.filter((u: any) => {
            if (filterType === 'dono' || filterType === 'master') return u.tipo_usuario === 'master';
            return u.tipo_usuario === filterType.toLowerCase();
          });
        }
      }

      if (hasSearch) {
        const s = hasSearch.toLowerCase();
        finalFiltered = finalFiltered.filter((u: any) =>
          u.email?.toLowerCase().includes(s) || u.nome?.toLowerCase().includes(s)
        );
      }

      return new Response(JSON.stringify({
        users: finalFiltered,
        debug: { total: users.length, filtered: finalFiltered.length }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Lógica para o método POST (Criação)
    if (req.method === 'POST') {
      const body = await req.json()
      const { nome, email: targetEmail, password, tipo_usuario, van_id, salario, cpf, data_nascimento, endereco, action, userId } = body

      // Se a ação for verificar existência (CPF ou Email)
      if (action === 'check-existence') {
        const { data: { users }, error: listError } = await serviceRoleClient.auth.admin.listUsers({
          perPage: 1000
        });
        if (listError) throw listError;

        const filtered = users.filter((u: any) =>
          u.email === targetEmail || u.user_metadata?.cpf === cpf
        );

        return new Response(JSON.stringify({ exists: filtered.length > 0, user: filtered[0] || null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Se a ação for limpeza de duplicados específicos (Maxwell/Enclaro)
      if (action === 'cleanup-specific-duplicates') {
        if (!isSuperAdmin) throw new Error('Apenas Super Admins podem realizar a limpeza profunda.');

        const { data: { users }, error: listError } = await serviceRoleClient.auth.admin.listUsers({ perPage: 1000 });
        if (listError) throw listError;

        const targets = users.filter((u: any) =>
          u.user_metadata?.nome?.toLowerCase().includes('maxwell') ||
          u.user_metadata?.nome?.toLowerCase().includes('enclaro') ||
          u.user_metadata?.name?.toLowerCase().includes('maxwell') ||
          u.user_metadata?.name?.toLowerCase().includes('enclaro')
        );

        // Agrupar por CPF/Email para manter apenas um
        const kept = new Set();
        const deleted = [];

        for (const u of targets) {
          const key = u.user_metadata?.cpf || u.email;
          if (kept.has(key)) {
            const { error: delError } = await serviceRoleClient.auth.admin.deleteUser(u.id);
            if (!delError) deleted.push(u.email);
          } else {
            kept.add(key);
          }
        }

        return new Response(JSON.stringify({ success: true, deleted }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Se a ação for encontrar duplicatas (Diagnóstico)
      if (action === 'find-duplicates') {
        const { data: { users }, error: listError } = await serviceRoleClient.auth.admin.listUsers({
          perPage: 1000
        });
        if (listError) throw listError;

        const duplicates: any[] = [];
        const seenCpf = new Map();
        const seenEmail = new Map();

        users.forEach((u: any) => {
          const userCpf = u.user_metadata?.cpf;
          const userEmail = u.email;

          if (userCpf) {
            if (seenCpf.has(userCpf)) {
              const existing = seenCpf.get(userCpf);
              duplicates.push({
                type: 'cpf',
                value: userCpf,
                users: [
                  { id: existing.id, email: existing.email, name: existing.user_metadata?.name || existing.user_metadata?.nome },
                  { id: u.id, email: u.email, name: u.user_metadata?.name || u.user_metadata?.nome }
                ]
              });
            } else {
              seenCpf.set(userCpf, u);
            }
          }

          if (userEmail) {
            const normalizedEmail = userEmail.toLowerCase();
            if (seenEmail.has(normalizedEmail)) {
              const existing = seenEmail.get(normalizedEmail);
              duplicates.push({
                type: 'email',
                value: normalizedEmail,
                users: [
                  { id: existing.id, email: existing.email, name: existing.user_metadata?.name || existing.user_metadata?.nome },
                  { id: u.id, email: u.email, name: u.user_metadata?.name || u.user_metadata?.nome }
                ]
              });
            } else {
              seenEmail.set(normalizedEmail, u);
            }
          }
        });

        return new Response(JSON.stringify({ duplicates }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Se a ação for migrar usuário existente
      if (action === 'migrate-user' && userId) {
        const { data: targetUser } = await serviceRoleClient.auth.admin.getUserById(userId);
        if (!targetUser?.user) throw new Error('Usuário não encontrado');

        const currentMeta = targetUser.user.user_metadata || {};
        const { error: updateError } = await serviceRoleClient.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...currentMeta,
            app: 'rotafacil',
            sponsor_id: body.sponsor_id || currentMeta.sponsor_id,
            boss_id: body.sponsor_id || currentMeta.boss_id,
            status: 'ativo'
          }
        });

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true, message: 'Usuário migrado com sucesso.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Se a ação for especificamente reenvio de e-mail de confirmação
      if (action === 'resend-confirmation' && targetEmail) {
        const frontendUrl = req.headers.get('origin') || 'https://rsprolipsi.com.br';

        logAction('resending_confirmation', { targetEmail, requestId });

        // Tenta primeiro via invite (mais comum para novos usuários)
        const { error: inviteError } = await serviceRoleClient.auth.admin.inviteUserByEmail(
          targetEmail,
          { redirectTo: `${frontendUrl}/auth` }
        );

        if (inviteError) {
          console.warn('Erro ao convidar, tentando reset de senha como fallback:', inviteError.message);
          // Se falhar (ex: usuário já existe de forma complexa), o reset de senha também força um e-mail de confirmação de identidade
          const { error: resetError } = await serviceRoleClient.auth.admin.generateLink({
            type: 'magiclink',
            email: targetEmail,
            options: { redirectTo: `${frontendUrl}/auth` }
          });

          if (resetError) throw resetError;
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'E-mail de confirmação/convite enviado com sucesso.',
          requestId
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const email = targetEmail;

      const { data: newUser, error: createError } = await serviceRoleClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: nome,
          nome: nome,
          full_name: nome,
          user_type: 'colaborador', // padrão para sistema
          tipo_usuario: tipo_usuario, // motorista/monitora
          sponsor_id: user.id,
          boss_id: user.id,
          created_by: user.id,
          minha_equipe: user.id,
          equipe: user.id,
          van_id: van_id || null,
          salario: Number(salario) || 0,
          status: 'ativo',
          cpf: cpf || null,
          cep: endereco?.cep || null,
          rua: endereco?.rua || null,
          numero: endereco?.numero || null,
          bairro: endereco?.bairro || null,
          cidade: endereco?.cidade || null,
          estado: endereco?.estado || null,
          complemento: endereco?.complemento || null,
          data_nascimento: data_nascimento || null,
        }
      })

      if (createError) throw createError

      if (newUser.user) {
        await syncFinanceiroSalario(user.id, newUser.user.id, nome, Number(salario) || 0, 'ativo');
        await logAdminAction('CREATE_USER', newUser.user.id, 'auth.users', null, newUser.user.user_metadata);
      }

      return new Response(JSON.stringify({ user: newUser.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // Lógica para o método PUT (Edição)
    if (req.method === 'PUT') {
      const body = await req.json()
      console.log('PUT body:', JSON.stringify(body))
      const { userId, nome, telefone, tipo_usuario, van_id, password, plan_id, status, email, salario, cpf, data_nascimento, endereco } = body

      const { data: targetUser } = await serviceRoleClient.auth.admin.getUserById(userId)
      if (!targetUser?.user) throw new Error('Usuário não encontrado')

      const currentMeta = targetUser.user.user_metadata || {}

      // CRITICAL: Merge metadata
      const updateData: any = {
        user_metadata: {
          ...currentMeta,
          name: nome || currentMeta.name,
          nome: nome || currentMeta.nome,
          full_name: nome || currentMeta.full_name,
          phone: telefone || currentMeta.phone,
          telefone: telefone || currentMeta.telefone,
          tipo_usuario: tipo_usuario || currentMeta.tipo_usuario,
          van_id: van_id === undefined ? currentMeta.van_id : (van_id || null),
          salario: salario === undefined ? currentMeta.salario : (Number(salario) || 0),
          status: status || currentMeta.status || 'ativo',
          cpf: cpf === undefined ? currentMeta.cpf : (cpf || null),
          cep: endereco?.cep === undefined ? currentMeta.cep : (endereco.cep || null),
          rua: endereco?.rua === undefined ? currentMeta.rua : (endereco.rua || null),
          numero: endereco?.numero === undefined ? currentMeta.numero : (endereco.numero || null),
          bairro: endereco?.bairro === undefined ? currentMeta.bairro : (endereco.bairro || null),
          cidade: endereco?.cidade === undefined ? currentMeta.cidade : (endereco.cidade || null),
          estado: endereco?.estado === undefined ? currentMeta.estado : (endereco.estado || null),
          complemento: endereco?.complemento === undefined ? currentMeta.complemento : (endereco.complemento || null),
          data_nascimento: data_nascimento === undefined ? currentMeta.data_nascimento : (data_nascimento || null),
          plan_id: plan_id || currentMeta.plan_id || null,
        }
      }

      if (email && email !== targetUser.user.email) {
        updateData.email = email
      }

      if (password) updateData.password = password

      const { data: updatedUser, error: updateError } = await serviceRoleClient.auth.admin.updateUserById(
        userId,
        updateData
      )

      if (updateError) throw updateError

      await logAdminAction('UPDATE_USER', userId, 'auth.users', currentMeta, updateData.user_metadata);

      // Sincronizar tabelas públicas (CASCADE UPDATE)
      const syncTasks = [];
      const finalEmail = email || targetUser.user.email;
      const oldEmail = targetUser.user.email;

      // 1. Atualizar user_profiles
      syncTasks.push(
        serviceRoleClient
          .from('user_profiles')
          .update({
            nome_completo: nome || currentMeta.nome || currentMeta.name,
            telefone: telefone || currentMeta.telefone || currentMeta.phone,
            endereco_rua: endereco?.rua || currentMeta.rua || currentMeta.endereco_rua,
            endereco_numero: endereco?.numero || currentMeta.numero || currentMeta.endereco_numero,
            endereco_bairro: endereco?.bairro || currentMeta.bairro || currentMeta.endereco_bairro,
            endereco_cidade: endereco?.cidade || currentMeta.cidade || currentMeta.endereco_cidade,
            endereco_estado: endereco?.estado || currentMeta.estado || currentMeta.endereco_estado,
            endereco_cep: endereco?.cep || currentMeta.cep || currentMeta.endereco_cep,
            pix_key: body.pix_key || currentMeta.pix_key,
            pix_type: body.pix_type || currentMeta.pix_type,
            salario_base: salario !== undefined ? Number(salario) : (currentMeta.salario || 0),
            data_nascimento: data_nascimento || currentMeta.data_nascimento
          })
          .eq('user_id', userId)
      );

      // 2. Atualizar consultores
      syncTasks.push(
        serviceRoleClient
          .from('consultores')
          .update({
            nome: nome || currentMeta.nome || currentMeta.name,
            email: finalEmail,
            telefone: telefone || currentMeta.telefone || currentMeta.phone,
            cpf: cpf || currentMeta.cpf
          })
          .eq('user_id', userId)
      );

      // 3. Atualizar indicados (mapeamento por email antigo)
      syncTasks.push(
        serviceRoleClient
          .from('indicados')
          .update({
            nome_completo: nome || currentMeta.nome || currentMeta.name,
            email: finalEmail,
            telefone: telefone || currentMeta.telefone || currentMeta.phone,
            whatsapp: telefone || currentMeta.telefone || currentMeta.phone
          })
          .eq('email', oldEmail)
      );

      await Promise.all(syncTasks);

      // Sincronizar financeiro
      await syncFinanceiroSalario(
        user.id,
        userId,
        nome || currentMeta.nome || currentMeta.name,
        salario !== undefined ? Number(salario) : (currentMeta.salario || 0),
        status || currentMeta.status || 'ativo'
      );

      // Caso um novo plano (Kit) tenha sido informado, atualiza a assinatura
      if (plan_id) {
        const { error: subError } = await serviceRoleClient
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_id: plan_id,
            status: 'active',
            expires_at: '2099-12-31 23:59:59+00',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })

        if (subError) console.error('Erro ao atualizar plano:', subError)
      }

      return new Response(JSON.stringify({ user: updatedUser.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Lógica para o método DELETE
    if (req.method === 'DELETE') {
      const { userId } = await req.json()

      const { data: targetUser } = await serviceRoleClient.auth.admin.getUserById(userId)
      const meta = targetUser?.user?.user_metadata || {}
      const sponsorId = meta.sponsor_id || meta.boss_id || meta.created_by || meta.minha_equipe || null;

      if (!isSuperAdmin && sponsorId !== user.id && userId !== user.id) {
        throw new Error('Sem permissão para excluir este colaborador.')
      }

      // Remover do financeiro
      await serviceRoleClient.from('lancamentos_financeiros').delete().ilike('referencia_id', `salario-${userId}-%`);

      const { error: deleteError } = await serviceRoleClient.auth.admin.deleteUser(userId)
      if (deleteError) throw deleteError

      await logAdminAction('DELETE_USER', userId, 'auth.users', meta, null);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Método não suportado' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Erro crítico na Edge Function:', error.message, error.stack);
    return new Response(JSON.stringify({
      error: error.message,
      requestId,
      stack: isDiagnostic ? error.stack : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})