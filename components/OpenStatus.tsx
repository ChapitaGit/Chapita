"use client";

import { useState, useEffect } from "react";

/* ── Schedule constants — keep in sync with WeeklyList.tsx ── */
const LUNCH_OPEN   = 12 * 60; // 12:00
const LUNCH_CLOSE  = 15 * 60; // 15:00
const DINNER_OPEN  = 19 * 60; // 19:00
const DINNER_CLOSE = 22 * 60; // 22:00
const CLOSED_DAYS  = new Set([1]); // Monday

const DAY_PT: Record<number, string> = {
  0: "Domingo", 2: "Terça", 3: "Quarta",
  4: "Quinta",  5: "Sexta", 6: "Sábado",
};

function getLisbonNow() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Lisbon" })
  );
}

function nextOpenDay(fromDay: number): number {
  let d = (fromDay + 1) % 7;
  while (CLOSED_DAYS.has(d)) d = (d + 1) % 7;
  return d;
}

function computeStatus(): { open: boolean; label: string } {
  const now     = getLisbonNow();
  const day     = now.getDay();
  const timeNum = now.getHours() * 60 + now.getMinutes();

  if (CLOSED_DAYS.has(day)) {
    const next = nextOpenDay(day);
    return { open: false, label: `Fechado · abrimos ${DAY_PT[next] ?? "amanhã"} às 12h00` };
  }

  if (timeNum >= LUNCH_OPEN  && timeNum < LUNCH_CLOSE)  return { open: true,  label: "Aberto agora · fecha às 15h00" };
  if (timeNum >= DINNER_OPEN && timeNum < DINNER_CLOSE) return { open: true,  label: "Aberto agora · fecha às 22h00" };
  if (timeNum  < LUNCH_OPEN)                            return { open: false, label: "Fechado · abrimos às 12h00" };
  if (timeNum >= LUNCH_CLOSE && timeNum < DINNER_OPEN)  return { open: false, label: "Fechado · abrimos às 19h00" };

  // After dinner — find next open day
  const next = nextOpenDay(day);
  return { open: false, label: `Fechado · abrimos ${DAY_PT[next] ?? "amanhã"} às 12h00` };
}

export default function OpenStatus() {
  // Lazy-init runs on both server and client using Lisbon time — avoids flash.
  const [status, setStatus] = useState(computeStatus);

  useEffect(() => {
    // Refresh every minute to keep status up to date.
    const id = setInterval(() => setStatus(computeStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      suppressHydrationWarning
      className={`
        inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1
        transition-colors duration-500
        ${status.open
          ? "text-green-400 border-green-500/30 bg-green-500/10"
          : "text-muted border-border"
        }
      `}
    >
      <span
        className={`
          w-1.5 h-1.5 rounded-full inline-block shrink-0
          ${status.open ? "bg-green-400 animate-pulse" : "bg-muted"}
        `}
      />
      <span suppressHydrationWarning>{status.label}</span>
    </span>
  );
}
