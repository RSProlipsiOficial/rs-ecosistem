import { createClient } from '@supabase/supabase-js';

const url = 'https://rptkhrboejbwexseikuo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y';

const supabase = createClient(url, key);

async function inspect() {
    try {
        console.log("\n--- Inspecionando cd_transactions ---");
        const { data: t, error: te } = await supabase.from("cd_transactions").select("*").limit(1);
        if (te) console.error("Erro cd_transactions:", te.message);
        else if (t && t.length > 0) console.log("Colunas cd_transactions:", Object.keys(t[0]));
        else console.log("cd_transactions está vazia.");

        console.log("\n--- Inspecionando cd_orders ---");
        const { data: o, error: oe } = await supabase.from("cd_orders").select("*").limit(1);
        if (oe) console.error("Erro cd_orders:", oe.message);
        else if (o && o.length > 0) console.log("Colunas cd_orders:", Object.keys(o[0]));
        else console.log("cd_orders está vazia.");

        console.log("\n--- Inspecionando cd_products ---");
        const { data: p, error: pe } = await supabase.from("cd_products").select("*").limit(1);
        if (pe) console.error("Erro cd_products:", pe.message);
        else if (p && p.length > 0) console.log("Colunas cd_products:", Object.keys(p[0]));
        else console.log("cd_products está vazia.");

    } catch (err) {
        console.error("Erro fatal:", err);
    }
}

inspect();
