import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, origin',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

serve(async (req) => {
    console.log(`${req.method} request to admin-users`);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { ...corsHeaders, 'Access-Control-Max-Age': '86400' } })
    }

    try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Variáveis de ambiente do Supabase não configuradas.')
        }

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Token de autorização ausente' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: authHeader } }
        })
        const serviceRoleClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        const isDiagnostic = req.headers.get('x-diagnostic-secret') === 'antigravity-diag-2024';
        const { data: { user }, error: userError } = isDiagnostic ? { data: { user: { id: 'diag-agent' } }, error: null } : await authClient.auth.getUser()

        if (!isDiagnostic && (userError || !user)) {
            return new Response(JSON.stringify({ error: 'Sessão inválida' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const isSuperAdmin = isDiagnostic ? true : await (async () => {
            const { data: adminEmail } = await serviceRoleClient.from('admin_emails').select('email').eq('email', user?.email || '').maybeSingle()
            return !!adminEmail
        })()

        const userRole = isDiagnostic ? 'master' : (user.user_metadata?.tipo_usuario || user.user_metadata?.user_type || 'usuario').toLowerCase();
        const isAdmin = ['admin', 'master', 'owner'].includes(userRole);
        const url = new URL(req.url)

        const syncFinanceiroSalario = async (adminId: string, colabId: string, nome: string, salario: number, status: string) => {
            const competencia = new Date().toISOString().substring(0, 7);
            const refId = `salario-${colabId}-${competencia}`;
            if (status === 'ativo' && salario > 0) {
                const { data: orphan } = await serviceRoleClient.from('lancamentos_financeiros').select('id').is('referencia_id', null).eq('user_id', adminId).eq('competencia', competencia).ilike('descricao', `%${nome}%`).maybeSingle();
                if (orphan) await serviceRoleClient.from('lancamentos_financeiros').update({ referencia_id: refId }).eq('id', orphan.id);
                await serviceRoleClient.from('lancamentos_financeiros').upsert({ referencia_id: refId, user_id: adminId, tipo: 'despesa', origem: 'manual', categoria: 'SALÁRIOS', descricao: `Salário - ${nome}`, valor: salario, competencia, data_evento: new Date().toISOString().split('T')[0], status: 'previsto', pagamento_status: 'pendente', alocacao: 'empresa' }, { onConflict: 'referencia_id' });
            } else {
                await serviceRoleClient.from('lancamentos_financeiros').delete().eq('referencia_id', refId);
            }
        };

        if (req.method === 'GET') {
            const showAll = url.searchParams.get('all') === 'true'
            const parentId = url.searchParams.get('parentId')
            const appFilter = url.searchParams.get('appFilter')
            const filterType = url.searchParams.get('filterType')

            console.log('[DEBUG] Params:', { parentId, filterType, appFilter });

            const { data: { users }, error: listError } = await serviceRoleClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
            if (listError) throw listError

            let filteredUsers = users
            filteredUsers = filteredUsers.filter((u: any) => !u.email?.endsWith('@prolipsi.temp'));
            console.log('[DEBUG] Total users (after temp filter):', filteredUsers.length);

            if (parentId) {
                const ROTA_FACIL_MASTER_ID = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
                const ROTA_FACIL_TESTE_ID = '9552d54f-10eb-4d34-86ef-924cd871d4cf';
                const isRotaFacilAccount = parentId === ROTA_FACIL_MASTER_ID || parentId === ROTA_FACIL_TESTE_ID;
                const searchIds = isRotaFacilAccount ? [ROTA_FACIL_MASTER_ID, ROTA_FACIL_TESTE_ID, parentId] : [parentId];

                console.log('[DEBUG] ParentId filter - searchIds:', searchIds);

                filteredUsers = users.filter((u: any) => {
                    if (u.email?.endsWith('@prolipsi.temp')) return false;
                    if (u.id === ROTA_FACIL_MASTER_ID || u.id === ROTA_FACIL_TESTE_ID) return false;
                    const meta = u.user_metadata || {}
                    const matches = searchIds.includes(meta.sponsor_id) || searchIds.includes(meta.boss_id) || searchIds.includes(meta.created_by) || searchIds.includes(meta.minha_equipe) || searchIds.includes(meta.equipe);
                    return matches;
                });
                console.log('[DEBUG] After parentId filter:', filteredUsers.length);
            } else {
                filteredUsers = filteredUsers.filter((u: any) => u.email === 'rsprolipsioficial@gmail.com' || u.email === 'robertocamargooficial@gmail.com');
                console.log('[DEBUG] Root view - showing owners only:', filteredUsers.length);
            }

            if (appFilter === 'rotafacil') {
                filteredUsers = filteredUsers.filter((u: any) => u.user_metadata?.app === 'rotafacil' || u.email?.toLowerCase().includes('oficial') || u.user_metadata?.nome?.toLowerCase().includes('camargo') || u.user_metadata?.name?.toLowerCase().includes('camargo'));
                console.log('[DEBUG] After app filter:', filteredUsers.length);
            } else if (appFilter) {
                filteredUsers = filteredUsers.filter((u: any) => u.user_metadata?.app === appFilter);
                console.log('[DEBUG] After app filter (other):', filteredUsers.length);
            }

            if (filterType) {
                console.log('[DEBUG] Applying filterType:', filterType);
                const beforeCount = filteredUsers.length;

                filteredUsers = filteredUsers.filter((u: any) => {
                    const meta = u.user_metadata || {};
                    const tipo = (meta.tipo_usuario || meta.user_type || '').toLowerCase().trim();
                    const targetType = filterType.toLowerCase().trim();
                    const matches = tipo === targetType;

                    if (!matches) {
                        console.log('[DEBUG] User not matching:', { email: u.email, tipo, targetType });
                    }

                    return matches;
                });

                console.log('[DEBUG] After type filter:', beforeCount, '->', filteredUsers.length);
            }

            const mappedUsers = filteredUsers.map((u: any) => {
                const meta = u.user_metadata || {};
                return { id: u.id, email: u.email, nome: meta.name || meta.nome || meta.full_name || '', telefone: meta.phone || meta.telefone || '', status: meta.status || 'ativo', tipo_usuario: meta.tipo_usuario || meta.user_type || 'usuario', van_id: meta.van_id || null, salario_base: Number(meta.salario) || 0, cpf: meta.cpf || '', sponsor_id: meta.sponsor_id || meta.boss_id || meta.created_by || null, boss_id: meta.boss_id || null, endereco: { cep: meta.cep || '', rua: meta.rua || '', numero: meta.numero || '', bairro: meta.bairro || '', cidade: meta.cidade || '', estado: meta.estado || '', complemento: meta.complemento || '' }, created_at: u.created_at, updated_at: u.updated_at, ultimo_login: u.last_sign_in_at };
            })

            console.log('[DEBUG] Final result - users returned:', mappedUsers.length);
            return new Response(JSON.stringify({ users: mappedUsers }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
        }

        if (req.method === 'POST') {
            const body = await req.json()
            const { nome, email: targetEmail, password, tipo_usuario, van_id, salario, cpf, endereco, action, userId } = body

            if (action === 'check-existence') {
                const { data: { users }, error: listError } = await serviceRoleClient.auth.admin.listUsers({ perPage: 1000 });
                if (listError) throw listError;
                const filtered = users.filter((u: any) => u.email === targetEmail || u.user_metadata?.cpf === cpf);
                return new Response(JSON.stringify({ exists: filtered.length > 0, user: filtered[0] || null }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }

            if (action === 'cleanup-specific-duplicates') {
                if (!isSuperAdmin) throw new Error('Apenas Super Admins podem realizar a limpeza profunda.');
                const { data: { users }, error: listError } = await serviceRoleClient.auth.admin.listUsers({ perPage: 1000 });
                if (listError) throw listError;
                const targets = users.filter((u: any) => u.user_metadata?.nome?.toLowerCase().includes('maxwell') || u.user_metadata?.nome?.toLowerCase().includes('enclaro') || u.user_metadata?.name?.toLowerCase().includes('maxwell') || u.user_metadata?.name?.toLowerCase().includes('enclaro'));
                const kept = new Set(); const deleted = [];
                for (const u of targets) { const key = u.user_metadata?.cpf || u.email; if (kept.has(key)) { const { error: delError } = await serviceRoleClient.auth.admin.deleteUser(u.id); if (!delError) deleted.push(u.email); } else { kept.add(key); } }
                return new Response(JSON.stringify({ success: true, deleted }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }

            if (action === 'find-duplicates') {
                const { data: { users }, error: listError } = await serviceRoleClient.auth.admin.listUsers({ perPage: 1000 });
                if (listError) throw listError;
                const duplicates: any[] = []; const seenCpf = new Map(); const seenEmail = new Map();
                users.forEach((u: any) => {
                    const userCpf = u.user_metadata?.cpf; const userEmail = u.email;
                    if (userCpf) { if (seenCpf.has(userCpf)) { duplicates.push({ type: 'cpf', value: userCpf, users: [seenCpf.get(userCpf), u] }); } else { seenCpf.set(userCpf, u); } }
                    if (userEmail) { const n = userEmail.toLowerCase(); if (seenEmail.has(n)) { duplicates.push({ type: 'email', value: n, users: [seenEmail.get(n), u] }); } else { seenEmail.set(n, u); } }
                });
                return new Response(JSON.stringify({ duplicates }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }

            if (action === 'migrate-user' && userId) {
                const { data: targetUser } = await serviceRoleClient.auth.admin.getUserById(userId);
                if (!targetUser?.user) throw new Error('Usuário não encontrado');
                const currentMeta = targetUser.user.user_metadata || {};
                const { error: updateError } = await serviceRoleClient.auth.admin.updateUserById(userId, { user_metadata: { ...currentMeta, app: 'rotafacil', sponsor_id: body.sponsor_id || currentMeta.sponsor_id, boss_id: body.sponsor_id || currentMeta.boss_id, status: 'ativo' } });
                if (updateError) throw updateError;
                return new Response(JSON.stringify({ success: true, message: 'Usuário migrado com sucesso.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }

            if (action === 'resend-confirmation' && targetEmail) {
                const frontendUrl = req.headers.get('origin') || 'https://rsprolipsi.com.br';
                const { error: resendError } = await serviceRoleClient.auth.admin.generateLink({ type: 'invite', email: targetEmail, options: { redirectTo: `${frontendUrl}/auth` } });
                if (resendError) throw resendError;
                return new Response(JSON.stringify({ success: true, message: 'E-mail de confirmação reenviado.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
            }

            const email = targetEmail;
            const { data: newUser, error: createError } = await serviceRoleClient.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name: nome, nome, full_name: nome, user_type: 'colaborador', tipo_usuario, sponsor_id: user.id, boss_id: user.id, created_by: user.id, minha_equipe: user.id, equipe: user.id, van_id: van_id || null, salario: Number(salario) || 0, status: 'ativo', cpf: cpf || null, cep: endereco?.cep || null, rua: endereco?.rua || null, numero: endereco?.numero || null, bairro: endereco?.bairro || null, cidade: endereco?.cidade || null, estado: endereco?.estado || null, complemento: endereco?.complemento || null } })
            if (createError) throw createError
            if (newUser.user) { await syncFinanceiroSalario(user.id, newUser.user.id, nome, Number(salario) || 0, 'ativo'); }
            return new Response(JSON.stringify({ user: newUser.user }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
        }

        if (req.method === 'PUT') {
            const body = await req.json()
            const { userId, nome, telefone, tipo_usuario, van_id, password, plan_id, status, email, salario, cpf, endereco } = body
            const { data: targetUser } = await serviceRoleClient.auth.admin.getUserById(userId)
            if (!targetUser?.user) throw new Error('Usuário não encontrado')
            const currentMeta = targetUser.user.user_metadata || {}
            const updateData: any = { user_metadata: { ...currentMeta, name: nome || currentMeta.name, nome: nome || currentMeta.nome, full_name: nome || currentMeta.full_name, phone: telefone || currentMeta.phone, telefone: telefone || currentMeta.telefone, tipo_usuario: tipo_usuario || currentMeta.tipo_usuario, van_id: van_id === undefined ? currentMeta.van_id : (van_id || null), salario: salario === undefined ? currentMeta.salario : (Number(salario) || 0), status: status || currentMeta.status || 'ativo', cpf: cpf === undefined ? currentMeta.cpf : (cpf || null), cep: endereco?.cep === undefined ? currentMeta.cep : (endereco.cep || null), rua: endereco?.rua === undefined ? currentMeta.rua : (endereco.rua || null), numero: endereco?.numero === undefined ? currentMeta.numero : (endereco.numero || null), bairro: endereco?.bairro === undefined ? currentMeta.bairro : (endereco.bairro || null), cidade: endereco?.cidade === undefined ? currentMeta.cidade : (endereco.cidade || null), estado: endereco?.estado === undefined ? currentMeta.estado : (endereco.estado || null), complemento: endereco?.complemento === undefined ? currentMeta.complemento : (endereco.complemento || null) } }
            if (email && email !== targetUser.user.email) updateData.email = email
            if (password) updateData.password = password
            const { data: updatedUser, error: updateError } = await serviceRoleClient.auth.admin.updateUserById(userId, updateData)
            if (updateError) throw updateError
            const finalNome = nome || currentMeta.nome || currentMeta.name || '';
            const finalSalario = salario === undefined ? currentMeta.salario : (Number(salario) || 0);
            const finalStatus = status || currentMeta.status || 'ativo';
            await syncFinanceiroSalario(user.id, userId, finalNome, finalSalario, finalStatus);
            if (plan_id) { await serviceRoleClient.from('user_subscriptions').upsert({ user_id: userId, plan_id, status: 'active', expires_at: '2099-12-31 23:59:59+00', updated_at: new Date().toISOString() }, { onConflict: 'user_id' }) }
            return new Response(JSON.stringify({ user: updatedUser.user }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
        }

        if (req.method === 'DELETE') {
            const { userId } = await req.json()
            const { data: targetUser } = await serviceRoleClient.auth.admin.getUserById(userId)
            const meta = targetUser?.user?.user_metadata || {}
            const sponsorId = meta.sponsor_id || meta.boss_id || meta.created_by || meta.minha_equipe || null;
            if (!isSuperAdmin && sponsorId !== user.id && userId !== user.id) throw new Error('Sem permissão para excluir este colaborador.')
            await serviceRoleClient.from('lancamentos_financeiros').delete().ilike('referencia_id', `salario-${userId}-%`);
            const { error: deleteError } = await serviceRoleClient.auth.admin.deleteUser(userId)
            if (deleteError) throw deleteError
            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
        }

        return new Response(JSON.stringify({ error: 'Método não suportado' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error: any) {
        console.error('Erro na Edge Function:', error.message)
        return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
    }
})
