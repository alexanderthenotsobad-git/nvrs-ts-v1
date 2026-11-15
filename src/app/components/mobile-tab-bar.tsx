"use client";

import {
  ChevronRight,
  House,
  ShoppingBag,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";

import { useOrderTray } from "@/context/OrderTrayContext";
import { useUserRole } from "@/context/UserContext";
import { cn, formatCurrency, initials } from "@/lib/utils";

export function MobileTabBar({ onSignIn }: { onSignIn: () => void }) {
  const { user } = useUserRole();
  const {
    getTotalItems,
    getTotalPrice,
    toggleOrderTray,
    isOrderTrayOpen,
  } = useOrderTray();
  const [active, setActive] = useState("home");
  const count = getTotalItems();
  const total = getTotalPrice();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      {count > 0 && !isOrderTrayOpen && (
        <button
          type="button"
          onClick={toggleOrderTray}
          className="mx-4 mb-2 flex h-14 w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-ink px-4 text-cream shadow-lift"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-butter text-[11px] font-black text-ink">
            {count}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-cream/70">
              Your tray
            </span>
            <span className="block text-sm font-semibold">
              {formatCurrency(total)} · view tray
            </span>
          </span>
          <ChevronRight aria-hidden="true" className="size-4 text-cream/70" />
        </button>
      )}

      <nav
        aria-label="Mobile app"
        className="safe-bottom border-t border-line bg-cream/95 px-2 pt-1.5 backdrop-blur-xl"
      >
        <div className="mx-auto grid max-w-md grid-cols-4">
          <a
            href="#top"
            onClick={() => setActive("home")}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-bold uppercase tracking-[0.08em]",
              active === "home" ? "text-tomato-deep" : "text-muted",
            )}
          >
            <House aria-hidden="true" className="size-4" />
            Home
          </a>
          <a
            href="#menu"
            onClick={() => setActive("menu")}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-bold uppercase tracking-[0.08em]",
              active === "menu" ? "text-tomato-deep" : "text-muted",
            )}
          >
            <UtensilsCrossed aria-hidden="true" className="size-4" />
            Menu
          </a>
          <button
            type="button"
            onClick={toggleOrderTray}
            className="relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-bold uppercase tracking-[0.08em] text-muted"
          >
            <span className="relative">
              <ShoppingBag aria-hidden="true" className="size-4" />
              {count > 0 && (
                <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-tomato text-[8px] font-black text-cream">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </span>
            Tray
          </button>
          <button
            type="button"
            onClick={onSignIn}
            className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-bold uppercase tracking-[0.08em] text-muted"
          >
            {user ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-olive-soft text-[7px] font-black text-olive">
                {initials(user.name)}
              </span>
            ) : (
              <UserRound aria-hidden="true" className="size-4" />
            )}
            Account
          </button>
        </div>
      </nav>
    </div>
  );
}
