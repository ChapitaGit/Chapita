"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { DailyMenu } from "@/lib/googleSheets";

interface WeeklyListProps {
  menus: DailyMenu[];
  currentDay: number;
}

const SHORT_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const FULL_LABELS  = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

// Fixed day order: Tue → Sun (Mon is closed)
const FIXED_DAYS = [2, 3, 4, 5, 6, 0]; // Ter Qua Qui Sex Sáb Dom

const TODAY_LABEL = "Hoje";

// ── Slide animation phase ────────────────────────────────────────
// "exiting"  — content slides/fades out in the navigation direction
// "entering" — content is teleported to the opposite-side start position (no transition)
// "visible"  — content slides/fades in to the final resting position
type SlidePhase = "visible" | "exiting" | "entering";

export default function WeeklyList({ menus, currentDay }: WeeklyListProps) {
  // Memoised so the Map isn't rebuilt on every state-driven re-render.
  const byDay = useMemo(() => new Map(menus.map((m) => [m.day, m])), [menus]);

  // Default to today if it has data, else first available day in fixed order.
  const [selectedDay, setSelectedDay] = useState(() => {
    if (byDay.has(currentDay)) return currentDay;
    return FIXED_DAYS.find((d) => byDay.has(d)) ?? FIXED_DAYS[0];
  });

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  // Swipe hint shows only after the user's first touch — stays invisible on desktop.
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  const currentIndex = FIXED_DAYS.indexOf(selectedDay);
  const safeIndex    = currentIndex < 0 ? 0 : currentIndex;

  // ── Directional slide state ──────────────────────────────────────
  const [displayedDay, setDisplayedDay] = useState(selectedDay);
  const [slideDir,     setSlideDir]     = useState<"left" | "right">("left");
  const [phase,        setPhase]        = useState<SlidePhase>("visible");
  const timerRefs  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sectionRef  = useRef<HTMLElement>(null);

  // Cleanup all pending animation timers on unmount.
  useEffect(() => () => { timerRefs.current.forEach(clearTimeout); }, []);

  // Drive the 3-phase slide transition whenever the selected day changes.
  useEffect(() => {
    // Cancel any in-flight animation.
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    // Phase 1: slide + fade out (100 ms — snappy).
    setPhase("exiting");

    const t1 = setTimeout(() => {
      // Swap content while invisible.
      setDisplayedDay(selectedDay);
      // Phase 2: jump to the opposite-side start position (no transition).
      setPhase("entering");

      // Phase 3: one browser frame later, slide in (150 ms).
      const t2 = setTimeout(() => setPhase("visible"), 16);
      timerRefs.current.push(t2);

      // Scroll the section heading to the top of the viewport while the
      // slide-in plays — overlapping both motions feels fluid and always
      // ensures the full meal list has maximum vertical space visible.
      const t3 = setTimeout(() => {
        if (!sectionRef.current) return;
        const top = sectionRef.current.getBoundingClientRect().top + window.scrollY - 8;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }, 30); // fires 30 ms into the slide-in
      timerRefs.current.push(t3);
    }, 100);

    timerRefs.current.push(t1);
  }, [selectedDay]);

  // Derive the inline style from the current animation phase.
  const slideStyle = (): React.CSSProperties => {
    const exitX  = slideDir === "left" ? "-18px" : "18px";
    const enterX = slideDir === "left" ?  "18px" : "-18px";
    switch (phase) {
      case "exiting":
        return { opacity: 0, transform: `translateX(${exitX})`,  transition: "opacity 0.10s ease-in,  transform 0.10s ease-in"  };
      case "entering":
        return { opacity: 0, transform: `translateX(${enterX})`, transition: "none" };
      case "visible":
        return { opacity: 1, transform:  "translateX(0)",         transition: "opacity 0.15s ease-out, transform 0.15s ease-out" };
    }
  };

  const activeMenu = byDay.get(displayedDay) ?? null;

  // ── Navigation ───────────────────────────────────────────────────
  const navigateTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(FIXED_DAYS.length - 1, index));
    if (FIXED_DAYS[clamped] === selectedDay) return; // already here
    setSlideDir(clamped > safeIndex ? "left" : "right");
    setSelectedDay(FIXED_DAYS[clamped]);
  }, [safeIndex, selectedDay]);

  // ── Touch handlers ───────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    // Only show the hint once, then auto-hide after 4 s.
    if (!showSwipeHint) {
      setShowSwipeHint(true);
      setTimeout(() => setShowSwipeHint(false), 4000);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    // Only trigger if horizontal swipe is dominant (not a vertical scroll).
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      navigateTo(safeIndex + (dx > 0 ? 1 : -1));
    }
  };

  // ── Empty state: no menu data from Google Sheets ──────────────
  if (menus.length === 0) {
    return (
      <section
        id="weekly-specials"
        className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-5 pb-10 animate-fade-in"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-cream tracking-wide mb-4 uppercase">
          Ementa Semanal
        </h2>
        <div className="rounded-xl border border-border bg-pit-light p-6 text-center">
          <p className="text-base text-cream mb-2">
            A ementa de hoje ainda não está disponível online.
          </p>
          <p className="text-sm text-muted">
            Ligue-nos para saber os pratos do dia! 📞
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="weekly-specials"
      className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-5 pb-6 animate-fade-in"
    >
      {/* Section heading */}
      <h2 className="text-xl sm:text-2xl font-bold text-cream tracking-wide mb-4 uppercase">
        Ementa Semanal
      </h2>

      {/* Day tabs — fixed Tue→Sun, full width */}
      <div role="tablist" className="flex gap-1.5 mb-5">
        {FIXED_DAYS.map((day) => {
          const isActive = day === selectedDay;
          const isToday  = day === currentDay;
          const hasData  = byDay.has(day);

          return (
            <button
              key={day}
              id={`tab-day-${day}`}
              role="tab"
              aria-selected={isActive}
              aria-controls="tabpanel-weekly"
              disabled={!hasData}
              onClick={() => {
                if (!hasData) return;
                navigateTo(FIXED_DAYS.indexOf(day));
              }}
              className={`
                flex-1 flex flex-col items-center
                py-2.5 rounded-xl
                transition-all duration-200 focus:outline-none
                focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-1 focus-visible:ring-offset-pit
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
              <span className="text-xs uppercase tracking-wide leading-none">
                {isToday && hasData ? TODAY_LABEL : SHORT_LABELS[day]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Swipeable content area — no `key` so React updates in-place (no scroll jump) */}
      {activeMenu && (
        <div
          id="tabpanel-weekly"
          role="tabpanel"
          aria-labelledby={`tab-day-${displayedDay}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y", ...slideStyle() }}
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
                {TODAY_LABEL}
              </span>
            )}
          </div>

          {/* Swipe hint on mobile — shown after first touch, auto-hides after 4 s */}
          <p
            className="text-[10px] text-muted/60 mb-3 sm:hidden text-center tracking-wide transition-opacity duration-500"
            style={{ opacity: showSwipeHint ? 1 : 0, pointerEvents: "none" }}
          >
            ← deslize para mudar de dia →
          </p>

          {/* Divider */}
          <div className="h-px bg-border mb-3" />

          {/* Meal cards */}
          {activeMenu.meals.length > 0 ? (
            <div className="flex flex-col gap-2.5 stagger-children">
              {activeMenu.meals.map((meal) => (
                <article
                  key={`${activeMenu.day}-${meal.mealName}`}
                  className={`
                    rounded-xl border p-4 transition-all duration-200
                    ${
                      meal.available
                        ? activeMenu.day === currentDay
                          ? "bg-pit-light border-fire/25 hover:border-fire/50"
                          : "bg-pit-light border-border hover:border-wood/60"
                        : "bg-pit-light/50 border-border"
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
                        <span className="text-[10px] uppercase font-extrabold bg-ember text-cream px-2 py-0.5 rounded-full">
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
                aria-label={FULL_LABELS[day]}
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
