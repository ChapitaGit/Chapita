const fs = require('fs');
const { google } = require('googleapis');
const crypto = require('crypto');

try {
  const env = fs.readFileSync('.env.local', 'utf8');
  const reKey = /GOOGLE_PRIVATE_KEY="([^"]+)"/;
  const m = env.match(reKey);
  if (!m) {
    console.log('NO_KEY_IN_ENV');
    process.exit(0);
  }
  const escaped = m[1];
  const key = escaped.replace(/\\n/g, '\n');
  const emailMatch = env.match(/GOOGLE_SERVICE_ACCOUNT_EMAIL=([^\r\n]+)/);
  const email = emailMatch ? emailMatch[1].trim() : null;

  // Try parsing the private key with Node's crypto
  try {
    const keyObj = crypto.createPrivateKey({ key, format: 'pem' });
    console.log('PARSE_OK', 'LINES=' + key.split('\n').length, 'HAS_BEGIN=' + key.includes('BEGIN'));
  } catch (err) {
    console.log('PARSE_ERROR', err.message);
    process.exit(0);
  }

  const auth = new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
  auth.authorize((err, tokens) => {
    if (err) { console.log('AUTH_ERROR', err.message || err); process.exit(0); }
    console.log('AUTH_OK');
    process.exit(0);
  });
} catch (err) {
  console.log('SCRIPT_ERROR', err.message || err);
  process.exit(0);
}
