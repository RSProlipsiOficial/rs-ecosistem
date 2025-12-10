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
      if (error && String(error.message).toLowerCase().includes('column')) {
        const { data: fallback, error: fbErr } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
        if (fbErr) return res.status(500).json({ success: false, error: fbErr.message });
        return res.json({ success: true, data: fallback });
      }
      if (error) return res.status(500).json({ success: false, error: error.message });
      res.json({ success: true, data });
    } catch (err: any) {
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
      if (tErr) return res.status(500).json({ success: false, error: tErr.message });
      if (!tList || tList.length === 0) {
        const { error: insTenantErr } = await supabase
          .from('tenants')
          .insert([{ id: tenantId, name: 'Tenant Padrão' }]);
        if (insTenantErr) return res.status(500).json({ success: false, error: insTenantErr.message });
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

      if (error) return res.status(500).json({ success: false, error: error.message });
      res.json({ success: true, data });
    } catch (err: any) {
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
createResourceEndpoints('trainings', 'trainings');
createResourceEndpoints('catalogs', 'catalogs');
createResourceEndpoints('materials', 'download_materials');

// Endpoints específicos para módulos e aulas (read-only por tenant)
router.get('/v1/communications/training-modules', async (req: Request, res: Response) => {
  try {
    const { tenantId, trainingId } = req.query as any;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    let q = supabase.from('training_modules').select('*').eq('tenant_id', String(tenantId));
    if (trainingId) q = q.eq('training_id', String(trainingId));
    q = q.order('order_index', { ascending: true });
    const { data, error } = await q;
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/communications/lessons', async (req: Request, res: Response) => {
  try {
    const { tenantId, trainingId, moduleId } = req.query as any;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    let q = supabase.from('lessons').select('*').eq('tenant_id', String(tenantId));
    if (trainingId) q = q.eq('training_id', String(trainingId));
    if (moduleId) q = q.eq('module_id', String(moduleId));
    q = q.order('order_index', { ascending: true });
    const { data, error } = await q;
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
