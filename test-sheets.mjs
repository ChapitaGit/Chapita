import * as dotenv from 'dotenv';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env.local')));

async function run() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: envConfig.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: envConfig.GOOGLE_PRIVATE_KEY.replace(/^"|"$/g, "").replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const client = await auth.getClient();
  const token = (await client.getAccessToken()).token;

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${envConfig.SHEET_ID}/values/A2:E`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  
  console.log("Raw Column A (Days):");
  console.log(data.values?.map(r => r[0]));
}

run();
