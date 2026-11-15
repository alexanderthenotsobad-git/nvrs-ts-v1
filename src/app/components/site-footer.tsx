"use client";

import { ArrowUpRight, Clock3, MapPin, Phone } from "lucide-react";
import { useState } from "react";

import { useToast } from "./toast";
import { VRSLogo } from "./vrs-logo";

export function SiteFooter({ onSignIn }: { onSignIn: () => void }) {
  const { push } = useToast();
  const [email, setEmail] = useState("");

  function join(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    push({
      title: "You're on the list",
      description: "Demo only — no email was stored. We'll save you a seat.",
    });
    setEmail("");
  }

  return (
    <footer className="relative overflow-hidden bg-ink pb-24 pt-14 text-cream md:pb-8 sm:pt-16">
      <div
        aria-hidden="true"
        className="absolute -right-24 top-0 size-96 rounded-full border border-cream/10"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-cream/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <VRSLogo inverted />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
              Seasonal food, live table service, and the check exactly when you want it.
              A neighbourhood room in East Los Angeles.
            </p>
            <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.18em] text-cream/70">
              Powered by Virtual Restaurant Solutions
            </p>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-butter">
              Explore
            </p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {[
                ["Menu", "#menu"],
                ["At the table", "#table"],
                ["The room", "#story"],
                ["Ask the menu", "#guide"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="text-cream/60 transition-colors hover:text-cream">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-butter">
              Visit
            </p>
            <ul className="mt-3 space-y-2.5 text-sm text-cream/60">
              <li className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-butter" />
                1240 Cypress Ave
                <br />
                Los Angeles, CA
              </li>
              <li className="flex items-start gap-2">
                <Clock3 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-butter" />
                Tue–Sun · 5pm–11pm
              </li>
              <li className="flex items-start gap-2">
                <Phone aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-butter" />
                (213) 555-0148
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-butter">
              The list
            </p>
            <p className="mt-3 text-sm leading-relaxed text-cream/70">
              A short note when the menu changes. No noise.
            </p>
            <form onSubmit={join} className="mt-3 flex items-center gap-1 rounded-full border border-cream/20 bg-cream/5 p-1">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                required
                className="h-9 min-w-0 flex-1 bg-transparent px-3 text-sm text-cream placeholder:text-cream/70 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Join the list"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-butter text-ink"
              >
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </button>
            </form>
            <button
              type="button"
              onClick={onSignIn}
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cream/70 hover:text-cream"
            >
              Sign in or create an account
              <ArrowUpRight aria-hidden="true" className="size-3" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-5 text-[10px] text-cream/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VRS Kitchen &amp; Bar. All rights reserved.</p>
          <p>
            Demo experience · Photos via Unsplash and the VRS library · No real payments
          </p>
        </div>
      </div>
    </footer>
  );
}
