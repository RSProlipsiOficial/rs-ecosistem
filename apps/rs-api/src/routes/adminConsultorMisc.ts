import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { resolveConsultantIdentifiers } from '../utils/consultantIdentifiers';

const router = Router();

function sb() {
  const url = process.env.SUPABASE_URL as string;
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY) as string;
  return createClient(url, key);
}

function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY));
}

const CONFIG_FILE = path.join(process.cwd(), 'public', 'config.json');
const DETAILED_MAPPING_CANDIDATES = [
  path.join(process.cwd(), 'src', 'routes', 'v1', 'detailed_id_mapping.json'),
  path.join(__dirname, 'v1', 'detailed_id_mapping.json'),
];
const defaultEditPermissions = {
  can_edit_name: true,
  can_edit_birthDate: true,
  can_edit_whatsapp: true,
  can_edit_cep: true,
  can_edit_street: true,
  can_edit_number: true,
  can_edit_neighborhood: true,
  can_edit_city: true,
  can_edit_state: true,
  can_edit_bankName: true,
  can_edit_agency: true,
  can_edit_account: true,
  can_edit_accountType: true,
  can_edit_pix: true,
  can_edit_avatar: true,
  can_edit_cover: true,
  can_edit_cpfCnpj: true,
  can_edit_consultantId: false,
  can_edit_registerDate: false,
  can_edit_sponsor: false,
};

function readLocalConfig(): any {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeLocalConfig(upd: any) {
  const cur = readLocalConfig();
  const next = { ...cur, ...upd };
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2), 'utf-8');
}

const permissionsKey = (id: string) => `consultant_edit_permissions:${id}`;

const normalizeLookupText = (value: any) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

type DetailedMappingEntry = {
  code?: string;
  username?: string | null;
  order?: number;
  name?: string;
  email?: string;
  sourceKey?: string;
};

function loadDetailedMapping() {
  const initial = {
    entries: [] as DetailedMappingEntry[],
    byCode: new Map<string, DetailedMappingEntry>(),
    byOrder: new Map<string, DetailedMappingEntry>(),
    byName: new Map<string, DetailedMappingEntry>(),
    byEmail: new Map<string, DetailedMappingEntry>(),
    byUsername: new Map<string, DetailedMappingEntry>(),
  };

  const filePath = DETAILED_MAPPING_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!filePath) return initial;

  try {
    const rawMapping = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const [sourceKey, rawEntry] of Object.entries(rawMapping)) {
      const entry = {
        ...(rawEntry as Record<string, any>),
        sourceKey,
      } as DetailedMappingEntry;

      initial.entries.push(entry);

      if (entry.code) initial.byCode.set(String(entry.code).replace(/\D/g, ''), entry);
      if (entry.order !== undefined && entry.order !== null) initial.byOrder.set(String(entry.order), entry);
      if (sourceKey) initial.byName.set(normalizeLookupText(sourceKey), entry);
      if (entry.email) initial.byEmail.set(normalizeLookupText(entry.email), entry);
      if (entry.username) initial.byUsername.set(normalizeLookupText(entry.username), entry);
    }
  } catch (error) {
    console.error('[adminConsultorMisc] Erro ao ler detailed_id_mapping.json:', error);
  }

  return initial;
}

const normalizeStatus = (value: any) => {
  const status = String(value || 'ativo').trim().toLowerCase();
  if (status === 'pendente') return 'pendente';
  if (status === 'bloqueado') return 'bloqueado';
  if (status === 'inativo') return 'inativo';
  return 'ativo';
};

const resolveMappingForConsultor = (consultor: any, mapping = loadDetailedMapping()) => {
  const emailKey = normalizeLookupText(consultor?.email);
  const usernameKey = normalizeLookupText(consultor?.username);
  const nameKey = normalizeLookupText(consultor?.nome);

  return (
    (emailKey ? mapping.byEmail.get(emailKey) : undefined) ||
    (usernameKey ? mapping.byUsername.get(usernameKey) : undefined) ||
    (nameKey ? mapping.byName.get(nameKey) : undefined) ||
    null
  );
};

const findConsultorByMappingEntry = async (supabase: ReturnType<typeof sb>, entry: DetailedMappingEntry) => {
  if (entry.email) {
    const byEmail = await supabase
      .from('consultores')
      .select('id, nome, cpf, email, telefone, whatsapp, username, patrocinador_id, created_at, patrocinador:patrocinador_id(nome)')
      .eq('email', entry.email)
      .maybeSingle();
    if (byEmail.data) return byEmail.data;
  }

  if (entry.username) {
    const byUsername = await supabase
      .from('consultores')
      .select('id, nome, cpf, email, telefone, whatsapp, username, patrocinador_id, created_at, patrocinador:patrocinador_id(nome)')
      .eq('username', entry.username)
      .maybeSingle();
    if (byUsername.data) return byUsername.data;
  }

  const nameCandidates = [entry.sourceKey, entry.name].filter(Boolean) as string[];
  for (const candidate of nameCandidates) {
    const exactByName = await supabase
      .from('consultores')
      .select('id, nome, cpf, email, telefone, whatsapp, username, patrocinador_id, created_at, patrocinador:patrocinador_id(nome)')
      .ilike('nome', candidate)
      .maybeSingle();
    if (exactByName.data) return exactByName.data;

    const partialByName = await supabase
      .from('consultores')
      .select('id, nome, cpf, email, telefone, whatsapp, username, patrocinador_id, created_at, patrocinador:patrocinador_id(nome)')
      .ilike('nome', `%${candidate}%`)
      .limit(1)
      .maybeSingle();
    if (partialByName.data) return partialByName.data;
  }

  return null;
};

const toSearchResult = (row: any, mapping = loadDetailedMapping()) => {
  const resolvedMapping = resolveMappingForConsultor(row, mapping);
  const identifiers = resolveConsultantIdentifiers({
    consultor: row,
    mapping: resolvedMapping,
  });

  return {
    id: row.id,
    userId: row.user_id || row.id,
    numericId: identifiers.accountCode,
    loginId: identifiers.loginId,
    registrationOrder: resolvedMapping?.order || null,
    nome: row.nome || '',
    cpfCnpj: row.cpf || '',
    email: row.email || '',
    whatsapp: row.whatsapp || row.telefone || '',
    patrocinador_id: row.patrocinador_id || null,
    sponsorName: row.patrocinador?.nome || '',
  };
};

const getConsultantProfile = async (supabase: ReturnType<typeof sb>, consultantId: string) => {
  const { data: consultor, error: consultorError } = await supabase
    .from('consultores')
    .select(`
      id,
      user_id,
      nome,
      cpf,
      email,
      telefone,
      whatsapp,
      status,
      username,
      pin_atual,
      patrocinador_id,
      created_at,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      patrocinador:patrocinador_id(nome, username)
    `)
    .eq('id', consultantId)
    .maybeSingle();

  if (consultorError) {
    throw consultorError;
  }

  if (!consultor) {
    return null;
  }

  const authUserId = (consultor as any).user_id || (consultor as any).id;
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', authUserId)
    .maybeSingle();

  return {
    consultor,
    profile,
  };
};

router.get('/admin/consultor/search', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ success: true, results: [] });

    const supabase = sb();
    const mapping = loadDetailedMapping();
    const results: any[] = [];
    const seenIds = new Set<string>();
    const digitsQuery = q.replace(/\D/g, '');

    const pushResult = (row: any) => {
      if (!row?.id || seenIds.has(row.id)) return;
      seenIds.add(row.id);
      results.push(toSearchResult(row, mapping));
    };

    if (digitsQuery) {
      const scanQuery = await supabase
        .from('consultores')
        .select('id, user_id, nome, cpf, email, telefone, whatsapp, username, patrocinador_id, created_at, patrocinador:patrocinador_id(nome)')
        .limit(2000);

      if (scanQuery.error) throw scanQuery.error;

      for (const row of scanQuery.data || []) {
        const resolved = toSearchResult(row, mapping);
        if (String(resolved.numericId || '') === digitsQuery) {
          pushResult(row);
        }
      }

      const mappedEntries = [
        mapping.byCode.get(digitsQuery),
        mapping.byOrder.get(String(Number(digitsQuery))),
      ].filter(Boolean) as DetailedMappingEntry[];

      for (const entry of mappedEntries) {
        const row = await findConsultorByMappingEntry(supabase, entry);
        if (row) pushResult(row);
      }
    }

    const like = `%${q}%`;
    const textQuery = await supabase
      .from('consultores')
      .select('id, user_id, nome, cpf, email, telefone, whatsapp, username, patrocinador_id, created_at, patrocinador:patrocinador_id(nome)')
      .or([
        `nome.ilike.${like}`,
        `cpf.ilike.${like}`,
        `email.ilike.${like}`,
        `username.ilike.${like}`,
        `telefone.ilike.${like}`,
        `whatsapp.ilike.${like}`,
      ].join(','))
      .order('created_at', { ascending: false })
      .limit(20);

    if (textQuery.error) throw textQuery.error;

    for (const row of textQuery.data || []) {
      pushResult(row);
    }

    if (isUuid(q)) {
      const uuidQuery = await supabase
        .from('consultores')
        .select('id, user_id, nome, cpf, email, telefone, whatsapp, username, patrocinador_id, created_at, patrocinador:patrocinador_id(nome)')
        .or(`id.eq.${q},patrocinador_id.eq.${q}`)
        .limit(20);

      if (uuidQuery.error) throw uuidQuery.error;

      for (const row of uuidQuery.data || []) {
        pushResult(row);
      }
    }

    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/consultor/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const supabase = sb();
    const data = await getConsultantProfile(supabase, id);

    if (!data) {
      return res.status(404).json({ success: false, error: 'Consultor nao encontrado' });
    }

    const { consultor, profile } = data;
    const authUserId = (consultor as any).user_id || (consultor as any).id;
    const resolvedMapping = resolveMappingForConsultor(consultor);
    const identifiers = resolveConsultantIdentifiers({
      consultor,
      profile,
      mapping: resolvedMapping,
    });
    const consultant = {
      id: (consultor as any).id,
      auth_user_id: authUserId,
      numeric_id: identifiers.accountCode,
      registration_order: resolvedMapping?.order || null,
      consultant_id: identifiers.loginId,
      name: profile?.nome_completo || (consultor as any).nome || '',
      cpf_cnpj: profile?.cpf || (consultor as any).cpf || '',
      email: (consultor as any).email || profile?.email || '',
      phone: profile?.telefone || (consultor as any).whatsapp || (consultor as any).telefone || '',
      birth_date: profile?.data_nascimento || '',
      address: {
        cep: profile?.endereco_cep || (consultor as any).cep || '',
        street: profile?.endereco_rua || (consultor as any).endereco || '',
        number: profile?.endereco_numero || (consultor as any).numero || '',
        complement: profile?.endereco_complemento || (consultor as any).complemento || '',
        neighborhood: profile?.endereco_bairro || (consultor as any).bairro || '',
        city: profile?.endereco_cidade || (consultor as any).cidade || '',
        state: profile?.endereco_estado || (consultor as any).estado || '',
      },
      bank_info: {
        bankName: profile?.banco_nome || '',
        bankCode: '',
        agency: profile?.banco_agencia || '',
        account: profile?.banco_conta || '',
        accountType: profile?.banco_tipo || 'Corrente',
        pix: profile?.banco_pix || '',
      },
      patrocinador_id: (consultor as any).patrocinador_id || '',
      sponsor_name: (consultor as any).patrocinador?.nome || '',
      status: normalizeStatus((consultor as any).status),
      registration_date: ((consultor as any).created_at || '').slice(0, 10),
    };

    res.json({ success: true, consultant });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/admin/consultor/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const payload = req.body || {};
    const supabase = sb();
    const data = await getConsultantProfile(supabase, id);

    if (!data) {
      return res.status(404).json({ success: false, error: 'Consultor nao encontrado' });
    }

    const { consultor } = data;
    const authUserId = (consultor as any).user_id || (consultor as any).id;

    let sponsorId = (consultor as any).patrocinador_id || null;
    if (payload.sponsor) {
      const sponsorValue = String(payload.sponsor).trim();
      const sponsorDigits = sponsorValue.replace(/\D/g, '');
      if (sponsorDigits) {
        const mapping = loadDetailedMapping();
        const sponsorMapping =
          mapping.byCode.get(sponsorDigits) ||
          mapping.byOrder.get(String(Number(sponsorDigits))) ||
          null;

        if (sponsorMapping) {
          const mappedSponsor = await findConsultorByMappingEntry(supabase, sponsorMapping);
          if (mappedSponsor?.id) {
            sponsorId = mappedSponsor.id;
          }
        }
      }

      const sponsorById = await supabase
        .from('consultores')
        .select('id')
        .eq('id', sponsorValue)
        .maybeSingle();

      if (sponsorById.data?.id) {
        sponsorId = sponsorById.data.id;
      } else {
        const sponsorByUsername = await supabase
          .from('consultores')
          .select('id')
          .eq('username', sponsorValue)
          .maybeSingle();

        if (sponsorByUsername.data?.id) {
          sponsorId = sponsorByUsername.data.id;
        } else {
          const sponsorByName = await supabase
            .from('consultores')
            .select('id')
            .ilike('nome', sponsorValue)
            .limit(1)
            .maybeSingle();

          if (sponsorByName.data?.id) {
            sponsorId = sponsorByName.data.id;
          }
        }
      }
    }

    const consultorUpdate: any = {
      nome: payload.name,
      cpf: payload.cpfCnpj,
      email: payload.email,
      telefone: payload.whatsapp,
      whatsapp: payload.whatsapp,
      status: normalizeStatus(payload.status),
      patrocinador_id: sponsorId,
      endereco: payload.address?.street || null,
      numero: payload.address?.number || null,
      complemento: payload.address?.complement || null,
      bairro: payload.address?.neighborhood || null,
      cidade: payload.address?.city || null,
      estado: payload.address?.state || null,
      cep: payload.address?.cep || null,
    };

    if (payload.registerDate) {
      consultorUpdate.created_at = new Date(`${payload.registerDate}T12:00:00.000Z`).toISOString();
    }

    const { error: updateConsultorError } = await supabase
      .from('consultores')
      .update(consultorUpdate)
      .eq('id', id);

    if (updateConsultorError) throw updateConsultorError;

    const profilePayload = {
      user_id: authUserId,
      nome_completo: payload.name || null,
      email: payload.email || null,
      telefone: payload.whatsapp || null,
      cpf: payload.cpfCnpj || null,
      data_nascimento: payload.birthDate || null,
      endereco_cep: payload.address?.cep || null,
      endereco_rua: payload.address?.street || null,
      endereco_numero: payload.address?.number || null,
      endereco_complemento: payload.address?.complement || null,
      endereco_bairro: payload.address?.neighborhood || null,
      endereco_cidade: payload.address?.city || null,
      endereco_estado: payload.address?.state || null,
      banco_nome: payload.bankInfo?.bankName || null,
      banco_agencia: payload.bankInfo?.agency || null,
      banco_conta: payload.bankInfo?.account || null,
      banco_tipo: payload.bankInfo?.accountType || null,
      banco_pix: payload.bankInfo?.pix || null,
      sponsor_id: sponsorId,
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profilePayload, { onConflict: 'user_id' });

    if (profileError) {
      const { error: fallbackProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: authUserId,
          nome_completo: payload.name || null,
          telefone: payload.whatsapp || null,
          cpf: payload.cpfCnpj || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (fallbackProfileError) throw fallbackProfileError;
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/consultor/:id/edit-permissions', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const supabase = sb();
    const key = permissionsKey(id);

    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    res.json({
      success: true,
      permissions: {
        ...defaultEditPermissions,
        ...((data as any)?.value || {}),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/admin/consultor/:id/edit-permissions', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const supabase = sb();
    const key = permissionsKey(id);
    const incoming = req.body || {};

    const { data: current } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    const nextValue = {
      ...defaultEditPermissions,
      ...((current as any)?.value || {}),
      ...incoming,
    };

    if (current) {
      const { error } = await supabase
        .from('settings')
        .update({ value: nextValue })
        .eq('key', key);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('settings')
        .insert({ key, value: nextValue });
      if (error) throw error;
    }

    res.json({ success: true, permissions: nextValue });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dashboard config (global)
router.get('/admin/consultor/dashboard-config', async (_req: Request, res: Response) => {
  try {
    let cfg: any;
    if (hasSupabaseEnv()) {
      const supabase = sb();
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'consultant_dashboard_config')
        .maybeSingle();
      cfg = (data as any)?.value;
    } else {
      cfg = readLocalConfig().consultant_dashboard_config;
    }
    cfg = cfg || { widgets: [], layout: {}, personalization: {} };
    res.json({ success: true, config: cfg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/admin/consultor/dashboard-config', async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};
    if (hasSupabaseEnv()) {
      const supabase = sb();
      const { data } = await supabase
        .from('settings')
        .select('key')
        .eq('key', 'consultant_dashboard_config')
        .maybeSingle();
      if (data) {
        await supabase
          .from('settings')
          .update({ value: payload })
          .eq('key', 'consultant_dashboard_config');
      } else {
        await supabase
          .from('settings')
          .insert({ key: 'consultant_dashboard_config', value: payload });
      }
    } else {
      writeLocalConfig({ consultant_dashboard_config: payload });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/consultor/dashboard/config', async (_req: Request, res: Response) => {
  try {
    let cfg: any;
    if (hasSupabaseEnv()) {
      const supabase = sb();
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'consultant_dashboard_config')
        .maybeSingle();
      cfg = (data as any)?.value;
    } else {
      cfg = readLocalConfig().consultant_dashboard_config;
    }
    cfg = cfg || { widgets: [], layout: {}, personalization: {} };
    res.json({ success: true, config: cfg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/dashboard-layout/consultant', async (_req: Request, res: Response) => {
  try {
    let cfg: any;
    if (hasSupabaseEnv()) {
      const supabase = sb();
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'consultant_dashboard_config')
        .maybeSingle();
      cfg = (data as any)?.value;
    } else {
      cfg = readLocalConfig().consultant_dashboard_config;
    }
    cfg = cfg || { widgets: [], layout: {}, personalization: {} };
    res.json({ success: true, config: cfg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
