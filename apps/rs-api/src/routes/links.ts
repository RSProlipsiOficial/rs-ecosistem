import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';

const router = Router();

const SHORT_DOMAIN = process.env.SHORT_LINK_DOMAIN || 'https://rs.shp/';

router.get('/v1/links', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    const { data, error } = await supabase
      .from('short_links')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/links', async (req: Request, res: Response) => {
  try {
    const { originalUrl, tenantId } = req.body;
    if (!tenantId || !originalUrl) return res.status(400).json({ success: false, error: 'tenantId e originalUrl requeridos' });
    const slug = Math.random().toString(36).substring(2, 7);
    const short_url = SHORT_DOMAIN.endsWith('/') ? SHORT_DOMAIN + slug : SHORT_DOMAIN + '/' + slug;
    const payload = { tenant_id: tenantId, long_url: originalUrl, slug, short_url, clicks: 0 };
    const { data, error } = await supabase.from('short_links').insert([payload]).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/v1/links/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('short_links').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/v1/links/:id/click', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: current, error: selErr } = await supabase.from('short_links').select('clicks').eq('id', id).single();
    if (selErr) return res.status(404).json({ success: false, error: 'Link não encontrado' });
    const { data, error } = await supabase.from('short_links').update({ clicks: (current?.clicks || 0) + 1 }).eq('id', id).select().single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Redirecionamento curto
router.get('/s/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase.from('short_links').select('*').eq('slug', slug).single();
    if (error || !data) return res.status(404).send('Link não encontrado');
    await supabase.from('short_links').update({ clicks: (data.clicks || 0) + 1 }).eq('id', data.id);
    res.redirect(data.long_url);
  } catch (err: any) {
    res.status(500).send('Erro');
  }
});

export default router;
