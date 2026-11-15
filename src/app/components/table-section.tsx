"use client";

import { BellRing, Check, QrCode, Receipt, Users } from "lucide-react";
import { useState } from "react";

import { useUserRole } from "@/context/UserContext";
import { useToast } from "./toast";

const TIMELINE = ["Placed", "Preparing", "Ready"];

export function TableSection({ onSignIn }: { onSignIn: () => void }) {
  const { user } = useUserRole();
  const { push } = useToast();
  const [request, setRequest] = useState<"server" | "bill" | null>(null);

  function notify(kind: "server" | "bill") {
    setRequest(kind);
    push({
      title: kind === "server" ? "A server is on the way" : "Check requested",
      description: "This is a demo — no one is actually being paged.",
    });
    window.setTimeout(() => setRequest(null), 5000);
  }

  return (
    <section id="table" className="scroll-mt-20 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-5 py-7 text-cream shadow-lift sm:px-9 sm:py-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-12 lg:py-12">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 size-80 rounded-full border border-cream/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-20 size-80 rounded-full bg-tomato/20 blur-3xl"
          />

          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-butter">
              At the table
            </p>
            <h2 className="mt-3 max-w-lg font-display text-[clamp(2.3rem,5.4vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Your table is already open.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/70 sm:text-base">
              Scan the card at the table and the room comes to you: the menu, your
              tray, the kitchen&apos;s progress, and the check. No app, no account,
              no waiting for eye contact.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/10 bg-cream/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]">
                <Users aria-hidden="true" className="size-3.5 text-butter" />
                3 guests at Table 12
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/10 bg-cream/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]">
                <span className="size-1.5 rounded-full bg-[#8fbf91]" />
                Live session
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => notify("server")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-5 text-sm font-bold text-cream transition-colors hover:bg-cream/10"
              >
                <BellRing aria-hidden="true" className="size-4" />
                {request === "server" ? "Server notified" : "Call server"}
              </button>
              <button
                type="button"
                onClick={() => notify("bill")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-butter px-5 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
              >
                <Receipt aria-hidden="true" className="size-4" />
                {request === "bill" ? "Check requested" : "Request the check"}
              </button>
            </div>

            {!user && (
              <button
                type="button"
                onClick={onSignIn}
                className="mt-4 text-xs font-semibold text-cream/70 underline underline-offset-4 hover:text-cream"
              >
                Sign in to save this table — or keep going as a guest
              </button>
            )}
          </div>

          <div className="relative mt-8 lg:mt-0">
            <div className="rounded-[1.6rem] border border-cream/10 bg-cream/5 p-4 backdrop-blur sm:p-5">
              <div className="flex items-start justify-between gap-3 border-b border-cream/10 pb-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cream/70">
                    VRS Kitchen &amp; Bar
                  </p>
                  <p className="mt-1 font-display text-3xl font-semibold tracking-[-0.03em]">
                    Table 12
                  </p>
                  <p className="mt-1 text-[11px] text-cream/70">
                    Open 32 min · Maya, Jon, Priya
                  </p>
                </div>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-cream/10">
                  <QrCode aria-hidden="true" className="size-6 text-butter" />
                </span>
              </div>

              <div className="py-4">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cream/70">
                    Ticket #14
                  </p>
                  <span className="rounded-full bg-butter/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-butter">
                    Preparing
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li className="flex justify-between gap-3">
                    <span>2× Cacio e pepe</span>
                    <span className="text-cream/60">$44</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span>1× Margherita</span>
                    <span className="text-cream/60">$19</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span>2× Blood orange spritz</span>
                    <span className="text-cream/60">$26</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-1 border-t border-cream/10 pt-4">
                {TIMELINE.map((step, index) => (
                  <div key={step} className="flex flex-1 items-center gap-1.5">
                    <span
                      className={
                        index <= 1
                          ? "flex size-5 items-center justify-center rounded-full bg-[#8fbf91] text-ink"
                          : "flex size-5 items-center justify-center rounded-full border border-cream/20 text-cream/70"
                      }
                    >
                      {index <= 1 ? (
                        <Check aria-hidden="true" className="size-2.5" />
                      ) : (
                        <span className="size-1 rounded-full bg-current" />
                      )}
                    </span>
                    <span
                      className={
                        index <= 1
                          ? "text-[9px] font-bold uppercase tracking-[0.08em] text-cream/80"
                          : "text-[9px] font-bold uppercase tracking-[0.08em] text-cream/70"
                      }
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-cream/5 px-3 py-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-cream/70">
                  Table tab
                </span>
                <span className="font-display text-xl font-semibold">$96.79</span>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] text-cream/70">
              A live demo of the guest session. Ordering is mocked.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
