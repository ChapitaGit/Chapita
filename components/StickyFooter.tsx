export default function StickyFooter() {
  const phone = process.env.NEXT_PUBLIC_PHONE;
  const mapsUrl =
    process.env.NEXT_PUBLIC_MAPS_URL ??
    "https://maps.google.com/?q=Churrasqueira+Chapita";
  const hours = process.env.NEXT_PUBLIC_HOURS ?? "";

  if (!phone) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[StickyFooter] NEXT_PUBLIC_PHONE is not set. " +
        "Add it to .env.local (e.g. NEXT_PUBLIC_PHONE=+351XXXXXXXXX)."
      );
    }
  }

  const tel = phone ?? "#";

  return (
    <footer
      id="sticky-footer"
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-pit/95 backdrop-blur-lg border-t border-border
        px-4 pt-2 pb-3 sm:px-6
        safe-bottom
      "
    >
      <div className="max-w-lg mx-auto">
        {/* Opening hours — small line above buttons */}
        {hours && (
          <p className="text-[10px] text-muted text-center mb-2 tracking-wide uppercase">
            🕐 {hours}
          </p>
        )}

        <div className="flex gap-2.5">
          {/* Maps button */}
          <a
            id="btn-maps"
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Como Chegar — abrir Google Maps"
            className="
              flex items-center justify-center gap-1.5
              rounded-xl bg-pit-lighter border border-border
              hover:border-wood hover:bg-pit-light
              text-cream-dim hover:text-cream
              font-semibold text-sm
              h-11 px-4 transition-all duration-200
              active:scale-95 shrink-0
            "
          >
            <svg
              className="w-4 h-4 text-fire shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z"
              />
              <circle cx="12" cy="8" r="2.5" fill="currentColor" stroke="none" className="text-fire" />
            </svg>
            Mapa
          </a>

          {/* Call button */}
          <a
            id="btn-call"
            href={tel.startsWith("+") ? `tel:${tel}` : tel}
            aria-label="Ligar para a churrasqueira"
            className="
              flex-[2] flex items-center justify-center gap-2
              rounded-xl bg-fire hover:bg-fire-light
              text-cream font-bold text-sm
              h-11 transition-all duration-200
              active:scale-95 animate-pulse-glow [animation-iteration-count:5]
            "
          >
            <svg
              className="w-4.5 h-4.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Ligar
          </a>
        </div>
      </div>
    </footer>
  );
}
