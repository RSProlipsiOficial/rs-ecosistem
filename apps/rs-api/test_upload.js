const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const form = new FormData();
form.append('file', fs.createReadStream('./package.json'));
form.append('tenantId', 'test');
axios.post('http://localhost:4000/v1/marketplace/upload', form, {
  headers: form.getHeaders()
}).then(r => console.log(r.data)).catch(e => console.error(e.response ? e.response.data : e.message));
