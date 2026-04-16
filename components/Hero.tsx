import Image from "next/image";
import type { DailyMenu } from "@/lib/googleSheets";

interface HeroProps {
  todaysMenu: DailyMenu | null;
}

export default function Hero({ todaysMenu }: HeroProps) {
  // Pick the first available meal as the highlight, fallback to first meal
  const highlightMeal = todaysMenu?.meals.find((m) => m.available) ?? todaysMenu?.meals[0] ?? null;
  const availableCount = todaysMenu?.meals.filter((m) => m.available).length ?? 0;

  return (
    <section id="hero" className="relative w-full min-h-[70vh] flex items-end overflow-hidden">
      {/* Background image */}
      <Image
        src="/hero-grill.png"
        alt="Frango assado na brasa"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/70 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full px-5 pb-8 pt-20 sm:px-8 sm:pb-12 max-w-2xl mx-auto animate-fade-in">
        {/* Logo / Brand */}
        <div className="mb-4">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-warm-light bg-charcoal-lighter/60 px-3 py-1 rounded-full backdrop-blur-sm">
            🔥 Churrasqueira
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white mb-2">
          Chapita
        </h1>

        {/* Today's highlight */}
        {todaysMenu && highlightMeal && (
          <div className="animate-slide-up rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-warm">
                📌 Hoje — {todaysMenu.dayLabel}
              </span>
              <span className="text-[10px] text-cream/50 bg-white/5 px-2 py-0.5 rounded-full">
                {availableCount} {availableCount === 1 ? "prato" : "pratos"} disponíveis
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {highlightMeal.mealName}
            </p>
            <p className="text-sm text-cream/70 mt-1">
              {highlightMeal.description}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-lg font-bold text-warm">
                {highlightMeal.price}
              </p>
              {todaysMenu.meals.length > 1 && (
                <span className="text-xs text-cream/50">
                  +{todaysMenu.meals.length - 1} mais abaixo ↓
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
