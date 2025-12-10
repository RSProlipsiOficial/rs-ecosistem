const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const startDir = path.resolve(__dirname, '../../'); // Root of repo
const searchDirs = [
    '.',
    'apps/rs-api',
    'apps/rs-admin',
    'apps/rs-marketplace',
    'apps/rs-consultor',
    'infra'
];

console.log('🔍 Scanning for .env files...\n');

searchDirs.forEach(dir => {
    const fullDir = path.join(startDir, dir);
    const envPath = path.join(fullDir, '.env');

    if (fs.existsSync(envPath)) {
        console.log(`Found: ${envPath}`);
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        const url = envConfig.SUPABASE_URL || 'NOT_SET';
        console.log(`   SUPABASE_URL: ${url}`);
        // Check if it's the example one
        if (url.includes('example.supabase.co')) {
            console.log('   ⚠️  This looks like a placeholder/example.');
        } else if (url.includes('localhost')) {
            console.log('   ✅ This looks like a local config.');
        } else {
            console.log('   ✅ This looks like a real/remote config.');
        }
    } else {
        // console.log(`Missing: ${envPath}`);
    }
});
