import fetch from 'node-fetch';

async function testRegister() {
  const url = 'https://mongodb-production-744f.up.railway.app/api/auth/register';
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

// Run the test
if (require.main === module) {
  testRegister();
}
