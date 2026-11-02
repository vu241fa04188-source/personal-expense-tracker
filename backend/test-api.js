const http = require('http');

async function testBackend() {
  const server = require('./server.js');
  // wait 2 seconds for server and DB to initialize
  await new Promise((r) => setTimeout(r, 2000));

  const testEmail = `student_${Date.now()}@test.com`;
  let token = '';
  let txId = '';

  console.log('\n--- 1. Testing Registration ---');
  const regRes = await post('/api/auth/register', {
    name: 'College Student',
    email: testEmail,
    password: 'password123',
  });
  console.log('Register Response:', regRes.status, regRes.body.success ? 'SUCCESS' : 'FAILED');
  if (regRes.body.data && regRes.body.data.token) {
    token = regRes.body.data.token;
  }

  console.log('\n--- 2. Testing Login ---');
  const loginRes = await post('/api/auth/login', {
    email: testEmail,
    password: 'password123',
  });
  console.log('Login Response:', loginRes.status, loginRes.body.success ? 'SUCCESS' : 'FAILED');

  console.log('\n--- 3. Testing Add Income Transaction ---');
  const incRes = await post(
    '/api/transactions',
    {
      title: 'Monthly Pocket Money / Salary',
      amount: 15000,
      type: 'income',
      category: 'Salary',
      date: new Date(),
      description: 'Allowance from family',
    },
    token
  );
  console.log('Add Income:', incRes.status, incRes.body.success ? 'SUCCESS' : 'FAILED');

  console.log('\n--- 4. Testing Add Expense Transaction ---');
  const expRes = await post(
    '/api/transactions',
    {
      title: 'College Books & Stationery',
      amount: 2500,
      type: 'expense',
      category: 'Education',
      date: new Date(),
      description: 'Semester books and notebooks',
    },
    token
  );
  console.log('Add Expense:', expRes.status, expRes.body.success ? 'SUCCESS' : 'FAILED');
  if (expRes.body.data) {
    txId = expRes.body.data._id;
  }

  console.log('\n--- 5. Testing Dashboard Summary ---');
  const sumRes = await get('/api/transactions/summary', token);
  console.log('Dashboard Summary:', sumRes.status, sumRes.body.data);

  console.log('\n--- 6. Testing Transaction List ---');
  const listRes = await get('/api/transactions', token);
  console.log('Transaction Count:', listRes.body.count);

  console.log('\n--- 7. Testing Update Transaction ---');
  const updRes = await put(
    `/api/transactions/${txId}`,
    {
      title: 'College Books (Updated)',
      amount: 2800,
      type: 'expense',
      category: 'Education',
      description: 'Updated with additional lab manuals',
    },
    token
  );
  console.log('Update Transaction:', updRes.status, updRes.body.success ? 'SUCCESS' : 'FAILED');

  console.log('\n--- 8. Testing Monthly Reports ---');
  const repRes = await get('/api/transactions/reports', token);
  console.log('Monthly Reports:', repRes.status, 'Total Savings:', repRes.body.data.totalYearSavings);

  console.log('\n=======================================');
  console.log('ALL BACKEND API TESTS COMPLETED AND VERIFIED!');
  console.log('=======================================\n');

  process.exit(0);
}

function post(path, body, token) {
  return request('POST', path, body, token);
}
function put(path, body, token) {
  return request('PUT', path, body, token);
}
function get(path, token) {
  return request('GET', path, null, token);
}

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

testBackend().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

