import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { supabase } from '../lib/supabaseClient';

const router = Router();

router.get('/v1/consultants/profile', async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.query as any;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    const uid = userId || req.headers['x-user-id'];
    // Dados do consultor
    const { data: cons, error: consErr } = await supabase
      .from('consultants')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq(uid ? 'user_id' : 'tenant_id', uid || tenantId)
      .maybeSingle();
    // Endereço
    const { data: addr } = await supabase
      .from('consultant_addresses')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('consultant_id', cons?.id || null)
      .maybeSingle();
    // Loja
    const { data: store } = await supabase
      .from('stores')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('consultant_id', cons?.id || null)
      .maybeSingle();
    const payload = {
      sponsor: { id_or_name: cons?.sponsor_id_or_name || null },
      personal: {
        full_name: cons?.full_name || cons?.display_name || '',
        cpf_cnpj: cons?.cpf_cnpj || '',
        email: cons?.email || '',
        phone_whatsapp: cons?.phone_whatsapp || '',
        birth_date: cons?.birth_date || '',
      },
      address: addr ? {
        cep: addr.cep || '',
        street: addr.street || '',
        number: addr.number || '',
        complement: addr.complement || '',
        district: addr.district || '',
        city: addr.city || '',
        state: addr.state || '',
      } : {},
      store: store ? {
        store_name: store.name || '',
        referral_code: store.referral_code || '',
        referral_link: store.referral_link || '',
        affiliate_link: store.affiliate_link || '',
      } : {},
      status: {
        graduation: cons?.graduation || '',
        account_status: cons?.account_status || '',
        monthly_activity: cons?.monthly_activity || '',
      },
      avatar_url: cons?.avatar_url || null,
    };
    if (consErr) return res.status(500).json({ success: false, error: consErr.message });
    res.json({ success: true, data: payload });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/v1/consultants/profile', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const tenantId = body.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    // Carrega consultor
    const { data: cons, error: consErr } = await supabase
      .from('consultants')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (consErr) return res.status(500).json({ success: false, error: consErr.message });
    const consultantId = cons?.id;
    // Atualiza consultor
    const p = body.personal || {}; const st = body.status || {}; const sp = body.sponsor || {};
    const consUpdates: any = {
      sponsor_id_or_name: sp.id_or_name || cons?.sponsor_id_or_name || null,
      full_name: p.full_name ?? cons?.full_name,
      cpf_cnpj: p.cpf_cnpj ?? cons?.cpf_cnpj,
      email: p.email ?? cons?.email,
      phone_whatsapp: p.phone_whatsapp ?? cons?.phone_whatsapp,
      birth_date: p.birth_date ?? cons?.birth_date,
      graduation: st.graduation ?? cons?.graduation,
      account_status: st.account_status ?? cons?.account_status,
      monthly_activity: st.monthly_activity ?? cons?.monthly_activity,
      avatar_url: body.avatar_url ?? cons?.avatar_url,
      updated_at: new Date().toISOString(),
    };
    await supabase.from('consultants').update(consUpdates).eq('id', consultantId);
    // Endereço upsert
    const a = body.address || {};
    const { data: addrCur } = await supabase.from('consultant_addresses').select('*').eq('tenant_id', tenantId).eq('consultant_id', consultantId).maybeSingle();
    if (addrCur) {
      await supabase.from('consultant_addresses').update({
        cep: a.cep, street: a.street, number: a.number, complement: a.complement,
        district: a.district, city: a.city, state: a.state, updated_at: new Date().toISOString(),
      }).eq('id', addrCur.id);
    } else {
      await supabase.from('consultant_addresses').insert([{ tenant_id: tenantId, consultant_id: consultantId, cep: a.cep, street: a.street, number: a.number, complement: a.complement, district: a.district, city: a.city, state: a.state }]);
    }
    // Loja upsert
    const s = body.store || {};
    const { data: storeCur } = await supabase.from('stores').select('*').eq('tenant_id', tenantId).eq('consultant_id', consultantId).maybeSingle();
    if (storeCur) {
      await supabase.from('stores').update({ name: s.store_name, referral_code: s.referral_code, referral_link: s.referral_link, affiliate_link: s.affiliate_link, updated_at: new Date().toISOString() }).eq('id', storeCur.id);
    } else {
      await supabase.from('stores').insert([{ tenant_id: tenantId, consultant_id: consultantId, name: s.store_name, referral_code: s.referral_code, referral_link: s.referral_link, affiliate_link: s.affiliate_link }]);
    }
    // Senha (opcional) — aqui apenas placeholder; deve ser tratada por auth service
    // if (body.access?.new_password && body.access?.confirm_new_password && body.access?.new_password === body.access?.confirm_new_password) { /* atualizar senha no auth */ }
    return res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

// Upload de avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const base = path.join(process.cwd(), 'uploads', 'avatars');
    fs.mkdirSync(base, { recursive: true });
    cb(null, base);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `avatar_${Date.now()}${ext || '.png'}`);
  }
});
const upload = multer({ storage });

router.post('/v1/consultants/avatar', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const tenantId = (req.body as any)?.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });
    const filePath = (req as any).file?.path;
    if (!filePath) return res.status(400).json({ success: false, error: 'Arquivo não enviado' });
    const url = `/uploads/avatars/${path.basename(filePath)}`;
    // Atualiza avatar_url do consultor corrente
    const { data: cons } = await supabase.from('consultants').select('id').eq('tenant_id', tenantId).maybeSingle();
    if (cons?.id) await supabase.from('consultants').update({ avatar_url: url, updated_at: new Date().toISOString() }).eq('id', cons.id);
    res.json({ success: true, url });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
