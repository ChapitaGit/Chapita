import { GoogleAuth } from "google-auth-library";

/* ── Types ─────────────────────────────────────────────────────── */
export type Meal = {
  mealName: string;
  description: string;
  price: string;
  available: boolean;
};

export type DailyMenu = {
  day: number; // 0 = Sunday … 6 = Saturday
  dayLabel: string;
  meals: Meal[];
};

/** Flat row from sheet — used internally */
type SheetRow = {
  day: number;
  dayLabel: string;
  mealName: string;
  description: string;
  price: string;
  available: boolean;
};

const DAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

/** Group flat rows into DailyMenu objects */
function groupByDay(rows: SheetRow[]): DailyMenu[] {
  const map = new Map<number, DailyMenu>();

  for (const row of rows) {
    let menu = map.get(row.day);
    if (!menu) {
      menu = { day: row.day, dayLabel: row.dayLabel, meals: [] };
      map.set(row.day, menu);
    }
    menu.meals.push({
      mealName: row.mealName,
      description: row.description,
      price: row.price,
      available: row.available,
    });
  }

  return Array.from(map.values()).sort((a, b) => a.day - b.day);
}

/* ── Fetch from Google Sheets via REST (no googleapis SDK) ─────── */
async function fetchFromSheets(): Promise<DailyMenu[]> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.SHEET_ID;

  if (!email || !rawKey || !sheetId) {
    console.warn(
      "[googleSheets] Missing credentials — returning empty menu. " +
      "Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and SHEET_ID in .env.local."
    );
    return [];
  }

  // google-auth-library handles JWT signing — much lighter than full googleapis
  const auth = new GoogleAuth({
    credentials: {
      client_email: email,
      private_key: rawKey.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;

  if (!token) {
    console.error("[googleSheets] Failed to obtain access token.");
    return [];
  }

  // Direct REST call to Sheets API — no SDK overhead
  const range = encodeURIComponent("A2:E");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 }, // Cache at fetch level too
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[googleSheets] Sheets API error ${response.status}: ${body}`);
    return [];
  }

  const data = await response.json();
  const rows: string[][] | undefined = data.values;

  if (!rows || rows.length === 0) {
    console.warn("[googleSheets] Sheet returned 0 rows.");
    return [];
  }

  console.log(`[googleSheets] Fetched ${rows.length} rows from Google Sheets.`);

  const sheetRows: SheetRow[] = rows
    .filter((row) => row.length > 0 && row[0] !== undefined && row[0] !== "")
    .map((row) => {
      const dayNum = parseInt(row[0], 10);
      return {
        day: isNaN(dayNum) ? 0 : dayNum,
        dayLabel: DAY_LABELS[dayNum] ?? `Dia ${dayNum}`,
        mealName: row[1] ?? "Prato do Dia",
        description: row[2] ?? "",
        price: row[3] ?? "—",
        available: (row[4] ?? "TRUE").toString().toUpperCase() === "TRUE",
      };
    });

  return groupByDay(sheetRows);
}

/* ── Public API ────────────────────────────────────────────────── */
export async function getDailySpecials(): Promise<DailyMenu[]> {
  try {
    return await fetchFromSheets();
  } catch (error) {
    console.error("[googleSheets] Error fetching from Google Sheets:", error);
    return [];
  }
}
