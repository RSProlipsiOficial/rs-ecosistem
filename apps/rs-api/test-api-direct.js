const axios = require('axios');

axios.post('http://localhost:8080/api/shipping/calculate', {
  from: { postal_code: '29146385' },
  to: { postal_code: '01310100' },
  products: [
    { 
      id: '1', 
      width: 20, 
      height: 30, 
      length: 10, 
      weight: 0.5, 
      insurance_value: 150, 
      quantity: 1 
    }
  ]
})
.then(r => {
  console.log('✅ SUCESSO:');
  console.log(JSON.stringify(r.data, null, 2));
})
.catch(e => {
  console.log('❌ ERRO:');
  if (e.response) {
    console.log('Status:', e.response.status);
    console.log('Data:', JSON.stringify(e.response.data, null, 2));
  } else {
    console.log('Message:', e.message);
  }
});
