const http = require('http');

const BASE = { hostname: 'localhost', port: 5000 };

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const opts = { ...BASE, path, method, headers };
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function main() {
  // 1. Login
  const login = await req('POST', '/api/account/login', { email: 'bdalrhmnaljdy395@gmail.com', password: 'Ghoomaan' });
  console.log('LOGIN:', login.status);
  const token = JSON.parse(login.body).token;

  // 2. Admin dashboard
  const dash = await req('GET', '/api/admin/dashboard', null, token);
  console.log('DASHBOARD:', dash.status, dash.body.substring(0, 80));

  // 3. Admin users
  const users = await req('GET', '/api/admin/users', null, token);
  console.log('USERS:', users.status, 'count:', JSON.parse(users.body).length);

  // 4. Admin products
  const prods = await req('GET', '/api/admin/products', null, token);
  console.log('PRODUCTS:', prods.status, 'count:', JSON.parse(prods.body).length);

  // 5. Categories
  const cats = await req('GET', '/api/categories', null, token);
  console.log('CATEGORIES:', cats.status, 'count:', JSON.parse(cats.body).length);

  // 6. Exchange rates
  const rates = await req('GET', '/api/SystemSettings/exchange-rates', null, token);
  console.log('RATES:', rates.status, rates.body);

  // 7. Update exchange rates
  const ratesUp = await req('PUT', '/api/SystemSettings/exchange-rates', { USD_to_YER_Sanaa: 550, USD_to_YER_Aden: 1700 }, token);
  console.log('RATES_UPDATE:', ratesUp.status);

  // 8. Create category
  const catNew = await req('POST', '/api/categories', { name: 'Test Category' }, token);
  console.log('CREATE_CAT:', catNew.status, catNew.body);

  // 9. Public products
  const pub = await req('GET', '/api/products?pageSize=2', null, null);
  const pubData = JSON.parse(pub.body);
  console.log('PUBLIC_PRODUCTS:', pub.status, 'isArray:', Array.isArray(pubData), 'count:', pubData.length);

  // Cleanup: delete test category
  if (catNew.status === 201) {
    const catId = JSON.parse(catNew.body);
    if (typeof catId === 'string') {
      const del = await req('DELETE', '/api/categories/' + catId, null, token);
      console.log('DELETE_CAT:', del.status);
    }
  }

  console.log('\n✅ All tests complete!');
}

main().catch(e => console.error('FAIL:', e));
