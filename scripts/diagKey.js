const fs = require('fs');
const crypto = require('crypto');

// Read .env.local
const env = fs.readFileSync('.env.local', 'utf8');

// Extract private key value
const lines = env.split('\n');
let rawKey = '';
let email = '';
let sheetId = '';

for (const line of lines) {
  if (line.startsWith('GOOGLE_PRIVATE_KEY=')) {
    // Remove surrounding quotes if present
    rawKey = line.substring('GOOGLE_PRIVATE_KEY='.length).trim();
    if (rawKey.startsWith('"')) rawKey = rawKey.slice(1);
    if (rawKey.endsWith('"')) rawKey = rawKey.slice(0, -1);
  }
  if (line.startsWith('GOOGLE_SERVICE_ACCOUNT_EMAIL=')) {
    email = line.substring('GOOGLE_SERVICE_ACCOUNT_EMAIL='.length).trim();
  }
  if (line.startsWith('SHEET_ID=')) {
    sheetId = line.substring('SHEET_ID='.length).trim();
  }
}

console.log('EMAIL:', email || '(empty)');
console.log('SHEET_ID:', sheetId || '(empty)');
console.log('RAW KEY LENGTH:', rawKey.length);
console.log('STARTS WITH:', rawKey.substring(0, 40));
console.log('ENDS WITH:', rawKey.substring(rawKey.length - 40));

// Restore actual newlines
const restored = rawKey.replace(/\\n/g, '\n');
console.log('RESTORED LINES:', restored.split('\n').length);
console.log('PEM HEADER OK:', restored.includes('-----BEGIN PRIVATE KEY-----'));
console.log('PEM FOOTER OK:', restored.includes('-----END PRIVATE KEY-----'));

// Try parsing with crypto
try {
  crypto.createPrivateKey(restored);
  console.log('CRYPTO PARSE: OK');
} catch (e) {
  console.log('CRYPTO PARSE ERROR:', e.message);
}
