// Test iTextMo credentials directly
const axios = require('axios');

async function testCredentials() {
  const credentials = {
    Email: 'mikeddoctor08@gmail.com',
    Password: '136717Mike',
    ApiCode: 'PR-MIKED390417_P8IMG'
  };

  console.log('Testing iTextMo credentials...');
  console.log('Email:', credentials.Email);
  console.log('Password:', credentials.Password);
  console.log('ApiCode:', credentials.ApiCode);

  try {
    // Test with Query API first
    const queryResponse = await axios.post('https://api.itexmo.com/api/query', credentials, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✅ Query API Response:', queryResponse.data);

    // Test with Broadcast API
    const broadcastData = {
      ...credentials,
      Recipients: ['09933671339'],
      Message: 'Test message from Sikad OTP Server'
    };

    const broadcastResponse = await axios.post('https://api.itexmo.com/api/broadcast', broadcastData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✅ Broadcast API Response:', broadcastResponse.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCredentials();
