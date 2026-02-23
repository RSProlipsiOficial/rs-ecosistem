
const axios = require('axios');

async function testOverview() {
    try {
        console.log('Testing http://localhost:4000/v1/admin/debug-overview...');
        const response = await axios.get('http://localhost:4000/v1/admin/debug-overview');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error calling API:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testOverview();
