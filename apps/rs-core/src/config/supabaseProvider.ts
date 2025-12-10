import { createClient } from '@supabase/supabase-js';
import { ConfigProvider, RULES } from 'rs-ops-config';
import { getEnv } from 'rs-ops-config';

// Initialize Supabase Client
const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials missing for ConfigProvider. Dynamic rules will fail.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export class SupabaseConfigProvider implements ConfigProvider {
    async getRule<T>(section: keyof typeof RULES, key: string): Promise<T | null> {
        try {
            // Map RULES keys to DB columns/tables
            // Currently we only map SIGMA.CYCLE_VALUE to sigma_settings.cycle_value
            // This can be expanded as needed

            if (section === 'SIGMA' && key === 'CYCLE_VALUE') {
                const { data, error } = await supabase
                    .from('sigma_settings')
                    .select('cycle_value')
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.error('Error fetching rule:', error);
                    return null;
                }

                if (data && data.cycle_value) {
                    return Number(data.cycle_value) as T;
                }
            }

            // Future mappings can be added here

            return null;
        } catch (error) {
            console.error('Unexpected error in ConfigProvider:', error);
            return null;
        }
    }
}
