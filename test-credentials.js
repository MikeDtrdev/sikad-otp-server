// Test iTextMo credentials directly
import axios from 'axios';

async function testCredentials() {
  // Test with old password
  const testCases = [
    { email: 'mikeddoctor08@gmail.com', password: '12345Mike@' },
    { email: 'MikeDtr', password: '12345Mike@' },
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: Email="${testCase.email}", Password="${testCase.password}"`);
    
    const credentials = {
      Email: testCase.email,
      Password: testCase.password,
      ApiCode: 'PR-MIKED390417_P8IMG'
    };

    try {
      // Test with Query API first
      const queryResponse = await axios.post('https://api.itexmo.com/api/query', credentials, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('✅ SUCCESS! Query API Response:', queryResponse.data);
      console.log('🎉 CORRECT CREDENTIALS FOUND!');
      console.log('Email:', testCase.email);
      console.log('Password:', testCase.password);
      return; // Stop testing if we find the correct credentials

    } catch (error) {
      console.log('❌ Failed:', error.response?.data?.Message || error.message);
    }
  }
  
  console.log('\n❌ None of the password variations worked. Please check your iTextMo dashboard for the correct password.');
}

testCredentials();
