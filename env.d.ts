// Type declarations for environment variables used in this project.
// Keep in sync with .env.local and Vercel project settings.
declare namespace NodeJS {
  interface ProcessEnv {
    // Google Sheets API — server-side only (never exposed to the browser)
    GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
    GOOGLE_PRIVATE_KEY: string;
    SHEET_ID: string;

    // Public runtime config — inlined at build time by Next.js
    NEXT_PUBLIC_PHONE?: string;
    NEXT_PUBLIC_HOURS?: string;
    NEXT_PUBLIC_MAPS_URL?: string;
    NEXT_PUBLIC_SITE_URL?: string;
  }
}
