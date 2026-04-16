/**
 * Reads service-account.json and writes a correct .env.local
 * Run from: C:\Chapita\site\  =>  node scripts/writeEnv.js
 */
const fs = require('fs');
const path = require('path');

const saPath = path.join(__dirname, '..', 'service-account.json');
const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(saPath)) {
  console.error('ERROR: service-account.json not found at', saPath);
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));

if (!sa.client_email || !sa.private_key) {
  console.error('ERROR: service-account.json is missing client_email or private_key');
  process.exit(1);
}

// Collapse real newlines into \n escape sequence (for .env.local one-liner)
const keyOneLine = sa.private_key.replace(/\n/g, '\\n');

const envContent = [
  `GOOGLE_SERVICE_ACCOUNT_EMAIL=${sa.client_email}`,
  `GOOGLE_PRIVATE_KEY="${keyOneLine}"`,
  `SHEET_ID=1JfiXFar5l_fUWw1EkpgSNYcssjhYH_VAMvFMsEQWZf4`,
  `NEXT_PUBLIC_RESTAURANT_NAME=Chapita`,
  `NEXT_PUBLIC_RESTAURANT_PHONE=+351 000 000 000`,
  `NEXT_PUBLIC_RESTAURANT_ADDRESS=Rua Exemplo, Lisboa`,
  `NEXT_PUBLIC_RESTAURANT_HOURS=Seg–Dom: 12h–15h e 19h–22h`,
  ''  // trailing newline
].join('\n');

fs.writeFileSync(envPath, envContent, 'utf8');
console.log('Written .env.local OK');
console.log('EMAIL:', sa.client_email);
console.log('KEY starts:', sa.private_key.substring(0, 40));
console.log('KEY ends:', sa.private_key.substring(sa.private_key.length - 40));
