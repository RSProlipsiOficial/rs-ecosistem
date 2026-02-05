import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rptkhrboejbwexseikuo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNDg5MSwiZXhwIjoyMDcyNTkwODkxfQ.Ka6uusggq9DXkiZ-luAi8hAkwV5LX6GPtnEgSpq7uYo';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const ALYSSON_LANCAMENTO_ID = 'df368868-840e-471a-bb75-9ce304d3da13';

async function finalFix() {
    console.log('--- FIX FINAL ALYSSON ---');

    // Atualizar
    const { error } = await supabase
        .from('lancamentos_financeiros')
        .update({
            pagamento_status: 'pago',
            status: 'realizado',
            pago_em: new Date().toISOString()
        })
        .eq('id', ALYSSON_LANCAMENTO_ID);

    if (error) {
        console.error('Erro no update:', error);
    } else {
        console.log('Update enviado requisitado.');
    }

    // Verificar
    const { data } = await supabase
        .from('lancamentos_financeiros')
        .select('*')
        .eq('id', ALYSSON_LANCAMENTO_ID)
        .single();

    console.log('Status Pós-Fix:', data?.pagamento_status);
}

finalFix();
