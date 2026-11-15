"use client";

import { ArrowUpRight, Clock3, MapPin, Users } from "lucide-react";
import Image from "next/image";

import { useToast } from "./toast";

const DETAILS = [
  { icon: Users, value: "48 seats", note: "Dining room + patio" },
  { icon: Clock3, value: "Open late", note: "Kitchen until 10:30" },
  { icon: MapPin, value: "East LA", note: "Street parking after 6" },
];

export function RoomSection() {
  const { push } = useToast();

  return (
    <section id="story" className="scroll-mt-20 py-14 sm:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14 lg:px-8">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line bg-cream-deep shadow-soft sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src="/images/room.jpg"
              alt="The warm dining room at VRS Kitchen & Bar with wooden tables and low light"
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              loading="eager"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 rounded-2xl bg-cream/95 px-4 py-3 shadow-soft">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                The room
              </p>
              <p className="mt-0.5 font-display text-lg font-semibold">Dinner until late</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-tomato-deep">
            The room
          </p>
          <h2 className="mt-2 max-w-xl font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[0.96] tracking-[-0.04em]">
            Built for the long way home.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Low light, warm wood, and a kitchen you can hear. We built VRS for the kind
            of dinner that starts with one plate and ends three hours later — not the
            kind you rush through on the way somewhere else.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Order from your phone when you&apos;re ready. Or don&apos;t. A server is
            always a glance away, and the table is yours until close.
          </p>

          <dl className="mt-7 grid gap-2 sm:grid-cols-3">
            {DETAILS.map((detail) => (
              <div
                key={detail.value}
                className="rounded-2xl border border-line bg-cream-deep/50 px-4 py-3"
              >
                <detail.icon aria-hidden="true" className="size-4 text-tomato-deep" />
                <dt className="mt-2 text-sm font-bold">{detail.value}</dt>
                <dd className="mt-0.5 text-[11px] leading-relaxed text-muted">
                  {detail.note}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                push({
                  title: "Table request noted",
                  description:
                    "This is a demo — no reservation was actually made. Call (213) 555-0148 for the real thing.",
                })
              }
              className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-cream transition-transform hover:-translate-y-0.5"
            >
              Book a table
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </button>
            <a
              href="https://maps.google.com/?q=1240+Cypress+Ave+Los+Angeles+CA"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-5 text-sm font-bold text-ink transition-colors hover:bg-cream-deep"
            >
              Get directions
            </a>
          </div>

          <p className="mt-5 text-xs text-muted">
            1240 Cypress Ave, Los Angeles, CA · Tue–Sun, 5pm–11pm
          </p>
        </div>
      </div>
    </section>
  );
}
