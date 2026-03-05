// AES-256-GCM file encryption using Web Crypto API

const ITERATIONS = 200000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as unknown as ArrayBuffer, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptFile(
  file: File,
  password: string,
  onProgress?: (p: number) => void
): Promise<{ encrypted: Blob; fileName: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);

  onProgress?.(10);

  const data = new Uint8Array(await file.arrayBuffer());
  onProgress?.(30);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  onProgress?.(80);

  // Format: [salt(16)] [iv(12)] [encrypted data]
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);

  onProgress?.(100);

  return {
    encrypted: new Blob([result], { type: 'application/octet-stream' }),
    fileName: file.name + '.enc',
  };
}

export async function decryptFile(
  file: File,
  password: string,
  onProgress?: (p: number) => void
): Promise<{ decrypted: Blob; fileName: string }> {
  const data = new Uint8Array(await file.arrayBuffer());
  onProgress?.(10);

  const salt = data.slice(0, SALT_LENGTH);
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(password, salt);
  onProgress?.(30);

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    onProgress?.(100);

    const originalName = file.name.endsWith('.enc')
      ? file.name.slice(0, -4)
      : 'decrypted_' + file.name;

    return {
      decrypted: new Blob([decrypted]),
      fileName: originalName,
    };
  } catch {
    throw new Error('Incorrect password or corrupted file');
  }
}

export function checkPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'destructive' };
  if (score <= 3) return { score, label: 'Medium', color: 'accent' };
  return { score, label: 'Strong', color: 'primary' };
}

export function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return 'File size exceeds 100MB limit';
  if (file.size === 0) return 'File is empty';
  return null;
}
