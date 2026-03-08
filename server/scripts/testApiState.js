import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testRegister() {
  const url = `${BASE_URL}/api/auth/register`;
  const payload = {
    email: 'apitestuser@example.com',
    password: 'apitestpassword',
    name: 'API Test User',
    organization: 'API Test Org'
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log('API State Test Response:', data);
  } catch (error) {
    console.error('API State Test Error:', error);
  }
}

// ES module equivalent of require.main === module
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  testRegister();
}
