const axios = require('axios');
axios.get('http://localhost:4000/v1/marketplace/products?tenantId=d107da4e-e266-41b0-947a-0c66b2f2b9ef')
  .then(r => {
    const alpha = r.data.data.find(x => x.name === 'AlphaLipsi');
    console.log('Images array:', alpha ? alpha.images : 'Nao achou');
  })
  .catch(console.error);
