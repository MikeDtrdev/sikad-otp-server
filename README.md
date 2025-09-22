# 🚴‍♂️ Sikad iTextMo OTP & SMS Alert Server

A Node.js server for handling OTP verification and geofence SMS alerts using iTextMo for Philippine numbers.

## 🇵🇭 Why iTextMo?

- **Philippine-based** SMS provider
- **Better delivery rates** to local carriers (Globe, Smart, etc.)
- **More affordable** for Philippine numbers
- **Local support** and compliance
- **Faster SMS delivery** within the Philippines

## 🚀 Features

- ✅ **OTP Generation & Verification** for user registration
- ✅ **Geofence SMS Alerts** when users cross bike rental boundaries
- ✅ **Philippine Phone Number Normalization** (handles +63, 0, and local formats)
- ✅ **Firebase Firestore Integration** for user management
- ✅ **Rate Limiting & Security** (max 3 OTP attempts)
- ✅ **Comprehensive Logging** and error handling

## 📋 Prerequisites

1. **iTextMo Account** - Sign up at [itextmo.com](https://itextmo.com)
2. **Firebase Project** with Firestore enabled
3. **Node.js 18+** installed

## 🔧 Setup Instructions

### 1. Get iTextMo API Code

1. Sign up at [itextmo.com](https://itextmo.com)
2. Get your API code from the dashboard
3. Add it to your environment variables

### 2. Firebase Setup

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Download the JSON file
4. Extract the required values for environment variables

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# iTextMo Configuration
ITEXTMO_API_CODE=your_itextmo_api_code_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# Server Configuration
PORT=8080
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Start OTP Verification
```
POST /otp/start
Content-Type: application/json

{
  "phone": "+639123456789"
}
```

### Verify OTP
```
POST /otp/check
Content-Type: application/json

{
  "phone": "+639123456789",
  "code": "123456"
}
```

### Send Geofence Alert
```
POST /sms/geofence-alert
Content-Type: application/json

{
  "phone": "+639123456789",
  "message": "You have crossed the bike rental boundary",
  "alertType": "geofence_crossing"
}
```

## 🚴‍♂️ Integration with Sikad App

Update your Android app's `strings.xml`:

```xml
<string name="otp_base_url">https://your-render-url.onrender.com</string>
```

## 🚀 Deploy to Render

1. Push your code to GitHub
2. Connect your repository to Render
3. Set environment variables in Render dashboard
4. Deploy as a Web Service

## 📱 Supported Phone Formats

The server automatically normalizes Philippine phone numbers:

- `+639123456789` ✅
- `09123456789` ✅
- `9123456789` ✅
- `639123456789` ✅

## 🔒 Security Features

- **OTP Expiration**: 5 minutes
- **Rate Limiting**: Max 3 attempts per OTP
- **Input Validation**: Using Zod schemas
- **Error Handling**: Comprehensive error responses
- **Logging**: All operations logged for debugging

## 🐛 Troubleshooting

### Common Issues:

1. **SMS not delivered**: Check iTextMo API code and account balance
2. **Firebase errors**: Verify service account credentials
3. **Phone format errors**: Ensure Philippine number format

### Debug Mode:

Set `NODE_ENV=development` for detailed logging.

## 📞 Support

- **iTextMo Support**: [itextmo.com/support](https://itextmo.com/support)
- **Firebase Support**: [firebase.google.com/support](https://firebase.google.com/support)

## 🎯 Use Cases for Sikad

1. **User Registration**: Send OTP for phone verification
2. **Geofence Alerts**: Notify users when they cross bike rental boundaries
3. **Bike Status Updates**: Send SMS notifications for bike availability
4. **Emergency Alerts**: Notify users of system issues or maintenance

---

**Made with ❤️ for the Philippines 🇵🇭**