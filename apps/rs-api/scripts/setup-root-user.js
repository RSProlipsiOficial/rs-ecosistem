
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ROOT_USER = {
  email: 'rsprolipsioficial@gmail.com',
  password: 'Yannis784512@',
  cpf: '05063258905',
  nome: 'RS Prólipsi',
  telefone: '11999999999', // Placeholder or specific if known
  data_nascimento: '1984-03-11',
  cep: '83314-326',
  numero: '157',
  login: 'rsprolipsi'
};

async function setupRootUser() {
  console.log('Starting Root User Setup...');

  // 1. Check/Create Auth User
  let userId;
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const existingUser = users.users.find(u => u.email === ROOT_USER.email);

  if (existingUser) {
    console.log('User already exists in Auth:', existingUser.id);
    userId = existingUser.id;
  } else {
    console.log('Creating new Auth User...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: ROOT_USER.email,
      password: ROOT_USER.password,
      email_confirm: true,
      user_metadata: { name: ROOT_USER.nome }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }
    userId = newUser.user.id;
    console.log('User created:', userId);
  }

  // 2. Upsert Consultor Profile
  console.log('Upserting Consultor Profile...');
  const consultorData = {
    user_id: userId,
    nome: ROOT_USER.nome,
    email: ROOT_USER.email,
    cpf: ROOT_USER.cpf,
    data_nascimento: ROOT_USER.data_nascimento,
    cep: ROOT_USER.cep,
    numero: ROOT_USER.numero,
    // Add other fields if necessary based on schema
    status: 'ativo',
    pin_atual: 'Diamante', // Root should be high level? Or just active.
    pin_nivel: 10
  };

  // We need to check if consultor exists by email or cpf to get ID if needed, or just upsert based on unique constraints
  // The schema says email and cpf are unique.

  // First try to get the consultor ID if exists
  const { data: existingConsultor } = await supabase
    .from('consultores')
    .select('id')
    .eq('user_id', userId)
    .single();

  let consultorId;

  if (existingConsultor) {
    const { data, error } = await supabase
      .from('consultores')
      .update(consultorData)
      .eq('id', existingConsultor.id)
      .select()
      .single();

    if (error) console.error('Error updating consultor:', error);
    else console.log('Consultor updated:', data.id);
    consultorId = existingConsultor.id;
  } else {
    const { data, error } = await supabase
      .from('consultores')
      .insert(consultorData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting consultor:', error);
      // Fallback: check if table is actually 'profiles'
      console.log('Checking if "profiles" table exists instead...');
      const { data: pData, error: pError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: ROOT_USER.nome,
          email: ROOT_USER.email,
          cpf: ROOT_USER.cpf,
          role: 'admin'
        })
        .select();
      if (pError) console.error('Error inserting profiles:', pError);
      else console.log('Inserted into profiles instead.');

      return; // Stop here if schema is different
    } else {
      console.log('Consultor inserted:', data.id);
      consultorId = data.id;
    }
  }

  if (!consultorId) return;

  // 3. Upsert Wallet
  console.log('Upserting Wallet...');
  const { error: walletError } = await supabase
    .from('wallets')
    .upsert({
      user_id: userId,
      consultor_id: consultorId,
      status: 'ativa'
    }, { onConflict: 'user_id' });

  if (walletError) console.error('Error upserting wallet:', walletError);
  else console.log('Wallet upserted.');

  // 4. Ensure Ranking/Matrix root
  // If this is the root, it has no sponsor.
  // Check if 'ranking' table exists and add entry
  const { error: rankingError } = await supabase
    .from('ranking')
    .upsert({
      consultor_id: consultorId,
      periodo_tipo: 'mensal',
      periodo_referencia: new Date().toISOString().slice(0, 7), // YYYY-MM
      posicao: 1
    }, { onConflict: 'consultor_id' }); // This might fail if unique constraint is different

  if (rankingError) console.log('Ranking upsert failed (might be optional):', rankingError.message);

  console.log('Root user setup complete.');
}

setupRootUser();
