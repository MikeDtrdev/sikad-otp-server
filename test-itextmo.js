// Simple test script for iTextMo integration
import axios from 'axios';

const ITEXTMO_API_URL = 'https://www.itextmo.com/php_api/api.php';
const ITEXTMO_API_CODE = process.env.ITEXTMO_API_CODE || 'your_api_code_here';

async function testiTextMo() {
  console.log('🧪 Testing iTextMo Integration...');
  
  if (!ITEXTMO_API_CODE || ITEXTMO_API_CODE === 'your_api_code_here') {
    console.log('❌ Please set ITEXTMO_API_CODE environment variable');
    console.log('   Get your API code from: https://itextmo.com');
    return;
  }
  
  try {
    // Test phone number (replace with your test number)
    const testPhone = '9123456789'; // Philippine format without +63
    const testMessage = 'Test message from Sikad OTP Server - iTextMo integration working!';
    
    console.log(`📱 Sending test SMS to: ${testPhone}`);
    console.log(`📝 Message: ${testMessage}`);
    
    const response = await axios.post(ITEXTMO_API_URL, {
      '1': ITEXTMO_API_CODE,
      '2': testPhone,
      '3': testMessage
    });
    
    console.log('✅ iTextMo Response:', response.data);
    
    if (response.data && response.data.includes('OK')) {
      console.log('🎉 iTextMo integration is working correctly!');
    } else {
      console.log('⚠️  Check your API code and account balance');
    }
    
  } catch (error) {
    console.error('❌ iTextMo Test Error:', error.message);
  }
}

testiTextMo();
