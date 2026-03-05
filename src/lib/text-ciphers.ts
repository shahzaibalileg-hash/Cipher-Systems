// Shift Cipher (Caesar)
export function shiftEncrypt(text: string, key: number): string {
  return text.split('').map(ch => {
    if (/[a-z]/.test(ch)) return String.fromCharCode(((ch.charCodeAt(0) - 97 + key) % 26 + 26) % 26 + 97);
    if (/[A-Z]/.test(ch)) return String.fromCharCode(((ch.charCodeAt(0) - 65 + key) % 26 + 26) % 26 + 65);
    return ch;
  }).join('');
}

export function shiftDecrypt(text: string, key: number): string {
  return shiftEncrypt(text, -key);
}

// Affine Cipher
function modInverse(a: number, m: number): number {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  throw new Error(`No modular inverse for a=${a}, m=${m}. 'a' must be coprime with 26.`);
}

export function affineEncrypt(text: string, a: number, b: number): string {
  modInverse(a, 26); // validate
  return text.split('').map(ch => {
    if (/[a-z]/.test(ch)) return String.fromCharCode(((a * (ch.charCodeAt(0) - 97) + b) % 26) + 97);
    if (/[A-Z]/.test(ch)) return String.fromCharCode(((a * (ch.charCodeAt(0) - 65) + b) % 26) + 65);
    return ch;
  }).join('');
}

export function affineDecrypt(text: string, a: number, b: number): string {
  const aInv = modInverse(a, 26);
  return text.split('').map(ch => {
    if (/[a-z]/.test(ch)) return String.fromCharCode((((aInv * ((ch.charCodeAt(0) - 97) - b)) % 26) + 26) % 26 + 97);
    if (/[A-Z]/.test(ch)) return String.fromCharCode((((aInv * ((ch.charCodeAt(0) - 65) - b)) % 26) + 26) % 26 + 65);
    return ch;
  }).join('');
}

// Vigenère Cipher
export function vigenereEncrypt(text: string, key: string): string {
  if (!key) throw new Error('Key cannot be empty');
  const k = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!k) throw new Error('Key must contain letters');
  let ki = 0;
  return text.split('').map(ch => {
    if (/[a-zA-Z]/.test(ch)) {
      const base = ch === ch.toUpperCase() ? 65 : 97;
      const shift = k.charCodeAt(ki % k.length) - 97;
      ki++;
      return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26) + base);
    }
    return ch;
  }).join('');
}

export function vigenereDecrypt(text: string, key: string): string {
  if (!key) throw new Error('Key cannot be empty');
  const k = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!k) throw new Error('Key must contain letters');
  let ki = 0;
  return text.split('').map(ch => {
    if (/[a-zA-Z]/.test(ch)) {
      const base = ch === ch.toUpperCase() ? 65 : 97;
      const shift = k.charCodeAt(ki % k.length) - 97;
      ki++;
      return String.fromCharCode(((ch.charCodeAt(0) - base - shift + 26) % 26) + base);
    }
    return ch;
  }).join('');
}

// Hill Cipher (2x2 matrix)
function matMod(mat: number[][], mod: number): number[][] {
  return mat.map(row => row.map(v => ((v % mod) + mod) % mod));
}

function det2x2(m: number[][]): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

function invertMatrix2x2(m: number[][]): number[][] {
  const det = ((det2x2(m) % 26) + 26) % 26;
  const detInv = modInverse(det, 26);
  return matMod([
    [m[1][1] * detInv, -m[0][1] * detInv],
    [-m[1][0] * detInv, m[0][0] * detInv],
  ], 26);
}

export function hillEncrypt(text: string, keyStr: string): string {
  const nums = keyStr.split(',').map(n => parseInt(n.trim()));
  if (nums.length !== 4 || nums.some(isNaN)) throw new Error('Hill key must be 4 comma-separated numbers (2x2 matrix)');
  const key = [[nums[0], nums[1]], [nums[2], nums[3]]];
  
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const padded = clean.length % 2 === 0 ? clean : clean + 'X';
  
  let result = '';
  for (let i = 0; i < padded.length; i += 2) {
    const v = [padded.charCodeAt(i) - 65, padded.charCodeAt(i + 1) - 65];
    const e0 = (key[0][0] * v[0] + key[0][1] * v[1]) % 26;
    const e1 = (key[1][0] * v[0] + key[1][1] * v[1]) % 26;
    result += String.fromCharCode(e0 + 65) + String.fromCharCode(e1 + 65);
  }
  return result;
}

export function hillDecrypt(text: string, keyStr: string): string {
  const nums = keyStr.split(',').map(n => parseInt(n.trim()));
  if (nums.length !== 4 || nums.some(isNaN)) throw new Error('Hill key must be 4 comma-separated numbers (2x2 matrix)');
  const key = [[nums[0], nums[1]], [nums[2], nums[3]]];
  const inv = invertMatrix2x2(key);
  
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  
  let result = '';
  for (let i = 0; i < clean.length; i += 2) {
    const v = [clean.charCodeAt(i) - 65, clean.charCodeAt(i + 1) - 65];
    const d0 = ((inv[0][0] * v[0] + inv[0][1] * v[1]) % 26 + 26) % 26;
    const d1 = ((inv[1][0] * v[0] + inv[1][1] * v[1]) % 26 + 26) % 26;
    result += String.fromCharCode(d0 + 65) + String.fromCharCode(d1 + 65);
  }
  return result;
}
