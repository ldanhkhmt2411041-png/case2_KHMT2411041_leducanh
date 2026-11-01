const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTest() {
  console.log('--- BAT DAU TEST API AUTH ---');
  
  const emailTest = `test_${Date.now()}@gmail.com`;
  console.log('1. Gui yeu cau dang ky voi email: ' + emailTest);
  const regRes = await post('/api/auth/register', {
    name: 'Le Duc Anh Test',
    email: emailTest,
    password: 'password123'
  });
  console.log('Ket qua dang ky:', regRes.body);

  const msg = regRes.body.message || '';
  const match = msg.match(/\d{6}/);
  if (match) {
    const code = match[0];
    console.log('');
    console.log('2. Phat hien ma xac thuc: ' + code + ', tien hanh kich hoat tai khoan...');
    const verifyRes = await post('/api/auth/verify', { email: emailTest, code: code });
    console.log('Ket qua kich hoat:', verifyRes.body);

    console.log('');
    console.log('3. Thu dang nhap sau khi da kich hoat...');
    const loginRes = await post('/api/auth/login', { email: emailTest, password: 'password123' });
    console.log('Ket qua dang nhap:', loginRes.body);
    if (loginRes.body.token) {
      console.log('');
      console.log('TEST THANH CONG: He thong cap JWT Token hop le!');
    }
  } else {
    console.log('Chua lay duoc ma xac thuc tu message.');
  }
}

runTest();
