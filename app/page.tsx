import Image from "next/image";
import { getDailySpecials } from "@/lib/googleSheets";
import WeeklyList from "@/components/WeeklyList";
import StickyFooter from "@/components/StickyFooter";

export const revalidate = 60;

export default async function Home() {
  const menus = await getDailySpecials();
  const currentDay = new Date().getDay();
  const hours = process.env.NEXT_PUBLIC_HOURS ?? "Seg–Dom: 12h–15h · 19h–22h";

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <header className="relative w-full h-[52vw] min-h-[220px] max-h-[420px] flex items-center justify-center overflow-hidden bg-pit">
        <Image
          src="/hero-grill.png"
          alt="Frango assado na brasa"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pit/80 via-pit/30 to-pit/90" />
        <div className="relative z-10 flex flex-col items-center px-6 animate-fade-in">
          <Image
            src="/Chapita-logo.jpg"
            alt="Churrasqueira Chapita"
            width={220}
            height={220}
            className="w-[140px] sm:w-[180px] md:w-[220px] rounded-full shadow-2xl shadow-pit/80 border-2 border-border"
            priority
          />
        </div>
      </header>

      {/* ── Tagline + hours ──────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-1.5 px-4 pt-5 pb-2 animate-fade-in text-center">
        <p className="text-cream text-base sm:text-lg font-semibold tracking-wide">
          O melhor frango assado na brasa — desde sempre.
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted border border-border rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-fire inline-block" />
          {hours}
        </span>
      </div>

      {/* ── Weekly menu ─────────────────────────────────────────── */}
      <WeeklyList menus={menus} currentDay={currentDay} />

      <div className="h-24" />
      <StickyFooter />
    </>
  );
}
