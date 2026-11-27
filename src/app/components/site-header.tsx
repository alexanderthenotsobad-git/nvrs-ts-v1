"use client";

import { ChevronDown, LogOut, Menu, ShoppingBag, UserRound, X, Sparkles, MessageSquare } from "lucide-react";
import { useState } from "react";

import { useOrderTray } from "@/context/OrderTrayContext";
import { useUserRole } from "@/context/UserContext";
import { initials } from "@/lib/utils";
import { VRSLogo } from "./vrs-logo";

const NAV = [
  { href: "#menu", label: "Menu" },
  { href: "#table", label: "At the table" },
];

export function SiteHeader({ onSignIn, onOpenAI }: { onSignIn: () => void; onOpenAI: () => void }) {
  const { user, signOut } = useUserRole();
  const { getTotalItems, toggleOrderTray, isOrderTrayOpen } = useOrderTray();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const count = getTotalItems();

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <VRSLogo />

        <nav aria-label="Primary" className="ml-5 hidden items-center gap-1 md:flex">
          {NAV.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-cream-deep hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                className="flex h-10 items-center gap-2 rounded-full border border-line bg-cream px-2.5 pr-3 text-sm font-semibold transition-colors hover:border-ink/20"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-olive-soft text-[10px] font-bold text-olive">
                  {initials(user.name)}
                </span>
                {user.name.split(" ")[0]}
                <ChevronDown aria-hidden="true" className="size-3.5 text-muted" />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-2xl border border-line bg-cream p-3 shadow-lift">
                  <p className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Signed in as
                  </p>
                  <p className="mt-1 px-2 text-sm font-semibold">{user.name}</p>
                  <p className="px-2 text-xs capitalize text-muted">{user.role}</p>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setAccountOpen(false);
                    }}
                    className="mt-3 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-medium text-tomato-deep transition-colors hover:bg-tomato-soft"
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="hidden h-10 items-center gap-2 rounded-full px-3.5 text-sm font-semibold text-ink transition-colors hover:bg-cream-deep sm:flex"
            >
              <UserRound aria-hidden="true" className="size-4" />
              Sign in
            </button>
          )}

          {/* AI Trigger - Header variant (desktop) */}
          <button
            type="button"
            onClick={onOpenAI}
            aria-label="Consult the menu expert"
            className="hidden h-10 items-center gap-2 rounded-full bg-olive px-4 text-sm font-semibold text-cream shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-olive/90 sm:flex"
          >
            <Sparkles aria-hidden="true" className="size-4" />
            <span>Menu expert</span>
          </button>

          <button
            type="button"
            onClick={toggleOrderTray}
            aria-label={`Open your tray${count ? `, ${count} items` : ""}`}
            aria-expanded={isOrderTrayOpen}
            className="relative flex h-10 items-center gap-2 rounded-full bg-ink px-3.5 text-sm font-semibold text-cream shadow-soft transition-transform hover:-translate-y-0.5 sm:h-11 sm:px-4"
          >
            <ShoppingBag aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Tray</span>
            {count > 0 && (
              <span className="flex min-w-5 items-center justify-center rounded-full bg-butter px-1.5 py-0.5 text-[10px] font-bold text-ink tabular-nums">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            className="flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream-deep md:hidden"
          >
            {mobileOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-cream px-4 pb-5 pt-3 shadow-lift md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            <a
              href="#menu"
              onClick={closeMobile}
              className="flex items-center justify-between border-b border-line/70 py-3.5 font-display text-2xl font-medium tracking-[-0.02em]"
            >
              Menu
              <span aria-hidden="true" className="text-muted">↗</span>
            </a>
            {/* Menu expert right below Menu */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); closeMobile(); onOpenAI(); }}
              className="flex items-center justify-between border-b border-line/70 py-3.5 font-display text-2xl font-medium tracking-[-0.02em]"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="size-5 text-butter" />
                Menu expert
              </span>
              <Sparkles className="size-5 text-butter" />
            </a>
            <a
              href="#table"
              onClick={closeMobile}
              className="flex items-center justify-between border-b border-line/70 py-3.5 font-display text-2xl font-medium tracking-[-0.02em]"
            >
              At the table
              <span aria-hidden="true" className="text-muted">↗</span>
            </a>
          </nav>

          {user ? (
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-cream-deep px-4 py-3">
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-olive-soft text-[10px] font-bold text-olive">
                  {initials(user.name)}
                </span>
                <span className="text-sm font-semibold">{user.name}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  closeMobile();
                }}
                className="text-xs font-semibold text-tomato-deep"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                closeMobile();
                onSignIn();
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-cream"
            >
              <UserRound aria-hidden="true" className="size-4" />
              Sign in or continue as guest
            </button>
          )}
        </div>
      )}
    </header>
  );
}
