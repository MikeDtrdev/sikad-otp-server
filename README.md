# Sikad OTP Server

A Node.js server for handling OTP (One-Time Password) verification using Twilio Verify API and Firebase Admin SDK for the Sikad mobile application.

## Features

- 📱 SMS OTP verification using Twilio Verify API
- 🔥 Firebase Admin SDK integration for user management
- 🛡️ Input validation using Zod
- 🚀 Production-ready with proper error handling
- 📊 Health check endpoint for monitoring

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Start OTP Verification
```
POST /otp/start
Content-Type: application/json

{
  "phone": "+1234567890"
}
```

### Verify OTP Code
```
POST /otp/check
Content-Type: application/json

{
  "phone": "+1234567890",
  "code": "123456"
}
```

## Environment Variables

The following environment variables are required:

- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_VERIFY_SERVICE_SID` - Your Twilio Verify Service SID
- `FIREBASE_PROJECT_ID` - Your Firebase Project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase Admin SDK Client Email
- `FIREBASE_PRIVATE_KEY` - Firebase Admin SDK Private Key

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create a `.env` file):
```bash
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

3. Start the development server:
```bash
npm run dev
```

4. Start the production server:
```bash
npm start
```

## Deployment

This server is configured to deploy on Render with the following settings:

- **Build Command**: `npm ci`
- **Start Command**: `npm start`
- **Root Directory**: `otp-server`

## Project Structure

```
otp-server/
├── src/
│   └── index.js          # Main server file
├── package.json          # Dependencies and scripts
├── render.yaml           # Render deployment configuration
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Dependencies

- **express**: Web framework
- **cors**: Cross-Origin Resource Sharing
- **twilio**: Twilio SDK for SMS verification
- **firebase-admin**: Firebase Admin SDK
- **zod**: Schema validation

## License

Private project for Sikad application.