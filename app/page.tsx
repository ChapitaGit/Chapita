import Image from "next/image";
import { getDailySpecials } from "@/lib/googleSheets";
import WeeklyList from "@/components/WeeklyList";
import StickyFooter from "@/components/StickyFooter";
import OpenStatus from "@/components/OpenStatus";

// Revalidate every 5 minutes so Sheet updates (e.g. marking a dish as Esgotado) appear quickly.
export const revalidate = 300;

export default async function Home() {
  const menus = await getDailySpecials();
  // Use Lisbon time so the "today" highlight is correct regardless of where
  // the server (Vercel edge / Node) is running.
  const currentDay = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Lisbon" })
  ).getDay();

  return (
    <>
      {/* ── Hero — bleeds seamlessly into page background ─────── */}
      <header className="relative w-full h-[68vw] min-h-[300px] max-h-[560px] flex items-center justify-center overflow-hidden bg-pit">
        <Image
          src="/hero-grill.webp"
          alt="Frango assado na brasa"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Top vignette — darkens corners, keeps logo legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-pit/70 via-pit/10 to-transparent" />
        {/* Bottom dissolve — image fully melts into #0f0f0d with no hard edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-pit via-pit/80 to-transparent" />

        {/* ── Ember particles — purely decorative ─────────────── */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <span className="ember" style={{ "--ember-dur": "3.2s", "--ember-delay": "0.0s", "--ember-drift": "14px", width: "4px", height: "4px", left: "15%", bottom: "8%" } as React.CSSProperties} />
          <span className="ember" style={{ "--ember-dur": "2.7s", "--ember-delay": "0.8s", "--ember-drift": "-20px", width: "3px", height: "3px", left: "28%", bottom: "5%" } as React.CSSProperties} />
          <span className="ember" style={{ "--ember-dur": "3.9s", "--ember-delay": "1.4s", "--ember-drift": "18px", width: "5px", height: "5px", left: "42%", bottom: "12%" } as React.CSSProperties} />
          <span className="ember" style={{ "--ember-dur": "2.5s", "--ember-delay": "0.3s", "--ember-drift": "-12px", width: "3px", height: "3px", left: "55%", bottom: "7%" } as React.CSSProperties} />
          <span className="ember" style={{ "--ember-dur": "4.2s", "--ember-delay": "2.1s", "--ember-drift": "22px", width: "4px", height: "4px", left: "65%", bottom: "15%" } as React.CSSProperties} />
          <span className="ember" style={{ "--ember-dur": "3.0s", "--ember-delay": "1.0s", "--ember-drift": "-16px", width: "2px", height: "2px", left: "72%", bottom: "9%" } as React.CSSProperties} />
          <span className="ember" style={{ "--ember-dur": "3.6s", "--ember-delay": "2.8s", "--ember-drift": "10px", width: "3px", height: "3px", left: "82%", bottom: "6%" } as React.CSSProperties} />
          <span className="ember" style={{ "--ember-dur": "2.9s", "--ember-delay": "1.7s", "--ember-drift": "-24px", width: "4px", height: "4px", left: "48%", bottom: "18%" } as React.CSSProperties} />
          <span className="ember" style={{ "--ember-dur": "3.4s", "--ember-delay": "0.5s", "--ember-drift": "8px", width: "2px", height: "2px", left: "91%", bottom: "11%" } as React.CSSProperties} />
        </div>

        {/* ── Logo with spinning fire ring ─────────────────────── */}
        <div className="relative z-10 flex flex-col items-center px-6 animate-fade-in">
          <div className="logo-ring">
            <Image
              src="/Chapita-logo.jpg"
              alt="Churrasqueira Chapita"
              width={220}
              height={220}
              quality={85}
              className="w-[140px] sm:w-[180px] md:w-[220px] rounded-full block"
              priority
            />
          </div>
        </div>
      </header>

      {/* ── Tagline + live status ─────────────────────────────────── */}
      <div className="flex flex-col items-center gap-1.5 px-4 pt-5 pb-2 animate-fade-in text-center">
        <p className="text-cream text-base sm:text-lg font-semibold tracking-wide">
          O melhor frango assado na brasa — desde sempre.
        </p>
        <OpenStatus />
      </div>

      {/* ── Weekly menu ─────────────────────────────────────────── */}
      <WeeklyList menus={menus} currentDay={currentDay} />

      {/* ── Signature Dish: Frango Assado ─────────────────────── */}
      <section className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-2 pb-6 animate-fade-in relative z-10">
        <div className="rounded-xl bg-gradient-to-br from-pit-lighter border border-fire/20 to-pit p-5 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🍗</span>
              <h2 className="text-lg font-bold text-cream">Frango Assado na Brasa</h2>
            </div>
            <p className="text-sm text-cream-dim leading-relaxed mb-3">
              A nossa especialidade! Assado lentamente na brasa, com o tempero tradicional Chapita. Sempre fresco e suculento.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted uppercase tracking-wider font-semibold bg-pit-light px-2 py-0.5 rounded-full border border-border">Disponível todos os dias</span>
            </div>

            {/* Note about other grilled items */}
            <div className="mt-4 pt-3 border-t border-border/50">
              <p className="text-xs text-cream-dim leading-relaxed flex items-start gap-1.5">
                <svg className="w-4 h-4 text-fire shrink-0 mt-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Também servimos outros grelhados (mediante disponibilidade). <span className="text-cream">Ligue-nos para saber o que temos hoje na grelha!</span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Location & Info ─────────────────────────────────────── */}
      <section className="w-full max-w-lg mx-auto px-4 sm:px-6 py-6 animate-fade-in border-t border-border/50">
        <h2 className="text-lg font-bold text-cream tracking-wide mb-4 uppercase text-center">Onde Estamos</h2>

        <div className="bg-pit-light rounded-xl border border-border overflow-hidden">
          <div className="p-5 flex flex-col gap-3 items-center text-center">
            <svg className="w-6 h-6 text-fire" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <div>
              <p className="text-cream font-semibold">Churrasqueira do Chapita</p>
              <p className="text-muted text-sm mt-1">Rua dos Lavradores, 23<br />2450-335 Valado dos Frades</p>
            </div>

            <div className="w-full h-px bg-border my-2"></div>

            <div className="flex flex-col gap-1 text-sm text-cream-dim">
              <p><span className="text-muted">Almoço:</span> 12h00 – 15h00</p>
              <p><span className="text-muted">Jantar:</span> 19h00 – 22h00</p>
              <p className="text-fire/80 text-xs mt-1 uppercase tracking-wide">Encerrado à Segunda-feira</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof / Google Reviews ──────────────────────── */}
      <section className="w-full max-w-lg mx-auto px-4 sm:px-6 py-6 animate-fade-in text-center pb-12">
        <div className="inline-flex flex-col items-center gap-2">
          <div className="flex gap-1 text-yellow-500">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          </div>
          <p className="text-sm text-cream font-medium">Obrigado pela preferência!</p>
          <a
            href="https://maps.google.com/?q=Churrasqueira+Chapita"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted hover:text-fire transition-colors underline underline-offset-2 mt-1"
          >
            Deixe a sua avaliação no Google
          </a>
        </div>
      </section>

      <div className="h-24" />
      <StickyFooter />
    </>
  );
}
