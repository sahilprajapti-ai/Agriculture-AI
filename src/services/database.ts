import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  surname?: string | null;
  email: string;
  username?: string | null;
  mobile_number?: string | null;
  photo_url?: string | null;
  password_hash: string;
  google_sub?: string | null;
  created_at: string;
}

export interface AnalysisRecord {
  id: number;
  user_id: number | string;
  crop: string;
  location: string;
  stage: string;
  category: string;
  description: string;
  image_name?: string | null;
  analysis: any;
  created_at: string;
}

interface DatabaseSchema {
  users: User[];
  analyses: AnalysisRecord[];
  lastUserId: number;
  lastAnalysisId: number;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'agriai_db.json');

function ensureDbFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        users: Array.isArray(data.users) ? data.users : [],
        analyses: Array.isArray(data.analyses) ? data.analyses : [],
        lastUserId: Number(data.lastUserId) || 1,
        lastAnalysisId: Number(data.lastAnalysisId) || 1,
      };
    }
  } catch (err) {
    console.error('Failed to read db file, initializing fresh store', err);
  }

  const initial: DatabaseSchema = {
    users: [],
    analyses: [],
    lastUserId: 1,
    lastAnalysisId: 1,
  };
  saveDb(initial);
  return initial;
}

let dbState: DatabaseSchema = ensureDbFile();

function saveDb(state: DatabaseSchema) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    // Defensive sanitization: strip any undefined values
    const sanitized = JSON.parse(JSON.stringify(state));
    fs.writeFileSync(tempFile, JSON.stringify(sanitized, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to save db state via temp file, trying direct write:', err);
    try {
      const sanitized = JSON.parse(JSON.stringify(state));
      fs.writeFileSync(DB_FILE, JSON.stringify(sanitized, null, 2), 'utf-8');
    } catch (directErr) {
      console.error('Direct write to DB_FILE failed:', directErr);
    }
  }
}

function normalizeMobile(value?: string | null): string {
  return String(value || '').replace(/\D/g, '');
}

export function findUserById(id: number | string): User | null {
  const numId = Number(id);
  const strId = String(id);
  const user = dbState.users.find(u => u.id === numId || String(u.id) === strId);
  return user ? { ...user } : null;
}

export function findUserByEmail(email?: string | null): User | null {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  const user = dbState.users.find(u => u.email.toLowerCase() === clean);
  return user ? { ...user } : null;
}

export function findUserByMobile(mobileNumber?: string | null): User | null {
  if (!mobileNumber) return null;
  const norm = normalizeMobile(mobileNumber);
  if (!norm) return null;
  const user = dbState.users.find(u => normalizeMobile(u.mobile_number) === norm);
  return user ? { ...user } : null;
}

export function findUserByGoogleSub(googleSub?: string | null): User | null {
  if (!googleSub) return null;
  const user = dbState.users.find(u => u.google_sub === googleSub);
  return user ? { ...user } : null;
}

export function findUserByIdentifier(identifier?: string | null): User | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const mobile = normalizeMobile(identifier);

  const user = dbState.users.find(u => {
    if (u.email.toLowerCase() === clean) return true;
    if (u.username && u.username.toLowerCase() === clean) return true;
    if (mobile && u.mobile_number && normalizeMobile(u.mobile_number) === mobile) return true;
    return false;
  });

  return user ? { ...user } : null;
}

export function createUser(params: {
  name: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  surname?: string;
  mobileNumber?: string;
  photoUrl?: string;
  googleSub?: string;
}): User {
  const emailLower = params.email.trim().toLowerCase();

  // Check unique email
  if (findUserByEmail(emailLower)) {
    throw new Error('An account already exists with that email address.');
  }
  if (params.mobileNumber && findUserByMobile(params.mobileNumber)) {
    throw new Error('That mobile number is already in use.');
  }
  if (params.googleSub && findUserByGoogleSub(params.googleSub)) {
    throw new Error('Google account is already linked to another profile.');
  }

  dbState.lastUserId += 1;
  const newUser: User = {
    id: dbState.lastUserId,
    name: params.name.trim(),
    first_name: params.firstName?.trim() || null,
    last_name: params.lastName?.trim() || null,
    surname: params.surname?.trim() || null,
    email: emailLower,
    mobile_number: params.mobileNumber ? normalizeMobile(params.mobileNumber) : null,
    photo_url: params.photoUrl || null,
    password_hash: params.passwordHash,
    google_sub: params.googleSub || null,
    created_at: new Date().toISOString(),
  };

  dbState.users.push(newUser);
  saveDb(dbState);
  return { ...newUser };
}

export function createGoogleUser(name: string, email: string, googleSub: string, photoUrl?: string | null): User {
  const existing = findUserByGoogleSub(googleSub);
  if (existing) return existing;

  const existingEmail = findUserByEmail(email);
  if (existingEmail) {
    existingEmail.google_sub = googleSub;
    if (photoUrl && !existingEmail.photo_url) {
      existingEmail.photo_url = photoUrl;
    }
    saveDb(dbState);
    return { ...existingEmail };
  }

  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] || 'Google';
  const lastName = parts.slice(1).join(' ') || 'Farmer';
  const dummyHash = bcrypt.hashSync(`google-auth-${Date.now()}`, 8);
  return createUser({
    name,
    firstName,
    lastName,
    email,
    passwordHash: dummyHash,
    photoUrl: photoUrl || undefined,
    googleSub,
  });
}

export function linkGoogleUser(userId: number | string, googleSub: string): void {
  const user = dbState.users.find(u => u.id === Number(userId));
  if (user) {
    user.google_sub = googleSub;
    saveDb(dbState);
  }
}

export function updateUserProfile(
  userId: number | string,
  params: {
    firstName?: string;
    lastName?: string;
    surname?: string;
    email?: string;
    mobileNumber?: string;
  }
): User | null {
  const numId = Number(userId);
  const strId = String(userId);
  const user = dbState.users.find(u => u.id === numId || String(u.id) === strId);
  if (!user) return null;

  if (params.email) {
    const emailLower = params.email.trim().toLowerCase();
    const existingEmail = findUserByEmail(emailLower);
    if (existingEmail && String(existingEmail.id) !== String(user.id)) {
      throw new Error('An account already exists with that email address.');
    }
    user.email = emailLower;
  }

  if (params.mobileNumber !== undefined) {
    const norm = normalizeMobile(params.mobileNumber);
    if (norm) {
      const existingMobile = findUserByMobile(norm);
      if (existingMobile && String(existingMobile.id) !== String(user.id)) {
        throw new Error('That mobile number is already in use.');
      }
      user.mobile_number = norm;
    } else {
      user.mobile_number = null;
    }
  }

  if (params.firstName !== undefined && params.firstName !== null) {
    user.first_name = params.firstName.trim();
  }
  if (params.lastName !== undefined && params.lastName !== null) {
    user.last_name = params.lastName.trim();
  }
  if (params.surname !== undefined) {
    user.surname = params.surname ? params.surname.trim() : null;
  }

  const nameParts = [user.first_name, user.last_name].filter(Boolean);
  user.name = nameParts.length > 0 ? nameParts.join(' ').trim() : (user.first_name || user.email);

  saveDb(dbState);
  return { ...user };
}

export function deleteUser(userId: number | string): boolean {
  const numId = Number(userId);
  const strId = String(userId);
  const initialLength = dbState.users.length;
  
  const targetUser = dbState.users.find(u => u.id === numId || String(u.id) === strId);
  const targetEmail = targetUser?.email?.toLowerCase();
  const targetGoogleSub = targetUser?.google_sub;

  dbState.users = dbState.users.filter(u => {
    if (u.id === numId || String(u.id) === strId) return false;
    if (targetEmail && u.email?.toLowerCase() === targetEmail) return false;
    if (targetGoogleSub && u.google_sub === targetGoogleSub) return false;
    return true;
  });

  dbState.analyses = dbState.analyses.filter(a => {
    if (Number(a.user_id) === numId || String(a.user_id) === strId) return false;
    if (targetUser && (Number(a.user_id) === targetUser.id || String(a.user_id) === String(targetUser.id))) return false;
    return true;
  });

  saveDb(dbState);
  return dbState.users.length < initialLength;
}

export function saveAnalysis(
  userId: number | string,
  payload: {
    crop?: string;
    location?: string;
    stage?: string;
    category?: string;
    description: string;
  },
  imageName?: string | null,
  analysis?: any
): number {
  dbState.lastAnalysisId += 1;
  const record: AnalysisRecord = {
    id: dbState.lastAnalysisId,
    user_id: Number(userId) || userId,
    crop: payload.crop || 'Crop',
    location: payload.location || '',
    stage: payload.stage || '',
    category: payload.category || 'Plant Health',
    description: payload.description,
    image_name: imageName || null,
    analysis: analysis || {},
    created_at: new Date().toISOString(),
  };

  dbState.analyses.unshift(record);
  saveDb(dbState);
  return record.id;
}

export function listAnalyses(userId: number | string): AnalysisRecord[] {
  const numId = Number(userId);
  return dbState.analyses
    .filter(a => Number(a.user_id) === numId || String(a.user_id) === String(userId))
    .map(a => ({ ...a }));
}
