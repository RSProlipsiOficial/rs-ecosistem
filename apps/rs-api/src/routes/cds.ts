import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';

const router = Router();

router.get('/v1/cds', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    const { data, error } = await supabase
      .from('distribution_centers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    const payload = {
      tenant_id: body.tenantId,
      name: body.name,
      owner_name: body.owner_name,
      cnpj_cpf: body.cnpj_cpf,
      email: body.email,
      phone: body.phone,
    };
    const { data, error } = await supabase.from('distribution_centers').insert([payload]).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/v1/cds/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updates: any = { updated_at: new Date().toISOString() };
    if (body.name) updates.name = body.name;
    if (body.owner_name) updates.owner_name = body.owner_name;
    if (body.cnpj_cpf) updates.cnpj_cpf = body.cnpj_cpf;
    if (body.email) updates.email = body.email;
    if (body.phone) updates.phone = body.phone;
    const { data, error } = await supabase.from('distribution_centers').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/v1/cds/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('distribution_centers').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

// Regiões
router.get('/v1/cds/:id/regions', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('cd_regions').select('*').eq('cd_id', id).order('priority', { ascending: true });
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/cds/:id/regions', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const payload = { cd_id: id, cep_start: body.cep_start || null, cep_end: body.cep_end || null, city: body.city || null, state: body.state || null, radius_km: body.radius_km || null };
    const { data, error } = await supabase.from('cd_regions').insert([payload]).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/v1/cds/regions/:regionId', async (req, res) => {
  try {
    const { regionId } = req.params;
    const { error } = await supabase.from('cd_regions').delete().eq('id', regionId);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Estoque
router.get('/v1/cds/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('cd_stock').select('*').eq('cd_id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/v1/cds/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, delta, reason } = req.body || {};
    if (!product_id || !delta) return res.status(400).json({ success: false, error: 'product_id e delta requeridos' });
    const { data: current, error: selErr } = await supabase.from('cd_stock').select('id, available, reserved').eq('cd_id', id).eq('product_id', product_id).maybeSingle();
    if (!current) {
      const { data: inserted, error: insErr } = await supabase.from('cd_stock').insert([{ cd_id: id, product_id, available: Number(delta), reserved: 0 }]).select().single();
      if (insErr) return res.status(500).json({ success: false, error: insErr.message });
      return res.json({ success: true, data: inserted });
    }
    const updates: any = { available: (current?.available || 0) + Number(delta), updated_at: new Date().toISOString(), audit: { reason } };
    const { data, error } = await supabase.from('cd_stock').update(updates).eq('id', current.id).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
