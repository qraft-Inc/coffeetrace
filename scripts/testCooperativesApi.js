const fetch = global.fetch || require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function tryUrl(url) {
  try {
    console.log(`Requesting: ${url}`);
    const res = await fetch(url, { method: 'GET' });
    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('Response JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response body:', text);
    }
  } catch (err) {
    console.error('Request error:', err.message || err);
  }
}

async function main() {
  // Try common dev ports (3000, 3001)
  const ports = [process.env.NEXT_PORT || 3000, 3001];
  for (const port of ports) {
    const url = `http://localhost:${port}/api/cooperatives?search=Tooro`;
    await tryUrl(url);
  }

  console.log('\nNote: The `/api/cooperatives` endpoint requires an authenticated session (NextAuth).');
  console.log('If you get 401 Unauthorized, open the app in your browser, sign in with a demo user (e.g. tcfu@coffeetrace-demo.com / Demo123!), then call the API with the browser session or use Postman with cookies.');
}

main();
