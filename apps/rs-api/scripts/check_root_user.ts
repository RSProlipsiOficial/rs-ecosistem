
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateRoot() {
  console.log('Verifying Root Account (RS Prólipsi)...');

  const targetEmail = 'rsprolipsioficial@gmail.com';
  const targetLogin = 'rsprolipsi';

  // 1. Check public.consultores
  const { data: existingConsultant, error: consultError } = await supabase
    .from('consultores')
    .select('*')
    .eq('email', targetEmail)
    .maybeSingle();

  if (consultError) {
    console.error('Error checking consultores:', consultError);
    return;
  }

  if (existingConsultant) {
    console.log('Root consultant already exists:', existingConsultant.nome, `(ID: ${existingConsultant.id})`);
    console.log('Patrocinador ID:', existingConsultant.patrocinador_id);

    // Ensure it is root in matrix (if matrix table exists)
    // Assuming 'downlines' or 'sigma_matrix' table. The previous turn used 'downlines'.
    // Let's check if there is a specific matrix table or just downlines.
    // We'll assume 'consultores' has 'indicador_id'. For root, it should be null or self? Usually null.

    return;
  }

  console.log('Root consultant not found. Creating...');

  // 2. Create Auth User
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: targetEmail,
    password: 'Yannis784512@',
    email_confirm: true,
    user_metadata: {
      name: 'RS Prólipsi',
      role: 'super_admin' // or 'root'
    }
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    // If auth user exists but consultant doesn't, we might need to handle that.
    // For now, assume clean slate or consistent state.
    return;
  }

  console.log('Auth user created:', authUser.user.id);

  // 3. Create Consultant Record
  const { data: newConsultant, error: createError } = await supabase
    .from('consultores')
    .insert([{
      id: authUser.user.id,
      user_id: authUser.user.id,
      nome: 'RS Prólipsi',
      email: targetEmail,
      cpf: '05063258905',
      data_nascimento: '1984-03-11',
      status: 'ativo',
      pin_atual: 'Diamante Black'
    }])
    .select()
    .single();

  if (createError) {
    console.error('Error creating consultant record:', createError);
  } else {
    console.log('Root consultant created successfully:', newConsultant);
  }
}

checkAndCreateRoot();
