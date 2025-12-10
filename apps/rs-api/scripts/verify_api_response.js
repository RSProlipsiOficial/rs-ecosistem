
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'g:\\Rs  Ecosystem\\rs-ecosystem\\apps\\rs-api\\.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiUrl = process.env.VITE_API_URL || 'http://localhost:4000'; // Make sure this matches backend

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyApi() {
    console.log('1. Getting Admin Token...');
    const email = 'rsprolipsioficial@gmail.com';
    const password = 'Yannis784512@';

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError) {
        console.error('Login failed:', authError);
        return;
    }

    const token = authData.session.access_token;
    console.log('Token acquired.');

    console.log('2. Calling /v1/admin/career/levels...');
    try {
        const response = await axios.get(`${apiUrl}/v1/admin/career/levels`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('API Call failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

verifyApi();
