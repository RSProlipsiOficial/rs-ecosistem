
import axios from 'axios';

async function check(port: number) {
    const url = `http://localhost:${port}/admin/consultants`;
    console.log(`Checking ${url}...`);
    try {
        const res = await axios.get(url);
        console.log(`Status: ${res.status}`);
        if (res.data && res.data.success) {
            console.log(`Success: true`);
            const list = res.data.consultants || [];
            console.log(`Consultants count: ${list.length}`);
            const byName = (n: string) => list.find((c: any) => (c.name || '').toLowerCase().includes(n.toLowerCase()));
            const root = byName('RS Prólipsi');
            const emclaro = byName('Emanuel Mendes Claro') || list.find((c: any) => (c.username || '') === 'emclaro');
            const maxwel = byName('Maxwel') || list.find((c: any) => (c.username || '') === 'maxwel');
            const sampleOthers = list.slice(0, 3);
            const fmt = (c: any) => ({ id_numerico: c.code || c.id, username: c.username || '', patrocinador: c.sponsor?.name || '', diretos: c.directsCount || 0 });
            console.log('Root RS Prólipsi:', fmt(root));
            console.log('Emanuel Mendes Claro (emclaro):', fmt(emclaro));
            console.log('Maxwel Santos (maxwel):', fmt(maxwel));
            console.log('Samples:', sampleOthers.map(fmt));
        } else {
            console.log('Response:', res.data);
        }
    } catch (e: any) {
        console.log(`Error on port ${port}: ${e.message}`);
        if (e.response) {
            console.log(`Status: ${e.response.status}`);
            console.log(`Data:`, e.response.data);
        }
    }
}

async function main() {
    await check(4000);
    await check(8080);
    await check(3000); // Just in case
}

main();
