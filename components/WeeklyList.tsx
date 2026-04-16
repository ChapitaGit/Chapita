"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { DailyMenu } from "@/lib/googleSheets";

interface WeeklyListProps {
  menus: DailyMenu[];
  currentDay: number;
}

const SHORT_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Fixed day order: Tue → Sun (Mon is closed)
const FIXED_DAYS = [2, 3, 4, 5, 6, 0]; // Ter Qua Qui Sex Sáb Dom

export default function WeeklyList({ menus, currentDay }: WeeklyListProps) {
  const byDay = new Map(menus.map((m) => [m.day, m]));

  // Default to today if it has data, else first available day in fixed order
  const [selectedDay, setSelectedDay] = useState(() => {
    if (byDay.has(currentDay)) return currentDay;
    return FIXED_DAYS.find((d) => byDay.has(d)) ?? FIXED_DAYS[0];
  });
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const currentIndex = FIXED_DAYS.indexOf(selectedDay);
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;

  // Separate "displayed" day so we can fade out → swap → fade in
  const [displayedDay, setDisplayedDay] = useState(selectedDay);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setDisplayedDay(selectedDay);
      setVisible(true);
    }, 120);
    return () => clearTimeout(t);
  }, [selectedDay]);

  const activeMenu = byDay.get(displayedDay) ?? null;

  const navigateTo = useCallback(
    (index: number) => {
      // Skip over days with no data when swiping
      const clamped = Math.max(0, Math.min(FIXED_DAYS.length - 1, index));
      setSelectedDay(FIXED_DAYS[clamped]);
    },
    []
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    // Only trigger if horizontal swipe is dominant (not a vertical scroll)
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      navigateTo(safeIndex + (dx > 0 ? 1 : -1));
    }
  };

  return (
    <section
      id="weekly-specials"
      className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-5 pb-6 animate-fade-in"
    >
      {/* Section heading */}
      <h2 className="text-xl sm:text-2xl font-bold text-cream tracking-wide mb-4 uppercase">
        Ementa Semanal
      </h2>

      {/* Day tabs — fixed Tue→Sun, full width */}
      <div
        role="tablist"
        className="flex gap-1.5 mb-5"
      >
        {FIXED_DAYS.map((day, i) => {
          const isActive = day === selectedDay;
          const isToday = day === currentDay;
          const hasData = byDay.has(day);

          return (
            <button
              key={day}
              role="tab"
              aria-selected={isActive}
              disabled={!hasData}
              onClick={() => hasData && setSelectedDay(day)}
              className={`
                flex-1 flex flex-col items-center
                py-2.5 rounded-xl
                transition-all duration-200 focus:outline-none
                ${
                  !hasData
                    ? "bg-pit-light border border-border text-muted/30 cursor-default"
                    : isActive
                      ? "bg-fire text-cream font-bold shadow-lg shadow-fire/30 scale-105"
                      : isToday
                        ? "bg-fire/15 text-fire border border-fire/30 font-semibold hover:bg-fire/25"
                        : "bg-pit-light border border-border text-muted hover:border-wood hover:text-cream-dim"
                }
              `}
            >
              <span className="text-[11px] uppercase tracking-wider leading-none">
                {isToday && hasData ? "Hoje" : SHORT_LABELS[day]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Swipeable content area — no key so React updates in-place (no scroll jump) */}
      {activeMenu && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            touchAction: "pan-y",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.15s ease-out",
          }}
        >
          {/* Day label row */}
          <div className="flex items-center gap-2 mb-3">
            <h3
              className={`text-base font-bold uppercase tracking-wider ${
                activeMenu.day === currentDay ? "text-fire" : "text-cream"
              }`}
            >
              {activeMenu.dayLabel}
            </h3>
            {activeMenu.day === currentDay && (
              <span className="text-[9px] uppercase font-extrabold tracking-widest bg-fire text-cream px-2 py-0.5 rounded-full">
                Hoje
              </span>
            )}
          </div>

          {/* Swipe hint on mobile */}
          <p className="text-[10px] text-muted/60 mb-3 sm:hidden text-center tracking-wide">
            ← deslize para mudar de dia →
          </p>

          {/* Divider */}
          <div className="h-px bg-border mb-3" />

          {/* Meal cards */}
          {activeMenu.meals.length > 0 ? (
            <div className="flex flex-col gap-2.5 stagger-children">
              {activeMenu.meals.map((meal, i) => (
                <article
                  key={`${activeMenu.day}-${i}`}
                  className={`
                    rounded-xl border p-4 transition-all duration-200
                    ${
                      meal.available
                        ? activeMenu.day === currentDay
                          ? "bg-pit-light border-fire/25 hover:border-fire/50"
                          : "bg-pit-light border-border hover:border-wood/60"
                        : "bg-pit-light/50 border-border opacity-40"
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-cream leading-snug">
                        {meal.mealName}
                      </h4>
                      {meal.description && (
                        <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                          {meal.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                      <span
                        className={`text-base font-bold ${
                          meal.available ? "text-flame" : "text-muted"
                        }`}
                      >
                        {meal.price}
                      </span>
                      {!meal.available && (
                        <span className="text-[9px] uppercase font-extrabold bg-ember/70 text-cream px-2 py-0.5 rounded-full">
                          Esgotado
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm text-center py-10">
              Sem ementa para este dia.
            </p>
          )}

          {/* Swipe progress dots */}
          <div className="flex justify-center gap-1.5 mt-5">
            {FIXED_DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => navigateTo(i)}
                aria-label={SHORT_LABELS[day]}
                className={`rounded-full transition-all duration-300 ${
                  i === safeIndex
                    ? "w-5 h-1.5 bg-fire"
                    : "w-1.5 h-1.5 bg-border hover:bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
