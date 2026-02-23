import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';

const router = Router();

router.get('/v1/cds', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    // [RS-SYNC] - Se não for passado tenantId ou for o padrão, buscamos os CDs globais da minisite_profiles
    let query = supabase
      .from('minisite_profiles')
      .select('*')
      .or('type.ilike.cd,type.ilike.franquia,type.ilike.proprio,type.ilike.hibrido,type.ilike.%sede%')
      .order('created_at', { ascending: false });

    // Se houver um tenantId específico (diferente do padrão de zeros), poderíamos filtrar aqui.
    // Mas por enquanto, o ecossistema RS usa minisite_profiles para todos os CDs.

    const { data, error } = await query;

    if (error) return res.status(500).json({ success: false, error: error.message });

    // [RS-MAP] - Mapear campos da minisite_profiles para o formato esperado pelo Marketplace/CDRegistry
    const mapped = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      owner_name: p.manager_name || p.name,
      cnpj_cpf: p.cpf || '',
      email: p.email || '',
      phone: p.phone || '',
      // Campos de endereço
      address_street: p.address_street,
      address_number: p.address_number,
      address_neighborhood: p.address_neighborhood,
      address_city: p.address_city,
      address_state: p.address_state,
      address_zip: p.address_zip,
      type: p.type,
      // Se a coluna status não existir, assumimos active para não bloquear o marketplace
      is_active: p.status === 'active' || p.status === undefined || p.status === null
    }));

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [RS-FIX] Criar CD: insere em minisite_profiles (mesma tabela que GET lê)
router.post('/v1/cds', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.name) return res.status(400).json({ success: false, error: 'name é requerido' });

    const payload: any = {
      name: body.name,
      type: body.type || 'cd',
      email: body.email || null,
      phone: body.phone || null,
      cpf: body.cnpj_cpf || body.cpf || null,
      manager_name: body.owner_name || body.name,
      // Endereço
      address_street: body.address_street || null,
      address_number: body.address_number || null,
      address_neighborhood: body.address_neighborhood || null,
      address_city: body.address_city || null,
      address_state: body.address_state || null,
      address_zip: body.address_zip || null,
      // Consultor vinculado (se fornecido)
      consultant_id: body.consultant_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('minisite_profiles')
      .insert([payload])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });

    console.log(`[RS-API] ✅ CD criado em minisite_profiles: ${data.id} (${data.name})`);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [RS-FIX] Atualizar CD: usa minisite_profiles
router.put('/v1/cds/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updates: any = { updated_at: new Date().toISOString() };
    if (body.name) updates.name = body.name;
    if (body.owner_name) updates.manager_name = body.owner_name;
    if (body.cnpj_cpf || body.cpf) updates.cpf = body.cnpj_cpf || body.cpf;
    if (body.email) updates.email = body.email;
    if (body.phone) updates.phone = body.phone;
    if (body.type) updates.type = body.type;
    // Endereço
    if (body.address_street) updates.address_street = body.address_street;
    if (body.address_number) updates.address_number = body.address_number;
    if (body.address_neighborhood) updates.address_neighborhood = body.address_neighborhood;
    if (body.address_city) updates.address_city = body.address_city;
    if (body.address_state) updates.address_state = body.address_state;
    if (body.address_zip) updates.address_zip = body.address_zip;

    const { data, error } = await supabase
      .from('minisite_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [RS-FIX] Deletar CD: usa minisite_profiles
router.delete('/v1/cds/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('minisite_profiles')
      .delete()
      .eq('id', id);

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
