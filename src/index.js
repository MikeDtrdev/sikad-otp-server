import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import admin from 'firebase-admin';
import twilio from 'twilio';

// Environment variables required:
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID
// FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (replace \n with \n newlines)

const requiredEnv = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_VERIFY_SERVICE_SID',
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

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Normalize phone number to E.164 format
function normalizePhone(phone) {
  if (!phone) return '';
  
  // Remove all spaces and non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  console.log(`Normalizing phone: "${phone}" -> cleaned: "${cleaned}"`);
  
  // Handle different formats
  if (cleaned.startsWith('+')) {
    return cleaned; // Already E.164
  } else if (cleaned.startsWith('63') && cleaned.length >= 12) {
    return '+' + cleaned; // Add + to 63... (e.g., 639933671339 -> +639933671339)
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '+63' + cleaned.substring(1); // Replace 0 with +63 (e.g., 09933671339 -> +639933671339)
  } else if (cleaned.length === 10) {
    return '+63' + cleaned; // Default to Philippines (e.g., 9933671339 -> +639933671339)
  } else {
    return '+63' + cleaned; // Fallback
  }
}

const PhoneSchema = z.object({ phone: z.string().min(7).max(20) });
const CheckSchema = z.object({ phone: z.string(), code: z.string().min(4).max(10) });

app.get('/health', (_req, res) => res.json({ ok: true }));

// Start verification
app.post('/otp/start', async (req, res) => {
  try {
    const { phone } = PhoneSchema.parse(req.body);
    const normalizedPhone = normalizePhone(phone);
    
    console.log(`Original phone: ${phone}, Normalized: ${normalizedPhone}`);
    
    const v = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: normalizedPhone, channel: 'sms' });
    return res.json({ status: v.status });
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
    
    const check = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: normalizedPhone, code });

    if (check.status !== 'approved') {
      return res.status(401).json({ ok: false, status: check.status });
    }

    // Mark user as verified by phone number reference
    // Try multiple phone formats to find the user
    const usersRef = db.collection('users');
    let snapshot = await usersRef.where('phone', '==', normalizedPhone).limit(1).get();
    
    // If not found, try other common formats
    if (snapshot.empty) {
      // Try with 0 prefix (e.g., 09933671339)
      const phoneWithZero = '0' + normalizedPhone.substring(3);
      snapshot = await usersRef.where('phone', '==', phoneWithZero).limit(1).get();
    }
    
    if (snapshot.empty) {
      // Try without +63 prefix (e.g., 9933671339)
      const phoneWithoutPrefix = normalizedPhone.substring(3);
      snapshot = await usersRef.where('phone', '==', phoneWithoutPrefix).limit(1).get();
    }
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await doc.ref.update({ 
        phoneVerified: true, 
        phoneVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        phone: normalizedPhone // Update to E.164 format
      });
      console.log(`Updated user ${doc.id} with phoneVerified=true and normalized phone: ${normalizedPhone}`);
    } else {
      console.log(`No user found with phone: ${normalizedPhone}`);
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error('OTP check error', e);
    return res.status(400).json({ error: String(e.message || e) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`OTP server listening on :${port}`));


