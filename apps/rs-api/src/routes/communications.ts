import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';
import { z } from 'zod';

const router = Router();

const CreateSchema = z.object({
  tenantId: z.string().uuid(),
  title: z.string().min(3),
  message: z.string().min(3),
  type: z.string().optional(),
  audience: z.array(z.enum(['consultor', 'marketplace', 'lojista'])).nonempty(),
  author: z.string().optional()
});

// Criar comunicado
router.post('/v1/communications/announcements', async (req: Request, res: Response) => {
  try {
    const parse = CreateSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ success: false, error: parse.error.issues });

    const { tenantId, title, message, type = 'info', audience, author } = parse.data;

    // Verificar existência do tenant antes de inserir (evita erro de FK)
    const { data: tList, error: tErr } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', tenantId)
      .limit(1);
    if (tErr) return res.status(500).json({ success: false, error: tErr.message });
    if (!tList || tList.length === 0) {
      const { error: insTenantErr } = await supabase
        .from('tenants')
        .insert([{ id: tenantId, name: 'Tenant Padrão' }]);
      if (insTenantErr) return res.status(500).json({ success: false, error: insTenantErr.message });
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert([{ tenant_id: tenantId, title, message, type, audience, author }])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Listar comunicados
router.get('/v1/communications/announcements', async (req: Request, res: Response) => {
  try {
    const { tenantId, audience, limit = 20 } = req.query as any;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    let q = supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(Number(limit));
    // Filtro por tenant; se coluna ausente, retorna sem filtro
    let { data, error } = await q.eq('tenant_id', tenantId);
    if (error && String(error.message).toLowerCase().includes('permission denied')) {
      return res.status(200).json({ success: true, data: [] });
    }
    if (error && String(error.message).toLowerCase().includes('column')) {
      const { data: fallback, error: fbErr } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(Number(limit));
      if (fbErr) return res.status(500).json({ success: false, error: fbErr.message });
      // Aplicar audience localmente se necessário
      let out = fallback;
      if (audience) out = out.filter((row: any) => Array.isArray(row.audience) ? row.audience.includes(String(audience)) : true);
      return res.json({ success: true, data: out });
    }

    if (error) return res.status(500).json({ success: false, error: error.message });
    // audience
    let out = data || [];
    if (audience) out = out.filter((row: any) => Array.isArray(row.audience) ? row.audience.includes(String(audience)) : true);
    res.json({ success: true, data: out });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Detalhar comunicado
router.get('/v1/communications/announcements/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('announcements').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar comunicado
router.put('/v1/communications/announcements/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patch: any = req.body ?? {};
    delete patch.id;
    delete patch.tenant_id;
    delete patch.created_at;

    const { data, error } = await supabase.from('announcements').update(patch).eq('id', id).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Deletar comunicado
router.delete('/v1/communications/announcements/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// CRUD GENÉRICO PARA OUTROS RECURSOS
// =====================================================

const createResourceEndpoints = (resourceName: string, tableName: string) => {
  // Listar
  router.get(`/v1/communications/${resourceName}`, async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.query;
      if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

      // Filtro por tenant_id; se coluna não existir (schema remoto), retornar sem filtro
      let q = supabase.from(tableName).select('*').order('created_at', { ascending: false });

      let { data, error } = await q.eq('tenant_id', String(tenantId));

      // Se houver QUALQUER erro (ex: coluna inexistente, erro de permissão, etc), tenta fallback sem filtro
      if (error) {
        console.warn(`[WARN] Failed to filter ${resourceName} by tenantId. Falling back to all data. Error:`, error.message);
        const { data: fallback, error: fbErr } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });

        if (fbErr) {
          console.error(`[ERROR] Fallback failed for ${resourceName}:`, fbErr);
          return res.status(500).json({ success: false, error: fbErr.message });
        }
        return res.json({ success: true, data: fallback });
      }

      res.json({ success: true, data });


    } catch (err: any) {
      console.error(`[ERROR] GET /v1/communications/${resourceName}:`, err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Criar
  router.post(`/v1/communications/${resourceName}`, async (req: Request, res: Response) => {
    try {
      const body: any = req.body ?? {};
      if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
      const tenantId = String(body.tenantId);

      // Verificar existência do tenant
      const { data: tList, error: tErr } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', tenantId)
        .limit(1);
      if (tErr) {
        console.error(`[ERROR] Check Tenant ${tenantId}:`, tErr);
        return res.status(500).json({ success: false, error: tErr.message });
      }
      if (!tList || tList.length === 0) {
        const { error: insTenantErr } = await supabase
          .from('tenants')
          .insert([{ id: tenantId, name: 'Tenant Padrão' }]);
        if (insTenantErr) {
          console.error(`[ERROR] Insert Tenant ${tenantId}:`, insTenantErr);
          return res.status(500).json({ success: false, error: insTenantErr.message });
        }
      }

      const insertData: any = { ...body, tenant_id: tenantId };
      delete body.id;
      delete body.created_at;
      delete body.updated_at;
      delete insertData.tenantId;

      const { data, error } = await supabase
        .from(tableName)
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error(`[ERROR] Insert ${tableName}:`, error);
        return res.status(500).json({ success: false, error: error.message });
      }
      res.json({ success: true, data });
    } catch (err: any) {
      console.error(`[ERROR] POST /v1/communications/${resourceName}:`, err);
      res.status(500).json({ success: false, error: err.message });
    }
  });


  // Atualizar
  router.put(`/v1/communications/${resourceName}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const patch: any = req.body ?? {};
      delete patch.id;
      delete patch.tenantId;
      delete patch.created_at;
      delete patch.updated_at;

      const { data, error } = await supabase
        .from(tableName)
        .update(patch)
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(500).json({ success: false, error: error.message });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Deletar
  router.delete(`/v1/communications/${resourceName}/:id`, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) return res.status(500).json({ success: false, error: error.message });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
};

// Registrar endpoints para todos os recursos
createResourceEndpoints('agenda', 'agenda_items');
createResourceEndpoints('catalogs', 'catalogs');
createResourceEndpoints('materials', 'download_materials');

// =====================================================
// TRAININGS (Mapeado para treinamento_modulos)
// =====================================================

// Listar Treinamentos (Módulos)
router.get('/v1/communications/trainings', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    let q = supabase.from('treinamento_modulos')
      .select('*, lessons:treinamento_aulas(*)')
      .eq('tenant_id', String(tenantId))
      .order('created_at', { ascending: false });

    // Fallback if relation doesn't exist or error
    let { data, error } = await q;

    if (error) {
      console.warn('[WARN] Failed to fetch trainings. Trying fallback without relations.', error);
      // Fallback: Fetch plain modules
      const { data: fallback, error: fbErr } = await supabase.from('treinamento_modulos').select('*').eq('tenant_id', String(tenantId));
      if (fbErr) return res.status(500).json({ success: false, error: fbErr.message });
      data = fallback;
    }

    // Map fields for frontend
    const mappedData = data?.map((item: any) => ({
      id: item.id,
      title: item.titulo,
      description: item.descricao,
      icon: item.icone,
      lessons: item.lessons?.map((l: any) => ({
        id: l.id,
        title: l.titulo,
        description: l.descricao,
        youtubeUrl: l.link_video,
        trainingId: l.modulo_id
      })) || []
    }));

    res.json({ success: true, data: mappedData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar Treinamento (Módulo)
router.post('/v1/communications/trainings', async (req: Request, res: Response) => {
  try {
    const { tenantId, title, description, icon } = req.body;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    const { data, error } = await supabase
      .from('treinamento_modulos')
      .insert([{
        tenant_id: tenantId,
        titulo: title,
        descricao: description,
        icone: icon,
        ativo: true
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({
      success: true, data: {
        id: data.id,
        title: data.titulo,
        description: data.descricao,
        icon: data.icone
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar Treinamento
router.put('/v1/communications/trainings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, icon } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.titulo = title;
    if (description !== undefined) updateData.descricao = description;
    if (icon !== undefined) updateData.icone = icon;

    const { data, error } = await supabase
      .from('treinamento_modulos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });

    if (!data) return res.status(404).json({ success: false, error: 'Record not found' });

    res.json({
      success: true, data: {
        id: data.id,
        title: data.titulo,
        description: data.descricao,
        icon: data.icone
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Deletar Treinamento
router.delete('/v1/communications/trainings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('treinamento_modulos').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// LESSONS (Mapeado para treinamento_aulas)
// =====================================================

// Listar Aulas (opcional, já vem com trainings)
router.get('/v1/communications/lessons', async (req: Request, res: Response) => {
  try {
    const { tenantId, trainingId } = req.query;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    let q = supabase.from('treinamento_aulas').select('*').eq('tenant_id', String(tenantId));
    if (trainingId) q = q.eq('modulo_id', String(trainingId));

    const { data, error } = await q.order('ordem', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: error.message });

    const mapped = data?.map((l: any) => ({
      id: l.id,
      title: l.titulo,
      description: l.descricao,
      youtubeUrl: l.link_video,
      trainingId: l.modulo_id
    }));

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar Aula
router.post('/v1/communications/lessons', async (req: Request, res: Response) => {
  try {
    const { tenantId, title, description, youtubeUrl, trainingId } = req.body;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    if (!trainingId) return res.status(400).json({ success: false, error: 'trainingId (modulo_id) requerido' });

    const { data, error } = await supabase.from('treinamento_aulas').insert([{
      tenant_id: tenantId,
      titulo: title,
      descricao: description,
      link_video: youtubeUrl,
      modulo_id: trainingId,
      ativo: true
    }]).select().single();

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({
      success: true, data: {
        id: data.id,
        title: data.titulo,
        description: data.descricao,
        youtubeUrl: data.link_video,
        trainingId: data.modulo_id
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar Aula
router.put('/v1/communications/lessons/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, youtubeUrl } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.titulo = title;
    if (description !== undefined) updateData.descricao = description;
    if (youtubeUrl !== undefined) updateData.link_video = youtubeUrl;

    const { data, error } = await supabase.from('treinamento_aulas').update(updateData).eq('id', id).select().single();

    if (error) return res.status(500).json({ success: false, error: error.message });

    if (!data) return res.status(404).json({ success: false, error: 'Record not found' });

    res.json({
      success: true, data: {
        id: data.id,
        title: data.titulo,
        description: data.descricao,
        youtubeUrl: data.link_video,
        trainingId: data.modulo_id
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Deletar Aula
router.delete('/v1/communications/lessons/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('treinamento_aulas').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
