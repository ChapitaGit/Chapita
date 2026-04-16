import { google } from "googleapis";

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

/* ── Mock data (used when Google credentials are not configured) ─ */
const MOCK_ROWS: SheetRow[] = [
  // Domingo
  { day: 0, dayLabel: "Domingo",       mealName: "Leitão Assado",           description: "Leitão crocante com batata assada e salada mista",                price: "12.50€", available: true },
  { day: 0, dayLabel: "Domingo",       mealName: "Arroz de Pato",           description: "Arroz de pato no forno com chouriço e azeitonas",                 price: "10.00€", available: true },
  // Segunda
  { day: 1, dayLabel: "Segunda-feira", mealName: "Frango Assado",           description: "Meio frango assado na brasa com arroz e batata frita",            price: "7.50€",  available: true },
  { day: 1, dayLabel: "Segunda-feira", mealName: "Febras Grelhadas",        description: "Febras de porco grelhadas com arroz e salada",                     price: "8.00€",  available: true },
  { day: 1, dayLabel: "Segunda-feira", mealName: "Sopa do Dia",             description: "Caldo verde com chouriço",                                        price: "3.00€",  available: true },
  // Terça
  { day: 2, dayLabel: "Terça-feira",   mealName: "Costela de Porco",        description: "Costela grelhada com molho barbecue e legumes",                    price: "9.00€",  available: true },
  { day: 2, dayLabel: "Terça-feira",   mealName: "Bitoque",                 description: "Bife com ovo a cavalo, arroz e batata frita",                      price: "8.50€",  available: true },
  // Quarta
  { day: 3, dayLabel: "Quarta-feira",  mealName: "Bacalhau à Brás",         description: "Bacalhau desfiado com batata palha e ovo",                         price: "10.00€", available: true },
  { day: 3, dayLabel: "Quarta-feira",  mealName: "Carne de Porco à Alentejana", description: "Porco com amêijoas, batata frita e coentros",                 price: "11.00€", available: true },
  // Quinta
  { day: 4, dayLabel: "Quinta-feira",  mealName: "Cozido à Portuguesa",     description: "Carnes variadas com legumes e enchidos",                           price: "11.00€", available: false },
  { day: 4, dayLabel: "Quinta-feira",  mealName: "Frango Assado",           description: "Meio frango assado na brasa com arroz e batata frita",             price: "7.50€",  available: true },
  // Sexta
  { day: 5, dayLabel: "Sexta-feira",   mealName: "Peixe Grelhado",          description: "Dourada grelhada com batata cozida e legumes",                     price: "9.50€",  available: true },
  { day: 5, dayLabel: "Sexta-feira",   mealName: "Bacalhau com Natas",      description: "Bacalhau desfiado gratinado com natas e batata",                   price: "10.50€", available: true },
  { day: 5, dayLabel: "Sexta-feira",   mealName: "Salada de Polvo",         description: "Polvo cozido com cebola, pimentão e azeite",                       price: "11.00€", available: true },
  // Sábado
  { day: 6, dayLabel: "Sábado",        mealName: "Picanha na Brasa",        description: "Picanha fatiada com arroz, feijão e farofa",                       price: "13.00€", available: true },
  { day: 6, dayLabel: "Sábado",        mealName: "Espetada Mista",          description: "Espetada de carne e legumes grelhados na brasa",                   price: "10.50€", available: true },
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

  // Return sorted by day (0–6)
  return Array.from(map.values()).sort((a, b) => a.day - b.day);
}

/* ── Fetch from Google Sheets ──────────────────────────────────── */
async function fetchFromSheets(): Promise<DailyMenu[]> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.SHEET_ID;

  if (!email || !key || !sheetId) {
    return groupByDay(MOCK_ROWS);
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // Each row: Day (number 0-6), Meal_Name, Description, Price, Available
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "A2:E50", // Support up to ~50 rows (multiple meals per day)
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return groupByDay(MOCK_ROWS);
  }

  const sheetRows: SheetRow[] = rows.map((row) => {
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
    console.error("Error fetching from Google Sheets, using mock data:", error);
    return groupByDay(MOCK_ROWS);
  }
}
