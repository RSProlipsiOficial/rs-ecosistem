const axios = require('axios');

async function test() {
    const baseUrl = 'http://localhost:4000';
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${baseUrl}/v1/auth/login`, {
            email: 'rsprolipsioficial@gmail.com',
            password: '123'
        });

        const token = loginRes.data.token;
        console.log('Token obtained.');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('\n--- Testing /v1/admin/overview ---');
        const overviewRes = await axios.get(`${baseUrl}/v1/admin/overview`, config);
        console.log('Overview:', JSON.stringify(overviewRes.data, null, 2));

        console.log('\n--- Testing /v1/admin/network/root ---');
        const rootRes = await axios.get(`${baseUrl}/v1/admin/network/root`, config);
        console.log('Root:', JSON.stringify(rootRes.data, null, 2));

        if (rootRes.data.root?.id) {
            console.log(`\n--- Testing /v1/admin/network/tree/${rootRes.data.root.id} ---`);
            const treeRes = await axios.get(`${baseUrl}/v1/admin/network/tree/${rootRes.data.root.id}`, config);
            console.log('Tree nodes count:', treeRes.data.tree?.children?.length);
        }

    } catch (e) {
        console.error('Test Failed:', e.response?.data || e.message);
    }
}

test();
