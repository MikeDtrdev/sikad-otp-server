// Test simple SMS sending with iTextMo
import axios from 'axios';

async function testSimpleSMS() {
  const credentials = {
    Email: 'mikeddoctor08@gmail.com',
    Password: '12345Mike@',
    ApiCode: 'PR-MIKED390417_P8IMG',
    Recipients: ['09933671339'],
    Message: 'Test SMS from Sikad OTP Server'
  };

  console.log('Testing simple SMS...');
  console.log('Credentials:', {
    Email: credentials.Email,
    Password: credentials.Password,
    ApiCode: credentials.ApiCode,
    Recipients: credentials.Recipients
  });

  try {
    const response = await axios.post('https://api.itexmo.com/api/broadcast', credentials, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✅ SUCCESS! SMS Response:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ SMS Error:', error.response?.data || error.message);
    return null;
  }
}

testSimpleSMS();
