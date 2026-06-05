const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 8000,
  path: '/api/settings',
  method: 'GET',
  headers: {
    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || ''
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => { console.log(data); });
});
req.end();
