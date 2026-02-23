const fetch = require('node-fetch'); // Needs node-fetch installed or use built-in fetch in Node 18+

const API_URL = 'http://localhost:4000/v1/communications/materials';
const TENANT_ID = '523554e3-00ef-41b9-adee-a6798111ef50';


async function test() {
    try {
        const urlMaterials = `http://localhost:4000/v1/communications/materials?tenantId=${TENANT_ID}`;
        console.log(`Fetching ${urlMaterials}...`);
        const resM = await fetch(urlMaterials);
        console.log(`Materials Status: ${resM.status}`);
        console.log('Materials Body:', await resM.text());

        const urlCatalogs = `http://localhost:4000/v1/communications/catalogs?tenantId=${TENANT_ID}`;
        console.log(`Fetching ${urlCatalogs}...`);
        const resC = await fetch(urlCatalogs);
        console.log(`Catalogs Status: ${resC.status}`);
        console.log('Catalogs Body:', await resC.text());

    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
