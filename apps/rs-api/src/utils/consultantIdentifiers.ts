export const normalizeDigits = (value: any) => String(value || '').replace(/\D/g, '');

export const normalizeLookupText = (value: any) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const sanitizeLoginCandidate = (value: any) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

export const isPlaceholderIdentifier = (value: any) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized || normalized === 'null' || normalized === 'undefined') return true;
  if (/^0+$/.test(normalized)) return true;
  return false;
};

export const collectExistingIdentifiers = (rows: any[], profileMap?: Map<string, any>) => {
  const usedCodes = new Set<string>();
  const usedLogins = new Set<string>();

  for (const row of rows || []) {
    const profile = profileMap?.get(row?.user_id) || profileMap?.get(row?.id);
    const rawCode = normalizeDigits(profile?.id_numerico || row?.codigo_consultor);
    const rawLogin = sanitizeLoginCandidate(row?.username || row?.id_consultor || profile?.slug);

    if (rawCode && !isPlaceholderIdentifier(rawCode)) usedCodes.add(rawCode);
    if (rawLogin && !isPlaceholderIdentifier(rawLogin)) usedLogins.add(rawLogin);
  }

  return { usedCodes, usedLogins };
};

const buildHash = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

export const generateAccountCode = (seedValue: any, usedCodes = new Set<string>()) => {
  const seed = String(seedValue || '').trim() || `${Date.now()}`;
  let candidate = String((buildHash(seed) % 9000000) + 1000000);

  while (usedCodes.has(candidate) || isPlaceholderIdentifier(candidate)) {
    candidate = String(((Number(candidate) + 1 - 1000000) % 9000000) + 1000000);
  }

  usedCodes.add(candidate);
  return candidate;
};

export const generateLoginId = (nameValue: any, accountCode: string, usedLogins = new Set<string>()) => {
  const parts = String(nameValue || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);

  let base = '';
  if (parts.length >= 2) {
    base = `${parts[0]}${parts[parts.length - 1]}`;
  } else if (parts.length === 1) {
    base = parts[0];
  } else {
    base = 'consultor';
  }

  base = base.slice(0, 14) || 'consultor';
  let candidate = base;

  if (usedLogins.has(candidate)) {
    candidate = `${base.slice(0, 10)}${String(accountCode || '').slice(-4)}`;
  }

  let bump = 1;
  while (usedLogins.has(candidate) || isPlaceholderIdentifier(candidate)) {
    candidate = `${base.slice(0, 10)}${String(accountCode || '').slice(-3)}${bump}`;
    bump += 1;
  }

  usedLogins.add(candidate);
  return candidate;
};

export const resolveConsultantIdentifiers = ({
  consultor,
  profile,
  mapping,
  usedCodes,
  usedLogins,
}: {
  consultor: any;
  profile?: any;
  mapping?: any;
  usedCodes?: Set<string>;
  usedLogins?: Set<string>;
}) => {
  const accountCodeCandidate = normalizeDigits(
    mapping?.code || profile?.id_numerico || consultor?.codigo_consultor
  );

  const accountCode = !isPlaceholderIdentifier(accountCodeCandidate)
    ? accountCodeCandidate
    : generateAccountCode(
        consultor?.user_id || consultor?.id || consultor?.email || consultor?.nome,
        usedCodes
      );

  const loginCandidate = sanitizeLoginCandidate(
    mapping?.username || consultor?.username || consultor?.id_consultor || profile?.slug
  );

  const loginId = !isPlaceholderIdentifier(loginCandidate)
    ? loginCandidate
    : generateLoginId(consultor?.nome || profile?.nome_completo || consultor?.email, accountCode, usedLogins);

  return {
    accountCode: String(accountCode),
    loginId: String(loginId),
    displayId: String(accountCode),
  };
};

export const persistConsultantIdentifiers = async ({
  supabase,
  consultor,
  profile,
  identifiers,
}: {
  supabase: any;
  consultor: any;
  profile?: any;
  identifiers: {
    accountCode: string;
    loginId: string;
  };
}) => {
  const rawCode = normalizeDigits(profile?.id_numerico || consultor?.codigo_consultor);

  const consultorUpdates: Record<string, any> = {};
  if (isPlaceholderIdentifier(rawCode) && identifiers.accountCode) {
    consultorUpdates.codigo_consultor = identifiers.accountCode;
  }

  if (consultor?.id && Object.keys(consultorUpdates).length > 0) {
    await supabase
      .from('consultores')
      .update(consultorUpdates)
      .eq('id', consultor.id);
  }

  const profileUpdates: Record<string, any> = {};
  if (isPlaceholderIdentifier(rawCode) && identifiers.accountCode) {
    profileUpdates.id_numerico = identifiers.accountCode;
  }

  const targetUserId = profile?.user_id || consultor?.user_id;
  if (targetUserId && Object.keys(profileUpdates).length > 0) {
    await supabase
      .from('user_profiles')
      .update(profileUpdates)
      .eq('user_id', targetUserId);
  }
};
