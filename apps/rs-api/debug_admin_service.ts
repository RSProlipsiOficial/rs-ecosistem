
// Mocking initialization if needed or just importing
require('dotenv').config();
const { getAdminOverview } = require('./src/services/adminDashboardService');

async function testService() {
    console.log('--- Testing getAdminOverview ---');
    try {
        const stats = await getAdminOverview();
        console.log('Result:', stats);
    } catch (error) {
        console.error('Service failed:', error);
    }
}

testService();
