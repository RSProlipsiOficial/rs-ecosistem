require('dotenv').config();
const { getAdminOverview } = require('./src/services/adminDashboardService');

async function test() {
    console.log('Testing getAdminOverview directly...');
    try {
        const data = await getAdminOverview();
        console.log('Result:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Failure:', e);
    }
}

test();
