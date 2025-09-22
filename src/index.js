import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import admin from 'firebase-admin';
import axios from 'axios';

// Environment variables required:
// ITEXTMO_API_CODE - Your iTextMo API code
// FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (replace \n with \n newlines)

const requiredEnv = [
  'ITEXTMO_API_CODE',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing env var ${key}`);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin init
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    })
  });
}
const db = admin.firestore();

// iTextMo Configuration
const ITEXTMO_API_URL = 'https://www.itextmo.com/php_api/api.php';
const ITEXTMO_API_CODE = process.env.ITEXTMO_API_CODE;

// Normalize phone number to Philippine format for iTextMo
function normalizePhone(phone) {
  if (!phone) return '';
  
  // Remove all spaces and non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  console.log(`Normalizing phone: "${phone}" -> cleaned: "${cleaned}"`);
  
  // Handle different Philippine formats
  if (cleaned.startsWith('+63')) {
    return cleaned.substring(3); // Remove +63 for iTextMo (e.g., +639933671339 -> 9933671339)
  } else if (cleaned.startsWith('63') && cleaned.length >= 12) {
    return cleaned.substring(2); // Remove 63 prefix (e.g., 639933671339 -> 9933671339)
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    return cleaned.substring(1); // Remove 0 prefix (e.g., 09933671339 -> 9933671339)
  } else if (cleaned.length === 10) {
    return cleaned; // Already in correct format (e.g., 9933671339)
  } else {
    return cleaned; // Fallback
  }
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send SMS via iTextMo
async function sendSMS(phone, message) {
  try {
    const response = await axios.post(ITEXTMO_API_URL, {
      '1': ITEXTMO_API_CODE,
      '2': phone,
      '3': message
    });
    
    console.log('iTextMo Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('iTextMo SMS Error:', error.message);
    throw new Error('Failed to send SMS via iTextMo');
  }
}

const PhoneSchema = z.object({ phone: z.string().min(7).max(20) });
const CheckSchema = z.object({ phone: z.string(), code: z.string().min(4).max(10) });

app.get('/health', (_req, res) => res.json({ 
  ok: true, 
  service: 'Sikad iTextMo OTP Server',
  timestamp: new Date().toISOString(),
  provider: 'iTextMo Philippines'
}));

// Start verification
app.post('/otp/start', async (req, res) => {
  try {
    const { phone } = PhoneSchema.parse(req.body);
    const normalizedPhone = normalizePhone(phone);
    
    console.log(`Original phone: ${phone}, Normalized for iTextMo: ${normalizedPhone}`);
    
    // Generate OTP
    const otp = generateOTP();
    
    // Create SMS message
    const message = `Your Sikad verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
    
    // Send SMS via iTextMo
    const smsResult = await sendSMS(normalizedPhone, message);
    
    // Store OTP in Firestore for verification
    await db.collection('otp_verifications').doc(normalizedPhone).set({
      phone: normalizedPhone,
      otp: otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0
    });
    
    console.log(`OTP sent to ${normalizedPhone}: ${otp}`);
    
    return res.json({ 
      status: 'pending',
      message: 'OTP sent successfully via iTextMo',
      provider: 'iTextMo'
    });
  } catch (e) {
    console.error('OTP start error', e);
    return res.status(400).json({ error: String(e.message || e) });
  }
});

// Check verification
app.post('/otp/check', async (req, res) => {
  try {
    const { phone, code } = CheckSchema.parse(req.body);
    const normalizedPhone = normalizePhone(phone);
    
    console.log(`Checking OTP for phone: ${normalizedPhone}, code: ${code}`);
    
    // Get OTP from Firestore
    const otpDoc = await db.collection('otp_verifications').doc(normalizedPhone).get();
    
    if (!otpDoc.exists) {
      return res.status(400).json({ 
        ok: false, 
        error: 'OTP not found or expired' 
      });
    }
    
    const otpData = otpDoc.data();
    
    // Check if OTP is expired
    if (new Date() > otpData.expiresAt.toDate()) {
      await otpDoc.ref.delete();
      return res.status(400).json({ 
        ok: false, 
        error: 'OTP has expired' 
      });
    }
    
    // Check attempts
    if (otpData.attempts >= 3) {
      await otpDoc.ref.delete();
      return res.status(400).json({ 
        ok: false, 
        error: 'Too many failed attempts' 
      });
    }
    
    // Verify OTP
    if (otpData.otp !== code) {
      await otpDoc.ref.update({
        attempts: admin.firestore.FieldValue.increment(1)
      });
      return res.status(401).json({ 
        ok: false, 
        error: 'Invalid OTP' 
      });
    }
    
    // OTP is valid - update user in Firestore
    try {
      // Try to find user by phone number (multiple formats)
      const phoneFormats = [
        normalizedPhone,
        '0' + normalizedPhone,
        '+63' + normalizedPhone,
        '63' + normalizedPhone
      ];
      
      let userFound = false;
      for (const format of phoneFormats) {
        const userQuery = await db.collection('users')
          .where('phone', '==', format)
          .limit(1)
          .get();
        
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.update({
            phoneVerified: true,
            phoneVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
            phone: '+63' + normalizedPhone // Standardize to E.164 format
          });
          userFound = true;
          console.log(`User ${userDoc.id} phone verified: +63${normalizedPhone}`);
          break;
        }
      }
      
      if (!userFound) {
        console.log(`No user found for phone: +63${normalizedPhone}`);
      }
    } catch (userUpdateError) {
      console.error('User update error:', userUpdateError);
      // Don't fail the OTP verification if user update fails
    }
    
    // Clean up OTP
    await otpDoc.ref.delete();
    
    return res.json({ 
      ok: true, 
      message: 'OTP verified successfully',
      provider: 'iTextMo'
    });
  } catch (e) {
    console.error('OTP check error', e);
    return res.status(400).json({ error: String(e.message || e) });
  }
});

// Send geofence alert SMS
app.post('/sms/geofence-alert', async (req, res) => {
  try {
    const { phone, message, alertType } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ 
        error: 'Phone number and message are required' 
      });
    }
    
    const normalizedPhone = normalizePhone(phone);
    
    // Create alert message
    const alertMessage = `🚴‍♂️ SIKAD ALERT: ${message}. Stay safe and follow bike rental guidelines.`;
    
    // Send SMS via iTextMo
    const smsResult = await sendSMS(normalizedPhone, alertMessage);
    
    // Log the alert
    await db.collection('geofence_alerts').add({
      phone: '+63' + normalizedPhone,
      message: alertMessage,
      alertType: alertType || 'geofence_crossing',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      provider: 'iTextMo'
    });
    
    console.log(`Geofence alert sent to +63${normalizedPhone}: ${alertMessage}`);
    
    return res.json({
      ok: true,
      message: 'Geofence alert sent successfully',
      provider: 'iTextMo'
    });
    
  } catch (e) {
    console.error('Geofence Alert Error:', e);
    return res.status(500).json({ 
      error: 'Failed to send geofence alert',
      details: e.message 
    });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚴‍♂️ Sikad iTextMo OTP Server listening on port ${port}`);
  console.log(`📱 Provider: iTextMo Philippines`);
  console.log(`🔥 Firebase: Connected`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
});