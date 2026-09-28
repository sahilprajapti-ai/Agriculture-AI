import fs from 'node:fs';
import path from 'node:path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  createUser,
  createGoogleUser,
  findUserByEmail,
  findUserById,
  findUserByIdentifier,
  findUserByMobile,
  findUserByGoogleSub,
  linkGoogleUser,
  updateUserProfile,
  deleteUser,
  saveAnalysis,
  listAnalyses,
  User,
} from './services/database.js';
import { analyzeProblem, chatAssistant } from './services/gemini.js';
import { getDemoAnalysis } from './services/expertEngine.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Configure Multer for in-memory file uploads with 10MB limit and MIME validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.'));
    }
  },
});

// Middleware Setup - Ordering Guarantee
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  cookieSession({
    name: 'agriai_session',
    keys: [process.env.SECRET_KEY || 'agriai-secure-session-key-2026'],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  })
);

// Serve static frontend files
const publicDir = path.resolve(process.cwd(), 'public');
app.use(express.static(publicDir));

// Helpers
function sanitizeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    first_name: user.first_name || null,
    last_name: user.last_name || null,
    surname: user.surname || null,
    email: user.email,
    username: user.username || null,
    mobile_number: user.mobile_number || null,
    photo_url: user.photo_url || null,
  };
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({
      error: 'Please sign in to save and view your analyses.',
      code: 'AUTH_REQUIRED',
    });
  }
  const user = findUserById(userId);
  if (!user) {
    req.session = null;
    return res.status(401).json({
      error: 'Session expired. Please sign in again.',
      code: 'AUTH_REQUIRED',
    });
  }
  (req as any).user = user;
  next();
}

// ----------------- Auth Routes -----------------

app.post(['/api/auth/register', '/api/auth/signup'], (req: Request, res: Response) => {
  const data = req.body && typeof req.body === 'object' ? req.body : {};
  const firstName = String(data.first_name || '').trim();
  const lastName = String(data.last_name || '').trim();
  const surname = String(data.surname || '').trim();
  const email = String(data.email || '').trim().toLowerCase();
  const mobileNumber = String(data.mobile_number || '').trim();
  const password = String(data.password || '');

  if (!firstName || !lastName || !surname || !email || !mobileNumber || !password) {
    return res.status(400).json({ error: 'Please complete all account details.' });
  }

  const name = [firstName, lastName, surname].filter(Boolean).join(' ').trim();
  if (name.length > 80) {
    return res.status(400).json({ error: 'Name must be 80 characters or fewer.' });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const digitsOnly = mobileNumber.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid mobile number (at least 10 digits).' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = createUser({
      name,
      firstName,
      lastName,
      surname,
      email,
      mobileNumber,
      passwordHash,
    });

    if (req.session) {
      req.session.userId = user.id;
    }

    return res.status(201).json({ user: sanitizeUser(user) });
  } catch (err: any) {
    return res.status(409).json({ error: err.message || 'Unable to create account.' });
  }
});

app.post(['/api/auth/login', '/api/auth/signin'], (req: Request, res: Response) => {
  const data = req.body && typeof req.body === 'object' ? req.body : {};
  const identifier = String(data.identifier || data.email || '').trim();
  const password = String(data.password || '');

  if (!identifier || !password) {
    return res.status(400).json({
      error: 'Please enter your email, username, or mobile number and password.',
    });
  }

  const user = findUserByIdentifier(identifier);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({
      error: 'Incorrect email, username, mobile number, or password.',
    });
  }

  if (req.session) {
    req.session.userId = user.id;
  }

  return res.json({ user: sanitizeUser(user) });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.json({ user: null });
  }
  const user = findUserById(userId);
  return res.json({ user: user ? sanitizeUser(user) : null });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  req.session = null;
  return res.json({ message: 'Signed out successfully.' });
});

const handleProfileUpdate = (req: Request, res: Response) => {
  const data = req.body && typeof req.body === 'object' ? req.body : {};
  let user: User | undefined = (req as any).user;
  const userIdFromSession = req.session?.userId;
  const userIdFromBody = data.id || data.userId || data.user_id;
  const emailFromBody = data.email ? String(data.email).trim().toLowerCase() : null;

  if (!user && userIdFromSession) {
    user = findUserById(userIdFromSession) || undefined;
  }
  if (!user && userIdFromBody) {
    user = findUserById(Number(userIdFromBody)) || undefined;
  }
  if (!user && emailFromBody) {
    user = findUserByEmail(emailFromBody) || undefined;
  }

  if (!user) {
    return res.status(401).json({ error: 'Please sign in to update your profile.' });
  }

  const firstName = String(data.first_name || data.firstName || '').trim();
  const lastName = String(data.last_name || data.lastName || '').trim();
  const surnameRaw = data.surname !== undefined ? data.surname : (data.father_name !== undefined ? data.father_name : data.fatherName);
  const surname = surnameRaw !== undefined ? String(surnameRaw).trim() : undefined;
  const email = emailFromBody || user.email;
  const mobileRaw = data.mobile_number !== undefined ? data.mobile_number : (data.mobile !== undefined ? data.mobile : data.mobileNumber);
  const mobileNumber = mobileRaw !== undefined ? String(mobileRaw).trim() : undefined;

  if (!firstName && !lastName && !user.name) {
    return res.status(400).json({
      error: 'Please enter at least a first name or last name.',
    });
  }

  if ([firstName, lastName, surname || ''].some(val => val.length > 50)) {
    return res.status(400).json({ error: 'Each name must be 50 characters or fewer.' });
  }

  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const updated = updateUserProfile(user.id, {
      firstName: firstName || user.first_name || (user.name ? user.name.split(' ')[0] : 'Farmer'),
      lastName: lastName || user.last_name || (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
      surname: surname !== undefined ? surname : user.surname || undefined,
      email: email,
      mobileNumber: mobileNumber !== undefined ? mobileNumber : user.mobile_number || undefined,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (req.session) {
      req.session.userId = updated.id;
    }

    return res.json({ user: sanitizeUser(updated) });
  } catch (err: any) {
    return res.status(409).json({ error: err.message || 'Failed to update profile.' });
  }
};

app.put('/api/auth/profile', handleProfileUpdate);
app.post('/api/auth/profile', handleProfileUpdate);

const handleAccountDelete = (req: Request, res: Response) => {
  const userIdFromSession = req.session?.userId;
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const userIdFromBody = body.userId || body.id || body.user_id;
  const emailFromBody = body.email ? String(body.email).trim().toLowerCase() : null;

  let targetUser = (req as any).user as User | undefined;
  if (!targetUser && userIdFromSession) {
    targetUser = findUserById(userIdFromSession) || undefined;
  }
  if (!targetUser && userIdFromBody) {
    targetUser = findUserById(userIdFromBody) || undefined;
  }
  if (!targetUser && emailFromBody) {
    targetUser = findUserByEmail(emailFromBody) || undefined;
  }

  if (targetUser) {
    deleteUser(targetUser.id);
  }

  req.session = null;
  return res.json({ message: 'Your account and saved analyses have been deleted.' });
};

app.delete(['/api/auth/account', '/api/auth/profile'], handleAccountDelete);
app.post(['/api/auth/account/delete', '/api/auth/delete-account'], handleAccountDelete);

// Load Firebase applet configuration if available
let firebaseAppletConfig: any = null;
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseAppletConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not load firebase-applet-config.json:', e);
}

// Configs for Google / Firebase Sign-in
app.get('/api/auth/google-config', (_req: Request, res: Response) => {
  const clientId = firebaseAppletConfig?.oAuthClientId || process.env.GOOGLE_CLIENT_ID || '';
  return res.json({ client_id: clientId });
});

app.get('/api/auth/firebase-config', (_req: Request, res: Response) => {
  return res.json({
    apiKey: firebaseAppletConfig?.apiKey || process.env.FIREBASE_API_KEY || '',
    authDomain: firebaseAppletConfig?.authDomain || process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: firebaseAppletConfig?.projectId || process.env.FIREBASE_PROJECT_ID || '',
    appId: firebaseAppletConfig?.appId || process.env.FIREBASE_APP_ID || '',
    firestoreDatabaseId: firebaseAppletConfig?.firestoreDatabaseId || '',
    storageBucket: firebaseAppletConfig?.storageBucket || '',
    messagingSenderId: firebaseAppletConfig?.messagingSenderId || '',
  });
});

app.post(['/api/auth/google', '/api/auth/google-signin', '/api/auth/google-callback'], (req: Request, res: Response) => {
  const data = req.body && typeof req.body === 'object' ? req.body : {};
  let email = String(data.email || '').trim().toLowerCase();
  let name = String(data.name || '').trim();
  let googleSub = String(data.sub || data.uid || '').trim();
  let photoUrl = String(data.picture || data.photo_url || '').trim();

  // If a Google JWT ID credential is provided (e.g. from Google Sign-In button / One Tap)
  if (data.credential && typeof data.credential === 'string') {
    try {
      const parts = data.credential.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        if (payload.email) email = String(payload.email).trim().toLowerCase();
        if (payload.name) name = String(payload.name).trim();
        if (payload.sub) googleSub = String(payload.sub).trim();
        if (payload.picture) photoUrl = String(payload.picture).trim();
      }
    } catch (err) {
      console.warn('Could not parse Google JWT credential payload:', err);
    }
  }

  if (!email && !googleSub) {
    return res.status(400).json({ error: 'Valid Google credential or email is required.' });
  }

  if (!email) {
    email = `${googleSub}@google.user`;
  }
  if (!name) {
    name = email.split('@')[0] || 'Google Farmer';
  }
  if (!googleSub) {
    googleSub = `google-${email}`;
  }

  let user = findUserByGoogleSub(googleSub);
  if (!user) {
    const existing = findUserByEmail(email);
    if (existing) {
      linkGoogleUser(existing.id, googleSub);
      user = findUserById(existing.id);
    } else {
      user = createGoogleUser(name, email, googleSub, photoUrl || undefined);
    }
  }

  if (req.session && user) {
    req.session.userId = user.id;
  }

  return res.json({ user: user ? sanitizeUser(user) : null });
});

app.post('/api/auth/firebase', (req: Request, res: Response) => {
  const data = req.body && typeof req.body === 'object' ? req.body : {};
  const email = String(data.email || '').trim().toLowerCase();
  const name = String(data.name || '').trim() || (email ? email.split('@')[0] : 'Google Farmer');
  const uid = String(data.uid || '').trim();
  const photoUrl = String(data.photo_url || '').trim();

  if (!email) {
    return res.status(400).json({ error: 'Google account email is required.' });
  }

  const googleSub = uid || `firebase-${email}`;
  let user = findUserByGoogleSub(googleSub);

  if (!user) {
    const existing = findUserByEmail(email);
    if (existing) {
      linkGoogleUser(existing.id, googleSub);
      user = findUserById(existing.id);
    } else {
      user = createGoogleUser(name, email, googleSub, photoUrl || undefined);
    }
  }

  if (req.session && user) {
    req.session.userId = user.id;
  }

  return res.json({ user: user ? sanitizeUser(user) : null });
});

app.post('/api/auth/google-dev', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Demo login is disabled in production.' });
  }
  const data = req.body && typeof req.body === 'object' ? req.body : {};
  const email = String(data.email || 'farmer@gmail.com').trim().toLowerCase();
  const name = String(data.name || 'Demo Google Farmer').trim();
  const googleSub = `google-demo-${email}`;

  let user = findUserByGoogleSub(googleSub);
  if (!user) {
    const existing = findUserByEmail(email);
    if (existing) {
      linkGoogleUser(existing.id, googleSub);
      user = findUserById(existing.id);
    } else {
      user = createGoogleUser(name, email, googleSub);
    }
  }

  if (req.session && user) {
    req.session.userId = user.id;
  }

  return res.json({ user: user ? sanitizeUser(user) : null });
});

// ----------------- Agriculture Problem Analysis -----------------

app.post(
  ['/api/analyze', '/api/analysis'],
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('image')(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'Image must be smaller than 10MB.' });
        }
        return res.status(400).json({ error: err.message || 'Image upload failed.' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    const user = userId ? findUserById(userId) : null;
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const payload = {
      crop: String(body.crop || '').trim(),
      location: String(body.location || '').trim(),
      stage: String(body.stage || '').trim(),
      category: String(body.category || '').trim(),
      description: String(body.description || '').trim(),
      language: String(body.language || 'English').trim(),
    };

    if (!payload.description) {
      return res.status(400).json({ error: 'Please describe the agriculture problem.' });
    }

    try {
      const file = req.file;
      const imageData = file
        ? { buffer: file.buffer, mimeType: file.mimetype }
        : null;

      const { analysis, mode } = await analyzeProblem(payload, imageData);

      let recordId: number | null = null;
      if (user) {
        recordId = saveAnalysis(
          user.id,
          payload,
          file ? file.originalname : null,
          analysis
        );
      }

      return res.json({
        id: recordId,
        analysis,
        mode,
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      const fallback = getDemoAnalysis(payload);
      return res.json({
        analysis: fallback,
        mode: 'fallback',
      });
    }
  }
);

// ----------------- AI Chat Assistant -----------------

app.post('/api/chat', async (req: Request, res: Response) => {
  const data = req.body && typeof req.body === 'object' ? req.body : {};
  const message = String(data.message || '').trim();
  const language = String(data.language || 'English').trim();
  const history = Array.isArray(data.history) ? data.history : [];

  if (!message) {
    return res.status(400).json({ error: 'Please enter a question.' });
  }

  try {
    const result = await chatAssistant(message, language, history);
    return res.json({
      reply: result.reply,
      mode: result.mode,
      language,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Unable to reach the AI assistant right now.' });
  }
});

// ----------------- System & Health Routes -----------------
app.get(['/api/health', '/api/status'], (_req: Request, res: Response) => {
  return res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ----------------- Analysis History -----------------
app.get(['/api/analyses', '/api/analysis/history', '/api/history'], requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const analyses = listAnalyses(user.id);
  return res.json({ analyses });
});

// Fallback for unmatched API routes
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    console.warn(`[404] Endpoint not found: ${req.method} ${req.originalUrl || req.path}`);
    return res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.path}` });
  }
  return res.sendFile(path.join(publicDir, 'index.html'));
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  if (err.status === 413 || err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large. Maximum size is 10MB.' });
  }
  return res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.',
  });
});

app.listen(PORT, HOST, () => {
  console.log(`AgriAI Server is running on http://${HOST}:${PORT}`);
});
