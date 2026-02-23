import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';

const router = Router();

router.get('/v1/marketing/pixels', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    console.log(`[MarketingPixels] GET /v1/marketing/pixels - tenantId: ${tenantId}`);

    // Tabela oficial no banco: tracking_pixels
    // Removendo filtro tenant_id pois a coluna não existe no schema atual
    const { data, error } = await supabase
      .from('tracking_pixels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[MarketingPixels] Error fetching pixels from tracking_pixels:`, error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log(`[MarketingPixels] Pixels found: ${data?.length || 0}`);
    res.json({ success: true, data: data || [] });
  } catch (err: any) {
    console.error(`[MarketingPixels] Catch error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


router.post('/v1/marketing/pixels', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    const payload = {
      tenant_id: body.tenantId,
      type: body.type,
      name: body.name,
      pixel_id: body.pixel_id,
      label: body.label || null,
      active: !!body.active,
    };
    const { data, error } = await supabase.from('tracking_pixels').insert([payload]).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/v1/marketing/pixels/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updates: any = { updated_at: new Date().toISOString() };
    if (body.type) updates.type = body.type;
    if (body.name) updates.name = body.name;
    if (body.pixel_id) updates.pixel_id = body.pixel_id;
    if (body.label !== undefined) updates.label = body.label;
    if (body.active !== undefined) updates.active = !!body.active;
    const { data, error } = await supabase.from('tracking_pixels').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/v1/marketing/pixels/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('tracking_pixels').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/v1/marketing/pixels/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const active = status === 'Ativo' || status === true;
    const { data, error } = await supabase.from('tracking_pixels').update({ active, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
