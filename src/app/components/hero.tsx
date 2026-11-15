import { ArrowDownRight, Check, Clock3, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";

const PROMISES = ["No app", "No signup", "Pay at the table"];

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-table.jpg"
          alt="A warmly lit table set with plates, glasses, and candles at VRS"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_58%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_10%,rgba(207,74,32,0.18),transparent_60%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[84svh] w-full max-w-7xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 sm:pb-14 lg:min-h-[780px] lg:px-8 lg:pb-20">
        <div className="max-w-3xl animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cream backdrop-blur">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-butter opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-butter" />
              </span>
              Open tonight · East LA
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cream/60">
              <Clock3 aria-hidden="true" className="size-3.5" />
              Tue–Sun · 5pm–11pm
            </span>
          </div>

          <h1 className="mt-5 font-display text-[clamp(3.4rem,10vw,7.4rem)] font-semibold leading-[0.88] tracking-[-0.055em] text-cream text-shadow-hero">
            Dinner,
            <br />
            <em className="text-butter">without the wait.</em>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/70 sm:text-lg">
            Seasonal plates, a tray that remembers what you picked, and a check that
            arrives when you&apos;re ready. Scan the code at your table — no app, no
            signup, no flagging anyone down.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <a
              href="#menu"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cream px-6 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
            >
              Explore the menu
              <ArrowDownRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
              />
            </a>
            <a
              href="#table"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-cream/25 bg-cream/10 px-6 text-sm font-bold text-cream backdrop-blur transition-colors hover:bg-cream/10"
            >
              <Sparkles aria-hidden="true" className="size-4" />
              I&apos;m at a table
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-cream/60">
            {PROMISES.map((promise) => (
              <li key={promise} className="inline-flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center rounded-full bg-butter/20 text-butter">
                  <Check aria-hidden="true" className="size-2.5" />
                </span>
                {promise}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-3 border-t border-cream/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="flex items-center gap-2 text-[11px] text-cream/70">
            <MapPin aria-hidden="true" className="size-3.5" />
            1240 Cypress Ave · Los Angeles
          </div>

          <div className="hidden items-center gap-3 rounded-2xl border border-cream/10 bg-cream/10 p-3 backdrop-blur sm:flex">
            <span className="flex size-9 items-center justify-center rounded-full bg-butter text-ink">
              <span className="text-[11px] font-black">12</span>
            </span>
            <span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-cream/70">
                Table 12
              </span>
              <span className="block text-xs font-semibold text-cream">
                3 guests · order accepted
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
