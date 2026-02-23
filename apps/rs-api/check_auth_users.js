const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
}, {});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    try {
        // listUsers returns a paginated list. We can't get total count easily without iterating or checking page info if available.
        // But let's see if we get a large number in the first page or if we can infer.
        // Actually, for 43k users, listUsers might be slow.
        // Let's try to get the first page and see if there's a total count property in the response (some versions have it).
        const { data: { users, total }, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

        if (error) {
            console.log('Error listing auth users:', error.message);
        } else {
            console.log('Auth Users Total:', total); // 'total' is often returned in the meta
            console.log('Users array length:', users.length);
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

run();
