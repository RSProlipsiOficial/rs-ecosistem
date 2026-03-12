const http = require('http');
http.get('http://localhost:4000/v1/marketplace/products?tenantId=d107da4e-e266-41b0-947a-0c66b2f2b9ef', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        const alpha = json.data.find(x => x.name === 'AlphaLipsi');
        console.log(JSON.stringify(alpha.images, null, 2));
    });
});
