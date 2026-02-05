import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Yannis784512%40@db.rptkhrboejbwexseikuo.supabase.co:5432/postgres' });

async function main() {
    try {
        const res = await pool.query(`
            SELECT id, email, raw_user_meta_data 
            FROM auth.users 
            WHERE id::text LIKE 'a2782%' OR id::text LIKE 'b8890%'
        `);
        console.log('Dados dos usuários encontrados:');
        res.rows.forEach(u => {
            console.log(`ID: ${u.id} | Email: ${u.email}`);
            console.log('Metadata:', JSON.stringify(u.raw_user_meta_data, null, 2));
        });
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
main();
