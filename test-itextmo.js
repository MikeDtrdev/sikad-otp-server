// Simple test script for iTextMo integration
import axios from 'axios';

const ITEXTMO_API_URL = 'https://api.itexmo.com/api/broadcast';
const ITEXTMO_API_CODE = process.env.ITEXTMO_API_CODE || 'your_api_code_here';
const ITEXTMO_EMAIL = process.env.ITEXTMO_EMAIL || 'your_email_here';
const ITEXTMO_PASSWORD = process.env.ITEXTMO_PASSWORD || 'your_password_here';

async function testiTextMo() {
  console.log('🧪 Testing iTextMo Integration...');
  
  if (!ITEXTMO_API_CODE || ITEXTMO_API_CODE === 'your_api_code_here') {
    console.log('❌ Please set ITEXTMO_API_CODE environment variable');
    console.log('   Get your API code from: https://itextmo.com');
    return;
  }
  
  if (!ITEXTMO_EMAIL || ITEXTMO_EMAIL === 'your_email_here') {
    console.log('❌ Please set ITEXTMO_EMAIL environment variable');
    return;
  }
  
  if (!ITEXTMO_PASSWORD || ITEXTMO_PASSWORD === 'your_password_here') {
    console.log('❌ Please set ITEXTMO_PASSWORD environment variable');
    return;
  }
  
  try {
    // Test phone number (replace with your test number)
    const testPhone = '9123456789'; // Philippine format without +63
    const testMessage = 'Test message from Sikad OTP Server - iTextMo integration working!';
    
    console.log(`📱 Sending test SMS to: ${testPhone}`);
    console.log(`📝 Message: ${testMessage}`);
    
    const requestData = {
      Email: ITEXTMO_EMAIL,
      Password: ITEXTMO_PASSWORD,
      ApiCode: ITEXTMO_API_CODE,
      Recipients: [testPhone],
      Message: testMessage,
      SenderId: 'ITEXMO SMS'
    };
    
    const response = await axios.post(ITEXTMO_API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ iTextMo Response:', response.data);
    
    if (response.data && !response.data.Error) {
      console.log('🎉 iTextMo integration is working correctly!');
      console.log(`📊 Credits used: ${response.data.TotalCreditUsed}`);
      console.log(`📋 Reference ID: ${response.data.ReferenceId}`);
    } else {
      console.log('⚠️  Check your credentials and account balance');
      console.log('Error:', response.data.Message);
    }
    
  } catch (error) {
    console.error('❌ iTextMo Test Error:', error.message);
  }
}

testiTextMo();
