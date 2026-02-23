
const axios = require('axios');
const API_URL = 'http://localhost:4000';

async function test() {
    try {
        console.log('Testing System Health...');
        const health = await axios.get(`${API_URL}/v1/system/health`);
        console.log('Health:', health.data);

        // We can't easily test admin routes without a token, 
        // but we can check if the route exists by seeing if we get a 401 instead of a 404
        console.log('Testing Admin Overview (should be 401)...');
        try {
            await axios.get(`${API_URL}/v1/admin/overview`);
        } catch (e) {
            console.log('Overview Status:', e.response ? e.response.status : e.message);
            if (e.response && e.response.status === 404) {
                console.error('❌ Route /v1/admin/overview NOT FOUND');
            }
        }

        console.log('Testing Admin Consultants (should be 401)...');
        try {
            await axios.get(`${API_URL}/v1/admin/consultants`);
        } catch (e) {
            console.log('Consultants Status:', e.response ? e.response.status : e.message);
            if (e.response && e.response.status === 404) {
                console.error('❌ Route /v1/admin/consultants NOT FOUND');
            }
        }
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

test();
